import { Request, Response, NextFunction } from 'express';


export const validateThirdPartySignup = (req: Request, res: Response, next: NextFunction) => {
    const { email, uid } = req.body;
    if (!email || !uid) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and UID are required'
        });
    }

    if (typeof email !== 'string' || typeof uid !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Email and UID must be strings'
        });
    }
    next();
}

/**
 * Required data:
 * - email: String - User's email address
 * - password: String - User's password
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and password are required'
        });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'Email and password must be strings'
        });
    }

    next();
};
