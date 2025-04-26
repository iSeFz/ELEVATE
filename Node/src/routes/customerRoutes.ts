import express from 'express';
import * as CustomerController from '../controllers/customerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes requiring authentication
router.get('/', authenticate, authorize(['admin', 'staff']), CustomerController.getAllCustomers);

// Users can access their own data, admins/staff can access any user's data
router.get('/:id', authenticate, CustomerController.getCustomer);

// Only admins can create customers via this endpoint (regular signup uses auth routes)
router.post('/', authenticate, authorize(['admin']), CustomerController.addCustomer);

// Users can update their own data, admins can update any user
router.put('/:id', authenticate, CustomerController.updateCustomer);

// Only admins can delete customer accounts
router.delete('/:id', authenticate, authorize(['admin']), CustomerController.deleteCustomer);

export default router;
