import { generateImageEmbedding, generateBatchImageEmbeddings } from './embedding.js';
import {
    storeImageEmbedding,
    searchSimilarImages,
    deleteImageEmbedding,
    deleteProductEmbeddings,
    ImageMetadata
} from './upstachVectorDatabase.js';
import { Product, ProductVariant } from '../../types/models/product.js';
import { getProduct } from '../product.js';

/**
 * Process and store embeddings for a single product
 * @param product - The product to process
 */
export const processProductEmbeddings = async (product: Product): Promise<void> => {
    try {
        for (const variant of product.variants) {
            if (variant.images && variant.images.length > 0) {
                for (const imageUrl of variant.images) {
                    try {
                        // Generate embedding
                        const embedding = await generateImageEmbedding(imageUrl);
                        console.log(`Generated embedding for image: ${imageUrl}`);
                        console.log('Search embedding:', embedding.slice(0, 20));


                        // Prepare metadata
                        const metadata: ImageMetadata = {
                            productId: product.id!,
                            variantId: variant.id!,
                            imageUrl: imageUrl,
                            brandName: product.brandName,
                            category: product.category,
                            price: variant.price,
                            brandId: product.brandId,
                            department: product.department,
                        };

                        // Store in vector database
                        // await storeImageEmbedding(embedding, metadata);
                        console.log(`Processed embedding for product ${product.id}, variant ${variant.id}`);

                        // Add small delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error(`Failed to process image ${imageUrl} for product ${product.id}:`, error);
                        // Continue with next image instead of failing completely
                    }
                    break; // todo: remove this break to process all images
                }
                break; // todo: remove this break to process all variants
            }
        }
    } catch (error: any) {
        console.error(`Error processing embeddings for product ${product.id}:`, error);
        throw error;
    }
};

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

        // Generate embedding for search image
        console.log('Generating embedding for search image...');
        const searchEmbedding = await generateImageEmbedding(searchImageUrl);
        // show first 10 values of the embedding
        console.log('Search embedding:', searchEmbedding.slice(0, 20));

        // Search for similar images
        console.log('Searching for similar images...');
        const similarResults = await searchSimilarImages(
            searchEmbedding,
            limit,
        );

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
