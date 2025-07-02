import axios from 'axios';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';
import { GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_PROJECT_ID, VERTEX_MODEL_NAME, EMBEDDING_DIMENSION } from '../../config/vertexAI.js';
import { PROJECT_ROOT } from '../../config/common.js';
import { downloadImageAsBuffer } from './imageProcessing.js';

export const GOOGLE_APPLICATION_CREDENTIALS = path.join(PROJECT_ROOT, 'src', 'config', 'serviceAccountKey.json')

/**
 * Generate embedding vector for an image URL
 * @param imageUrl - URL of the image to embed
 * @returns Promise<number[]> - The embedding vector
 */
export const generateImageEmbedding = async (imageUrl: string): Promise<number[]> => {
    if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Image URL must be a valid string');
    }

    try {
        const { buffer: imageBuffer } = await downloadImageAsBuffer(imageUrl);
        // Convert image buffer to base64 format required by Vertex AI
        const base64Image = imageBuffer.toString('base64');
        // Use the prediction service endpoint for embeddings
        const request = {
            instances: [
                {
                    image: {
                        bytesBase64Encoded: base64Image
                    }
                }
            ]
        };

        // Make a direct API call to the Vertex AI prediction endpoint
        const endpoint = `https://${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/${VERTEX_MODEL_NAME}:predict`;

        // Get authentication token
        const auth = new GoogleAuth({
            keyFile: GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        // Make the API request
        const startTime = Date.now();
        const response = await axios.post(endpoint, request, {
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 seconds timeout for embeddings
        });
        const endTime = Date.now();
        console.log(`Vertex AI API call completed in ${endTime - startTime} ms with Image size: ${imageBuffer.length / 1024} KB`);

        // Extract the embedding from the response
        const predictions = response.data.predictions;
        if (!predictions || predictions.length === 0) {
            throw new Error('No predictions returned from Vertex AI');
        }

        const embedding = predictions[0].imageEmbedding;
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            throw new Error('Received an invalid or empty embedding from Vertex AI.');
        }

        if (embedding.length !== EMBEDDING_DIMENSION) {
            console.warn(`Warning: Embedding dimension (${embedding.length}) doesn't match expected (${EMBEDDING_DIMENSION})`);
        }

        // Wait for a short time to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000)); // 200ms delay
        return embedding;
    } catch (error: any) {
        console.error('Error generating Vertex AI image embedding:', error.message);

        // Log more details if available
        if (error.response?.data) {
            console.error('Vertex AI API Error Details:', JSON.stringify(error.response.data, null, 2));
        }

        if (error.details) {
            console.error('Error Details:', JSON.stringify(error.details, null, 2));
        }

        // Provide helpful error messages for common issues
        if (error.message?.includes('authentication') || error.message?.includes('credentials') || error.response?.status === 401) {
            console.error('Tip: Check your Google Cloud credentials and make sure the service account has proper permissions');
        } else if (error.message?.includes('project') || error.message?.includes('billing') || error.response?.status === 403) {
            console.error('Tip: Verify your Google Cloud project ID, ensure billing is enabled, and check API permissions');
        } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.response?.status === 429) {
            console.error('Tip: You may have exceeded API quotas or limits');
        } else if (error.message?.includes('timeout') || error.message?.includes('ECONNRESET')) {
            console.error('Tip: The request may have timed out. Try with a smaller image or check your connection');
        } else if (error.response?.status === 400) {
            console.error('Tip: Check if the image format is supported and properly encoded');
        } else if (error.response?.status === 404) {
            console.error('Tip: Check if the model name and location are correct');
        }

        throw new Error(`Failed to generate embedding for ${imageUrl}: ${error.message}`);
    }
};

/**
 * Generate embeddings for multiple images in batch
 * @param imageUrls - Array of image URLs
 * @returns Promise<{ url: string, embedding: number[], error?: string }[]>
 */
export const generateBatchImageEmbeddings = async (
    imageUrls: string[]
): Promise<{ url: string, embedding?: number[], error?: string }[]> => {
    const results = await Promise.allSettled(
        imageUrls.map(async (url) => ({
            url,
            embedding: await generateImageEmbedding(url)
        }))
    );

    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            return {
                url: imageUrls[index],
                error: result.reason.message
            };
        }
    });
};