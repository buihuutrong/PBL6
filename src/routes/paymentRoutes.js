const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST /api/payment
router.post('/payment', paymentController.createPayment);

module.exports = router;