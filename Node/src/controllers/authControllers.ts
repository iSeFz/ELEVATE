import { Request, Response } from 'express';
import * as services from '../services/firestore.js';
import { Customer } from '../services/utils/customer.ts';

export const signup = async (req: Request, res: Response) => {
    const customer: Customer = {
        id: '',
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        loyaltyPoints: 0,
        imageURL: ''
    };
    try {
        const userData = await services.signup(customer);
        const newUser: Customer = await services.addCustomer({
            id: userData.uid,
            ...customer,
        });
        return res.status(200).json({ status: 'success', data: newUser });
    } catch (error) {
        return res.status(400).json({ status: 'error', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const userData = await services.login(email, password);
        return res.status(200).json({ status: 'success', data: userData });
    } catch (error) {
        return res.status(400).json({ status: 'error', error: error.message });
    }
};