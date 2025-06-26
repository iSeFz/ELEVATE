import { Request, Response } from 'express';
import * as UtilitiesService from '../services/utility.js';

export const getAddressCoordinates = async (req: Request, res: Response) => {
    const { building, street, city, postalCode } = req.query;

    if (!building || !street || !city || !postalCode) {
        return res.status(400).json({ error: 'Missing required query parameters (building, street, city, postalCode)' });
    }

    const location = await UtilitiesService.getAddressCoordinatesAPI(
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

export const tryBeforeYouBuy = async (req: Request, res: Response) => {
    const { productImg, personImg, category } = req.body;

    try {
        console.log("Starting try-on process with category:", category);
        const result = await UtilitiesService.tryBeforeYouBuy(personImg, productImg, category);
        res.json({
            status: 'success',
            imageURL: result
        });
    } catch (error) {
        console.error('Error during try-on:', error);
        res.status(500).json({
            status: 'error',
            message: 'Try-on processing failed'
        });
    }
}
