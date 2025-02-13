# RFID Bill Payment Tracking System Requirements

## Project Overview
A web-based internet bill payment tracking system that uses RFID cards to quickly identify customers and access their payment records. The system facilitates customer registration and bill payment processing with an intuitive interface.

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Express.js
- Database: MariaDB
- Hardware: RFID Reader System
- UI Framework: shadcn/ui components with New York style theme
- Icons: Lucide React icons

## UI/UX Design Specifications

### Layout Structure
1. Sidebar Navigation
   - Fixed position on the left side
   - Dark theme following New York style
   - Company logo/name at the top
   - Navigation menu items:
     - Dashboard
     - Customer Management
     - Payment Records
     - Settings
   - User profile section at bottom

2. Main Content Area
   - Right side of sidebar
   - Responsive padding and margins
   - Content header with page title and actions
   - Card-based content layout

3. Design System
   - shadcn/ui New York style theme
   - Typography:
     - Inter font family
     - Clear hierarchy with headings
   - Color Scheme:
     - No dark mode/ only light theme
     - High contrast elements
     - Accent colors for actions
   - Components:
     - Cards with subtle borders
     - Tables with hover states
     - Form inputs with floating labels
     - Toast notifications

## Functional Requirements

### Customer Management
1. RFID Card Registration
   - Assign unique RFID cards to customers
   - Link RFID numbers with customer profiles
   - Validate RFID card uniqueness

2. Customer Registration Form
   - Capture customer details:
     - Full name
     - Contact number
     - Email address
     - Home address
     - RFID card number
     - Internet Plan details:
       - Plan name
       - Speed (Mbps)
       - Monthly fee
   - Input validation for all fields
   - Display success/error messages

3. Customer Information Display
   - View all registered customers
   - Search functionality by name/RFID
   - Filter and sort capabilities
   - Edit customer information and plan details
   - Deactivate/reactivate customer accounts

### Bill Payment Management
1. Payment Processing
   - Scan RFID to auto-populate customer details
   - View current bill information
   - Enter payment details:
     - Amount paid
     - Payment date
     - Payment method
   - Generate payment receipt
   - Print capability for receipts
   - Automatic bill status updates

2. Payment Records Display
   - View all payment transactions
   - Filter by date range and payment status
   - Search by customer name/RFID
   - Export payment records
   - Generate payment reports
   - Track bill payment history

### Bill Management
1. Bill Generation
   - Create monthly bills for customers
   - Set bill amounts based on plan fees
   - Assign due dates
   - Track bill status (unpaid/paid/overdue/partially paid)

2. Bill History
   - View customer billing history
   - Track payment status
   - Generate billing reports
   - Export billing data

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_speed_mbps INT NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_modified DATETIME ON UPDATE CURRENT_TIMESTAMP
);
```

### Bills Table
```sql
CREATE TABLE bills (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    bill_amount DECIMAL(10,2) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    billing_period_month INT NOT NULL,
    billing_period_year INT NOT NULL,
    status ENUM('unpaid', 'paid', 'overdue', 'partially_paid') NOT NULL DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    INDEX idx_customer_bills (customer_id, status)
);
```

### Payment_Records Table
```sql
CREATE TABLE payment_records (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    bill_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Cash', 'Card', 'Online') NOT NULL,
    remarks TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_payment_date (payment_date)
);
```

## System Interfaces

1. Software Interface
   - REST API endpoints for data access
   - Database connection pooling
   - Client-side form validation
   - Server-side data validation

## Error Handling
- Display user-friendly error messages
- Log system errors
- Implement proper exception handling
- Provide fallback methods for RFID failures