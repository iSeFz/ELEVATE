import { Customer } from '../../types/models/customer.js';
import { convertToTimestamp } from './common.js';

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

const emptyCustomer: Customer = {
    addresses: [],
    cart: {
        items: [],
        subtotal: 0,
        updatedAt: "",
    },
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    imageURL: "",
    loyaltyPoints: 0,
    phoneNumber: "",
    username: "",
    createdAt: "",
    updatedAt: "",
    wishlist: [],
};

export const generateFullyCustomerData = (customer: Customer): Customer => {
    const fullyData: Customer = {
        addresses: customer.addresses ?? emptyCustomer.addresses,
        cart: {
            items: customer.cart?.items ?? emptyCustomer.cart.items,
            subtotal: customer.cart?.subtotal ?? emptyCustomer.cart.subtotal,
            updatedAt: convertToTimestamp(customer.cart?.updatedAt),
        },
        email: customer.email ?? emptyCustomer.email,
        password: customer.password ?? emptyCustomer.password,
        firstName: customer.firstName ?? emptyCustomer.firstName,
        lastName: customer.lastName ?? emptyCustomer.lastName,
        imageURL: customer.imageURL ?? emptyCustomer.imageURL,
        loyaltyPoints: customer.loyaltyPoints ?? emptyCustomer.loyaltyPoints,
        phoneNumber: customer.phoneNumber ?? emptyCustomer.phoneNumber,
        username: customer.username ?? emptyCustomer.username,

        createdAt: convertToTimestamp(customer.createdAt),
        updatedAt: convertToTimestamp(customer.updatedAt),

        wishlist: customer.wishlist ?? [],
    };
    if (customer.id) {
        fullyData.id = customer.id;
    }

    return fullyData;
}
