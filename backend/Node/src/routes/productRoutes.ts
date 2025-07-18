import express from 'express';
import * as ReviewController from '../controllers/reviewController.js';
import * as ReviewValidators from '../middleware/validators/review.js';
import { authenticate } from '../middleware/auth.js';
import * as ProductController from '../controllers/productController.js';

const router = express.Router();
router.get('/categories', ProductController.getAllCategories);
router.get('/departments', ProductController.getAllDepartments);
router.get('/sizes', ProductController.getAllSizes);

router.get('/', ProductController.getAllProducts);
router.get('/most-popular', ProductController.getMostPopularProducts);
router.get('/top-rated', ProductController.getTopRatedProducts);

router.get('/:id', ProductController.getProduct);
router.get('/:id/picked-together', ProductController.getProductRecommendations);

// Review routes
router.get('/:productId/reviews', ReviewController.getAllReviewsOfProduct);
router.post('/:productId/reviews',
    authenticate,
    ReviewValidators.validateAddReview,
    ReviewController.addReview);

router.get('/:productId/variants/:variantId',
    ProductController.getProductVariant);

export default router;