export interface Staff {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;

    // Denormalized field for authorization and querying
    inventoryId?: string;

    phoneNumber: string;
    username: string;
    // Optional field not in schema but likely needed for authentication
    password?: string;
    role: string; // Changed from optional to required for consistency
    imageURL?: string; // Optional field for profile picture
}
