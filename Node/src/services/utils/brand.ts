import { Timestamp } from 'firebase-admin/firestore';
import { Brand, brandDataValidators } from '../../types/models/brand.js';
import { convertToTimestamp } from './common.js';

export const checkRequiredBrandData = (brand: any) => {
    const currentBrand = brand as Brand;
    if (brand == null) {
        return 'Brand data is required';
    }
    if (currentBrand.brandName == null || currentBrand.email == null ||
        currentBrand.industry == null || currentBrand.storyDescription == null) {
        return 'Brand name, email, industry, and story description are required';
    }
    return null;
};

export const checkMissingBrandUpdateData = (brand: any) => {
    if (Object.keys(brand).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

export const generateFullyBrandData = (brand: Brand): Brand => {
    const fullyData: Brand = {
        id: brand.id ?? "",
        addresses: brand.addresses ?? [],
        brandName: brand.brandName ?? "",
        brandOwnerId: brand.brandOwnerId ?? "",
        email: brand.email ?? "",
        imageURL: brand.imageURL ?? "",
        industry: brand.industry ?? "",
        phoneNumbers: brand.phoneNumbers ?? [],
        rating: brand.rating ?? 0,
        storyDescription: brand.storyDescription ?? "",
        subscription: {
            plan: brand.subscription?.plan ?? "free",
            price: brand.subscription?.price ?? 0,
            startDate: convertToTimestamp(brand.subscription?.startDate),
            endDate: convertToTimestamp(brand.subscription?.endDate ?? Timestamp.fromMillis(Timestamp.now().toMillis() + 30 * 24 * 60 * 60 * 1000)),
        },
        websites: brand.websites ?? [],
        productIds: brand.productIds ?? [],

        createdAt: convertToTimestamp(brand.createdAt),
        updatedAt: convertToTimestamp(brand.updatedAt), // Always update timestamp
    };

    if (!brandDataValidators(fullyData)) {
        throw new Error('Invalid brand data, check types and formats');
    }

    return fullyData;
}
