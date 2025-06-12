import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { brandManagerLogin, staffSignup } from '../controllers/authControllers.js';
import * as StaffController from '../controllers/staffController.js';
import * as AuthValidators from '../middleware/validators/auth.js';
import * as StaffValidators from '../middleware/validators/staff.js';

const router = express.Router();

// Auth routes for staff
router.post('/login', AuthValidators.validateLogin, brandManagerLogin);
router.post('/signup', StaffValidators.validateSignupStaff, staffSignup);

// Staff management routes (admin only)
router.get('/', authenticate, authorize(['admin']), StaffController.getAllStaff);
router.get('/:id', authenticate, authorize(['admin', 'staff']), StaffController.getStaff);
router.put('/:id', authenticate, authorize(['admin', 'staff']), StaffController.updateStaff);
router.delete('/:id', authenticate, authorize(['admin']), StaffController.deleteStaff);

export default router;