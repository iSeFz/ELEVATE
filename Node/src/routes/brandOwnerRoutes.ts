import express from 'express';
import { authenticate, authorize, authorizeProductAccess } from '../middleware/auth.js';
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
    BrandOwnerController.getMyProducts);
router.post('/me/products',
    authenticate,
    authorize(['admin', 'brandOwner', 'brandManager']),
    ProductValidators.validateAddProduct,
    ProductController.addProduct);
router.delete('/me/products',
    authenticate,
    ProductController.deleteAllBrandProducts);
router.get('/me/products/:id',
    authenticate,
    ProductController.getProduct);
router.put('/me/products/:id',
    authenticate,
    ProductValidators.validateUpdateProduct,
    authorizeProductAccess,
    ProductController.updateProduct);
router.delete('/me/products/:id',
    authenticate,
    authorizeProductAccess,
    ProductController.deleteProduct);

// Product variant routes for brand owners
router.post('/me/products/:productId/variants',
    authenticate,
    ProductValidators.validateAddProductVariant,
    authorizeProductAccess,
    ProductController.addProductVariant);
router.get('/me/products/:productId/variants/:variantId',
    authenticate,
    ProductController.getProductVariant);
router.put('/me/products/:productId/variants/:variantId',
    authenticate,
    ProductValidators.validateUpdateProductVariant,
    authorizeProductAccess,
    ProductController.updateProductVariant);
router.delete('/me/products/:productId/variants/:variantId',
    authenticate,
    ProductValidators.validateDeleteProductVariant,
    authorizeProductAccess,
    ProductController.deleteProductVariant);

// Dashborad routes for brand owners
router.get('/me/dashboard/current-month-stats',
    authenticate,
    authorize(['admin', 'brandOwner']),
    BrandOwnerController.getCurrentMonthStats);
router.get('/me/dashboard/reviews-summary',
    authenticate,
    authorize(['admin', 'brandOwner']),
    BrandOwnerController.getBrandReviewsSummary);

export default router;
