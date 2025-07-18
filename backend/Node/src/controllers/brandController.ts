import { Request, Response } from 'express';
import * as brandService from '../services/brand.js';
import { Brand } from '../types/models/brand.js';
import { SubscriptionPlan, getSubscriptionPlanDetails } from '../config/subscriptionPlans.js';
import { Timestamp } from 'firebase-admin/firestore';
import { roles } from '../config/roles.js';
import { getBrandOwnerById } from '../services/brandOwner.js';

export const getAllBrands = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const brands = await brandService.getAllBrands(page);
        brands.forEach(brand => {
            brand.subscription.plan = getSubscriptionPlanDetails(brand.subscription.plan as number).name
        })
        return res.status(200).json({ status: 'success', data: brands });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getBrand = async (req: Request, res: Response) => {
    try {
        const brandID = req.params.id;
        const brand = await brandService.getBrand(brandID);

        if (!brand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }

        brand.subscription.plan = getSubscriptionPlanDetails(brand.subscription.plan as number).name
        return res.status(200).json({ status: 'success', data: brand });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getBrandByName = async (req: Request, res: Response) => {
    try {
        const brandName = req.query.name as string;

        if (!brandName) {
            return res.status(400).json({ status: 'error', message: 'Brand name parameter is required' });
        }

        const brand = await brandService.getBrandByName(brandName);

        if (!brand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }

        brand.subscription.plan = getSubscriptionPlanDetails(brand.subscription.plan as number).name;
        return res.status(200).json({ status: 'success', data: brand });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const brandID = req.params.id;
        const newBrandData = req.body as Partial<Brand>;
        await brandService.updateBrand(brandID, newBrandData);
        return res.status(200).json({ status: 'success', message: 'Brand updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const brandID = req.params.id;

        // Check if brand exists first
        const existingBrand = await brandService.getBrand(brandID);
        if (!existingBrand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }

        // Authorization check is now handled by the authorizeBrandAccess middleware
        await brandService.deleteBrand(brandID);
        return res.status(200).json({ status: 'success', message: 'Brand deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getMyBrand = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user?.id;
        const userRole = req.user?.role;
        if (!brandOwnerId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const brandOwner = await getBrandOwnerById(brandOwnerId, userRole);
        if (!brandOwner) {
            return res.status(404).json({ status: 'error', message: 'Brand owner not found' });
        }

        const brand = await brandService.getBrand(brandOwner.brandId);
        if (!brand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }

        brand.subscription.plan = getSubscriptionPlanDetails(brand.subscription.plan as number).name;
        return res.status(200).json({ status: 'success', data: brand });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateMyBrand = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user?.id;
        const userRole = req.user?.role;
        const newBrandData = req.body as Partial<Brand>;
        if (!brandOwnerId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const brandOwner = await getBrandOwnerById(brandOwnerId, userRole);
        if (!brandOwner) {
            return res.status(404).json({ status: 'error', message: 'Brand owner/manager not found' });
        }

        const brand = await brandService.getBrand(brandOwner.brandId);
        if (!brand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }

        await brandService.updateBrand(brand.id!, newBrandData);
        return res.status(200).json({ status: 'success', message: 'Brand updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const upgradeSubscription = async (req: Request, res: Response) => {
    try {
        const { newPlan } = req.body;
        const brandOwnerId = req.user?.id;
        if (!brandOwnerId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
        const brand = await brandService.getBrandByOwnerId(brandOwnerId);
        if (!brand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }
        if (typeof newPlan !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: 'newPlan (enum value) is required in the request body.'
            });
        }

        // Get plan details
        const planDetails = getSubscriptionPlanDetails(newPlan);
        const now = Timestamp.now();
        // Set subscription for 1 month (example)
        const endDate = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
        const updatedSubscription = {
            plan: newPlan,
            price: planDetails.price,
            startDate: now,
            endDate,
        };

        await brandService.updateBrand(brand.id!, { subscription: updatedSubscription });

        return res.status(200).json({
            status: 'success',
            message: `Subscription upgraded to ${planDetails.name} successfully`,
            data: {
                brandId: brand.id,
                brandName: brand.brandName,
                subscription: updatedSubscription,
            }
        });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getAllSubscriptionPlans = (req: Request, res: Response) => {
    // Return all available subscription plans and their details
    const plans = Object.values(SubscriptionPlan)
        .filter((v) => typeof v === 'number')
        .map((plan) => {
            const details = getSubscriptionPlanDetails(plan as SubscriptionPlan);
            return {
                plan: plan,
                ...details
            };
        });
    return res.status(200).json({
        status: 'success',
        data: plans
    });
};
