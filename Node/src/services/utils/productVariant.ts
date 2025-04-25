import { ProductVariant } from '../../types/models/productVariant.js';

export const checkMissingProductVariantData = (productVariant: any) => {
    const currentProductVariant = productVariant as ProductVariant;
    if (currentProductVariant.price == null || currentProductVariant.product == null || 
        currentProductVariant.stock == null) {
        return 'Price, product reference, and stock are required';
    }
    return null;
};

export const checkMissingProductVariantUpdateData = (productVariant: any) => {
    if (Object.keys(productVariant).length === 0) {
        return 'No data provided for update';
    }
    return null;
};