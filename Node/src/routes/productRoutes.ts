import express from 'express';
import * as ProductController from '../controllers/productController.js';

const router = express.Router();

// Get all products
router.get('/', ProductController.getAllProducts);

// Get product by ID
router.get('/:id', ProductController.getProduct);

// Get product with its variants
router.get('/:id/variants', ProductController.getProductWithVariants);

// Get products by category
router.get('/category', ProductController.getProductsByCategory);

// Get products by brand
router.get('/brand', ProductController.getProductsByBrand);

// Add new product
router.post('/', ProductController.addProduct);

// Update product
router.put('/:id', ProductController.updateProduct);

// Delete product
router.delete('/:id', ProductController.deleteProduct);

export default router;