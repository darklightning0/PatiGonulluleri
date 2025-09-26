/**
 * Main JavaScript functionality for Pati Gönüllüleri website
 * Handles language switching, mobile navigation, form validation, and animations
 */

// ===================
// GLOBAL VARIABLES
// ===================

let currentLanguage = 'tr';
let isScrolling = false;

// ===================
// LANGUAGE DATA
// ===================

const translations = {
    tr: {
        // Navigation
        "Anasayfa": "Anasayfa",
        "Hakkımızda": "Hakkımızda", 
        "Sahiplen": "Sahiplen",
        "Makaleler": "Makaleler",
        "İletişim": "İletişim",
        
        // Hero Section
        "Her Canın Sevgi Dolu Bir Yuva Hakkı Var": "Her Canın Sevgi Dolu Bir Yuva Hakkı Var",
        "Sokak hayvanları ve barınak hayvanlarına yeni bir başlangıç vermenin zamanı geldi. Onların hikayesi sizinle devam etsin.": "Sokak hayvanları ve barınak hayvanlarına yeni bir başlangıç vermenin zamanı geldi. Onların hikayesi sizinle devam etsin.",
        "Sahiplen": "Sahiplen",
        "Keşfet": "Keşfet",
        
        // Pet Section
        "Sahiplenmeye Hazır": "Sahiplenmeye Hazır",
        "Bu güzel dostlarımız sıcak yuvalarını bekliyorlar": "Bu güzel dostlarımız sıcak yuvalarını bekliyorlar",
        "Köpek": "Köpek",
        "Kedi": "Kedi",
        "3 yaşında, oyuncu ve çok sevecen. Çocuklarla çok iyi anlaşıyor.": "3 yaşında, oyuncu ve çok sevecen. Çocuklarla çok iyi anlaşıyor.",
        "2 yaşında, sakin ve uysal. Kucakta sevgi almayı çok seviyor.": "2 yaşında, sakin ve uysal. Kucakta sevgi almayı çok seviyor.",
        "1 yaşında, enerjik ve meraklı. Yeni maceralara hazır küçük kaşif.": "1 year old, energetic and curious. A little explorer ready for new adventures.",
        "3 Yaş": "3 Years",
        "2 Yaş": "2 Years",
        "1 Yaş": "1 Year",
        "Büyük": "Large",
        "Orta": "Medium",
        "Küçük": "Small",
        "Daha Fazla": "Learn More",
        "Tüm Hayvanları Gör": "See All Animals",
        
        // Features Section
        "Size Uygun Dostları Keşfedin": "Discover Perfect Companions for You",
        "Tercihlerinize göre en uygun hayvan arkadaşlarınızı bulmanızda yardımcı olalım.": "Let us help you find the most suitable animal friends according to your preferences.",
        "E-posta Adresiniz": "Your Email Address",
        "Tercih Ettiğiniz Hayvan": "Preferred Animal",
        "Tercih Ettiğiniz Boyut": "Preferred Size",
        "Tercih Ettiğiniz Yaş": "Preferred Age",
        "Fark Etmez": "No Preference",
        "Diğer": "Other",
        "Genç (0-2 yaş)": "Young (0-2 years)",
        "Yetişkin (2-7 yaş)": "Adult (2-7 years)",
        "Yaşlı (7+ yaş)": "Senior (7+ years)",
        "Bildirimlerimi Başlat": "Start My Notifications",
        
        // Mission
        "Misyonumuz": "Our Mission",
        "Sokakta yaşam mücadelesi veren her canın sıcak bir yuva bulması için çalışıyoruz. Her hayvan sevgi, bakım ve güvenlik hakkına sahiptir. Onları bekleyen ailelerle buluşturmak ve farkındalık yaratmak bizim en büyük amacımız.": "We work to ensure that every soul struggling to survive on the streets finds a warm home. Every animal has the right to love, care and safety. Our greatest goal is to bring them together with the families waiting for them and to create awareness.",
        "Sahiplendirme": "Adoptions",
        "Kurtarılan Hayvan": "Rescued Animals",
        
        // Articles
        "Güncel Makaleler": "Latest Articles",
        "Yeni Sahiplenilen Kediler İçin İlk Hafta Rehberi": "First Week Guide for Newly Adopted Cats",
        "Yeni evine gelen kediler için adaptasyon süreci...": "The adaptation process for cats coming to their new home...",
        "Sokak Hayvanlarına Nasıl Yardım Edebiliriz?": "How Can We Help Street Animals?",
        "Basit adımlarla hayvan dostlarımızın hayatlarını kolaylaştırabiliriz...": "We can make life easier for our animal friends with simple steps...",
        "Tüm Makaleleri Oku": "Read All Articles",
        
        // Footer
        "Her hayvanın sevgi dolu bir yuva bulması için çalışan gönüllü bir kuruluş.": "A volunteer organization working to ensure every animal finds a loving home.",
        "Hızlı Bağlantılar": "Quick Links",
        "İletişim": "Contact",
        "Yasal": "Legal",
        "Gizlilik Sözleşmesi": "Privacy Policy",
        "Kullanım Koşulları": "Terms of Use",
        "KVKK Aydınlatma Metni": "KVKK Disclosure Text",
        "© 2025 Pati Gönüllüleri. Tüm hakları saklıdır.": "© 2025 Pati Gönüllüleri. All rights reserved."
    }
};

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Debounce function to limit the rate of function execution
 */
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

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Animate number counting
 */
function animateNumber(element, start, end, duration = 2000) {
    const startTime = performance.now();
    const range = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.round(start + (range * easeOutQuart));
        
        element.textContent = currentNumber + '+';
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ===================
// LANGUAGE SWITCHING
// ===================

/**
 * Initialize language switching functionality
 */
function initLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetLang = btn.dataset.lang;
            if (targetLang !== currentLanguage) {
                switchLanguage(targetLang);
                updateLanguageButtons(targetLang);
            }
        });
    });
}

/**
 * Switch between languages
 */
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all translatable elements
    const translatableElements = document.querySelectorAll('[data-tr][data-en]');
    
    translatableElements.forEach(element => {
        const trText = element.dataset.tr;
        const enText = element.dataset.en;
        
        if (lang === 'tr') {
            element.textContent = trText;
        } else if (lang === 'en') {
            element.textContent = enText;
        }
    });
    
    // Update form placeholders and other attributes if needed
    updateFormTexts(lang);
    
    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Add smooth transition effect
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
}

/**
 * Update language button states
 */
function updateLanguageButtons(activeLang) {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === activeLang) {
            btn.classList.add('active');
        }
    });
}

/**
 * Update form texts and placeholders
 */
function updateFormTexts(lang) {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.placeholder = lang === 'tr' 
            ? 'ornek@email.com' 
            : 'example@email.com';
    }
}

/**
 * Load saved language preference
 */
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
        currentLanguage = savedLang;
        switchLanguage(savedLang);
        updateLanguageButtons(savedLang);
    }
}

// ===================
// MOBILE NAVIGATION
// ===================

/**
 * Initialize mobile navigation
 */
function initMobileNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    mobileMenuBtn.classList.toggle('active');
    nav.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (nav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    mobileMenuBtn.classList.remove('active');
    nav.classList.remove('active');
    document.body.style.overflow = '';
}

// ===================
// FORM VALIDATION
// ===================

/**
 * Initialize form validation
 */
function initFormValidation() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        
        // Real-time email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmail);
            emailInput.addEventListener('input', clearEmailError);
        }
    }
}

/**
 * Handle newsletter form submission
 */
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const animalType = formData.get('animalType');
    const size = formData.get('size');
    const age = formData.get('age');
    
    // Validate email
    if (!isValidEmail(email)) {
        showFormError('email', currentLanguage === 'tr' ? 
            'Lütfen geçerli bir e-posta adresi giriniz.' : 
            'Please enter a valid email address.');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentLanguage === 'tr' ? 'Kaydediliyor...' : 'Saving...';
    
    // Simulate API call
    setTimeout(() => {
        // Reset form
        e.target.reset();
        
        // Show success message
        showSuccessMessage(currentLanguage === 'tr' ? 
            'Tercihlieriniz kaydedildi! Size uygun hayvanlar hakkında bilgilendirme alacaksınız.' :
            'Your preferences have been saved! You will receive notifications about suitable animals.');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        // Log data for development (remove in production)
        console.log('Newsletter signup:', { email, animalType, size, age });
        
    }, 2000);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate email input
 */
function validateEmail(e) {
    const email = e.target.value.trim();
    if (email && !isValidEmail(email)) {
        showFormError('email', currentLanguage === 'tr' ? 
            'Geçerli bir e-posta adresi giriniz.' : 
            'Please enter a valid email address.');
    }
}

/**
 * Clear email error
 */
function clearEmailError(e) {
    clearFormError('email');
}

/**
 * Show form error
 */
function showFormError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (field) {
        field.style.borderColor = '#e74c3c';
        
        // Remove existing error
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '14px';
        errorDiv.style.marginTop = '4px';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
}

/**
 * Clear form error
 */
function clearFormError(fieldName) {
    const field = document.getElementById(fieldName);
    if (field) {
        field.style.borderColor = '';
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        max-width: 300px;
        font-size: 14px;
        line-height: 1.4;
    `;
    
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
    }, 4000);
}

// ===================
// SCROLL EFFECTS
// ===================

/**
 * Initialize scroll effects
 */
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    // Header scroll effect
    const handleScroll = debounce(() => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Reveal animations
        revealOnScroll();
    }, 10);
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    revealOnScroll();
}

/**
 * Reveal elements on scroll
 */
function revealOnScroll() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    revealElements.forEach(element => {
        if (isElementInViewport(element) && !element.classList.contains('revealed')) {
            element.classList.add('revealed');
            
            // Animate stat numbers when they become visible
            if (element.classList.contains('stat-number')) {
                const targetNumber = parseInt(element.textContent.replace('+', ''));
                animateNumber(element, 0, targetNumber);
            }
        }
    });
}

/**
 * Check if element is in viewport (more precise version)
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return (
        rect.top <= windowHeight * 0.8 &&
        rect.bottom >= 0
    );
}

// ===================
// SMOOTH SCROLLING
// ===================

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip if href is just "#"
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
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// ===================
// IMAGE LOADING
// ===================

/**
 * Initialize lazy loading for images
 */
function initImageLoading() {
    const images = document.querySelectorAll('img');
    
    // Add loading animation class
    images.forEach(img => {
        img.classList.add('loading');
        
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        });
        
        img.addEventListener('error', () => {
            img.classList.remove('loading');
            img.classList.add('error');
            // Set fallback image
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjdGM0U3Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEwSDIyNVYxNDBIMTc1VjExMFoiIGZpbGw9IiNCM0JCQUYiLz4KPHBhdGggZD0iTTE1MCA4MEgyNTBWMTcwSDE1MFY4MFoiIHN0cm9rZT0iI0IzQkJBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzI1MDM3IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkdvcnNlbCBZdWtsZW5lbWVkaS90ZXh0Pgo8L3N2Zz4=';
        });
    });
}

// ===================
// PERFORMANCE OPTIMIZATION
// ===================

/**
 * Optimize animations for better performance
 */
function optimizeAnimations() {
    let ticking = false;
    
    function updateAnimations() {
        // Batch DOM updates
        revealOnScroll();
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// ===================
// INITIALIZATION
// ===================

/**
 * Initialize all functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Pati Gönüllüleri - Website Loaded');
    
    // Initialize core functionality
    loadLanguagePreference();
    initLanguageToggle();
    initMobileNavigation();
    initFormValidation();
    initScrollEffects();
    initSmoothScrolling();
    initImageLoading();
    optimizeAnimations();
    
    // Add scroll reveal class to animated elements
    const animatedElements = document.querySelectorAll('.pet-card, .feature-card, .stat-number');
    animatedElements.forEach(element => {
        element.classList.add('scroll-reveal');
    });
    
    // Initialize active nav link based on current page
    updateActiveNavLink();
    
    // Add loading complete class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

/**
 * Update active navigation link based on current page
 */
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if ((currentPage === 'index.html' || currentPage === '') && 
            (href === '#' || href === 'index.html')) {
            link.classList.add('active');
        } else if (href.includes(currentPage.replace('.html', ''))) {
            link.classList.add('active');
        }
    });
}

// ===================
// ERROR HANDLING
// ===================

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault();
});

// ===================
// EXPORTS (for module usage)
// ===================

// If using as a module, export main functions
