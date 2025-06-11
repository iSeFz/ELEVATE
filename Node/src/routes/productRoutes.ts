import express from 'express';
import * as ReviewController from '../controllers/reviewController.js';
import * as ReviewValidators from '../middleware/validators/review.js';
import { authenticate } from '../middleware/auth.js';
import * as ProductController from '../controllers/productController.js';

const router = express.Router();
router.get('/categories', ProductController.getAllCategories);

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);

// Review routes
router.get('/:productId/reviews', ReviewController.getAllReviewsOfProduct);
router.post('/:productId/reviews',
    authenticate,
    ReviewValidators.validateAddReview,
    ReviewController.addReview);

router.get('/:productId/variants/:variantId',
    ProductController.getProductVariant);

export default router;