// Main Express application configuration
const express = require('express');
const logsRoutes = require('./routes/logs');
const { logger, logToMongo } = require('./logger/pino');

const app = express();

// Middleware
app.use(express.json());

// Logging middleware - logs every HTTP request
app.use((req, res, next) => {
    res.on('finish', () => {
        const level = res.statusCode >= 400 ? 'error' : 'info';
        const msg = `${req.method} ${req.originalUrl} - ${res.statusCode}`;
        logToMongo(level, msg, req, res);
    });
    next();
});

// Routes
app.use('/api', logsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        id: 'NOT_FOUND',
        message: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        id: 'SERVER_ERROR',
        message: err.message || 'Internal server error'
    });
});

module.exports = app;