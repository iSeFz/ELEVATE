import { admin, SEND_RESET_EMAIL_URL, verifyCredentialsURL } from '../config/firebase.js';
import axios from 'axios';
import { Customer } from '../types/models/customer.js';
import { Staff } from '../types/models/staff.js';
import { BrandOwner } from '../types/models/brandOwner.js';
import { generateFullyCustomerData } from './utils/customer.js';
import { generateFullyStaffData } from './utils/staff.js';
import { generateFullyBrandOwnerData } from './utils/brandOwner.js';

const auth = admin.auth();
const firestore = admin.firestore();

// Authentication error types
export enum AuthErrorType {
    MISSING_CREDENTIALS = 'missing_credentials',
    INVALID_EMAIL = 'invalid_email',
    INVALID_PASSWORD = 'invalid_password',
    EMAIL_ALREADY_EXISTS = 'email_already_exists',
    USER_NOT_FOUND = 'user_not_found',
    TOO_MANY_ATTEMPTS = 'too_many_attempts',
    INVALID_SIGNUP_DATA = 'invalid_signup_data',
    INVALID_DATA_TYPES = 'invalid_data_types',
    WEAK_PASSWORD = 'weak_password',
    SERVER_ERROR = 'server_error',
    USER_DISABLED = 'user_disabled',
    UNKNOWN_ERROR = 'unknown_error'
}

// Custom error class for authentication errors
export class AuthError extends Error {
    type: AuthErrorType;
    code: string;
    statusCode: number;

    constructor(message: string, type: AuthErrorType, code = '', statusCode = 400) {
        super(message);
        this.type = type;
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AuthError';
    }
}

// Generic signup function that handles different user types
export const genericSignup = async (userData: any, userType: 'customer' | 'staff' | 'brandOwner', otherClaims = {}) => {
    // Validate data based on user type
    let missedData = null;

    try {
        if (userType === 'customer') {
            userData = generateFullyCustomerData(userData);
        } else if (userType === 'staff') {
            userData = generateFullyStaffData(userData);
        } else if (userType === 'brandOwner') {
            userData = generateFullyBrandOwnerData(userData);
        }
        if (missedData) {
            throw new AuthError(
                missedData,
                AuthErrorType.INVALID_SIGNUP_DATA,
                'auth/invalid-signup-data',
                400
            );
        }
        const userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            emailVerified: false,
        });

        auth.setCustomUserClaims(userRecord.uid, { role: userType, ...otherClaims });

        // Remove password from data stored in Firestore
        const { password, id, ...cleanedData } = userData;

        // Save user data to Firestore
        await firestore.collection(userType).doc(userRecord.uid).set(cleanedData);

        return userRecord;
    } catch (error: any) {
        console.error('Error in AUTH file:', error);
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(error.message, AuthErrorType.UNKNOWN_ERROR);
    }
};

// Type-specific signup functions that use the generic function
export const customerSignup = async (customer: Customer) => {
    return await genericSignup(customer, 'customer');
};

export const staffSignup = async (staff: Staff) => {
    return genericSignup(staff, 'staff');
};

export const brandOwnerSignup = async (brandOwner: BrandOwner) => {
    return await genericSignup(brandOwner, 'brandOwner');
};

// Enhanced base login function that handles common functionality
export const baseLogin = async (email: string, password: string, userType: 'customer' | 'brandOwner' | 'staff') => {
    try {
        // Authenticate with Firebase
        const response = await axios.post(verifyCredentialsURL, {
            email,
            password,
            returnSecureToken: true
        });

        const { localId: uid, idToken } = response.data;

        // Get user data from Firestore based on user type
        const userDoc = await firestore.collection(userType).doc(uid).get();

        if (!userDoc.exists) {
            throw new AuthError(
                `No ${userType} found with this email address.`,
                AuthErrorType.USER_NOT_FOUND,
                'auth/user-not-found',
                404
            );
        }

        const userData = userDoc.data();

        // Return standardized user object
        return {
            user: {
                id: uid,
                email,
                role: userType,
                collectionName: userType,
                ...userData
            },
            token: idToken
        };
    } catch (error) {
        if (error instanceof AuthError) {
            throw error;
        }
        throw new AuthError(
            'Authentication failed. Please check your email and password.',
            AuthErrorType.UNKNOWN_ERROR,
            'auth/unknown-error',
            401
        );
    }
};

// Simplified customer login function
export const customerLogin = async (email: string, password: string) => {
    return baseLogin(email, password, 'customer');
};

// Simplified brand owner login function
export const brandOwnerLogin = async (email: string, password: string) => {
    return baseLogin(email, password, 'brandOwner');
};

// Simplified staff login function
export const staffLogin = async (email: string, password: string) => {
    return baseLogin(email, password, 'staff');
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
        // Handle axios errors specifically
        if (error.response) {
            const firebaseError = error.response.data.error ?? {};

            switch (firebaseError.message) {
                case 'EMAIL_NOT_FOUND':
                    throw new AuthError(
                        'No user found with this email address.',
                        AuthErrorType.USER_NOT_FOUND,
                        'auth/user-not-found',
                        404
                    );
                case 'INVALID_PASSWORD':
                    throw new AuthError(
                        'Incorrect password. Please try again.',
                        AuthErrorType.INVALID_PASSWORD,
                        'auth/wrong-password',
                        401
                    );
                default:
                    throw new AuthError(
                        'Authentication failed. Please check your email and password.',
                        AuthErrorType.UNKNOWN_ERROR,
                        firebaseError.message ?? 'auth/unknown-error',
                        401
                    );
            }
        }

        // If it's already our custom AuthError, just rethrow it
        if (error instanceof AuthError) {
            throw error;
        }

        throw new AuthError(
            'Failed to delete user. Please try again later.',
            AuthErrorType.SERVER_ERROR,
            'auth/server-error',
            500
        );
    }
};

export const deleteCredentialsUsingUID = async (uid: string) => {
    try {
        if (!uid) {
            throw new AuthError(
                'User ID is required',
                AuthErrorType.MISSING_CREDENTIALS,
                'auth/missing-uid',
                400
            );
        }

        await auth.deleteUser(uid);
        return "User deleted successfully";
    } catch (error: any) {
        if (error instanceof AuthError) {
            throw error;
        }

        if (error.code === 'auth/user-not-found') {
            throw new AuthError(
                'No user found with this ID.',
                AuthErrorType.USER_NOT_FOUND,
                'auth/user-not-found',
                404
            );
        }

        throw new AuthError(
            'Failed to delete user. Please try again later.',
            AuthErrorType.SERVER_ERROR,
            error.code ?? 'auth/server-error',
            500
        );
    }
};

export const sendPasswordResetEmail = async (email: string) => {
    try {
        await axios.post(SEND_RESET_EMAIL_URL, {
            requestType: 'PASSWORD_RESET',
            email,
        });
        return true;
    } catch (error: any) {
        if (error.response?.data?.error?.message === 'EMAIL_NOT_FOUND') {
            // For security, don't reveal if email exists
            return true;
        }
        throw new AuthError(
            'Failed to send password reset email.',
            AuthErrorType.SERVER_ERROR,
            error.code ?? 'auth/server-error',
            500
        );
    }
};
