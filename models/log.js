// Schema for logs collection
// Stores log entries from all microservices
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    service: {
        type: String,
        default: 'logs-service'
    },
    level: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    },
    msg: {
        type: String,
        required: true
    },
    method: String,
    url: String,
    statusCode: Number
}, {
    versionKey: false,
    collection: 'logs'
});

module.exports = mongoose.model('Log', logSchema);