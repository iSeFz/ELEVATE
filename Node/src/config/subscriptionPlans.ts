// Centralized subscription plan management for ELEVATE
// All plan details (name, price, limits, features, etc.) are defined here
// Import and use this config throughout the codebase for consistency

export enum SubscriptionPlan {
    FREE = 1,
    BASIC = 2,
    PREMIUM = 3,
}

export interface SubscriptionPlanDetails {
    name: string;
    price: number;
    features: string[];
    productLimit: number;
    // Add more properties as needed
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
    [SubscriptionPlan.FREE]: {
        name: 'FREE',
        price: 0,
        features: [
            'Basic support',
            'Limited product listings',
        ],
        productLimit: 10,
    },
    [SubscriptionPlan.BASIC]: {
        name: 'BASIC',
        price: 199,
        features: [
            'Priority support',
            'Increased product listings',
        ],
        productLimit: 100,
    },
    [SubscriptionPlan.PREMIUM]: {
        name: 'PREMIUM',
        price: 499,
        features: [
            '24/7 support',
            'Unlimited product listings',
            'Advanced analytics',
        ],
        productLimit: 10000,
    },
};

// Helper to get plan details by enum value
export function getSubscriptionPlanDetails(plan: SubscriptionPlan): SubscriptionPlanDetails {
    return SUBSCRIPTION_PLANS[plan];
}
