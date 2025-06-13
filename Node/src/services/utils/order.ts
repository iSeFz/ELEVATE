import { Order, orderDataValidators, OrderStatus, Shipment, WeightSurcharge } from '../../types/models/order.js';
import * as productService from '../product.js';
import { convertToTimestamp } from './common.js';
import { getDistance } from 'geolib';
import { Address } from '../../types/models/common.js';
import { DistanceRange, ShippingRate } from '../../types/models/order.js';
import { shipmentType as SHIPMMENT_TYPES } from '../../config/order.js';


export const checkMissingOrderData = (order: any) => {
    const currentOrder = order as Order;
    if (currentOrder.address == null || currentOrder.customerId == null ||
        currentOrder.phoneNumber == null) {
        return 'Address, customerId, price, and phone number are required';
    }

    // Check products array
    if (!currentOrder.products || !Array.isArray(currentOrder.products) || currentOrder.products.length === 0) {
        return 'Order must contain at least one product';
    }

    // Validate each product in the array
    for (const product of currentOrder.products) {
        if (!product.productId) {
            return 'Each product must have a productId';
        }

        if (!product.variantId) {
            return 'Each product must have a variantId';
        }

        if (!product.quantity || product.quantity <= 0) {
            return 'Product quantity must be greater than zero';
        }
    }

    return null;
};

export const checkMissingOrderUpdateData = (order: any) => {
    if (Object.keys(order).length === 0) {
        return 'No data provided for update';
    }

    // If updating products, validate them
    if (order.products) {
        if (!Array.isArray(order.products) || order.products.length === 0) {
            return 'Order must contain at least one product';
        }

        // Validate each product in the array
        for (const product of order.products) {
            if (!product.productId) {
                return 'Each product must have a productId';
            }

            if (!product.variantId) {
                return 'Each product must have a variantId';
            }

            if (!product.quantity || product.quantity <= 0) {
                return 'Product quantity must be greater than zero';
            }
        }
    }

    return null;
};

export const calculateOrderProductsCost = async (order: Order): Promise<number> => {
    let total = 0;

    // Calculate total from all products
    if (order.products && Array.isArray(order.products)) {
        for (const product of order.products) {
            if (product.quantity) {
                // Get the variant by ID to access its price
                try {
                    const variant = await productService.getProductVariant(product.productId, product.variantId);
                    if (variant == null) {
                        throw new Error(`Variant with ID ${product.variantId} not found`);
                    }
                    if (variant?.stock < product.quantity) {
                        throw new Error(`Not enough stock for variant with ID ${product.variantId} in product ${product.productId}`);
                    }
                    if (variant?.price) {
                        total += variant.price * product.quantity;
                    } else {
                        throw new Error(`Variant with ID ${product.variantId} not found`);
                    }
                } catch (error) {
                    console.error(`Error fetching variant: ${error}`);
                }
            }
        }
    }

    return total;
};

export const updatePriceWithRedeemedPoints = (price: number, pointsRedeemed: number) => {
    let total = price;
    let surplusPoints = 0;

    // Assuming 1 point = $0.01 value
    const pointsValue = pointsRedeemed * 0.01;

    if (pointsValue >= total) {
        // All price covered, surplus points exist
        surplusPoints = Math.round((pointsValue - total) / 0.01);
        total = 0;
    } else {
        // Not all price covered, no surplus
        total = total - pointsValue;
    }

    return {
        updatedPrice: total,
        surplusPoints,
    };
};

export const validateOrderStatus = (status: string): boolean => {
    const validStatuses = Object.values(OrderStatus);
    return validStatuses.includes(status as OrderStatus);
};

/**
 * Calculates loyalty points earned from an order based on the order total
 * @param orderTotal The total price of the order
 * @returns The number of loyalty points earned
 */
export const calculateLoyaltyPointsEarned = (orderTotal: number): number => {
    // Convert price to points (e.g., $1 = 10 points)
    const conversionRate = 10;
    return Math.floor(orderTotal * conversionRate);
};

const emptyOrder: Order = {
    address: {
        city: "",
        postalCode: 0,
        street: "",
        building: 0,
        latitude: 30.0313294,
        longitude: 31.2081442,
    },
    customerId: "",
    phoneNumber: "",
    price: 0,
    products: [],
    shipment: {
        totalFees: 0,
        breakdown: [],
        estimatedDeliveryDays: 0,
        method: "standard",
        trackingNumber: "",
        createdAt: "",
        deliveredAt: "",
        carrier: "",
    },
    payment: {
        method: "cash-on-delivery",
        credentials: "none",
    },
    status: OrderStatus.PENDING,
    pointsRedeemed: 0,
    pointsEarned: 0,
    brandIds: [],
    createdAt: "",
    updatedAt: "",
};

export const generateFullyOrderData = (order: Order): Order => {
    const fullyData: Order = {
        address: order.address ?? emptyOrder.address,
        customerId: order.customerId ?? emptyOrder.customerId,
        phoneNumber: order.phoneNumber ?? emptyOrder.phoneNumber,
        price: order.price ?? emptyOrder.price,
        products: order.products ?? emptyOrder.products,
        shipment: {
            totalFees: order.shipment?.totalFees ?? emptyOrder.shipment.totalFees,
            breakdown: order.shipment?.breakdown ?? emptyOrder.shipment.breakdown,
            estimatedDeliveryDays: order.shipment?.estimatedDeliveryDays ?? emptyOrder.shipment.estimatedDeliveryDays,
            method: order.shipment?.method ?? emptyOrder.shipment.method,
            trackingNumber: order.shipment?.trackingNumber ?? emptyOrder.shipment.trackingNumber,
            carrier: order.shipment?.carrier ?? emptyOrder.shipment.carrier,
            createdAt: convertToTimestamp(order.shipment?.createdAt),
            deliveredAt: convertToTimestamp(order.shipment?.deliveredAt),
        },
        payment: {
            method: order.payment?.method ?? emptyOrder.payment.method,
            credentials: order.payment?.credentials ?? emptyOrder.payment.credentials,
        },
        status: order.status ?? OrderStatus.PENDING,
        pointsRedeemed: order.pointsRedeemed ?? emptyOrder.pointsRedeemed,
        pointsEarned: order.pointsEarned ?? emptyOrder.pointsEarned,
        brandIds: order.brandIds ?? [],

        createdAt: convertToTimestamp(order.createdAt),
        updatedAt: convertToTimestamp(order.updatedAt),
    };
    if (order.id) {
        fullyData.id = order.id;
    }

    if (!orderDataValidators(fullyData)) {
        throw new Error('Invalid order data, check types and formats');
    }

    return fullyData;
}

// Helper function for distance calculation
export const findNearestBranch = (customerAddr: Address, brandAddresses: Address[]): { distance: number; nearestBranch: Address } => {
    let minDistance = Infinity;
    let nearestBranch = brandAddresses[0]; // Initialize with first branch

    for (const branchAddr of brandAddresses) {
        const distance = calculateDistance(customerAddr, branchAddr);
        if (distance < minDistance) {
            minDistance = distance;
            nearestBranch = branchAddr;
        }
    }

    return {
        distance: minDistance,
        nearestBranch
    };
};

export const calculateDistance = (addr1: Address, addr2: Address): number => {
    const distanceInMeters = getDistance(
        { latitude: addr1.latitude, longitude: addr1.longitude },
        { latitude: addr2.latitude, longitude: addr2.longitude }
    );
    return distanceInMeters / 1000; // Convert to kilometers
};

/**
 * Extracts unique brand IDs from a list of product items
 * @param productItems Array of product items with productId and quantity
 * @returns Array of unique brand IDs
 */
export const getUniqueBrandsFromProducts = async (productItems: { productId: string, quantity: number }[]): Promise<string[]> => {
    const brandIds = new Set<string>();

    for (const item of productItems) {
        try {
            const product = await productService.getProduct(item.productId);
            if (!product) continue;
            brandIds.add(product.brandId);
        } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            // Continue processing other products even if one fails
            continue;
        }
    }

    return Array.from(brandIds);
};

// Define shipping rates based on distance ranges
const SHIPPING_RATES: ShippingRate[] = [
    { minDistance: 0, maxDistance: 5, fee: 25 }, // Same city/nearby - 25 EGP
    { minDistance: 5, maxDistance: 15, fee: 35 }, // Within metro area - 35 EGP
    { minDistance: 15, maxDistance: 50, fee: 50 }, // Suburban/nearby governorates - 50 EGP
    { minDistance: 50, maxDistance: 150, fee: 75 }, // Different governorates - 75 EGP
    { minDistance: 150, maxDistance: Infinity, fee: 100 } // Far governorates - 100 EGP
];

/**
 * Calculates estimated delivery days based on distance and brand breakdown
 * @param feeBreakdown Array of fee breakdown objects with distance information
 * @param shipmentType Type of shipment ("standard" or "express")
 * @returns Estimated delivery days
 */
export const calculateEstimatedDelivery = (
    distance: number,
    shipmentType: string = SHIPMMENT_TYPES['standard']
) => {
    // Base delivery time constants
    const BASE_DELIVERY_DAYS = shipmentType === SHIPMMENT_TYPES['express'] ? 1 : 3;
    const EXTRA_DAY_PER_50KM = shipmentType === SHIPMMENT_TYPES['express'] ? 0.5 : 1;

    // Calculate base delivery time based on distance
    let estimatedDays = BASE_DELIVERY_DAYS;

    // Find the appropriate shipping rate based on distance
    let shippingRate = SHIPPING_RATES.find(rate =>
        distance >= rate.minDistance && distance < rate.maxDistance
    )?.fee ?? SHIPPING_RATES[SHIPPING_RATES.length - 1].fee; // Fallback to highest rate

    // Add extra days based on distance (for every 50km)
    estimatedDays += Math.floor(shippingRate / 50) * EXTRA_DAY_PER_50KM;

    // Different caps for different service levels
    const maxDays = shipmentType === 'express' ? 3 : 7;
    return {
        days: Math.min(Math.ceil(estimatedDays), maxDays),
        fee: shippingRate
    }
};

// Weight-based surcharges (in EGP)
const WEIGHT_SURCHARGES: WeightSurcharge[] = [
    { minWeight: 0, maxWeight: 2, surcharge: 0 },     // Base weight - no extra fee
    { minWeight: 2, maxWeight: 5, surcharge: 10 },    // Light packages
    { minWeight: 5, maxWeight: 10, surcharge: 20 },   // Medium packages  
    { minWeight: 10, maxWeight: 20, surcharge: 35 },  // Heavy packages
    { minWeight: 20, maxWeight: Infinity, surcharge: 50 } // Very heavy/freight
];

/**
 * Calculate weight surcharge based on total order weight
 * @param totalWeightKg - Total weight of all items in kg
 * @returns Weight surcharge fee in EGP
 */
export const calculateWeightSurcharge = (totalWeightKg: number): number => {
    if (totalWeightKg < 0) {
        throw new Error('Weight cannot be negative');
    }

    const weightTier = WEIGHT_SURCHARGES.find(tier =>
        totalWeightKg >= tier.minWeight && totalWeightKg < tier.maxWeight
    );

    return weightTier ? weightTier.surcharge : WEIGHT_SURCHARGES[WEIGHT_SURCHARGES.length - 1].surcharge;
};


/**
 * Calculate total order weight from items
 * @param quantities - Array of quantities for each product item
 * @returns Total weight in kg
 */
export const calculateOrderWeight = (quantities: number[]): number => {
    return quantities.reduce((totalWeight, quantity) => {
        return totalWeight + quantity * 0.2; // Assuming each item weighs 200g (0.2kg)
    }, 0);
};
