import { Product } from '../../types/models/product.js';

export const checkMissingProductData = (product: any) => {
    const currentProduct = product as Product;
    if (currentProduct.name == null || currentProduct.brand == null || 
        currentProduct.category == null || currentProduct.description == null) {
        return 'Product name, brand, category, and description are required';
    }
    return null;
};

export const checkMissingProductUpdateData = (product: any) => {
    if (Object.keys(product).length === 0) {
        return 'No data provided for update';
    }
    return null;
};