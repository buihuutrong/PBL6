// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/paymentController');

// // POST /api/payment
// router.post('/payment', paymentController.createPayment);

// module.exports = router;
// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Định tuyến cho yêu cầu thanh toán MoMo
router.post('/create-payment', paymentController.createPayment);

// Định tuyến cho IPN từ MoMo
router.post('/momo-ipn', paymentController.handleMoMoIPN);

module.exports = router;
