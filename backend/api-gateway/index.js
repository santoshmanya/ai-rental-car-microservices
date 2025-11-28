const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { authenticate, authorize } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});

// Service URLs
const services = {
    auth: `http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`,
    reservation: `http://localhost:${process.env.RESERVATION_SERVICE_PORT || 3002}`,
    payment: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 3003}`,
    fleet: `http://localhost:${process.env.FLEET_SERVICE_PORT || 3004}`,
    reporting: `http://localhost:${process.env.REPORTING_SERVICE_PORT || 3005}`,
};

// Facade pattern: Unified API for all microservices

// Auth service routes (public) - NO body parsing before proxy
app.use('/api/auth', createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
}));

// Fleet service routes (public for viewing, protected for modifications)
app.use('/api/vehicles', createProxyMiddleware({
    target: services.fleet,
    changeOrigin: true,
}));

app.use('/api/categories', createProxyMiddleware({
    target: services.fleet,
    changeOrigin: true,
}));

// Reservation service routes (protected)
app.use('/api/reservations', createProxyMiddleware({
    target: services.reservation,
    changeOrigin: true,
}));

// Payment service routes (protected)
app.use('/api/payments', createProxyMiddleware({
    target: services.payment,
    changeOrigin: true,
}));

// Reporting service routes (admin only)
app.use('/api/reports', createProxyMiddleware({
    target: services.reporting,
    changeOrigin: true,
}));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Proxying to services:');
    Object.entries(services).forEach(([name, url]) => {
        console.log(`  - ${name}: ${url}`);
    });
});

module.exports = app;
