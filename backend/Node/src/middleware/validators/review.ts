import { Request, Response, NextFunction } from 'express';
import { createSchemaBuilder, extractSchemaFieldsMiddleware, validateObjectStrict } from './builder.js';
import { Review } from '../../types/models/review.js';

const expectedAddReviewData = createSchemaBuilder<Review>()
    .field('title', { type: 'string', required: true, minLength: 1, maxLength: 100 })
    .field('content', { type: 'string', required: true, minLength: 1, maxLength: 500 })
    .field('rating', { type: 'number', required: true, minValue: 1, maxValue: 5, value: 5 })
    .build();
export const validateAddReview = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedAddReviewData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedAddReviewData)(req, res, next);
};

const expectedUpdateReviewData = createSchemaBuilder<Review>()
    .field('title', { type: 'string', required: false, minLength: 1, maxLength: 100 })
    .field('content', { type: 'string', required: false, minLength: 1, maxLength: 500 })
    .field('rating', { type: 'number', required: false, minValue: 1, maxValue: 5, value: 5 })
    .build();
export const validateUpdateReview = (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const result = validateObjectStrict(data, expectedUpdateReviewData);

    if (result.isValid === false) {
        return res.status(400).json({
            status: 'error',
            ...result
        });
    }

    extractSchemaFieldsMiddleware(expectedUpdateReviewData)(req, res, next);
};

export const validateDeleteReview = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Please provide a review ID'
        });
    }

    next();
}
