import { database } from '../config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

export const getAllBrands = async () => {
    const collectionRef = collection(database, "Brand");
    let brands = [];
    let snapshot = await getDocs(collectionRef);
    snapshot.forEach((doc) => {
        brands.push(doc.data());
    });
    return brands;
}; 