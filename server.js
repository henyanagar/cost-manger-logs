// Server entry point - starts the Express application
const app = require('./app');
const mongoose = require('mongoose');
const { logger } = require('./logger/pino');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Logs Service: Connected to MongoDB');
        logger.info('Logs Service connected to MongoDB');

        // Start server after DB connection
        app.listen(PORT, () => {
            console.log(`Logs service running on port ${PORT}`);
            logger.info(`Logs service started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        logger.error('MongoDB connection failed');
        process.exit(1);
    });