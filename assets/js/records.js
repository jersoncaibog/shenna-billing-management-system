import ApiService from './api.js';
import confirmationModal from './confirmationModal.js';

let currentPage = 1;
const PAGE_SIZE = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check for search parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        const searchInput = document.getElementById('searchPayments');
        searchInput.value = decodeURIComponent(searchParam);
    }
    
    loadPayments();
    setupEventListeners();
});

async function loadPayments(page = currentPage) {
    try {
        const searchInput = document.getElementById('searchPayments').value;
        const paymentMethod = document.getElementById('paymentMethodFilter').value;

        console.log('Filtering by payment method:', paymentMethod); // Debug log

        const result = await ApiService.getPayments(page, PAGE_SIZE, searchInput, {
            method: paymentMethod
        });

        if (!result.payments) {
            console.error('No payments data in response:', result);
            return;
        }

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
            <td>${payment.full_name}</td>
            <td>${formatCurrency(payment.amount)}</td>
            <td>${formatDate(payment.payment_date)}</td>
            <td>${payment.payment_method}</td>
            <td>${formatBillingPeriod(payment.billing_month, payment.billing_year)}</td>
            <td class="action-buttons">
                <button class="btn-icon delete" data-id="${payment.payment_id}" title="Delete payment">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Initialize Lucide icons for the new buttons
    lucide.createIcons();
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

    // Payment method filter
    document.getElementById('paymentMethodFilter').addEventListener('change', () => {
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

        if (button.classList.contains('delete')) {
            confirmationModal.show({
                title: 'Delete Payment',
                message: 'Are you sure you want to delete this payment record? This action cannot be undone.',
                variant: 'delete',
                onConfirm: async () => {
                    try {
                        await ApiService.deletePayment(paymentId);
                        loadPayments(currentPage);
                    } catch (error) {
                        console.error('Error deleting payment:', error);
                        // Show error message to user
                    }
                }
            });
        }
    });

    // Add payment button
    document.querySelector('.add-payment').addEventListener('click', () => {
        openPaymentModal();
    });

    // Close modal when clicking outside
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                closePaymentModal();
            }
        });

        // Close modal when clicking the close button
        const closeButton = paymentModal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', closePaymentModal);
        }

        // Close modal when clicking cancel button
        const cancelButton = paymentModal.querySelector('.cancel-payment');
        if (cancelButton) {
            cancelButton.addEventListener('click', closePaymentModal);
        }
    }
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

// Payment Modal Functions
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('show');
        const rfidInput = document.getElementById('rfidInput');
        if (rfidInput) {
            rfidInput.focus();
            resetPaymentForm();
        }
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('show');
        resetPaymentForm();
    }
}

function resetPaymentForm() {
    const form = document.getElementById('paymentForm');
    const customerInfo = document.getElementById('customerInfo');
    const paymentFields = document.getElementById('paymentFields');
    
    if (form) form.reset();
    if (customerInfo) customerInfo.classList.add('hidden');
    if (paymentFields) paymentFields.classList.add('hidden');
    
    const rfidInput = document.getElementById('rfidInput');
    if (rfidInput) rfidInput.value = '';
}

// Initialize RFID input handling
document.addEventListener('DOMContentLoaded', () => {
    const rfidInput = document.getElementById('rfidInput');
    if (rfidInput) {
        rfidInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const rfid = rfidInput.value.trim();
                if (rfid) {
                    try {
                        const customer = await ApiService.getCustomerByRFID(rfid);
                        if (customer) {
                            displayCustomerInfo(customer);
                        }
                    } catch (error) {
                        console.error('Error finding customer:', error);
                        alert('Customer not found with this RFID');
                    }
                }
            }
        });
    }

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(paymentForm);
                
                // Validate required fields
                const requiredFields = ['customer_id', 'amount', 'payment_method', 'billing_month', 'billing_year'];
                for (const field of requiredFields) {
                    if (!formData.get(field)) {
                        throw new Error(`${field.replace('_', ' ')} is required`);
                    }
                }

                const paymentData = {
                    customer_id: parseInt(formData.get('customer_id')),
                    amount: parseFloat(formData.get('amount')),
                    payment_method: formData.get('payment_method'),
                    billing_month: parseInt(formData.get('billing_month')),
                    billing_year: parseInt(formData.get('billing_year')),
                    remarks: formData.get('remarks') || ''
                };

                console.log('Submitting payment:', paymentData); // Debug log
                await ApiService.createPayment(paymentData);
                closePaymentModal();
                loadPayments();
            } catch (error) {
                console.error('Error creating payment:', error);
                alert(error.message || 'Failed to create payment. Please try again.');
            }
        });
    }
});

async function displayCustomerInfo(customer) {
    const customerInfo = document.getElementById('customerInfo');
    const paymentFields = document.getElementById('paymentFields');
    const customerName = document.getElementById('customerName');
    const customerPlan = document.getElementById('customerPlan');
    const customerFee = document.getElementById('customerFee');
    const customerDueDate = document.getElementById('customerDueDate');
    const paymentAmount = document.getElementById('paymentAmount');
    const billingMonth = document.getElementById('billingMonth');
    const paymentMethodInput = document.getElementById('paymentMethodInput');
    const submitButton = document.querySelector('#paymentForm button[type="submit"]');

    try {
        // Get current month and year
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Check if customer has already paid for current month
        const payments = await ApiService.getCustomerPayments(customer.customer_id);
        const hasCurrentMonthPayment = payments.some(payment => 
            payment.billing_month === currentMonth && 
            payment.billing_year === currentYear
        );

        if (hasCurrentMonthPayment) {
            // Show message that customer has already paid
            const monthName = new Intl.DateTimeFormat('en-PH', { month: 'long' }).format(today);
            customerInfo.classList.remove('hidden');
            paymentFields.classList.add('hidden');
            
            // Add payment status message
            const statusMessage = document.createElement('div');
            statusMessage.className = 'alert alert-info';
            statusMessage.style.backgroundColor = '#e0f2fe';
            statusMessage.style.color = '#075985';
            statusMessage.style.padding = '1rem';
            statusMessage.style.borderRadius = '0.375rem';
            statusMessage.style.marginTop = '1rem';
            statusMessage.textContent = `This account has already been paid for ${monthName} ${currentYear}`;
            
            // Insert message after customer info
            const existingMessage = customerInfo.querySelector('.alert');
            if (existingMessage) {
                existingMessage.remove();
            }
            customerInfo.appendChild(statusMessage);
            
            // Update customer display info
            if (customerName) customerName.textContent = customer.full_name;
            if (customerPlan) customerPlan.textContent = customer.plan_type;
            if (customerFee) customerFee.textContent = formatCurrency(customer.monthly_fee);
            if (customerDueDate) customerDueDate.textContent = `${customer.due_date}th of every month`;
            
            return; // Exit early since we don't need to set up payment fields
        }

        // If not paid, proceed with setting up payment form
        // Store customer ID in a hidden input
        const customerIdInput = document.createElement('input');
        customerIdInput.type = 'hidden';
        customerIdInput.name = 'customer_id';
        customerIdInput.value = customer.customer_id;
        document.getElementById('paymentForm').appendChild(customerIdInput);

        if (customerName) customerName.textContent = customer.full_name;
        if (customerPlan) customerPlan.textContent = customer.plan_type;
        if (customerFee) customerFee.textContent = formatCurrency(customer.monthly_fee);
        if (customerDueDate) customerDueDate.textContent = `${customer.due_date}th of every month`;
        if (paymentAmount) {
            paymentAmount.value = customer.monthly_fee;
            paymentAmount.name = 'amount';
        }

        // Set up payment method
        if (paymentMethodInput) {
            paymentMethodInput.name = 'payment_method';
            paymentMethodInput.value = '';
        }

        // Set billing month to current month
        if (billingMonth) {
            const currentMonthDate = new Date();
            billingMonth.value = new Intl.DateTimeFormat('en-PH', {
                year: 'numeric',
                month: 'long'
            }).format(currentMonthDate);

            // Store billing month and year in hidden inputs
            const billingMonthInput = document.createElement('input');
            billingMonthInput.type = 'hidden';
            billingMonthInput.name = 'billing_month';
            billingMonthInput.value = currentMonth;
            
            const billingYearInput = document.createElement('input');
            billingYearInput.type = 'hidden';
            billingYearInput.name = 'billing_year';
            billingYearInput.value = currentYear;
            
            document.getElementById('paymentForm').appendChild(billingMonthInput);
            document.getElementById('paymentForm').appendChild(billingYearInput);
        }

        if (customerInfo) customerInfo.classList.remove('hidden');
        if (paymentFields) paymentFields.classList.remove('hidden');
        if (submitButton) submitButton.disabled = false;

    } catch (error) {
        console.error('Error checking payment status:', error);
        alert('Error checking payment status. Please try again.');
    }
}
