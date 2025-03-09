import express from 'express';
import { firebaseApp } from './config/firebase.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize the Firebase database with the provided configuration
const database = getFirestore(firebaseApp);

// Example route
app.get('/api/data', async (req, res) => {
    try {
        console.log("Hello");
        // const data = await getAllDocuments("products");

        // Reference to the specific collection in the database
        const collectionRef = collection(database, "product");
        let books = [];
        let snapshot = await getDocs(collectionRef);
        snapshot.forEach((doc) => {
            books.push(doc.data());
        });
        console.log(books);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});