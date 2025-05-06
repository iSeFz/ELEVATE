import { Request, Response } from 'express';
import * as productService from '../services/product.js';
import * as brandOwnerService from '../services/brandOwner.js';
import { Product, ProductVariant } from '../types/models/product.js';

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
        const brandOwnerId = req.user?.id as string;

        // Remove any ID if provided - always use auto-generated IDs for products
        delete productData.id;

        // Get brandOwner to find the associated brandId
        const brandOwner = await brandOwnerService.getBrandOwnerById(brandOwnerId);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        // Set the brandOwnerId and brandId from the brand owner's data
        productData.brandOwnerId = brandOwnerId;
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
        const newProductData = req.body as Partial<Product>;

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

export const getProductVariant = async (req: Request, res: Response) => {
    try {
        const productID = req.params.productId;
        const variantID = req.params.variantId;
        
        if (!productID || !variantID) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Product ID and variant ID are required' 
            });
        }
        
        const variant = await productService.getProductVariant(productID, variantID);
        
        if (!variant) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Product variant not found' 
            });
        }
        
        return res.status(200).json({ 
            status: 'success', 
            data: variant 
        });
    } catch (error: any) {
        return res.status(400).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

export const addProductVariant = async (req: Request, res: Response) => {
    try {
        const productID = req.params.productId;
        const variantData = req.body as ProductVariant;
        
        if (!productID) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Product ID is required' 
            });
        }
        
        // Remove any ID if provided - we'll generate one in the service
        delete variantData.id;
        
        const newVariant = await productService.addProductVariant(productID, variantData);
        
        return res.status(201).json({
            status: 'success',
            message: 'Product variant added successfully',
            data: newVariant
        });
    } catch (error: any) {
        return res.status(400).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

export const updateProductVariant = async (req: Request, res: Response) => {
    try {
        const productID = req.params.productId;
        const variantID = req.params.variantId;
        const updatedVariantData = req.body as Partial<ProductVariant>;
        
        if (!productID || !variantID) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Product ID and variant ID are required' 
            });
        }
        
        // Remove the ID from the update data to prevent changing it
        delete updatedVariantData.id;
        
        const updatedVariant = await productService.updateProductVariant(
            productID, 
            variantID, 
            updatedVariantData
        );
        
        return res.status(200).json({
            status: 'success',
            message: 'Product variant updated successfully',
            data: updatedVariant
        });
    } catch (error: any) {
        return res.status(400).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

export const deleteProductVariant = async (req: Request, res: Response) => {
    try {
        const productID = req.params.productId;
        const variantID = req.params.variantId;
        
        if (!productID || !variantID) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Product ID and variant ID are required' 
            });
        }
        
        await productService.deleteProductVariant(productID, variantID);
        
        return res.status(200).json({
            status: 'success',
            message: 'Product variant deleted successfully'
        });
    } catch (error: any) {
        return res.status(400).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};
