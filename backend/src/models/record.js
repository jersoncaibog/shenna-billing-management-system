const db = require('../config/database');

class Record {
    static async getAllRecords(page = 1, limit = 10, search = '', filters = {}) {
        const offset = (page - 1) * limit;
        let baseQuery = `
            FROM bills b
            JOIN customers c ON b.customer_id = c.customer_id
            LEFT JOIN payment_records pr ON b.bill_id = pr.bill_id
            WHERE 1=1
        `;
        const values = [];

        if (search) {
            baseQuery += ' AND (c.full_name LIKE ? OR c.rfid_number LIKE ?)';
            values.push(`%${search}%`, `%${search}%`);
        }

        if (filters.startDate) {
            baseQuery += ' AND (DATE(pr.payment_date) >= ? OR pr.payment_date IS NULL)';
            values.push(filters.startDate);
        }

        if (filters.endDate) {
            baseQuery += ' AND (DATE(pr.payment_date) <= ? OR pr.payment_date IS NULL)';
            values.push(filters.endDate);
        }

        if (filters.status) {
            baseQuery += ' AND b.status = ?';
            values.push(filters.status);
        }

        // Get total count for pagination
        const countQuery = `SELECT COUNT(DISTINCT b.bill_id) as total ${baseQuery}`;
        const [countResult] = await db.query(countQuery, values);
        const total = countResult[0].total;

        // Get paginated results
        const selectQuery = `
            SELECT 
                b.bill_id,
                b.bill_amount,
                b.bill_date,
                b.due_date,
                b.status as bill_status,
                c.full_name,
                c.rfid_number,
                COALESCE(pr.payment_id, 0) as payment_id,
                COALESCE(pr.amount, 0) as amount,
                pr.payment_date,
                pr.payment_method,
                pr.remarks
            ${baseQuery}
            GROUP BY b.bill_id
            ORDER BY COALESCE(pr.payment_date, b.bill_date) DESC 
            LIMIT ? OFFSET ?
        `;
        values.push(limit, offset);

        const [rows] = await db.query(selectQuery, values);
        
        return {
            records: rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getRecordById(paymentId) {
        const [rows] = await db.query(
            `SELECT 
                pr.*,
                c.full_name,
                c.rfid_number,
                b.status as bill_status
            FROM payment_records pr
            JOIN customers c ON pr.customer_id = c.customer_id
            JOIN bills b ON pr.bill_id = b.bill_id
            WHERE pr.payment_id = ?`,
            [paymentId]
        );
        return rows[0];
    }

    static async getCustomerRecords(customerId) {
        const [rows] = await db.query(
            `SELECT 
                pr.*,
                b.status as bill_status,
                b.bill_date,
                b.due_date
            FROM payment_records pr
            JOIN bills b ON pr.bill_id = b.bill_id
            WHERE pr.customer_id = ?
            ORDER BY pr.payment_date DESC`,
            [customerId]
        );
        return rows;
    }

    static async createPaymentRecord(paymentData) {
        const {
            customer_id,
            bill_id,
            amount,
            payment_method,
            remarks
        } = paymentData;

        // Start a transaction
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insert payment record
            const [result] = await connection.query(
                'INSERT INTO payment_records (customer_id, bill_id, amount, payment_method, remarks) VALUES (?, ?, ?, ?, ?)',
                [customer_id, bill_id, amount, payment_method, remarks]
            );

            // Update bill status based on payment
            const [billResult] = await connection.query(
                'SELECT bill_amount FROM bills WHERE bill_id = ?',
                [bill_id]
            );

            const [totalPaidResult] = await connection.query(
                'SELECT SUM(amount) as total_paid FROM payment_records WHERE bill_id = ?',
                [bill_id]
            );

            const billAmount = billResult[0].bill_amount;
            const totalPaid = (totalPaidResult[0].total_paid || 0) + parseFloat(amount);

            let status;
            if (totalPaid >= billAmount) {
                status = 'paid';
            } else if (totalPaid > 0) {
                status = 'partially_paid';
            } else {
                status = 'unpaid';
            }

            await connection.query(
                'UPDATE bills SET status = ? WHERE bill_id = ?',
                [status, bill_id]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async updatePaymentRecord(paymentId, paymentData) {
        const {
            amount,
            payment_method,
            remarks
        } = paymentData;

        const [result] = await db.query(
            'UPDATE payment_records SET amount = ?, payment_method = ?, remarks = ? WHERE payment_id = ?',
            [amount, payment_method, remarks, paymentId]
        );

        return result.affectedRows > 0;
    }

    static async deletePaymentRecord(paymentId) {
        const [result] = await db.query('DELETE FROM payment_records WHERE payment_id = ?', [paymentId]);
        return result.affectedRows > 0;
    }

    static async getDashboardStats() {
        const connection = await db.getConnection();
        try {
            // Get total active customers
            const [customerResult] = await connection.query(
                'SELECT COUNT(*) as total FROM customers WHERE is_active = true'
            );

            // Get monthly revenue (current month or most recent month)
            const [revenueResult] = await connection.query(
                `SELECT COALESCE(SUM(amount), 0) as total 
                FROM payment_records 
                WHERE DATE_FORMAT(payment_date, '%Y-%m') = (
                    SELECT DATE_FORMAT(MAX(payment_date), '%Y-%m')
                    FROM payment_records
                )`
            );

            // Get pending payments count
            const [pendingResult] = await connection.query(
                "SELECT COUNT(*) as total FROM bills WHERE status IN ('unpaid', 'partially_paid', 'overdue')"
            );

            // Get recent activities
            const [recentActivities] = await connection.query(
                `SELECT 
                    pr.payment_date,
                    c.full_name,
                    pr.amount,
                    b.status,
                    'payment' as activity_type
                FROM payment_records pr
                JOIN customers c ON pr.customer_id = c.customer_id
                JOIN bills b ON pr.bill_id = b.bill_id
                ORDER BY pr.payment_date DESC
                LIMIT 5`
            );

            return {
                totalCustomers: customerResult[0].total,
                monthlyRevenue: revenueResult[0].total || 0,
                pendingPayments: pendingResult[0].total,
                recentActivities
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = Record;
