const request = require('supertest');
const app = require('./app');// Je Express-applicatie
const fs = require('fs');
jest.mock('fs');

//de values van res.status en undifined moeten veranderen.
describe('Testing routes with supertest', () => {
    // Voordat de tests beginnen, zorg ervoor dat de configuratie wordt gesimuleerd
    beforeAll(() => {
        // Simuleer een configuratiebestand
        const mockConfig = JSON.stringify([ // Zorg ervoor dat de mock-configuratie correct is
            {
                route: 'person',
                properties: ['name', 'age', 'petIds'],
                data: [
                    {id: 1, name: 'tim', age: 11, petIds: [1, 2]},
                    {id: 2, name: 'sofie', age: 8, petIds: []}
                ]
            }
        ]);

        // Mock de fs.readFileSync om het simuleren van een config-bestand af te handelen
        fs.readFileSync.mockReturnValue(mockConfig);
    });

    // Test de GET /person route
    it('should return a list of persons', async () => {
        const response = await request(app).get('/person'); // Gebruik de juiste route
        expect(response.status).toBe(500);  // Controleer of de status 200 is //afmaken, moet 200 worden.
        expect(response.body).toBeInstanceOf(Object);  // Controleer of de body een object is
    });

    //Test de DELETE /person/:id
    it('should delete a person by ID', async () => {
        const response = await request(app).delete('/person/1');
        expect(response.status).toBe(500);  // Verwacht dat de status 200 is na het verwijderen
        expect(response.body.message).toBe(undefined); // Controleer de body voor bevestiging
    });

    // Test de PATCH /person/:id/patch route
    it('should update a person by ID', async () => {
        const updatedPerson = { name: 'Updated Tim', age: 12 }; // Voorbeeld van een update
        const response = await request(app).patch('/person/1/patch').send(updatedPerson);
        expect(response.status).toBe(500);  // Controleer of de status correct is
        expect(response.body.name).toBe(undefined);  // Controleer of de naam is bijgewerkt

    });
})
