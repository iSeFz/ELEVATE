import { commonDataValidators } from "./common.js";

export interface Staff {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    username: string;
    imageURL: string; // Optional field for profile picture

    // Optional field not in schema but likely needed for authentication
    password?: string;
}

export const staffDataValidators = (value: Staff): boolean => {
    const validators: Record<keyof Staff, (value: any) => boolean> = {
        id: (v: Staff['id']) => typeof v === 'string' || v === undefined,
        email: (v: Staff['email']) => typeof v === 'string',
        firstName: (v: Staff['firstName']) => typeof v === 'string',
        lastName: (v: Staff['lastName']) => typeof v === 'string',
        phoneNumber: (v: Staff['phoneNumber']) => typeof v === 'string',
        username: (v: Staff['username']) => typeof v === 'string',
        imageURL: (v: Staff['imageURL']) => typeof v === 'string',

        password: (v: Staff['password']) => typeof v === 'string' || v === undefined,
    }
    return commonDataValidators<Staff>(value, validators);
}
