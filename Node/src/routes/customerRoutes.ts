import express from 'express';
import * as CustomerController from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { customerSignup, customerLogin } from '../controllers/authControllers.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as CustomerValidators from '../middleware/validators/customer.js';
import CartRoutes from './cartRoutes.js';
import WishlistRoutes from './wishlistRoutes.js';

const router = express.Router();

// Protected routes requiring authentication
router.get('/',
    authenticate,
    authorize(['admin', 'staff']),
    CustomerValidators.validateGetAllCustomers,
    CustomerController.getAllCustomers);

// Auth endpoints
router.post('/signup', CustomerValidators.validateSignupCustomer, customerSignup);
router.post('/login', AuthValidators.validateLogin, customerLogin);

// Cart endpoints
router.use('/me/cart', CartRoutes);

// Wishlist endpoints
router.use('/me/wishlist', WishlistRoutes);

// Get orders for a specific customer - using the new middleware
router.get('/me/orders',
    authenticate,
    CustomerController.getCustomerOrders);

// Users can access their own data, admins/staff can access any user's data
router.get('/me',
    authenticate,
    CustomerController.getCustomer);

// Users can update their own data, admins can update any user
router.put('/me',
    authenticate,
    CustomerValidators.validateUpdateBrand,
    CustomerController.updateCustomer);

// Only admins can delete customer accounts
router.delete('/me',
    authenticate,
    authorize(['admin']),
    CustomerController.deleteCustomer);

export default router;
