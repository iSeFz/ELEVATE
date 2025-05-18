import { Timestamp } from 'firebase-admin/firestore';
import { Brand, brandDataValidators } from '../../types/models/brand.js';
import { convertToTimestamp } from './common.js';

export const generateFullyBrandData = (brand: Brand): Brand => {
    const fullyData: Brand = {
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

        createdAt: convertToTimestamp(brand.createdAt),
        updatedAt: convertToTimestamp(brand.updatedAt), // Always update timestamp
    };
    if (brand.id) {
        fullyData.id = brand.id;
    }

    if (!brandDataValidators(fullyData)) {
        throw new Error('Invalid brand data, check types and formats');
    }

    return fullyData;
}
