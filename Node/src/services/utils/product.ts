import { Product, ProductVariant } from '../../types/models/product.js';

export const checkMissingProductData = (product: any) => {
    const currentProduct = product as Product;
    if (currentProduct.name == null || currentProduct.brandId == null || currentProduct.brandOwnerId == null ||
        currentProduct.category == null || currentProduct.description == null || currentProduct.material == null) {
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

export const sanitizeProductData = (newProductData: any): Partial<Product> => {
    const excludedFields = ['id', 'brandId', 'brandOwnerId', 'createdAt'];
    const sanitizedData: Partial<Product> = {};
    
    const productFields: Array<keyof Product> = [
        'averageRating', 'brandId', 'brandOwnerId', 'category', 'updatedAt', 
        'department', 'description', 'material', 'name', 'reviewIds', 
        'totalReviews', 'variants'
    ];

    for (const key in newProductData) {
        // Only include fields that are part of the Product interface and not in excluded list
        if (productFields.includes(key as keyof Product) && !excludedFields.includes(key)) {
            sanitizedData[key as keyof Product] = newProductData[key];
        }
    }

    return sanitizedData;
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