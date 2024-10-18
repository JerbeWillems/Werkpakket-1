import request from 'supertest';
import app from './app-typescript'; // Je Express-applicatie

// Mock de `fs` module
jest.mock('fs', () => ({
    readFile: (path: string, callback: (err: Error | null, data?: string) => void) => {
        if (path === './config.json') {
            const data = JSON.stringify([
                {
                    route: "person",
                    properties: ["name", "age", "petIds"],
                    data: [
                        { id: 1, name: "tim", age: 11, petIds: [1, 2] },
                        { id: 2, name: "sofie", age: 8, petIds: [] }
                    ]
                },
                {
                    route: "pet",
                    properties: ["name"],
                    data: [{ id: 2, name: "duvel" }]
                }
            ]);
            callback(null, data);
        } else {
            callback(new Error("File not found"));
        }
    },
    writeFile: (path: string, data: string, callback: (err: Error | null) => void) => {
        callback(null); // Mock writing as successful
    }
}));

describe('Testing routes with supertest', () => {

    // Test voor GET /pet
    test('GET /pet returns all pets', async () => {
        const res: request.Response = await request(app).get('/pet');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([
            { id: 2, name: "duvel" }
        ]);
    });

    // Test voor DELETE /person/:id
    test('DELETE /person/1 deletes person with id 1', async () => {
        const res: request.Response = await request(app).delete('/person/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Deleted successfully' });
    });

    // Test voor PATCH /person/:id
    test('PATCH /person/2 updates person with id 2', async () => {
        const update = { age: 9 };
        const res: request.Response = await request(app).patch('/person/2').send(update);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            id: 2,
            name: "sofie",
            age: 9,
            petIds: []
        });
    });

    // Test voor GET /search/person?q=tim
    test('GET /search/person?q=tim returns person named tim', async () => {
        const res: request.Response = await request(app).get('/search/person?q=Tim');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([
            { id: 1, name: "tim", age: 11, petIds: [1, 2] }
        ]);
    });
});
