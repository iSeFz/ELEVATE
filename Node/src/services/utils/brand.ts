import { Timestamp } from 'firebase-admin/firestore';
import { Brand } from '../../types/models/brand.js';
import { SubscriptionPlan } from '../../config/subscriptionPlans.js';
import { convertToTimestamp } from './common.js';

const emptyBrand: Brand = {
    addresses: [],
    brandName: "",
    brandOwnerId: "",
    email: "",
    imageURL: "",
    industry: "",
    phoneNumbers: [],
    rating: 0,
    storyDescription: "",
    subscription: {
        plan: SubscriptionPlan.FREE,
        price: 0,
        startDate: "",
        endDate: "",
    },
    websites: [],
    productCount: 0,
    createdAt: "",
    updatedAt: "",
};

export const generateFullyBrandData = (brand: Brand): Brand => {
    const fullyData: Brand = {
        addresses: brand.addresses ?? emptyBrand.addresses,
        brandName: brand.brandName ?? emptyBrand.brandName,
        brandOwnerId: brand.brandOwnerId ?? emptyBrand.brandOwnerId,
        email: brand.email ?? emptyBrand.email,
        imageURL: brand.imageURL ?? emptyBrand.imageURL,
        industry: brand.industry ?? emptyBrand.industry,
        phoneNumbers: brand.phoneNumbers ?? emptyBrand.phoneNumbers,
        rating: brand.rating ?? emptyBrand.rating,
        storyDescription: brand.storyDescription ?? emptyBrand.storyDescription,
        subscription: {
            plan: brand.subscription?.plan ?? emptyBrand.subscription.plan,
            price: brand.subscription?.price ?? emptyBrand.subscription.price,
            startDate: convertToTimestamp(brand.subscription?.startDate),
            endDate: convertToTimestamp(brand.subscription?.endDate ?? Timestamp.fromMillis(Timestamp.now().toMillis() + 30 * 24 * 60 * 60 * 1000)),
        },
        websites: brand.websites ?? emptyBrand.websites,
        productCount: brand.productCount ?? emptyBrand.productCount,
        createdAt: convertToTimestamp(brand.createdAt),
        updatedAt: convertToTimestamp(brand.updatedAt),
    };
    if (brand.id) {
        fullyData.id = brand.id;
    }

    return fullyData;
};
