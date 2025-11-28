const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const vehicleRoutes = require('./routes/vehicle.routes');
const categoryRoutes = require('./routes/category.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.FLEET_SERVICE_PORT || 3004;

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
    res.json({ status: 'ok', service: 'fleet-service' });
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/categories', categoryRoutes);

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
    console.log(`Fleet Service running on port ${PORT}`);
});

module.exports = app;
