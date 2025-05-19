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

const firestoreDocuments = {
  "address": "address",
  "brand": "Brand",
  "brandOwner": "BrandOwner",
  "color": "Color",
  "image": "Image",
  "inventory": "Inventory",
  "order": "Order",
  "orderItem": "OrderItem",
  "payment": "Payment",
  "phoneNumbers": "PhoneNumbers",
  "plan": "Plan",
  "shipment": "Shipment",
  "staff": "Staff",
  "subscription": "Subscription",
  "cart": "cart",
  "customer": "customer",
  "product": "product",
  "productVariant": "productVariant",
  "review": "review",
}

export { admin, verifyCredentialsURL, SEND_RESET_EMAIL_URL, CONFIRM_RESET_PASSWORD_URL };