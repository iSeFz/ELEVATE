import { Timestamp } from 'firebase-admin/firestore';
import { Customer } from '../../types/models/customer.js';
import { Staff } from '../../types/models/staff.js';

export const checkMissingCustomerRequestData = (customer: any) => {
    const currentCustomer = customer as Customer;
    if (currentCustomer.username == null || currentCustomer.email == null || currentCustomer.password == null) {
        return 'Please provide at least: username, email , and password';
    }
    if (customer.password.length < 6) {
        return 'Password must be at least 6 characters';
    }
    return null;
};

export const checkMissingFullCustomerData = (customer: any) => {
    const currentCustomer = customer as Customer;
    if (currentCustomer.username == null || currentCustomer.email == null || currentCustomer.password == null
        || currentCustomer.firstName == null || currentCustomer.lastName == null || currentCustomer.phoneNumber == null
        || currentCustomer.imageURL == null || currentCustomer.loyaltyPoints == null) {
        return 'All fields are required';
    }
    return null;
};

export const checkMissingCustomerCredentials = (customer: any) => {
    const currentCustomer = customer as Customer;
    if (currentCustomer.email == null || currentCustomer.password == undefined) {
        return 'All fields are required';
    }
    return null;
}

export const checkMissingStaffCredentials = (staff: any) => {
    const currentStaff = staff as Staff;
    if (currentStaff.email == null || currentStaff.password == undefined) {
        return 'All fields are required';
    }
    return null;
}

export const sanitizeCustomerData = (newCustomerData: any): Partial<Customer> => {
    const excludedFields: Array<keyof Customer> = ['id', 'createdAt', 'password'];
    const sanitizedData: Partial<Customer> = {};

    const productFields: Array<keyof Customer> = [
        'address',
        'cart',
        'email',
        'firstName',
        'lastName',
        'imageURL',
        'loyaltyPoints',
        'orders',
        'phoneNumber',
        'username',
        'wishlist',
        'updatedAt'
    ];

    for (const key in newCustomerData) {
        // Only include fields that are part of the Product interface and not in excluded list
        if (productFields.includes(key as keyof Customer) && !excludedFields.includes(key as keyof Customer)) {
            sanitizedData[key as keyof Customer] = newCustomerData[key];
        }
    }

    return sanitizedData;
};

export const generateEmptyCustomerData = (): Customer => ({
    id: "",
    address: {
        city: "",
        postalCode: 0,
        street: "",
        building: 0,
    },
    cart: {
        items: [],
        subtotal: 0,
        updatedAt: Timestamp.now(),
    },
    email: "",
    firstName: "",
    lastName: "",
    imageURL: "",
    loyaltyPoints: 0,
    orders: {
        total: 0,
        items: [],
    },
    phoneNumber: "",
    username: "",

    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),

    wishlist: [],
});
