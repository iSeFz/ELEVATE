// Route for migration scripts
import { Router } from 'express';
import { migrateCustomerAddresses } from '../controllers/scriptsController.js';

const router = Router();

// POST endpoint to trigger migration
router.post('/migrate-customer-addresses', migrateCustomerAddresses);

export default router;
