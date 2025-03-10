import { database } from '../config/firebase.ts';
import {
    collection, getDocs, getDoc, addDoc, deleteDoc,
    doc, query, where, updateDoc
} from 'firebase/firestore';

export class BaseService {
    collectionName: any;
    collectionRef: any;
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.collectionRef = collection(database, collectionName);
    }

    async getAll() {
        let customers = [];
        let snapshot = await getDocs(this.collectionRef);
        snapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() as any });
        });
        return customers;
    }
    
    async getById(id) {
        const docRef = doc(database,this.collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    }
    async add(entity) {
        const snapshot = await addDoc(this.collectionRef, entity);
        if (!snapshot) return false;
        console.log('entity added with ID: ', snapshot.id);
        console.log('Snapshot: ', snapshot);
        return snapshot.id;
    }

    async update(id, entity) {
        try {
            const entityRef = doc(database, this.collectionName, id);
            await updateDoc(entityRef, entity); //no return val
            console.log('Entity updated with ID: ', id);
            return id;
        } catch (error) {
            console.error('Error updating entity:', error);
            return false;
        }
    }
    

    async delete(id) {
        try {
            const entityRef = doc(database, this.collectionName, id);
            await deleteDoc(entityRef); //no return value
            console.log('Entity deleted with ID:', id);
            return true;
        } catch (error) {
            console.error('Error deleting entity:', error);
            return false;
        }
    }
}
