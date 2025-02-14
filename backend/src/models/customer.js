const db = require('../config/database');

class Customer {
    static async getAllCustomers(page = 1, limit = 10, search = '', sortBy = '') {
        const offset = (page - 1) * limit;
        
        // Base query with payment status calculation
        let query = `
            WITH CustomerPaymentStatus AS (
                SELECT 
                    c.*,
                    CASE
                        WHEN EXISTS (
                            SELECT 1 FROM payments p 
                            WHERE p.customer_id = c.customer_id 
                            AND p.billing_month = MONTH(CURRENT_DATE)
                            AND p.billing_year = YEAR(CURRENT_DATE)
                        ) THEN 'paid'
                        WHEN DATE(c.registration_date) >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 'unpaid'
                        WHEN NOT EXISTS (
                            SELECT 1 FROM payments p 
                            WHERE p.customer_id = c.customer_id 
                            AND (
                                (MONTH(CURRENT_DATE) = 1 AND p.billing_month = 12 AND p.billing_year = YEAR(CURRENT_DATE) - 1)
                                OR 
                                (MONTH(CURRENT_DATE) > 1 AND p.billing_month = MONTH(CURRENT_DATE) - 1 AND p.billing_year = YEAR(CURRENT_DATE))
                            )
                        ) THEN 'overdue'
                        ELSE 'unpaid'
                    END as payment_status
                FROM customers c
                WHERE 1=1
        `;
        const values = [];

        if (search) {
            query += ' AND (c.full_name LIKE ? OR c.rfid_number LIKE ? OR c.contact_number LIKE ?)';
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ') ';

        // Get total count for pagination
        const countQuery = query + 'SELECT COUNT(*) as total FROM CustomerPaymentStatus';
        const [countResult] = await db.query(countQuery, values);
        const total = countResult[0].total;

        // Get paginated results with sorting
        query += `
            SELECT * FROM CustomerPaymentStatus 
            ORDER BY 
        `;

        // Add sort conditions based on sortBy parameter
        switch (sortBy) {
            case 'id':
                query += 'CAST(rfid_number AS UNSIGNED)';
                break;
            case 'name':
                query += 'full_name';
                break;
            case 'billing':
                query += 'due_date';
                break;
            case 'status':
                query += `
                    CASE payment_status
                        WHEN 'overdue' THEN 1
                        WHEN 'unpaid' THEN 2
                        WHEN 'paid' THEN 3
                        ELSE 4
                    END
                `;
                break;
            default:
                query += 'registration_date DESC';
        }

        query += ' LIMIT ? OFFSET ?';
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
            'SELECT * FROM customers WHERE customer_id = ?',
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
        // Handle partial updates by only updating the fields that are provided
        const updateFields = [];
        const values = [];
        
        if (customerData.rfid_number !== undefined) {
            updateFields.push('rfid_number = ?');
            values.push(customerData.rfid_number);
        }
        if (customerData.full_name !== undefined) {
            updateFields.push('full_name = ?');
            values.push(customerData.full_name);
        }
        if (customerData.contact_number !== undefined) {
            updateFields.push('contact_number = ?');
            values.push(customerData.contact_number);
        }
        if (customerData.address !== undefined) {
            updateFields.push('address = ?');
            values.push(customerData.address);
        }
        if (customerData.plan_type !== undefined) {
            updateFields.push('plan_type = ?');
            values.push(customerData.plan_type);
        }
        if (customerData.monthly_fee !== undefined) {
            updateFields.push('monthly_fee = ?');
            values.push(customerData.monthly_fee);
        }
        if (customerData.due_date !== undefined) {
            updateFields.push('due_date = ?');
            values.push(customerData.due_date);
        }
        if (customerData.is_active !== undefined) {
            updateFields.push('is_active = ?');
            values.push(customerData.is_active);
        }

        if (updateFields.length === 0) {
            return false;
        }

        // Add customerId to values array
        values.push(customerId);

        const query = `
            UPDATE customers 
            SET ${updateFields.join(', ')}
            WHERE customer_id = ?
        `;

        console.log('Executing update query:', query, 'with values:', values);
        const [result] = await db.query(query, values);
        console.log('Update result:', result);
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
            LEFT JOIN payments p1 ON c.customer_id = p1.customer_id 
                AND p1.billing_month = MONTH(CURRENT_DATE)
                AND p1.billing_year = YEAR(CURRENT_DATE)
            LEFT JOIN payments p2 ON c.customer_id = p2.customer_id 
                AND (
                    (MONTH(CURRENT_DATE) = 1 AND p2.billing_month = 12 AND p2.billing_year = YEAR(CURRENT_DATE) - 1)
                    OR 
                    (MONTH(CURRENT_DATE) > 1 AND p2.billing_month = MONTH(CURRENT_DATE) - 1 AND p2.billing_year = YEAR(CURRENT_DATE))
                )
            WHERE c.is_active = TRUE 
                AND p1.payment_id IS NULL 
                AND p2.payment_id IS NULL
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