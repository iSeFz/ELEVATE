import { admin } from '../config/firebase.js';
import { checkMissingFullCustomerData } from './utils/customer.js';
import { Customer } from '../types/models/customer.js';
import { deleteCredentialsUsingUID } from './auth.js';

const firestore = admin.firestore();
const customerCollection = 'customer';

export const getAllCustomers = async () => {
    try {
        const snapshot = await firestore.collection(customerCollection).get();
        const customers: Customer[] = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() } as Customer);
        });
        return customers;
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
            return { id: docSnap.id, ...docSnap.data() };
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
    try {
        const missedCustomerData = checkMissingFullCustomerData(customer);
        if (missedCustomerData) {
            throw new Error(missedCustomerData);
        }
        const customId = customer.id;
        const { id, ...customerData } = customer;
        
        // Initialize empty collections if not provided
        if (!customerData.orders) customerData.orders = [];
        if (!customerData.wishlist) customerData.wishlist = [];
        if (!customerData.cart) customerData.cart = { subtotal: 0, items: [] };
        
        if (customId) {
            const docRef = firestore.collection(customerCollection).doc(customId);
            await docRef.set(customerData);
            return { id: customId, ...customerData };
        } else {
            const docRef = await firestore.collection(customerCollection).add(customerData);
            return { id: docRef.id, ...customerData };
        }
    } catch (error: any) {
        // Rollback
        if (customer.id) {
            await deleteCredentialsUsingUID(customer.id);
        }
        throw new Error(error.message);
    }
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
