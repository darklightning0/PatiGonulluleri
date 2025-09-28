/**
 * Contact Page JavaScript
 * Handles form submissions, FAQ interactions, and contact functionality
 */

// ===================
// GLOBAL VARIABLES
// ===================

let isSubmitting = false;

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    initContactPage();
});

function initContactPage() {
    console.log('📞 Initializing Contact Page');
    
    // Initialize components
    initForms();
    initFAQ();
    initScrollAnimations();
    initNewsletterSignup();
    
    console.log('✅ Contact Page Initialized');
}

// ===================
// FORM HANDLING
// ===================

function initForms() {
    const generalForm = document.getElementById('general-contact-form');
    const volunteerForm = document.getElementById('volunteer-form');
    
    if (generalForm) {
        generalForm.addEventListener('submit', handleGeneralFormSubmit);
        initFormValidation(generalForm);
    }
    
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerFormSubmit);
        initFormValidation(volunteerForm);
    }
}

function initFormValidation(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', () => validateField(input));
        
        // Clear errors on input
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Email specific validation
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => validateEmail(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Bu alan zorunludur.' : 'This field is required.';
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.';
    }
    
    // Phone validation (optional but if filled should be valid)
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Geçerli bir telefon numarası giriniz.' : 'Please enter a valid phone number.';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function validateEmail(field) {
    const value = field.value.trim();
    if (value && !isValidEmail(value)) {
        showFieldError(field, getCurrentLanguage() === 'tr' ? 
            'Geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.');
        return false;
    }
    clearFieldError(field);
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Accept various phone formats (Turkish and international)
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function showFieldError(field, message) {
    // Add error styling
    field.style.borderColor = '#e74c3c';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
    
    // Add error class to form group
    field.closest('.form-group').classList.add('error');
}

function clearFieldError(field) {
    // Remove error styling
    field.style.borderColor = '';
    
    // Remove error message
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    
    // Remove error class from form group
    field.closest('.form-group').classList.remove('error');
}

// ===================
// GENERAL CONTACT FORM
// ===================

function handleGeneralFormSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate all fields
    const form = e.target;
    const formData = new FormData(form);
    const isValid = validateForm(form);
    
    if (!isValid) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'Lütfen tüm gerekli alanları doğru şekilde doldurun.' : 
            'Please fill all required fields correctly.', 'error');
        return;
    }
    
    // Check privacy agreement
    const privacyAgreement = formData.get('privacyAgreement');
    if (!privacyAgreement) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'Kişisel verilerin işlenmesi onayını vermelisiniz.' : 
            'You must consent to personal data processing.', 'error');
        return;
    }
    
    // Prepare form data
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        type: 'general_contact'
    };
    
    submitForm(form, contactData, 'Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.');
}

// ===================
// VOLUNTEER FORM
// ===================

function handleVolunteerFormSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const form = e.target;
    const formData = new FormData(form);
    const isValid = validateForm(form);
    
    if (!isValid) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'Lütfen tüm gerekli alanları doğru şekilde doldurun.' : 
            'Please fill all required fields correctly.', 'error');
        return;
    }
    
    // Get selected interests
    const interests = [];
    const interestCheckboxes = form.querySelectorAll('input[name="interests"]:checked');
    interestCheckboxes.forEach(checkbox => {
        interests.push(checkbox.value);
    });
    
    // Check if at least one interest is selected
    if (interests.length === 0) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'Lütfen en az bir ilgi alanı seçin.' : 
            'Please select at least one area of interest.', 'error');
        return;
    }
    
    // Prepare volunteer data
    const volunteerData = {
        name: formData.get('name'),
        age: formData.get('age'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        interests: interests,
        availability: formData.get('availability'),
        experience: formData.get('experience'),
        motivation: formData.get('motivation'),
        timestamp: new Date().toISOString(),
        type: 'volunteer_application'
    };
    
    submitForm(form, volunteerData, 'Gönüllü başvurunuz alındı! Sizinle 3-5 iş günü içinde iletişime geçeceğiz.');
}

// ===================
// FORM SUBMISSION
// ===================

function submitForm(form, data, successMessage) {
    isSubmitting = true;
    
    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalHTML = submitBtn.innerHTML;
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Gönderiliyor...</span>';
    
    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        try {
            // In a real application, this would be an actual API call:
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });
            
            console.log('Form submitted:', data);
            
            // Show success message
            showNotification(successMessage, 'success');
            
            // Reset form
            form.reset();
            clearAllFieldErrors(form);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Track form submission (analytics)
            trackFormSubmission(data.type, data);
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification(getCurrentLanguage() === 'tr' ? 
                'Bir hata oluştu. Lütfen tekrar deneyin.' : 
                'An error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            isSubmitting = false;
        }
    }, 2000);
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function clearAllFieldErrors(form) {
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const errorFields = form.querySelectorAll('.form-group.error');
    errorFields.forEach(group => group.classList.remove('error'));
    
    const fieldsWithErrors = form.querySelectorAll('input, select, textarea');
    fieldsWithErrors.forEach(field => {
        field.style.borderColor = '';
    });
}

// ===================
// FAQ FUNCTIONALITY
// ===================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => toggleFAQ(item));
            
            // Add keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFAQ(item);
                }
            });
            
            // Make focusable
            question.setAttribute('tabindex', '0');
            question.setAttribute('role', 'button');
            question.setAttribute('aria-expanded', 'false');
        }
    });
}

function toggleFAQ(faqItem) {
    const isActive = faqItem.classList.contains('active');
    const answer = faqItem.querySelector('.faq-answer');
    const question = faqItem.querySelector('.faq-question');
    
    if (isActive) {
        // Close FAQ
        faqItem.classList.remove('active');
        answer.style.maxHeight = '0';
        question.setAttribute('aria-expanded', 'false');
    } else {
        // Close other FAQ items first (accordion behavior)
        closeAllFAQs();
        
        // Open this FAQ
        faqItem.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
    }
}

function closeAllFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        const question = item.querySelector('.faq-question');
        if (answer) answer.style.maxHeight = '0';
        if (question) question.setAttribute('aria-expanded', 'false');
    });
}

// ===================
// NEWSLETTER SIGNUP
// ===================

function initNewsletterSignup() {
    const newsletterForm = document.getElementById('newsletter-signup');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const consent = formData.get('consent');
    
    // Validate email
    if (!email || !isValidEmail(email)) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'Geçerli bir e-posta adresi giriniz.' : 
            'Please enter a valid email address.', 'error');
        return;
    }
    
    // Check consent
    if (!consent) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'E-posta bildirimleri için onay vermelisiniz.' : 
            'You must consent to email notifications.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Simulate API call
    setTimeout(() => {
        const newsletterData = {
            email: email,
            timestamp: new Date().toISOString(),
            type: 'newsletter_signup'
        };
        
        console.log('Newsletter signup:', newsletterData);
        
        // Show success message
        showNotification(getCurrentLanguage() === 'tr' ? 
            'E-posta listemize başarıyla kaydoldunuz!' : 
            'Successfully subscribed to our email list!', 'success');
        
        // Reset form
        e.target.reset();
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        
        // Track newsletter signup
        trackFormSubmission('newsletter', newsletterData);
        
    }, 1500);
}

// ===================
// SCROLL ANIMATIONS
// ===================

function initScrollAnimations() {
    // Add scroll reveal classes to elements
    const animatedElements = document.querySelectorAll(
        '.contact-card, .form-section, .faq-item, .newsletter-card'
    );
    
    animatedElements.forEach(element => {
        element.classList.add('scroll-reveal');
    });
    
    // Initialize intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ===================
// UTILITY FUNCTIONS
// ===================

function getCurrentLanguage() {
    return window.currentLanguage || 'tr';
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        line-height: 1.4;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f39c12';
            break;
        default:
            notification.style.backgroundColor = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function trackFormSubmission(type, data) {
    // In a real application, this would send data to analytics service
    console.log(`Form submission tracked: ${type}`, {
        type: type,
        timestamp: data.timestamp,
        // Don't log personal information in production
        fields: Object.keys(data).length
    });
    
    // Example: Google Analytics, Mixpanel, etc.
    // analytics.track('Form Submitted', { form_type: type });
}

// ===================
// ERROR HANDLING
// ===================

window.addEventListener('error', (e) => {
    console.error('Contact Page Error:', e.error);
    
    // Show user-friendly error message
    if (e.error.message.includes('fetch') || e.error.message.includes('network')) {
        showNotification(getCurrentLanguage() === 'tr' ? 
            'İnternet bağlantınızı kontrol edin.' : 
            'Please check your internet connection.', 'error');
    }
});

// ===================
// RESIZE HANDLING
// ===================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate FAQ heights on resize
        const activeAnswers = document.querySelectorAll('.faq-item.active .faq-answer');
        activeAnswers.forEach(answer => {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        });
    }, 250);
});

// ===================
// ACCESSIBILITY ENHANCEMENTS
// ===================

function initAccessibilityEnhancements() {
    // Add form labels for screen readers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const label = form.querySelector(`label[for="${input.id}"]`);
            if (label && !input.getAttribute('aria-label')) {
                input.setAttribute('aria-label', label.textContent);
            }
        });
    });
    
    // Add live region for form errors
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
    
    // Update live region when showing notifications
    const originalShowNotification = showNotification;
    showNotification = (message, type) => {
        liveRegion.textContent = message;
        originalShowNotification(message, type);
    };
}

// Initialize accessibility enhancements after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAccessibilityEnhancements, 100);
});

// ===================
// EXPORTS (for testing)
// ===================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateField,
        isValidEmail,
        isValidPhone,
        toggleFAQ,
        showNotification
    };
}