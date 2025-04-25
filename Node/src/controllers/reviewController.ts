import { Request, Response } from 'express';
import * as reviewService from '../services/review.js';
import * as productService from '../services/product.js';
import { Review } from '../types/models/review.js';
import { Timestamp } from 'firebase-admin/firestore';
import { FirestoreReference } from '../types/models/common.js';

export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await reviewService.getAllReviews();
        return res.status(200).json({ status: 'success', data: reviews });
    } catch (error: any) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getReview = async (req: Request, res: Response) => {
    try {
        const reviewID = req.params.id;
        const review = await reviewService.getReview(reviewID);

        if (!review) {
            return res.status(404).json({ status: 'error', message: 'Review not found' });
        }

        return res.status(200).json({ status: 'success', data: review });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getReviewsByProduct = async (req: Request, res: Response) => {
    try {
        const productID = req.query.productId as string;

        if (!productID) {
            return res.status(400).json({ status: 'error', message: 'Product ID parameter is required' });
        }

        const reviews = await reviewService.getReviewsByProduct(productID);
        return res.status(200).json({ status: 'success', data: reviews });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getReviewsByCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.query.customerId as string;

        if (!customerID) {
            return res.status(400).json({ status: 'error', message: 'Customer ID parameter is required' });
        }

        const reviews = await reviewService.getReviewsByCustomer(customerID);
        return res.status(200).json({ status: 'success', data: reviews });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const addReview = async (req: Request, res: Response) => {
    try {
        const { productId, ...reviewData } = req.body;

        if (!productId) {
            return res.status(400).json({ status: 'error', message: 'Product ID is required' });
        }

        // Set creation date if not provided
        reviewData.dateCreated ??= Timestamp.now();

        const review: Review = reviewData;
        const newReview = await reviewService.addReview(review);

        // Update product's review data
        const product = await productService.getProduct(productId);
        if (product) {
            // Add review reference to product
            const updatedReviews = [...(product.reviews || []), newReview.id] as FirestoreReference<Review>[];;

            // Calculate new average
            const currentTotal = product.averageRating * product.totalReviews;
            const newTotal = currentTotal + review.rating;
            const newCount = product.totalReviews + 1;
            const newAverage = newTotal / newCount;

            // Update product
            await productService.updateProduct(productId, {
                reviews: updatedReviews,
                totalReviews: newCount,
                averageRating: newAverage
            });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Review added successfully',
            data: newReview
        });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const reviewID = req.params.id;
        const { productId, ...reviewData } = req.body;
        const newReviewData = sanitizeReviewData(reviewData);

        // Check if review exists first
        const existingReview = await reviewService.getReview(reviewID);
        if (!existingReview) {
            return res.status(404).json({ status: 'error', message: 'Review not found' });
        }

        await reviewService.updateReview(reviewID, newReviewData);

        // If rating changed and productId is provided, update product's average rating
        if (productId && newReviewData.rating && newReviewData.rating !== existingReview.rating) {
            const product = await productService.getProduct(productId);

            if (product) {
                // Calculate new average
                const currentTotal = product.averageRating * product.totalReviews;
                const adjustedTotal = currentTotal - existingReview.rating + newReviewData.rating;
                const newAverage = adjustedTotal / product.totalReviews;

                // Update product
                await productService.updateProduct(productId, {
                    averageRating: newAverage
                });
            }
        }

        return res.status(200).json({ status: 'success', message: 'Review updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const reviewID = req.params.id;
        const productId = req.query.productId as string;

        // Check if review exists first
        const existingReview = await reviewService.getReview(reviewID);
        if (!existingReview) {
            return res.status(404).json({ status: 'error', message: 'Review not found' });
        }

        await reviewService.deleteReview(reviewID);

        // If productId is provided, update product's reviews and rating
        if (productId) {
            const product = await productService.getProduct(productId);

            if (product) {
                // Remove review reference from product
                const updatedReviews = product.reviews.filter(
                    (rev) => rev.id !== reviewID
                );

                // Calculate new average (handle case where this was the only review)
                let newAverage = 0;
                if (product.totalReviews > 1) {
                    const currentTotal = product.averageRating * product.totalReviews;
                    const adjustedTotal = currentTotal - existingReview.rating;
                    const newCount = product.totalReviews - 1;
                    newAverage = adjustedTotal / newCount;
                }

                // Update product
                await productService.updateProduct(productId, {
                    reviews: updatedReviews,
                    totalReviews: Math.max(0, product.totalReviews - 1),
                    averageRating: newAverage
                });
            }
        }

        return res.status(200).json({ status: 'success', message: 'Review deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Helper function to sanitize review data
const sanitizeReviewData = (newData: any): Partial<Review> => {
    // List of allowed review fields based on our Review type
    const allowedFields = [
        'content', 'customer', 'dateCreated', 'rating'
    ];

    const sanitizedData: Partial<Review> = {};

    for (const key in newData) {
        if (allowedFields.includes(key)) {
            sanitizedData[key as keyof Review] = newData[key];
        }
    }

    return sanitizedData;
};