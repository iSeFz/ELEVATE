import { FirestoreReference } from './common.js';
import { Product } from './product.js';

export interface ProductVariant {
    id?: string;
    colors: string[];
    discount: number;
    images: string[];
    price: number;
    product: FirestoreReference<Product>;
    size: string;
    stock: number;
}