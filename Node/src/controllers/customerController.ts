import { Request, Response } from 'express';
import * as services from '../services/firestore.ts';

export const getAllCustomers = async (req: Request, res: Response) => {
    res.status(200).json(await services.getAllCustomers());
};

export const getCustomer = async (req: Request, res: Response) => {
    let customerID = req.params.id;
    if (!customerID) {
        res.status(400).json({ message: 'Please provide a correct customer ID!' });
    }
    res.status(200).json(await services.getCustomer(customerID));
};

export const addCustomer = async (req: Request, res: Response) => {
    let customer = req.body;
    if (checkCustomerFormat(customer)) {
        res.status(400).json({ message: 'Please provide a correct customer format!' });
    }
    try {
        await services.addCustomer(customer);
        res.status(200).json({ message: 'Customer added' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding customer' });
    }
};

const checkCustomerFormat = (customer) => {
    return !customer.cartID || !customer.email || !customer.firstName || !customer.lastName || !customer.imageURL || !customer.password || !customer.loyaltyPoints || !customer.phoneNumber || !customer.username;
};

export const updateCustomer = async (req: Request, res: Response) => {
    let customerID = req.params.id;
    let newCustomerData = req.body;
    if (!customerID) {
        res.status(400).json({ message: 'Please provide a correct customer ID and data!' });
    }
    try {
        sanitizeCustomerData(newCustomerData);
        await services.updateCustomer(customerID, newCustomerData);
        res.status(200).json({ message: 'Customer updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer' });
    }
};

const sanitizeCustomerData = (newCustomerData) => {
    // Ensure that the object not contain other fields name rather than the cutomer fields
    let customerFields = ['cartID', 'email', 'firstName', 'imageURL', 'lastName', 'loyaltyPoints', 'password', 'phoneNumber', 'username'];
    for (let key in newCustomerData) {
        if (!customerFields.includes(key)) {
            delete newCustomerData[key];
        }
    }
    return newCustomerData;
};

export const deleteCustomer = async (req: Request, res: Response) => {
    let customerID = req.body.customerID;
    if (!customerID) {
        res.status(400).json({ message: 'Please provide a correct customer ID!' });
    }
    try {
        await services.deleteCustomer(customerID);
        res.status(200).json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer' });
    }
};
