import { Request, Response, NextFunction } from 'express';

export const validateImageSearchRequest = (req: Request, res: Response, next: NextFunction) => {
    const { imageUrl } = req.query;

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
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

    next();
};
