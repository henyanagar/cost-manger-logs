// Unit tests for logs service
const request = require('supertest');
const app = require('../app'); // ← Import app.js, NOT server.js

// Mock the Log model
jest.mock('../models/log', () => {
    return jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
            _id: '123',
            service: 'test',
            level: 'info',
            msg: 'test',
            time: new Date()
        })
    }));
});

// Mock mongoose model
const Log = require('../models/log');
Log.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([
        {
            _id: '1',
            service: 'test-service',
            level: 'info',
            msg: 'Test log',
            time: new Date()
        }
    ])
});

Log.create = jest.fn().mockResolvedValue({
    _id: '123',
    service: 'test-service',
    level: 'info',
    msg: 'Test log message',
    time: new Date()
});

describe('Logs API', () => {

    // Test GET /api/logs
    test('GET /api/logs should return all logs', async () => {
        const response = await request(app).get('/api/logs');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test POST /api/logs/add
    test('POST /api/logs/add should add a new log', async () => {
        const newLog = {
            service: 'test-service',
            level: 'info',
            msg: 'Test log message'
        };

        const response = await request(app)
            .post('/api/logs/add')
            .send(newLog);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
    });

    // Test validation
    test('POST /api/logs/add should fail without required fields', async () => {
        const response = await request(app)
            .post('/api/logs/add')
            .send({});

        expect(response.status).toBe(400);
    });
});