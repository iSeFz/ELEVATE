import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDupVh4a_BioIJteaPBRZKgBFBGhhDKY8Q",
    authDomain: "elevate-fcai-cu.firebaseapp.com",
    databaseURL: "https://elevate-fcai-cu-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elevate-fcai-cu",
    storageBucket: "elevate-fcai-cu.firebasestorage.app",
    messagingSenderId: "181782604750",
    appId: "1:181782604750:web:18e37dffcc5fc95e5c199f",
    measurementId: "G-GKX2VVKCL5"
};

const firebaseApp = initializeApp(firebaseConfig);

const database = getFirestore(firebaseApp);

export { database };