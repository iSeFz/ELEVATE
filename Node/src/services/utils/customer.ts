import { Customer, customerDataValidators } from '../../types/models/customer.js';
import { Staff } from '../../types/models/staff.js';
import { AuthError, AuthErrorType } from '../auth.js';
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

export const checkMissingStaffCredentials = (staff: any) => {
    const currentStaff = staff as Staff;
    if (currentStaff.email == null || currentStaff.password == undefined) {
        return 'All fields are required';
    }
    return null;
}

export const generateFullyCustomerData = (customer: Customer): Customer => {
    const fullyData: Customer = {
        id: customer.id ?? "",
        address: customer.address ?? {
            city: "",
            postalCode: 0,
            street: "",
            building: 0,
        },
        cart: {
            items: customer.cart?.items ?? [],
            subtotal: customer.cart?.subtotal ?? 0,
            updatedAt: convertToTimestamp(customer.cart?.updatedAt),
        },
        email: customer.email ?? "",
        password: customer.password ?? "",
        firstName: customer.firstName ?? "",
        lastName: customer.lastName ?? "",
        imageURL: customer.imageURL ?? "",
        loyaltyPoints: customer.loyaltyPoints ?? 0,
        orders: customer.orders ?? {
            total: 0,
            items: [],
        },
        phoneNumber: customer.phoneNumber ?? "",
        username: customer.username ?? "",

        createdAt: convertToTimestamp(customer.createdAt),
        updatedAt: convertToTimestamp(customer.updatedAt),

        wishlist: customer.wishlist ?? [],
    };

    if (!customerDataValidators(fullyData)) {
        throw new AuthError(
            "Invalid customer data, check types and formats",
            AuthErrorType.INVALID_DATA_TYPES,
        );
    }

    return fullyData;
}
