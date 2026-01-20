// Routes for logs endpoints
const express = require('express');
const router = express.Router();
const Log = require('../models/log');
const { logger } = require('../logger/pino');

// GET /api/logs - get all logs (REQUIRED by project)
router.get('/', async (req, res) => {
    try {
        logger.info('Accessing GET /api/logs endpoint');

        // Fetch all logs sorted by time (newest first)
        const logs = await Log.find({}).sort({ time: -1 });

        res.json(logs);
    } catch (err) {
        logger.error(`Error fetching logs: ${err.message}`);
        res.status(500).json({
            id: 'LOG_FETCH_ERROR',
            message: 'Unable to get logs'
        });
    }
});

// POST /api/logs/add - add log entry from other services
router.post('/add', async (req, res) => {
    try {
        logger.info('Accessing POST /api/logs/add endpoint');

        const { level, msg, method, url, statusCode, service, time } = req.body;

        // Validation - level and msg are required
        if (!level || !msg) {
            logger.error('Missing required fields: level and msg');
            return res.status(400).json({
                id: 'VALIDATION_ERROR',
                message: 'Level and msg are required'
            });
        }

        // Create new log entry with descriptive message
        const newLog = new Log({
            service: service || 'unknown',
            level: level,
            time: time ? new Date(time) : new Date(),
            msg: `Add new log - ${msg}`, // ✅ Keep your friendly prefix!
            method: method || null,
            url: url || null,
            statusCode: statusCode || null
        });

        const savedLog = await newLog.save();

        res.status(201).json(savedLog);
    } catch (err) {
        logger.error(`Error creating log: ${err.message}`);
        res.status(500).json({
            id: 'LOG_CREATE_ERROR',
            message: 'Failed to create log'
        });
    }
});

module.exports = router;