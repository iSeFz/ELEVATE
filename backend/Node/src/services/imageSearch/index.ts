import { generateImageEmbedding } from './embedding.js';
import {
    storeImageEmbedding,
    searchSimilarImages,
    deleteProductEmbeddings,
    ImageMetadata
} from './upstachVectorDatabase.js';
import { Product } from '../../types/models/product.js';
import { getProduct } from '../product.js';

/**
 * Process and store embeddings for a single product
 * @param product - The product to process
 */
export const processProductEmbeddings = async (product: Product) => {
    const result = {
        productId: product.id!,
        success: true,
        processedImages: 0,
        failedImages: 0,
        errors: [] as string[]
    };

    try {
        // First, collect all images from all variants
        const allImages: string[] = [];
        for (const variant of product.variants) {
            if (variant.images && variant.images.length > 0) {
                allImages.push(...variant.images);
            }
        }

        // Log the total number of images to process
        console.log(`Product ${product.id}: Found ${allImages.length} images to process`);

        if (allImages.length === 0) {
            console.log(`Product ${product.id}: No images found to process`);
            return result;
        }

        // Process images sequentially with proper delays
        for (let i = 0; i < allImages.length; i++) {
            const imageUrl = allImages[i];
            try {
                // Wait before processing each image to avoid rate limiting
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // Generate embedding for this image
                const embedding = await generateImageEmbedding(imageUrl);

                // Create minimal metadata with dummy values
                const metadata: ImageMetadata = {
                    productId: product.id!,
                    imageUrl: imageUrl,
                    variantId: 'dummy_variant', // Dummy value
                    brandName: 'dummy_brand', // Dummy value
                    category: 'dummy_category', // Dummy value
                    price: 0, // Dummy value
                    brandId: 'dummy_brand_id', // Dummy value
                    department: [] // Dummy value
                };

                await storeImageEmbedding(embedding, metadata);
                result.processedImages++;

            } catch (error: any) {
                const errorMsg = `Failed to process image ${i + 1}/${allImages.length} (${imageUrl}) for product ${product.id}: ${error.message}`;
                console.error(errorMsg);
                result.failedImages++;
                result.errors.push(errorMsg);
                // Continue with next image instead of failing completely
            }
        }

        // Mark as failed only if ALL images failed
        if (result.processedImages === 0 && result.failedImages > 0) {
            result.success = false;
        }

        console.log(`Product ${product.id} processing complete: ${result.processedImages} successful, ${result.failedImages} failed`);
        return result;

    } catch (error: any) {
        console.error(`Error processing embeddings for product ${product.id}:`, error);
        throw error;
    }
};

export const processSingleURLImageEmbedding = async (
    imageUrl: string,
    productId: string) => {
    try {
        console.log(`Processing image embedding for product ${productId} with URL: ${imageUrl}`);
        const embedding = await generateImageEmbedding(imageUrl);
        const metadata: ImageMetadata = {
            productId,
            imageUrl,
            brandName: '',
            category: '',
            price: 0,
            brandId: '',
            variantId: '',
            department: []
        };

        await storeImageEmbedding(embedding, metadata);
        console.log(`Successfully processed image embedding for product ${productId}`);
    } catch (error: any) {
        console.error(`Error processing image embedding for product ${productId}:`, error);
        throw new Error(`Failed to process image embedding for ${imageUrl}: ${error.message}`);
    }
}

/**
 * Search for products by image
 * @param searchImageUrl - URL of the image to search with
 * @param options - Search options
 */
export const searchProductsByImage = async (
    searchImageUrl: string,
    options: {
        limit?: number;
        category?: string;
        brandId?: string;
        priceRange?: { min: number; max: number };
        minSimilarityScore?: number;
    } = {}
) => {
    try {
        const {
            limit = 10,
            minSimilarityScore = 0.4
        } = options;
        // Measure the time taken
        const searchEmbedding = await generateImageEmbedding(searchImageUrl);

        // Search for similar images
        const startTime = Date.now();
        const similarResults = await searchSimilarImages(
            searchEmbedding,
            limit,
        );
        const endTime = Date.now();
        console.log(`Search completed in ${endTime - startTime} ms`);

        // Filter by similarity score and remove duplicates by product
        const filteredResults = similarResults
            .filter(result => result.score >= minSimilarityScore)
            .slice(0, limit);

        // Fetch complete product data and build response
        const results = [];
        const processedProducts = new Set<string>();

        for (const result of filteredResults) {
            const { metadata, score } = result;

            // Skip if we already processed this product
            let productId = metadata?.productId;
            if (typeof productId !== 'string') {
                console.warn(`Invalid productId in metadata: ${JSON.stringify(metadata)}`);
                continue;
            }
            if (processedProducts.has(productId)) {
                continue;
            }

            // Validate metadata
            if (!metadata?.productId || !metadata?.imageUrl) {
                console.warn(`Invalid metadata for result: ${JSON.stringify(metadata)}`);
                continue;
            }
            if (typeof metadata.productId !== 'string' || typeof metadata.imageUrl !== 'string') {
                console.warn(`Invalid types in metadata: ${JSON.stringify(metadata)}`);
                continue;
            }

            try {
                const product = await getProduct(metadata.productId);
                if (product) {
                    results.push({
                        product,
                        similarity: score,
                        matchedImageUrl: metadata.imageUrl,
                    });
                    processedProducts.add(metadata.productId);
                }
            } catch (error) {
                console.error(`Error fetching product ${metadata.productId}:`, error);
                // Continue with next result
            }
        }

        return {
            results,
            searchImageUrl,
            totalResults: results.length,
        };
    } catch (error: any) {
        console.error('Error searching products by image:', error);
        throw new Error(`Failed to search products by image: ${error.message}`);
    }
};

/**
 * Update embeddings when product is updated
 * @param productId - The product ID
 * @param updatedProduct - The updated product data
 */
export const updateProductEmbeddings = async (
    productId: string,
    updatedProduct: Product
): Promise<void> => {
    try {
        // Delete existing embeddings
        await deleteProductEmbeddings(productId);

        // Process new embeddings
        await processProductEmbeddings(updatedProduct);
    } catch (error: any) {
        console.error(`Error updating embeddings for product ${productId}:`, error);
        throw error;
    }
};
