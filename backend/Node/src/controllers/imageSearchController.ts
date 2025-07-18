import { Request, Response } from 'express';
import { searchProductsByImage, processProductEmbeddings, processSingleURLImageEmbedding } from '../services/imageSearch/index.js';
import { getAllBrandProductsWithoutPagination } from '../services/product.js';
import * as BrandOwnerService from '../services/brandOwner.js';

/**
 * Search products by image
 */
export const searchByImage = async (req: Request, res: Response) => {
    try {
        const {
            imageUrl,
            limit = 10,
            category,
            brandId,
            minPrice,
            maxPrice,
            minSimilarity = 0.7
        } = req.query;

        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
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

        const products = await getAllBrandProductsWithoutPagination(brandOwner.brandId);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found for this brand'
            });
        }

        // Process embeddings for each product with enhanced error handling
        const processPromises = products.map(async (product) => {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Short delay to avoid rate limiting
                return await processProductEmbeddings(product);
            } catch (error: any) {
                console.error(`Failed to process product ${product.id}:`, error.message);
                return {
                    productId: product.id,
                    success: false,
                    processedImages: 0,
                    failedImages: 0,
                    errors: [error.message]
                };
            }
        });

        const results = await Promise.allSettled(processPromises);

        // Calculate statistics
        let totalProcessedImages = 0;
        let totalFailedImages = 0;
        let successfulProducts = 0;
        let failedProducts = 0;
        const detailedResults = [];

        for (const result of results) {
            if (result.status === 'fulfilled') {
                const productResult = result.value;
                totalProcessedImages += productResult.processedImages;
                totalFailedImages += productResult.failedImages;

                if (productResult.success) {
                    successfulProducts++;
                } else {
                    failedProducts++;
                }

                detailedResults.push(productResult);
            } else {
                failedProducts++;
                detailedResults.push({
                    productId: 'unknown',
                    success: false,
                    processedImages: 0,
                    failedImages: 0,
                    errors: [result.reason?.message ?? 'Unknown error']
                });
            }
        }

        // Return comprehensive results
        res.status(200).json({
            success: true,
            message: 'Embedding processing completed',
            data: {
                totalProducts: products.length,
                successfulProducts,
                failedProducts,
                totalProcessedImages,
                totalFailedImages,
                summary: {
                    allSuccessful: failedProducts === 0,
                    partialSuccess: successfulProducts > 0 && failedProducts > 0,
                    allFailed: successfulProducts === 0
                },
                detailedResults
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

export const processMultipleImageEmbedding = async (req: Request, res: Response) => {
    try {
        const entries = req.body; // Array of entries with productId, success, processedImages, failedImages, errors

        if (!Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Entries array is required'
            });
        }

        // Extract failed images from error messages
        const failedImages: Array<{ productId: string, url: string }> = [];

        // entries.forEach(entry => {
        //     if (!entry.productId) {
        //         console.warn('Entry missing productId, skipping');
        //         return;
        //     }

        //     if (entry.errors && Array.isArray(entry.errors)) {
        //         entry.errors.forEach((errorMessage: string) => {
        //             // Extract URL from error message using regex
        //             // Pattern matches URLs in parentheses: (https://...)
        //             const urlMatch = errorMessage.match(/\(([^)]+)\)/);
        //             if (urlMatch && urlMatch[1]) {
        //                 const imageUrl = urlMatch[1];
        //                 // Validate that extracted string is actually a URL
        //                 try {
        //                     new URL(imageUrl);
        //                     failedImages.push({
        //                         productId: entry.productId,
        //                         url: imageUrl
        //                     });
        //                 } catch (error) {
        //                     console.warn(`Invalid URL extracted from error: ${imageUrl}`);
        //                 }
        //             }
        //         });
        //     }
        // });

        entries.forEach(entry => {
            if (!entry.productId || !entry.url || entry.status !== 'failed') {
                console.warn('Entry missing productId, skipping');
                return;
            }

            failedImages.push({
                productId: entry.productId,
                url: entry.url
            });
        });

        console.log(`Found ${failedImages.length} failed images to reprocess`);
        // console.log(failedImages[0]);
        // return res.status(200).json({})


        if (failedImages.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No failed images found to process',
                data: {
                    processedCount: 0,
                    failedCount: 0,
                    results: []
                }
            });
        }

        // Process the failed images
        const results = await Promise.allSettled(
            failedImages.map(async (imageProduct, index) => {
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
                return await processSingleURLImageEmbedding(imageProduct.url, imageProduct.productId);
            })
        );

        const processedResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return {
                    url: failedImages[index].url,
                    productId: failedImages[index].productId,
                    status: 'success'
                };
            } else {
                return {
                    url: failedImages[index].url,
                    productId: failedImages[index].productId,
                    status: 'failed',
                    error: result.reason.message
                };
            }
        });

        const successfulResults = processedResults.filter(r => r.status === 'success');

        res.status(200).json({
            success: true,
            message: 'Processed failed image embeddings',
            data: {
                totalFailedImages: failedImages.length,
                processedCount: successfulResults.length,
                failedCount: processedResults.length - successfulResults.length,
                results: processedResults
            }
        });
    } catch (error: any) {
        console.error('Error in processMultipleImageEmbedding controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process multiple image embeddings',
            error: error.message
        });
    }
}
