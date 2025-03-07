import { firebaseApp } from '../config/firebase';
export {}
// export const addDocument = async (collection: string, data: any) => {
//     const docRef = firestore.collection(collection).doc();
//     await docRef.set(data);
//     return docRef.id;
// };

// export const getDocument = async (collection: string, id: string) => {
//     const docRef = firestore.collection(collection).doc(id);
//     const doc = await docRef.get();
//     return doc.exists ? { id: doc.id, ...doc.data() } : null;
// };

// export const updateDocument = async (collection: string, id: string, data: any) => {
//     const docRef = firestore.collection(collection).doc(id);
//     await docRef.update(data);
// };

// export const deleteDocument = async (collection: string, id: string) => {
//     const docRef = firestore.collection(collection).doc(id);
//     await docRef.delete();
// };

// export const getAllDocuments = async (collection: string) => {
//     const snapshot = await firestore.collection(collection).get();
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// };