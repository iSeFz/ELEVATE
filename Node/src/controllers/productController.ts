import { Request, Response } from 'express';
import * as productService from '../services/product.js';
import * as brandOwnerService from '../services/brandOwner.js';
import * as brandService from '../services/brand.js';
import { Product, ProductVariant } from '../types/models/product.js';
import { getSubscriptionPlanDetails } from '../config/subscriptionPlans.js';

export const getAllProducts = async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const brand = req.query.brand as string;
    const department = req.query.department as string;
    const page = parseInt(req.query.page as string) || 1;

    if ((category && brand) || (category && department) || (brand && department)) {
        return res.status(400).json({ status: 'error', message: 'Please provide only one filter: category, brand, or department' });
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
        if (department) {
            const products = await productService.getProductsByDepartment(department, page);
            return res.status(200).json({ status: 'success', data: products });
        }
        // If no filters are provided, return all products
        const products = await productService.getAllProducts(page);
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
        const brandOwner = await brandOwnerService.getBrandOwnerById(brandOwnerId);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        // Set the brandOwnerId and brandId from the brand owner's data
        productData.brandOwnerId = brandOwnerId;
        productData.brandName = brandOwner.brandName;
        productData.brandId = brandOwner.brandId;

        // Restrict product count based on subscription plan
        const brand = await brandService.getBrand(brandOwner.brandId);
        if (!brand) {
            return res.status(404).json({ status: 'error', message: 'Brand not found' });
        }
        const plan = brand.subscription?.plan;
        const planDetails = getSubscriptionPlanDetails(plan);
        const limit = planDetails.productLimit;
        if (limit !== undefined && brand.productCount >= limit) {
            const planName = planDetails.name;
            return res.status(403).json({
                status: 'error',
                message: `${planName} subscription plan allows a maximum of ${limit} products. Please upgrade your plan to add more.`
            });
        }

        // Set the brandSubscriptionPlan field from the brand's current subscription
        productData.brandSubscriptionPlan = plan;

        const newProduct = await productService.addProduct(productData);
        // Increment productCount for the brand
        await brandService.updateBrand(brand.id ?? '', { productCount: (brand.productCount || 0) + 1 });

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

        await productService.updateProduct(productID, newProductData);
        return res.status(200).json({
            status: 'success',
            message: 'Product updated successfully',
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

        // Decrement productCount for the brand
        if (existingProduct.brandId) {
            const brand = await brandService.getBrand(existingProduct.brandId);
            if (brand) {
                await brandService.updateBrand(brand.id ?? '', { productCount: Math.max((brand.productCount || 1) - 1, 0) });
            }
        }

        // Authorization check is now handled by the authorizeProductAccess middleware
        await productService.deleteProduct(productID);
        return res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addProductVariant = async (req: Request, res: Response) => {
    try {
        const productID = req.params.productId;
        const variantData = req.body as ProductVariant;

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
