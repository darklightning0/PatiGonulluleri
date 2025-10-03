/**
 * Main JavaScript functionality for Pati Gönüllüleri website
 * Handles language switching, mobile navigation, form validation, and animations
 */
import { CachedPetsService, CachedArticlesService } from './firebase-data-service.js';
// ===================
// GLOBAL VARIABLES
// ===================

let currentLanguage = 'tr';
let isScrolling = false;

// ===================
// INITIALIZATION
// ===================

/**
 * Initialize all functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements for performance
    const elements = {
        header: document.querySelector('.header'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        nav: document.querySelector('.nav'),
        navLinks: document.querySelectorAll('.nav-link'),
        langButtons: document.querySelectorAll('.lang-btn'),
        newsletterForm: document.getElementById('newsletter-form'),
        emailInput: document.getElementById('email'),
        scrollRevealElements: document.querySelectorAll('.pet-card, .feature-card, .stat-number'),
        anchorLinks: document.querySelectorAll('a[href^="#"]'),
        allImages: document.querySelectorAll('img'),
        articlesContainer: document.querySelector('.articles-card .article-preview'),
        featuredPetsContainer: document.getElementById('featured-pets')
    };

    console.log('🐾 Pati Gönüllüleri - Website Loaded');

    // Initialize core functionality
    initLanguageToggle(elements.langButtons);
    loadLanguagePreference();
    initMobileNavigation(elements.mobileMenuBtn, elements.nav, elements.navLinks);
    initFormValidation(elements.newsletterForm, elements.emailInput);
    initScrollEffects(elements.header, elements.scrollRevealElements);
    initSmoothScrolling(elements.anchorLinks, elements.header);
    initImageLoading(elements.allImages);
    optimizeAnimations();
    
    if (elements.articlesContainer) {
        await loadLatestArticles(elements.articlesContainer);
        
        // Reload on language change
        document.addEventListener('languageChanged', () => {
            loadLatestArticles(elements.articlesContainer);
        });
    }
    
    if (elements.featuredPetsContainer) {
        await loadFeaturedPets(elements.featuredPetsContainer);
        
        // Reload on language change
        document.addEventListener('languageChanged', () => {
            loadFeaturedPets(elements.featuredPetsContainer);
        });
    }

    // Initialize active nav link based on current page
    updateActiveNavLink(elements.navLinks);
    
    // Add loading complete class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ===================
// UTILITY FUNCTIONS
// ===================

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

function animateNumber(element, start, end, duration = 2000) {
    const startTime = performance.now();
    const range = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
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

function initLanguageToggle(langButtons) {
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetLang = btn.dataset.lang;
            if (targetLang !== currentLanguage) {
                switchLanguage(targetLang);
            }
        });
    });
}

/**
 * Switch language and notify other scripts.
 * @param {string} lang - The new language code ('tr' or 'en').
 */
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all static translatable elements
    const translatableElements = document.querySelectorAll('[data-tr][data-en]');
    translatableElements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            // Handle different element types
            if (element.placeholder !== undefined) {
                element.placeholder = text;
            } else if (element.value !== undefined) {
                element.value = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Store language preference
    localStorage.setItem('preferredLanguage', lang);

    // Update button states
    updateLanguageButtons(lang);
    
    // Add smooth transition effect for visual feedback
    document.body.style.transition = 'opacity 0.2s ease-in-out';
    document.body.style.opacity = '0.9';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);

    // *** NEW IMPLEMENTATION: Notify other scripts of the language change ***
    console.log(`Language changed to ${lang}. Dispatching 'languageChanged' event.`);
    const event = new CustomEvent('languageChanged', { 
        detail: { lang: currentLanguage } 
    });
    document.dispatchEvent(event);
}


function updateLanguageButtons(activeLang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === activeLang);
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

function initMobileNavigation(mobileMenuBtn, nav, navLinks) {
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
        if (nav.classList.contains('active') && !nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// ===================
// FORM VALIDATION & HANDLING
// ===================

function initFormValidation(newsletterForm, emailInput) {
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    
    if (emailInput) {
        emailInput.addEventListener('input', () => clearFormError(emailInput));
    }
}

// Line 239 in main.js - REPLACE ENTIRE FUNCTION
function handleNewsletterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('#email');
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
        showFormError(emailInput, currentLanguage === 'tr' ? 
            'Lütfen geçerli bir e-posta adresi giriniz.' : 
            'Please enter a valid email address.');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = currentLanguage === 'tr' ? 'Gönderiliyor...' : 'Sending...';

    const animalType = form.querySelector('#animal-type').value;
    const size = form.querySelector('#size').value;
    const age = form.querySelector('#age').value;

    // Call Pages Function API
    fetch('/api/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            animalType,
            size,
            age
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Subscription failed');
            });
        }
        return response.json();
    })
    .then(data => {
        showSuccessMessage(currentLanguage === 'tr' ? 
            'Onay e-postası gönderildi! Lütfen e-postanızı kontrol edin.' : 
            'Confirmation email sent! Please check your inbox.');
        form.reset();
    })
    .catch(error => {
        console.error('Subscription error:', error);
        showFormError(emailInput, error.message || (currentLanguage === 'tr' ? 
            'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : 
            'An error occurred. Please try again later.'));
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormError(field, message) {
    field.style.borderColor = '#e74c3c';
    let errorDiv = field.parentNode.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #e74c3c; font-size: 14px; margin-top: 4px;';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearFormError(field) {
    field.style.borderColor = '';
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background-color: #27ae60; color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; opacity: 0; transform: translateX(100px); transition: all 0.3s ease; max-width: 300px;`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===================
// SCROLL & UI EFFECTS
// ===================

function initScrollEffects(header, scrollRevealElements) {
    if (!header) return;

    const handleScroll = debounce(() => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        revealOnScroll(scrollRevealElements);
    }, 15);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    revealOnScroll(scrollRevealElements); // Initial check
}

function revealOnScroll(elements) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                if (entry.target.classList.contains('stat-number')) {
                    const targetNumber = parseInt(entry.target.textContent.replace('+', ''));
                    animateNumber(entry.target, 0, targetNumber);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(element => observer.observe(element));
}

function initSmoothScrolling(anchorLinks, header) {
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });
}

function updateActiveNavLink(navLinks) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        link.classList.toggle('active', linkPage === currentPage || (currentPage === 'index.html' && linkPage === ''));
    });
}

// ===================
// DYNAMIC CONTENT LOADING (for index.html)
// ===================

async function loadFeaturedPets(petsContainer) {
    try {
        // Show loading state
        petsContainer.innerHTML = '<div class="loading">Loading pets...</div>';
        
        // Fetch from Firebase
        const featuredPets = await CachedPetsService.getFeatured(3);
        
        if (featuredPets.length === 0) {
            petsContainer.innerHTML = '<p>No pets available at the moment.</p>';
            return;
        }
        
        petsContainer.innerHTML = featuredPets.map(pet => {
            const lang = currentLanguage;
            const ageText = `${pet.age} ${lang === 'tr' ? 'yaşında' : 'year' + (pet.age > 1 ? 's' : '')}`;
            const petType = pet.type === 'dog' ? (lang === 'tr' ? 'Köpek' : 'Dog') : (lang === 'tr' ? 'Kedi' : 'Cat');
            const petSize = pet.size === 'large' ? (lang === 'tr' ? 'Büyük' : 'Large') : 
                           (pet.size === 'medium' ? (lang === 'tr' ? 'Orta' : 'Medium') : (lang === 'tr' ? 'Küçük' : 'Small'));

            return `
                <div class="pet-card">
                    <div class="pet-image">
                        <img src="${pet.image}" alt="${pet.name}" loading="lazy">
                        ${pet.urgent ? `<span class="pet-badge urgent">${lang === 'tr' ? 'Acil' : 'Urgent'}</span>` : ''}
                        <span class="pet-badge ${pet.type.toLowerCase()}">${petType}</span>
                    </div>
                    <div class="pet-info">
                        <h3 class="pet-name">${pet.name}</h3>
                        <p class="pet-description">${pet.description.substring(0, 100)}...</p>
                        <div class="pet-details">
                            <span class="pet-age">${ageText}</span>
                            <span class="pet-size">${petSize}</span>
                        </div>
                        <a href="pet-detail.html?id=${pet.id}" class="btn btn-outline btn-sm">
                            <i class="fas fa-paw"></i>
                            <span data-tr="Daha Fazla" data-en="Learn More">${lang === 'tr' ? 'Daha Fazla' : 'Learn More'}</span>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading featured pets:', error);
        petsContainer.innerHTML = '<p class="error-message">Failed to load pets. Please try again later.</p>';
    }
}

async function loadLatestArticles(articlesContainer) {
    try {
        // Show loading state
        articlesContainer.innerHTML = '<div class="loading">Loading articles...</div>';
        
        // Fetch from Firebase
        const articlesToShow = window.innerWidth < 768 ? 2 : 3;
        const latestArticles = await CachedArticlesService.getLatest(articlesToShow);
        
        if (latestArticles.length === 0) {
            articlesContainer.innerHTML = '<p>No articles available at the moment.</p>';
            return;
        }
        
        articlesContainer.innerHTML = latestArticles.map(article => `
            <div class="mini-article">
                <h4><a href="article-detail.html?id=${article.id}">${article.title[currentLanguage]}</a></h4>
                <p>${article.summary[currentLanguage]}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesContainer.innerHTML = '<p class="error-message">Failed to load articles. Please try again later.</p>';
    }
}

// ===================
// PERFORMANCE & ASSET HANDLING
// ===================

function initImageLoading(images) {
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        }
        img.addEventListener('error', () => {
            img.classList.add('error');
            // A simple, inline SVG placeholder to avoid broken image icons
            img.src = 'data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27100%25%27%20height%3D%27100%25%27%20viewBox%3D%270%200%201%201%27%3E%3Crect%20width%3D%271%27%20height%3D%271%27%20fill%3D%27%23F7F3E7%27/%3E%3C/svg%3E';
        });
    });
}

function optimizeAnimations() {
    let ticking = false;
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    function updateOnScroll() {
        revealOnScroll(scrollRevealElements);
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// ===================
// ERROR HANDLING
// ===================

window.addEventListener('error', (e) => {
    console.error('Global JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});
