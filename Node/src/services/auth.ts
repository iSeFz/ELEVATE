import { admin, verifyCredentialsURL } from '../config/firebase.js';
import { checkMissingCustomerCredentials, checkMissingCustomerRequestData, Customer } from './utils/customer.js';
import axios from 'axios';

const auth = admin.auth();
const firestore = admin.firestore();

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

        await firestore.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            createdAt: new Date(),
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
    const missedCredentials = checkMissingCustomerCredentials({ email, password });
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
}