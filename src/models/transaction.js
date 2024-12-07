const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        default: 'Zalopay',
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['paid', 'failed', 'refunded'],
        default: 'paid',
    },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema, 'Transaction');
module.exports = Transaction;
