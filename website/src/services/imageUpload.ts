// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDupVh4a_BioIJteaPBRZKgBFBGhhDKY8Q",
  authDomain: "elevate-fcai-cu.firebaseapp.com",
  databaseURL:
    "https://elevate-fcai-cu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "elevate-fcai-cu",
  storageBucket: "elevate-fcai-cu.firebasestorage.app",
  messagingSenderId: "181782604750",
  appId: "1:181782604750:web:38e50f7318addefa5c199f",
  measurementId: "G-4QHYJPPGK0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Storage
export const storage = getStorage(app);

/**
 * Uploads an image file to Firebase Storage and returns the download URL.
 * @param file The image file to upload.
 * @param path The storage path (e.g., 'images/myImage.jpg').
 * @returns Promise<string> The download URL of the uploaded image.
 */
export async function uploadImageAndGetURL(
  file: File,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
