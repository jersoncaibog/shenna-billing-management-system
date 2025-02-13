const db = require('../config/database');

class Payment {
    static async getAllPayments(page = 1, limit = 10, search = '') {
        const offset = (page - 1) * limit;
        let baseQuery = `
            FROM payments p
            JOIN customers c ON p.customer_id = c.customer_id
            WHERE 1=1
        `;
        const values = [];

        if (search) {
            baseQuery += ' AND (c.full_name LIKE ? OR c.rfid_number LIKE ?)';
            values.push(`%${search}%`, `%${search}%`);
        }

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const [countResult] = await db.query(countQuery, values);
        const total = countResult[0].total;

        // Get paginated results with all necessary fields
        const selectQuery = `
            SELECT 
                p.*,
                c.full_name,
                c.rfid_number
            ${baseQuery}
            ORDER BY p.payment_date DESC 
            LIMIT ? OFFSET ?
        `;
        values.push(limit, offset);

        const [rows] = await db.query(selectQuery, values);
        
        return {
            payments: rows,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getPaymentById(paymentId) {
        const [rows] = await db.query(`
            SELECT 
                p.*,
                c.full_name,
                c.rfid_number
            FROM payments p
            JOIN customers c ON p.customer_id = c.customer_id
            WHERE p.payment_id = ?
        `, [paymentId]);
        return rows[0];
    }

    static async getCustomerPayments(customerId) {
        const [rows] = await db.query(`
            SELECT 
                payment_id,
                customer_id,
                amount,
                payment_date,
                payment_method,
                billing_month,
                billing_year,
                remarks
            FROM payments 
            WHERE customer_id = ? 
            ORDER BY payment_date DESC
        `, [customerId]);
        return rows;
    }

    static async createPayment(paymentData) {
        const {
            customer_id,
            amount,
            payment_method,
            billing_month,
            billing_year,
            remarks
        } = paymentData;

        const [result] = await db.query(
            'INSERT INTO payments (customer_id, amount, payment_method, billing_month, billing_year, remarks) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, amount, payment_method, billing_month, billing_year, remarks]
        );

        return result.insertId;
    }

    static async deletePayment(paymentId) {
        const [result] = await db.query('DELETE FROM payments WHERE payment_id = ?', [paymentId]);
        return result.affectedRows > 0;
    }

    static async getMonthlyRevenue() {
        const [result] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM payments
            WHERE MONTH(payment_date) = MONTH(CURRENT_DATE)
            AND YEAR(payment_date) = YEAR(CURRENT_DATE)
        `);
        return result[0].total;
    }

    static async getPaymentsByPeriod(month, year) {
        const [rows] = await db.query(
            'SELECT * FROM payments WHERE billing_month = ? AND billing_year = ?',
            [month, year]
        );
        return rows;
    }
}

module.exports = Payment; 