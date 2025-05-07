import { Staff, staffDataValidators } from '../../types/models/staff.js';

export const checkMissingStaffData = (staff: any) => {
    const currentStaff = staff as Staff;
    if (currentStaff.email == null || currentStaff.firstName == null ||
        currentStaff.lastName == null || currentStaff.username == null ||
        currentStaff.phoneNumber == null) {
        return 'Email, first name, last name, username, and phone number are required';
    }
    return null;
};

export const checkMissingStaffUpdateData = (staff: any) => {
    if (Object.keys(staff).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

export const generateFullyStaffData = (staff: Staff): Staff => {
    const fullyData: Staff = {
        id: staff.id ?? "",
        email: staff.email ?? "",
        firstName: staff.firstName ?? "",
        lastName: staff.lastName ?? "",
        phoneNumber: staff.phoneNumber ?? "",
        username: staff.username ?? "",
        password: staff.password ?? "", // Optional for authentication purposes
        imageURL: staff.imageURL ?? "",
    };

    if(staffDataValidators(fullyData)) {
        throw new Error('Invalid staff data, check types and formats');
    }

    return fullyData;
}
