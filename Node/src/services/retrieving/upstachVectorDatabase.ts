import { Index } from '@upstash/vector';
import { ProductVariant } from '../../types/models/product.js';
import { PRODUCT_IMAGE_VECTOR_DATABASE, UPSTACH_VECTOR_DATABASE_TOKEN } from '../../config/upstach.js';

// Initialize Upstash Vector client
const index = new Index({
    url: PRODUCT_IMAGE_VECTOR_DATABASE,
    token: UPSTACH_VECTOR_DATABASE_TOKEN,
});

export interface ImageMetadata {
    productId: string;
    variantId: string;
    imageUrl: string;
    brandName: string;
    category: string;
    price: number;
    brandId: string;
    department: string[];
}

/**
 * Store image embedding in vector database
 * @param embedding - The image embedding vector
 * @param metadata - Product and image metadata
 * @returns Promise<string> - The vector ID
 */
export const storeImageEmbedding = async (
    embedding: number[],
    metadata: ImageMetadata
): Promise<string> => {
    try {
        // Create a unique ID for the vector using productId, variantId, and image URL hash
        const imageHash = Buffer.from(metadata.imageUrl).toString('base64').slice(-8);
        const vectorId = `${metadata.productId}_${metadata.variantId}_${imageHash}`;

        await index.upsert({
            id: vectorId,
            vector: embedding,
            metadata: {
                "productId": metadata.productId,
                "imageUrl": metadata.imageUrl,
            },
        });

        return vectorId;
    } catch (error: any) {
        console.error('Error storing image embedding:', error);
        throw new Error(`Failed to store image embedding: ${error.message}`);
    }
};

/**
 * Search for similar images using vector similarity
 * @param searchEmbedding - The embedding vector to search for
 * @param topK - Number of similar results to return (default: 10)
 * @returns Promise with similar images and their metadata
 */
export const searchSimilarImages = async (
    searchEmbedding: number[],
    topK: number = 10,
) => {
    try {

        const results = await index.query({
            vector: searchEmbedding,
            topK: topK,
            includeMetadata: true,
        });


        return results.map(result => ({
            id: result.id,
            score: result.score,
            metadata: result.metadata,
        }));
    } catch (error: any) {
        console.error('Error searching similar images:', error);
        throw new Error(`Failed to search similar images: ${error.message}`);
    }
};

/**
 * Delete image embedding from vector database
 * @param vectorId - The vector ID to delete
 */
export const deleteImageEmbedding = async (vectorId: string): Promise<void> => {
    try {
        await index.delete(vectorId);
    } catch (error: any) {
        console.error('Error deleting image embedding:', error);
        throw new Error(`Failed to delete image embedding: ${error.message}`);
    }
};

/**
 * Delete all embeddings for a specific product
 * @param productId - The product ID
 */
export const deleteProductEmbeddings = async (productId: string): Promise<void> => {
    try {
        // Query for all vectors with this productId
        const results = await index.query({
            vector: new Array(1408).fill(0), // Dummy vector for metadata query
            topK: 100, // Large number to get all results
            includeMetadata: true,
            filter: `productId = '${productId}'`,
        });

        // Delete all found vectors
        const deletePromises = results.map(result =>
            index.delete(result.id)
        );

        await Promise.all(deletePromises);
    } catch (error: any) {
        console.error('Error deleting product embeddings:', error);
        throw new Error(`Failed to delete product embeddings: ${error.message}`);
    }
};
