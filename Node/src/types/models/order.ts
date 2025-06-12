import { Timestamp } from 'firebase-admin/firestore';
import { Address, addressDataValidators, commonDataValidators, TimestampUnion } from './common.js';

export interface Payment {
    method: string;
    credentials: string;
}

export interface BreakDownFee {
    brandId: string;
    brandName: string;
    distance: number;
    nearestBranch: Address;
    fee: number;
}

export interface Shipment {
    createdAt: TimestampUnion;
    deliveredAt?: TimestampUnion;
    totalFees: number;
    breakdown: BreakDownFee[];
    estimatedDeliveryDays: number;
    method: string;
    trackingNumber: string;
    carrier: string;
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
    quantity: number;  // Quantity of the product in the order
    // Denormalized data to avoid extra queries
    brandId: string; // Brand ID for quick access
    brandName: string; // Brand name for quick display
    productName: string;  // Product name for quick display
    size: string;        // Variant size
    colors: string[];     // Variant Colors
    price: number;       // Variant Price at time of order (after discounts)
    imageURL?: string;   // Variant Product image for order display
}

export interface Order {
    id?: string;
    customerId: string;

    address: Address;
    payment: Payment;
    phoneNumber: string;
    pointsRedeemed: number;
    pointsEarned: number;
    price: number;
    status: OrderStatus;
    shipment: Shipment;
    products: OrderProduct[];
    brandIds: string[]; // List of brand IDs associated with the order

    createdAt: TimestampUnion;
    updatedAt: TimestampUnion;
}

export const paymentDataValidators = (value: Payment): boolean => {
    const validators: Record<keyof Payment, (value: any) => boolean> = {
        method: (v: Payment['method']) => typeof v === 'string',
        credentials: (v: Payment['credentials']) => typeof v === 'string' || v === undefined,
    }
    return commonDataValidators<Payment>(value, validators);
}

export const breakDownFeesDataValidators = (value: BreakDownFee): boolean => {
    if (!value || typeof value !== 'object') {
        return false; // Ensure value is an object
    }
    const validators: Record<keyof BreakDownFee, (value: any) => boolean> = {
        brandId: (v: BreakDownFee['brandId']) => typeof v === 'string',
        brandName: (v: BreakDownFee['brandName']) => typeof v === 'string',
        distance: (v: BreakDownFee['distance']) => typeof v === 'number',
        nearestBranch: (v: BreakDownFee['nearestBranch']) => addressDataValidators(v),
        fee: (v: BreakDownFee['fee']) => typeof v === 'number',
    }
    return commonDataValidators<BreakDownFee>(value, validators);
}

export const shipmentDataValidators = (value: Shipment): boolean => {
    const validators: Record<keyof Shipment, (value: any) => boolean> = {
        createdAt: (v: Shipment['createdAt']) => v instanceof Timestamp,
        deliveredAt: (v: Shipment['deliveredAt']) => v instanceof Timestamp || v === undefined,
        totalFees: (v: Shipment['totalFees']) => typeof v === 'number',
        breakdown: (v: Shipment['breakdown']) => Array.isArray(v) && v.every(fee => breakDownFeesDataValidators(fee)),
        estimatedDeliveryDays: (v: Shipment['estimatedDeliveryDays']) => typeof v === 'number',
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
        brandId: (v: OrderProduct['brandId']) => typeof v === 'string',
        productName: (v: OrderProduct['productName']) => typeof v === 'string' || v === undefined,
        brandName: (v: OrderProduct['brandName']) => typeof v === 'string',
        size: (v: OrderProduct['size']) => typeof v === 'string' || v === undefined,
        colors: (v: OrderProduct['colors']) => Array.isArray(v) && v.every(color => typeof color === 'string'),
        price: (v: OrderProduct['price']) => typeof v === 'number' || v === undefined,
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
        pointsEarned: (v: Order['pointsEarned']) => typeof v === 'number',
        price: (v: Order['price']) => typeof v === 'number',
        status: (v: Order['status']) => Object.values(OrderStatus).includes(v),
        shipment: (v: Order['shipment']) => shipmentDataValidators(v),
        createdAt: (v: Order['createdAt']) => v instanceof Timestamp,
        updatedAt: (v: Order['updatedAt']) => v instanceof Timestamp,
        products: (v: Order['products']) => Array.isArray(v) && v.every(product => orderProductDataValidators(product)),
        brandIds: (v: Order['brandIds']) => Array.isArray(v) && v.every(id => typeof id === 'string'),
    }
    return commonDataValidators<Order>(value, validators);
}
