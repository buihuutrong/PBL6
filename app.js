const express = require('express');
const mongoose = require('mongoose');
const hotelRoutes = require('./src/routes/hotelRoutes');
const authRoutes = require('./src/routes/authRoutes');
const roomRoutes = require('./src/routes/roomRoutes')
const reservationRoutes = require('./src/routes/reservationRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { engine } = require('express-handlebars'); // Sử dụng destructuring để lấy engine từ express-handlebars
const path = require('path');

const dotenv = require('dotenv'); // Thêm dòng này để import dotenv

dotenv.config(); // Gọi hàm config() để sử dụng biến môi trường

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server Error',
        error: err.message,
    });
});



app.engine('handlebars', engine()); // Thay đổi ở đây
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views')); // Thư mục chứa template Handlebars

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Sử dụng routes

// Sử dụng routes cho xác thực
app.use('/api/auth', authRoutes);

app.use('/api/hotels', hotelRoutes);

app.use('/api/rooms', roomRoutes);

app.use('/api/reservations', reservationRoutes);

//app.use('/api', paymentRoutes);

app.use('/api/payments', paymentRoutes);

// Định nghĩa route mẫu
app.get('/', (req, res) => {
    res.send('Welcome to the Booking App API');
});
// Đọc các biến môi trường từ file .env


// Middleware để parse JSON
app.use(express.json());

// Export app để sử dụng trong server.js
module.exports = app;
