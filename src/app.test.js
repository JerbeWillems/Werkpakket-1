const request = require('supertest');
const app = require('./app.js');// Je Express-applicatie

jest.mock('fs', () => ({
    readFile: (path, callback) => {
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
    writeFile: (path, data, callback) => {
        callback(null); // Mock writing as successful
    }
}));

describe('Testing routes with supertest', () =>{
    //First get function app.js
    test('Get /pet return all pets', async() => {
        const res = await request(app).get('/pet');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([
            {id: 2, name: "duvel" }
        ]);
    });
    //Delete function app.js
    test('Delete /person/1, delete person with id 1', async () => {
        const res = await request(app).delete('/person/1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Deleted successfully' });
    });
    //Patch function app.js
    test('Patch /person/2, update person with id 2', async () => {
        const update = { age: 9 };
        const res = await request(app).patch('/person/2').send(update);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            id: 2,
            name: "sofie",
            age: 9,
            petIds: []
        });
    });
    test('Get /person with query ?q=tim, return person named tim', async () => {
        const res = await request(app).get('/search/person?q=Tim');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([
            { id: 1, name: "tim", age: 11, petIds: [1, 2] }
        ]);
    });
});

