import { Staff } from '../../types/models/staff.js';

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

export const generateEmptyStaffData = (): Staff => ({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    inventoryId: "",
    phoneNumber: "",
    username: "",
    password: "", // Optional for authentication purposes
    imageURL: "",
});
