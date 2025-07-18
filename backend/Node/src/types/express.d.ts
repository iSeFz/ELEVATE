import { Request } from 'express';
import { Role } from '../config/roles.ts';

// Add user property to Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: Role;
      };
    }
  }
}