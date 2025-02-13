
-- Create customers table with simplified fields
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    plan_type ENUM('Basic', 'Normal', 'Premium') NOT NULL,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    due_date INT NOT NULL CHECK (
        due_date BETWEEN 1 AND 31
    ),
    -- Day of month when payment is due
    is_active BOOLEAN DEFAULT TRUE,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME ON UPDATE CURRENT_TIMESTAMP
);
-- Create payments table (simplified from previous payment_records and bills)
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'Card', 'Online') NOT NULL,
    billing_month INT NOT NULL CHECK (
        billing_month BETWEEN 1 AND 12
    ),
    billing_year INT NOT NULL,
    remarks TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_billing_period (billing_month, billing_year)
);