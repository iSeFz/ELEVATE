import { Request, Response, NextFunction } from 'express';

export const validateImageSearchRequest = (req: Request, res: Response, next: NextFunction) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({
            success: false,
            message: 'Image URL is required'
        });
    }

    // Basic URL validation
    try {
        new URL(imageUrl);
    } catch (error) {
        console.error('Error validating image URL:', error);
        return res.status(400).json({
            success: false,
            message: 'Invalid image URL format',
            error: error instanceof Error ? error.message : String(error)
        });
    }

    // Check if it's likely an image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext =>
        imageUrl.toLowerCase().includes(ext)
    );

    if (!hasImageExtension && !imageUrl.includes('image') && !imageUrl.includes('photo')) {
        return res.status(400).json({
            success: false,
            message: 'URL does not appear to be an image'
        });
    }

    next();
};
