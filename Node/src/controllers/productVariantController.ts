import { Request, Response } from 'express';
import * as productVariantService from '../services/productVariant.js';
import { ProductVariant } from '../types/models/productVariant.js';

export const getAllProductVariants = async (req: Request, res: Response) => {
    try {
        const productVariants = await productVariantService.getAllProductVariants();
        return res.status(200).json({ status: 'success', data: productVariants });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getProductVariant = async (req: Request, res: Response) => {
    try {
        const variantID = req.params.id;
        const productVariant = await productVariantService.getProductVariant(variantID);
        
        if (!productVariant) {
            return res.status(404).json({ status: 'error', message: 'Product variant not found' });
        }
        
        return res.status(200).json({ status: 'success', data: productVariant });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getProductVariantsByProduct = async (req: Request, res: Response) => {
    try {
        const productID = req.query.productId as string;
        
        if (!productID) {
            return res.status(400).json({ status: 'error', message: 'Product ID parameter is required' });
        }
        
        const variants = await productVariantService.getProductVariantsByProduct(productID);
        return res.status(200).json({ status: 'success', data: variants });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addProductVariant = async (req: Request, res: Response) => {
    try {
        const variant: ProductVariant = req.body;
        const newVariant = await productVariantService.addProductVariant(variant);
        return res.status(201).json({ 
            status: 'success', 
            message: 'Product variant added successfully', 
            data: newVariant 
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateProductVariant = async (req: Request, res: Response) => {
    try {
        const variantID = req.params.id;
        const newVariantData = sanitizeProductVariantData(req.body);
        
        // Check if variant exists first
        const existingVariant = await productVariantService.getProductVariant(variantID);
        if (!existingVariant) {
            return res.status(404).json({ status: 'error', message: 'Product variant not found' });
        }
        
        await productVariantService.updateProductVariant(variantID, newVariantData);
        return res.status(200).json({ status: 'success', message: 'Product variant updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteProductVariant = async (req: Request, res: Response) => {
    try {
        const variantID = req.params.id;
        
        // Check if variant exists first
        const existingVariant = await productVariantService.getProductVariant(variantID);
        if (!existingVariant) {
            return res.status(404).json({ status: 'error', message: 'Product variant not found' });
        }
        
        await productVariantService.deleteProductVariant(variantID);
        return res.status(200).json({ status: 'success', message: 'Product variant deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Helper function to sanitize product variant data
const sanitizeProductVariantData = (newData: any): Partial<ProductVariant> => {
    // List of allowed product variant fields based on our ProductVariant type
    const allowedFields = [
        'colors', 'discount', 'images', 'price',
        'product', 'size', 'stock'
    ];
    
    const sanitizedData: Partial<ProductVariant> = {};
    
    for (const key in newData) {
        if (allowedFields.includes(key)) {
            sanitizedData[key as keyof ProductVariant] = newData[key];
        }
    }
    
    return sanitizedData;
};