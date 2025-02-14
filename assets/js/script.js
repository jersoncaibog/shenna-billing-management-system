import confirmationModal from './confirmationModal.js';

// ... existing code ...

// Replace confirm() for customer deletion
function deleteCustomer(customerId) {
    confirmationModal.show({
        title: 'Delete Customer',
        message: 'Are you sure you want to delete this customer? This action cannot be undone.',
        variant: 'delete',
        onConfirm: async () => {
            try {
                const response = await fetch(`/api/customers/${customerId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    loadCustomers(); // Refresh the table
                    showToast('Customer deleted successfully', 'success');
                } else {
                    throw new Error('Failed to delete customer');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to delete customer', 'error');
            }
        }
    });
}

// Replace confirm() for customer status toggle
function toggleCustomerStatus(customerId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    confirmationModal.show({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Customer`,
        message: `Are you sure you want to ${action} this customer?`,
        variant: 'warning',
        onConfirm: async () => {
            try {
                const response = await fetch(`/api/customers/${customerId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (response.ok) {
                    loadCustomers(); // Refresh the table
                    showToast(`Customer ${action}d successfully`, 'success');
                } else {
                    throw new Error(`Failed to ${action} customer`);
                }
            } catch (error) {
                console.error('Error:', error);
                showToast(`Failed to ${action} customer`, 'error');
            }
        }
    });
}

// Replace confirm() for payment deletion
function deletePayment(paymentId) {
    confirmationModal.show({
        title: 'Delete Payment',
        message: 'Are you sure you want to delete this payment record? This action cannot be undone.',
        variant: 'delete',
        onConfirm: async () => {
            try {
                const response = await fetch(`/api/payments/${paymentId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    loadPayments(); // Refresh the table
                    showToast('Payment deleted successfully', 'success');
                } else {
                    throw new Error('Failed to delete payment');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Failed to delete payment', 'error');
            }
        }
    });
}

// ... rest of existing code ... 