import { Address, FirestoreReference } from './common.js';
import { Order } from './order.js';
import { Product } from './product.js';

export interface Cart {
    subtotal: number;
    items: FirestoreReference<Order>[]; // non-submitted orders
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
    orders: FirestoreReference<Order>[]; // Submitted orders
    phoneNumber: string;
    username: string;
    wishlist: FirestoreReference<Product>[];
    // Optional field not in schema but likely needed for authentication
    password?: string;
    role?: string; // Optional field for role-based access control
}