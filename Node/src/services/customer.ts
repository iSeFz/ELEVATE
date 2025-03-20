import { admin } from '../config/firebase.js';

const firestore = admin.firestore();
const customerCollection = 'customer';

export const getAllCustomers = async () => {
    try {
        const snapshot = await firestore.collection(customerCollection).get();
        const customers = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch (error) {
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
    } catch (error) {
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

        const customers = [];
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch (error) {
        throw new Error(error.message);
    }
};

/* Testing data
{
    "email": "test@test.com",
    "firstName": "test1",
    "imageURL": "https://google.com",
    "lastName": "Test2",
    "loyaltyPoints": 100,
    "password": "testing",
    "phoneNumber": "012345678987",
    "username": "test123456"
}
*/
export const addCustomer = async (customer: any) => {
    if (checkCustomerFormat(customer)) {
        throw new Error('All fields are required');
        // todo: Must rollback any realted data inserted in the auth and other services
    }
    try {
        const customId = customer.id;

        if (customId) {
            const docRef = firestore.collection(customerCollection).doc(customId);
            await docRef.set(customer);
            return { id: customId, ...customer };
        } else {
            const docRef = await firestore.collection(customerCollection).add(customer);
            return { id: docRef.id, ...customer };
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

const checkCustomerFormat = (customer) => {
    return !customer.id || !customer.email || !customer.firstName
        || !customer.lastName || customer.imageURL == null || !customer.password
        || customer.loyaltyPoints == null || !customer.phoneNumber || !customer.username;
};

export const updateCustomer = async (customerID: string, newCustomerData: any) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const customerRef = firestore.collection(customerCollection).doc(customerID);
        await customerRef.update(newCustomerData);
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const deleteCustomer = async (customerID: string) => {
    if (!customerID) {
        throw new Error('Please provide a customer ID');
    }
    try {
        const customerRef = firestore.collection(customerCollection).doc(customerID);
        await customerRef.delete();
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
};
