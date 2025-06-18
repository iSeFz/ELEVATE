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
