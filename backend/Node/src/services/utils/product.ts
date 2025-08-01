import { Product, ProductVariant } from '../../types/models/product.js';
import { convertToTimestamp } from './common.js';
import { SubscriptionPlan } from '../../config/subscriptionPlans.js';

export const normalizeString = (str: string | null): string => {
    if (str == null) {
        return '';
    }
    return str.trim().toLowerCase();
}

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

const emptyProduct: Product = {
    brandId: "",
    brandOwnerId: "",
    brandName: "",
    category: "",
    department: [],
    description: "",
    material: "",
    name: "",
    variants: [],
    reviewSummary: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
        },
    },
    wishlistCount: 0,
    brandSubscriptionPlan: SubscriptionPlan.FREE, // Default, should always be set explicitly
    createdAt: "",
    updatedAt: "",
}

export const generateFullyProductData = (product: Product): Product => {
    const fullyData: Product = {
        brandId: product.brandId ?? emptyProduct.brandId,
        brandOwnerId: product.brandOwnerId ?? emptyProduct.brandOwnerId,
        brandName: product.brandName ?? emptyProduct.brandName,
        category: normalizeString(product.category) ?? emptyProduct.category,
        department: product.department?.map((value) => normalizeString(value)) ?? emptyProduct.department,
        description: product.description ?? emptyProduct.description,
        material: normalizeString(product.material) ?? emptyProduct.material,
        name: product.name ?? emptyProduct.name,
        variants: product.variants ?? emptyProduct.variants,
        reviewSummary: product.reviewSummary ?? emptyProduct.reviewSummary,
        wishlistCount: product.wishlistCount ?? emptyProduct.wishlistCount,
        brandSubscriptionPlan: product.brandSubscriptionPlan ?? emptyProduct.brandSubscriptionPlan,
        createdAt: convertToTimestamp(product.createdAt),
        updatedAt: convertToTimestamp(product.updatedAt),
    };
    if (product.id) {
        fullyData.id = product.id;
    }

    return fullyData;
}
