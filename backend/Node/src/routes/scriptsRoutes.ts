// Route for migration scripts
import { Router } from 'express';
import { migrateCustomerAddresses } from '../controllers/scriptsController.js';

const router = Router();

router.post('/migrate', migrateCustomerAddresses);

export default router;
