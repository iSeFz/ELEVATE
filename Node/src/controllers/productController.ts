import { Request, Response } from 'express';
import * as services from '../services/firestore.ts';

export const getAllProducts = async (req: Request, res: Response) => {
    res.status(200).json(await services.getAllProducts());
};