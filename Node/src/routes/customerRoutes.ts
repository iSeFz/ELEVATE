import express from 'express';
import * as CustomerController from '../controllers/customerController.js';
import { authenticate, authorize, authorizeCustomerAccess } from '../middleware/auth.js';
import { customerSignup, customerLogin } from '../controllers/authControllers.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as CustomerValidators from '../middleware/validators/customer.js';

const router = express.Router();

router.post('/signup', CustomerValidators.validateSignupCustomer, customerSignup);
router.post('/login', AuthValidators.validateLogin, customerLogin);

// Protected routes requiring authentication
router.get('/', authenticate, authorize(['admin', 'staff']), CustomerController.getAllCustomers);

// Users can access their own data, admins/staff can access any user's data
router.get('/:id', authenticate, authorizeCustomerAccess, CustomerController.getCustomer);

// Get orders for a specific customer - using the new middleware
router.get('/:id/orders', authenticate, authorizeCustomerAccess, CustomerController.getCustomerOrders);

// Users can update their own data, admins can update any user
router.put('/:id', authenticate, authorizeCustomerAccess, CustomerValidators.validateUpdateBrand, CustomerController.updateCustomer);

// Only admins can delete customer accounts
router.delete('/:id', authenticate, authorize(['admin']), CustomerController.deleteCustomer);

export default router;
