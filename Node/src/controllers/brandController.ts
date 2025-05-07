import { Request, Response } from 'express';
import * as brandService from '../services/brand.js';
import { Brand } from '../types/models/brand.js';

export const getAllBrands = async (req: Request, res: Response) => {
    try {
        const brands = await brandService.getAllBrands();
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
        
        return res.status(200).json({ status: 'success', data: brand });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Don't use it, the brand is created once the brand owner is created
export const addBrand = async (req: Request, res: Response) => {
    try {
        const brandData = req.body;
        const requestingUserID = req.user?.id;
        const userRole = req.user?.role;
        
        // If user is a brand owner, ensure the brand is linked to them
        if (userRole === 'brandOwner') {
            // Set the brandOwner reference to the current user
            brandData.brandOwnerId = requestingUserID;
        } else if (userRole === 'admin') {
            // Admins can create brands without linking to a specific user
            // brandOwnerId will be provided in the request body if needed
        } else {
            return res.status(403).json({ status: 'error', message: 'You are not authorized to add a brand' });
        }
        
        // Remove any ID if provided - always use auto-generated IDs for brands
        delete brandData.id;
        
        const newBrand = await brandService.addBrand(brandData);
        return res.status(201).json({ 
            status: 'success', 
            message: 'Brand added successfully', 
            data: newBrand 
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateBrand = async (req: Request, res: Response) => {
    try {
        const brandID = req.params.id;
        const newBrandData = sanitizeBrandData(req.body);
        
        // Check if brand exists first
        const existingBrand = await brandService.getBrand(brandID);
        if (!existingBrand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }
        
        // Authorization check is now handled by the authorizeBrandAccess middleware
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

// Helper function to sanitize brand data
const sanitizeBrandData = (newBrandData: any): Partial<Brand> => {
    // List of allowed brand fields based on our new Brand type
    const brandFields = [
        'addresses', 'brandName', 'brandOwner', 'email', 'imageURL',
        'industry', 'phoneNumbers', 'rating', 'storyDescription', 
        'subscription', 'websites', 'productIds'
    ];
    
    const sanitizedData: Partial<Brand> = {};
    
    for (const key in newBrandData) {
        if (brandFields.includes(key)) {
            sanitizedData[key as keyof Brand] = newBrandData[key];
        }
    }
    
    return sanitizedData;
};