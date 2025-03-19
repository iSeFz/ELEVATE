import { admin, verifyCredentialsURL } from '../config/firebase.js';
import axios from 'axios';

const auth = admin.auth();
const firestore = admin.firestore();

export const signup = async (customer: any) => {
    if (!customer.email || !customer.password || !customer.firstName || !customer.lastName || !customer.username || !customer.phoneNumber) {
        throw new Error('All fields are required');
    }

    if (customer.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
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
    if (!email || !password) {
        throw new Error('Email and password are required');
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