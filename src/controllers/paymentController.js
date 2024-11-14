// const axios = require('axios');

// const crypto = require('crypto');
// const Transaction = require('../models/transaction');
// const dotenv = require('dotenv');

// dotenv.config();

// // const partnerCode = process.env.MOMO_PARTNER_CODE;

// const accessKey = process.env.MOMO_ACCESS_KEY;
// const secretKey = process.env.MOMO_SECRET_KEY;
// const partnerCode = process.env.MOMO_PARTNER_CODE;
// const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
// const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';

// exports.createPayment = async (req, res) => {

//     const { amount } = req.body;
//     const orderId = partnerCode + new Date().getTime();
//     const requestId = orderId;
//     const orderInfo = 'pay with MoMo';
//     const requestType = 'captureWallet';
//     const extraData = '';

//     const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
//     const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

//     const requestBody = {
//         partnerCode,
//         requestId,
//         amount,
//         orderId,
//         orderInfo,
//         redirectUrl,
//         ipnUrl,
//         requestType,
//         extraData,
//         signature
//     };

//     try {
//         const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
//             headers: { 'Content-Type': 'application/json' }
//         });

//         const paymentUrl = response.data.payUrl;

//         // Save transaction to database
//         const transaction = new Transaction({ orderId, amount, paymentUrl, status: 'PENDING' });
//         await transaction.save();

//         res.status(200).json({ success: true, paymentUrl, message: "Payment initiated successfully." });
//     } catch (error) {
//         console.error('Error creating payment:', error);
//         res.status(500).json({ success: false, message: "Failed to initiate payment." });
//     }
// };
// controllers/paymentController.js
const momoService = require('../services/momoService');

exports.createPayment = async (req, res) => {
    const { reservationId, amount, orderInfo } = req.body;

    // Kiểm tra xem reservationId có được truyền vào không
    if (!reservationId) {
        return res.status(400).json({ success: false, message: "reservationId is required to create orderId" });
    }

    try {
        // Gọi service để tạo yêu cầu thanh toán từ MoMo
        const paymentData = await momoService.createMoMoPayment(reservationId, amount, orderInfo);

        // Kiểm tra phản hồi từ MoMo
        if (paymentData.resultCode === 0) {
            res.status(200).json({
                success: true,
                payUrl: paymentData.payUrl,
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentData.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Hàm xử lý IPN từ MoMo
exports.handleMoMoIPN = async (req, res) => {
    const { orderId, resultCode, signature } = req.body;

    // Kiểm tra chữ ký của MoMo để xác nhận tính hợp lệ
    const validSignature = momoService.createSignature(req.body);
    if (signature !== validSignature) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (resultCode === 0) {
        // Thực hiện các hành động cần thiết khi thanh toán thành công
        // Ví dụ: cập nhật trạng thái đơn hàng
        res.status(200).json({ success: true, message: "Payment success" });
    } else {
        res.status(400).json({ success: false, message: "Payment failed" });
    }
};
