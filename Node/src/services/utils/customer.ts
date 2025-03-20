export type Customer = {
    id: string;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    imageURL: string;
    loyaltyPoints: number;
}

export const checkMissingCustomerRequestData = (customer: any) => {
    const currentCustomer: Customer = customer;
    if (currentCustomer.username == null || currentCustomer.email == null || currentCustomer.password == null
        || currentCustomer.firstName == null || currentCustomer.lastName == null || currentCustomer.phoneNumber == null) {
        return 'All fields are required';
    }
    if (customer.password.length < 6) {
        return 'Password must be at least 6 characters';
    }
    return null;
};

export const checkMissingFullCustomerData = (customer: any) => {
    const currentCustomer: Customer = customer;
    if (currentCustomer.username == null || currentCustomer.email == null || currentCustomer.password == null
        || currentCustomer.firstName == null || currentCustomer.lastName == null || currentCustomer.phoneNumber == null
        || currentCustomer.imageURL == null || currentCustomer.loyaltyPoints == null) {
        return 'All fields are required';
    }
    return null;
};

export const checkMissingCustomerCredentials = (customer: any) => {
    const currentCustomer: Customer = customer;
    if (currentCustomer.email == null || currentCustomer.password == null) {
        return 'All fields are required';
    }
    return null;
}