import { FirestoreReference } from './common.js';
import { Order } from './order.js';
import { Product } from './product.js';

export interface Inventory {
    id?: string;
    capacity: number;
    name: string;
    orders: FirestoreReference<Order>[];
    products: FirestoreReference<Product>[];
}