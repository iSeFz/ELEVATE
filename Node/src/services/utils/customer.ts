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