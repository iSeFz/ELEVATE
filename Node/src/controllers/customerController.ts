import { Request, Response } from 'express';
import * as services from '../services/firestore.js';

export const getAllCustomers = async (req: Request, res: Response) => {
    return res.status(200).json(await services.getAllCustomers());
};

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const customerID = req.params.id;
        const customer = await services.getCustomer(customerID);
        return res.status(200).json({ status: 'success', data: customer });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
// Not used, but we can make use of it later
// export const getCustomerbyEmail = async (req: Request, res: Response) => {
//     try {
//         let customerEmail = req.query.email as string;
//         const customer = await services.getCustomerWithEmail(customerEmail);
//         return res.status(200).json({ status: 'success', data: customer });
//     } catch (error) {
//         return res.status(400).json({ status: 'error', message: error.message });
//     }
// };

export const addCustomer = async (req: Request, res: Response) => {
    const customer = req.body;
    try {
        await services.addCustomer(customer);
        return res.status(200).json({ status: 'success', message: 'Customer added' });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    let customerID = req.params.id;
    let newCustomerData = req.body;
    try {
        sanitizeCustomerData(newCustomerData);
        await services.updateCustomer(customerID, newCustomerData);
        return res.status(200).json({ status: 'success', message: 'Customer updated' });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

const sanitizeCustomerData = (newCustomerData) => {
    // Ensure that the object not contain other fields name rather than the cutomer fields
    let customerFields = ['email', 'firstName', 'imageURL', 'lastName', 'password', 'phoneNumber', 'username'];
    for (let key in newCustomerData) {
        if (!customerFields.includes(key)) {
            delete newCustomerData[key];
        }
    }
    return newCustomerData;
};

export const deleteCustomer = async (req: Request, res: Response) => {
    let customerID = req.params.id;
    try {
        await services.deleteCustomer(customerID);
        return res.status(200).json({ status: 'success', message: 'Customer deleted' });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};
