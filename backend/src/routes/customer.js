const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer');

// Get all customers
router.get('/', CustomerController.getAllCustomers);

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