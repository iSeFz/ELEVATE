import { Timestamp } from 'firebase-admin/firestore';
import { Address, addressDataValidators, commonDataValidators, TimestampUnion } from './common.js';

export interface CartItem {
    id?: string; // Optional ID for the item, useful for updates
    productId: string;
    variantId: string;
    quantity: number; // The amount the user wants to add
    color: string;  // Selected color of the product variant
    // denormalized data to avoid extra queries
    brandName: string; // Brand name for quick display
    productName: string;  // Product name for quick display
    size: string;   // Variant size
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

    password?: string; // Optional for authentication purposes
}

export const cartItemDataValidators = (value: CartItem): boolean => {
    const validators: Record<keyof CartItem, (value: any) => boolean> = {
        id: (v: CartItem['id']) => typeof v === 'string' || v === undefined,
        productId: (v: CartItem['productId']) => typeof v === 'string',
        variantId: (v: CartItem['variantId']) => typeof v === 'string',
        quantity: (v: CartItem['quantity']) => typeof v === 'number' && v > 0,
        brandName: (v: CartItem['brandName']) => typeof v === 'string',
        productName: (v: CartItem['productName']) => typeof v === 'string',
        size: (v: CartItem['size']) => typeof v === 'string',
        color: (v: CartItem['color']) => typeof v === 'string',
        price: (v: CartItem['price']) => typeof v === 'number',
        imageURL: (v: CartItem['imageURL']) => typeof v === 'string',
    }
    return commonDataValidators<CartItem>(value, validators);
}

export const cartDataValidators = (value: Cart): boolean => {
    const validators: Record<keyof Cart, (value: any) => boolean> = {
        items: (v: Cart['items']) => Array.isArray(v) && v.every(item => cartItemDataValidators(item)),
        subtotal: (v: Cart['subtotal']) => typeof v === 'number',
        updatedAt: (v: Cart['updatedAt']) => v instanceof Timestamp,
    }
    return commonDataValidators<Cart>(value, validators);
}

export const wishlistItemDataValidators = (value: WishlistItem): boolean => {
    const validators: Record<keyof WishlistItem, (value: any) => boolean> = {
        productId: (v: WishlistItem['productId']) => typeof v === 'string',
        addedAt: (v: WishlistItem['addedAt']) => v instanceof Timestamp,
        brandName: (v: WishlistItem['brandName']) => typeof v === 'string',
        name: (v: WishlistItem['name']) => typeof v === 'string',
        imageURL: (v: WishlistItem['imageURL']) => typeof v === 'string',
        price: (v: WishlistItem['price']) => typeof v === 'number',
    }
    return commonDataValidators<WishlistItem>(value, validators);
}

export const customerDataValidators = (value: Customer): boolean => {
    const validators: Record<keyof Customer, (value: any) => boolean> = {
        id: (v: Customer['id']) => typeof v === 'string' || v === undefined,
        addresses: (v: Customer['addresses']) => Array.isArray(v) && v.every(item => addressDataValidators(item)),
        cart: (v: Customer['cart']) => cartDataValidators(v),
        email: (v: Customer['email']) => typeof v === 'string',
        firstName: (v: Customer['firstName']) => typeof v === 'string',
        lastName: (v: Customer['lastName']) => typeof v === 'string',
        imageURL: (v: Customer['imageURL']) => typeof v === 'string',
        loyaltyPoints: (v: Customer['loyaltyPoints']) => typeof v === 'number',
        phoneNumber: (v: Customer['phoneNumber']) => typeof v === 'string',
        username: (v: Customer['username']) => typeof v === 'string',
        wishlist: (v: Customer['wishlist']) => Array.isArray(v) && v.every(item => wishlistItemDataValidators(item)),
        createdAt: (v: Customer['createdAt']) => v instanceof Timestamp,
        updatedAt: (v: Customer['updatedAt']) => v instanceof Timestamp,
        password: (v: Customer['password']) => typeof v === 'string' || v === undefined,
    }

    return commonDataValidators<Customer>(value, validators);
}
