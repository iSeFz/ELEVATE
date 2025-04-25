import { admin, verifyCredentialsURL } from '../config/firebase.js';
import axios from 'axios';
import { Customer } from '../types/models/customer.js';
import { Staff } from '../types/models/staff.js';
import { checkMissingCustomerRequestData } from './utils/customer.js';
import { checkMissingStaffData } from './utils/staff.js';

const auth = admin.auth();
const firestore = admin.firestore();

// Helper function to check auth credentials
const checkMissingCredentials = (credentials: { email?: string, password?: string }) => {
    if (!credentials.email) {
        return 'Email is required';
    }
    if (!credentials.password) {
        return 'Password is required';
    }
    return null;
};

export const signup = async (customer: Customer) => {
    const missedCustomerData = checkMissingCustomerRequestData(customer);
    if (missedCustomerData) {
        throw new Error(missedCustomerData);
    }

    try {
        const userRecord = await auth.createUser({
            email: customer.email,
            password: customer.password,
            emailVerified: false,
        });

        auth.setCustomUserClaims(userRecord.uid, { role: 'customer' });

        // Remove password from data stored in Firestore
        const { password, id, ...customerData } = customer;
        
        // Set defaults for new customer
        if (!customerData.loyaltyPoints) customerData.loyaltyPoints = 0;
        customerData.role = 'customer';
        if (!customerData.orders) customerData.orders = [];
        customerData.cart = undefined;
        if (!customerData.wishlist) customerData.wishlist = [];
        
        // Save customer data to Firestore
        await firestore.collection('customer').doc(userRecord.uid).set({
            ...customerData,
            createdAt: new Date()
        });

        return userRecord;
    } catch (error: any) {
        const errorCode = error.code || '';
        let errorMessage = error.message;

        if (errorCode === 'auth/email-already-exists') {
            errorMessage = 'The email address is already in use by another account.';
        } else if (errorCode === 'auth/invalid-email') {
            errorMessage = 'The email address is not valid.';
        } else if (errorCode === 'auth/invalid-password') {
            errorMessage = 'The password is invalid.';
        }

        throw new Error(errorMessage);
    }
};

export const login = async (email: string, password: string) => {
    const missedCredentials = checkMissingCredentials({ email, password });
    if (missedCredentials) {
        throw new Error(missedCredentials);
    }

    try {
        const response = await axios.post(verifyCredentialsURL, {
            email,
            password,
            returnSecureToken: true
        });

        const { localId: uid } = response.data;

        // Get additional user data from Firestore
        const userDoc = await firestore.collection('customer').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        const customToken = await auth.createCustomToken(uid);

        return {
            user: {
                id: uid,
                email,
                ...userData
            },
            token: customToken
        };
    } catch (error: any) {
        const errorMessage = 'Authentication failed. Please check your email and password.';
        throw new Error(errorMessage);
    }
};

export const deleteCredentialsUsingEmailAndPassword = async (email: string, password: string) => {
    try {
        const response = await axios.post(verifyCredentialsURL, {
            email,
            password,
            returnSecureToken: true
        });

        const { localId: uid } = response.data;

        await auth.deleteUser(uid);

        return "User deleted successfully";
    } catch (error: any) {
        const errorMessage = 'Authentication failed. Please check your email and password.';
        throw new Error(errorMessage);
    }
};

export const deleteCredentialsUsingUID = async (uid: string) => {
    try {
        await auth.deleteUser(uid);
        return "User deleted successfully";
    } catch (error: any) {
        const errorMessage = 'Authentication failed. Please check your email and password.';
        throw new Error(errorMessage);
    }
};

// Staff-related functions
export const staffSignup = async (staff: Staff) => {
    const missedStaffData = checkMissingStaffData(staff);
    if (missedStaffData) {
        throw new Error(missedStaffData);
    }

    try {
        const userRecord = await auth.createUser({
            email: staff.email,
            password: staff.password,
            emailVerified: false,
        });

        auth.setCustomUserClaims(userRecord.uid, { role: 'staff' });

        // Remove password from data stored in Firestore
        const { password, id, ...staffData } = staff;
        
        // Set default role if not provided
        staffData.role = 'staff';
        
        await firestore.collection('staff').doc(userRecord.uid).set({
            ...staffData,
            createdAt: new Date()
        });

        return userRecord;
    } catch (error: any) {
        const errorCode = error.code ?? '';
        let errorMessage = error.message;

        if (errorCode === 'auth/email-already-exists') {
            errorMessage = 'The email address is already in use by another account.';
        } else if (errorCode === 'auth/invalid-email') {
            errorMessage = 'The email address is not valid.';
        } else if (errorCode === 'auth/invalid-password') {
            errorMessage = 'The password is invalid.';
        }

        throw new Error(errorMessage);
    }
};