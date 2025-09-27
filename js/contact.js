/**
 * İletişim (Contact) Page JavaScript
 * Handles form validation, submissions, map interactions, and animations
 */

// ===================
// GLOBAL VARIABLES
// ===================

let isFormSubmitting = false;
let mapInitialized = false;

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    initContactPage();
});

function initContactPage() {
    console.log('📞 Initializing Contact Page');
    
    // Initialize components
    initContactForm();
    initMapSection();
    initSocialMediaTracking();
    initScrollAnimations();
    initLocationSharing();
    initQuickActions();
    
    // Initialize tooltips and accessibility features
    initAccessibilityFeatures();
    
    // Load map with delay to improve page load performance
    setTimeout(initMap, 1000);
    
    console.log('✅ Contact Page Initialized');
}

// ===================
// CONTACT FORM HANDLING
// ===================

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    // Add form submission handler
    contactForm.addEventListener('submit', handleContactFormSubmit);
    
    // Add real-time validation
    const formFields = contactForm.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });
    
    // Add character counter for message field
    const messageField = document.getElementById('contact-message');
    if (messageField) {
        initMessageCounter(messageField);
        messageField.addEventListener('input', autoResizeTextarea);
    }
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    if (isFormSubmitting) return;
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    if (!validateForm(form)) {
        showFormMessage('Lütfen tüm gerekli alanları doğru şekilde doldurun.', 'error');
        return;
    }
    
    // Prepare form data
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        consent: formData.get('consent') === 'on',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
    };
    
    // Start submission process
    startFormSubmission(form);
    
    // Simulate API call (replace with actual endpoint)
    setTimeout(() => {
        // In real implementation, send to backend
        console.log('Contact form submitted:', contactData);
        
        // Handle success
        handleFormSuccess(form, contactData);
        
        // Track form submission
        trackFormSubmission(contactData.subject);
        
    }, 2500);
}

function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll('[required]');
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 'Bu alan zorunludur' : 'This field is required';
    }
    // Email validation
    else if (fieldType === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Geçerli bir e-posta adresi giriniz' : 
            'Please enter a valid email address';
    }
    // Phone validation
    else if (fieldType === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Geçerli bir telefon numarası giriniz' : 
            'Please enter a valid phone number';
    }
    // Message length validation
    else if (fieldName === 'message' && value && value.length < 10) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Mesaj en az 10 karakter olmalıdır' : 
            'Message must be at least 10 characters';
    }
    // Subject validation
    else if (fieldName === 'subject' && field.tagName === 'SELECT' && !value) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Bir konu seçiniz' : 
            'Please select a subject';
    }
    // Consent validation
    else if (fieldName === 'consent' && field.type === 'checkbox' && !field.checked) {
        isValid = false;
        errorMessage = getCurrentLanguage() === 'tr' ? 
            'Bu onay zorunludur' : 
            'This consent is required';
    }
    
    // Show/hide error
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    // Add shake animation
    field.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
    }
}

function startFormSubmission(form) {
    isFormSubmitting = true;
    const submitBtn = form.querySelector('.submit-btn');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.textContent;
        btnText.textContent = getCurrentLanguage() === 'tr' ? 'Gönderiliyor...' : 'Sending...';
        
        // Store original text for later
        submitBtn.dataset.originalText = originalText;
    }
    
    // Clear previous messages
    clearFormMessages();
}

function handleFormSuccess(form, data) {
    isFormSubmitting = false;
    const submitBtn = form.querySelector('.submit-btn');
    
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        
        const btnText = submitBtn.querySelector('span');
        const originalText = submitBtn.dataset.originalText;
        if (originalText) {
            btnText.textContent = originalText;
        } else {
            btnText.textContent = getCurrentLanguage() === 'tr' ? 'Mesajı Gönder' : 'Send Message';
        }
    }
    
    // Show success message
    const successMessage = getCurrentLanguage() === 'tr' ? 
        'Mesajınız başarıyla gönderildi! En kısa sürede size geri dönüş yapacağız.' :
        'Your message has been sent successfully! We will get back to you as soon as possible.';
    
    showFormMessage(successMessage, 'success');
    
    // Reset form after a short delay
    setTimeout(() => {
        form.reset();
        
        // Clear all field errors
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error');
        });
    }, 1000);
    
    // Auto-hide success message after 8 seconds
    setTimeout(() => {
        clearFormMessages();
    }, 8000);
}

function showFormMessage(message, type) {
    clearFormMessages();
    
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `form-${type}`;
    messageEl.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    form.appendChild(messageEl);
    
    // Show with animation
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 100);
}

function clearFormMessages() {
    const messages = document.querySelectorAll('.form-success, .form-error');
    messages.forEach(msg => msg.remove());
}

function initMessageCounter(field) {
    const maxLength = 1000;
    field.setAttribute('maxlength', maxLength);
    
    const counter = document.createElement('div');
    counter.className = 'message-counter';
    counter.style.cssText = `
        text-align: right;
        font-size: 12px;
        color: #666;
        margin-top: 4px;
    `;
    
    // Insert counter after the field
    field.parentNode.insertBefore(counter, field.nextSibling);
    
    function updateCounter() {
        const length = field.value.length;
        counter.textContent = `${length}/${maxLength}`;
        
        if (length > maxLength * 0.9) {
            counter.style.color = '#e74c3c';
        } else if (length > maxLength * 0.7) {
            counter.style.color = '#f39c12';
        } else {
            counter.style.color = '#666';
        }
        
        // Prevent further input if max length reached
        if (length >= maxLength) {
            field.value = field.value.substring(0, maxLength);
        }
    }
    
    field.addEventListener('input', updateCounter);
    field.addEventListener('keydown', (e) => {
        // Allow backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        // Stop if max length reached
        if (field.value.length >= maxLength) {
            e.preventDefault();
        }
    });
    
    updateCounter();
}

function autoResizeTextarea(e) {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// ===================
// VALIDATION UTILITIES
// ===================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if it's a valid Turkish phone number (10-11 digits)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

function getCurrentLanguage() {
    return window.currentLanguage || 'tr';
}

// ===================
// MAP FUNCTIONALITY
// ===================

function initMapSection() {
    const mapSection = document.getElementById('map-section');
    if (!mapSection) return;
    
    // Initialize map when it comes into view
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !mapInitialized) {
                initMap();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    observer.observe(mapSection);
}

function initMap() {
    if (mapInitialized) return;
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Simulate map loading
    createTimeout(() => {
        const loadingEl = mapContainer.querySelector('.map-loading');
        const contentEl = mapContainer.querySelector('.map-content');
        
        if (loadingEl && contentEl) {
            loadingEl.style.opacity = '0';
            loadingEl.style.pointerEvents = 'none';
            contentEl.style.opacity = '1';
            contentEl.style.pointerEvents = 'auto';
            
            createTimeout(() => {
                if (loadingEl && loadingEl.parentNode) {
                    loadingEl.style.display = 'none';
                }
            }, 300);
        }
        
        mapInitialized = true;
        console.log('Map initialized');
    }, 1500);
}

function initLocationSharing() {
    const shareLocationBtn = document.getElementById('share-location');
    if (!shareLocationBtn) return;
    
    shareLocationBtn.addEventListener('click', handleLocationShare);
}

function handleLocationShare() {
    const locationData = {
        name: 'Pati Gönüllüleri Barınağı',
        address: 'Pamukkale Mah. Hayvan Sevgisi Cad. No: 123/A, 20160 Denizli, Türkiye',
        url: window.location.href + '#map-section'
    };
    
    if (navigator.share) {
        navigator.share({
            title: locationData.name,
            text: locationData.address,
            url: locationData.url
        })
        .then(() => {
            console.log('Location shared successfully');
            showNotification('Konum başarıyla paylaşıldı!', 'success');
        })
        .catch(err => {
            console.error('Error sharing location:', err);
            fallbackLocationShare(locationData);
        });
    } else {
        fallbackLocationShare(locationData);
    }
}

function fallbackLocationShare(locationData) {
    const shareText = `${locationData.name}\n${locationData.address}\n${locationData.url}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText)
            .then(() => {
                showNotification('Konum bilgileri panoya kopyalandı!', 'success');
            })
            .catch(() => {
                showLocationModal(locationData);
            });
    } else {
        showLocationModal(locationData);
    }
}

function showLocationModal(locationData) {
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Konum Bilgileri</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>${locationData.name}</strong></p>
                <p>${locationData.address}</p>
                <p><a href="${locationData.url}" target="_blank">${locationData.url}</a></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.close-modal');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Auto-close after 5 seconds
    setTimeout(closeModal, 5000);
}

// ===================
// SOCIAL MEDIA TRACKING
// ===================

function initSocialMediaTracking() {
    const socialLinks = document.querySelectorAll('.social-item');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const platform = link.classList.contains('facebook') ? 'Facebook' :
                           link.classList.contains('instagram') ? 'Instagram' :
                           link.classList.contains('twitter') ? 'Twitter' :
                           link.classList.contains('youtube') ? 'YouTube' :
                           link.classList.contains('whatsapp') ? 'WhatsApp' :
                           link.classList.contains('linkedin') ? 'LinkedIn' : 'Unknown';
            
            console.log(`Social media click: ${platform}`);
            
            // Track social media engagement
            trackSocialMediaClick(platform);
        });
    });
}

function trackSocialMediaClick(platform) {
    // In real implementation, send to analytics service
    console.log(`Social media engagement tracked: ${platform}`);
    
    // You could send this data to Google Analytics, Facebook Pixel, etc.
    // gtag('event', 'social_click', {
    //     social_network: platform,
    //     social_action: 'click',
    //     social_target: window.location.href
    // });
}

function trackFormSubmission(subject) {
    // Track form submissions by subject
    console.log(`Form submission tracked: ${subject}`);
    
    // In real implementation:
    // gtag('event', 'form_submit', {
    //     form_name: 'contact_form',
    //     form_subject: subject
    // });
}

// ===================
// QUICK ACTIONS
// ===================

function initQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action');
    
    quickActions.forEach(action => {
        action.addEventListener('click', (e) => {
            const actionType = action.classList.contains('adopt') ? 'adoption' :
                             action.classList.contains('volunteer') ? 'volunteer' :
                             action.classList.contains('donate') ? 'donation' :
                             action.classList.contains('emergency') ? 'emergency' : 'unknown';
            
            console.log(`Quick action clicked: ${actionType}`);
            
            // Track quick action clicks
            trackQuickAction(actionType);
            
            // Handle emergency calls
            if (actionType === 'emergency') {
                handleEmergencyCall(e);
            }
        });
    });
}

function trackQuickAction(actionType) {
    console.log(`Quick action tracked: ${actionType}`);
    
    // In real implementation:
    // gtag('event', 'quick_action', {
    //     action_type: actionType
    // });
}

function handleEmergencyCall(e) {
    // Show confirmation for emergency calls
    const confirmed = confirm('Acil durum hattını arayacaksınız. Devam etmek istiyor musunuz?');
    if (!confirmed) {
        e.preventDefault();
    } else {
        showNotification('Acil durum hattına bağlanıyorsunuz...', 'info');
    }
}

// ===================
// SCROLL ANIMATIONS
// ===================

function initScrollAnimations() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const animatedElements = document.querySelectorAll(
        '.form-card, .info-card, .contact-item, .social-item, .quick-action, .info-item'
    );
    
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animatedElements.forEach((element, index) => {
        // Only animate if element is not already visible
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isVisible) {
            // Add staggered animation delay
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `opacity 0.6s ease ${Math.min(index * 0.1, 1)}s, transform 0.6s ease ${Math.min(index * 0.1, 1)}s`;
            observer.observe(element);
        } else {
            // Element is already visible, don't animate
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('fade-in');
        }
    });
}

// ===================
// ACCESSIBILITY FEATURES
// ===================

function initAccessibilityFeatures() {
    // Add keyboard navigation for quick actions
    const quickActions = document.querySelectorAll('.quick-action');
    quickActions.forEach(action => {
        action.setAttribute('tabindex', '0');
        action.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                action.click();
            }
        });
    });
    
    // Add ARIA labels for social media links
    const socialLinks = document.querySelectorAll('.social-item');
    socialLinks.forEach(link => {
        const platform = link.querySelector('h4').textContent;
        link.setAttribute('aria-label', `${platform} sayfamızı ziyaret edin`);
    });
    
    // Add focus management for form
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            // Focus first error field if validation fails
            setTimeout(() => {
                const firstError = form.querySelector('.form-group.error input, .form-group.error select, .form-group.error textarea');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        });
    }
    
    // Add skip link for keyboard navigation
    addSkipLink();
    
    // Improve focus indicators
    improveFocusIndicators();
}

function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#contact-form';
    skipLink.textContent = 'İletişim formuna geç';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -100px;
        left: 6px;
        background: #8B4513;
        color: white;
        padding: 8px 12px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-100px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function improveFocusIndicators() {
    // Add enhanced focus styles for interactive elements
    const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, .quick-action, .social-item'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #4A90E2';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
}

// ===================
// UTILITY FUNCTIONS
// ===================

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
        padding: 12px 20px;
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
        case 'info':
        default:
            notification.style.backgroundColor = '#3498db';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-hide notification
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===================
// ERROR HANDLING
// ===================

window.addEventListener('error', (event) => {
    console.error('Contact page error:', event.error);
    
    // Show user-friendly error message
    showNotification('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    showNotification('Bağlantı sorunu yaşanıyor. Lütfen tekrar deneyin.', 'error');
});

// ===================
// PERFORMANCE MONITORING
// ===================

function monitorPerformance() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load performance:', {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A'
            });
        }, 0);
    });
}

// Initialize performance monitoring
monitorPerformance();

// ===================
// CLEANUP AND OBSERVERS
// ===================

// Store observers to clean them up properly
let intersectionObservers = [];
let timeouts = [];

window.addEventListener('beforeunload', () => {
    // Clean up any running timers or observers
    console.log('Contact page cleanup');
    
    // Clear all timeouts
    timeouts.forEach(timeout => clearTimeout(timeout));
    timeouts = [];
    
    // Disconnect all observers
    intersectionObservers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
        }
    });
    intersectionObservers = [];
});

// Helper function to create managed timeouts
function createTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        callback();
        // Remove from tracking array
        const index = timeouts.indexOf(timeoutId);
        if (index > -1) {
            timeouts.splice(index, 1);
        }
    }, delay);
    
    timeouts.push(timeoutId);
    return timeoutId;
}

// Helper function to create managed observers
function createObserver(callback, options) {
    const observer = new IntersectionObserver(callback, options);
    intersectionObservers.push(observer);
    return observer;
}