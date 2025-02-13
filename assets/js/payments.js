import ApiService from './api.js';

let currentPage = 1;
const PAGE_SIZE = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadPayments();
    setupEventListeners();
});

async function loadPayments(page = currentPage) {
    try {
        const searchInput = document.getElementById('searchPayments').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const method = document.getElementById('paymentMethod').value;

        const result = await ApiService.getPayments(page, PAGE_SIZE, searchInput, {
            startDate,
            endDate,
            method
        });

        displayPayments(result.payments);
        updatePagination(result);
        currentPage = page;
    } catch (error) {
        console.error('Error loading payments:', error);
        // Show error message to user
    }
}

function displayPayments(payments) {
    const tbody = document.getElementById('paymentsList');
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.payment_id}</td>
            <td>${payment.full_name}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${formatDate(payment.payment_date)}</td>
            <td>${payment.payment_method}</td>
            <td>${formatBillingPeriod(payment.billing_month, payment.billing_year)}</td>
            <td>
                <button class="btn-action view" data-id="${payment.payment_id}">
                    View
                </button>
                <button class="btn-action delete" data-id="${payment.payment_id}">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function updatePagination(result) {
    const { page, totalPages } = result;
    document.getElementById('pageInfo').textContent = `Page ${page} of ${totalPages}`;
    
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchPayments');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadPayments();
        }, 300);
    });

    // Date filters
    document.getElementById('startDate').addEventListener('change', () => {
        currentPage = 1;
        loadPayments();
    });

    document.getElementById('endDate').addEventListener('change', () => {
        currentPage = 1;
        loadPayments();
    });

    // Payment method filter
    document.getElementById('paymentMethod').addEventListener('change', () => {
        currentPage = 1;
        loadPayments();
    });

    // Apply filters button
    document.getElementById('applyFilter').addEventListener('click', () => {
        currentPage = 1;
        loadPayments();
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            loadPayments(currentPage - 1);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        loadPayments(currentPage + 1);
    });

    // Payment actions
    document.getElementById('paymentsList').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const paymentId = button.dataset.id;

        if (button.classList.contains('view')) {
            // Handle view - You'll need to implement this
            console.log('View payment:', paymentId);
        } else if (button.classList.contains('delete')) {
            if (confirm('Are you sure you want to delete this payment?')) {
                try {
                    await ApiService.deletePayment(paymentId);
                    loadPayments(currentPage);
                } catch (error) {
                    console.error('Error deleting payment:', error);
                    // Show error message to user
                }
            }
        }
    });

    // Add payment button
    document.querySelector('.add-payment').addEventListener('click', () => {
        openPaymentModal();
    });

    // Close modal when clicking outside
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            closePaymentModal();
        }
    });
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

function formatBillingPeriod(month, year) {
    const date = new Date(year, month - 1);
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'long'
    }).format(date);
}

// Payment Modal Elements
const paymentModal = document.getElementById('paymentModal');
const paymentForm = document.getElementById('paymentForm');
const rfidInput = document.getElementById('rfidInput');
const customerInfo = document.getElementById('customerInfo');
const customerName = document.getElementById('customerName');
const customerPlan = document.getElementById('customerPlan');
const customerFee = document.getElementById('customerFee');
const customerDueDate = document.getElementById('customerDueDate');
const paymentAmount = document.getElementById('paymentAmount');
const paymentMethod = document.getElementById('paymentMethod');
const billingMonth = document.getElementById('billingMonth');
const paymentFields = document.getElementById('paymentFields');

function openPaymentModal() {
    paymentModal.classList.add('show');
    rfidInput.focus();
    resetForm();
}

function closePaymentModal() {
    paymentModal.classList.remove('show');
    resetForm();
}

function resetForm() {
    paymentForm.reset();
    customerInfo.classList.add('hidden');
    paymentFields.classList.add('hidden');
    rfidInput.value = '';
}

async function searchCustomerByRFID(rfid) {
    if (!rfid.trim()) {
        alert('Please scan an RFID card');
        return null;
    }

    try {
        console.log('Searching for RFID:', rfid);
        const customer = await ApiService.getCustomerByRFID(rfid);
        console.log('API Response:', customer);
        
        if (!customer) {
            throw new Error('No customer found with this RFID');
        }

        // Get next month's date
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthNum = nextMonth.getMonth() + 1;
        const nextMonthYear = nextMonth.getFullYear();

        // Check if payment exists for next month
        const payments = await ApiService.getCustomerPayments(customer.customer_id);
        const hasNextMonthPayment = payments.some(payment => 
            payment.billing_month === nextMonthNum && 
            payment.billing_year === nextMonthYear
        );

        if (hasNextMonthPayment) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            alert(`This customer has already paid for ${monthNames[nextMonthNum - 1]} ${nextMonthYear}`);
            customerInfo.classList.add('hidden');
            paymentFields.classList.add('hidden');
            rfidInput.value = '';
            rfidInput.focus();
            return null;
        }
        
        displayCustomerInfo(customer);
        return customer;
    } catch (error) {
        console.error('Error details:', error);
        alert(`Error finding customer: ${error.message}`);
        customerInfo.classList.add('hidden');
        paymentFields.classList.add('hidden');
        rfidInput.focus();
        return null;
    }
}

function displayCustomerInfo(customer) {
    customerName.textContent = customer.full_name;
    customerPlan.textContent = customer.plan_type;
    customerFee.textContent = `₱${parseFloat(customer.monthly_fee).toFixed(2)}`;
    customerDueDate.textContent = `${customer.due_date}th of every month`;
    
    // Show customer info and payment fields
    customerInfo.classList.remove('hidden');
    paymentFields.classList.remove('hidden');
    
    // Set default payment amount
    paymentAmount.value = parseFloat(customer.monthly_fee).toFixed(2);
    
    // Set billing month (next month)
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    billingMonth.value = `${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;
}

// Event Listeners
rfidInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        await searchCustomerByRFID(rfidInput.value);
    }
});

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!customerInfo.classList.contains('hidden')) {
        // TODO: Implement payment submission
        console.log('Payment submitted:', {
            rfid: rfidInput.value,
            amount: paymentAmount.value,
            paymentMethod: paymentMethod.value,
            billingMonth: billingMonth.value
        });
        
        closePaymentModal();
    }
});

// Close modal when clicking outside
paymentModal.addEventListener('click', (e) => {
    if (e.target === paymentModal) {
        closePaymentModal();
    }
});

// Close modal when clicking the close button
document.querySelector('.close-modal').addEventListener('click', closePaymentModal);
document.querySelector('.cancel-payment').addEventListener('click', closePaymentModal); 