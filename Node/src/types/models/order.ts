import { Timestamp } from 'firebase-admin/firestore';
import { Address } from './common.js';

export interface Payment {
    createdAt: Timestamp;
    method: string;
    price: number;
}

export interface Shipment {
    createdAt: Timestamp;
    deliveredAt?: Timestamp;
    fees: number;
    method: string;
    trackingNumber?: string;
    carrier?: string;
}

export enum OrderStatus {
    PENDING = 'Pending',
    PROCESSING = 'Processing',
    SHIPPED = 'Shipped',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
    REFUNDED = 'Refunded'
}

export interface Order {
    id?: string;
    customerId: string;

    address: Address;
    payment: Payment;
    phoneNumber: string;
    pointsRedeemed: number;
    price: number;
    status: OrderStatus;
    shipment?: Shipment;

    createdAt: Timestamp;
    updatedAt: Timestamp;

    products: {
        variantId: string; // Selected variant of the product in the order
        productId: string; // ID of the product in the order
        quantity: number; // Quantity of the product in the order
        // Denormalized data to avoid extra queries
        name: string;        // Product name at time of order
        size: string;        // Variant size
        color: string;       // Selected color
        price: number;       // Price at time of order (after discounts)
        imageURL?: string;   // Product image for order display
    }[];
}
