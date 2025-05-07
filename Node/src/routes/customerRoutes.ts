import express from 'express';
import * as CustomerController from '../controllers/customerController.js';
import * as CartController from '../controllers/cartController.js';
import { authenticate, authorize, authorizeCustomerAccess } from '../middleware/auth.js';

const router = express.Router();

// Protected routes requiring authentication
router.get('/', authenticate, authorize(['admin', 'staff']), CustomerController.getAllCustomers);

// Users can access their own data, admins/staff can access any user's data
router.get('/:id', authenticate, authorizeCustomerAccess, CustomerController.getCustomer);

// Get orders for a specific customer - using the new middleware
router.get('/:id/orders', authenticate, authorizeCustomerAccess, CustomerController.getCustomerOrders);

// Only admins can create customers via this endpoint (regular signup uses auth routes)
router.post('/', authenticate, authorize(['admin']), CustomerController.addCustomer);

// Users can update their own data, admins can update any user
router.put('/:id', authenticate, authorizeCustomerAccess, CustomerController.updateCustomer);

// Only admins can delete customer accounts
router.delete('/:id', authenticate, authorize(['admin']), CustomerController.deleteCustomer);

// Cart routes - customers can only access their own cart
router.get('/cart', authenticate, CartController.getCart);
router.post('/cart/items', authenticate, CartController.addToCart);
router.put('/cart/items/:productId/:variantId', authenticate, CartController.updateCartItem);
router.delete('/cart/items/:productId/:variantId', authenticate, CartController.removeFromCart);
router.delete('/cart', authenticate, CartController.clearCart);

export default router;
