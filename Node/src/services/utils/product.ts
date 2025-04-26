import { Product, ProductVariant } from '../../types/models/product.js';

export const checkMissingProductData = (product: any) => {
    const currentProduct = product as Product;
    if (currentProduct.name == null || currentProduct.brandId == null || 
        currentProduct.category == null || currentProduct.description == null) {
        return 'Product name, brand id, category, and description are required';
    }
    return checkMissingProductVariantData(currentProduct.variants);
};

export const checkMissingProductUpdateData = (product: any) => {
    if (Object.keys(product).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

export const checkMissingProductVariantData = (productVariants: any) => {
    const currentProductVariant = (productVariants ?? []) as ProductVariant[];
    let message: string | null = null;
    currentProductVariant.forEach((variant) => {
        if (variant.price == null || variant.size == null ||
            variant.stock == null || variant.colors == null ||
            variant.images == null || variant.discount == null) {
            message = 'Product variant data is missing required fields';
        } 
    })
    return message;
};