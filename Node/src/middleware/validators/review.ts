import { Request, Response, NextFunction } from 'express';
import { validateObjectStructure } from './common.js';
import { Review, reviewDataValidators } from '../../types/models/review.js';

const expectedAddReviewData: Partial<Review> = {
    title: "String",
    content: "String",
    rating: 1,
};
/**
 * Required data:
 * - title: String - Title of the review
 * - content: String - Content of the review
 * - rating: Number - Rating given by the customer (1-5)
 */
export const validateAddReview = (req: Request, res: Response, next: NextFunction) => {
    if (!validateObjectStructure(req.body, expectedAddReviewData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedAddReviewData
        });
    }
    const isReviewValid = reviewDataValidators(req.body as Review);
    if (!isReviewValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid review types.',
            expectedFormat: expectedAddReviewData
        });
    }

    next();
};

const expectedUpdateReviewData: Partial<Review> = {
    title: "String",
    content: "String",
    rating: 0,
};
/**
 * Data that can be updated:
 * - title: String - Title of the review
 * - content: String - Content of the review
 * - rating: Number - Rating given by the customer (1-5)
 */
export const validateUpdateReview = (req: Request, res: Response, next: NextFunction) => {
    if (!validateObjectStructure(req.body, expectedAddReviewData, "partially")) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format (Any of the fields can be updated)',
            expectedFormat: expectedAddReviewData
        });
    }
    const isReviewValid = reviewDataValidators(req.body as Review);
    if (!isReviewValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid review types.',
            expectedFormat: expectedAddReviewData
        });
    }

    next();
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
