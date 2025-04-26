import { FirestoreReference } from './common.js';
import { Brand } from './brand.js';

export interface BrandOwner {
    id?: string;
        
    // Denormalized field for querying
    brandId: string;
    
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    username: string;
    
    // Added role for consistency with auth patterns
    role: string;
}