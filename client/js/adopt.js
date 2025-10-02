/**
 * Sahiplen (Adopt) Page JavaScript - Refactored
 * Handles filtering, sorting, pagination, and pet card generation in a structured and performant way.
 */

// Encapsulate all functionality in a single object to avoid global scope pollution.
const AdoptPageApp = {
    // 1. STATE MANAGEMENT: Central place for all dynamic data.
    state: {
        allPets: [],
        filteredPets: [],
        currentFilters: {
            animalType: [],
            age: [],
            size: [],
            gender: [],
            health: []
        },
        currentSort: 'newest',
        currentView: 'grid',
        currentPage: 1,
        itemsPerPage: 6,
    },

    // 2. DOM ELEMENT CACHING: Query elements once for better performance.
    elements: {},

    // 3. INITIALIZATION: Main entry point for the script.
    init() {
        console.log('🐾 Initializing Adopt Page App');
        if (typeof PETS_DATA === 'undefined') {
            this.showNotification('Hayvan verileri yüklenemedi. Lütfen sayfayı yenileyin.', 'error');
            console.error('PETS_DATA not found.');
            return;
        }

        // Set initial state from the global data source.
        this.state.allPets = [...PETS_DATA];
        this.state.filteredPets = [...this.state.allPets];

        this.cacheDOMElements();
        this.bindEvents();

        // **LANGUAGE BUG FIX**: Delay the initial render slightly.
        // This pushes the first render to the back of the event queue, giving
        // main.js enough time to load the language preference from localStorage
        // and set the global `window.currentLanguage` variable.
        setTimeout(() => {
            this.updateFilterCounts();
            this.applyFiltersAndSort(); // This triggers the first render.
            this.initMobileFilters();
            console.log('✅ Adopt Page App Initialized');
        }, 0); 
    },

    // Query all necessary DOM elements once and store them.
    cacheDOMElements() {
        this.elements.petsContainer = document.getElementById('pets-container');
        this.elements.totalPets = document.getElementById('total-pets');
        this.elements.filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
        this.elements.clearFiltersBtn = document.querySelector('.clear-filters-btn');
        this.elements.sortSelect = document.getElementById('sort-select');
        this.elements.viewButtons = document.querySelectorAll('.view-btn');
        this.elements.paginationContainer = document.querySelector('.pagination');
        this.elements.filtersSidebar = document.querySelector('.filters-sidebar');
        this.elements.filtersContainer = document.querySelector('.filters-container');
    },

    // Set up all event listeners for the page.
    bindEvents() {
        this.elements.filterCheckboxes.forEach(checkbox => checkbox.addEventListener('change', this.handleFilterChange.bind(this)));
        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.addEventListener('click', this.clearAllFilters.bind(this));
        }
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }
        this.elements.viewButtons.forEach(btn => btn.addEventListener('click', this.handleViewChange.bind(this)));
        if(this.elements.petsContainer) {
            this.elements.petsContainer.addEventListener('click', this.handlePetCardClick.bind(this));
        }
        document.addEventListener('languageChanged', this.handleLanguageChange.bind(this));
    },
    
    // 4. EVENT HANDLERS: Logic for user interactions.
    handleLanguageChange() {
        console.log('Language changed, re-rendering pets...');
        this.applyFiltersAndSort(); // Re-run the main render process.
        this.updateFilterCounts(); // Update text on filter counts.
        this.updateMobileToggleText(); // Update mobile filter button text.
    },

    handlePetCardClick(e) {
        const petCard = e.target.closest('.adopt-pet-card');
        if (petCard && petCard.dataset.petId) {
            window.location.href = `pet-detail.html?id=${petCard.dataset.petId}`;
        }
    },

    handleFilterChange(e) {
        const { name: filterType, value: filterValue, checked } = e.target;
        
        if (filterValue === 'all') {
            if (checked) {
                this.state.currentFilters[filterType] = [];
                document.querySelectorAll(`input[name="${filterType}"]:not([value="all"])`).forEach(cb => cb.checked = false);
            }
        } else {
            this.state.currentFilters[filterType] = checked
                ? [...this.state.currentFilters[filterType], filterValue]
                : this.state.currentFilters[filterType].filter(val => val !== filterValue);
            document.querySelector(`input[name="${filterType}"][value="all"]`).checked = this.state.currentFilters[filterType].length === 0;
        }

        this.resetPagination();
        this.applyFiltersAndSort();
    },

    clearAllFilters() {
        Object.keys(this.state.currentFilters).forEach(key => this.state.currentFilters[key] = []);
        this.elements.filterCheckboxes.forEach(cb => cb.checked = cb.value === 'all');
        this.state.currentSort = 'newest';
        if (this.elements.sortSelect) this.elements.sortSelect.value = 'newest';
        this.resetPagination();
        this.applyFiltersAndSort();
        this.showNotification('Filtreler temizlendi', 'success');
    },

    handleSortChange(e) {
        this.state.currentSort = e.target.value;
        this.resetPagination();
        this.applyFiltersAndSort();
    },

    handleViewChange(e) {
        const view = e.currentTarget.dataset.view;
        if (view === this.state.currentView) return;
        
        this.state.currentView = view;
        this.elements.viewButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
        this.elements.petsContainer.className = `pets-container ${view}-view`;
        this.renderPets();
    },
    
    // 5. CORE LOGIC: Filtering, sorting, and rendering.
    applyFiltersAndSort() {
        const { animalType, age, size, gender, health } = this.state.currentFilters;

        let filtered = this.state.allPets.filter(pet => 
            (animalType.length === 0 || animalType.includes(pet.type)) &&
            (age.length === 0 || age.includes(pet.ageGroup)) &&
            (size.length === 0 || size.includes(pet.size)) &&
            (gender.length === 0 || gender.includes(pet.gender)) &&
            (health.length === 0 || health.every(h => pet.health.includes(h)))
        );

        this.state.filteredPets = this.applySorting(filtered);
        this.renderPets();
        this.updateResultCount();
    },

    applySorting(pets) {
        return [...pets].sort((a, b) => {
            switch (this.state.currentSort) {
                case 'oldest': return new Date(a.dateAdded) - new Date(b.dateAdded);
                case 'name-asc': return a.name.localeCompare(b.name, 'tr');
                case 'name-desc': return b.name.localeCompare(a.name, 'tr');
                case 'newest':
                default: return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
    },

    // 6. RENDERING: Updating the DOM.
    renderPets() {
        const { currentPage, itemsPerPage, filteredPets, currentView } = this.state;
        const container = this.elements.petsContainer;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const petsToShow = filteredPets.slice(startIndex, startIndex + itemsPerPage);

        container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div><span>Yükleniyor...</span></div>`;
        
        // Use a short timeout to allow the loading spinner to render before the main work.
        setTimeout(() => {
            if (petsToShow.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3 data-tr="Sonuç Bulunamadı" data-en="No Results Found"></h3>
                        <p data-tr="Seçtiğiniz filtrelere uygun hayvan bulunamadı. Lütfen filtrelerinizi genişletmeyi deneyin." data-en="No animals found matching your selected filters. Please try broadening your filters."></p>
                    </div>`;
            } else {
                container.innerHTML = petsToShow.map(pet => this.createPetCard(pet, currentView)).join('');
            }
            this.renderPagination();
            this.updateLanguageOnRender(); // Ensure all new text is in the correct language.
        }, 250);
    },

    createPetCard(pet, view) {
        const lang = this.getCurrentLanguage();
        const translated = this.translatePetData(pet, lang);
        const urgentBadge = pet.urgent ? `<div class="pet-urgent-badge" data-tr="ACİL" data-en="URGENT"></div>` : '';
        const healthTags = pet.health.map(h => `<span class="pet-tag">${this.translateHealth(h, lang)}</span>`).join('');
        const date = new Date(pet.dateAdded).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const imageHTML = `
            <div class="pet-card-image">
                <img src="${pet.image}" alt="${pet.name}" loading="lazy">
                ${urgentBadge}
                <div class="pet-type-badge">${translated.type}</div>
            </div>`;
        
        const detailsHTML = `
            <div class="pet-detail-item"><i class="fas fa-birthday-cake"></i><span data-tr="${pet.age} yaşında" data-en="${pet.age} years old"></span></div>
            <div class="pet-detail-item"><i class="fas fa-ruler-vertical"></i><span>${translated.size}</span></div>
            <div class="pet-detail-item"><i class="fas fa-venus-mars"></i><span>${translated.gender}</span></div>
            <div class="pet-detail-item"><i class="fas fa-map-marker-alt"></i><span>${pet.location}</span></div>`;

        if (view === 'grid') {
            return `
                <div class="adopt-pet-card" data-pet-id="${pet.id}">
                    ${imageHTML}
                    <div class="pet-card-content">
                        <div class="pet-card-header">
                            <h3 class="pet-card-name">${pet.name}</h3>
                            <div class="pet-card-breed">${translated.breed}</div>
                        </div>
                        <p class="pet-card-description">${translated.description}</p>
                        <div class="pet-card-details">${detailsHTML}</div>
                        <div class="pet-card-tags">${healthTags}</div>
                        <div class="pet-card-footer">
                            <div class="pet-date">${date}</div>
                            <a href="#" class="pet-card-btn" data-tr="İncele" data-en="View Details"></a>
                        </div>
                    </div>
                </div>`;
        } else { // List View
            return `
                <div class="adopt-pet-card" data-pet-id="${pet.id}">
                    ${imageHTML}
                    <div class="pet-card-content">
                        <div class="pet-card-main">
                            <div class="pet-card-header"><h3 class="pet-card-name">${pet.name}</h3><div class="pet-card-breed">${translated.breed}</div></div>
                            <div class="pet-card-details">${detailsHTML}</div>
                            <div class="pet-card-tags">${healthTags}</div>
                        </div>
                        <div class="pet-card-side">
                            <div class="pet-date">${date}</div>
                            <a href="#" class="pet-card-btn" data-tr="İncele" data-en="View Details"></a>
                        </div>
                    </div>
                </div>`;
        }
    },

    renderPagination() {
        const totalPages = Math.ceil(this.state.filteredPets.length / this.state.itemsPerPage);
        const container = this.elements.paginationContainer;
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        const createButton = (content, page, isDisabled = false, classes = []) => {
            const btn = document.createElement('button');
            btn.className = `page-btn ${classes.join(' ')}`.trim();
            btn.innerHTML = content;
            btn.dataset.page = page;
            btn.disabled = isDisabled;
            btn.addEventListener('click', e => {
                this.state.currentPage = parseInt(e.currentTarget.dataset.page);
                this.renderPets();
                this.elements.petsContainer.scrollIntoView({ behavior: 'smooth' });
            });
            return btn;
        };
        
        container.innerHTML = '';
        const lang = this.getCurrentLanguage();
        
        container.appendChild(createButton(`<i class="fas fa-chevron-left"></i> <span data-tr="Önceki" data-en="Previous"></span>`, this.state.currentPage - 1, this.state.currentPage === 1, ['prev-btn']));
        
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.className = 'page-numbers';
        // Simplified pagination for clarity
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = createButton(i, i, false, ['page-number']);
            if (i === this.state.currentPage) pageBtn.classList.add('active');
            pageNumbersContainer.appendChild(pageBtn);
        }
        container.appendChild(pageNumbersContainer);
        
        container.appendChild(createButton(`<span data-tr="Sonraki" data-en="Next"></span> <i class="fas fa-chevron-right"></i>`, this.state.currentPage + 1, this.state.currentPage === totalPages, ['next-btn']));
    },
    
    // 7. UTILITY & HELPER FUNCTIONS.
    updateResultCount() {
        if (this.elements.totalPets) {
            this.elements.totalPets.textContent = this.state.filteredPets.length;
        }
    },

    resetPagination() {
        this.state.currentPage = 1;
    },

    updateFilterCounts() {
        const counts = this.state.allPets.reduce((acc, pet) => {
            acc.animalType[pet.type] = (acc.animalType[pet.type] || 0) + 1;
            acc.age[pet.ageGroup] = (acc.age[pet.ageGroup] || 0) + 1;
            acc.size[pet.size] = (acc.size[pet.size] || 0) + 1;
            acc.gender[pet.gender] = (acc.gender[pet.gender] || 0) + 1;
            pet.health.forEach(h => acc.health[h] = (acc.health[h] || 0) + 1);
            return acc;
        }, { animalType: {}, age: {}, size: {}, gender: {}, health: {} });

        this.elements.filterCheckboxes.forEach(cb => {
            const { name, value } = cb;
            const countSpan = cb.parentElement.querySelector('.count');
            if (!countSpan) return;
            countSpan.textContent = `(${(counts[name]?.[value]) || (value === 'all' ? this.state.allPets.length : 0)})`;
        });
    },
    
    initMobileFilters() {
        const { filtersSidebar, filtersContainer } = this.elements;
        if (!filtersSidebar || !filtersContainer) return;

        let toggleButton = filtersSidebar.querySelector('.filters-toggle');
        const shouldHaveToggle = window.innerWidth <= 768;

        if (shouldHaveToggle && !toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.className = 'filters-toggle';
            filtersSidebar.insertBefore(toggleButton, filtersContainer);
            filtersContainer.classList.add('collapsed');
            toggleButton.addEventListener('click', () => {
                filtersContainer.classList.toggle('collapsed');
                toggleButton.classList.toggle('active');
                this.updateMobileToggleText();
            });
        } else if (!shouldHaveToggle && toggleButton) {
            toggleButton.remove();
            filtersContainer.classList.remove('collapsed');
        }
        if (toggleButton) this.updateMobileToggleText();
    },
    
    updateMobileToggleText() {
        const toggleButton = this.elements.filtersSidebar?.querySelector('.filters-toggle');
        if (!toggleButton) return;
        const lang = this.getCurrentLanguage();
        const isCollapsed = this.elements.filtersContainer.classList.contains('collapsed');
        const text = isCollapsed ? (lang === 'tr' ? 'Filtreleri Göster' : 'Show Filters') : (lang === 'tr' ? 'Filtreleri Gizle' : 'Hide Filters');
        const icon = isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up';
        toggleButton.innerHTML = `<span>${text}</span> <i class="fas ${icon}"></i>`;
    },

    getCurrentLanguage() {
        return window.currentLanguage || 'tr';
    },

    updateLanguageOnRender() {
        const lang = this.getCurrentLanguage();
        this.elements.petsContainer.querySelectorAll('[data-tr][data-en]').forEach(el => {
            el.textContent = el.dataset[lang];
        });
        this.elements.paginationContainer.querySelectorAll('[data-tr][data-en]').forEach(el => {
            el.textContent = el.dataset[lang];
        });
    },

    translatePetData(pet, lang) {
        const translations = {
            type: { dog: { tr: 'Köpek', en: 'Dog' }, cat: { tr: 'Kedi', en: 'Cat' }, other: { tr: 'Diğer', en: 'Other' } },
            size: { small: { tr: 'Küçük', en: 'Small' }, medium: { tr: 'Orta', en: 'Medium' }, large: { tr: 'Büyük', en: 'Large' } },
            gender: { male: { tr: 'Erkek', en: 'Male' }, female: { tr: 'Dişi', en: 'Female' } }
        };
        return {
            type: (translations.type[pet.type] || {})[lang] || pet.type,
            size: (translations.size[pet.size] || {})[lang] || pet.size,
            gender: (translations.gender[pet.gender] || {})[lang] || pet.gender,
            breed: pet.breed,
            description: pet.description.substring(0, 100) + '...',
        };
    },

    translateHealth(health, lang) {
        const translations = {
            vaccinated: { tr: 'Aşılı', en: 'Vaccinated' },
            sterilized: { tr: 'Kısırlaştırılmış', en: 'Sterilized' },
            microchipped: { tr: 'Çipli', en: 'Microchipped' }
        };
        return (translations[health] || {})[lang] || health;
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 1rem; background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'}; color: white; border-radius: 8px; z-index: 1001; transition: all 0.5s ease-out; opacity: 0; transform: translateX(100%);`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 500);
        }, 3500);
    },
};

// Start the application once the DOM is ready.
document.addEventListener('DOMContentLoaded', () => AdoptPageApp.init());

