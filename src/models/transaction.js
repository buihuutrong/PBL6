// const mongoose = require('mongoose');

// const transactionSchema = new mongoose.Schema({
//     orderId: { type: String, required: true },
//     amount: { type: Number, required: true },
//     status: { type: String, required: true, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
//     paymentUrl: { type: String },
//     createdAt: { type: Date, default: Date.now }
// });
// const Transaction = mongoose.model('Transaction', transactionSchema, 'Transaction');
// module.exports = Transaction;