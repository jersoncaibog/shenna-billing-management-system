const db = require('../config/database');

class Customer {
    static async getAllCustomers(page = 1, limit = 10, search = '') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM customers WHERE 1=1';
        const values = [];

        if (search) {
            query += ' AND (full_name LIKE ? OR rfid_number LIKE ? OR contact_number LIKE ?)';
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Get total count for pagination
        const [countResult] = await db.query(query.replace('*', 'COUNT(*) as total'), values);
        const total = countResult[0].total;

        // Get paginated results
        query += ' ORDER BY registration_date DESC LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const [rows] = await db.query(query, values);
        
        return {
            customers: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    static async getCustomerById(id) {
        const [rows] = await db.query(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getCustomerByRFID(rfid) {
        const [rows] = await db.query(
            'SELECT * FROM customers WHERE rfid_number = ?',
            [rfid]
        );
        return rows[0];
    }

    static async createCustomer(customerData) {
        const {
            rfid_number,
            full_name,
            contact_number,
            address,
            plan_type,
            monthly_fee,
            due_date
        } = customerData;

        const [result] = await db.query(
            'INSERT INTO customers (rfid_number, full_name, contact_number, address, plan_type, monthly_fee, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [rfid_number, full_name, contact_number, address, plan_type, monthly_fee, due_date]
        );

        return result.insertId;
    }

    static async updateCustomer(customerId, customerData) {
        const {
            full_name,
            contact_number,
            address,
            plan_type,
            monthly_fee,
            due_date,
            is_active
        } = customerData;

        const [result] = await db.query(
            'UPDATE customers SET full_name = ?, contact_number = ?, address = ?, plan_type = ?, monthly_fee = ?, due_date = ?, is_active = ? WHERE customer_id = ?',
            [full_name, contact_number, address, plan_type, monthly_fee, due_date, is_active, customerId]
        );

        return result.affectedRows > 0;
    }

    static async deleteCustomer(customerId) {
        const [result] = await db.query('DELETE FROM customers WHERE customer_id = ?', [customerId]);
        return result.affectedRows > 0;
    }

    static async getOverdueCustomers() {
        const [rows] = await db.query(`
            SELECT c.* 
            FROM customers c
            LEFT JOIN payments p ON c.customer_id = p.customer_id 
                AND p.billing_month = MONTH(CURRENT_DATE)
                AND p.billing_year = YEAR(CURRENT_DATE)
            WHERE c.is_active = TRUE 
                AND p.payment_id IS NULL 
                AND c.due_date < DAY(CURRENT_DATE)
        `);
        return rows;
    }

    static async getActiveCustomersCount() {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM customers WHERE is_active = TRUE'
        );
        return result[0].count;
    }
}

module.exports = Customer; 