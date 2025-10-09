/**
 * About Us Page JavaScript
 * Handles FAQ interactions, statistics animations, and scroll effects
 */

// ===================
// GLOBAL VARIABLES
// ===================

let statsAnimated = false;

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    initAboutPage();
});

function initAboutPage() {
    console.log('🐾 Initializing About Us Page');
    
    // Initialize components
    initFAQ();
    initScrollAnimations();
    initStatisticsAnimation();
    initTimelineAnimation();
    
    console.log('✅ About Us Page Initialized');
}

// ===================
// FAQ FUNCTIONALITY
// ===================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            toggleFAQ(item);
        });
        
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
    
    // Smooth scroll to FAQ item if it's being opened
    if (!isActive) {
        setTimeout(() => {
            faqItem.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }
}

function closeAllFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        const question = item.querySelector('.faq-question');
        answer.style.maxHeight = '0';
        question.setAttribute('aria-expanded', 'false');
    });
}

// ===================
// SCROLL ANIMATIONS
// ===================

function initScrollAnimations() {
    // Add scroll reveal classes to elements
    const animatedElements = document.querySelectorAll(
        '.value-card, .legal-card, .goal-item, .mission-points li, .timeline-item'
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
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with staggered delays
    animatedElements.forEach((element, index) => {
        element.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(element);
    });
}

// ===================
// STATISTICS ANIMATION
// ===================

function initStatisticsAnimation() {
    const statsSection = document.querySelector('.impact-stats');
    if (!statsSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                animateStatistics();
                statsAnimated = true;
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    observer.observe(statsSection);
}

function animateStatistics() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(statNumber => {
        const target = parseInt(statNumber.dataset.target);
        animateNumber(statNumber, 0, target, 2000);
    });
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.round(start + (range * easeOutQuart));
        
        // Format number with separators
        element.textContent = formatNumber(currentNumber);
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            // Final value with formatting
            element.textContent = formatNumber(end);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function formatNumber(num) {
    // Add thousand separators for large numbers
    if (num >= 1000) {
        return num.toLocaleString('tr-TR');
    }
    return num.toString();
}

// ===================
// TIMELINE ANIMATION
// ===================

function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('timeline-animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach((item, index) => {
        // Add staggered animation delay
        item.style.setProperty('--animation-delay', `${index * 0.2}s`);
        observer.observe(item);
    });
}

// ===================
// UTILITY FUNCTIONS
// ===================

function getCurrentLanguage() {
    return window.currentLanguage || 'tr';
}

function updateLanguageContent() {
    // This function can be called when language is switched
    // Update any dynamic content that needs language-specific formatting
    
    const currentLang = getCurrentLanguage();
    
    // Update number formatting based on language
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(statNumber => {
        const currentValue = parseInt(statNumber.textContent.replace(/[^\d]/g, ''));
        if (!isNaN(currentValue)) {
            const locale = currentLang === 'tr' ? 'tr-TR' : 'en-US';
            statNumber.textContent = currentValue.toLocaleString(locale);
        }
    });
}

// ===================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ===================

function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================
// KEYBOARD NAVIGATION ENHANCEMENTS
// ===================

function initKeyboardNavigation() {
    // Enhanced keyboard navigation for interactive elements
    const interactiveElements = document.querySelectorAll('.legal-link, .cta-buttons .btn');
    
    interactiveElements.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.target.click();
            }
        });
    });
}

// ===================
// PERFORMANCE OPTIMIZATION
// ===================

function optimizeAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Disable animations for users who prefer reduced motion
        const animatedElements = document.querySelectorAll('.scroll-reveal, .timeline-item');
        animatedElements.forEach(element => {
            element.classList.add('revealed');
            element.style.transition = 'none';
        });
        
        // Show statistics immediately without animation
        if (!statsAnimated) {
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(statNumber => {
                const target = parseInt(statNumber.dataset.target);
                statNumber.textContent = formatNumber(target);
            });
            statsAnimated = true;
        }
    }
}

// ===================
// INTERSECTION OBSERVER POLYFILL
// ===================

function initIntersectionObserverPolyfill() {
    // Simple fallback for older browsers
    if (!('IntersectionObserver' in window)) {
        // Reveal all elements immediately
        const revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
        
        // Animate statistics immediately
        if (!statsAnimated) {
            setTimeout(() => {
                animateStatistics();
            }, 1000);
        }
    }
}

// ===================
// ERROR HANDLING
// ===================

function handleErrors() {
    window.addEventListener('error', (e) => {
        console.error('About Page Error:', e.error);
        // Graceful degradation - ensure basic functionality works
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.error('About Page Promise Rejection:', e.reason);
        e.preventDefault();
    });
}

// ===================
// PAGE VISIBILITY API
// ===================

function initPageVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when page is not visible
            console.log('Page hidden - pausing animations');
        } else {
            // Resume animations when page becomes visible
            console.log('Page visible - resuming animations');
            
            // Re-trigger statistics animation if user returns to page
            const impactSection = document.querySelector('.impact-section');
            if (impactSection && isElementInViewport(impactSection) && !statsAnimated) {
                animateStatistics();
                statsAnimated = true;
            }
        }
    });
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===================
// LAZY LOADING FOR IMAGES
// ===================

function initLazyLoading() {
    const images = document.querySelectorAll('.section-image');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// ===================
// ANALYTICS TRACKING
// ===================

function trackUserInteractions() {
    // Track FAQ interactions
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach((question, index) => {
        question.addEventListener('click', () => {
            console.log(`FAQ ${index + 1} clicked`);
            // In real implementation, send to analytics service
        });
    });
    
    // Track legal document clicks
    const legalLinks = document.querySelectorAll('.legal-link');
    legalLinks.forEach(link => {
        link.addEventListener('click', () => {
            const documentName = link.closest('.legal-card').querySelector('h3').textContent;
            console.log(`Legal document accessed: ${documentName}`);
            // In real implementation, send to analytics service
        });
    });
    
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`CTA clicked: ${button.textContent}`);
            // In real implementation, send to analytics service
        });
    });
}

// ===================
// COMPLETE INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    // Run additional initialization after a short delay to ensure DOM is fully loaded
    setTimeout(() => {
        initSmoothScrolling();
        initKeyboardNavigation();
        optimizeAnimations();
        initIntersectionObserverPolyfill();
        handleErrors();
        initPageVisibilityHandling();
        initLazyLoading();
        trackUserInteractions();
        
        // Listen for language changes
        window.addEventListener('languageChanged', updateLanguageContent);
        
        console.log('🎉 About Us Page Fully Loaded');
    }, 100);
});

// ===================
// RESIZE HANDLING
// ===================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate animations and positions on resize
        const activeAnswers = document.querySelectorAll('.faq-item.active .faq-answer');
        activeAnswers.forEach(answer => {
            answer.style.maxHeight = answer.scrollHeight + 'px';
        });
    }, 250);
});

// ===================
// EXPORTS (for testing)
// ===================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleFAQ,
        animateStatistics,
        formatNumber,
        getCurrentLanguage
    };
}