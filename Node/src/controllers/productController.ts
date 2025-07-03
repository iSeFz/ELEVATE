import { Request, Response } from 'express';
import * as productService from '../services/product.js';
import * as productAssociationService from '../services/productAssociation.js';
import * as brandOwnerService from '../services/brandOwner.js';
import * as brandService from '../services/brand.js';
import { Product, ProductVariant } from '../types/models/product.js';
import { getSubscriptionPlanDetails } from '../config/subscriptionPlans.js';
import { CATEGORIES, DEPARTMENTS, SIZES } from '../config/product.js';

export const getAllCategories = (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', data: CATEGORIES });
}

export const getAllDepartments = (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', data: DEPARTMENTS });
}

export const getAllSizes = (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', data: SIZES });
}

export const getAllProducts = async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const brand = req.query.brand as string;
    const department = req.query.department as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if ((category && brand) || (category && department) || (brand && department)) {
        return res.status(400).json({ status: 'error', message: 'Please provide only one filter: category, brand, or department' });
    }

    try {
        let results;
        if (category) {
            results = await productService.getProductsByCategory(category, page, limit);
        } else if (brand) {
            results = await productService.getProductsByBrand(brand, page, limit);
        } else if (department) {
            results = await productService.getProductsByDepartment(department, page, limit);
        } else {
            // If no filters are provided, return all products
            results = await productService.getAllProducts(page, limit);
        }
        results.products.forEach(product => {
            product.brandSubscriptionPlan = getSubscriptionPlanDetails(product.brandSubscriptionPlan as number).name;
        })
        return res.status(200).json({ status: 'success', data: results.products, pagination: results.pagination });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getMostPopularProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const results = await productService.getMostPopularProducts(page, limit);

        results.products.forEach(product => {
            product.brandSubscriptionPlan = getSubscriptionPlanDetails(product.brandSubscriptionPlan as number).name;
        });
        return res.status(200).json({ status: 'success', data: results.products, pagination: results.pagination });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

export const getTopRatedProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const results = await productService.getTopRatedProducts(page, limit);

        results.products.forEach(product => {
            product.brandSubscriptionPlan = getSubscriptionPlanDetails(product.brandSubscriptionPlan as number).name;
        });
        return res.status(200).json({ status: 'success', data: results.products, pagination: results.pagination });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

export const getProductRecommendations = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const results = await productAssociationService.getFrequentlyBoughtTogether(productId, page, limit);

        results.recommendations.forEach(product => {
            product.brandSubscriptionPlan = getSubscriptionPlanDetails(product.brandSubscriptionPlan as number).name;
        });
        return res.status(200).json({ status: 'success', data: results.recommendations, pagination: results.pagination });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
}

export const getProduct = async (req: Request, res: Response) => {
    try {
        const productID = req.params.id;
        const product = await productService.getProduct(productID);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        product.brandSubscriptionPlan = getSubscriptionPlanDetails(product.brandSubscriptionPlan as number).name;
        return res.status(200).json({ status: 'success', data: product });
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
            return res.status(404).json({ status: 'error', message: 'Product variant not found' });
        }

        return res.status(200).json({ status: 'success', data: variant });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
}

export const addProduct = async (req: Request, res: Response) => {
    try {
        const productData = req.body as Product;
        const userRole = req.user?.role;
        const brandOwnerId = req.user?.id as string;
        const brandOwner = await brandOwnerService.getBrandOwnerById(brandOwnerId, userRole);

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
        const plan = brand.subscription?.plan as number;
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

export const deleteAllBrandProducts = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user?.id as string;
        const userRole = req.user?.role;
        const brandOwner = await brandOwnerService.getBrandOwnerById(brandOwnerId, userRole);

        if (!brandOwner) {
            return res.status(404).json({
                status: 'error',
                message: 'Brand owner not found'
            });
        }

        const products = await productService.getAllBrandProductsWithoutPagination(brandOwner.brandId);

        // Delete each product and decrement the product count
        for (const product of products) {
            await productService.deleteProduct(product.id!);
        }

        const brand = await brandService.getBrand(brandOwner.brandId);
        if (brand) {
            await brandService.updateBrand(brand.id ?? '', { productCount: 0 });
        }

        return res.status(200).json({ status: 'success', message: 'All products deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
}

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
