import { Timestamp } from 'firebase-admin/firestore';
import { Address, addressDataValidators, commonDataValidators, TimestampUnion } from './common.js';

export interface Payment {
    createdAt: TimestampUnion;
    method: string;
    price: number;
}

export interface Shipment {
    createdAt: TimestampUnion;
    deliveredAt?: TimestampUnion;
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

export interface OrderProduct {
    variantId: string; // Selected variant of the product in the order
    productId: string; // ID of the product in the order
    quantity: number; // Quantity of the product in the order
    // Denormalized data to avoid extra queries
    name: string;        // Product name at time of order
    size: string;        // Variant size
    color: string;       // Selected color
    price: number;       // Price at time of order (after discounts)
    imageURL?: string;   // Product image for order display
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
    shipment: Shipment;

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;

    products: OrderProduct[];
}

export const paymentDataValidators = (value: Payment): boolean => {
    const validators: Record<keyof Payment, (value: any) => boolean> = {
        createdAt: (v: Payment['createdAt']) => v instanceof Timestamp,
        method: (v: Payment['method']) => typeof v === 'string',
        price: (v: Payment['price']) => typeof v === 'number',
    }
    return commonDataValidators<Payment>(value, validators);
}

export const shipmentDataValidators = (value: Shipment): boolean => {
    const validators: Record<keyof Shipment, (value: any) => boolean> = {
        createdAt: (v: Shipment['createdAt']) => v instanceof Timestamp,
        deliveredAt: (v: Shipment['deliveredAt']) => v instanceof Timestamp || v === undefined,
        fees: (v: Shipment['fees']) => typeof v === 'number',
        method: (v: Shipment['method']) => typeof v === 'string',
        trackingNumber: (v: Shipment['trackingNumber']) => typeof v === 'string' || v === undefined,
        carrier: (v: Shipment['carrier']) => typeof v === 'string' || v === undefined,
    }
    return commonDataValidators<Shipment>(value, validators);
}

export const orderProductDataValidators = (value: OrderProduct): boolean => {
    const validators: Record<keyof OrderProduct, (value: any) => boolean> = {
        variantId: (v: OrderProduct['variantId']) => typeof v === 'string',
        productId: (v: OrderProduct['productId']) => typeof v === 'string',
        quantity: (v: OrderProduct['quantity']) => typeof v === 'number',
        name: (v: OrderProduct['name']) => typeof v === 'string',
        size: (v: OrderProduct['size']) => typeof v === 'string',
        color: (v: OrderProduct['color']) => typeof v === 'string',
        price: (v: OrderProduct['price']) => typeof v === 'number',
        imageURL: (v: OrderProduct['imageURL']) => typeof v === 'string' || v === undefined,
    }
    return commonDataValidators<OrderProduct>(value, validators);
}

export const orderDataValidators = (value: Order): boolean => {
    const validators: Record<keyof Order, (value: any) => boolean> = {
        id: (v: Order['id']) => typeof v === 'string' || v === undefined,
        customerId: (v: Order['customerId']) => typeof v === 'string',
        address: (v: Order['address']) => addressDataValidators(v),
        payment: (v: Order['payment']) => paymentDataValidators(v),
        phoneNumber: (v: Order['phoneNumber']) => typeof v === 'string',
        pointsRedeemed: (v: Order['pointsRedeemed']) => typeof v === 'number',
        price: (v: Order['price']) => typeof v === 'number',
        status: (v: Order['status']) => Object.values(OrderStatus).includes(v),
        shipment: (v: Order['shipment']) => shipmentDataValidators(v),
        createdAt: (v: Order['createdAt']) => v instanceof Timestamp,
        updatedAt: (v: Order['updatedAt']) => v instanceof Timestamp,
        products: (v: Order['products']) => Array.isArray(v) && v.every(product => orderProductDataValidators(product)),
    }
    return commonDataValidators<Order>(value, validators);
}
