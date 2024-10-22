const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route đăng ký người dùng
router.post('/register', authController.register);

// Route đăng nhập người dùng
router.post('/login', authController.login);



module.exports = router;
