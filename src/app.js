const express = require('express');
const fs = require('fs');
const app = express();
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;


app.use(express.json());

let routesData = {};

const configFilePath = argv.config || "./config.json";

// Laad het configuratiebestand bij opstarten
fs.readFile(configFilePath, (err, jsonData) => {
    if (err) {
        console.error(`Error reading the file at ${configFilePath}:`, err);
        process.exit(1);
    }
    routesData = JSON.parse(jsonData);
    console.log('Config data loaded:', routesData)
});

// Functie om routegegevens op te halen
const getRouteData = (route) => routesData.find(r => r.route === route);



// GET
//vraag om de next, wat je daarbij moet doen, als je toch de url's moet meegeven.
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
    console.log(route,id, routeInfo)
    if (routeInfo) {
        const index = routeInfo.data.findIndex(item => item.id == id);
        console.log(index)
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
app.patch('/:route/:id',(req, res, next) => {
    const {
        route, id
    } = req.params;
    const update = req.body;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        const item = routeInfo.data.find(item => item.id == id);
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

//Vraag of deze url ook goed is, want die wil nie werken met de url in de opdracht
app.get('/search/:route', (req, res) => {
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

process.on('SIGINT', () => {
    console.log('Saving the current state to the config file before exiting...');

    // Schrijf de huidige routesData terug naar het configuratiebestand
    fs.writeFile(configFilePath, JSON.stringify(routesData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to config file:', err);
        } else {
            console.log('Config data successfully saved!');
        }
        process.exit(0); // Sluit de applicatie af nadat de data is opgeslagen
    });
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

module.exports = app;


