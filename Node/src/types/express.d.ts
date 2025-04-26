import { Request } from 'express';

// Add user property to Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: string;
      };
    }
  }
}