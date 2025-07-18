import { Request, Response } from 'express';
import * as reviewService from '../services/review.js';
import * as productService from '../services/product.js';
import * as customerService from '../services/customer.js';
import * as orderService from '../services/order.js';
import { Review } from '../types/models/review.js';

export const getAllReviewsOfProduct = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const productID = req.params.productId;
        if (!productID) {
            return res.status(400).json({ status: 'error', message: 'Product ID parameter is required' });
        }
        const results = await reviewService.getAllReviewsOfProduct(productID, page);
        return res.status(200).json({ status: 'success', data: results.reviews, pagination: results.pagination });
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

export const addReview = async (req: Request, res: Response) => {
    try {
        const reviewData = req.body as Review;
        const userId = req.user?.id as string;
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({ status: 'error', message: 'Product ID parameter is required' });
        }

        const product = await productService.getProduct(productId);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }

        const customer = await customerService.getCustomer(userId);
        if (!customer) {
            return res.status(404).json({ status: 'error', message: 'Customer not found' });
        }

        // Check if customer has ordered this product
        const hasOrderedProduct = await orderService.hasCustomerOrderedProduct(userId, productId);
        if (!hasOrderedProduct) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only review products that you have ordered and received'
            });
        }

        const existingReview = await reviewService.hasCustomerReviewedProduct(userId, productId);
        if (existingReview) {
            return res.status(400).json({ status: 'error', message: 'You have already reviewed this product' });
        }

        reviewData.customerId = userId;
        reviewData.productId = productId;
        reviewData.customerFirstName = customer.firstName;
        reviewData.customerLastName = customer.lastName;
        reviewData.customerImageURL = customer.imageURL;

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
