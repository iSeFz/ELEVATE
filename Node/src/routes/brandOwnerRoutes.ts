import express from 'express';
import { authenticate, authorize, authorizeProductAccess, authorizeProductVariantAccess } from '../middleware/auth.js';
import { brandOwnerLogin, brandOwnerSignup } from '../controllers/authControllers.js';
import * as BrandOwnerController from '../controllers/brandOwnerController.js';
import * as ProductController from '../controllers/productController.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as BrandOwnerValidators from '../middleware/validators/brandOwner.js';
import * as ProductValidators from '../middleware/validators/product.js';

const router = express.Router();

// Auth routes for brand owners
router.post('/login', 
    AuthValidators.validateLogin, brandOwnerLogin);
router.post('/signup', 
    BrandOwnerValidators.validateSignupBrandOwner, brandOwnerSignup);

// Brand owner management routes
router.get('/', 
    authenticate, 
    authorize(['admin']), 
    BrandOwnerController.getAllBrandOwners);
router.get('/me', 
    authenticate, 
    BrandOwnerController.getBrandOwner);
router.put('/me', 
    authenticate, 
    BrandOwnerValidators.validateUpdateBrandOwner, 
    BrandOwnerController.updateBrandOwner);
router.delete('/me', 
    authenticate, authorize(['admin']), 
    BrandOwnerController.deleteBrandOwner);

// Product routes for brand owners
router.get('/me/products',
    authenticate,
    ProductController.getAllProducts);
router.post('/me/products',
    authenticate,
    authorize(['admin', 'staff', 'brandOwner']),
    ProductValidators.validateAddProduct,
    ProductController.addProduct);
router.get('/me/products/:id',
    authenticate,
    ProductController.getProduct);
router.put('/me/products/:id',
    authenticate,
    authorizeProductAccess,
    ProductValidators.validateUpdateProduct,
    ProductController.updateProduct);
router.delete('/me/products/:id',
    authenticate,
    authorizeProductAccess,
    ProductController.deleteProduct);

// Product variant routes for brand owners
router.post('/me/products/:productId/variants',
    authenticate,
    authorizeProductVariantAccess,
    ProductValidators.validateAddProductVariant,
    ProductController.addProductVariant);
router.get('/me/products/:productId/variants/:variantId',
    ProductController.getProductVariant);
router.put('/me/products/:productId/variants/:variantId',
    authenticate,
    authorizeProductVariantAccess,
    ProductValidators.validateUpdateProductVariant,
    ProductController.updateProductVariant);
router.delete('/me/products/:productId/variants/:variantId',
    authenticate,
    authorizeProductVariantAccess,
    ProductValidators.validateDeleteProductVariant,
    ProductController.deleteProductVariant);

export default router;