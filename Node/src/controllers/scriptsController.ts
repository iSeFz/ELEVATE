// Controller for running migration scripts via HTTP endpoints
import { Request, Response } from 'express';
import { migrate } from '../scripts/migrate.js';

export const migrateCustomerAddresses = async (req: Request, res: Response) => {
    try {
        const result = await migrate();
        res.json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};
