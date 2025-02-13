import ApiService from './api.js';

let currentPage = 1;
const PAGE_SIZE = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    setupEventListeners();
});

async function loadCustomers(page = currentPage) {
    try {
        const searchInput = document.getElementById('searchCustomer').value;
        const result = await ApiService.getCustomers(page, PAGE_SIZE, searchInput);
        await displayCustomers(result.customers);
        updatePagination(result);
        currentPage = page;
    } catch (error) {
        console.error('Error loading customers:', error);
        // Show error message to user
    }
}

async function displayCustomers(customers) {
    const tbody = document.getElementById('customersList');
    
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Process all customers in parallel
    const rows = await Promise.all(customers.map(async customer => {
        const nextDueDate = getNextDueDate(customer.due_date);
        const dueDateStatus = getDueDateStatus(nextDueDate);
        
        // Check payment status
        try {
            const payments = await ApiService.getCustomerPayments(customer.customer_id);
            const hasCurrentMonthPayment = payments && payments.some(payment => 
                payment.billing_month === currentMonth && 
                payment.billing_year === currentYear
            );

            return `
            <tr>
                <td>${customer.rfid_number}</td>
                <td>${customer.full_name}</td>
                <td>${customer.contact_number}</td>
                <td>${customer.address}</td>
                <td>${customer.plan_type}</td>
                <td>
                    <span class="due-date ${dueDateStatus}">
                        ${formatDate(nextDueDate)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
                        ${customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <span class="payment-status ${hasCurrentMonthPayment ? 'paid' : 'unpaid'}">
                        ${hasCurrentMonthPayment ? 'Paid' : 'Unpaid'}
                    </span>
                </td>
                <td>
                    <button class="btn-action edit" data-id="${customer.customer_id}">
                        Edit
                    </button>
                    <button class="btn-action delete" data-id="${customer.customer_id}">
                        Delete
                    </button>
                </td>
            </tr>
            `;
        } catch (error) {
            console.error('Error checking payment status:', error);
            return `
            <tr>
                <td>${customer.rfid_number}</td>
                <td>${customer.full_name}</td>
                <td>${customer.contact_number}</td>
                <td>${customer.address}</td>
                <td>${customer.plan_type}</td>
                <td>
                    <span class="due-date ${dueDateStatus}">
                        ${formatDate(nextDueDate)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
                        ${customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <span class="payment-status unpaid">
                        Error
                    </span>
                </td>
                <td>
                    <button class="btn-action edit" data-id="${customer.customer_id}">
                        Edit
                    </button>
                    <button class="btn-action delete" data-id="${customer.customer_id}">
                        Delete
                    </button>
                </td>
            </tr>
            `;
        }
    }));

    tbody.innerHTML = rows.join('');
}

function getNextDueDate(dueDay) {
    const today = new Date();
    const currentDay = today.getDate();
    let dueDate = new Date();

    // If we've passed this month's due date, set to next month
    if (currentDay >= dueDay) {
        dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Set the day of the month
    dueDate.setDate(dueDay);

    return dueDate;
}

function getDueDateStatus(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
        return 'overdue';
    } else if (daysUntilDue <= 7) {
        return 'due-soon';
    } else {
        return 'on-track';
    }
}

function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
}

function getStatusInfo(dueDate, billStatus) {
    if (!dueDate) return { colorClass: '' };
    
    const today = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (billStatus === 'overdue' || daysUntilDue < 0) {
        return { colorClass: 'status-red' };
    } else if (daysUntilDue <= 7) {
        return { colorClass: 'status-yellow' };
    } else {
        return { colorClass: 'status-green' };
    }
}

function updatePagination(result) {
    const { page, totalPages } = result;
    document.getElementById('pageInfo').textContent = `Page ${page} of ${totalPages}`;
    
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchCustomer');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadCustomers();
        }, 300);
    });

    // Filters
    document.getElementById('planFilter').addEventListener('change', () => {
        currentPage = 1;
        loadCustomers();
    });

    document.getElementById('statusFilter').addEventListener('change', () => {
        currentPage = 1;
        loadCustomers();
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            loadCustomers(currentPage - 1);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        loadCustomers(currentPage + 1);
    });

    // Customer actions
    document.getElementById('customersList').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const customerId = button.dataset.id;

        if (button.classList.contains('edit')) {
            // Handle edit - You'll need to implement this
            console.log('Edit customer:', customerId);
        } else if (button.classList.contains('delete')) {
            try {
                await ApiService.deleteCustomer(customerId);
                loadCustomers(currentPage);
            } catch (error) {
                console.error('Error deleting customer:', error);
                // Show error message to user
            }
        }
    });

    // Add customer button
    document.querySelector('.add-customer').addEventListener('click', () => {
        // Handle add customer - You'll need to implement this
        console.log('Add new customer');
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}
