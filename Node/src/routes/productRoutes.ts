import express from 'express';
import { getAllProducts } from '../controllers/productController.ts';

const router = express.Router();

router.get('/', getAllProducts);

export default router;