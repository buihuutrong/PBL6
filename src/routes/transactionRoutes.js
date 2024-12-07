const express = require('express');
const { getAllTransactions, getCustomerTransactions } = require('../controllers/transactionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin xem tất cả giao dịch
router.get('/transactions/admin', protect, authorize('admin'), getAllTransactions);

// Customer xem lịch sử giao dịch của họ
router.get('/transactions', protect, getCustomerTransactions);

module.exports = router;
