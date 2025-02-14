const Customer = require('../models/customer');

class CustomerController {
    static async getCustomers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const sortBy = req.query.sortBy || '';

            const result = await Customer.getAllCustomers(page, limit, search, sortBy);
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
            console.log('Update request received:', { id: req.params.id, body: req.body });
            
            // Get current customer data
            const currentCustomer = await Customer.getCustomerById(req.params.id);
            if (!currentCustomer) {
                console.log('Customer not found:', req.params.id);
                return res.status(404).json({ error: 'Customer not found' });
            }
            console.log('Current customer data:', currentCustomer);

            // Ensure boolean values are properly converted
            if (req.body.is_active !== undefined) {
                req.body.is_active = Boolean(req.body.is_active);
            }

            // For partial updates, only update the fields that are provided
            const success = await Customer.updateCustomer(req.params.id, req.body);
            if (!success) {
                console.log('Update failed for customer:', req.params.id);
                return res.status(404).json({ error: 'Failed to update customer' });
            }

            const updatedCustomer = await Customer.getCustomerById(req.params.id);
            console.log('Customer updated successfully:', updatedCustomer);
            res.json(updatedCustomer);
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