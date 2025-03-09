import express from 'express';
import MainRouter from './routes/index.ts';
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1', MainRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});