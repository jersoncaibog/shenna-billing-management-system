import ApiService from './api.js';

let currentPage = 1;
const PAGE_SIZE = 10;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadPendingBills();
    setupEventListeners();
});

async function loadPendingBills(page = currentPage) {
    try {
        const searchInput = document.getElementById('searchPending').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        const result = await ApiService.getPendingBills(page, PAGE_SIZE, searchInput, {
            status: statusFilter,
            sortBy
        });

        displayPendingBills(result.bills);
        updateSummaryCards(result.summary);
        updatePagination(result);
        currentPage = page;
    } catch (error) {
        console.error('Error loading pending bills:', error);
        // Show error message to user
    }
}

function displayPendingBills(bills) {
    const tbody = document.getElementById('pendingBills');
    tbody.innerHTML = bills.map(bill => `
        <tr>
            <td>
                <span class="${isOverdue(bill.due_date) ? 'overdue-date' : ''}">${formatDate(bill.due_date)}</span>
            </td>
            <td>${bill.full_name}</td>
            <td>${bill.rfid_number}</td>
            <td>${bill.plan_name} (${bill.plan_speed_mbps}Mbps)</td>
            <td>${formatCurrency(bill.bill_amount)}</td>
            <td>${formatCurrency(bill.amount_paid || 0)}</td>
            <td>${formatCurrency(bill.bill_amount - (bill.amount_paid || 0))}</td>
            <td>
                <span class="status-badge ${bill.status}">
                    ${bill.status}
                </span>
            </td>
            <td>
                <button class="btn-action pay" data-id="${bill.bill_id}">
                    Record Payment
                </button>
                <button class="btn-action view" data-id="${bill.bill_id}">
                    View Details
                </button>
            </td>
        </tr>
    `).join('');
}

function updateSummaryCards(summary) {
    document.getElementById('totalPendingAmount').textContent = formatCurrency(summary.totalPendingAmount);
    document.getElementById('overdueCount').textContent = summary.overdueCount;
    document.getElementById('dueThisWeek').textContent = summary.dueThisWeek;
}

function updatePagination(result) {
    const { page, totalPages } = result;
    document.getElementById('pageInfo').textContent = `Page ${page} of ${totalPages}`;
    
    document.getElementById('prevPage').disabled = page <= 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchPending');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadPendingBills();
        }, 300);
    });

    // Filters
    document.getElementById('statusFilter').addEventListener('change', () => {
        currentPage = 1;
        loadPendingBills();
    });

    document.getElementById('sortBy').addEventListener('change', () => {
        currentPage = 1;
        loadPendingBills();
    });

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            loadPendingBills(currentPage - 1);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        loadPendingBills(currentPage + 1);
    });

    // Export button
    document.querySelector('.btn-export').addEventListener('click', exportPendingList);

    // Bill actions
    document.getElementById('pendingBills').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const billId = button.dataset.id;

        if (button.classList.contains('pay')) {
            // Handle payment recording - You'll need to implement this
            console.log('Record payment for bill:', billId);
        } else if (button.classList.contains('view')) {
            // Handle view details - You'll need to implement this
            console.log('View bill details:', billId);
        }
    });
}

function isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(dateString));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

async function exportPendingList() {
    try {
        // Implement export functionality
        console.log('Exporting pending bills list');
    } catch (error) {
        console.error('Error exporting pending bills:', error);
        // Show error message to user
    }
} 