import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: "https://elevate-fcai-cu-default-rtdb.europe-west1.firebasedatabase.app"
});

const verifyCredentialsURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${"AIzaSyDupVh4a_BioIJteaPBRZKgBFBGhhDKY8Q"}`;

export { admin, verifyCredentialsURL };