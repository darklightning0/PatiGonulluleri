/**
 * Article Detail Page JavaScript
 * Handles article loading, TOC generation, sharing, and interactions
 */

class ArticleDetailManager {
    constructor() {
        this.currentArticle = null;
        this.currentLang = 'tr';
        this.tocItems = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadArticleFromURL();
        this.initLanguageSupport();
    }

    bindEvents() {
        // Share buttons
        document.getElementById('share-facebook')?.addEventListener('click', () => this.shareArticle('facebook'));
        document.getElementById('share-twitter')?.addEventListener('click', () => this.shareArticle('twitter'));
        document.getElementById('share-linkedin')?.addEventListener('click', () => this.shareArticle('linkedin'));
        document.getElementById('share-whatsapp')?.addEventListener('click', () => this.shareArticle('whatsapp'));
        document.getElementById('copy-link')?.addEventListener('click', () => this.copyArticleLink());

        // Newsletter signup
        document.getElementById('sidebar-newsletter')?.addEventListener('submit', (e) => this.handleNewsletterSignup(e));

        // Scroll events for TOC
        window.addEventListener('scroll', () => this.updateTOC());
        
        // Language toggle
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLanguage(e.target.dataset.lang));
        });

        // Print functionality
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.printArticle();
            }
        });
    }

    loadArticleFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (!articleId) {
            this.showError();
            return;
        }

        this.showLoading();

        // Simulate loading delay (you can remove this in production)
        setTimeout(() => {
            const article = this.findArticle(parseInt(articleId));
            
            if (article) {
                this.loadArticle(article);
            } else {
                this.showError();
            }
        }, 500);
    }

    findArticle(id) {
        // Get article from ARTICLES_DATA
        if (typeof ARTICLES_DATA !== 'undefined') {
            return ARTICLES_DATA.find(article => article.id === id);
        }
        return null;
    }

    loadArticle(article) {
        this.currentArticle = article;
        this.hideLoading();
        
        // Update page title and meta
        this.updatePageMeta(article);
        
        // Load article content
        this.renderArticle(article);
        
        // Generate table of contents
        this.generateTOC();
        
        // Load related content
        this.loadRelatedArticles();
        
        // Update view count
        this.updateViewCount();
        
        // Add fade-in animation
        document.querySelector('.article-content').classList.add('fade-in-up');
    }

    updatePageMeta(article) {
        const title = article.title[this.currentLang];
        const summary = article.summary[this.currentLang];
        
        // Update page title
        document.title = `${title} - Pati Gönüllüleri`;
        document.getElementById('page-title').content = `${title} - Pati Gönüllüleri`;
        document.getElementById('page-description').content = summary;
        
        // Update Open Graph meta
        document.getElementById('og-title').content = title;
        document.getElementById('og-description').content = summary;
        document.getElementById('og-image').content = article.image;
        document.getElementById('og-url').content = window.location.href;
        
        // Update Twitter Card meta
        document.getElementById('twitter-title').content = title;
        document.getElementById('twitter-description').content = summary;
        document.getElementById('twitter-image').content = article.image;
        
        // Update structured data
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": summary,
            "image": article.image,
            "author": {
                "@type": "Person",
                "name": article.author.name
            },
            "publisher": {
                "@type": "Organization",
                "name": "Pati Gönüllüleri"
            },
            "datePublished": article.publishDate,
            "dateModified": article.lastUpdated || article.publishDate
        };
        
        document.getElementById('structured-data').textContent = JSON.stringify(structuredData);
    }

    renderArticle(article) {
        const lang = this.currentLang;
        
        // Update breadcrumb
        document.getElementById('article-breadcrumb-title').textContent = article.title[lang];
        
        // Update category badge
        document.getElementById('article-category').textContent = article.category[lang];
        
        // Show/hide urgent badge
        const urgentBadge = document.getElementById('urgent-badge');
        if (article.urgent) {
            urgentBadge.classList.remove('hidden');
        } else {
            urgentBadge.classList.add('hidden');
        }
        
        // Update title
        document.getElementById('article-title').textContent = article.title[lang];
        
        // Update author info
        document.getElementById('author-avatar').src = article.author.avatar;
        document.getElementById('author-avatar').alt = article.author.name;
        document.getElementById('author-name').textContent = article.author.name;
        const authorBio = typeof article.author.bio === 'object' ? article.author.bio[lang] : article.author.bio;
        document.getElementById('author-bio').textContent = authorBio;
        
        // Update article stats
        document.getElementById('publish-date').textContent = this.formatDate(article.publishDate);
        document.getElementById('reading-time').textContent = `${article.readingTime} dk`;
        document.getElementById('view-count').textContent = this.formatNumber(article.views);
        
        // Show/hide updated date
        if (article.lastUpdated && article.lastUpdated !== article.publishDate) {
            document.getElementById('last-updated').style.display = 'flex';
            document.getElementById('updated-date').textContent = this.formatDate(article.lastUpdated);
        }
        
        // Update article image
        const articleImage = document.getElementById('article-image');
        articleImage.src = article.image;
        articleImage.alt = article.title[lang];
        
        // Update article content
        document.getElementById('article-content').innerHTML = article.content[lang];
        
        // Update tags
        this.renderTags(article.tags);
        
        // Update sources
        if (article.sources && article.sources.length > 0) {
            this.renderSources(article.sources);
            document.getElementById('sources-section').style.display = 'block';
        } else {
            document.getElementById('sources-section').style.display = 'none';
        }
        
        // Update author card
        document.getElementById('author-card-avatar').src = article.author.avatar;
        document.getElementById('author-card-avatar').alt = article.author.name;
        document.getElementById('author-card-name').textContent = article.author.name;
        document.getElementById('author-card-bio').textContent = authorBio;
        
        const authorCredentials = typeof article.author.credentials === 'object' ? article.author.credentials[lang] : article.author.credentials;
        document.getElementById('author-credentials').textContent = authorCredentials || '';
        
        // Update author social links
        this.renderAuthorSocial(article.author.social);
    }

    renderTags(tags) {
        const tagsContainer = document.getElementById('article-tags');
        tagsContainer.innerHTML = '';
        
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'article-tag';
            const tagText = typeof tag === 'object' ? tag[this.currentLang] : tag;
            tagElement.textContent = tagText;
            tagElement.addEventListener('click', () => this.searchByTag(tagText));
            tagsContainer.appendChild(tagElement);
        });
    }

    renderSources(sources) {
        const sourcesContainer = document.getElementById('sources-list');
        sourcesContainer.innerHTML = '';
        
        sources.forEach(source => {
            const sourceElement = document.createElement('div');
            sourceElement.className = 'source-item';
            
            const iconClass = this.getSourceIcon(source.type);
            
            sourceElement.innerHTML = `
                <div class="source-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="source-content">
                    <div class="source-title">${source.title}</div>
                    <a href="${source.url}" class="source-link" target="_blank" rel="noopener noreferrer">${this.truncateUrl(source.url)}</a>
                </div>
            `;
            
            sourcesContainer.appendChild(sourceElement);
        });
    }

    renderAuthorSocial(social) {
        const socialContainer = document.getElementById('author-social');
        socialContainer.innerHTML = '';
        
        if (!social) return;
        
        if (social.linkedin) {
            socialContainer.innerHTML += `<a href="${social.linkedin}" class="linkedin" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin-in"></i></a>`;
        }
        
        if (social.twitter) {
            socialContainer.innerHTML += `<a href="${social.twitter}" class="twitter" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a>`;
        }
    }

    generateTOC() {
        const content = document.getElementById('article-content');
        const headings = content.querySelectorAll('h2, h3, h4');
        const tocContainer = document.getElementById('table-of-contents');
        
        if (headings.length === 0) {
            tocContainer.innerHTML = '<p>İçerik başlığı bulunamadı</p>';
            return;
        }
        
        let tocHTML = '<ul>';
        this.tocItems = [];
        
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent;
            
            heading.id = id;
            this.tocItems.push({ id, level, text, element: heading });
            
            const levelClass = `toc-level-${level}`;
            tocHTML += `<li><a href="#${id}" class="toc-link ${levelClass}">${text}</a></li>`;
        });
        
        tocHTML += '</ul>';
        tocContainer.innerHTML = tocHTML;
        
        // Bind TOC click events
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToHeading(targetId);
            });
        });
    }

    scrollToHeading(headingId) {
        const element = document.getElementById(headingId);
        if (element) {
            const offset = 120; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    updateTOC() {
        if (this.tocItems.length === 0) return;
        
        const scrollPosition = window.scrollY + 150;
        let activeIndex = -1;
        
        this.tocItems.forEach((item, index) => {
            const rect = item.element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            
            if (scrollPosition >= elementTop) {
                activeIndex = index;
            }
        });
        
        // Update active TOC link
        document.querySelectorAll('.toc-link').forEach((link, index) => {
            if (index === activeIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    loadRelatedArticles() {
        if (!this.currentArticle) {
            document.getElementById('similar-articles-section').style.display = 'none';
            return;
        }

        const relatedContainer = document.getElementById('similar-articles-grid');
        
        if (typeof ARTICLES_DATA === 'undefined') {
            document.getElementById('similar-articles-section').style.display = 'none';
            return;
        }

        // Find similar articles based on tag matching
        const similarArticles = this.findSimilarArticles(this.currentArticle);

        if (similarArticles.length === 0) {
            document.getElementById('similar-articles-section').style.display = 'none';
            return;
        }

        // Display 3-6 articles depending on available matches
        const displayCount = Math.min(6, Math.max(3, similarArticles.length));
        const articlesToShow = similarArticles.slice(0, displayCount);

        relatedContainer.innerHTML = articlesToShow.map(article => {
            const title = article.title[this.currentLang];
            const category = article.category[this.currentLang];
            return `
                <div class="similar-article-card">
                    <img src="${article.image}" alt="${title}" class="similar-article-card-image">
                    <div class="similar-article-card-content">
                        <span class="similar-article-card-category">${category}</span>
                        <a href="article-detail.html?id=${article.id}" class="similar-article-card-title">${title}</a>
                        <div class="similar-article-card-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${this.formatDate(article.publishDate)}</span>
                            <span><i class="fas fa-clock"></i> ${article.readingTime} dk</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('similar-articles-section').style.display = 'block';
    }

    findSimilarArticles(currentArticle) {
        // Get current article tags (handle both object and string formats)
        const currentTags = currentArticle.tags.map(tag => 
            typeof tag === 'object' ? tag[this.currentLang].toLowerCase() : tag.toLowerCase()
        );

        // Score all other articles based on tag matches
        const scoredArticles = ARTICLES_DATA
            .filter(article => article.id !== currentArticle.id) // Exclude current article
            .map(article => {
                const articleTags = article.tags.map(tag => 
                    typeof tag === 'object' ? tag[this.currentLang].toLowerCase() : tag.toLowerCase()
                );
                
                // Count matching tags
                const matchCount = articleTags.filter(tag => 
                    currentTags.includes(tag)
                ).length;

                return {
                    article: article,
                    matchCount: matchCount,
                    publishDate: new Date(article.publishDate)
                };
            })
            .filter(item => item.matchCount > 0) // Only articles with at least 1 matching tag
            .sort((a, b) => {
                // Sort by match count (descending), then by date (newest first)
                if (b.matchCount !== a.matchCount) {
                    return b.matchCount - a.matchCount;
                }
                return b.publishDate - a.publishDate;
            });

        return scoredArticles.map(item => item.article);
    }

    shareArticle(platform) {
        if (!this.currentArticle) return;
        
        const title = this.currentArticle.title[this.currentLang];
        const url = window.location.href;
        
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    async copyArticleLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.showNotification('Bağlantı kopyalandı!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showNotification('Bağlantı kopyalandı!', 'success');
            } catch (err) {
                this.showNotification('Bağlantı kopyalanamadı', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    handleNewsletterSignup(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Geçerli bir e-posta adresi girin', 'error');
            return;
        }
        
        // Simulate API call
        this.showNotification('Abone olunuyor...', 'info');
        
        setTimeout(() => {
            this.showNotification('Başarıyla abone oldunuz!', 'success');
            e.target.reset();
        }, 1500);
    }

    updateViewCount() {
        // In a real application, this would make an API call to increment view count
        // For now, just display the current count
        if (this.currentArticle) {
            document.getElementById('view-count').textContent = this.formatNumber(this.currentArticle.views);
        }
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        
        // Update language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update all translatable elements
        document.querySelectorAll('[data-tr]').forEach(element => {
            const key = lang === 'tr' ? 'data-tr' : 'data-en';
            const translation = element.getAttribute(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Reload article content if article is loaded
        if (this.currentArticle) {
            this.renderArticle(this.currentArticle);
            this.generateTOC();
            this.loadRelatedArticles();
        }
    }

    initLanguageSupport() {
        // Set initial language to Turkish
        this.switchLanguage('tr');
    }

    // Utility Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return date.toLocaleDateString(this.currentLang === 'tr' ? 'tr-TR' : 'en-US', options);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    truncateUrl(url) {
        if (url.length > 40) {
            return url.substring(0, 37) + '...';
        }
        return url;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getSourceIcon(type) {
        switch (type) {
            case 'website':
                return 'fas fa-globe';
            case 'academic':
            case 'research':
                return 'fas fa-microscope';
            case 'book':
                return 'fas fa-book';
            case 'journal':
                return 'fas fa-newspaper';
            case 'professional':
                return 'fas fa-user-tie';
            case 'legal':
                return 'fas fa-gavel';
            default:
                return 'fas fa-link';
        }
    }

    searchByTag(tag) {
        // Redirect to articles page with tag filter
        window.location.href = `makaleler.html?tag=${encodeURIComponent(tag)}`;
    }

    printArticle() {
        window.print();
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
        document.querySelector('.article-container').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
        document.querySelector('.article-container').style.display = 'block';
    }

    showError() {
        this.hideLoading();
        document.getElementById('error-state').classList.remove('hidden');
        document.querySelector('.article-container').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'exclamation-circle';
            case 'warning':
                return 'exclamation-triangle';
            default:
                return 'info-circle';
        }
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success':
                return '#10b981';
            case 'error':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            default:
                return '#3b82f6';
        }
    }
}

// Initialize the article detail manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArticleDetailManager();
});

// Add notification animation styles
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Inject notification styles
if (!document.getElementById('notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}