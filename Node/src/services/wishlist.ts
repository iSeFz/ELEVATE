import { admin } from '../config/firebase.js';
import { Customer, WishlistItem } from '../types/models/customer.js';
import { Product } from '../types/models/product.js';

const firestore = admin.firestore();
const customerCollection = 'customer';

export const getWishlist = async (customerId: string, page = 1) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    const limit = 10; // Fixed limit of 10 items per page
    const offset = (page - 1) * limit;

    try {
        const customerDoc = await firestore.collection(customerCollection).doc(customerId).get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const wishlistItems = customerData.wishlist || [];

        // Paginate the wishlist items
        const paginatedItems = wishlistItems.slice(offset, offset + limit);

        // Check if there's a next page
        const hasNextPage = wishlistItems.length > offset + limit;

        return {
            items: paginatedItems,
            pagination: {
                page,
                limit,
                hasNextPage
            }
        };
    } catch (error: any) {
        throw new Error(`Failed to get wishlist: ${error.message}`);
    }
};

export const addToWishlist = async (customerId: string, productId: string) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    if (!productId) {
        throw new Error('Product ID is required');
    }

    try {
        // Get customer document to access the current wishlist
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const currentWishlist = customerData.wishlist || [];

        // Check if the product is already in the wishlist
        const existingItemIndex = currentWishlist.findIndex(
            item => item.productId === productId
        );

        if (existingItemIndex >= 0) {
            // Product already in wishlist, no need to add again
            return currentWishlist;
        }

        // Fetch product details to ensure it exists and to get current data
        const productRef = firestore.collection('product').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            throw new Error(`Product not found, product ID: ${productId}`);
        }

        const product = productDoc.data() as Product;

        // Create new wishlist item
        const newWishlistItem: WishlistItem = {
            productId: productId,
            addedAt: admin.firestore.Timestamp.now(),
            brandName: product.brandName,
            name: product.name,
            imageURL: product.variants[0]?.images[0] || '',
            price: product.variants[0]?.price ?? 0,
        };

        // Add to wishlist
        const updatedWishlist = [newWishlistItem, ...currentWishlist];

        // Update customer document
        await customerRef.update({
            wishlist: updatedWishlist,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return updatedWishlist;
    } catch (error: any) {
        throw new Error(`Failed to add item to wishlist: ${error.message}`);
    }
};

export const removeFromWishlist = async (customerId: string, productId: string) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    if (!productId) {
        throw new Error('Product ID is required');
    }

    try {
        // Get customer document to access the current wishlist
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const currentWishlist = customerData.wishlist || [];

        // Filter out the product
        const updatedWishlist = currentWishlist.filter(item => item.productId !== productId);

        // Check if the product was found and removed
        if (updatedWishlist.length === currentWishlist.length) {
            throw new Error(`Product not found in wishlist, product ID: ${productId}`);
        }

        // Update customer document
        await customerRef.update({
            wishlist: updatedWishlist,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return updatedWishlist;
    } catch (error: any) {
        throw new Error(`Failed to remove item from wishlist: ${error.message}`);
    }
};

export const clearWishlist = async (customerId: string) => {
    if (!customerId) {
        throw new Error('Please provide a customer ID');
    }

    try {
        const customerRef = firestore.collection(customerCollection).doc(customerId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        // Create empty wishlist
        const emptyWishlist: WishlistItem[] = [];

        // Update customer document
        await customerRef.update({
            wishlist: emptyWishlist,
            updatedAt: admin.firestore.Timestamp.now()
        });

        return emptyWishlist;
    } catch (error: any) {
        throw new Error(`Failed to clear wishlist: ${error.message}`);
    }
};