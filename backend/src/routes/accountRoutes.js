const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');

// Get all customers with pagination and search
router.get('/', CustomerController.getCustomers);

// Get customer by ID
router.get('/:id', CustomerController.getCustomerById);

// Get customer by RFID
router.get('/rfid/:rfid', CustomerController.getCustomerByRFID);

// Create new customer
router.post('/', CustomerController.createCustomer);

// Update customer
router.put('/:id', CustomerController.updateCustomer);

// Delete customer
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router; 