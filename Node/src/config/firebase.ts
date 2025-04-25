import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://elevate-fcai-cu-default-rtdb.europe-west1.firebasedatabase.app"
});

const verifyCredentialsURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${"AIzaSyDupVh4a_BioIJteaPBRZKgBFBGhhDKY8Q"}`;

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

export { admin, verifyCredentialsURL };