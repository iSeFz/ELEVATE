// Migration script to update customer address structure
// Moves 'address' field to 'addresses' array and removes the old 'address' field
// Usage: Import and call runCustomerAddressMigration()

import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';

const firestore = admin.firestore();
const customerCollection = FIREBASE_COLLECTIONS['customer'];

export const runCustomerAddressMigration = async () => {
    const batchSize = 100;
    let lastDoc = null;
    let migratedCount = 0;
    let hasMore = true;

    while (hasMore) {
        let query = firestore.collection(customerCollection).orderBy('createdAt').limit(batchSize);
        if (lastDoc) query = query.startAfter(lastDoc);
        const snapshot = await query.get();
        if (snapshot.empty) break;

        const batch = firestore.batch();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.address) {
                // Prepare new addresses array
                const address = data.address;
                // If lat/long are missing, set to null
                address.lat = address.lat ?? null;
                address.long = address.long ?? null;
                const addresses = [address];
                const docRef = firestore.collection(customerCollection).doc(doc.id);
                batch.update(docRef, {
                    addresses,
                    address: admin.firestore.FieldValue.delete()
                });
                migratedCount++;
            }
        });
        await batch.commit();
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        hasMore = snapshot.size === batchSize;
    }
    return { migratedCount };
};
