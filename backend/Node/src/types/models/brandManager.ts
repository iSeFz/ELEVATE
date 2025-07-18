import { BrandOwner } from './brandOwner.js';

export interface BrandManager extends BrandOwner {
    brandOwnerId: string;
};
