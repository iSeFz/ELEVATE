import { Request, Response } from 'express';
import * as StaffService from '../services/staff.js';

/**
 * Get all staff members (admin only)
 */
export const getAllStaff = async (req: Request, res: Response) => {
    try {
        // Call service to get all staff
        const allStaff = await StaffService.getAllStaff();
        res.status(200).json({
            status: 'success',
            data: allStaff
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get a staff member by ID
 */
export const getStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Staff can only view their own profile
        if (req.user?.role === 'staff' && req.user?.id !== id) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden - You can only access your own profile'
            });
        }
        
        const staff = await StaffService.getStaff(id);
        
        if (!staff) {
            return res.status(404).json({
                status: 'error',
                message: 'Staff not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: staff
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update a staff member
 */
export const updateStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const staffData = req.body;
        
        // Staff can only update their own profile
        if (req.user?.role === 'staff' && req.user?.id !== id) {
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden - You can only update your own profile'
            });
        }
        
        const updatedStaff = await StaffService.updateStaff(id, staffData);
        
        if (!updatedStaff) {
            return res.status(404).json({
                status: 'error',
                message: 'Staff not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: updatedStaff
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Delete a staff member
 */
export const deleteStaff = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const success = await StaffService.deleteStaff(id);
        
        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'Staff not found'
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Staff deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};