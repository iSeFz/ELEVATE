import express from 'express';
import { getAllBrands } from '../controllers/brandController.ts';

const router = express.Router();

router.get('/', getAllBrands);

export default router;