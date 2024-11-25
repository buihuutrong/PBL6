const Review = require('../models/review');
const Room = require('../models/room');

exports.addReview = async (req, res) => {
    try {
        const { roomId, rating, comment } = req.body;
        const files = req.files;

        // Kiểm tra phòng
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Lấy URL của file
        const images = files
            .filter(file => file.mimetype.startsWith('image'))
            .map(file => `/uploads/reviews/${file.filename}`);
        const videos = files
            .filter(file => file.mimetype.startsWith('video'))
            .map(file => `/uploads/reviews/${file.filename}`);


        // Gộp images và videos
        const media = [...images, ...videos];

        // Tạo review mới
        const review = await Review.create({
            room: roomId,
            user: req.user.id, // Lấy ID người dùng từ middleware auth
            rating,
            comment,
            media,
        });



        res.status(201).json({ success: true, review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }


};
