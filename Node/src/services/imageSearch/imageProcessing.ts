import axios from 'axios'; // For downloading images
import sharp from 'sharp'; // For image processing

const MAX_IMAGE_SIZE_MB = 0.4; // Maximum image size in MB
const MAX_IMAGE_DIMENSION = 1024; // Maximum width or height in pixels
const JPEG_QUALITY = 80; // JPEG compression quality (1-100)

/**
 * Detects MIME type from image buffer based on file signature
 * @param {Buffer} buffer - The image buffer
 * @returns {string} The MIME type
 */
function detectImageMimeType(buffer: Buffer) {
    if (buffer.length < 4) return 'image/png'; // Default fallback

    // Check for PNG signature
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return 'image/png';
    }

    // Check for JPEG signature
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'image/jpeg';
    }

    // Check for WebP signature
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }

    // Check for GIF signature
    if (buffer.toString('ascii', 0, 3) === 'GIF') {
        return 'image/gif';
    }

    return 'image/png'; // Default fallback
}

/**
 * Resizes an image if it's too large, while preserving aspect ratio
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {string} mimeType - The MIME type of the image
 * @returns {Promise<{buffer: Buffer, mimeType: string}>} Resized image buffer and updated MIME type
 */
async function resizeImageIfNeeded(imageBuffer: Buffer, mimeType: string) {
    const originalSizeMB = imageBuffer.length / (1024 * 1024);

    console.log(`Original image size: ${originalSizeMB.toFixed(2)} MB`);

    // If image is small enough, return as-is
    if (originalSizeMB <= MAX_IMAGE_SIZE_MB) {
        console.log('Image size is acceptable, no resizing needed');
        return { buffer: imageBuffer, mimeType };
    }

    try {
        console.log('Image is too large, resizing...');

        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

        // Calculate new dimensions while preserving aspect ratio
        let newWidth = metadata.width;
        let newHeight = metadata.height;

        // Scale down if either dimension is too large
        if (newWidth > MAX_IMAGE_DIMENSION || newHeight > MAX_IMAGE_DIMENSION) {
            const aspectRatio = newWidth / newHeight;

            if (newWidth > newHeight) {
                newWidth = MAX_IMAGE_DIMENSION;
                newHeight = Math.round(MAX_IMAGE_DIMENSION / aspectRatio);
            } else {
                newHeight = MAX_IMAGE_DIMENSION;
                newWidth = Math.round(MAX_IMAGE_DIMENSION * aspectRatio);
            }
        }

        console.log(`Target dimensions: ${newWidth}x${newHeight}`);

        // Resize the image
        let processedImage = sharp(imageBuffer)
            .resize(newWidth, newHeight, {
                fit: 'inside', // Ensure image fits within dimensions
                withoutEnlargement: true // Don't enlarge smaller images
            });

        // Choose output format based on original type and optimization needs
        let outputMimeType = mimeType;
        let outputBuffer;

        if (mimeType === 'image/png') {
            // For PNG, try to optimize but keep as PNG if transparency is important
            outputBuffer = await processedImage
                .png({
                    compressionLevel: 9, // Maximum compression
                    quality: 90
                })
                .toBuffer();

            // If still too large, convert to JPEG (loses transparency)
            const pngSizeMB = outputBuffer.length / (1024 * 1024);
            if (pngSizeMB > MAX_IMAGE_SIZE_MB) {
                console.log('PNG still too large, converting to JPEG...');
                outputBuffer = await sharp(imageBuffer)
                    .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: JPEG_QUALITY })
                    .toBuffer();
                outputMimeType = 'image/jpeg';
            }
        } else if (mimeType === 'image/webp') {
            outputBuffer = await processedImage
                .webp({ quality: JPEG_QUALITY })
                .toBuffer();
        } else {
            // For JPEG and other formats, use JPEG output
            outputBuffer = await processedImage
                .jpeg({ quality: JPEG_QUALITY })
                .toBuffer();
            outputMimeType = 'image/jpeg';
        }

        const newSizeMB = outputBuffer.length / (1024 * 1024);
        console.log(`Resized image size: ${newSizeMB.toFixed(2)} MB`);
        console.log(`Size reduction: ${((originalSizeMB - newSizeMB) / originalSizeMB * 100).toFixed(1)}%`);

        // If still too large, apply more aggressive compression
        if (newSizeMB > MAX_IMAGE_SIZE_MB) {
            console.log('Applying more aggressive compression...');

            // Calculate scaling factor based on file size
            const scaleFactor = Math.sqrt(MAX_IMAGE_SIZE_MB / newSizeMB) * 0.9; // 0.9 for safety margin
            const finalWidth = Math.round(newWidth * scaleFactor);
            const finalHeight = Math.round(newHeight * scaleFactor);

            console.log(`Final dimensions: ${finalWidth}x${finalHeight}`);

            outputBuffer = await sharp(imageBuffer)
                .resize(finalWidth, finalHeight, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: Math.max(60, JPEG_QUALITY - 20) }) // Lower quality if needed
                .toBuffer();

            outputMimeType = 'image/jpeg';
            const finalSizeMB = outputBuffer.length / (1024 * 1024);
            console.log(`Final image size: ${finalSizeMB.toFixed(2)} MB`);
        }

        return { buffer: outputBuffer, mimeType: outputMimeType };

    } catch (error: any) {
        console.error('Error resizing image:', error.message);
        console.log('Falling back to original image...');
        return { buffer: imageBuffer, mimeType };
    }
}

/**
 * Downloads an image from a URL and returns it as a Buffer with optional resizing.
 * @param {string} imageUrl - The URL of the image.
 * @param {boolean} enableResize - Whether to resize large images (default: true)
 * @returns {Promise<{buffer: Buffer, mimeType: string}>} A Promise that resolves with the image buffer and MIME type.
 */
export async function downloadImageAsBuffer(imageUrl: string, enableResize = true) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Short delay to avoid rate limiting
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000 // 30 seconds timeout
        });

        let imageBuffer = Buffer.from(response.data);
        let mimeType = detectImageMimeType(imageBuffer);

        console.log(`Downloaded image successfully, size: ${imageBuffer.length} bytes`);
        console.log(`Detected MIME type: ${mimeType}`);

        // Resize if enabled and needed
        if (enableResize) {
            const resizeResult = await resizeImageIfNeeded(imageBuffer, mimeType);
            imageBuffer = resizeResult.buffer;
            mimeType = resizeResult.mimeType;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        return { buffer: imageBuffer, mimeType };

    } catch (error: any) {
        console.error(`Error downloading image from ${imageUrl}:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return downloadImageAsBuffer(imageUrl);
    }
}
