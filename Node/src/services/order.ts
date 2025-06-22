import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import * as OrderUtils from './utils/order.js';
import { Order, OrderStatus } from '../types/models/order.js';
import { Timestamp } from 'firebase-admin/firestore';
import { Product } from '../types/models/product.js';
import { getCustomer } from './customer.js';
import { Address } from '../types/models/common.js';
import { getBrand } from './brand.js';
import { v4 as uuidv4 } from 'uuid';
import { ORDER_TIMEOUT_SEC, shipmentType as SHIPMMENT_TYPES } from '../config/order.js';
import { updateProductAssociations } from './productAssociation.js';

const firestore = admin.firestore();
const orderCollection = FIREBASE_COLLECTIONS['order'];
const customerCollection = FIREBASE_COLLECTIONS['customer'];

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

        const itemsByProduct = new Map<string, { product: typeof addedOrderData.products[0], index: number }[]>();
        addedOrderData.products.forEach((item, index) => {
            if (!itemsByProduct.has(item.productId)) {
                itemsByProduct.set(item.productId, []);
            }
            itemsByProduct.get(item.productId)!.push({
                product: item,
                index: index
            });
        });

        let totalPrice = 0;
        let brandIds = new Set<string>();

        for (const [productId, productItems] of itemsByProduct) {
            const productRef = firestore.collection(FIREBASE_COLLECTIONS['product']).doc(productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                throw new Error(`Product with ID ${productId} not found`);
            }

            const productData = productDoc.data()! as Product;
            const updatedVariants = [...productData.variants];
            // Update all variants for this product
            for (const item of productItems) {
                const variantIndex = updatedVariants.findIndex(v => v.id === item.product.variantId);
                if (variantIndex === -1) {
                    throw new Error(`Variant with ID ${item.product.variantId} not found in product ${productId}`);
                }
                if (updatedVariants[variantIndex].stock < item.product.quantity) {
                    throw new Error(`Not enough stock for variant ${item.product.variantId} in product ${productId}, 
                        requested ${item.product.quantity}, available ${updatedVariants[variantIndex].stock}`);
                }
                updatedVariants[variantIndex].stock -= item.product.quantity;

                // Fill denormalized fields
                addedOrderData.products[item.index] = {
                    ...item.product, // Item product has these fields: variantId, productId, quantity
                    productName: productData.name,
                    brandId: productData.brandId,
                    brandName: productData.brandName,
                    colors: updatedVariants[variantIndex].colors ?? [],
                    size: updatedVariants[variantIndex].size,
                    price: updatedVariants[variantIndex].price,
                    imageURL: updatedVariants[variantIndex].images[0] ?? productData.variants[0].images[0] ?? "",
                };

                // Accumulate total price
                totalPrice += updatedVariants[variantIndex].price * item.product.quantity;
            }

            // Add brand ID to the set
            brandIds.add(productData.brandId);
            // Update the variant stock in the batch
            // Note: This will update the stock for all variants of this product
            batch.update(productRef, { variants: updatedVariants });
        }

        // Set the calculated price
        addedOrderData.price = totalPrice;
        addedOrderData.shipment = {} as Order['shipment']; // Initialize shipment as empty
        addedOrderData.payment = {} as Order['payment']; // Initialize payment as empty
        addedOrderData.status = OrderStatus.PENDING; // Set initial status
        addedOrderData.brandIds = Array.from(brandIds); // Convert Set to Array

        batch.set(orderDoc, addedOrderData);

        await batch.commit();
        return { ...addedOrderData, id: orderDoc.id };
    } catch (error: any) {
        throw new Error(`Failed to add order: ${error.message}`);
    }
};

export const calculateShipmentFees = async (
    customerAddress: Address,
    shipmentType: typeof SHIPMMENT_TYPES[keyof typeof SHIPMMENT_TYPES],
    productItems: { productId: string, quantity: number }[]
) => {
    if (shipmentType === SHIPMMENT_TYPES["pickup"]) {
        return {
            totalFees: 0,
            breakdown: [],
            carrier: 'N/A', // No carrier for pickup
            estimatedDeliveryDays: 0,
            method: SHIPMMENT_TYPES["pickup"],
            createdAt: Timestamp.now(),
            trackingNumber: '', // No tracking for pickup
        } as Order['shipment'];
    }

    // 1. Get unique brands from products
    const uniqueBrandIds = await OrderUtils.getUniqueBrandsFromProducts(productItems);

    let totalFees = 0;
    const feeBreakdown = [];
    let estimatedDeliveryDays = 0;

    // 2. Calculate fee for each brand
    for (const brandId of uniqueBrandIds) {
        const brand = await getBrand(brandId);
        if (!brand?.addresses?.length) continue;

        // 3. Find nearest branch
        const { distance: nearestDistance, nearestBranch } = OrderUtils.findNearestBranch(customerAddress, brand.addresses);

        // 4. Calculate fee for this brand
        // const brandFee = Math.max(BASE_FEE, nearestDistance * PRICE_PER_KM);
        const brandDelivery = OrderUtils.calculateEstimatedDelivery(nearestDistance, shipmentType)
        totalFees += brandDelivery.fee;
        estimatedDeliveryDays = Math.max(estimatedDeliveryDays, brandDelivery.days);

        feeBreakdown.push({
            brandId,
            brandName: brand.brandName,
            distance: nearestDistance,
            nearestBranch,
            fee: brandDelivery.fee
        });
    }

    // 5. Calculate weight surcharge
    const orderWeight = OrderUtils.calculateOrderWeight(productItems.map(item => item.quantity));
    const weightSurcharge = OrderUtils.calculateWeightSurcharge(orderWeight);

    const orderShipment: Order['shipment'] = {
        totalFees: totalFees * (shipmentType === SHIPMMENT_TYPES["express"] ? 2 : 1) + weightSurcharge, // Double for express shipment
        breakdown: feeBreakdown,
        estimatedDeliveryDays,
        method: shipmentType,
        createdAt: Timestamp.now(),
        trackingNumber: '', // This can be set later when shipment is confirmed
        carrier: 'Bosta', // Assuming Bosta is the carrier
    };

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

        // Check if confirmation is within the allowed time frame
        const createdAt = confirmedOrderData.createdAt as Timestamp;
        if ((Timestamp.now().seconds - createdAt.seconds) > ORDER_TIMEOUT_SEC) {
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
        await updateProductAssociations(confirmedOrderData.products);

        return confirmedOrderData;
    } catch (error: any) {
        throw new Error(`Failed to confirm order: ${error.message}`);
    }
};

/**
 * Restores product stocks for the products in an order (Don't miss to commit the batch after calling this function)
 * @param batch  The Firestore batch to perform the updates
 * @param products  The products in the order to restore stocks for
 */
const orderRestoreProductStocks = async (batch: admin.firestore.WriteBatch, products: Order['products']) => {
    const itemsByProduct = new Map<string, typeof products>();
    products.forEach((item) => {
        if (!itemsByProduct.has(item.productId)) {
            itemsByProduct.set(item.productId, []);
        }
        itemsByProduct.get(item.productId)!.push(item);
    });
    // Restore product stock
    for (const [productId, productItems] of itemsByProduct) {
        const productRef = firestore.collection(FIREBASE_COLLECTIONS['product']).doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) continue;
        const productData = productDoc.data();
        const updatedVariants = [...productData!.variants];

        for (const item of productItems) {
            const variantIndex = updatedVariants.findIndex((v: any) => v.id === item.variantId);
            if (variantIndex === -1) continue;
            updatedVariants[variantIndex].stock += item.quantity;
        }

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

export const cleanupExpiredOrders = async () => {
    try {
        const timeoutThreshold = Timestamp.fromDate(
            new Date(Date.now() - ORDER_TIMEOUT_SEC * 1000)
        );

        // Query pending orders older than timeout threshold
        const expiredOrdersSnapshot = await firestore
            .collection(FIREBASE_COLLECTIONS['order'])
            .where('status', '==', OrderStatus.PENDING)
            .where('createdAt', '<=', timeoutThreshold)
            .orderBy('createdAt', 'desc')
            .get();

        if (expiredOrdersSnapshot.empty) {
            return;
        }

        let processedCount = 0;
        // Process each expired order
        for (const orderDoc of expiredOrdersSnapshot.docs) {
            // Restore stock for each product in the order
            await cancelOrder(orderDoc.id);
            processedCount++;
        }

        return processedCount;
    } catch (error) {
        console.error('Error in order cleanup:', error);
        throw error;
    }
};