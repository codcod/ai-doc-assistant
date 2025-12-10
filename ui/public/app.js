// AI Document Assistant - Client-side JavaScript

// Global state
let currentTab = 'chat';
let isLoading = false;
let currentTheme = 'auto'; // Default to auto theme

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 AI Document Assistant initialized');
    
    // Initialize theme system
    initializeTheme();
    
    // Set up HTMX configuration
    htmx.config.globalViewTransitions = true;
    htmx.config.defaultSwapStyle = 'innerHTML';
    
    // Auto-scroll chat messages
    setupChatScrolling();
    
    // Set up file upload drag and drop
    setupFileUpload();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Check backend connectivity
    checkBackendStatus();
});

// Tab Management
function showTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    document.getElementById(tabName + '-content').style.display = 'block';
    
    currentTab = tabName;
    
    // Trigger specific tab actions
    switch(tabName) {
        case 'admin':
            // Refresh documents list when admin tab is opened
            htmx.trigger('#documents-list', 'refresh');
            break;
        case 'chat':
            // Focus on chat input
            setTimeout(() => {
                const chatInput = document.querySelector('#chat-content input[name="question"]');
                if (chatInput) chatInput.focus();
            }, 100);
            break;
    }
    
    updateStatus(`Switched to ${tabName} tab`);
}

// Chat functionality
function setupChatScrolling() {
    // Auto-scroll to bottom when new messages arrive
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        const observer = new MutationObserver(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });
        observer.observe(chatContainer, { childList: true });
    }
}

// File Upload Management
function setupFileUpload() {
    // Add drag and drop functionality to file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const container = input.closest('.card-body');
        if (!container) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.remove('dragover');
            }, false);
        });
        
        // Handle dropped files
        container.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                input.files = files;
                // Trigger visual feedback
                input.dispatchEvent(new Event('change'));
            }
        }, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Loading states
function showLoading(type) {
    isLoading = true;
    const button = document.querySelector(`#${type}-content button[type="submit"]`);
    if (button) {
        button.disabled = true;
        button.innerHTML = `
            <div class="spinner-border spinner-border-sm me-1" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            Uploading...
        `;
    }
    updateStatus('Uploading file...', true);
}

function hideLoading(type) {
    isLoading = false;
    const button = document.querySelector(`#${type}-content button[type="submit"]`);
    if (button) {
        button.disabled = false;
        // Restore original button text based on type
        const originalTexts = {
            'pdf': '<i class="bi bi-upload me-1"></i>Upload PDF',
            'text': '<i class="bi bi-upload me-1"></i>Upload Text'
        };
        button.innerHTML = originalTexts[type] || 'Upload';
    }
    updateStatus('Upload completed');
}

// Status management
function updateStatus(message, loading = false) {
    const statusText = document.getElementById('status-text');
    const statusSpinner = document.getElementById('status-spinner');
    const progressBar = document.getElementById('progress-bar');
    
    if (statusText) {
        statusText.textContent = message;
    }
    
    if (statusSpinner) {
        statusSpinner.style.display = loading ? 'block' : 'none';
    }
    
    if (progressBar && !loading) {
        // Animate progress bar
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 1000);
    }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + 1, 2, 3 for tab switching
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            const tabs = ['chat', 'upload', 'admin'];
            const tabIndex = parseInt(e.key) - 1;
            if (tabs[tabIndex]) {
                showTab(tabs[tabIndex]);
            }
        }
        
        // T key for theme cycling (only when not typing in inputs)
        if (e.key === 't' || e.key === 'T') {
            if (!e.target.matches('input, textarea')) {
                e.preventDefault();
                cycleTheme();
            }
        }
        
        // Enter to submit chat when focused on chat input
        if (e.key === 'Enter' && e.target.name === 'question') {
            e.preventDefault();
            e.target.closest('form').dispatchEvent(new Event('submit'));
        }
    });
}

// Backend connectivity check
async function checkBackendStatus() {
    try {
        const response = await fetch('/api/documents');
        if (response.ok) {
            updateStatus('Connected to backend');
            document.querySelector('.navbar-text').innerHTML = `
                <i class="bi bi-circle-fill text-success me-1"></i>
                Backend Online
            `;
        } else {
            throw new Error('Backend response not OK');
        }
    } catch (error) {
        console.warn('Backend connectivity check failed:', error);
        updateStatus('Backend connection issues');
        document.querySelector('.navbar-text').innerHTML = `
            <i class="bi bi-circle-fill text-warning me-1"></i>
            Backend Issues
        `;
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    // Create a toast notification
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Clean up after toast is hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// HTMX event listeners
document.addEventListener('htmx:beforeRequest', (e) => {
    const form = e.target.closest('form');
    if (form) {
        form.classList.add('loading');
    }
});

document.addEventListener('htmx:afterRequest', (e) => {
    const form = e.target.closest('form');
    if (form) {
        form.classList.remove('loading');
    }
    
    // Auto-refresh documents list after uploads
    if (e.detail.pathInfo.requestPath.includes('/upload')) {
        const documentsList = document.getElementById('documents-list');
        if (documentsList && currentTab === 'admin') {
            htmx.trigger(documentsList, 'refresh');
        }
    }
});

document.addEventListener('htmx:responseError', (e) => {
    console.error('HTMX request failed:', e.detail);
    showNotification('Request failed. Please check your connection.', 'danger');
});

document.addEventListener('htmx:sendError', (e) => {
    console.error('HTMX send error:', e.detail);
    showNotification('Network error. Please try again.', 'danger');
});

// Export functions for global access
window.showTab = showTab;
window.updateStatus = updateStatus;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.setTheme = setTheme;

// Theme Management System
function initializeTheme() {
    // Load saved theme preference or default to auto
    const savedTheme = localStorage.getItem('theme') || 'auto';
    setTheme(savedTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (currentTheme === 'auto') {
                updateThemeDisplay();
            }
        });
    }
}

function setTheme(theme) {
    currentTheme = theme;
    
    // Save preference
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update UI
    updateThemeDisplay();
    
    console.log(`🎨 Theme changed to: ${theme}`);
}

function cycleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    
    // Show toast notification
    showNotification(`Theme switched to ${themes[nextIndex]}`, 'info');
}

function updateThemeDisplay() {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (!themeIcon || !themeText) return;
    
    // Determine effective theme (for auto mode)
    let effectiveTheme = currentTheme;
    if (currentTheme === 'auto') {
        effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Update icon and text based on current theme setting (not effective theme)
    switch (currentTheme) {
        case 'light':
            themeIcon.className = 'bi bi-sun-fill';
            themeText.textContent = 'Light';
            break;
        case 'dark':
            themeIcon.className = 'bi bi-moon-fill';
            themeText.textContent = 'Dark';
            break;
        case 'auto':
            themeIcon.className = 'bi bi-circle-half';
            themeText.textContent = 'Auto';
            break;
    }
    
    // Update status message
    const effectiveLabel = effectiveTheme === 'dark' ? 'dark' : 'light';
    updateStatus(`Theme: ${currentTheme} (${effectiveLabel} mode active)`);
}
