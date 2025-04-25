import express from 'express';
import * as ProductVariantController from '../controllers/productVariantController.js';

const router = express.Router();

// Get all product variants
router.get('/', ProductVariantController.getAllProductVariants);

// Get product variant by ID
router.get('/:id', ProductVariantController.getProductVariant);

// Get product variants by product ID
router.get('/by-product', ProductVariantController.getProductVariantsByProduct);

// Add new product variant
router.post('/', ProductVariantController.addProductVariant);

// Update product variant
router.put('/:id', ProductVariantController.updateProductVariant);

// Delete product variant
router.delete('/:id', ProductVariantController.deleteProductVariant);

export default router;