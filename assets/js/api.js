const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    // Customer APIs
    static async getCustomers(page = 1, limit = 10, search = '', filters = {}) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(filters.plan && { plan: filters.plan }),
            ...(filters.status && { status: filters.status }),
            ...(filters.sortBy && { sortBy: filters.sortBy })
        });

        const response = await fetch(`${API_BASE_URL}/customers?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        return response.json();
    }

    static async getCustomerById(customerId) {
        try {
            const response = await fetch(`${API_BASE_URL}/customers/${customerId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch customer');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    }

    static async getCustomerByRFID(rfid) {
        const response = await fetch(`${API_BASE_URL}/customers/rfid/${rfid}`);
        if (response.status === 404) {
            // RFID not found - this is good for new customers
            return null;
        }
        if (!response.ok) {
            // Handle other errors
            throw new Error('Failed to check RFID availability');
        }
        return response.json();
    }

    static async createCustomer(customerData) {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        if (!response.ok) throw new Error('Failed to create customer');
        return response.json();
    }

    static async updateCustomer(id, customerData) {
        console.log('ApiService.updateCustomer called with:', { id, customerData });
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        
        console.log('Update response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Update failed:', errorData);
            throw new Error(errorData.error || 'Failed to update customer');
        }
        
        const updatedCustomer = await response.json();
        console.log('Customer updated successfully:', updatedCustomer);
        return updatedCustomer;
    }

    static async deleteCustomer(id) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete customer');
    }

    // Payment APIs
    static async getPayments(page = 1, limit = 10, search = '', filters = {}) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(filters.method && { method: filters.method })
        });

        const response = await fetch(`${API_BASE_URL}/payments?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        return response.json();
    }

    static async getPaymentById(id) {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch payment');
        return response.json();
    }

    static async getCustomerPayments(customerId) {
        const response = await fetch(`${API_BASE_URL}/payments/customer/${customerId}`);
        if (!response.ok) throw new Error('Failed to fetch customer payments');
        return response.json();
    }

    static async createPayment(paymentData) {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        if (!response.ok) throw new Error('Failed to create payment');
        return response.json();
    }

    static async deletePayment(id) {
        const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete payment');
    }

    // Dashboard Stats
    static async getDashboardStats() {
        const response = await fetch(`${API_BASE_URL}/payments/dashboard/stats`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    }
}

export default ApiService;
