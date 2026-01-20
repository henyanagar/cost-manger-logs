// Unit tests for logs service
const request = require('supertest');
const app = require('../app');

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

// Mock mongoose model methods
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test GET /api/logs
    test('GET /api/logs should return all logs', async () => {
        const response = await request(app).get('/api/logs');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test POST /api/logs/add with valid data
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
        expect(Log.create).toHaveBeenCalled();
    });

    // Test POST /api/logs/add with all optional fields
    test('POST /api/logs/add should accept optional fields', async () => {
        const newLog = {
            service: 'user-service',
            level: 'error',
            msg: 'User not found',
            method: 'GET',
            url: '/api/users/999',
            statusCode: 404,
            time: Date.now()
        };

        const response = await request(app)
            .post('/api/logs/add')
            .send(newLog);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
    });

    // Test validation - missing level
    test('POST /api/logs/add should fail without level', async () => {
        const response = await request(app)
            .post('/api/logs/add')
            .send({ msg: 'Test message' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('id', 'VALIDATION_ERROR');
    });

    // Test validation - missing msg
    test('POST /api/logs/add should fail without msg', async () => {
        const response = await request(app)
            .post('/api/logs/add')
            .send({ level: 'info' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('id', 'VALIDATION_ERROR');
    });

    // Test validation - empty body
    test('POST /api/logs/add should fail with empty body', async () => {
        const response = await request(app)
            .post('/api/logs/add')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    // Test 404 for non-existent endpoint
    test('GET /api/logs/invalid should return 404', async () => {
        const response = await request(app).get('/api/logs/invalid');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('id', 'NOT_FOUND');
    });

    // Test that logs are sorted by time (newest first)
    test('GET /api/logs should sort logs by time descending', async () => {
        const response = await request(app).get('/api/logs');
        expect(response.status).toBe(200);
        expect(Log.find).toHaveBeenCalled();
        expect(Log.find().sort).toHaveBeenCalledWith({ time: -1 });
    });

});