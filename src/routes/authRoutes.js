const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route đăng ký người dùng
router.post('/register', authController.register);

// Route đăng nhập người dùng
router.post('/login', authController.login);

router.get('/users', protect, authorize('admin'), authController.getUserList);



module.exports = router;
