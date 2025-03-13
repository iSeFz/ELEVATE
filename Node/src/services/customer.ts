import { database } from '../config/firebase.js';
import {
    collection, getDocs, getDoc, addDoc, deleteDoc,
    doc, query, where, updateDoc, setDoc
} from 'firebase/firestore';

const collectionRef = collection(database, "customer");

export const getAllCustomers = async () => {
    let customers = [];
    let snapshot = await getDocs(collectionRef);
    snapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() });
    });
    return customers;
};

export const getCustomer = async (customerID) => {
    const docRef = doc(database, "customer", customerID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
};

export const getCustomerWithEmail = async (customerEmail) => {
    const querySnapshot = query(collectionRef, where("email", "==", customerEmail));
    const snapshot = await getDocs(querySnapshot);
    const customers = [];
    snapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() });
    });
    return customers;
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
export const addCustomer = async (customer) => {
    const customId = customer.id;
    if (customId) {
        // Use custom ID if provided
        const docRef = doc(database, "customer", customId);
        await setDoc(docRef, customer);
        return { id: customId, ...customer };
    } else {
        // Fall back to auto-generated ID
        const snapshot = await addDoc(collectionRef, customer);
        return { id: snapshot.id, ...customer };
    }
};

export const updateCustomer = async (customerID, newCustomerData) => {
    const customerRef = doc(database, "customer", customerID);
    await updateDoc(customerRef, newCustomerData);
    return true;
};

export const deleteCustomer = async (customerID) => {
    const customerRef = doc(database, "customer", customerID);
    await deleteDoc(customerRef);
    return true;
};
