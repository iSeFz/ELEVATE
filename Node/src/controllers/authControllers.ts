import { Request, Response } from 'express';
import * as services from '../services/firestore.ts';

/* Testing data
{
    "email": "test@test.com", //(given)
    "firstName": "test1", //(given)
    "imageURL": "",
    "lastName": "Test2", //(given)
    "loyaltyPoints": 100,
    "password": "testing", //(given)
    "phoneNumber": "012345678987", //(given)
    "username": "test123456", //(given)
}
*/
export const signup = async (req: Request, res: Response) => {
    const customer = {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
    };
    try {
        const userData = await services.signup(customer);
        const newUser = await services.addCustomer({
            id: userData.uid,
            ...customer,
            loyaltyPoints: 0,
            imageURL: '',
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