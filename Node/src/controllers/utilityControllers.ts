import { Request, Response } from 'express';
import { getAddressCoordinatesAPI } from '../services/utility.js';

export const getAddressCoordinates = async (req: Request, res: Response) => {
    const { building, street, city, postalCode } = req.query;

    if (!building || !street || !city || !postalCode) {
        return res.status(400).json({ error: 'Missing required query parameters (building, street, city, postalCode)' });
    }

    const location = await getAddressCoordinatesAPI(
        building as string,
        street as string,
        city as string,
        postalCode as string
    );

    if (!location) {
        return res.status(400).json({ error: 'Geocoding failed' });
    }

    res.json(location);
}
