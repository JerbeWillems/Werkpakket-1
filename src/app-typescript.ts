import express, { Request, Response, NextFunction } from 'express';
import { readFile, writeFile } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface RouteData {
    route: string;
    properties: string[];
    data: { id: number; [key: string]: any }[];
}

const app = express();
const argv = yargs(hideBin(process.argv)).argv as { config?: string };

app.use(express.json());

let routesData: RouteData[] = [];

const configFilePath = argv.config || "./config.json";

// Functie om routegegevens op te halen
const getRouteData = (route: string): RouteData | undefined => routesData.find(r => r.route === route);

// Laad het configuratiebestand bij opstarten
readFile(configFilePath, 'utf8', (err, jsonData) => {
    if (err) {
        console.error(`Error reading the file at ${configFilePath}:`, err);
        process.exit(1);
    }
    routesData = JSON.parse(jsonData);
    console.log('Config data loaded:', routesData);
});

// GET route
app.get('/:route/', (req: Request, res: Response) => {
    const { route } = req.params;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        res.status(200).json(routeInfo.data);
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
});

// DELETE route
app.delete('/:route/:id', (req: Request, res: Response) => {
    const { route, id } = req.params;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        const index = routeInfo.data.findIndex(item => item.id == parseInt(id));
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

// PATCH route
app.patch('/:route/:id', (req: Request, res: Response) => {
    const { route, id } = req.params;
    const update = req.body;
    const routeInfo = getRouteData(route);
    if (routeInfo) {
        const item = routeInfo.data.find(item => item.id == parseInt(id));
        if (item) {
            // Controleer of de update-velden geldig zijn
            const validKeys = routeInfo.properties;
            const isValidUpdate = Object.keys(update).every(key => validKeys.includes(key));
            if (!isValidUpdate) {
                return res.status(400).json({ message: 'Invalid fields in update' });
            }
            Object.assign(item, update);
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } else {
        res.status(404).json({ message: 'Route not found' });
    }
});

// Zoekroute met query parameter
app.get('/search/:route', (req: Request, res: Response) => {
    const { route } = req.params;
    const { q } = req.query as { q?: string };  // Zorg ervoor dat q optioneel is

    console.log(`Search query: ${q}`);

    const routeData = routesData.find(r => r.route === route);

    if (!routeData) {
        return res.status(404).json({ message: 'Route not found' });
    }

    if (!q) {
        return res.status(200).json(routeData.data);
    }

    const searchResults = routeData.data.filter(item =>
        Object.values(item).some(value =>
            value.toString().toLowerCase().includes(q.toLowerCase())
        )
    );

    if (searchResults.length > 0) {
        res.status(200).json(searchResults);
    } else {
        res.status(404).json({ message: 'No matching data found' });
    }
});

// Opslaan van huidige status bij afsluiten
process.on('SIGINT', () => {
    console.log('Saving the current state to the config file before exiting...');

    writeFile(configFilePath, JSON.stringify(routesData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to config file:', err);
        } else {
            console.log('Config data successfully saved!');
        }
        process.exit(0);
    });
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});

export default app;
