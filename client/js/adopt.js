/**
 * Sahiplen (Adopt) Page JavaScript - Firebase Version
 * Handles filtering, sorting, pagination, and a responsive accordion layout for filters on mobile.
 */
import { CachedPetsService } from './firebase-data-service.js';

const PET_TRANSLATIONS = {
    type: { 
        'köpek': { tr: 'Köpek', en: 'Dog' }, 'dog': { tr: 'Köpek', en: 'Dog' },
        'kedi': { tr: 'Kedi', en: 'Cat' }, 'cat': { tr: 'Kedi', en: 'Cat' },
        'diğer': { tr: 'Diğer', en: 'Other' }, 'other': { tr: 'Diğer', en: 'Other' }
    },
    size: { 
        'küçük': { tr: 'Küçük', en: 'Small' }, 'small': { tr: 'Küçük', en: 'Small' },
        'orta': { tr: 'Orta', en: 'Medium' }, 'medium': { tr: 'Orta', en: 'Medium' },
        'büyük': { tr: 'Büyük', en: 'Large' }, 'large': { tr: 'Büyük', en: 'Large' }
    },
    gender: { 
        'erkek': { tr: 'Erkek', en: 'Male' }, 'male': { tr: 'Erkek', en: 'Male' },
        'dişi': { tr: 'Dişi', en: 'Female' }, 'female': { tr: 'Dişi', en: 'Female' },
        'belirtilmemiş': { tr: 'Belirtilmemiş', en: 'Unspecified' }, 'unspecified': { tr: 'Belirtilmemiş', en: 'Unspecified' }
    }
};

const AdoptPageApp = {
    state: {
        allPets: [],
        filteredPets: [],
        currentFilters: { animalType: [], age: [], size: [], gender: [], health: [] },
        currentSort: 'newest',
        currentView: 'grid',
        currentPage: 1,
        itemsPerPage: 6,
        isLoading: true,
        isMobileLayout: false // Track current layout to avoid redundant DOM changes
    },

    elements: {},

    async init() {
        console.log('🐾 Initializing Adopt Page App');
        this.cacheDOMElements();
        this.bindEvents();
        this.setupResponsiveLayout(); // Set up the initial layout based on screen size

        this.showLoadingState();
        try {
            await this.loadPetsFromFirebase();
            setTimeout(() => {
                this.updateFilterCounts();
                this.applyFiltersAndSort();
                console.log('✅ Adopt Page App Initialized');
            }, 100);
        } catch (error) {
            console.error('Error initializing adopt page:', error);
            this.showErrorState('Hayvan verileri yüklenemedi. Lütfen sayfayı yenileyin.');
        }
    },
    
    // --- RESPONSIVE LAYOUT HANDLING ---

    // Utility to prevent the resize event from firing too often
    debounce(func, delay = 250) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    },
    
    // Sets up the initial layout and adds a resize listener
    setupResponsiveLayout() {
        const checkLayout = () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile !== this.state.isMobileLayout) {
                this.toggleLayout(isMobile);
                this.state.isMobileLayout = isMobile;
            }
        };
        checkLayout(); // Run on initial load
        window.addEventListener('resize', this.debounce(checkLayout));
    },

    // Moves the filter container and creates/destroys the toggle button
    toggleLayout(isMobile) {
        const { filtersContainer, filtersSidebar, sortControls, mainContent } = this.elements;
        let toggleButton = document.querySelector('.filters-toggle');

        if (isMobile) {
            // --- Switch to Mobile Layout (Accordion) ---
            if (!toggleButton) {
                toggleButton = document.createElement('button');
                toggleButton.className = 'filters-toggle';
                toggleButton.addEventListener('click', () => {
                    filtersContainer.classList.toggle('collapsed');
                    toggleButton.classList.toggle('active');
                    this.updateMobileToggleText();
                });
                sortControls.insertAdjacentElement('afterend', toggleButton);
            }

            // Move the filter container from the sidebar to the main content area
            mainContent.insertBefore(filtersContainer, toggleButton.nextSibling);
            filtersContainer.classList.add('collapsed');
            this.updateMobileToggleText();

        } else {
            // --- Switch to Desktop Layout (Sidebar) ---
            if (toggleButton) {
                toggleButton.remove();
            }
            // Move the filter container back to its original sidebar position
            filtersSidebar.appendChild(filtersContainer);
            filtersContainer.classList.remove('collapsed');
        }
    },

    // Updates the text and icon of the mobile filter button
    updateMobileToggleText() {
        const toggleButton = document.querySelector('.filters-toggle');
        if (!toggleButton) return;

        const isCollapsed = this.elements.filtersContainer.classList.contains('collapsed');
        const lang = this.getCurrentLanguage();
        const text = isCollapsed ? (lang === 'tr' ? 'Filtreleri Göster' : 'Show Filters') : (lang === 'tr' ? 'Filtreleri Gizle' : 'Hide Filters');
        const icon = isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up';
        
        toggleButton.innerHTML = `<span>${text}</span> <i class="fas ${icon}"></i>`;
    },

    // --- CORE APP LOGIC ---

    async loadPetsFromFirebase() {
        try {
            this.state.allPets = await CachedPetsService.getAll();
            this.state.filteredPets = [...this.state.allPets];
            this.state.isLoading = false;
        } catch (error) {
            console.error('Error loading pets from Firebase:', error);
            this.state.isLoading = false;
            throw error;
        }
    },

    showLoadingState() {
        if (this.elements.petsContainer) {
            this.elements.petsContainer.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div><span>Hayvanlar yükleniyor...</span></div>`;
        }
    },

    showErrorState(message) {
         if (this.elements.petsContainer) {
            this.elements.petsContainer.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><h3>Hata</h3><p>${message}</p></div>`;
        }
    },

    cacheDOMElements() {
        this.elements = {
            petsContainer: document.getElementById('pets-container'),
            totalPets: document.getElementById('total-pets'),
            filterCheckboxes: document.querySelectorAll('.filter-option input[type="checkbox"]'),
            clearFiltersBtn: document.querySelector('.clear-filters-btn'),
            sortSelect: document.getElementById('sort-select'),
            sortControls: document.querySelector('.sort-controls'),
            viewButtons: document.querySelectorAll('.view-btn'),
            paginationContainer: document.querySelector('.pagination'),
            filtersSidebar: document.querySelector('.filters-sidebar'),
            filtersContainer: document.querySelector('.filters-container'),
            mainContent: document.querySelector('.main-content')
        };
    },

    bindEvents() {
        this.elements.filterCheckboxes.forEach(cb => cb.addEventListener('change', this.handleFilterChange.bind(this)));
        if (this.elements.clearFiltersBtn) this.elements.clearFiltersBtn.addEventListener('click', this.clearAllFilters.bind(this));
        if (this.elements.sortSelect) this.elements.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        this.elements.viewButtons.forEach(btn => btn.addEventListener('click', this.handleViewChange.bind(this)));
        if (this.elements.petsContainer) this.elements.petsContainer.addEventListener('click', this.handlePetCardClick.bind(this));
        document.addEventListener('languageChanged', this.handleLanguageChange.bind(this));
    },
    
    handleLanguageChange() {
        this.applyFiltersAndSort();
        this.updateFilterCounts();
        if (this.state.isMobileLayout) {
            this.updateMobileToggleText();
        }
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
                document.querySelectorAll(`input[name="${filterType}"]`).forEach(cb => cb.checked = cb.value === 'all');
            }
        } else {
            document.querySelector(`input[name="${filterType}"][value="all"]`).checked = false;
            if (checked) {
                this.state.currentFilters[filterType].push(filterValue);
            } else {
                this.state.currentFilters[filterType] = this.state.currentFilters[filterType].filter(val => val !== filterValue);
            }
            if (this.state.currentFilters[filterType].length === 0) {
                document.querySelector(`input[name="${filterType}"][value="all"]`).checked = true;
            }
        }
        this.resetPagination();
        this.applyFiltersAndSort();
    },

    clearAllFilters() {
        Object.keys(this.state.currentFilters).forEach(key => this.state.currentFilters[key] = []);
        this.elements.filterCheckboxes.forEach(cb => cb.checked = cb.value === 'all');
        if (this.elements.sortSelect) this.elements.sortSelect.value = 'newest';
        this.resetPagination();
        this.applyFiltersAndSort();
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

    normalizeValue(value) {
        if (!value) return '';
        let normalized = value.toString().trim().toLowerCase();
        const turkishMap = { 'ı': 'i', 'İ': 'i', 'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c' };
        Object.keys(turkishMap).forEach(char => {
            normalized = normalized.replace(new RegExp(char, 'g'), turkishMap[char]);
        });
        return normalized.replace(/\s+/g, '-');
    },
    
    applyFiltersAndSort() {
        const { animalType, age, size, gender, health } = this.state.currentFilters;
        let filtered = this.state.allPets.filter(pet => {
            const petHealthArray = Array.isArray(pet.health) ? pet.health : Object.keys(pet.health || {}).filter(key => pet.health[key] === true);
            const typeMatch = animalType.length === 0 || animalType.includes(this.normalizeValue(pet.type));
            const ageMatch = age.length === 0 || age.includes(this.normalizeValue(pet.ageGroup));
            const sizeMatch = size.length === 0 || size.includes(this.normalizeValue(pet.size));
            const genderMatch = gender.length === 0 || gender.includes(this.normalizeValue(pet.gender));
            const healthMatch = health.length === 0 || health.every(h => petHealthArray.includes(h));
            return typeMatch && ageMatch && sizeMatch && genderMatch && healthMatch;
        });
        this.state.filteredPets = this.applySorting(filtered);
        this.renderPets();
        this.updateResultCount();
    },

    applySorting(pets) {
        return [...pets].sort((a, b) => {
            switch (this.state.currentSort) {
                case 'oldest': return new Date(a.dateAdded) - new Date(b.dateAdded);
                case 'name-asc': return (a.petName || '').localeCompare(b.petName || '', 'tr');
                case 'name-desc': return (b.petName || '').localeCompare(a.petName || '', 'tr');
                case 'newest': default: return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
    },

    renderPets() {
        const { currentPage, itemsPerPage, filteredPets, currentView } = this.state;
        const container = this.elements.petsContainer;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const petsToShow = filteredPets.slice(startIndex, startIndex + itemsPerPage);

        if (petsToShow.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><h3 data-tr="Sonuç Bulunamadı" data-en="No Results Found"></h3><p data-tr="Filtrelerinizi genişletmeyi deneyin." data-en="Try broadening your filters."></p></div>`;
        } else {
            container.innerHTML = petsToShow.map(pet => this.createPetCard(pet, currentView)).join('');
        }
        this.renderPagination();
        this.updateLanguageOnRender();
    },

    escapeHtml(text = '') {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    createPetCard(pet, view) {
        const lang = this.getCurrentLanguage();
        const translated = this.translatePetData(pet, lang);
        const urgentBadge = pet.urgent ? `<div class="pet-urgent-badge" data-tr="ACİL" data-en="URGENT"></div>` : '';
        const petImage = (pet.images && pet.images.length > 0) ? pet.images[0] : '/images/placeholder-pet.jpg';
        const petHealthArray = Array.isArray(pet.health) ? pet.health : Object.keys(pet.health || {}).filter(key => pet.health[key] === true);
        const healthTags = petHealthArray.map(h => `<span class="pet-tag">${this.escapeHtml(this.translateHealth(h, lang))}</span>`).join('');
        const date = new Date(pet.dateAdded).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US');
        const escaped = {
            petName: this.escapeHtml(pet.petName), breed: this.escapeHtml(translated.breed),
            description: this.escapeHtml(translated.description), location: this.escapeHtml(pet.location),
            age: this.escapeHtml(String(pet.age || 0)), size: this.escapeHtml(translated.size),
            gender: this.escapeHtml(translated.gender), type: this.escapeHtml(translated.type),
            image: this.escapeHtml(petImage), id: this.escapeHtml(pet.id)
        };

        const imageHTML = `<div class="pet-card-image"><img src="${escaped.image}" alt="${escaped.petName}" loading="lazy" onerror="this.src='/images/placeholder-pet.jpg'">${urgentBadge}<div class="pet-type-badge">${escaped.type}</div></div>`;
        const detailsHTML = `<div class="pet-detail-item"><i class="fas fa-birthday-cake"></i><span data-tr="${escaped.age} yaşında" data-en="${escaped.age} years old"></span></div><div class="pet-detail-item"><i class="fas fa-ruler-vertical"></i><span>${escaped.size}</span></div><div class="pet-detail-item"><i class="fas fa-venus-mars"></i><span>${escaped.gender}</span></div><div class="pet-detail-item"><i class="fas fa-map-marker-alt"></i><span>${escaped.location}</span></div>`;
        
        if (view === 'grid') {
            return `<div class="adopt-pet-card" data-pet-id="${escaped.id}">${imageHTML}<div class="pet-card-content"><div class="pet-card-header"><h3 class="pet-card-name">${escaped.petName}</h3><div class="pet-card-breed">${escaped.breed}</div></div><p class="pet-card-description">${escaped.description}</p><div class="pet-card-details">${detailsHTML}</div><div class="pet-card-tags">${healthTags}</div><div class="pet-card-footer"><div class="pet-date">${date}</div><a href="#" class="pet-card-btn" data-tr="İncele" data-en="View Details"></a></div></div></div>`;
        }
        return `<div class="adopt-pet-card" data-pet-id="${escaped.id}">${imageHTML}<div class="pet-card-content"><div class="pet-card-main"><div class="pet-card-header"><h3 class="pet-card-name">${escaped.petName}</h3><div class="pet-card-breed">${escaped.breed}</div></div><div class="pet-card-details">${detailsHTML}</div><div class="pet-card-tags">${healthTags}</div></div><div class="pet-card-side"><div class="pet-date">${date}</div><a href="#" class="pet-card-btn" data-tr="İncele" data-en="View Details"></a></div></div></div>`;
    },

    renderPagination() {
        const totalPages = Math.ceil(this.state.filteredPets.length / this.state.itemsPerPage);
        const container = this.elements.paginationContainer;
        if (!container) return;
        container.innerHTML = '';
        if (totalPages <= 1) return;

        const createButton = (content, page, isDisabled = false, classes = []) => {
            const btn = document.createElement('button');
            btn.className = `page-btn ${classes.join(' ')}`.trim();
            if (page === this.state.currentPage) btn.classList.add('active'); // Corrected active state logic
            btn.innerHTML = content;
            btn.dataset.page = page;
            btn.disabled = isDisabled;
            btn.addEventListener('click', () => {
                this.state.currentPage = page;
                this.renderPets();
                this.elements.petsContainer.scrollIntoView({ behavior: 'smooth' });
            });
            return btn;
        };

        container.appendChild(createButton(`<i class="fas fa-chevron-left"></i>`, this.state.currentPage - 1, this.state.currentPage === 1));
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.className = 'page-numbers';
        for (let i = 1; i <= totalPages; i++) {
            pageNumbersContainer.appendChild(createButton(i, i, false, ['page-number']));
        }
        container.appendChild(pageNumbersContainer);
        container.appendChild(createButton(`<i class="fas fa-chevron-right"></i>`, this.state.currentPage + 1, this.state.currentPage === totalPages));
    },
    
    updateResultCount() {
        if (this.elements.totalPets) this.elements.totalPets.textContent = this.state.filteredPets.length;
    },

    resetPagination() {
        this.state.currentPage = 1;
    },

    updateFilterCounts() {
        const counts = this.state.allPets.reduce((acc, pet) => {
            acc.animalType[this.normalizeValue(pet.type)] = (acc.animalType[this.normalizeValue(pet.type)] || 0) + 1;
            acc.age[this.normalizeValue(pet.ageGroup)] = (acc.age[this.normalizeValue(pet.ageGroup)] || 0) + 1;
            acc.size[this.normalizeValue(pet.size)] = (acc.size[this.normalizeValue(pet.size)] || 0) + 1;
            acc.gender[this.normalizeValue(pet.gender)] = (acc.gender[this.normalizeValue(pet.gender)] || 0) + 1;
            const petHealthArray = Array.isArray(pet.health) ? pet.health : Object.keys(pet.health || {}).filter(key => pet.health[key] === true);
            petHealthArray.forEach(h => acc.health[h] = (acc.health[h] || 0) + 1);
            return acc;
        }, { animalType: {}, age: {}, size: {}, gender: {}, health: {} });

        this.elements.filterCheckboxes.forEach(cb => {
            const countSpan = cb.parentElement.querySelector('.count');
            if (!countSpan) return;
            if (cb.value === 'all') {
                countSpan.textContent = `(${this.state.allPets.length})`;
                return;
            }
            const count = counts[cb.name]?.[cb.value] || 0;
            countSpan.textContent = `(${count})`;
        });
    },
    
    getCurrentLanguage() {
        return window.currentLanguage || 'tr';
    },

    updateLanguageOnRender() {
        const lang = this.getCurrentLanguage();
        document.querySelectorAll('[data-tr][data-en]').forEach(el => {
            if (el.dataset[lang]) el.textContent = el.dataset[lang];
        });
    },

    translatePetData(pet, lang) {
        return {
            type: (PET_TRANSLATIONS.type[this.normalizeValue(pet.type)] || {})[lang] || pet.type,
            size: (PET_TRANSLATIONS.size[this.normalizeValue(pet.size)] || {})[lang] || pet.size,
            gender: (PET_TRANSLATIONS.gender[this.normalizeValue(pet.gender)] || {})[lang] || pet.gender,
            breed: pet.breed || (lang === 'tr' ? 'Belirtilmemiş' : 'Unspecified'),
            description: (pet.description || '').substring(0, 100) + '...',
        };
    },

    translateHealth(health, lang) {
        const translations = { vaccinated: { tr: 'Aşılı', en: 'Vaccinated' }, sterilized: { tr: 'Kısırlaştırılmış', en: 'Sterilized' }, microchipped: { tr: 'Çipli', en: 'Microchipped' } };
        return (translations[health] || {})[lang] || health;
    },
};

document.addEventListener('DOMContentLoaded', () => AdoptPageApp.init());

