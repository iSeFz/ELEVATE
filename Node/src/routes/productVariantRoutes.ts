import express from 'express';
import * as ProductVariantController from '../controllers/productVariantController.js';
import { authenticate, authorize, authorizeProductAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', ProductVariantController.getAllProductVariants);
router.get('/:id', ProductVariantController.getProductVariant);
router.get('/by-product', ProductVariantController.getProductVariantsByProduct);

// Protected routes - require authentication
// Product variants follow the same authorization as their parent products
router.post('/', authenticate, authorize(['admin', 'staff', 'brandOwner']), ProductVariantController.addProductVariant);
router.put('/:id', authenticate, authorizeProductAccess, ProductVariantController.updateProductVariant);
router.delete('/:id', authenticate, authorizeProductAccess, ProductVariantController.deleteProductVariant);

export default router;