const Hotel = require('../models/hotel');
const express = require('express');
const Room = require('../models/room');
const router = express.Router();
// Lấy tất cả khách sạn
exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotels', error });
    }
};

// Thêm một khách sạn mới
exports.createHotel = async (req, res) => {
    try {
        // Kiểm tra xem người dùng có quyền tạo khách sạn không
        if (!req.user || !['admin', 'hotelOwner'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create a hotel',
            });
        }

        // Tạo một đối tượng khách sạn mới từ dữ liệu được gửi qua body
        const hotel = new Hotel({
            ...req.body, // Spread operator để lấy tất cả dữ liệu từ req.body
            owner: req.user.id, // Gán owner từ token
        });

        // Lưu khách sạn vào MongoDB
        await hotel.save();

        // Trả về phản hồi thành công, cùng với dữ liệu của khách sạn vừa thêm
        res.status(201).json({
            success: true,
            data: hotel,
            message: "Hotel created successfully",
        });
    } catch (error) {
        // Xử lý lỗi khi thêm khách sạn và trả về mã lỗi phù hợp
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// exports.create = async (req, res) => {
//     res.render('create-hotel');
// }
// Cập nhật khách sạn theo ID
exports.updateHotel = async (req, res) => {
    const { id } = req.params;

    try {
        // Tìm khách sạn theo ID
        const hotel = await Hotel.findById(id);

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
                message: 'Not authorized to update this hotel',
            });
        }

        // Cập nhật thông tin khách sạn
        const updatedHotel = await Hotel.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({
            success: true,
            data: updatedHotel,
            message: 'Hotel updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating hotel',
            error: error.message,
        });
    }
};

// Xóa một khách sạn theo ID
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Hotel deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting hotel',
            error: error.message,
        });
    }
};
