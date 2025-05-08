import { admin } from '../config/firebase.js';
import { Customer } from '../types/models/customer.js';
import { deleteCredentialsUsingUID } from './auth.js';

const firestore = admin.firestore();
const customerCollection = 'customer';

export const getAllCustomers = async (page = 1) => {
    const limit = 10; // Fixed limit of 10 customers per page
    const offset = (page - 1) * limit;

    try {
        // More efficient approach without using count()
        const snapshot = await firestore.collection(customerCollection)
            .orderBy('createdAt', 'desc') // Order by creation date, newest first
            .limit(limit)
            .offset(offset)
            .get();

        const customers: Customer[] = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() } as Customer);
        });

        // Get one more document to check if there's a next page
        const nextPageSnapshot = await firestore.collection(customerCollection)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .offset(offset + limit)
            .get();

        const hasNextPage = !nextPageSnapshot.empty;

        return {
            customers,
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

export const getCustomer = async (customerID: string) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const docRef = firestore.collection(customerCollection).doc(customerID);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Customer;
        } else {
            return null;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getCustomerWithEmail = async (customerEmail: string) => {
    if (!customerEmail) {
        throw new Error('Please provide a customer Email');
    }
    try {
        const snapshot = await firestore.collection(customerCollection)
            .where("email", "==", customerEmail)
            .get();

        const customers: Customer[] = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() } as Customer);
        });
        return customers;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const addCustomer = async (customer: Customer) => {
    // No implementation as the add customer logic is the same as signup
};

export const updateCustomer = async (customerID: string, newCustomerData: any) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const customerRef = firestore.collection(customerCollection).doc(customerID);
        await customerRef.update(newCustomerData);
        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteCustomer = async (customerID: string) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        // First, delete the customer from Firestore
        const customerRef = firestore.collection(customerCollection).doc(customerID);
        await customerRef.delete();

        // Then, delete the customer from Firebase Authentication
        await deleteCredentialsUsingUID(customerID);

        return true;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getCustomerOrders = async (customerID: string, page = 1) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }

    const limit = 10; // Fixed limit of 10 orders per page
    const offset = (page - 1) * limit;

    try {
        // First, get the customer to retrieve their order IDs
        const customerDoc = await firestore.collection(customerCollection).doc(customerID).get();

        if (!customerDoc.exists) {
            throw new Error('Customer not found');
        }

        const customerData = customerDoc.data() as Customer;
        const orderIds = customerData.orders?.items || [];

        if (orderIds.length === 0) {
            return {
                orders: [],
                pagination: {
                    page,
                    limit,
                    hasNextPage: false
                }
            };
        }

        // Get the paginated slice of order IDs
        const paginatedOrderIds = orderIds.slice(offset, offset + limit);

        // Check if there's a next page
        const hasNextPage = orderIds.length > offset + limit;

        // Fetch the actual order documents
        const orderPromises = paginatedOrderIds.map(orderId =>
            firestore.collection('order').doc(orderId).get()
        );

        const orderDocs = await Promise.all(orderPromises);

        // Transform the order docs into order objects
        const orders = orderDocs.map(doc => {
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        }).filter(order => order !== null); // Filter out any null values (orders that might be deleted)

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
