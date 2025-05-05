import { admin } from '../config/firebase.js';
import { Request } from 'express';

const firestore = admin.firestore();

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
 * Check if a user is authorized to access a specific order using denormalized fields
 */
export const checkOrderAuthorization = async (orderId: string, userId: string, userRole: string): Promise<boolean> => {
    // Admin and staff can access all orders
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    try {
        // Get the order
        const orderDoc = await firestore.collection('order').doc(orderId).get();
        if (!orderDoc.exists) {
            return false;
        }

        const orderData = orderDoc.data();
        if (!orderData) {
            return false;
        }

        if (orderData.customerId) {
            return orderData.customerId === userId;
        }

        return false;
    } catch (error) {
        console.error('Error checking order authorization:', error);
        return false;
    }
};

/**
 * Check if a user is authorized to access a specific review using denormalized fields
 */
export const checkReviewAuthorization = async (reviewId: string, userId: string, userRole: string): Promise<boolean> => {
    // Admin and staff can access all reviews
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    try {
        // Get the review
        const reviewDoc = await firestore.collection('review').doc(reviewId).get();
        if (!reviewDoc.exists) {
            return false;
        }

        const reviewData = reviewDoc.data();
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

/**
 * Check if a user is authorized to access a specific brand using denormalized fields
 */
export const checkBrandAuthorization = async (brandId: string, userId: string, userRole: string): Promise<boolean> => {
    // Admin and staff can access all brands
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    try {
        // Get the brand
        const brandDoc = await firestore.collection('brand').doc(brandId).get();
        if (!brandDoc.exists) {
            return false;
        }

        const brandData = brandDoc.data();
        if (!brandData) {
            return false;
        }

        if (brandData.brandOwnerId) {
            return brandData.brandOwnerId === userId;
        }

        return false;
    } catch (error) {
        console.error('Error checking brand authorization:', error);
        return false;
    }
};

/**
 * Check if a user is authorized to access/modify a specific product using denormalized fields
 */
export const checkProductAuthorization = async (productId: string, userId: string, userRole: string): Promise<boolean> => {
    // Admin and staff can access all products
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    try {
        // Get the product
        const productDoc = await firestore.collection('product').doc(productId).get();
        if (!productDoc.exists) {
            return false;
        }

        const productData = productDoc.data();
        if (!productData) {
            return false;
        }

        if (productData.brandOwnerId) {
            return productData.brandOwnerId === userId;
        }

        return false;
    } catch (error) {
        console.error('Error checking product authorization:', error);
        return false;
    }
};

/**
 * Check if a user is authorized to access a specific inventory using denormalized fields
 */
export const checkInventoryAuthorization = async (inventoryId: string, userId: string, userRole: string): Promise<boolean> => {
    // Admin and staff can access all inventories
    if (userRole === 'admin') {
        return true;
    }

    try {
        // Get the inventory
        const inventoryDoc = await firestore.collection('inventory').doc(inventoryId).get();
        if (!inventoryDoc.exists) {
            return false;
        }

        const inventoryData = inventoryDoc.data();
        if (!inventoryData) {
            return false;
        }

        // todo: check here
        if (inventoryData.ownerId) {
            return inventoryData.ownerId === userId;
        }

        // For staff, check if this is their assigned inventory
        if (userRole === 'staff') {
            // Check if any staff is associated with this inventory
            const staffSnapshot = await firestore.collection('staff')
                .where('inventoryId', '==', inventoryId)
                .get();

            if (staffSnapshot.empty) {
                return false;
            }

            // Check if this staff member is associated with the inventory
            let isAuthorized = false;
            staffSnapshot.forEach(doc => {
                if (doc.id === userId) {
                    isAuthorized = true;
                }
            });

            return isAuthorized;
        }

        return false;
    } catch (error) {
        console.error('Error checking inventory authorization:', error);
        return false;
    }
};

/**
 * Check if a user is authorized to access a brand owner profile
 * Brand owners can only access their own profile, while admin and staff can access any profile
 */
export const checkBrandOwnerProfileAuthorization = async (brandOwnerId: string, userId: string, userRole: string): Promise<boolean> => {
    // Admin and staff can access all brand owner profiles
    if (userRole === 'admin' || userRole === 'staff') {
        return true;
    }

    // Brand owners can only access their own profile
    if (userRole === 'brandOwner') {
        return brandOwnerId === userId;
    }

    return false;
};

/**
 * Helper function to extract resource owner ID from request parameters
 * Used with the authorizeOwner middleware
 */
export const extractOrderOwnerId = async (req: Request): Promise<string | null> => {
    const orderId = req.params.id;
    if (!orderId) return null;

    // Get order to check the customer ID
    const orderDoc = await firestore.collection('order').doc(orderId).get();
    if (!orderDoc.exists) return null;

    const orderData = orderDoc.data();
    if (!orderData) return null;

    if (orderData.customerId) {
        return orderData.customerId;
    }

    return null;
};

/**
 * Helper function to extract review owner ID from request parameters
 */
export const extractReviewOwnerId = async (req: Request): Promise<string | null> => {
    const reviewId = req.params.id;
    if (!reviewId) return null;

    // Get review to check the customer ID
    const reviewDoc = await firestore.collection('review').doc(reviewId).get();
    if (!reviewDoc.exists) return null;

    const reviewData = reviewDoc.data();
    if (!reviewData) return null;

    if (reviewData.customerId) {
        return reviewData.customerId;
    }

    return null;
};

/**
 * Helper function to extract brand owner ID from request parameters
 */
export const extractBrandOwnerId = async (req: Request): Promise<string | null> => {
    const brandId = req.params.id;
    if (!brandId) return null;

    // Get brand to check the owner ID
    const brandDoc = await firestore.collection('brand').doc(brandId).get();
    if (!brandDoc.exists) return null;

    const brandData = brandDoc.data();
    if (!brandData) return null;

    if (brandData.brandOwnerId) {
        return brandData.brandOwnerId;
    }

    return null;
};

/**
 * Helper function to extract product owner ID from request parameters
 */
export const extractProductOwnerId = async (req: Request): Promise<string | null> => {
    const productId = req.params.id;
    if (!productId) return null;

    // Get product to check the brand owner ID
    const productDoc = await firestore.collection('product').doc(productId).get();
    if (!productDoc.exists) return null;

    const productData = productDoc.data();
    if (!productData) return null;

    if (productData.brandOwnerId) {
        return productData.brandOwnerId;
    }

    // Fallback to brand reference
    if (productData.brand) {
        const brandDoc = await productData.brand.get();
        if (!brandDoc.exists) return null;

        const brandData = brandDoc.data();
        if (!brandData?.brandOwner) return null;

        return brandData.brandOwner.id;
    }

    return null;
};