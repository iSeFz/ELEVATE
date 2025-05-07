import { Order, orderDataValidators, OrderStatus } from '../../types/models/order.js';
import * as productService from '../product.js';
import { admin } from '../../config/firebase.js';
import { convertToTimestamp } from './common.js';

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

export const calculateOrderTotal = async (order: Order): Promise<number> => {
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

    // Fallback to the order price if we couldn't calculate from products
    if (total === 0 && order.price) {
        total = order.price;
    }

    // Add shipment fee if available
    if (order?.shipment?.fees) {
        total += order.shipment.fees;
    }

    // Subtract redeemed points (if any)
    if (order.pointsRedeemed) {
        // Assuming 1 point = $0.01 value
        const pointsValue = order.pointsRedeemed * 0.01;
        total = Math.max(0, total - pointsValue);
    }

    return total;
};

export const validateOrderStatus = (status: string): boolean => {
    const validStatuses = Object.values(OrderStatus);
    return validStatuses.includes(status as OrderStatus);
};

/**
 * Validates if a customer has enough loyalty points for redemption
 * @param customerId The ID of the customer
 * @param pointsToRedeem The number of points the customer wants to redeem
 * @returns A boolean indicating if the customer has enough points
 */
export const validateCustomerPoints = async (customerId: string, pointsToRedeem: number): Promise<boolean> => {
    if (pointsToRedeem <= 0) return true;

    try {
        const firestore = admin.firestore();
        const customerDoc = await firestore.collection('customer').doc(customerId).get();

        if (!customerDoc.exists) {
            throw new Error(`Customer with ID ${customerId} not found`);
        }

        const customerData = customerDoc.data();
        const currentPoints = customerData?.loyaltyPoints ?? 0;

        return currentPoints >= pointsToRedeem;
    } catch (error) {
        console.error(`Error validating customer points: ${error}`);
        throw error;
    }
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

export const generateFullyOrderData = (order: Order): Order => {
    const fullyData: Order = {
        id: order.id ?? "",
        address: order.address ?? {
            city: "",
            postalCode: 0,
            street: "",
            building: 0,
        },
        customerId: order.customerId ?? "",
        phoneNumber: order.phoneNumber ?? "",
        price: order.price ?? 0,
        products: order.products ?? [],
        shipment: order.shipment ?? {
            fees: 0,
            method: "standard",
            trackingNumber: "",
        },
        payment: {
            method: order.payment?.method ?? "cash-on-delivery",
            price: order.payment?.price ?? 0,
            createdAt: convertToTimestamp(order.payment?.createdAt),
        },
        status: order.status ?? OrderStatus.PENDING,
        pointsRedeemed: order.pointsRedeemed ?? 0,

        createdAt: convertToTimestamp(order.createdAt),
        updatedAt: convertToTimestamp(order.updatedAt),
    };

    if (!orderDataValidators(fullyData)) {
        throw new Error('Invalid order data, check types and formats');
    }

    return fullyData;
}
