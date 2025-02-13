const Customer = require('../models/customer');

class CustomerController {
    static async getCustomers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';

            const result = await Customer.getAllCustomers(page, limit, search);
            res.json(result);
        } catch (error) {
            console.error('Error getting customers:', error);
            res.status(500).json({ error: 'Failed to get customers' });
        }
    }

    static async getCustomerById(req, res) {
        try {
            const customer = await Customer.getCustomerById(req.params.id);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            res.json(customer);
        } catch (error) {
            console.error('Error getting customer:', error);
            res.status(500).json({ error: 'Failed to get customer' });
        }
    }

    static async getCustomerByRFID(req, res) {
        try {
            const customer = await Customer.getCustomerByRFID(req.params.rfid);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            res.json(customer);
        } catch (error) {
            console.error('Error getting customer by RFID:', error);
            res.status(500).json({ error: 'Failed to get customer' });
        }
    }

    static async createCustomer(req, res) {
        try {
            const customerId = await Customer.createCustomer(req.body);
            const customer = await Customer.getCustomerById(customerId);
            res.status(201).json(customer);
        } catch (error) {
            console.error('Error creating customer:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'RFID number already exists' });
            }
            res.status(500).json({ error: 'Failed to create customer' });
        }
    }

    static async updateCustomer(req, res) {
        try {
            const success = await Customer.updateCustomer(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            const customer = await Customer.getCustomerById(req.params.id);
            res.json(customer);
        } catch (error) {
            console.error('Error updating customer:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'RFID number already exists' });
            }
            res.status(500).json({ error: 'Failed to update customer' });
        }
    }

    static async deleteCustomer(req, res) {
        try {
            const success = await Customer.deleteCustomer(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            res.status(204).end();
        } catch (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ error: 'Failed to delete customer' });
        }
    }
}

module.exports = CustomerController;
