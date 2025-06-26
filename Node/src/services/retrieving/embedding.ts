import { VertexAI } from '@google-cloud/vertexai';
import axios from 'axios';
import { GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_PROJECT_ID, SERIVE_ACCOUNT_KEY } from '../../config/vertexAI.js';
import { PredictionServiceClient } from '@google-cloud/aiplatform';


// Initialize Vertex AI
const vertex_ai = new VertexAI({
    project: "elevate-fcai-cu",
    location: "europe-west1",
    googleAuthOptions: {
        credentials: SERIVE_ACCOUNT_KEY,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    },
});

const model = 'multimodalembedding@001';


/**
 * Generate embedding vector for an image URL
 * @param imageUrl - URL of the image to embed
 * @returns Promise<number[]> - The embedding vector
 */
export const generateImageEmbedding = async (imageUrl: string): Promise<number[]> => {
    try {
        // Download image and convert to base64
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000 // 30 seconds timeout
        });
        console.error(`Image downloaded successfully from ${imageUrl}`);

        const imageBuffer = Buffer.from(response.data);
        const base64Image = imageBuffer.toString('base64');
        console.log(`Image converted to base64 successfully, length: ${base64Image.slice(0, 20)}...`);
        const mimeType = response.headers['content-type'] ?? 'image/jpeg';

        // Generate embedding using Vertex AI
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: model,
        });

        const request = {
            contents: [{
                role: 'user',
                parts: [{
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image,
                    }
                }]
            }],
        };

        const embedding_response = await generativeModel.generateContent(request);

        // Extract embedding from response
        // Note: The actual response structure may vary, adjust based on API response
        const candidates = embedding_response?.response?.candidates;
        const parts = candidates?.[0]?.content?.parts;
        const functionCall = parts?.[0]?.functionCall;
        const args = functionCall && functionCall.args as { embedding?: number[] };

        const embedding = args?.embedding;

        if (!embedding || !Array.isArray(embedding)) {
            throw new Error('Failed to generate embedding: Invalid response format');
        }


        return embedding;
    } catch (error: any) {
        console.error('Error generating image embedding:', error);
        throw new Error(`Failed to generate image embedding: ${error.message}`);
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