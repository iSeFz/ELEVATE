import { Timestamp } from 'firebase-admin/firestore';
import { Address } from './common.js';

export interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
    // denormalized data to avoid extra queries
    brandName: string; // Brand name for quick display
    productName: string;  // Product name for quick display
    size: string;   // Variant size
    color: string;  // Selected color
    price: number;  // Price at the time of adding to cart
    imageURL?: string; // Product image for quick display
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    updatedAt: Timestamp;
}

export interface WishlistItem {
    productId: string;
    addedAt: Timestamp;
    // Denormalized fields for display without additional queries
    brandName: string; // Brand name for quick display
    name: string;       // Product name for quick display
    imageURL: string; // Product image for quick display
    price: number; // Price at the time of adding to wishlist
}

export interface Customer {
    id?: string;
    address: Address;
    cart: Cart;
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    loyaltyPoints: number;
    orders: {
        total: number; // Total number of orders
        items: string[]; // Array of order IDs
    }
    phoneNumber: string;
    username: string;
    wishlist: WishlistItem[];

    createdAt: Timestamp;
    updatedAt: Timestamp;

    password?: string; // Optional for authentication purposes
}
