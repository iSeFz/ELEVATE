import express from 'express';
import { authenticate, authorize, authorizeInventoryAccess } from '../middleware/auth.js';
import * as InventoryService from '../services/inventory.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Get all inventories
 *     security:
 *       - bearerAuth: []
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of all inventories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize(['admin', 'staff']), async (req, res) => {
    try {
        const inventories = await InventoryService.getAllInventories();
        res.status(200).json({
            status: 'success',
            data: { inventories }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   get:
 *     summary: Get a specific inventory by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Inventory not found
 */
router.get('/:id', authenticate, authorizeInventoryAccess, async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await InventoryService.getInventory(id);
        
        if (!inventory) {
            return res.status(404).json({
                status: 'error',
                message: 'Inventory not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { inventory }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Create a new inventory
 *     security:
 *       - bearerAuth: []
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: Inventory created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const inventoryData = req.body;
        const ownerId = req.user?.role === 'staff' ? req.user?.id : undefined;
        
        const newInventory = await InventoryService.addInventory(inventoryData, ownerId);
        
        res.status(201).json({
            status: 'success',
            data: { inventory: newInventory }
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   put:
 *     summary: Update an existing inventory
 *     security:
 *       - bearerAuth: []
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Inventory not found
 */
router.put('/:id', authenticate, authorizeInventoryAccess, async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryData = req.body;
        
        const updatedInventory = await InventoryService.updateInventory(id, inventoryData);
        
        if (!updatedInventory) {
            return res.status(404).json({
                status: 'error',
                message: 'Inventory not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { inventory: updatedInventory }
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory
 *     security:
 *       - bearerAuth: []
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Inventory not found
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        
        const success = await InventoryService.deleteInventory(id);
        
        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'Inventory not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Inventory deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

export default router;