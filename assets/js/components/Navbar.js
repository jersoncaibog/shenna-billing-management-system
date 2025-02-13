class Navbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['active-page'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'active-page') {
            this.render();
        }
    }

    render() {
        const activePage = this.getAttribute('active-page') || 'dashboard';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .sidebar {
                    width: 260px;
                    height: 100vh;
                    background: var(--sidebar-bg, #ffffff);
                    color: var(--sidebar-color, #09090b);
                    position: fixed;
                    left: 0;
                    top: 0;
                    border-right: 1px solid var(--border-color, #e5e7eb);
                    box-shadow: 2px 0 8px var(--shadow-color, rgb(0 0 0 / 0.05));
                }

                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color, #e5e7eb);
                }

                .logo {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--logo-color, #09090b);
                    letter-spacing: -0.025em;
                }

                .sidebar-nav {
                    padding: 1rem 0.75rem;
                }

                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                li {
                    margin: 0;
                    border-radius: 0.375rem;
                    overflow: hidden;
                }

                a {
                    display: flex;
                    align-items: center;
                    padding: 0.625rem 0.75rem;
                    color: var(--nav-link-color, #71717a);
                    text-decoration: none;
                    transition: all 0.15s ease;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                a:hover {
                    background: var(--nav-hover-bg, #f4f4f5);
                    color: var(--nav-hover-color, #18181b);
                }

                .active a {
                    background: var(--nav-active-bg, #f4f4f5);
                    color: var(--nav-active-color, #18181b);
                    font-weight: 600;
                }

                i {
                    margin-right: 0.75rem;
                    width: 18px;
                    height: 18px;
                    color: currentColor;
                    opacity: 0.8;
                }

                .active i {
                    opacity: 1;
                }
            </style>

            <aside class="sidebar">
                <div class="sidebar-header">
                    <h1 class="logo">Bill Tracker</h1>
                </div>
                
                <nav class="sidebar-nav">
                    <ul>
                        <li class="${activePage === 'dashboard' ? 'active' : ''}">
                            <a href="index.html">
                                <i data-lucide="layout-dashboard"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="${activePage === 'customers' ? 'active' : ''}">
                            <a href="accounts.html">
                                <i data-lucide="users"></i>
                                <span>Customers</span>
                            </a>
                        </li>
                        <li class="${activePage === 'payments' ? 'active' : ''}">
                            <a href="records.html">
                                <i data-lucide="receipt"></i>
                                <span>Payments</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
        `;

        // Initialize Lucide icons in shadow DOM
        lucide.createIcons(this.shadowRoot);
    }
}

customElements.define('app-navbar', Navbar); 