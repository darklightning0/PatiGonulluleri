// Utility functions for security and sanitization

/**
 * Sanitizes HTML string to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized HTML string
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Check if enough time has passed since last form submission
 * @returns {boolean} - Whether submission is allowed
 */
function checkRateLimit() {
    const RATE_LIMIT_KEY = 'form_submit_timestamp';
    const RATE_LIMIT_INTERVAL = 60000; // 1 minute

    const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < RATE_LIMIT_INTERVAL) {
        return false;
    }
    return true;
}

/**
 * Update rate limit timestamp after successful submission
 */
function updateRateLimit() {
    const RATE_LIMIT_KEY = 'form_submit_timestamp';
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}

// Export utilities
window.utils = {
    sanitizeHTML,
    checkRateLimit,
    updateRateLimit
};