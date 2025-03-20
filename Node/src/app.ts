import express from 'express';
import MainRouter from './routes/index.js';

const app = express();
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}`;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Connect to /api/v1 to access the API or visit the <a href="/api/v1/docs">documentation</a>');
});

app.use('/api/v1', MainRouter);

app.listen(port, () => {
    console.log(`Server is running on ${url}`);
});