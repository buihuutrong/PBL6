const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route chỉ admin và chủ khách sạn mới được truy cập
router.post('/add-hotel', protect, authorize('admin', 'hotelOwner'), hotelController.createHotel);

//update hotel chỉ chủ hotel mới dc update
router.put('/update/:id', protect, authorize('hotelOwner'), hotelController.updateHotel);

// Route cho tất cả người dùng
router.get('/all', hotelController.getAllHotels);

// Route chỉ admin mới được truy cập
router.delete('/hotel/:id', protect, authorize('admin'), hotelController.deleteHotel);

// Route cập nhật khách sạn
router.put('/hotel/:id', protect, authorize('admin', 'hotelOwner'), hotelController.updateHotel);




// // Route để lấy tất cả khách sạn
// router.get('/all', hotelController.getAllHotels);

// // Routes thêm 1 khách sạn
// router.post('/create', hotelController.createHotel);

// // Route để cập nhật một khách sạn
// router.put('/:id', hotelController.updateHotel); // PUT để cập nhật toàn bộ khách sạn

// // hoặc bạn có thể dùng PATCH nếu chỉ muốn cập nhật một phần
// router.patch('/:id', hotelController.updateHotel);

// // Route để xóa một khách sạn theo ID
// router.delete('/:id', hotelController.deleteHotel);


module.exports = router;
