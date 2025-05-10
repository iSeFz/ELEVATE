import { Staff, staffDataValidators } from '../../types/models/staff.js';

export const checkMissingStaffUpdateData = (staff: any) => {
    if (Object.keys(staff).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

export const generateFullyStaffData = (staff: Staff): Staff => {
    const fullyData: Staff = {
        email: staff.email ?? "",
        firstName: staff.firstName ?? "",
        lastName: staff.lastName ?? "",
        phoneNumber: staff.phoneNumber ?? "",
        username: staff.username ?? "",
        password: staff.password ?? "", // Optional for authentication purposes
        imageURL: staff.imageURL ?? "",
    };
    if (staff.id) {
        fullyData.id = staff.id;
    }

    if (staffDataValidators(fullyData)) {
        throw new Error('Invalid staff data, check types and formats');
    }

    return fullyData;
}
