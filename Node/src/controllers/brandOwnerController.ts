import { Request, Response } from 'express';
import * as BrandOwnerService from '../services/brandOwner.js';

/**
 * Get all brand owners (admin only)
 */
export const getAllBrandOwners = async (req: Request, res: Response) => {
    try {
        const brandOwners = await BrandOwnerService.getAllBrandOwners();
        res.status(200).json({
            status: 'success',
            data: brandOwners
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get a brand owner by ID
 */
export const getBrandOwner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const brandOwner = await BrandOwnerService.getBrandOwnerById(id);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: brandOwner
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update a brand owner
 */
export const updateBrandOwner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedBrandOwner = await BrandOwnerService.updateBrandOwner(id, req.body);

        if (!updatedBrandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: updatedBrandOwner
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Delete a brand owner and their associated brand
 */
export const deleteBrandOwner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Get the brand owner to find the associated brand
        const brandOwner = await BrandOwnerService.getBrandOwnerById(id);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        // 2. Get the brand ID
        const brandId = brandOwner.brandId;

        // 3. Import brand service
        const brandService = await import('../services/brand.js');

        // 4. Delete both the brand and brand owner
        // We'll first delete the brand and then the brand owner to maintain integrity
        let brandDeleted = false;

        if (brandId) {
            brandDeleted = await brandService.deleteBrand(brandId);

            // If the brand deletion failed, we should not proceed with deleting the brand owner
            if (!brandDeleted) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to delete associated brand'
                });
            }
        }

        // 5. Delete the brand owner
        const brandOwnerDeleted = await BrandOwnerService.deleteBrandOwner(id);

        if (!brandOwnerDeleted) {
            return res.status(500).json({
                status: 'error',
                message: 'Brand owner found but deletion failed'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Brand owner and associated brand deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};