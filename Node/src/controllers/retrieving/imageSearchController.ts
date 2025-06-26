import { Request, Response } from 'express';
import { searchProductsByImage, processProductEmbeddings } from '../../services/retrieving/imageSearch.js';
import { getAllBrandProductsWithoutPagination } from '../../services/product.js';
import * as BrandOwnerService from '../../services/brandOwner.js';

/**
 * Search products by image
 */
export const searchByImage = async (req: Request, res: Response) => {
    try {
        const { imageUrl } = req.body;
        const {
            limit = 10,
            category,
            brandId,
            minPrice,
            maxPrice,
            minSimilarity = 0.7
        } = req.query;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        const priceRange = (minPrice && maxPrice) ? {
            min: Number(minPrice),
            max: Number(maxPrice)
        } : undefined;

        const results = await searchProductsByImage(imageUrl, {
            limit: Number(limit),
            category: category as string,
            brandId: brandId as string,
            priceRange,
            minSimilarityScore: Number(minSimilarity)
        });

        res.status(200).json({
            success: true,
            data: results,
            message: 'Image search completed successfully'
        });
    } catch (error: any) {
        console.error('Error in searchByImage controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products by image',
            error: error.message
        });
    }
};

/**
 * Process embeddings for all products of a brand (admin only)
 */
export const processBrandEmbeddings = async (req: Request, res: Response) => {
    try {
        const brandOwnerId = req.user?.id; // Assuming user ID is stored in req.user
        if (!brandOwnerId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }
        const brandOwner = await BrandOwnerService.getBrandOwnerById(brandOwnerId);
        if (!brandOwner) {
            return res.status(404).json({ status: 'error', message: 'Brand owner not found' });
        }

        if (!brandOwner.brandId) {
            return res.status(400).json({
                success: false,
                message: 'Brand ID is required'
            });
        }

        // Get all products for the brand
        console.log(`Processing embeddings for brand: ${brandOwner.brandId}`);
        const products = await getAllBrandProductsWithoutPagination(brandOwner.brandId);
        
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found for this brand'
            });
        }
        
        // Process embeddings for each product (this will take time)
        // const processPromises = products.map(product =>
        //     processProductEmbeddings(product).catch(error => ({
        //         productId: product.id,
        //         error: error.message
        //     }))
        // );

        console.log(`Process One product: ${products[0].id}`);
        const results = await processProductEmbeddings(products[0]).catch(error => ({
                productId: products[0].id,
                error: error.message
            }))

        // const results = await Promise.allSettled(processPromises);

        // const successful = results.filter(r => r.status === 'fulfilled').length;
        // const failed = results.filter(r => r.status === 'rejected').length;

        res.status(200).json({
            success: true,
            message: 'Embedding processing completed',
            data: {
                totalProducts: products.length,
                // successful,
                // failed,
                details: results
            }
        });
    } catch (error: any) {
        console.error('Error in processBrandEmbeddings controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process brand embeddings',
            error: error.message
        });
    }
};