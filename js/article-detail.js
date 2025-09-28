document.addEventListener('DOMContentLoaded', () => {
    let currentArticle = null;

    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id'));

        if (!articleId || typeof ARTICLES_DATA === 'undefined') {
            displayError('Makale verileri yüklenemedi.');
            return;
        }

        currentArticle = ARTICLES_DATA.find(article => article.id === articleId);

        if (!currentArticle) {
            displayError('Makale bulunamadı.');
            return;
        }

        populateArticleContent();
        loadRelatedArticles();
        setupShareButtons();
    }

    function displayError(message) {
        const content = document.querySelector('.article-content');
        if (content) {
            content.innerHTML = `<h1 class="article-title-main">${message}</h1>`;
        }
        document.querySelector('.article-sidebar').style.display = 'none';
    }

    function populateArticleContent() {
        const lang = getCurrentLanguage();

        // Update head
        document.title = `${currentArticle.title[lang]} - Pati Gönüllüleri`;
        document.querySelector('meta[name="description"]').content = currentArticle.summary[lang];

        // Hero and Header
        document.getElementById('article-hero-image').src = currentArticle.image;
        document.getElementById('article-hero-image').alt = currentArticle.title[lang];
        document.getElementById('article-category').textContent = currentArticle.category[lang];
        document.getElementById('article-title').textContent = currentArticle.title[lang];
        
        // Meta
        document.getElementById('article-author-meta').textContent = `Yazar: ${currentArticle.author.name}`;
        document.getElementById('article-date').textContent = new Date(currentArticle.publishDate).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('article-read-time').textContent = `${currentArticle.readingTime} dk okuma`;

        // Body Content
        document.getElementById('article-body').innerHTML = currentArticle.content[lang] || "<p>İçerik yakında eklenecektir.</p>";
        
        // Sources
        const sourcesContainer = document.getElementById('article-sources');
        const sourcesList = document.getElementById('sources-list');
        if (currentArticle.sources && currentArticle.sources.length > 0) {
            sourcesList.innerHTML = currentArticle.sources.map(source => `<li><a href="${source.url}" target="_blank" rel="noopener">${source.title}</a></li>`).join('');
            sourcesContainer.classList.remove('hidden');
        }


        // Author Box
        document.getElementById('author-avatar').src = currentArticle.author.avatar;
        document.getElementById('author-avatar').alt = currentArticle.author.name;
        document.getElementById('author-name').textContent = currentArticle.author.name;
        document.getElementById('author-bio').textContent = currentArticle.author.bio[lang];
    }

    function loadRelatedArticles() {
        const relatedGrid = document.getElementById('related-articles-grid');
        const lang = getCurrentLanguage();

        const related = ARTICLES_DATA.filter(
            article => article.category[lang] === currentArticle.category[lang] && article.id !== currentArticle.id
        ).slice(0, 3);

        if (related.length === 0) {
            relatedGrid.style.display = 'none';
            return;
        }
        
        relatedGrid.innerHTML = related.map(article => createArticleCard(article, lang)).join('');
    }
    
    // Re-using the card from articles.js
    function createArticleCard(article, lang) {
         return `
            <a href="article-detail.html?id=${article.id}" class="article-card">
                <div class="article-image">
                    <img src="${article.image}" alt="${article.title[lang]}">
                </div>
                <div class="article-content">
                    <span class="category-badge">${article.category[lang]}</span>
                    <h3 class="article-title">${article.title[lang]}</h3>
                    <div class="article-meta">
                        <span>${new Date(article.publishDate).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</span>
                        <span>•</span>
                        <span>${article.readingTime} dk okuma</span>
                    </div>
                </div>
            </a>
        `;
    }

    function setupShareButtons() {
        const pageUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(currentArticle.title[getCurrentLanguage()]);

        document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
        document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
        document.getElementById('share-whatsapp').href = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
        
        const copyBtn = document.getElementById('copy-link-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const span = copyBtn.querySelector('span');
                const originalText = span.textContent;
                span.textContent = "Kopyalandı!";
                setTimeout(() => {
                    span.textContent = originalText;
                }, 2000);
            });
        });
    }
    
    function getCurrentLanguage() {
        return window.currentLanguage || 'tr';
    }

    init();
});
