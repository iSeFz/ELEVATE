import { Request, Response } from 'express';
import * as BrandManagerService from '../services/brandManager.js';

export const getAllBrandManager = async (req: Request, res: Response) => {
    try {
        const allBrandManagers = await BrandManagerService.getAllBrandManager();
        res.status(200).json({
            status: 'success',
            data: allBrandManagers
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getBrandManager = async (req: Request, res: Response) => {
    try {
        const brandManagerId = req.user!.id;
        const brandManager = await BrandManagerService.getBrandManager(brandManagerId);
        
        if (!brandManager) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand Manager not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: brandManager
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const updateBrandManager = async (req: Request, res: Response) => {
    try {
        const brandManagerId = req.user!.id;
        const brandManagerData = req.body;
        const updatedBrandManager = await BrandManagerService.updateBrandManager(brandManagerId, brandManagerData);
        
        if (!updatedBrandManager) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand Manager not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: updatedBrandManager
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const deleteBrandManager = async (req: Request, res: Response) => {
    try {
        const brandManagerId = req.user!.id;
        
        const success = await BrandManagerService.deleteBrandManager(brandManagerId);
        
        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand Manager not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Brand Manager deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};