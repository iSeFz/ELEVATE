import { FirestoreReference } from './common.js';
import { Inventory } from './inventory.js';

export interface Staff {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    inventory: FirestoreReference<Inventory>;
    phoneNumber: string;
    username: string;
    // Optional field not in schema but likely needed for authentication
    password?: string;
    role?: string; // Optional field for role-based access control
    imageURL?: string; // Optional field for profile picture
}