import { Request, Response } from 'express';
import * as reviewService from '../services/review.js';
import { Review } from '../types/models/review.js';

export const getAllReviews = async (req: Request, res: Response) => {
    // This route is already protected by the authorize middleware in the router
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
        
        // Authorization check is now handled by middleware

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
        const requestingUserID = req.user?.id;
        const userRole = req.user?.role;
        
        // For regular users, only allow access to their own reviews
        if (userRole !== 'admin' && userRole !== 'staff') {
            const reviews = await reviewService.getReviewsByCustomer(requestingUserID!);
            return res.status(200).json({ status: 'success', data: reviews });
        }
        
        // Admin/staff can access any customer's reviews
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
        const reviewData = req.body as Review;
        const userId = req.user?.id as string;

        reviewData.customerId = userId;

        const newReview = await reviewService.addReview(reviewData);

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
        const reviewData = req.body as Partial<Review>;

        await reviewService.updateReview(reviewID, reviewData);
        
        return res.status(200).json({ status: 'success', message: 'Review updated successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const reviewID = req.params.id;

        await reviewService.deleteReview(reviewID);

        return res.status(200).json({ status: 'success', message: 'Review deleted successfully' });
    } catch (error: any) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
