const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// Get dashboard statistics
router.get('/dashboard/stats', PaymentController.getDashboardStats);

// Get customer's payments (specific route before generic routes)
router.get('/customer/:customerId', PaymentController.getCustomerPayments);

// Get all payments with pagination and search
router.get('/', PaymentController.getPayments);

// Get payment by ID
router.get('/:id', PaymentController.getPaymentById);

// Create new payment
router.post('/', PaymentController.createPayment);

// Delete payment
router.delete('/:id', PaymentController.deletePayment);

module.exports = router;
