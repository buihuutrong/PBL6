const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel', // Liên kết với mô hình Hotel
        required: true,
    },
    roomNumber: {
        type: String,
        required: [true, 'Please add a room number'],
    },
    capacity: {
        type: Number,
        required: [true, 'Please add the capacity of the room'],
    },
    price: {
        type: Number,
        required: [true, 'Please add the room price'],
    },
    // Các trường bổ sung khác có thể thêm vào đây
    availableDates: {
        type: [Date], // Mảng các ngày
        required: [true, 'Please add available dates for the room'],
    },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema, 'Room');

module.exports = Room;
