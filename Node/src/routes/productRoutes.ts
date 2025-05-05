import express from 'express';
import * as ProductController from '../controllers/productController.js';
import { authenticate, authorize, authorizeProductAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);

// Protected routes - brand owners can manage their own products
router.post('/', authenticate, authorize(['admin', 'staff', 'brandOwner']), ProductController.addProduct);
router.put('/:id', authenticate, authorizeProductAccess, ProductController.updateProduct);
router.delete('/:id', authenticate, authorizeProductAccess, ProductController.deleteProduct);

export default router;