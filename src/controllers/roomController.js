// controllers/roomController.js
const Hotel = require('../models/hotel');
const Room = require('../models/room');

// Thêm phòng mới cho một khách sạn
// exports.addRoom = async (req, res) => {
//     const { roomNumber, capacity, price } = req.body;

//     try {
//         // Kiểm tra quyền truy cập
//         if (!req.user || !['admin', 'hotelOwner'].includes(req.user.role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Not authorized to add a room',
//             });
//         }

//         // Tạo phòng mới
//         const room = new Room({
//             hotel: req.params.hotelId, // ID của khách sạn
//             roomNumber,
//             capacity,
//             price,
//         });

//         // Lưu phòng vào MongoDB
//         await room.save();

//         res.status(201).json({
//             success: true,
//             data: room,
//             message: 'Room added successfully',
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: 'Error adding room',
//             error: error.message,
//         });
//     }
// };

// exports.addRoom = async (req, res) => {
//     const { hotelId } = req.params;

//     try {
//         // Tìm khách sạn theo ID
//         const hotel = await Hotel.findById(hotelId);

//         if (!hotel) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Hotel not found',
//             });
//         }

//         // Kiểm tra xem người dùng có phải là chủ sở hữu của khách sạn không
//         if (hotel.owner.toString() !== req.user.id) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Not authorized to add a room to this hotel',
//             });
//         }

//         // Tạo phòng mới
//         const room = new Room({
//             ...req.body,
//             hotel: hotelId, // Gán ID khách sạn cho phòng
//         });

//         // Lưu phòng vào MongoDB
//         await room.save();

//         res.status(201).json({
//             success: true,
//             data: room,
//             message: 'Room added successfully',
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message: 'Error adding room',
//             error: error.message,
//         });
//     }
// };

exports.addRoom = async (req, res) => {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.body; // Thêm thời điểm bắt đầu và kết thúc của ngày trống từ req.body

    try {
        // Tìm khách sạn theo ID
        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        // Kiểm tra xem người dùng có phải là chủ sở hữu của khách sạn không
        if (hotel.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add a room to this hotel',
            });
        }

        // Tạo danh sách các ngày trống từ startDate đến endDate
        const availableDates = [];
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);

        while (currentDate <= lastDate) {
            availableDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày lên 1
        }

        // Tạo phòng mới
        const room = new Room({
            ...req.body,
            hotel: hotelId,
            availableDates, // Gán danh sách ngày trống
        });

        // Lưu phòng vào MongoDB
        await room.save();

        res.status(201).json({
            success: true,
            data: room,
            message: 'Room added successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding room',
            error: error.message,
        });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;

    try {
        // Tìm phòng theo ID
        const room = await Room.findById(id).populate('hotel');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Tìm khách sạn liên kết với phòng đó
        const hotel = await Hotel.findById(room.hotel._id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        // Kiểm tra xem người dùng có phải là chủ khách sạn không
        if (hotel.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update rooms in this hotel',
            });
        }

        // Cập nhật thông tin phòng
        const updatedRoom = await Room.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({
            success: true,
            data: updatedRoom,
            message: 'Room updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating room',
            error: error.message,
        });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;

        // Tìm phòng theo ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Tìm khách sạn mà phòng này thuộc về
        const hotel = await Hotel.findById(room.hotel);

        // Kiểm tra xem người dùng có phải là chủ sở hữu của khách sạn không
        if (hotel.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this room',
            });
        }

        // Xóa phòng
        await Room.findByIdAndDelete(roomId);

        res.status(200).json({
            success: true,
            message: 'Room deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting room',
            error: error.message,
        });
    }
};