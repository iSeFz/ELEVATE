import { Request, Response } from 'express';
import * as productService from '../services/product.js';
import * as brandOwnerService from '../services/brandOwner.js';
import { Product } from '../types/models/product.js';

export const getAllProducts = async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const brand = req.query.brand as string;
    const page = parseInt(req.query.page as string) || 0;

    if (category && brand) {
        return res.status(400).json({ status: 'error', message: 'Please provide either category or brand, not both' });
    }

    try {
        if (category) {
            const products = await productService.getProductsByCategory(category, page);
            return res.status(200).json({ status: 'success', data: products });
        }
        if (brand) {
            const products = await productService.getProductsByBrand(brand, page);
            return res.status(200).json({ status: 'success', data: products });
        }
        // If no filters are provided, return all products
        const products = await productService.getAllProducts();
        return res.status(200).json({ status: 'success', data: products });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const productID = req.params.id;
        const product = await productService.getProduct(productID);

        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        return res.status(200).json({ status: 'success', data: product });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addProduct = async (req: Request, res: Response) => {
    try {
        const productData = req.body as Product;
        const brandOwnerId = req.user?.id;

        // Remove any ID if provided - always use auto-generated IDs for products
        delete productData.id;

        // Get brandOwner to find the associated brandId
        const brandOwner = await brandOwnerService.getBrandOwnerById(brandOwnerId!);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        // Set the brandOwnerId and brandId from the brand owner's data
        productData.brandOwnerId = brandOwnerId!;
        productData.brandId = brandOwner.brandId;

        const newProduct = await productService.addProduct(productData);
        return res.status(201).json({
            status: 'success',
            message: 'Product added successfully',
            data: newProduct
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const productID = req.params.id;
        const newProductData = sanitizeProductData(req.body);

        // Authorization check is handled by the authorizeProductAccess middleware
        const updatedProduct = await productService.updateProduct(productID, newProductData);
        return res.status(200).json({
            status: 'success',
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateProductVariants = async (req: Request, res: Response) => {
    try {
        const productID = req.params.id;
        const { variants } = req.body;

        if (!variants || !Array.isArray(variants)) {
            return res.status(400).json({
                status: 'error',
                message: 'Variants array is required'
            });
        }

        // Check if product exists first
        const existingProduct = await productService.getProduct(productID);
        if (!existingProduct) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        // Update only the variants field
        const updatedProduct = await productService.updateProduct(productID, { variants });

        return res.status(200).json({
            status: 'success',
            message: 'Product variants updated successfully',
            data: updatedProduct
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productID = req.params.id;

        // Check if product exists first
        const existingProduct = await productService.getProduct(productID);
        if (!existingProduct) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        // Authorization check is now handled by the authorizeProductAccess middleware
        await productService.deleteProduct(productID);
        return res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Helper function to sanitize product data
const sanitizeProductData = (newProductData: any): Partial<Product> => {
    // List of allowed product fields based on our new Product type
    const productFields = [
        'averageRating', 'brand', 'category', 'dateCreated', 'department',
        'description', 'material', 'name', 'reviews', 'stock',
        'totalReviews', 'variants'
    ];

    const sanitizedData: Partial<Product> = {};

    for (const key in newProductData) {
        if (productFields.includes(key)) {
            sanitizedData[key as keyof Product] = newProductData[key];
        }
    }

    return sanitizedData;
};
