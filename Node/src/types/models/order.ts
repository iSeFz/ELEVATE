import { Timestamp } from 'firebase-admin/firestore';
import { Address, FirestoreReference } from './common.js';
import { Customer } from './customer.js';
import { ProductVariant } from './productVariant.js';

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
    customer: FirestoreReference<Customer>;
    // Denormalized field for authorization
    customerId?: string;
    dateCreated: Timestamp;
    payment: Payment;
    phoneNumber: string;
    pointsRedeemed: number;
    price: number;
    productVariant: FirestoreReference<ProductVariant>;
    quantity: number;
    shipment: Shipment;
    status: string;
}