import { commonDataValidators } from "./common.js";
import { checkValidEmailFormat, checkValidPasswordFormat, checkValidPhoneNumberFormat, checkValidURLFormat, checkValidUsernameFormat } from "./utlis.js";

export interface Staff {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    username: string;
    imageURL: string;

    // Optional field not in schema but likely needed for authentication
    password?: string;
}

export const staffDataValidators = (value: Staff): boolean => {
    const validators: Record<keyof Staff, (value: any) => boolean> = {
        id: (v: Staff['id']) => typeof v === 'string',
        email: (v: Staff['email']) => typeof v === 'string' && checkValidEmailFormat(v),
        firstName: (v: Staff['firstName']) => typeof v === 'string' && checkValidUsernameFormat(v),
        lastName: (v: Staff['lastName']) => typeof v === 'string' && checkValidUsernameFormat(v),
        phoneNumber: (v: Staff['phoneNumber']) => typeof v === 'string' && checkValidPhoneNumberFormat(v),
        username: (v: Staff['username']) => typeof v === 'string' && checkValidUsernameFormat(v),
        imageURL: (v: Staff['imageURL']) => typeof v === 'string' && checkValidURLFormat(v),

        password: (v: Staff['password']) => typeof v === 'string' && checkValidPasswordFormat(v),
    }
    return commonDataValidators<Staff>(value, validators);
}
