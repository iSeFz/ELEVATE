import { Timestamp } from 'firebase-admin/firestore';
import { Address } from './common.js';
import { ProductVariant } from './product.js';

export interface Payment {
    dateCreated: Timestamp;
    method: string;
    price: number;
}

export interface Shipment {
    dateCreated: Timestamp;
    dateDelivery?: Timestamp;
    fees: number;
    method: string;
}

export interface Order {
    id?: string;
    address: Address;
    payment: Payment;
    phoneNumber: string;
    pointsRedeemed: number;
    price: number;
    selectedVariant: ProductVariant;
    quantity: number;
    status: string;
    shipment?: Shipment;

    createdAt: Timestamp;
    updatedAt: Timestamp;

    customerId?: string; // Denormalized for easier queries
    productId: string; // Denormalized for easier queries
}
