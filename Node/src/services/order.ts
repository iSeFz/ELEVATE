import { admin } from '../config/firebase.js';
import { checkMissingOrderData, checkMissingOrderUpdateData } from './utils/order.js';
import { Order } from '../types/models/order.js';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = admin.firestore();
const orderCollection = 'order';

export const getAllOrders = async () => {
    try {
        const snapshot = await firestore.collection(orderCollection).get();
        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(error.message);
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
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getOrdersByCustomer = async (customerID: string) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const customerRef = firestore.collection('customer').doc(customerID);
        const snapshot = await firestore.collection(orderCollection)
            .where("customer", "==", customerRef)
            .get();

        const orders: Order[] = [];
        snapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addOrder = async (order: Order) => {
    try {
        const missedOrderData = checkMissingOrderData(order);
        if (missedOrderData) {
            throw new Error(missedOrderData);
        }

        const customId = order.id;
        const { id, ...orderData } = order;
        
        // Set default values if not provided
        if (!orderData.dateCreated) orderData.dateCreated = Timestamp.now();
        if (!orderData.status) orderData.status = 'Pending';
        if (!orderData.pointsRedeemed) orderData.pointsRedeemed = 0;
        
        // Initialize payment and shipment if not provided
        if (!orderData.payment) {
            orderData.payment = {
                dateCreated: Timestamp.now(),
                method: 'Pending',
                price: orderData.price
            };
        }
        
        if (!orderData.shipment) {
            orderData.shipment = {
                dateCreated: Timestamp.now(),
                dateDelivery: undefined,
                fees: 0,
                method: 'Standard'
            };
        }
        
        if (customId) {
            const docRef = firestore.collection(orderCollection).doc(customId);
            await docRef.set(orderData);
            return { id: customId, ...orderData };
        } else {
            const docRef = await firestore.collection(orderCollection).add(orderData);
            return { id: docRef.id, ...orderData };
        }
    } catch (error: any) {
        throw new Error(error.message);
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

        const orderRef = firestore.collection(orderCollection).doc(orderID);
        await orderRef.update(newOrderData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteOrder = async (orderID: string) => {
    if (!orderID) {
        throw new Error('Please provide an order ID');
    }
    try {
        const orderRef = firestore.collection(orderCollection).doc(orderID);
        await orderRef.delete();
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};