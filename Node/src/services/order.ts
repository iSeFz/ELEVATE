import { admin } from '../config/firebase.js';
import { calculateOrderTotal, checkMissingOrderData, checkMissingOrderUpdateData, validateCustomerPoints, calculateLoyaltyPointsEarned } from './utils/order.js';
import { Order, OrderStatus } from '../types/models/order.js';
import { Timestamp } from 'firebase-admin/firestore';
import * as productService from './product.js';

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
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get all orders: ${error.message}`);
    }
};

export const getOrder = async (orderID: string) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }
    try {
        const docRef = firestore.collection(orderCollection).doc(orderID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(`Failed to get order: ${error.message}`);
    }
};

export const getOrdersByCustomer = async (customerID: string) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const snapshot = await firestore.collection(orderCollection)
            .where("customerId", "==", customerID)
            .orderBy('createdAt', 'desc')
            .get();

        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get customer orders: ${error.message}`);
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
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get orders by product: ${error.message}`);
    }
};

export const addOrder = async (order: Order) => {
    try {
        const missedOrderData = checkMissingOrderData(order);
        if (missedOrderData) {
            throw new Error(missedOrderData);
        }

        const customId = order.id;
        const totalPrice = await calculateOrderTotal(order);

        // Check if customer has enough loyalty points to redeem
        if (order.pointsRedeemed > 0) {
            const hasEnoughPoints = await validateCustomerPoints(order.customerId, order.pointsRedeemed);
            if (!hasEnoughPoints) {
                throw new Error('Customer does not have enough loyalty points for this redemption');
            }
        }

        // Calculate loyalty points earned from this order
        const pointsEarned = calculateLoyaltyPointsEarned(totalPrice);

        const orderData: Order = {
            customerId: order.customerId,
            address: order.address,
            phoneNumber: order.phoneNumber,
            pointsRedeemed: order.pointsRedeemed || 0,
            price: totalPrice,
            status: order.status || OrderStatus.PENDING,
            createdAt: order.createdAt || Timestamp.now(),
            updatedAt: order.updatedAt || Timestamp.now(),
            payment: order.payment || {
                createdAt: Timestamp.now(),
                method: 'Pending',
                price: totalPrice,
            },
            shipment: order.shipment || {
                createdAt: Timestamp.now(),
                fees: 0,
                method: 'Standard'
            },
            products: order.products,
        }

        let docId: string;
        const batch = firestore.batch();

        // Create the order
        if (customId) {
            const docRef = firestore.collection(orderCollection).doc(customId);
            batch.set(docRef, orderData);
            docId = customId;
        } else {
            const docRef = firestore.collection(orderCollection).doc();
            batch.set(docRef, orderData);
            docId = docRef.id;
        }

        // Update the customer's orders array, subtract redeemed points, and add earned points
        if (orderData.customerId) {
            const customerRef = firestore.collection(customerCollection).doc(orderData.customerId);
            batch.update(customerRef, {
                orders: admin.firestore.FieldValue.arrayUnion(docId),
                loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned - orderData.pointsRedeemed)
            });
        }

        // Update product variant stock levels
        for (const item of orderData.products) {
            const productRef = firestore.collection('product').doc(item.productId);
            const productDoc = await productRef.get();
            
            if (!productDoc.exists) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            
            const productData = productDoc.data();
            const variants = productData?.variants || [];
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

        await batch.commit();
        return { ...orderData, id: docId };
    } catch (error: any) {
        throw new Error(`Failed to add order: ${error.message}`);
    }
};

export const updateOrder = async (orderID: string, newOrderData: Partial<Order>) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }

    try {
        const missedUpdateData = checkMissingOrderUpdateData(newOrderData);
        if (missedUpdateData) {
            throw new Error(missedUpdateData);
        }

        // Always update the updatedAt timestamp
        newOrderData.updatedAt = Timestamp.now();

        const orderRef = firestore.collection(orderCollection).doc(orderID);
        await orderRef.update(newOrderData);
        return true;
    } catch (error: any) {
        throw new Error(`Failed to update order: ${error.message}`);
    }
};

export const deleteOrder = async (orderID: string) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }
    try {
        // Get the order first to retrieve the customerId
        const orderDoc = await firestore.collection(orderCollection).doc(orderID).get();

        if (!orderDoc.exists) {
            throw new Error('Order not found');
        }

        const orderData = orderDoc.data() as Order;
        const batch = firestore.batch();

        // Delete the order
        batch.delete(firestore.collection(orderCollection).doc(orderID));

        // Remove the order from customer's orders array
        if (orderData.customerId) {
            const customerRef = firestore.collection(customerCollection).doc(orderData.customerId);
            batch.update(customerRef, {
                orders: admin.firestore.FieldValue.arrayRemove(orderID)
            });
        }

        await batch.commit();
        return true;
    } catch (error: any) {
        throw new Error(`Failed to delete order: ${error.message}`);
    }
};

export const cancelOrder = async (orderID: string) => {
    try {
        // Update order status to cancelled
        await updateOrder(orderID, { status: OrderStatus.CANCELLED });
        return true;
    } catch (error: any) {
        throw new Error(`Failed to cancel order: ${error.message}`);
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
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(`Failed to get orders by status: ${error.message}`);
    }
};