import { Staff, staffDataValidators } from '../../types/models/staff.js';

export const checkMissingStaffUpdateData = (staff: any) => {
    if (Object.keys(staff).length === 0) {
        return 'No data provided for update';
    }
    return null;
};

const emptyStaff: Staff = {
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    username: "",
    imageURL: "",
    password: "", // Optional for authentication purposes
}

export const generateFullyStaffData = (staff: Staff): Staff => {
    const fullyData: Staff = {
        email: staff.email ?? emptyStaff.email,
        firstName: staff.firstName ?? emptyStaff.firstName,
        lastName: staff.lastName ?? emptyStaff.lastName,
        phoneNumber: staff.phoneNumber ?? emptyStaff.phoneNumber,
        username: staff.username ?? emptyStaff.username,
        password: staff.password ?? emptyStaff.password, // Optional for authentication purposes
        imageURL: staff.imageURL ?? emptyStaff.imageURL,
    };
    if (staff.id) {
        fullyData.id = staff.id;
    }

    if (staffDataValidators(fullyData)) {
        throw new Error('Invalid staff data, check types and formats');
    }

    return fullyData;
}
