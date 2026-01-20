// Pino logger configuration and helper functions
// Handles both console logging and MongoDB persistence
const pino = require('pino');
const Log = require('../models/log');

// Create Pino logger instance - simple JSON output to console
const logger = pino({
    level: 'info'
});

// Save log entry to MongoDB
// This function logs to console AND saves to database
async function logToMongo(level, msg, req, res) {
    try {
        // Log to console using Pino
        logger[level](msg);

        // Save to MongoDB
        await Log.create({
            service: 'logs-service',
            level: level,
            time: new Date(),
            msg: msg,
            method: req ? req.method : null,
            url: req ? req.originalUrl : null,
            statusCode: res ? res.statusCode : null
        });
    } catch (err) {
        // If MongoDB save fails, at least log the error
        logger.error(`Failed to save log to MongoDB: ${err.message}`);
    }
}

module.exports = { logger, logToMongo };