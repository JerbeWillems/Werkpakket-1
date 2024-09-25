const request = require('supertest');
const app = require('./app');

describe('GET /:route/', () => {
    it('should return a list of persons', async () => {
        const response = await request(app);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});

