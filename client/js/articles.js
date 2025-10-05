/**
 * Articles Page JavaScript - Firebase Version
 * Handles search, filtering, view switching, and pagination with Firebase data
 */

import { CachedArticlesService } from './firebase-data-service.js';

let currentView = 'grid';
let currentSearch = '';
let currentCategory = '';
let currentSort = 'newest';
let currentPage = 1;
let articlesPerPage = 6;
let totalPages = 1;
let filteredArticles = [];
let allArticles = [];
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    initArticlesPage();
});

async function initArticlesPage() {
    console.log('📚 Initializing Articles Page with Firebase');
    
    try {
        // Wait for ArticlesService to be ready
        
        await loadArticlesFromFirebase();
        
        initSearchAndFilters();
        initViewToggle();
        initNewsletterForm();
        
        loadFeaturedArticles();
        applyFiltersAndSearch();
        
        setTimeout(() => {
            updateCategoryFilterOptions();
            updateSearchPlaceholder();
        }, 100);
        
        console.log('✅ Articles Page Initialized');
    } catch (error) {
        console.error('Error initializing articles page:', error);
        showNotification('Makaleler yüklenemedi. Lütfen sayfayı yenileyin.', 'error');
    }
}

async function loadArticlesFromFirebase() {
    try {
        allArticles = await CachedArticlesService.getAll();
        filteredArticles = [...allArticles];
        
        console.log(`Loaded ${allArticles.length} articles from Firebase`);
        
        // Log the loaded articles to inspect their structure
        console.log('All articles:', allArticles);
    } catch (error) {
        console.error('Error loading articles from Firebase:', error);
        throw error;
    }
}


function initSearchAndFilters() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', handleSortFilter);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

function handleSearchInput(e) {
    currentSearch = e.target.value.trim();
    resetToFirstPage();
    applyFiltersAndSearch();
    updateClearFiltersButton();
}

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        currentSearch = searchInput.value.trim();
        resetToFirstPage();
        applyFiltersAndSearch();
        updateClearFiltersButton();
    }
}

function handleCategoryFilter(e) {
    currentCategory = e.target.value;
    resetToFirstPage();
    applyFiltersAndSearch();
    updateClearFiltersButton();
}

function handleSortFilter(e) {
    currentSort = e.target.value;
    resetToFirstPage();
    applyFiltersAndSearch();
}

function clearAllFilters() {
    currentSearch = '';
    currentCategory = '';
    currentSort = 'newest';
    
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (sortFilter) sortFilter.value = 'newest';
    
    resetToFirstPage();
    applyFiltersAndSearch();
    updateClearFiltersButton();
    
    showNotification('Filtreler temizlendi', 'success');
}

function updateClearFiltersButton() {
    const clearFiltersBtn = document.getElementById('clear-filters');
    const hasActiveFilters = currentSearch || currentCategory || currentSort !== 'newest';
    
    if (clearFiltersBtn) {
        clearFiltersBtn.style.display = hasActiveFilters ? 'flex' : 'none';
    }
}

function resetToFirstPage() {
    currentPage = 1;
}

function applyFiltersAndSearch() {
    try {
        const currentLang = getCurrentLanguage();
        
        filteredArticles = [...allArticles];
        
        if (currentSearch) {
            filteredArticles = filteredArticles.filter(article => {
                try {
                    const title = (article.title && article.title[currentLang]) ? 
                        article.title[currentLang].toLowerCase() : '';
                    const summary = (article.summary && article.summary[currentLang]) ? 
                        article.summary[currentLang].toLowerCase() : '';
                    const category = (article.category && article.category[currentLang]) ? 
                        article.category[currentLang].toLowerCase() : '';
                    const tags = (article.tags && Array.isArray(article.tags)) ? 
                        article.tags.map(tag => 
                            (tag && tag[currentLang]) ? tag[currentLang].toLowerCase() : ''
                        ).join(' ') : '';
                    const searchTerm = currentSearch.toLowerCase();
                    
                    return title.includes(searchTerm) || 
                           summary.includes(searchTerm) || 
                           category.includes(searchTerm) ||
                           tags.includes(searchTerm);
                } catch (error) {
                    console.warn('Error filtering article:', article.id, error);
                    return false;
                }
            });
        }
        
        if (currentCategory) {
            filteredArticles = filteredArticles.filter(article => {
                try {
                    return article.category && article.category[currentLang] === currentCategory;
                } catch (error) {
                    console.warn('Error filtering by category:', article.id, error);
                    return false;
                }
            });
        }
        
        applySorting();
        calculatePagination();
        loadArticles();
        updateResultCount();
        renderPagination();
        updateEmptyState();
        
    } catch (error) {
        console.error('Error in applyFiltersAndSearch:', error);
        showNotification('Filtreleme sırasında bir hata oluştu.', 'error');
    }
}

function applySorting() {
    try {
        switch (currentSort) {
            case 'newest':
                filteredArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
                break;
            case 'oldest':
                filteredArticles.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
                break;
            case 'reading-time-asc':
                filteredArticles.sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0));
                break;
            case 'reading-time-desc':
                filteredArticles.sort((a, b) => (b.readingTime || 0) - (a.readingTime || 0));
                break;
            default:
                filteredArticles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        }
    } catch (error) {
        console.error('Error in applySorting:', error);
    }
}

function calculatePagination() {
    totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
}

function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
}

function handleViewChange(e) {
    const button = e.currentTarget;
    const view = button.dataset.view;
    
    if (view !== currentView) {
        currentView = view;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        const container = document.getElementById('articles-container');
        if (container) {
            container.className = `articles-container ${view}-view`;
        }
        
        loadArticles();
    }
}

function loadFeaturedArticles() {
    const container = document.getElementById('featured-articles-container');
    if (!container) return;
    
    try {
        const featuredArticles = allArticles.filter(article => article.featured).slice(0, 3);
        
        if (featuredArticles.length === 0) {
            const featuredSection = document.getElementById('featured-section');
            if (featuredSection) {
                featuredSection.style.display = 'none';
            }
            return;
        }
        
        const articlesHTML = featuredArticles.map(article => {
            try {
                return createFeaturedArticleCard(article);
            } catch (error) {
                console.warn('Error creating featured article card:', article.id, error);
                return '';
            }
        }).filter(html => html !== '').join('');
        
        container.innerHTML = articlesHTML;
        
        const cards = container.querySelectorAll('.featured-article-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const articleId = card.dataset.articleId;
                if (articleId) {
                    openArticle(articleId);
                }
            });
        });
    } catch (error) {
        console.error('Error loading featured articles:', error);
    }
}

function loadArticles() {
    const { currentPage, itemsPerPage, filteredArticles } = this.state;
    const container = this.elements.articlesContainer;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const articlesToShow = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div><span>Yükleniyor...</span></div>`;
    
    setTimeout(() => {
        if (articlesToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Sonuç Bulunamadı</h3>
                    <p>Seçtiğiniz filtrelere uygun makale bulunamadı.</p>
                </div>`;
        } else {
            container.innerHTML = articlesToShow.map(article => this.createArticleCard(article)).join('');
            
            // Add click handlers AFTER rendering
            const articleCards = container.querySelectorAll('.article-card');
            console.log('Found article cards:', articleCards.length);
            
            articleCards.forEach(card => {
                const articleId = card.dataset.articleId;
                console.log('Adding click handler to card:', articleId);
                
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Card clicked:', articleId);
                    console.log('Opening article:', articleId);
                    
                    // Use window.location.href for navigation
                    window.location.href = `article-detail.html?id=${articleId}`;
                });
                
                // Make the card look clickable
                card.style.cursor = 'pointer';
            });
        }
        
        this.renderPagination();
        this.updateLanguageOnRender();
    }, 250);
}

function createFeaturedArticleCard(article) {
    try {
        const currentLang = getCurrentLanguage();
        
        return `
            <div class="featured-article-card" data-article-id="${article.id}">
                <div class="article-image">
                    <img src="${article.image || ''}" alt="${(article.title && article.title[currentLang]) ? article.title[currentLang] : ''}" loading="lazy">
                    <div class="category-badge" data-tr="${(article.category && article.category.tr) ? article.category.tr : ''}" data-en="${(article.category && article.category.en) ? article.category.en : ''}">
                        ${(article.category && article.category[currentLang]) ? article.category[currentLang] : ''}
                    </div>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${(article.title && article.title[currentLang]) ? article.title[currentLang] : ''}</h3>
                    <p class="article-summary">${(article.summary && article.summary[currentLang]) ? article.summary[currentLang] : ''}</p>
                    <div class="article-meta">
                        <div class="article-date">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(article.publishDate, currentLang)}</span>
                        </div>
                        <div class="reading-time">
                            <i class="fas fa-clock"></i>
                            <span>${article.readingTime || 0} <span data-tr="dk" data-en="min">dk</span></span>
                        </div>
                    </div>
                    <div class="article-author">
                        <img src="${(article.author && article.author.avatar) ? article.author.avatar : ''}" alt="${(article.author && article.author.name) ? article.author.name : ''}" class="author-avatar" loading="lazy">
                        <div class="author-info">
                            <h4>${(article.author && article.author.name) ? article.author.name : ''}</h4>
                            <p class="author-bio">${(article.author && article.author.bio && article.author.bio[currentLang]) ? article.author.bio[currentLang] : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating featured article card:', error);
        return '';
    }
}

function createArticleCard(article) {
    const lang = this.getCurrentLanguage();
    const translated = this.translateArticleData(article, lang);
    
    const categoryName = translated.category;
    const publishDate = this.formatDate(article.publishDate, lang);
    const readingTime = article.readingTime || 5;
    const tags = article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
    
    const cardHTML = `
        <div class="article-card" data-article-id="${article.id}">
            <div class="article-image">
                <img src="${article.featuredImage}" alt="${translated.title}" loading="lazy">
                <div class="category-badge" data-tr="${article.category.tr}" data-en="${article.category.en}">
                    ${categoryName}
                </div>
            </div>
            <div class="article-content">
                <h3 class="article-title">${translated.title}</h3>
                <p class="article-summary">${translated.summary}</p>
                <div class="article-meta">
                    <div class="article-date">
                        <i class="fas fa-calendar"></i>
                        <span>${publishDate}</span>
                    </div>
                    <div class="reading-time">
                        <i class="fas fa-clock"></i>
                        <span>${readingTime} <span data-tr="dk" data-en="min">dk</span></span>
                    </div>
                </div>
                <div class="article-tags">${tags}</div>
            </div>
        </div>
    `;
    
    console.log('Created card HTML:', cardHTML);
    return cardHTML;
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    const paginationSection = document.getElementById('pagination-section');
    
    if (!paginationContainer || !paginationSection) return;
    
    if (totalPages <= 1) {
        paginationSection.style.display = 'none';
        return;
    }
    
    paginationSection.style.display = 'block';
    
    let paginationHTML = '';
    
    if (currentPage > 1) {
        paginationHTML += `
            <button class="pagination-btn prev-btn" data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
                <span data-tr="Önceki" data-en="Previous">Önceki</span>
            </button>
        `;
    }
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn page-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    if (currentPage < totalPages) {
        paginationHTML += `
            <button class="pagination-btn next-btn" data-page="${currentPage + 1}">
                <span data-tr="Sonraki" data-en="Next">Sonraki</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
    
    const paginationBtns = paginationContainer.querySelectorAll('.pagination-btn');
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', handlePaginationClick);
    });
}

function handlePaginationClick(e) {
    const button = e.currentTarget;
    const page = parseInt(button.dataset.page);
    
    if (page && page !== currentPage && page >= 1 && page <= totalPages) {
        currentPage = page;
        loadArticles();
        renderPagination();
        
        const articlesSection = document.querySelector('.articles-section');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function updateEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const articlesContainer = document.getElementById('articles-container');
    const paginationSection = document.getElementById('pagination-section');
    const newsletterSection = document.getElementById('newsletter-section');
    
    if (!emptyState || !articlesContainer) return;
    
    if (filteredArticles.length === 0) {
        emptyState.classList.remove('hidden');
        articlesContainer.style.display = 'none';
        if (paginationSection) paginationSection.style.display = 'none';
        if (newsletterSection) newsletterSection.style.display = 'block';
    } else {
        emptyState.classList.add('hidden');
        articlesContainer.style.display = currentView === 'grid' ? 'grid' : 'flex';
        if (paginationSection && totalPages > 1) {
            paginationSection.style.display = 'block';
        }
        if (newsletterSection) newsletterSection.style.display = 'block';
    }
}

function initNewsletterForm() {
    const newsletterForm = document.getElementById('articles-newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const consent = formData.get('consent');
    
    if (!email || !isValidEmail(email)) {
        showNotification('Lütfen geçerli bir e-posta adresi giriniz.', 'error');
        return;
    }
    
    if (!consent) {
        showNotification('Lütfen e-posta bildirimleri için onay veriniz.', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Kaydediliyor...</span>';
    
    setTimeout(() => {
        console.log('Newsletter subscription:', { email, consent: true });
        
        showNotification('E-posta listemize başarıyla kaydoldunuz!', 'success');
        e.target.reset();
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }, 2000);
}

function openArticle(articleId) {
    try {
        const article = allArticles.find(a => a.id === parseInt(articleId));
        
        if (article) {
            const currentLang = getCurrentLanguage();
            const title = (article.title && article.title[currentLang]) ? article.title[currentLang] : 'Makale';
            
            console.log('Opening article:', title);
            window.location.href = `article-detail.html?id=${articleId}`;
        }
    } catch (error) {
        console.error('Error opening article:', error);
        showNotification('Makale açılırken hata oluştu.', 'error');
    }
}

function getCurrentLanguage() {
    return window.currentLanguage || 'tr';
}

function updateResultCount() {
    const totalElement = document.getElementById('total-articles');
    if (totalElement) {
        totalElement.textContent = filteredArticles.length;
    }
}

function formatDate(dateString, lang = 'tr') {
    try {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', options);
    } catch (error) {
        console.warn('Error formatting date:', dateString, error);
        return dateString || '';
    }
}

function formatNumber(num) {
    try {
        const number = parseInt(num) || 0;
        if (number >= 1000000) {
            return Math.floor(number / 1000000) + 'M';
        } else if (number >= 1000) {
            return Math.floor(number / 1000) + 'K';
        }
        return number.toString();
    } catch (error) {
        console.warn('Error formatting number:', num, error);
        return '0';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
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
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
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

function handleLanguageChange() {
    try {
        loadFeaturedArticles();
        applyFiltersAndSearch();
        updateCategoryFilterOptions();
        updateSearchPlaceholder();
    } catch (error) {
        console.error('Error handling language change:', error);
    }
}

function updateSearchPlaceholder() {
    const searchInput = document.getElementById('search-input');
    const currentLang = getCurrentLanguage();
    
    if (searchInput) {
        searchInput.placeholder = currentLang === 'tr' ? 'Makale ara...' : 'Search articles...';
    }
}

function updateCategoryFilterOptions() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    try {
        const currentLang = getCurrentLanguage();
        const currentValue = categoryFilter.value;
        
        categoryFilter.innerHTML = '';
        
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.setAttribute('data-tr', 'Tüm Kategoriler');
        allOption.setAttribute('data-en', 'All Categories');
        allOption.textContent = currentLang === 'tr' ? 'Tüm Kategoriler' : 'All Categories';
        categoryFilter.appendChild(allOption);
        
        const predefinedCategories = [
            { tr: 'Sahiplendirme Rehberleri', en: 'Adoption Guides' },
            { tr: 'Toplumsal Farkındalık', en: 'Social Awareness' },
            { tr: 'Sağlık ve Tıp', en: 'Health and Medicine' },
            { tr: 'Eğitim ve Davranış', en: 'Training and Behavior' },
            { tr: 'Praktik Bilgiler', en: 'Practical Information' },
            { tr: 'Gönüllülük', en: 'Volunteering' },
            { tr: 'Mevsimsel Bakım', en: 'Seasonal Care' },
            { tr: 'Özel Durumlar', en: 'Special Cases' },
            { tr: 'Yaşam Alanları', en: 'Living Spaces' }
        ];
        
        predefinedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category[currentLang];
            option.setAttribute('data-tr', category.tr);
            option.setAttribute('data-en', category.en);
            option.textContent = category[currentLang];
            categoryFilter.appendChild(option);
        });
        
        const availableCategories = Array.from(categoryFilter.options).map(opt => opt.value);
        if (currentValue && availableCategories.includes(currentValue)) {
            categoryFilter.value = currentValue;
        }
    } catch (error) {
        console.error('Error updating category filter options:', error);
    }
}

window.addEventListener('error', (e) => {
    console.error('Articles page error:', e.error || e.message);
    
    if (e.error && e.error.message && e.error.message !== 'null') {
        showNotification('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Beklenmeyen bir hata oluştu.', 'error');
});

document.addEventListener('languageChanged', handleLanguageChange);