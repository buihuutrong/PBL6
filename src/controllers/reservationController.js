const Reservation = require('../models/reservation');
const Room = require('../models/room');

// API đặt phòng
exports.bookRoom = async (req, res) => {
    const { roomId } = req.params;
    const { checkInDate, checkOutDate } = req.body;

    try {
        // Tìm phòng theo ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Chuyển đổi ngày để so sánh
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);

        // Kiểm tra xem toàn bộ khoảng thời gian có trống không
        const requestedDates = [];
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            requestedDates.push(date.toISOString().split('T')[0]); // Định dạng YYYY-MM-DD
        }

        // Chuyển đổi availableDates trong room về định dạng YYYY-MM-DD để so sánh
        const availableDatesFormatted = room.availableDates.map(date => {
            return new Date(date).toISOString().split('T')[0]; // Định dạng lại ngày từ ISO thành YYYY-MM-DD
        });

        // Kiểm tra xem các ngày yêu cầu có nằm trong danh sách availableDates không
        const isAvailable = requestedDates.every(date => availableDatesFormatted.includes(date));

        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Room is not available during this period.',
            });
        }

        // Tạo đặt phòng mới
        const reservation = await Reservation.create({
            room: roomId,
            user: req.user.id,
            checkInDate,
            checkOutDate,
        });

        // Cập nhật danh sách ngày trống của phòng (loại bỏ những ngày đã đặt)
        room.availableDates = room.availableDates.filter(date => {
            return date < startDate || date > endDate;
        });

        await room.save();

        res.status(201).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

//kiểm tra phòng còn trống
exports.checkAvailability = async (req, res) => {
    const { roomId } = req.params;
    const { checkInDate, checkOutDate } = req.body;

    try {
        // Tìm phòng theo ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Chuyển đổi ngày để so sánh
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);

        // Tạo mảng các ngày yêu cầu
        const requestedDates = [];
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            requestedDates.push(date.toISOString().split('T')[0]); // Định dạng YYYY-MM-DD
        }

        // Chuyển đổi availableDates trong room về định dạng YYYY-MM-DD
        const availableDatesFormatted = room.availableDates.map(date => {
            return new Date(date).toISOString().split('T')[0]; // Định dạng lại ngày từ ISO thành YYYY-MM-DD
        });

        // Kiểm tra xem các ngày yêu cầu có nằm trong danh sách availableDates không
        const isAvailable = requestedDates.every(date => availableDatesFormatted.includes(date));

        if (isAvailable) {
            return res.status(200).json({
                success: true,
                message: 'Room is available during this period.',
            });
        } else {
            return res.status(200).json({
                success: false,
                message: 'Room is not available during this period.',
            });
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


//hủy phòng
exports.cancelBooking = async (req, res) => {
    const { reservationId } = req.params;

    try {
        // Tìm đặt phòng
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // Xác thực người dùng (chỉ người tạo hoặc admin mới có quyền)
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this reservation' });
        }

        console.log(req.user);
        // Hủy đặt phòng
        reservation.status = 'cancelled';
        await reservation.save();

        // Cập nhật ngày trống của phòng
        const room = await Room.findById(reservation.room);
        let checkInDate = new Date(reservation.checkInDate);
        let checkOutDate = new Date(reservation.checkOutDate);

        while (checkInDate <= checkOutDate) {
            // Chỉ thêm nếu ngày đó chưa có trong danh sách availableDates
            if (!room.availableDates.some(date => date.getTime() === checkInDate.getTime())) {
                room.availableDates.push(new Date(checkInDate));
            }
            checkInDate.setDate(checkInDate.getDate() + 1);
        }

        // Lưu cập nhật phòng
        await room.save();

        res.status(200).json({
            success: true,
            message: 'Reservation cancelled',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
