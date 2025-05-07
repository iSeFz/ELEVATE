import { Product, productDataValidators, ProductVariant } from '../../types/models/product.js';
import { convertToTimestamp } from './common.js';

export const checkRequiredProductData = (product: any) => {
    const currentProduct = product as Product;
    if (currentProduct.name == null || currentProduct.brandId == null || currentProduct.brandOwnerId == null ||
        currentProduct.category == null || currentProduct.description == null || currentProduct.material == null) {
        return 'Product name, category, matrial, and description are required';
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
        'reviewSummary', 'category', 'updatedAt', 'brandName',
        'department', 'description', 'material', 'name', 'variants'
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
    if (!Array.isArray(productVariants) || productVariants.length === 0) {
        return 'Product variants must be an array and cannot be empty';
    }
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

export const generateFullyProductData = (product: Product): Product => {
    const fullyData: Product = {
        id: product.id ?? "",
        brandId: product.brandId ?? "",
        brandOwnerId: product.brandOwnerId ?? "",
        brandName: product.brandName ?? "",
        category: product.category ?? "",
        department: product.department ?? [],
        description: product.description ?? "",
        material: product.material ?? "",
        name: product.name ?? "",
        variants: product.variants ?? [],
        reviewSummary: product.reviewSummary ?? {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {
                '1': 0,
                '2': 0,
                '3': 0,
                '4': 0,
                '5': 0,
            },
            reviewIds: [],
        },

        createdAt: convertToTimestamp(product.createdAt),
        updatedAt: convertToTimestamp(product.updatedAt),
    };

    if (!productDataValidators(fullyData)) {
        throw new Error('Invalid product data, check types and formats');
    }

    return fullyData;
}
