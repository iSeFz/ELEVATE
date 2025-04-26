import { FirestoreReference } from './common.js';
import { Product } from './product.js';
import { Brand } from './brand.js';
import { BrandOwner } from './brandOwner.js';

export interface ProductVariant {
    id?: string;
    colors: string[];
    discount: number;
    images: string[];
    price: number;
    product: FirestoreReference<Product>;
    // Denormalized fields for authorization
    brandId?: string;
    brandOwnerId?: string;
    // Optional reference to avoid extra queries when needed
    brand?: FirestoreReference<Brand>;
    size: string;
    stock: number;
}