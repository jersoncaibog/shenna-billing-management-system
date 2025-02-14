class ConfirmationModal {
    constructor() {
        console.log('ConfirmationModal constructor called');
        this.modal = null;
        this.title = null;
        this.message = null;
        this.confirmBtn = null;
        this.cancelBtn = null;
        this.closeBtn = null;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            console.log('DOM still loading, waiting for DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            console.log('DOM already loaded, initializing immediately');
            this.init();
        }
    }

    init() {
        console.log('ConfirmationModal init started');
        this.ensureModalExists();
        this.initializeElements();
        this.setupEventListeners();
    }

    ensureModalExists() {
        console.log('Checking if modal exists in DOM');
        if (!document.getElementById('confirmationModal')) {
            console.log('Modal does not exist, creating it');
            const modalHTML = `
                <div id="confirmationModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="confirmationTitle">Confirm Action</h3>
                            <button class="close-modal" data-action="cancel">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p id="confirmationMessage"></p>
                            <div class="form-actions">
                                <button class="btn-secondary" data-action="cancel">Cancel</button>
                                <button class="btn-primary" data-action="confirm">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('Modal created and added to DOM');
        } else {
            console.log('Modal already exists in DOM');
        }
    }

    initializeElements() {
        console.log('Initializing modal elements');
        this.modal = document.getElementById('confirmationModal');
        if (!this.modal) {
            console.error('Failed to find modal element');
            return;
        }

        this.title = document.getElementById('confirmationTitle');
        this.message = document.getElementById('confirmationMessage');
        this.confirmBtn = this.modal.querySelector('.form-actions button[data-action="confirm"]');
        this.cancelBtn = this.modal.querySelector('.form-actions button[data-action="cancel"]');
        this.closeBtn = this.modal.querySelector('.modal-header .close-modal');
        
        console.log('Elements initialized:', {
            modal: !!this.modal,
            title: !!this.title,
            message: !!this.message,
            confirmBtn: !!this.confirmBtn,
            cancelBtn: !!this.cancelBtn,
            closeBtn: !!this.closeBtn
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        if (!this.modal) {
            console.error('Cannot setup event listeners, modal is missing');
            return;
        }

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Handle all buttons with data-action="cancel"
        const cancelButtons = this.modal.querySelectorAll('[data-action="cancel"]');
        cancelButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Cancel button clicked');
                this.hide();
            });
        });
        
        console.log('Event listeners setup complete');
    }

    show({ title, message, variant = 'info', onConfirm }) {
        console.log('Show modal called with:', { title, message, variant });
        
        // Re-initialize elements to ensure we have the latest references
        this.initializeElements();
        this.setupEventListeners(); // Re-setup event listeners
        
        if (!this.modal || !this.title || !this.message || !this.confirmBtn || !this.cancelBtn) {
            console.error('Cannot show modal, missing elements:', {
                modal: !!this.modal,
                title: !!this.title,
                message: !!this.message,
                confirmBtn: !!this.confirmBtn,
                cancelBtn: !!this.cancelBtn
            });
            return;
        }

        this.title.textContent = title;
        this.message.textContent = message;
        
        // Set variant for styling
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.dataset.variant = variant;
        }
        
        // Update confirm button text and handler
        const btnText = variant === 'delete' ? 'Delete' : 'Confirm';
        this.confirmBtn.textContent = btnText;
        
        // Clone and replace confirm button to remove old event listeners
        const newConfirmBtn = this.confirmBtn.cloneNode(true);
        this.confirmBtn.parentNode.replaceChild(newConfirmBtn, this.confirmBtn);
        this.confirmBtn = newConfirmBtn;
        
        // Set up confirm button event listener
        this.confirmBtn.addEventListener('click', () => {
            console.log('Confirm button clicked, executing onConfirm callback');
            onConfirm();
            this.hide();
        });

        // Show the modal
        this.modal.classList.add('show');
        console.log('Modal shown successfully');
    }

    hide() {
        console.log('Hiding modal');
        if (this.modal) {
            this.modal.classList.remove('show');
        } else {
            console.error('Cannot hide modal, modal element is null');
        }
    }
}

console.log('Creating confirmation modal instance');
const confirmationModal = new ConfirmationModal();
console.log('Confirmation modal instance created');
export default confirmationModal; 