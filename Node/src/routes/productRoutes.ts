import express from 'express';
import * as ProductController from '../controllers/productController.js';
import * as ProductValidators from '../middleware/validators/product.js';
import { authenticate, authorize, authorizeProductAccess, authorizeProductVariantAccess } from '../middleware/auth.js';

const router = express.Router();
router.get('/categories', ProductController.getAllCategories);

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);

router.get('/:productId/variants/:variantId',
    ProductController.getProductVariant);

export default router;