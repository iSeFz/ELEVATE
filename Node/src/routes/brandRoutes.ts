import express from 'express';
import * as BrandController from '../controllers/brandController.js';

const router = express.Router();

// Get all brands
router.get('/', BrandController.getAllBrands);

// Get brand by ID
router.get('/:id', BrandController.getBrand);

// Get brand by name
router.get('/name', BrandController.getBrandByName);

// Add new brand
router.post('/', BrandController.addBrand);

// Update brand
router.put('/:id', BrandController.updateBrand);

// Delete brand
router.delete('/:id', BrandController.deleteBrand);

export default router;