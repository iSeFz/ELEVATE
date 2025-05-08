import { Request, Response, NextFunction } from 'express';
import { Staff, staffDataValidators } from '../../types/models/staff.js';
import { validateObjectStructure } from './common.js';

const expectedSignupStaffData: Partial<Staff> = {
    email: "String",
    password: "String: Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number",
    phoneNumber: "String: Phone number must start with 010, 011, 012, or 015 and be followed by 8 digits",
    firstName: "String with at least 3 characters",
    lastName: "String with at least 3 characters",
    username: "String with at least 3 characters",
}
/**
 * Required data:
 * - email: String - Email of the staff member
 * - password: String - Password for the staff member
 * - firstName: String - First name of the staff member
 * - lastName: String - Last name of the staff member
 * - username: String - Username of the staff member
 */
export const validateSignupStaff = (req: Request, res: Response, next: NextFunction) => {
    const staff: Staff = req.body;
    if (!validateObjectStructure(staff, expectedSignupStaffData)) {
        return res.status(400).json({
            status: 'error',
            message: 'Request structure doesn\'t match expected format',
            expectedFormat: expectedSignupStaffData
        });
    }
    const isStaffValid = staffDataValidators(staff);
    if (!isStaffValid) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid staff types.',
            expectedFormat: expectedSignupStaffData
        });
    }

    // next();
    return res.status(200).send("OK")
}