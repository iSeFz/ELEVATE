import { FirestoreReference } from './common.js';
import { Brand } from './brand.js';

export interface BrandOwner {
    id?: string;
    brand: FirestoreReference<Brand>;
    email: string;
    firstName: string;
    lastName: string;
    imageURL: string;
    username: string;
}