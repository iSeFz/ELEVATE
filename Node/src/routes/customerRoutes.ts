import express from 'express';
import * as CustomerController from '../controllers/customerController.js';
import * as OrderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { customerSignup, customerLogin, thirdPartySignup } from '../controllers/authControllers.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as CustomerValidators from '../middleware/validators/customer.js';
import * as OrderValidators from '../middleware/validators/order.js';
import CartRoutes from './cartRoutes.js';
import WishlistRoutes from './wishlistRoutes.js';

const router = express.Router();

// Protected routes requiring authentication
router.get('/',
    authenticate,
    authorize(['admin']),
    CustomerValidators.validateGetAllCustomers,
    CustomerController.getAllCustomers);

// Auth endpoints
router.post('/signup', CustomerValidators.validateSignupCustomer, customerSignup);
router.post('/third-party-signup', AuthValidators.validateThirdPartySignup, thirdPartySignup);
router.post('/login', AuthValidators.validateLogin, customerLogin);

// Cart endpoints
router.use('/me/cart', CartRoutes);

// Wishlist endpoints
router.use('/me/wishlist', WishlistRoutes);

// Order endpoints
router.get('/me/orders',
    authenticate,
    CustomerController.getCustomerOrders);
router.post('/me/orders',
    authenticate,
    OrderValidators.validateCreateOrder,
    OrderController.addOrder);
router.get('/me/orders/:id',
    authenticate,
    OrderController.getCustomerOrder);
router.put('/me/orders/:id/calculate-shipment-fees',
    authenticate,
    OrderValidators.validateCalculateShipmentFees,
    OrderController.calculateShipmentFees);
router.put('/me/orders/:id/confirm',
    authenticate,
    OrderValidators.validateConfirmOrder,
    OrderController.confirmCustomerOrder);
router.patch('/me/orders/:id/cancel',
    authenticate,
    OrderController.cancelOrder);
router.patch('/me/orders/:id/refund',
    authenticate,
    OrderValidators.validateRefundOrder,
    OrderController.refundOrder);

router.get('/me',
    authenticate,
    CustomerController.getCustomer);

router.put('/me',
    authenticate,
    CustomerValidators.validateUpdateCustomer,
    CustomerController.updateCustomer);

// Only admins can delete customer accounts
router.delete('/me',
    authenticate,
    authorize(['admin']),
    CustomerController.deleteCustomer);

export default router;
