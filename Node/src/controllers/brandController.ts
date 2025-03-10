import { Request, Response } from 'express';
import * as services from '../services/firestore.ts';
import { BaseService } from '../services/BaseService.ts';

const brandService = new BaseService("Brand");
export const getAllBrands = async (req: Request, res: Response) => {
    res.status(200).json(await brandService.getAll());
};