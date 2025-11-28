const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const reservationRoutes = require('./routes/reservation.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.RESERVATION_SERVICE_PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'reservation-service' });
});

// Routes
app.use('/api/reservations', reservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});

app.listen(PORT, () => {
    console.log(`Reservation Service running on port ${PORT}`);
});

module.exports = app;
