const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const reportRoutes = require('./routes/report.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.REPORTING_SERVICE_PORT || 3005;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'reporting-service' });
});

app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

app.listen(PORT, () => {
    console.log(`Reporting Service running on port ${PORT}`);
});

module.exports = app;
