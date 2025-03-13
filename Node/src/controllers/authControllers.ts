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
    const { email, firstName, lastName, password, username, phoneNumber } = req.body;
    if (!email || !password || !firstName || !lastName || !username || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const userData = await services.signup(email, password);
    if (userData.status === 'error') {
        return res.status(400).json(userData);
    }
    const fullUser = {
        id: userData.user.uid,
        username,
        email,
        firstName,
        lastName,
        phoneNumber,
        loyaltyPoints: 0,
        imageURL: '',
    };
    const newUser = await services.addCustomer(fullUser);
    return res.status(200).json({
        ...newUser,
        accessToken: await userData.user.getIdToken(),
        refreshToken: userData.user.refreshToken,
    });
};
