const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

let routesData = {};

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

// Laad het configuratiebestand bij opstarten
fs.readFile('C:/Werkpakket-1/config.json', (err, jsonData) => {
    if (err) throw err;
    routesData = JSON.parse(jsonData);
});

// Functie om routegegevens op te halen
const getRouteData = (route) => routesData.find(r => r.route === route);

// GET
app.get('/:route/',(req, res, next) => {
    const {
        route
    } = req.params;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        res.status(200).json(routeInfo.data);
    } else {
        res.status(404).json({message: 'Not Found'});
    }
});

// DELETE
app.delete('/:route/:id',(req, res,next) => {
    const {
        route, id
    } = req.params;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        const index = routeInfo.data.findIndex(item => item.id === id);
        if (index !== -1) {
            routeInfo.data.splice(index, 1);
            res.status(200).json({ message: 'Deleted successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } else {
        res.status(404).json({ message: 'Route not found' });
    }
});

// PATCH
//Vraag naar de path van patch, deze vind ik niet in de opdracht.
app.patch('/:route/:id/patch',(req, res, next) => {
    const {
        route, id
    } = req.params;
    const update = req.body;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        const item = routeInfo.data.find(item => item.id === id);
        if (item) {

            // Controleer of de update-velden geldig zijn
            const validKeys = routeInfo.properties;
            const isValidUpdate = Object.keys(update).every(key => validKeys.includes(key));
            if (!isValidUpdate) {
                return res.status(400).json({message: 'Invalid fields in update'});
            }
            Object.assign(item, update);
            res.status(200).json(item);
        } else {
            res.status(404).json({message: 'Item not found'});
        }
    }else {
        res.status(404).json({ message: 'Route not found' });
    }
});

//Vraag of deze url ook goed is, want die wilt nie werken met de url in de opdracht
app.get('/posts/:route', (req, res) => {
    const { route } = req.params;
    const { q } = req.query; // Zoekterm als query parameter

    console.log(`Search query: ${q}`);

    // Zoek in de data van de opgegeven route
    const routeData = routesData.find(r => r.route === route);

    if (!routeData) {
        return res.status(404).json({ message: 'Route not found' });
    }

    // Als er geen query-parameter is, geef alle data terug
    if (!q) {
        return res.status(200).json(routeData.data);
    }

    // Filter de data op basis van de zoekterm
    const searchResults = routeData.data.filter(item => {
        return Object.values(item).some(value =>
            value.toString().toLowerCase().includes(q.toLowerCase())
        );
    });

    if (searchResults.length > 0) {
        res.status(200).json(searchResults);
    } else {
        res.status(404).json({ message: 'No matching data found' });
    }
});


