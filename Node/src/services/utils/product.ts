import { Product, productDataValidators, ProductVariant } from '../../types/models/product.js';
import { convertToTimestamp } from './common.js';

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
    if(product.id) {
        fullyData.id = product.id;
    }

    if (!productDataValidators(fullyData)) {
        throw new Error('Invalid product data, check types and formats');
    }

    return fullyData;
}
