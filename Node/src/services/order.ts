import { admin } from '../config/firebase.js';
import { calculateOrderProductsCost, validateCustomerPoints, calculateLoyaltyPointsEarned, generateFullyOrderData, updatePriceWithRedeemedPoints } from './utils/order.js';
import { Order, OrderStatus, Shipment } from '../types/models/order.js';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = admin.firestore();
const orderCollection = 'order';
const customerCollection = 'customer';

export const getAllOrders = async () => {
    try {
        const snapshot = await firestore.collection(orderCollection)
            .orderBy('createdAt', 'desc')
            .get();

        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ ...doc.data(), id: doc.id } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get all orders: ${error.message}`);
    }
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

export const getOrdersByProduct = async (productID: string) => {
    if (!productID) {
        throw new Error('Please provide a product ID');
    }
    try {
        const snapshot = await firestore.collection(orderCollection)
            .where("products", "array-contains", {
                productId: productID
            })
            .orderBy('createdAt', 'desc')
            .get();

        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ ...doc.data(), id: doc.id } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get orders by product: ${error.message}`);
    }
};

export const getCustomerOrders = async (customerID: string, page = 1) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }

    const limit = 10; // Fixed limit of 10 orders per page
    const offset = (page - 1) * limit;

    try {
        // Query the order collection for orders belonging to this customer
        const orderQuery = firestore.collection(orderCollection)
            .where('customerId', '==', customerID)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset(offset);

        const snapshot = await orderQuery.get();
        const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
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

export const getOrdersByStatus = async (status: OrderStatus) => {
    try {
        const snapshot = await firestore.collection(orderCollection)
            .where("status", "==", status)
            .orderBy('createdAt', 'desc')
            .get();

        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ ...doc.data(), id: doc.id } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get orders by status: ${error.message}`);
    }
};

export const addOrder = async (order: Order) => {
    try {
        const orderData = generateFullyOrderData(order);
        const orderDoc = firestore.collection(orderCollection).doc();
        const batch = firestore.batch();
        // Create the order
        batch.set(orderDoc, orderData);

        // Update product variant stock levels once the order is created
        // Rollback if the time from creation to update is too long (10 minutes)
        for (const item of orderData.products) {
            const productRef = firestore.collection('product').doc(item.productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            const productData = productDoc.data();
            const variants = productData?.variants ?? [];
            const variantIndex = variants.findIndex((v: any) => v.id === item.variantId);

            if (variantIndex === -1) {
                throw new Error(`Variant with ID ${item.variantId} not found in product ${item.productId}`);
            }

            // Check if there's enough stock
            if (variants[variantIndex].stock < item.quantity) {
                throw new Error(`Not enough stock for variant ${item.variantId} in product ${item.productId}`);
            }

            // Update the variant stock
            const updatedVariants = [...variants];
            updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                stock: updatedVariants[variantIndex].stock - item.quantity
            };

            batch.update(productRef, { variants: updatedVariants });
        }

        // Calculate final price
        const totalPrice = await calculateOrderProductsCost(order);
        order.price = totalPrice;
        order.shipment = getShipmentDetails(order);

        await batch.commit();
        return { ...orderData, id: orderDoc.id };
    } catch (error: any) {
        throw new Error(`Failed to add order: ${error.message}`);
    }
};

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

        // Check if the order is already confirmed
        if (confirmedOrderData.status !== OrderStatus.PENDING) {
            throw new Error('Order is already confirmed or cannot be modified');
        }

        // Check if confirmation is within 10 minutes of creation
        const now = Timestamp.now();
        const createdAt = confirmedOrderData.createdAt as Timestamp;
        const tenMinutes = 10 * 60; // seconds
        if ((now.seconds - createdAt.seconds) > tenMinutes) {
            // Rollback the order
            await orderRestoreProductStocks(confirmedOrderData);
            batch.update(orderRef, { status: OrderStatus.CANCELLED });
            throw new Error('Order confirmation time expired. Order has been cancelled and stock restored.');
        }

        // Check if customer has enough loyalty points to redeem
        remainingOrderData.pointsRedeemed ??= 0;
        if (remainingOrderData.pointsRedeemed > 0) {
            const hasEnoughPoints = await validateCustomerPoints(confirmedOrderData.customerId, remainingOrderData.pointsRedeemed);
            if (!hasEnoughPoints) {
                // Rollback the order
                await orderRestoreProductStocks(confirmedOrderData);
                batch.update(orderRef, { status: OrderStatus.CANCELLED });
                throw new Error('Customer does not have enough loyalty points for this redemption');
            }
        }

        const pointsEarned = calculateLoyaltyPointsEarned(confirmedOrderData.price);
        const priceRedeeemed = updatePriceWithRedeemedPoints(confirmedOrderData.price, remainingOrderData.pointsRedeemed);
        remainingOrderData.pointsRedeemed -= priceRedeeemed.surplusPoints;
        // Update the customer's earned points
        if (customerId) {
            const customerRef = firestore.collection(customerCollection).doc(customerId);
            batch.update(customerRef, {
                loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned - remainingOrderData.pointsRedeemed)
            });
        }

        // Update order details
        confirmedOrderData.updatedAt = now;
        confirmedOrderData.price = priceRedeeemed.updatedPrice;
        confirmedOrderData.status = OrderStatus.PROCESSING;
        confirmedOrderData.address = remainingOrderData.address!;
        confirmedOrderData.phoneNumber = remainingOrderData.phoneNumber!;
        confirmedOrderData.pointsRedeemed = remainingOrderData.pointsRedeemed;
        confirmedOrderData.payment = remainingOrderData.payment!;
        batch.update(orderRef, { ...confirmedOrderData });
        await batch.commit();
        return true;
    } catch (error: any) {
        throw new Error(`Failed to confirm order: ${error.message}`);
    }
};

const orderRestoreProductStocks = async (order: Order) => {
    const batch = firestore.batch();
    // Restore product stock
    for (const item of order.products) {
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
    await batch.commit();
}

const getShipmentDetails = (order: Order) => {
    const shipmentDetails: Shipment = {
        createdAt: Timestamp.now(),
        fees: 50,
        method: "Carrier",
        trackingNumber: "123456789",
        carrier: "Bosta",
        deliveredAt: order.shipment.deliveredAt,
    }
    return shipmentDetails;
}

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
        await updateOrderStatus(orderID, OrderStatus.CANCELLED);
        // Rollback the order
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            throw new Error('Order not found');
        }
        const order = orderDoc.data() as Order;
        await orderRestoreProductStocks(order);
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

        const order = orderDoc.data() as Order;

        // Check if the order is already confirmed
        if (order.status !== OrderStatus.PENDING) {
            throw new Error('Order is already confirmed or cannot be deleted');
        }

        await orderRef.delete();
    } catch (error: any) {
        throw new Error(`Failed to delete order: ${error.message}`);
    }
};
