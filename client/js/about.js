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
    // Ensure DOM is fully loaded
    if (document.readyState === 'loading') {
        // Still loading, wait for DOMContentLoaded
        return;
    }
    
    // Initialize immediately
    initAboutPage();
    
    // Run additional initialization after DOM is fully painted
    requestAnimationFrame(() => {
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
    });
});

function initAboutPage() {
    console.log('ðŸ¾ Initializing About Us Page');
    
    // Initialize components
    initFAQ();
    initScrollAnimations();
    initStatisticsAnimation();
    initTimelineAnimation();
    
    console.log('âœ… About Us Page Initialized');
}

// ===================
// FAQ FUNCTIONALITY
// ===================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Store references
    const faqData = Array.from(faqItems).map(item => ({
        item,
        question: item.querySelector('.faq-question'),
        answer: item.querySelector('.faq-answer')
    }));
    
    faqData.forEach(({item, question, answer}) => {
        question.addEventListener('click', () => {
            toggleFAQ(item, answer, question, faqData);
        });
        
        // Make focusable
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
    });
}

function toggleFAQ(faqItem, answer, question, allFaqData) {
    const isActive = faqItem.classList.contains('active');
    
    if (isActive) {
        faqItem.classList.remove('active');
        answer.style.maxHeight = '0';
        question.setAttribute('aria-expanded', 'false');
    } else {
        // Close all others
        allFaqData.forEach(({item: otherItem, answer: otherAnswer, question: otherQuestion}) => {
            otherItem.classList.remove('active');
            otherAnswer.style.maxHeight = '0';
            otherQuestion.setAttribute('aria-expanded', 'false');
        });
        
        // Open this one
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
    
    // Store the target value as a data attribute for later use
    element.setAttribute('data-current-value', end);
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.round(start + (range * easeOutQuart));
        
        element.textContent = formatNumber(currentNumber);
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = formatNumber(end);
            element.setAttribute('data-current-value', end);
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
    const currentLang = getCurrentLanguage();
    
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(statNumber => {
        // Use the stored current value instead of parsing text
        const currentValue = parseInt(statNumber.getAttribute('data-current-value') || statNumber.dataset.target);
        if (!isNaN(currentValue) && currentValue > 0) {
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
            console.log('Page hidden - pausing animations');
        } else {
            console.log('Page visible - resuming animations');
            
            // Only animate if NOT already animated
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