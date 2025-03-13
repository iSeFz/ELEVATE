import { database } from '../config/firebase.js';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth(database.app);

export const signup = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        return { status: 'success', user: user };
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}; 