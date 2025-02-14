// Import components
import ApiService from './api.js';
import './components/Navbar.js';

// Initialize dashboard if on index page
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    initializeDashboard();
    setupQuickSearch();
}

async function initializeDashboard() {
    try {
        const stats = await ApiService.getDashboardStats();
        
        // Update summary cards
        document.getElementById('activeCustomers').textContent = stats.activeCustomers;
        document.getElementById('todayCollections').textContent = formatCurrency(stats.monthlyRevenue);
        document.getElementById('overdueAccounts').textContent = stats.overdueAccounts;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Show error message to user
    }
}

function setupQuickSearch() {
    const searchInput = document.getElementById('quickSearch');
    const searchResults = document.getElementById('searchResults');
    let searchTimeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const searchTerm = searchInput.value;
                if (searchTerm.length < 3) {
                    searchResults.classList.add('hidden');
                    return;
                }

                const result = await ApiService.getCustomers(1, 5, searchTerm);
                displaySearchResults(result.customers);
            } catch (error) {
                console.error('Error performing quick search:', error);
                searchResults.innerHTML = `
                    <div class="search-result-item">
                        <p class="text-error">Error performing search. Please try again.</p>
                    </div>
                `;
                searchResults.classList.remove('hidden');
            }
        }, 300);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}

function displaySearchResults(customers) {
    const searchResults = document.getElementById('searchResults');
    
    if (customers.length === 0) {
        searchResults.innerHTML = `
            <div class="search-result-item">
                <p>No customers found.</p>
            </div>
        `;
        searchResults.classList.remove('hidden');
        return;
    }

    searchResults.innerHTML = customers.map(customer => `
        <div class="search-result-item">
            <div class="search-result-header">
                <span class="search-result-name">${customer.full_name}</span>
                <span class="search-result-rfid">${customer.rfid_number}</span>
            </div>
            
            <div class="search-result-details">
                <div class="search-result-detail">
                    <span class="search-result-label">Contact Number</span>
                    <span class="search-result-value">${customer.contact_number}</span>
                </div>
                <div class="search-result-detail">
                    <span class="search-result-label">Plan Type</span>
                    <span class="search-result-value">${customer.plan_type}</span>
                </div>
                <div class="search-result-detail">
                    <span class="search-result-label">Monthly Fee</span>
                    <span class="search-result-value">${formatCurrency(customer.monthly_fee)}</span>
                </div>
                <div class="search-result-detail">
                    <span class="search-result-label">Due Date</span>
                    <span class="search-result-value">${customer.due_date}th of every month</span>
                </div>
                <div class="search-result-detail">
                    <span class="search-result-label">Status</span>
                    <span class="search-result-value">
                        <span class="status-badge ${customer.is_active ? 'active' : 'inactive'}">
                            ${customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </span>
                </div>
            </div>
            
            <div class="search-result-actions">
                <button class="btn-action" onclick="window.location.href='records.html?customer=${customer.customer_id}&search=${encodeURIComponent(customer.full_name)}'">
                    View Payments
                </button>
                <button class="btn-action" onclick="window.location.href='accounts.html?edit=${customer.customer_id}&search=${encodeURIComponent(customer.full_name)}'">
                    Edit Details
                </button>
            </div>
        </div>
    `).join('');
    
    searchResults.classList.remove('hidden');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

