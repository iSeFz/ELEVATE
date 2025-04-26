import { FirestoreReference } from './common.js';
import { Order } from './order.js';
import { Product } from './product.js';

export interface Inventory {
    id?: string;
    capacity: number;
    name: string;
    
    // Core references for relationship integrity
    orders: FirestoreReference<Order>[];
    products: FirestoreReference<Product>[];
    
    // Denormalized fields for querying and authorization
    orderIds?: string[];
    productIds?: string[];
    
    // Owner information for authorization
    ownerId?: string;
}