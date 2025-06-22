import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://elevate-fcai-cu-default-rtdb.europe-west1.firebasedatabase.app"
});

const firestoreKey = "AIzaSyDupVh4a_BioIJteaPBRZKgBFBGhhDKY8Q";

const verifyCredentialsURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firestoreKey}`;

const SEND_RESET_EMAIL_URL = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firestoreKey}`;

const CONFIRM_RESET_PASSWORD_URL = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${firestoreKey}`;

const REFRESH_TOKEN_URL = `https://securetoken.googleapis.com/v1/token?key=${firestoreKey}`;

export const FIREBASE_COLLECTIONS = {
  "brand": "brand",
  "brandOwner": "brandOwner",
  "order": "order",
  "customer": "customer",
  "product": "product",
  "productAssociation": "productAssociation",
  "review": "review",
  "staff": "staff",
}

export { admin, verifyCredentialsURL, SEND_RESET_EMAIL_URL, CONFIRM_RESET_PASSWORD_URL, REFRESH_TOKEN_URL };
