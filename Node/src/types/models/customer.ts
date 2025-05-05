import { Timestamp } from 'firebase-admin/firestore';
import { Address } from './common.js';

export interface Cart {
    subtotal: number;
    items: string[]; // non-submitted orders
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
    orders: string[]; // Submitted orders
    phoneNumber: string;
    username: string;
    wishlist: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;

    password?: string; // Optional for authentication purposes
}
