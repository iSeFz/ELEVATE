// import { database } from '../config/firebase.js';
import {
    collection, getDocs, getDoc, addDoc, deleteDoc,
    doc, query, where, updateDoc
} from 'firebase/firestore';
import { BaseService } from './BaseService.js';

export class UserService extends BaseService {

    async getByEmail(email: any) {
        // const querySnapshot = query(this.collectionRef, where("email", "==", email));
        // const snapshot = await getDocs(querySnapshot);
        // const data = [];
        // snapshot.forEach((doc) => {
        //     data.push({ id: doc.id, ...doc.data() as any});
        // });
        // return data;
    }

    //put user specific functions here
    


}
