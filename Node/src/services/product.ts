import { database } from '../config/firebase.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const collectionRef = collection(database, "product");

export const getAllProducts = async () => {
    let books = [];
    let snapshot = await getDocs(collectionRef);
    snapshot.forEach((doc) => {
        books.push(doc.data());
    });
    return books;
};

export const addProduct = async (product) => {
    let snapshot = await addDoc(collectionRef, product);
    return snapshot;
};
