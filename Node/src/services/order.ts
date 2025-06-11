import { admin } from '../config/firebase.js';
import * as OrderUtils from './utils/order.js';
import { Order, OrderStatus } from '../types/models/order.js';
import { Timestamp } from 'firebase-admin/firestore';
import { Product } from '../types/models/product.js';
import { getCustomer } from './customer.js';
import { Address } from '../types/models/common.js';
import { getBrand } from './brand.js';
import { v4 as uuidv4 } from 'uuid';

const firestore = admin.firestore();
const orderCollection = 'order';
const customerCollection = 'customer';

// Helper to fetch orders with custom query and pagination
const fetchOrders = async (
    queryBuilder: (ref: FirebaseFirestore.CollectionReference) => FirebaseFirestore.Query,
    page: number = 1,
    limit: number = 10
) => {
    const offset = (page - 1) * limit;
    try {
        const ref = firestore.collection(orderCollection);
        let query = queryBuilder(ref).offset(offset).limit(limit);
        const snapshot = await query.get();
        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ ...doc.data(), id: doc.id } as Order);
        });
        const hasNextPage = orders.length === limit;
        return {
            orders,
            pagination: {
                page,
                limit,
                hasNextPage
            }
        };
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getAllOrders = async (page: number = 1) => {
    return fetchOrders(
        ref => ref
            .orderBy("createdAt", "desc"),
        page
    );
};

export const getCustomerOrders = async (customerID: string, page = 1) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    return fetchOrders(
        ref => ref
            .where("customerId", "==", customerID)
            .orderBy("createdAt", "desc"),
        page
    );
};

export const getCustomerOrder = async (orderID: string, customerID: string) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }
    try {
        const docRef = firestore.collection(orderCollection).doc(orderID)
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            throw new Error('Order not found');
        }

        const orderData = docSnap.data() as Order;
        if (orderData.customerId !== customerID) {
            throw new Error('Unauthorized access to this order');
        }

        return { ...orderData, id: docSnap.id } as Order;
    } catch (error: any) {
        throw new Error(`Failed to get order: ${error.message}`);
    }
};

export const getOrdersByProduct = async (productID: string, page: number = 1) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    // todo: This cannot be performed in Firestore, try to resolve it
    return fetchOrders(
        ref => ref
            .where("products", "array-contains", { productId: productID }),
        // .orderBy("createdAt", "desc"),
        page
    );
};

export const getOrdersByStatus = async (status: OrderStatus, page: number = 1) => {
    if (!status) {
        throw new Error('Please provide an order status');
    }
    return fetchOrders(
        ref => ref
            .where("status", "==", status)
            .orderBy("createdAt", "desc"),
        page
    );
};

export const addOrder = async (order: Order) => {
    try {
        const addedOrderData = OrderUtils.generateFullyOrderData(order);
        const orderDoc = firestore.collection(orderCollection).doc();
        const batch = firestore.batch();

        let totalPrice = 0;

        for (let i = 0; i < addedOrderData.products.length; i++) {
            const item = addedOrderData.products[i];
            // Use productService.getProductVariant if you want, or keep your current fetching logic
            const productRef = firestore.collection('product').doc(item.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            const productData = productDoc.data()! as Product;
            const variants = productData?.variants ?? [];
            const variant = variants.find((v: any) => v.id === item.variantId);

            if (!variant) {
                throw new Error(`Variant with ID ${item.variantId} not found in product ${item.productId}`);
            }

            // Check if the variant has enough stock
            if (variant.stock < item.quantity) {
                throw new Error(`Not enough stock for variant ${item.variantId} in product ${item.productId}`);
            }

            // Fill denormalized fields
            addedOrderData.products[i] = {
                ...item, // Item has these fields: variantId, productId, quantity
                productName: productData.name,
                brandName: productData.brandName,
                colors: variant.colors ?? [],
                size: variant.size,
                price: variant.price,
                imageURL: variant.images[0] ?? productData.variants[0].images[0] ?? "",
            };

            // Accumulate total price
            totalPrice += variant.price * item.quantity;

            // Update the variant stock
            const updatedVariants = [...variants];
            const variantIndex = variants.findIndex((v: any) => v.id === item.variantId);
            updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                stock: updatedVariants[variantIndex].stock - item.quantity
            };

            batch.update(productRef, { variants: updatedVariants });
        }

        // Set the calculated price
        addedOrderData.price = totalPrice;
        addedOrderData.shipment = {} as Order['shipment']; // Initialize shipment as empty
        addedOrderData.payment = {} as Order['payment']; // Initialize payment as empty
        addedOrderData.status = OrderStatus.PENDING; // Set initial status

        batch.set(orderDoc, addedOrderData);

        await batch.commit();
        return { ...addedOrderData, id: orderDoc.id };
    } catch (error: any) {
        throw new Error(`Failed to add order: ${error.message}`);
    }
};

export const calculateShipmentFees = async (
    customerAddress: Address,
    shipmentType: string, // e.g., "standard", "express"
    productItems: { productId: string, quantity: number }[]
) => {
    const PRICE_PER_KM = 5; // EGP per KM
    const BASE_FEE = 30; // Minimum fee per brand

    // 1. Get unique brands from products
    const uniqueBrandIds = await OrderUtils.getUniqueBrandsFromProducts(productItems);

    let totalFees = 0;
    const feeBreakdown = [];

    // 2. Calculate fee for each brand
    for (const brandId of uniqueBrandIds) {
        const brand = await getBrand(brandId);
        if (!brand?.addresses?.length) continue;

        // 3. Find nearest branch
        const { distance: nearestDistance, nearestBranch } = OrderUtils.findNearestBranch(customerAddress, brand.addresses);

        // 4. Calculate fee for this brand
        const brandFee = Math.max(BASE_FEE, nearestDistance * PRICE_PER_KM);
        totalFees += brandFee;

        feeBreakdown.push({
            brandId,
            brandName: brand.brandName,
            distance: nearestDistance,
            nearestBranch,
            fee: brandFee
        });
    }

    const orderShipment: Order['shipment'] = {
        totalFees: totalFees * (shipmentType === 'express' ? 2 : 1), // Double for express shipment
        breakdown: feeBreakdown,
        estimatedDeliveryDays: OrderUtils.calculateEstimatedDelivery(feeBreakdown),
        method: shipmentType,
        createdAt: Timestamp.now(),
        trackingNumber: '', // This can be set later when shipment is confirmed
        carrier: 'Bosta', // Assuming Bosta is the carrier
    };

    // Update the order collection with the shipment details
    const orderShipmentDoc = firestore.collection(orderCollection).doc();
    const batch = firestore.batch();
    batch.update(orderShipmentDoc, {
        shipment: orderShipment,
        updatedAt: Timestamp.now()
    });

    return orderShipment;
};

export const updateOrderAfterShipment = async (orderID: string, shipmentData: Partial<Order['shipment']>, customerAddress: Address) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }

    try {
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        await orderRef.update({
            shipment: shipmentData,
            address: customerAddress,
            updatedAt: Timestamp.now()
        });
        return true;
    } catch (error: any) {
        throw new Error(`Failed to update order shipment: ${error.message}`);
    }
}

export const confirmOrder = async (orderID: string, customerId: string, remainingOrderData: Partial<Order>) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }

    try {
        const batch = firestore.batch();
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new Error('Order not found');
        }
        const confirmedOrderData = orderDoc.data() as Order;

        // Check if the order customer ID matches
        if (confirmedOrderData.customerId !== customerId) {
            throw new Error('Unauthorized access to this order');
        }

        // Check if the order is already confirmed
        if (confirmedOrderData.status !== OrderStatus.PENDING) {
            throw new Error('Order is already confirmed or cannot be modified');
        }

        // Check if confirmation is within [20] minutes of creation
        const createdAt = confirmedOrderData.createdAt as Timestamp;
        const orderConfirmationTimeLimit = 20 * 60; // seconds
        if ((Timestamp.now().seconds - createdAt.seconds) > orderConfirmationTimeLimit) {
            // Rollback the order
            await orderRestoreProductStocks(batch, confirmedOrderData.products);
            batch.update(orderRef, { status: OrderStatus.CANCELLED });
            await batch.commit();
            throw new Error('Order confirmation time expired. Order has been cancelled and stock restored.');
        }

        // Check if customer has enough loyalty points to redeem
        remainingOrderData.pointsRedeemed ??= 0;
        if (remainingOrderData.pointsRedeemed > 0) {
            const hasEnoughPoints = await validateCustomerPoints(confirmedOrderData.customerId, remainingOrderData.pointsRedeemed);
            if (!hasEnoughPoints) {
                // No rollback the order, as customer can try again with less points
                throw new Error('Customer does not have enough loyalty points for this redemption');
            }
        }

        const pointsEarned = OrderUtils.calculateLoyaltyPointsEarned(confirmedOrderData.price);
        // Update the customer's earned points
        if (customerId) {
            const customerRef = firestore.collection(customerCollection).doc(customerId);
            batch.update(customerRef, {
                loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned - remainingOrderData.pointsRedeemed)
            });
        }

        const priceRedeeemed = OrderUtils.updatePriceWithRedeemedPoints(confirmedOrderData.price, remainingOrderData.pointsRedeemed);
        remainingOrderData.pointsRedeemed -= priceRedeeemed.surplusPoints;

        // Update order details
        confirmedOrderData.updatedAt = Timestamp.now();
        confirmedOrderData.price = priceRedeeemed.updatedPrice;
        confirmedOrderData.status = OrderStatus.PROCESSING;
        confirmedOrderData.phoneNumber = remainingOrderData.phoneNumber!;
        confirmedOrderData.pointsRedeemed = remainingOrderData.pointsRedeemed;
        confirmedOrderData.pointsEarned = pointsEarned;
        confirmedOrderData.payment = remainingOrderData.payment!;
        confirmedOrderData.shipment.trackingNumber = uuidv4(); // Generate a tracking number
        batch.update(orderRef, { ...confirmedOrderData });
        await batch.commit();
        return confirmedOrderData;
    } catch (error: any) {
        throw new Error(`Failed to confirm order: ${error.message}`);
    }
};

const orderRollback = async (batch: admin.firestore.WriteBatch, order: Order) => {
    await orderRestoreProductStocks(batch, order.products);
}

/**
 * Restores product stocks for the products in an order (Don't miss to commit the batch after calling this function)
 * @param batch  The Firestore batch to perform the updates
 * @param products  The products in the order to restore stocks for
 */
const orderRestoreProductStocks = async (batch: admin.firestore.WriteBatch, products: Order['products']) => {
    // Restore product stock
    for (const item of products) {
        const productRef = firestore.collection('product').doc(item.productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) continue;

        const productData = productDoc.data();
        const variants = productData?.variants ?? [];
        const variantIndex = variants.findIndex((v: any) => v.id === item.variantId);
        if (variantIndex === -1) continue;

        // Restore the stock
        const updatedVariants = [...variants];
        updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            stock: updatedVariants[variantIndex].stock + item.quantity
        };

        batch.update(productRef, { variants: updatedVariants });
    }
}

/**
 * Validates if a customer has enough loyalty points for redemption
 * @param customerId The ID of the customer
 * @param pointsToRedeem The number of points the customer wants to redeem
 * @returns A boolean indicating if the customer has enough points
 */
const validateCustomerPoints = async (customerId: string, pointsToRedeem: number): Promise<boolean> => {
    if (pointsToRedeem <= 0) return true;

    try {
        const customerData = await getCustomer(customerId);
        if (!customerData) {
            throw new Error('Customer not found');
        }
        const currentPoints = customerData.loyaltyPoints ?? 0;
        return currentPoints >= pointsToRedeem;
    } catch (error) {
        console.error(`Error validating customer points: ${error}`);
        throw error;
    }
};

const updateOrderStatus = async (orderID: string, status: OrderStatus) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }
    try {
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        await orderRef.update({ status });
        return true;
    } catch (error: any) {
        throw new Error(`Failed to update order status: ${error.message}`);
    }
}

export const cancelOrder = async (orderID: string) => {
    try {
        const batch = firestore.batch();
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new Error('Order not found');
        }
        const order = orderDoc.data() as Order;
        await orderRestoreProductStocks(batch, order.products);
        batch.update(orderRef, { status: OrderStatus.CANCELLED });
        const customerRef = firestore.collection(customerCollection).doc(order.customerId);
        batch.update(customerRef, {
            loyaltyPoints: admin.firestore.FieldValue.increment(order.pointsRedeemed - order.pointsEarned)
        });
        await batch.commit();
        return true;
    } catch (error: any) {
        throw new Error(`Failed to cancel order: ${error.message}`);
    }
};

export const refundOrder = async (orderID: string) => {
    try {
        await updateOrderStatus(orderID, OrderStatus.REFUNDED);
        return true;
    } catch (error: any) {
        throw new Error(`Failed to refund order: ${error.message}`);
    }
}

export const deleteOrder = async (orderID: string) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }

    try {
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new Error('Order not found');
        }
        await orderRef.delete();
    } catch (error: any) {
        throw new Error(`Failed to delete order: ${error.message}`);
    }
};
