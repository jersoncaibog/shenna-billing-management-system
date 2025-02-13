import ApiService from './api.js';

let currentPage = 1;
const PAGE_SIZE = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    setupEventListeners();
});

async function loadRecords(page = currentPage) {
    try {
        const searchInput = document.getElementById('searchRecords').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const status = document.getElementById('paymentStatus').value;

        const result = await ApiService.getRecords(page, PAGE_SIZE, searchInput, {
            startDate,
            endDate,
            status
        });

        displayRecords(result.records);
        updatePagination(result);
        currentPage = page;
    } catch (error) {
        console.error('Error loading records:', error);
        // Show error message to user
    }
}

function displayRecords(records) {
    const tbody = document.getElementById('paymentRecords');
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.payment_date ? formatDate(record.payment_date) : formatDate(record.bill_date)}</td>
            <td>${record.rfid_number}</td>
            <td>${record.full_name}</td>
            <td>${record.payment_date ? formatCurrency(record.amount) : '₱0.00'}</td>
            <td>${record.payment_method || 'N/A'}</td>
            <td>
                <span class="status-badge ${record.bill_status}">
                    ${record.bill_status}
                </span>
            </td>
            <td>
                <button class="btn-action view" data-id="${record.bill_id}">
                    View
                </button>
                ${record.payment_id ? `
                    <button class="btn-action delete" data-id="${record.payment_id}">
                        Delete
                    </button>
                ` : ''}
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
    const searchInput = document.getElementById('searchRecords');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadRecords();
        }, 300);
    });

    // Date filters
    document.getElementById('startDate').addEventListener('change', () => {
        currentPage = 1;
        loadRecords();
    });

    document.getElementById('endDate').addEventListener('change', () => {
        currentPage = 1;
        loadRecords();
    });

    // Status filter
    document.getElementById('paymentStatus').addEventListener('change', () => {
        currentPage = 1;
        loadRecords();
    });

    // Apply filters button
    document.getElementById('applyFilter').addEventListener('click', () => {
        currentPage = 1;
        loadRecords();
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            loadRecords(currentPage - 1);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        loadRecords(currentPage + 1);
    });

    // Record actions
    document.getElementById('paymentRecords').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const recordId = button.dataset.id;

        if (button.classList.contains('view')) {
            // Handle view - You'll need to implement this
            console.log('View record:', recordId);
        } else if (button.classList.contains('delete')) {
            if (confirm('Are you sure you want to delete this record?')) {
                try {
                    await ApiService.deleteRecord(recordId);
                    loadRecords(currentPage);
                } catch (error) {
                    console.error('Error deleting record:', error);
                    // Show error message to user
                }
            }
        }
    });

    // Add payment button
    document.querySelector('.add-payment').addEventListener('click', () => {
        // Handle add payment - You'll need to implement this
        console.log('Add new payment');
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
