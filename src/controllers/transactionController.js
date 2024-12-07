const Transaction = require('../models/transaction');
const Reservation = require('../models/reservation'); // Model đặt phòng
const Order = require('../models/order'); // Model order bạn đã tạo

exports.getAllTransactions = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Permission denied' });
        }

        const transactions = await Transaction.find({ status: 'paid' }).populate('userId');
        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getCustomerTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id, status: 'paid' });
        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        console.error('Error fetching customer transactions:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

