const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const Reservation = require('../models/reservation'); // Model đặt phòng
const Order = require('../models/order'); // Model order bạn đã tạo

// APP INFO
const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

// Tạo đơn hàng và gọi API thanh toán Zalopay
exports.createOrder = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Người dùng không được xác thực' });
    }
    const { reservationId, amount } = req.body; // Nhận ID đặt phòng và số tiền từ client

    try {
        // Lấy thông tin đặt phòng
        const reservation = await Reservation.findById(reservationId).populate('room');
        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // Tạo thông tin đơn hàng
        const transID = Math.floor(Math.random() * 1000000);
        const embed_data = { reservationId }; // Gắn ID đặt phòng vào embed_data để xử lý callback
        const items = [
            {
                room_name: reservation.room.name, // Lấy tên phòng
                checkIn: reservation.checkInDate,
                checkOut: reservation.checkOutDate,
                amount: amount, // Số tiền cho phòng
            },
        ];

        const order = {
            app_id: config.app_id,
            app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // Mã giao dịch duy nhất
            app_user: req.user.id, // ID người dùng
            app_time: Date.now(), // Thời gian tạo đơn hàng
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount, // Tổng số tiền thanh toán
            description: `Payment for reservation #${reservationId}`,
            bank_code: "", // Sử dụng Zalopay app để thanh toán
            callback_url: "https://5ab3-2405-4802-b554-6c00-98d-eebc-beb4-74c9.ngrok-free.app/api/orders/callback",
        };

        // Tạo mã xác thực
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        // Gọi API Zalopay
        const response = await axios.post(config.endpoint, null, { params: order });

        if (response.data.return_code === 1) {
            // Lưu đơn hàng vào database
            const newOrder = await Order.create({
                reservation: reservationId,
                user: req.user.id,
                transId: order.app_trans_id,
                amount,
                status: 'pending', // Trạng thái chờ thanh toán
                paymentUrl: response.data.order_url, // URL thanh toán trả về từ Zalopay
            });

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                paymentUrl: response.data.order_url, // Đường dẫn để khách thanh toán
                orderId: newOrder._id,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: response.data.return_message || 'Failed to create Zalopay order',
            });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
// Xử lý callback từ Zalopay
exports.handleZaloPayCallback = async (req, res) => {
    let result = {};

    try {
        const dataStr = req.body.data;
        const reqMac = req.body.mac;

        // Tính toán mac
        const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

        console.log('dataStr:', dataStr);
        console.log('reqMac:', reqMac);
        console.log('calculatedMac:', mac);

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            // Parse dữ liệu JSON từ callback
            const dataJson = JSON.parse(dataStr);

            // Lấy thông tin giao dịch
            const appTransId = dataJson["app_trans_id"];
            const order = await Order.findOne({ transId: appTransId });

            if (!order) {
                throw new Error(`Order with transId ${appTransId} not found`);
            }

            // Cập nhật trạng thái của Order
            order.status = 'paid';
            await order.save();

            // Cập nhật trạng thái của Reservation
            const reservation = await Reservation.findById(order.reservation);
            if (!reservation) {
                throw new Error(`Reservation with id ${order.reservation} not found`);
            }
            reservation.status = 'completed';
            await reservation.save();

            console.log(`Order ${order._id} marked as paid`);
            console.log(`Reservation ${reservation._id} marked as completed`);

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (err) {
        console.error("Error processing callback:", err.message);
        result.return_code = 0; // Zalopay sẽ callback lại
        result.return_message = err.message;
    }

    // Trả kết quả về Zalopay
    res.json(result);
};
