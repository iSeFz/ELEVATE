import { Role } from '../config/roles.js';
import { getReview } from './review.js';
import { getProduct } from './product.js';

/**
 * Authorization service that uses denormalized fields for efficient authorization checks
 */

// Error type for authorization failures
export class AuthorizationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 403) {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = statusCode;
    }
}

/**
 * Check if a user is authorized to access a specific review using denormalized fields
 */
export const checkReviewAuthorization = async (reviewId: string, userId: string, userRole: Role): Promise<boolean> => {
    // Admin can access all reviews
    if (userRole === 'admin') {
        return true;
    }

    try {
        const reviewData = await getReview(reviewId);
        if (!reviewData) {
            return false;
        }

        if (reviewData.customerId) {
            return reviewData.customerId === userId;
        }

        return false;
    } catch (error) {
        console.error('Error checking review authorization:', error);
        return false;
    }
};
