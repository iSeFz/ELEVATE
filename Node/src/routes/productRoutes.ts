import express from 'express';
import * as ProductController from '../controllers/productController.js';
import * as ProductValidators from '../middleware/validators/product.js';
import { authenticate, authorize, authorizeProductAccess } from '../middleware/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);

// Product variant routes
router.post('/:productId/variants',
    authenticate,
    authorizeProductAccess,
    ProductValidators.validateAddProductVariant,
    ProductController.addProductVariant);
router.put('/:productId/variants/:variantId',
    authenticate,
    authorizeProductAccess,
    ProductValidators.validateUpdateProductVariant,
    ProductController.updateProductVariant);
router.delete('/:productId/variants/:variantId',
    authenticate,
    authorizeProductAccess,
    ProductValidators.validateDeleteProductVariant,
    ProductController.deleteProductVariant);

// Protected routes - brand owners can manage their own products
router.post('/',
    authenticate,
    authorize(['admin', 'staff', 'brandOwner']),
    ProductValidators.validateAddProduct,
    ProductController.addProduct);
router.put('/:id',
    authenticate,
    authorizeProductAccess,
    ProductValidators.validateUpdateProduct,
    ProductController.updateProduct);
router.delete('/:id',
    authenticate,
    authorizeProductAccess,
    ProductController.deleteProduct);

export default router;