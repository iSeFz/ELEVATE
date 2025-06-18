import { Request, Response } from 'express';
import * as BrandOwnerService from '../services/brandOwner.js';
import * as productService from '../services/product.js';
import { roles } from '../config/roles.js';
import { getSubscriptionPlanDetails } from '../config/subscriptionPlans.js';

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
        const brandOwnerId = req.user!.id;
        const brandOwner = await BrandOwnerService.getBrandOwnerById(brandOwnerId);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                ...brandOwner,
                role: roles['brandOwner'] // Include the role from the request user
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export const getMyProducts = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        if (!brandOwnerId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
        const brandOwner = await BrandOwnerService.getBrandOwnerById(brandOwnerId);
        if (!brandOwner) {
            return res.status(404).json({ status: 'error', message: 'Brand owner not found' });
        }
        const results = await productService.getProductsByBrand(brandOwner.brandId, page);
        results.products.forEach(product => {
            product.brandSubscriptionPlan = getSubscriptionPlanDetails(product.brandSubscriptionPlan as number).name;
        })
        return res.status(200).json({ status: 'success', data: results.products, pagination: results.pagination });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
}

/**
 * Update a brand owner
 */
export const updateBrandOwner = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user!.id;
        const updatedBrandOwner = await BrandOwnerService.updateBrandOwner(brandOwnerId, req.body);

        if (!updatedBrandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: updatedBrandOwner ? 'Brand owner updated successfully' : 'Brand owner not found'
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
        const brandOwnerId = req.user!.id;

        // 1. Get the brand owner to find the associated brand
        const brandOwner = await BrandOwnerService.getBrandOwnerById(brandOwnerId);

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
        const brandOwnerDeleted = await BrandOwnerService.deleteBrandOwner(brandOwnerId);

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

export const getCurrentMonthStats = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user!.id;
        const brandOwner = await BrandOwnerService.getBrandOwnerById(brandOwnerId);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        const stats = await BrandOwnerService.getCurrentMonthStats(brandOwner.brandId);
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

export const getBrandReviewsSummary = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user!.id;
        const brandOwner = await BrandOwnerService.getBrandOwnerById(brandOwnerId);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        const reviewsSummary = await BrandOwnerService.getBrandReviewsSummary(brandOwner.brandId);
        res.status(200).json({
            status: 'success',
            data: reviewsSummary
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
