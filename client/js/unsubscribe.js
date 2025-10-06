/**
 * Unsubscribe Page JavaScript
 * Handles email unsubscription functionality
 */

let currentLanguage = 'tr';

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    initUnsubscribePage();
});

function initUnsubscribePage() {
    console.log('🔔 Initializing Unsubscribe Page');
    
    initLanguageToggle();
    loadLanguagePreference();
    initMobileNavigation();
    initUnsubscribeForm();
    
    console.log('✅ Unsubscribe Page Initialized');
}

// ===================
// LANGUAGE SUPPORT
// ===================

function initLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetLang = btn.dataset.lang;
            if (targetLang !== currentLanguage) {
                switchLanguage(targetLang);
            }
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all translatable elements
    const translatableElements = document.querySelectorAll('[data-tr][data-en]');
    translatableElements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            if (element.placeholder !== undefined) {
                element.placeholder = text;
            } else if (element.value !== undefined && element.tagName === 'BUTTON') {
                element.value = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
        switchLanguage(savedLang);
    }
}

// ===================
// MOBILE NAVIGATION
// ===================

function initMobileNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!mobileMenuBtn || !nav) return;
    
    const closeMobileMenu = () => {
        mobileMenuBtn.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    navLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
    
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// ===================
// UNSUBSCRIBE FORM
// ===================

function initUnsubscribeForm() {
    const form = document.getElementById('unsubscribe-form');
    
    if (!form) return;
    
    form.addEventListener('submit', handleUnsubscribeSubmit);
    
    // Add input validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', () => clearFieldError(emailInput));
    }
}

async function handleUnsubscribeSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('#email');
    const email = emailInput.value.trim();
    
    // Validate email
    if (!isValidEmail(email)) {
        showFieldError(emailInput, currentLanguage === 'tr' ? 
            'Lütfen geçerli bir e-posta adresi giriniz.' : 
            'Please enter a valid email address.');
        return;
    }
    
    const submitBtn = form.querySelector('.btn-unsubscribe');
    const originalHTML = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${currentLanguage === 'tr' ? 'İşleniyor...' : 'Processing...'}`;
    
    try {
        // Call the unsubscribe API
        const response = await fetch('/api/unsubscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const text = await response.text();
        let data = null;
        
        try {
            data = text ? JSON.parse(text) : null;
        } catch (err) {
            console.error('Failed to parse response as JSON:', err);
        }
        
        if (!response.ok) {
            const message = (data && (data.error || data.message)) || text || 'Unsubscribe failed';
            throw new Error(message);
        }
        
        // Show success state
        showSuccessState();
        
    } catch (error) {
        console.error('Unsubscribe error:', error);
        showFieldError(emailInput, error.message || (currentLanguage === 'tr' ? 
            'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : 
            'An error occurred. Please try again later.'));
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalHTML;
    }
}

function showSuccessState() {
    const formContainer = document.getElementById('unsubscribe-form-container');
    const successContainer = document.getElementById('success-container');
    
    // Hide form
    formContainer.classList.add('hidden');
    
    // Show success message
    successContainer.classList.remove('hidden');
    successContainer.classList.add('show');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================
// VALIDATION
// ===================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) errorMessage.remove();
}

// ===================
// ERROR HANDLING
// ===================

window.addEventListener('error', (e) => {
    console.error('Unsubscribe page error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});