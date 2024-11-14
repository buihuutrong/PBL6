// services/momoService.js
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const redirectUrl = "https://momo.vn/return";
const ipnUrl = "https://callback.url/notify";

// Hàm tạo chữ ký
function createSignature(params) {
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    return crypto.createHmac('sha256', secretKey).update(sortedParams).digest('hex');
}

// Hàm tạo yêu cầu thanh toán tới MoMo
async function createMoMoPayment(reservationId, amount, orderInfo) {
    if (!reservationId) {
        throw new Error("reservationId is required to create orderId");
    }

    const requestId = `${reservationId}_${Date.now()}`; // Đảm bảo uniqueness cho mỗi giao dịch
    const orderId = `${reservationId}_${Date.now()}`; // Tạo orderId dựa trên reservationId và timestamp
    const requestType = "captureWallet";

    const rawData = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData: "",
    };

    // Tạo chữ ký cho yêu cầu
    rawData.signature = createSignature(rawData);

    try {
        const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", rawData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        throw new Error(`MoMo Payment Error: ${error.message}`);
    }
}

module.exports = { createMoMoPayment };
