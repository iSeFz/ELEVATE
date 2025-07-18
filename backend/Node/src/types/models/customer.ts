import { Timestamp } from 'firebase-admin/firestore';
import { Address, addressDataValidators, commonDataValidators, TimestampUnion } from './common.js';

export interface CartItem {
    id?: string; // Optional ID for the item, useful for updates
    productId: string;
    variantId: string;
    quantity: number; // The amount the user wants to add
    // denormalized data to avoid extra queries
    brandName: string; // Brand name for quick display
    productName: string;  // Product name for quick display
    size: string;   // Variant size
    colors: string[];  // variant colors
    price: number;  // Price at the time of adding to cart
    imageURL: string; // Product image for quick display
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    updatedAt: TimestampUnion;
}

export interface WishlistItem {
    productId: string;
    addedAt: TimestampUnion;
    // Denormalized fields for display without additional queries
    brandName: string; // Brand name for quick display
    name: string;       // Product name for quick display
    imageURL: string; // Product image for quick display
    price: number; // Price at the time of adding to wishlist
}

export interface Customer {
    id?: string;
    addresses: Address[];
    cart: Cart;
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    loyaltyPoints: number;
    phoneNumber: string;
    username: string;
    wishlist: WishlistItem[];

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;

    fcmToken?: string; // Optional for push notifications
    password?: string; // Optional for authentication purposes
}
