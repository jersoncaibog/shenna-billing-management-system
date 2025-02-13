const Record = require('../models/record');

class RecordController {
    static async getRecords(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status
            };

            const result = await Record.getAllRecords(page, limit, search, filters);
            res.json(result);
        } catch (error) {
            console.error('Error getting records:', error);
            res.status(500).json({ error: 'Failed to get records' });
        }
    }

    static async getRecordById(req, res) {
        try {
            const record = await Record.getRecordById(req.params.id);
            if (!record) {
                return res.status(404).json({ error: 'Record not found' });
            }
            res.json(record);
        } catch (error) {
            console.error('Error getting record:', error);
            res.status(500).json({ error: 'Failed to get record' });
        }
    }

    static async getCustomerRecords(req, res) {
        try {
            const records = await Record.getCustomerRecords(req.params.customerId);
            res.json(records);
        } catch (error) {
            console.error('Error getting customer records:', error);
            res.status(500).json({ error: 'Failed to get customer records' });
        }
    }

    static async createRecord(req, res) {
        try {
            const recordId = await Record.createPaymentRecord(req.body);
            const record = await Record.getRecordById(recordId);
            res.status(201).json(record);
        } catch (error) {
            console.error('Error creating record:', error);
            res.status(500).json({ error: 'Failed to create record' });
        }
    }

    static async updateRecord(req, res) {
        try {
            const success = await Record.updatePaymentRecord(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ error: 'Record not found' });
            }
            const record = await Record.getRecordById(req.params.id);
            res.json(record);
        } catch (error) {
            console.error('Error updating record:', error);
            res.status(500).json({ error: 'Failed to update record' });
        }
    }

    static async deleteRecord(req, res) {
        try {
            const success = await Record.deletePaymentRecord(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Record not found' });
            }
            res.status(204).end();
        } catch (error) {
            console.error('Error deleting record:', error);
            res.status(500).json({ error: 'Failed to delete record' });
        }
    }

    static async getDashboardStats(req, res) {
        try {
            const stats = await Record.getDashboardStats();
            res.json(stats);
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({ error: 'Failed to get dashboard stats' });
        }
    }
}

module.exports = RecordController;
