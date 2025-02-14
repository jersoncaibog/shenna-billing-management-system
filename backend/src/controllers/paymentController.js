const Payment = require('../models/payment');
const Customer = require('../models/customer');

class PaymentController {
    static async getPayments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const filters = {
                method: req.query.method || ''
            };

            const result = await Payment.getAllPayments(page, limit, search, filters);
            res.json(result);
        } catch (error) {
            console.error('Error getting payments:', error);
            res.status(500).json({ error: 'Failed to get payments' });
        }
    }

    static async getPaymentById(req, res) {
        try {
            const payment = await Payment.getPaymentById(req.params.id);
            if (!payment) {
                return res.status(404).json({ error: 'Payment not found' });
            }
            res.json(payment);
        } catch (error) {
            console.error('Error getting payment:', error);
            res.status(500).json({ error: 'Failed to get payment' });
        }
    }

    static async getCustomerPayments(req, res) {
        try {
            const payments = await Payment.getCustomerPayments(req.params.customerId);
            res.json(payments);
        } catch (error) {
            console.error('Error getting customer payments:', error);
            res.status(500).json({ error: 'Failed to get customer payments' });
        }
    }

    static async createPayment(req, res) {
        try {
            const paymentId = await Payment.createPayment(req.body);
            const payment = await Payment.getPaymentById(paymentId);
            res.status(201).json(payment);
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({ error: 'Failed to create payment' });
        }
    }

    static async deletePayment(req, res) {
        try {
            const success = await Payment.deletePayment(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Payment not found' });
            }
            res.status(204).end();
        } catch (error) {
            console.error('Error deleting payment:', error);
            res.status(500).json({ error: 'Failed to delete payment' });
        }
    }

    static async getDashboardStats(req, res) {
        try {
            const [activeCustomers, monthlyRevenue, overdueCustomers] = await Promise.all([
                Customer.getActiveCustomersCount(),
                Payment.getMonthlyRevenue(),
                Customer.getOverdueCustomers()
            ]);

            res.json({
                activeCustomers,
                monthlyRevenue,
                overdueAccounts: overdueCustomers.length
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({ error: 'Failed to get dashboard stats' });
        }
    }
}

module.exports = PaymentController; 