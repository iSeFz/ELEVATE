import { admin } from '../config/firebase.js';
import { checkMissingFullCustomerData } from './utils/customer.js';
import { Customer } from '../types/models/customer.js';
import { deleteCredentialsUsingUID, signup } from './auth.js';

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
