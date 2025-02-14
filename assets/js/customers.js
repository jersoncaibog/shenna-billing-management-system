import ApiService from './api.js';
import confirmationModal from './confirmationModal.js';
console.log('Confirmation modal imported:', confirmationModal);

let currentPage = 1;
const PAGE_SIZE = 10;

// Plan type to monthly fee mapping
const PLAN_FEES = {
    'Basic': 1200.00,
    'Normal': 1500.00,
    'Premium': 1800.00
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing customers page');
    
    // Check for search parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
        const searchInput = document.getElementById('searchCustomer');
        searchInput.value = decodeURIComponent(searchParam);
    }
    
    loadCustomers();
    setupEventListeners();
    updateCurrentDate();
    // Update date every minute
    setInterval(updateCurrentDate, 60000);
});

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

async function loadCustomers(page = currentPage) {
    try {
        const searchInput = document.getElementById('searchCustomer').value;
        const sortBy = document.getElementById('sortCustomers').value;
        const result = await ApiService.getCustomers(page, PAGE_SIZE, searchInput, { sortBy });
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

    // Get all customer rows with payment status
    const customerRows = await Promise.all(customers.map(async customer => {
        try {
            // Use the payment_status from the backend
            const paymentStatus = customer.payment_status;
            console.log('Customer status:', {
                customerId: customer.customer_id,
                isActive: customer.is_active,
                isActiveType: typeof customer.is_active
            });

            return `
                <tr>
                    <td>${customer.rfid_number}</td>
                    <td>${customer.full_name}</td>
                    <td>${customer.contact_number}</td>
                    <td>${customer.address}</td>
                    <td>${customer.plan_type}</td>
                    <td>${customer.due_date}th</td>
                    <td>
                        <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
                            ${customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <span class="payment-status ${paymentStatus}">
                            ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn-icon edit" data-id="${customer.customer_id}" title="Edit customer">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon toggle-status" 
                            data-id="${customer.customer_id}" 
                            data-active="${Boolean(customer.is_active)}" 
                            title="${customer.is_active ? 'Deactivate' : 'Activate'} customer">
                            <i data-lucide="${customer.is_active ? 'toggle-right' : 'toggle-left'}"></i>
                        </button>
                        <button class="btn-icon delete" data-id="${customer.customer_id}" title="Delete customer">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error('Error displaying customer:', error);
            return `
                <tr>
                    <td>${customer.rfid_number}</td>
                    <td>${customer.full_name}</td>
                    <td>${customer.contact_number}</td>
                    <td>${customer.address}</td>
                    <td>${customer.plan_type}</td>
                    <td>${customer.due_date}th</td>
                    <td>
                        <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
                            ${customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <span class="payment-status error">
                            Error
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="btn-icon edit" data-id="${customer.customer_id}" title="Edit customer">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon toggle-status" data-id="${customer.customer_id}" data-active="${customer.is_active}" title="${customer.is_active ? 'Deactivate' : 'Activate'} customer">
                            <i data-lucide="${customer.is_active ? 'toggle-right' : 'toggle-left'}"></i>
                        </button>
                        <button class="btn-icon delete" data-id="${customer.customer_id}" title="Delete customer">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }
    }));

    // Update the table with rows
    tbody.innerHTML = customerRows.join('');
    // Initialize Lucide icons for the new buttons
    lucide.createIcons();
}

function updatePagination(result) {
    const { page, totalPages } = result;
    document.getElementById('pageInfo').textContent = `Page ${page} of ${totalPages}`;
    
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

function openEditModal(customer) {
    const modal = document.getElementById('editCustomerModal');
    if (!modal) return;

    // Populate form fields
    document.getElementById('editCustomerId').value = customer.customer_id;
    document.getElementById('editRfidNumber').value = customer.rfid_number;
    document.getElementById('editFullName').value = customer.full_name;
    document.getElementById('editContactNumber').value = customer.contact_number;
    document.getElementById('editAddress').value = customer.address;
    document.getElementById('editPlanType').value = customer.plan_type;
    document.getElementById('editMonthlyFee').value = PLAN_FEES[customer.plan_type];
    document.getElementById('editDueDate').value = customer.due_date;

    // Make monthly fee readonly
    document.getElementById('editMonthlyFee').readOnly = true;

    modal.classList.add('show');
}

function closeEditModal() {
    const modal = document.getElementById('editCustomerModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('editCustomerForm').reset();
    }
}

function openAddModal() {
    const modal = document.getElementById('addCustomerModal');
    if (!modal) return;

    // Reset form
    document.getElementById('addCustomerForm').reset();
    
    // Set default monthly fee based on initial plan type
    const planType = document.getElementById('addPlanType').value;
    document.getElementById('addMonthlyFee').value = PLAN_FEES[planType];

    modal.classList.add('show');
}

function closeAddModal() {
    const modal = document.getElementById('addCustomerModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('addCustomerForm').reset();
    }
}

function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Remove any existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    input.classList.add('error');
}

function clearInputError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.classList.remove('error');
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

    // Sort select
    document.getElementById('sortCustomers').addEventListener('change', () => {
        loadCustomers(currentPage);
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

    // Edit modal event listeners
    const editModal = document.getElementById('editCustomerModal');
    if (editModal) {
        // Close modal when clicking outside
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });

        // Close modal when clicking the close button
        const closeButton = editModal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', closeEditModal);
        }

        // Close modal when clicking cancel button
        const cancelButton = editModal.querySelector('.cancel-edit');
        if (cancelButton) {
            cancelButton.addEventListener('click', closeEditModal);
        }

        // Handle plan type change for edit form
        const editPlanType = document.getElementById('editPlanType');
        if (editPlanType) {
            editPlanType.addEventListener('change', (e) => {
                const monthlyFee = PLAN_FEES[e.target.value];
                document.getElementById('editMonthlyFee').value = monthlyFee;
            });
        }

        // Handle form submission
        const editForm = document.getElementById('editCustomerForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(editForm);
                    const customerId = formData.get('customer_id');
                    const rfidNumber = formData.get('rfid_number');

                    // Clear any existing errors
                    clearInputError('editRfidNumber');

                    // Check if RFID exists and belongs to a different customer
                    const existingCustomer = await ApiService.getCustomerByRFID(rfidNumber);
                    if (existingCustomer && existingCustomer.customer_id !== parseInt(customerId)) {
                        showInputError('editRfidNumber', 'This RFID number is already assigned to another customer');
                        return;
                    }
                    
                    const customerData = {
                        rfid_number: rfidNumber,
                        full_name: formData.get('full_name'),
                        contact_number: formData.get('contact_number'),
                        address: formData.get('address'),
                        plan_type: formData.get('plan_type'),
                        monthly_fee: PLAN_FEES[formData.get('plan_type')],
                        due_date: parseInt(formData.get('due_date'))
                    };

                    console.log('Updating customer:', { customerId, customerData });
                    await ApiService.updateCustomer(customerId, customerData);
                    
                    closeEditModal();
                    await loadCustomers(currentPage);
                } catch (error) {
                    console.error('Error updating customer:', error);
                    showInputError('editRfidNumber', error.message || 'Failed to update customer. Please try again.');
                }
            });
        }
    }

    // Customer actions
    document.getElementById('customersList').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const customerId = button.dataset.id;
        console.log('Button clicked:', button.className, 'customerId:', customerId);

        if (button.classList.contains('edit')) {
            try {
                const customer = await ApiService.getCustomerById(customerId);
                openEditModal(customer);
            } catch (error) {
                console.error('Error fetching customer details:', error);
                alert('Failed to fetch customer details. Please try again.');
            }
        } else if (button.classList.contains('toggle-status')) {
            const isCurrentlyActive = button.dataset.active === 'true';
            console.log('Toggle status data:', {
                dataActive: button.dataset.active,
                isCurrentlyActive: isCurrentlyActive
            });
            
            const action = isCurrentlyActive ? 'deactivate' : 'activate';
            console.log('Toggle status clicked:', action, 'customerId:', customerId, 'isCurrentlyActive:', isCurrentlyActive);
            
            confirmationModal.show({
                title: `${action.charAt(0).toUpperCase() + action.slice(1)} Customer`,
                message: `Are you sure you want to ${action} this customer?`,
                variant: 'warning',
                onConfirm: async () => {
                    try {
                        console.log('Confirmation modal confirmed, updating customer status...');
                        // Update only the is_active status - ensure it's a boolean value
                        const updateData = { is_active: !isCurrentlyActive };
                        console.log('Sending update with data:', updateData);
                        
                        const updatedCustomer = await ApiService.updateCustomer(customerId, updateData);
                        console.log('Customer updated successfully:', updatedCustomer);
                        
                        // Refresh the customer list to show the updated status
                        await loadCustomers(currentPage);
                        console.log('Customer list refreshed');
                    } catch (error) {
                        console.error('Error updating customer status:', error);
                        alert('Failed to update customer status. Please try again.');
                    }
                }
            });
        } else if (button.classList.contains('delete')) {
            console.log('Delete button clicked, customerId:', customerId);
            console.log('Confirmation modal before show:', confirmationModal);
            
            confirmationModal.show({
                title: 'Delete Customer',
                message: 'Are you sure you want to delete this customer? This action cannot be undone.',
                variant: 'delete',
                onConfirm: async () => {
                    try {
                        console.log('Delete confirmation clicked for customer:', customerId);
                        await ApiService.deleteCustomer(customerId);
                        loadCustomers(currentPage);
                    } catch (error) {
                        console.error('Error deleting customer:', error);
                        alert('Failed to delete customer. Please try again.');
                    }
                }
            });
        }
    });

    // Add Customer button
    document.querySelector('.add-customer').addEventListener('click', openAddModal);

    // Add Customer Modal
    const addModal = document.getElementById('addCustomerModal');
    if (addModal) {
        // Close modal when clicking outside
        addModal.addEventListener('click', (e) => {
            if (e.target === addModal) {
                closeAddModal();
            }
        });

        // Close modal when clicking the close button
        const closeButton = addModal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', closeAddModal);
        }

        // Close modal when clicking cancel button
        const cancelButton = addModal.querySelector('.cancel-add');
        if (cancelButton) {
            cancelButton.addEventListener('click', closeAddModal);
        }

        // Handle plan type change for add form
        const addPlanType = document.getElementById('addPlanType');
        if (addPlanType) {
            addPlanType.addEventListener('change', (e) => {
                const monthlyFee = PLAN_FEES[e.target.value];
                document.getElementById('addMonthlyFee').value = monthlyFee;
            });
        }

        // Handle form submission
        const addForm = document.getElementById('addCustomerForm');
        if (addForm) {
            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(addForm);
                    const rfidNumber = formData.get('rfid_number');

                    // Clear any existing errors
                    clearInputError('addRfidNumber');

                    // Check if RFID already exists
                    const existingCustomer = await ApiService.getCustomerByRFID(rfidNumber);
                    if (existingCustomer) {
                        showInputError('addRfidNumber', 'This RFID number is already in use');
                        return;
                    }
                    
                    const customerData = {
                        rfid_number: rfidNumber,
                        full_name: formData.get('full_name'),
                        contact_number: formData.get('contact_number'),
                        address: formData.get('address'),
                        plan_type: formData.get('plan_type'),
                        monthly_fee: PLAN_FEES[formData.get('plan_type')],
                        due_date: parseInt(formData.get('due_date'))
                    };

                    console.log('Creating customer:', customerData);
                    await ApiService.createCustomer(customerData);
                    
                    closeAddModal();
                    await loadCustomers(currentPage);
                } catch (error) {
                    console.error('Error creating customer:', error);
                    showInputError('addRfidNumber', error.message || 'Failed to create customer. Please try again.');
                }
            });
        }
    }
} 