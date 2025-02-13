use shenna_bill_tracker;
-- Disable foreign key checks temporarily for bulk loading
SET FOREIGN_KEY_CHECKS = 0;
-- Clear existing data
TRUNCATE TABLE payments;
TRUNCATE TABLE customers;
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
-- Get current date for reference
SET @current_date = CURRENT_DATE();
SET @current_month = MONTH(@current_date);
SET @current_year = YEAR(@current_date);
-- Calculate last month with proper wrapping
SET @last_month = IF(@current_month = 1, 12, @current_month - 1);
SET @last_month_year = IF(
        @current_month = 1,
        @current_year - 1,
        @current_year
    );
-- Calculate two months ago with proper wrapping
SET @two_months_ago = IF(
        @current_month <= 2,
        @current_month + 10,
        @current_month - 2
    );
SET @two_months_ago_year = IF(
        @current_month <= 2,
        @current_year - 1,
        @current_year
    );
-- =============================================
-- 1. Insert sample customers (20 total)
-- =============================================
INSERT INTO customers (
        rfid_number,
        full_name,
        contact_number,
        address,
        plan_type,
        monthly_fee,
        due_date,
        is_active
    )
VALUES -- Group 1: Customers who have paid this month (5)
    (
        '10000001',
        'Juan Dela Cruz',
        '09171234567',
        '123 Rizal St., Makati City',
        'Normal',
        1500.00,
        5,
        TRUE
    ),
    (
        '10000002',
        'Maria Santos',
        '09182345678',
        '456 Bonifacio Ave., Taguig City',
        'Premium',
        1800.00,
        10,
        TRUE
    ),
    (
        '10000003',
        'Pedro Reyes',
        '09193456789',
        '789 Mabini Rd., Mandaluyong City',
        'Basic',
        1200.00,
        12,
        TRUE
    ),
    (
        '10000004',
        'Ana Gonzales',
        '09204567890',
        '321 Quezon Blvd., Quezon City',
        'Premium',
        1800.00,
        8,
        TRUE
    ),
    (
        '10000005',
        'Ricardo Lim',
        '09215678901',
        '654 Manila Road, Pasig City',
        'Normal',
        1500.00,
        15,
        TRUE
    ),
    -- Group 2: Customers with upcoming due dates (5)
    (
        '10000006',
        'Sofia Garcia',
        '09226789012',
        '987 Pasay Street, Pasay City',
        'Basic',
        1200.00,
        25,
        TRUE
    ),
    (
        '10000007',
        'Miguel Torres',
        '09237890123',
        '147 Marikina Ave., Marikina City',
        'Premium',
        1800.00,
        28,
        TRUE
    ),
    (
        '10000008',
        'Carmen Flores',
        '09248901234',
        '258 Caloocan St., Caloocan City',
        'Basic',
        1200.00,
        30,
        TRUE
    ),
    (
        '10000009',
        'Luis Martinez',
        '09259012345',
        '369 Valenzuela Rd., Valenzuela City',
        'Normal',
        1500.00,
        27,
        TRUE
    ),
    (
        '10000010',
        'Isabella Cruz',
        '09260123456',
        '741 Paranaque Ave., Paranaque City',
        'Premium',
        1800.00,
        29,
        TRUE
    ),
    -- Group 3: Overdue customers (5)
    (
        '10000011',
        'Gabriel Santos',
        '09271234567',
        '123 Alabang, Muntinlupa City',
        'Premium',
        1800.00,
        15,
        TRUE
    ),
    (
        '10000012',
        'Andrea Reyes',
        '09282345678',
        '456 Las Piñas Blvd., Las Piñas City',
        'Normal',
        1500.00,
        10,
        TRUE
    ),
    (
        '10000013',
        'Marco Ramos',
        '09293456789',
        '789 San Juan City',
        'Basic',
        1200.00,
        18,
        TRUE
    ),
    (
        '10000014',
        'Patricia Tan',
        '09304567890',
        '321 Pateros',
        'Premium',
        1800.00,
        20,
        TRUE
    ),
    (
        '10000015',
        'Daniel Lee',
        '09315678901',
        '654 Malabon City',
        'Normal',
        1500.00,
        16,
        TRUE
    ),
    -- Group 4: Inactive customers (3)
    (
        '10000016',
        'Victoria Lim',
        '09326789012',
        '987 Navotas City',
        'Basic',
        1200.00,
        5,
        FALSE
    ),
    (
        '10000017',
        'Emmanuel Cruz',
        '09337890123',
        '147 Pasig City',
        'Premium',
        1800.00,
        10,
        FALSE
    ),
    (
        '10000018',
        'Sophia Rivera',
        '09348901234',
        '258 Makati City',
        'Normal',
        1500.00,
        15,
        FALSE
    ),
    -- Group 5: New customers (2)
    (
        '10000019',
        'Adrian Castro',
        '09359012345',
        '369 Mandaluyong City',
        'Premium',
        1800.00,
        20,
        TRUE
    ),
    (
        '10000020',
        'Beatrice Santos',
        '09360123456',
        '741 Taguig City',
        'Normal',
        1500.00,
        25,
        TRUE
    );
-- =============================================
-- 2. Insert sample payments (40 total)
-- =============================================
INSERT INTO payments (
        customer_id,
        amount,
        payment_date,
        payment_method,
        billing_month,
        billing_year,
        remarks
    )
VALUES -- Current month payments (10)
    (
        1,
        1500.00,
        DATE_FORMAT(NOW(), '%Y-%m-05 09:00:00'),
        'Cash',
        @current_month,
        @current_year,
        'Monthly payment'
    ),
    (
        2,
        1800.00,
        DATE_FORMAT(NOW(), '%Y-%m-10 10:30:00'),
        'Card',
        @current_month,
        @current_year,
        'Monthly payment'
    ),
    (
        3,
        1200.00,
        DATE_FORMAT(NOW(), '%Y-%m-12 11:45:00'),
        'Online',
        @current_month,
        @current_year,
        'Monthly payment'
    ),
    (
        4,
        1800.00,
        DATE_FORMAT(NOW(), '%Y-%m-08 13:15:00'),
        'Cash',
        @current_month,
        @current_year,
        'Monthly payment'
    ),
    (
        5,
        1500.00,
        DATE_FORMAT(NOW(), '%Y-%m-15 14:30:00'),
        'Card',
        @current_month,
        @current_year,
        'Monthly payment'
    ),
    (
        19,
        1800.00,
        DATE_FORMAT(NOW(), '%Y-%m-01 09:15:00'),
        'Cash',
        @current_month,
        @current_year,
        'First month payment'
    ),
    (
        20,
        1500.00,
        DATE_FORMAT(NOW(), '%Y-%m-02 10:45:00'),
        'Online',
        @current_month,
        @current_year,
        'First month payment'
    ),
    (
        6,
        1200.00,
        DATE_FORMAT(NOW(), '%Y-%m-03 11:30:00'),
        'Card',
        @current_month,
        @current_year,
        'Advance payment'
    ),
    (
        7,
        1800.00,
        DATE_FORMAT(NOW(), '%Y-%m-04 14:15:00'),
        'Cash',
        @current_month,
        @current_year,
        'Advance payment'
    ),
    (
        8,
        1200.00,
        DATE_FORMAT(NOW(), '%Y-%m-05 15:45:00'),
        'Online',
        @current_month,
        @current_year,
        'Advance payment'
    ),
    -- Last month payments (15)
    (
        1,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-05 09:00:00'
        ),
        'Cash',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        2,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-10 10:30:00'
        ),
        'Online',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        3,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-12 11:45:00'
        ),
        'Card',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        4,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-08 13:15:00'
        ),
        'Cash',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        5,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-15 14:30:00'
        ),
        'Online',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        6,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-25 09:00:00'
        ),
        'Card',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        7,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-28 10:30:00'
        ),
        'Cash',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        8,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-30 11:45:00'
        ),
        'Online',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        9,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-27 13:15:00'
        ),
        'Card',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        10,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-29 14:30:00'
        ),
        'Cash',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        16,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-05 15:45:00'
        ),
        'Online',
        @last_month,
        @last_month_year,
        'Last payment before deactivation'
    ),
    (
        17,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-10 16:30:00'
        ),
        'Card',
        @last_month,
        @last_month_year,
        'Last payment before deactivation'
    ),
    (
        18,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-15 17:15:00'
        ),
        'Cash',
        @last_month,
        @last_month_year,
        'Last payment before deactivation'
    ),
    (
        11,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-15 09:00:00'
        ),
        'Online',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    (
        12,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 1 MONTH),
            '%Y-%m-10 10:30:00'
        ),
        'Card',
        @last_month,
        @last_month_year,
        'Monthly payment'
    ),
    -- Two months ago payments (15)
    (
        1,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-05 09:00:00'
        ),
        'Cash',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        2,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-10 10:30:00'
        ),
        'Card',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        3,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-12 11:45:00'
        ),
        'Online',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        11,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-15 13:15:00'
        ),
        'Cash',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        12,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-10 14:30:00'
        ),
        'Online',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        13,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-18 15:45:00'
        ),
        'Card',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        14,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-20 16:30:00'
        ),
        'Cash',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        15,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-16 17:15:00'
        ),
        'Online',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        16,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-05 09:00:00'
        ),
        'Card',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        17,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-10 10:30:00'
        ),
        'Cash',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        18,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-15 11:45:00'
        ),
        'Online',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        6,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-25 13:15:00'
        ),
        'Card',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        7,
        1800.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-28 14:30:00'
        ),
        'Cash',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        8,
        1200.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-30 15:45:00'
        ),
        'Online',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    ),
    (
        9,
        1500.00,
        DATE_FORMAT(
            DATE_SUB(NOW(), INTERVAL 2 MONTH),
            '%Y-%m-27 16:30:00'
        ),
        'Card',
        @two_months_ago,
        @two_months_ago_year,
        'Monthly payment'
    );