const axios = require('axios');
const crypto = require('crypto');
const Transaction = require('../models/transaction');
const dotenv = require('dotenv');

dotenv.config();

// const partnerCode = process.env.MOMO_PARTNER_CODE;

const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const partnerCode = process.env.MOMO_PARTNER_CODE;
const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';

exports.createPayment = async (req, res) => {

    const { amount } = req.body;
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const orderInfo = 'pay with MoMo';
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const requestBody = {
        partnerCode,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        signature
    };

    try {
        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        const paymentUrl = response.data.payUrl;

        // Save transaction to database
        const transaction = new Transaction({ orderId, amount, paymentUrl, status: 'PENDING' });
        await transaction.save();

        res.status(200).json({ success: true, paymentUrl, message: "Payment initiated successfully." });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ success: false, message: "Failed to initiate payment." });
    }
};