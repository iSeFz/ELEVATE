import express from 'express';
import MainRouter from './routes/index.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}`;

app.use(cors({
    origin: '*', // Allow all origins
    methods: '*', // Allow all methods
    allowedHeaders: '*', // Allow all headers
    exposedHeaders: '*', // Expose all headers
    credentials: true, // Allow cookies
    maxAge: 86400 // Cache preflight requests for 24 hours
}));

app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

app.get('/', (req, res) => {
    res.send('Connect to /api/v1 to access the API, visit the <a href="/api/v1/docs">API documentation</a>, or check the <a href="/collections">Firestore Collection Structure</a>');
});

app.get('/collections', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

app.use('/api/v1', MainRouter);

app.listen(port, () => {
    console.log(`Server is running on ${url}`);
});