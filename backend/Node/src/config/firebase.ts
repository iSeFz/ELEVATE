import admin from 'firebase-admin';

// 1. Check if the environment variable exists
if (!process.env.FIREBASE_CREDENTIALS) {
  console.error('Firebase credentials are not set in the .env file. Please set FIREBASE_CREDENTIALS.');
  process.exit(1);
}

// 2. Sanitize the string for JSON parsing
const credentialsString = process.env.FIREBASE_CREDENTIALS.replace(/\n/g, '\\n');

// 3. Parse the sanitized JSON string
const SERVICE_ACCOUNT = JSON.parse(credentialsString) as admin.ServiceAccount;

// 4. Initialize Firebase with the parsed credentials
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
  databaseURL: "https://elevate-fcai-cu-default-rtdb.europe-west1.firebasedatabase.app",
});

console.log('Firebase Admin SDK initialized successfully.');

const firestoreKey = process.env.FIREBASE_WEB_API_KEY || 'YOUR_FIREBASE_WEB_API_KEY_HERE';

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
  "brandManager": "brandManager",
  "tryOnRequests": "tryOnRequests",
}

export { admin, verifyCredentialsURL, SEND_RESET_EMAIL_URL, CONFIRM_RESET_PASSWORD_URL, REFRESH_TOKEN_URL, SERVICE_ACCOUNT };
