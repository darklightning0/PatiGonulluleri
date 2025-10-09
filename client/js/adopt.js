/**
 * Sahiplen (Adopt) Page JavaScript - Firebase Version
 * Handles filtering, sorting, pagination, and pet card generation using Firebase data
 */
import { CachedPetsService } from './firebase-data-service.js';

// Move outside function as constant
const PET_TRANSLATIONS = {
    type: { 
        'köpek': { tr: 'Köpek', en: 'Dog' },
        'dog': { tr: 'Köpek', en: 'Dog' },
        'kedi': { tr: 'Kedi', en: 'Cat' },
        'cat': { tr: 'Kedi', en: 'Cat' },
        'diğer': { tr: 'Diğer', en: 'Other' },
        'other': { tr: 'Diğer', en: 'Other' }
    },
    size: { 
        'küçük': { tr: 'Küçük', en: 'Small' },
        'small': { tr: 'Küçük', en: 'Small' },
        'orta': { tr: 'Orta', en: 'Medium' },
        'medium': { tr: 'Orta', en: 'Medium' },
        'büyük': { tr: 'Büyük', en: 'Large' },
        'large': { tr: 'Büyük', en: 'Large' }
    },
    gender: { 
        'erkek': { tr: 'Erkek', en: 'Male' },
        'male': { tr: 'Erkek', en: 'Male' },
        'dişi': { tr: 'Dişi', en: 'Female' },
        'female': { tr: 'Dişi', en: 'Female' },
        'belirtilmemiş': { tr: 'Belirtilmemiş', en: 'Unspecified' },
        'unspecified': { tr: 'Belirtilmemiş', en: 'Unspecified' }
    }
};

const AdoptPageApp = {
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
        isLoading: true
    },

    elements: {},

    async init() {
        console.log('🐾 Initializing Adopt Page App with Firebase');
        
        this.cacheDOMElements();
        this.bindEvents();
        
        // Show loading state
        this.showLoadingState();
        
        try {
            
            // Load pets from Firebase
            await this.loadPetsFromFirebase();
            
            // Wait for language to be set
            setTimeout(() => {
                this.updateFilterCounts();
                this.applyFiltersAndSort();
                this.initMobileFilters();
                console.log('✅ Adopt Page App Initialized');
            }, 100);
        } catch (error) {
            console.error('Error initializing adopt page:', error);
            this.showErrorState('Hayvan verileri yüklenemedi. Lütfen sayfayı yenileyin.');
        }
    },

    async loadPetsFromFirebase() {
        try {
            this.state.allPets = await CachedPetsService.getAll();
            this.state.filteredPets = [...this.state.allPets];
            this.state.isLoading = false;
            
            console.log(`Loaded ${this.state.allPets.length} pets from Firebase`);
        } catch (error) {
            console.error('Error loading pets from Firebase:', error);
            this.state.isLoading = false;
            throw error;
        }
    },

    showLoadingState() {
        const container = this.elements.petsContainer;
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <span>Hayvanlar yükleniyor...</span>
                </div>
            `;
        }
    },

    showErrorState(message) {
        const container = this.elements.petsContainer;
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Hata</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-primary">
                        <i class="fas fa-redo"></i> Yenile
                    </button>
                </div>
            `;
        }
    },

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

    bindEvents() {
        this.elements.filterCheckboxes.forEach(checkbox => 
            checkbox.addEventListener('change', this.handleFilterChange.bind(this))
        );
        
        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.addEventListener('click', this.clearAllFilters.bind(this));
        }
        
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }
        
        this.elements.viewButtons.forEach(btn => 
            btn.addEventListener('click', this.handleViewChange.bind(this))
        );
        
        if(this.elements.petsContainer) {
            this.elements.petsContainer.addEventListener('click', this.handlePetCardClick.bind(this));
        }
        
        document.addEventListener('languageChanged', this.handleLanguageChange.bind(this));
    },
    
    handleLanguageChange() {
        console.log('Language changed, re-rendering pets...');
        this.applyFiltersAndSort();
        this.updateFilterCounts();
        this.updateMobileToggleText();
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
    
applyFiltersAndSort() {
    const { animalType, age, size, gender, health } = this.state.currentFilters;

    // Create bidirectional mapping for filters
    const filterMapping = {
        type: {
            'köpek': 'dog',
            'dog': 'dog',
            'kedi': 'cat',
            'cat': 'cat',
            'diğer': 'other',
            'other': 'other'
        },
        ageGroup: {
            'genç': 'young',
            'young': 'young',
            'yetişkin': 'adult',
            'adult': 'adult',
            'yaşlı': 'senior',
            'senior': 'senior'
        },
        size: {
            'küçük': 'small',
            'small': 'small',
            'orta': 'medium',
            'medium': 'medium',
            'büyük': 'large',
            'large': 'large'
        },
        gender: {
            'erkek': 'male',
            'male': 'male',
            'dişi': 'female',
            'female': 'female',
            'belirtilmemiş': 'unspecified',
            'unspecified': 'unspecified'
        }
    };

    let filtered = this.state.allPets.filter(pet => {
        // Normalize pet data to English keys for comparison
        const petTypeNormalized = this.normalizeValue(pet.type);
        const petSizeNormalized = this.normalizeValue(pet.size);
        const petGenderNormalized = this.normalizeValue(pet.gender);
        const petAgeGroupNormalized = this.normalizeValue(pet.ageGroup);
        
        // Handle health as both array (old) and object (new)
        const petHealthArray = Array.isArray(pet.health) 
            ? pet.health 
            : Object.keys(pet.health || {}).filter(key => pet.health[key] === true);
        
        // Check type filter
        const typeMatch = animalType.length === 0 || animalType.some(filterValue => {
            const normalizedFilter = this.normalizeValue(filterValue);
            const mappedFilter = filterMapping.type[normalizedFilter] || normalizedFilter;
            const mappedPetType = filterMapping.type[petTypeNormalized] || petTypeNormalized;
            return mappedFilter === mappedPetType;
        });
        
        // Check age filter
        const ageMatch = age.length === 0 || age.some(filterValue => {
            const normalizedFilter = this.normalizeValue(filterValue);
            const mappedFilter = filterMapping.ageGroup[normalizedFilter] || normalizedFilter;
            const mappedPetAge = filterMapping.ageGroup[petAgeGroupNormalized] || petAgeGroupNormalized;
            return mappedFilter === mappedPetAge;
        });
        
        // Check size filter
        const sizeMatch = size.length === 0 || size.some(filterValue => {
            const normalizedFilter = this.normalizeValue(filterValue);
            const mappedFilter = filterMapping.size[normalizedFilter] || normalizedFilter;
            const mappedPetSize = filterMapping.size[petSizeNormalized] || petSizeNormalized;
            return mappedFilter === mappedPetSize;
        });
        
        // Check gender filter
        const genderMatch = gender.length === 0 || gender.some(filterValue => {
            const normalizedFilter = this.normalizeValue(filterValue);
            const mappedFilter = filterMapping.gender[normalizedFilter] || normalizedFilter;
            const mappedPetGender = filterMapping.gender[petGenderNormalized] || petGenderNormalized;
            return mappedFilter === mappedPetGender;
        });
        
        // Check health filter
        const healthMatch = health.length === 0 || health.every(h => petHealthArray.includes(h));
        
        return typeMatch && ageMatch && sizeMatch && genderMatch && healthMatch;
    });

    this.state.filteredPets = this.applySorting(filtered);
    this.renderPets();
    this.updateResultCount();
},

normalizeValue(value) {
    if (!value) return '';
    
    // Convert to string, trim, and lowercase
    let normalized = value.toString().trim().toLowerCase();
    
    // Replace Turkish characters with English equivalents
    const turkishMap = {
        'ı': 'i', 'İ': 'i',
        'ğ': 'g', 'Ğ': 'g',
        'ü': 'u', 'Ü': 'u',
        'ş': 's', 'Ş': 's',
        'ö': 'o', 'Ö': 'o',
        'ç': 'c', 'Ç': 'c'
    };
    
    Object.keys(turkishMap).forEach(char => {
        normalized = normalized.replace(new RegExp(char, 'g'), turkishMap[char]);
    });
    
    // Remove extra spaces and replace spaces with hyphens
    normalized = normalized.replace(/\s+/g, '-');
    
    return normalized;
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

    renderPets() {
        const { currentPage, itemsPerPage, filteredPets, currentView } = this.state;
        const container = this.elements.petsContainer;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const petsToShow = filteredPets.slice(startIndex, startIndex + itemsPerPage);

        container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div><span>Yükleniyor...</span></div>`;
        
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
            this.updateLanguageOnRender();
        }, 250);
    },

    escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
},

createPetCard(pet, view) {
    const lang = this.getCurrentLanguage();
    const translated = this.translatePetData(pet, lang);
    const urgentBadge = pet.urgent ? `<div class="pet-urgent-badge" data-tr="ACİL" data-en="URGENT"></div>` : '';
    
    // Handle images array - use first image or fallback
    const petImage = (pet.images && pet.images.length > 0) ? pet.images[0] : (pet.image || '/images/placeholder-pet.jpg');
    
    // Handle both array and object health format
    const petHealthArray = Array.isArray(pet.health) 
        ? pet.health 
        : Object.keys(pet.health).filter(key => pet.health[key] === true);

    const healthTags = petHealthArray.map(h => 
        `<span class="pet-tag">${this.escapeHtml(this.translateHealth(h, lang))}</span>`
    ).join('');
    
    const date = new Date(pet.dateAdded).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Escape all user-controlled content
    const escapedPetName = this.escapeHtml(pet.petName);
    const escapedBreed = this.escapeHtml(translated.breed);
    const escapedDescription = this.escapeHtml(translated.description);
    const escapedLocation = this.escapeHtml(pet.location);
    const escapedAge = this.escapeHtml(String(pet.age || 0));
    const escapedSize = this.escapeHtml(translated.size);
    const escapedGender = this.escapeHtml(translated.gender);
    const escapedType = this.escapeHtml(translated.type);
    const escapedImage = this.escapeHtml(petImage);
    const escapedId = this.escapeHtml(pet.id);

    const imageHTML = `
        <div class="pet-card-image">
            <img src="${escapedImage}" alt="${escapedPetName}" loading="lazy" onerror="this.src='/images/placeholder-pet.jpg'">
            ${urgentBadge}
            <div class="pet-type-badge">${escapedType}</div>
        </div>`;
    
    const detailsHTML = `
        <div class="pet-detail-item"><i class="fas fa-birthday-cake"></i><span data-tr="${escapedAge} yaşında" data-en="${escapedAge} years old"></span></div>
        <div class="pet-detail-item"><i class="fas fa-ruler-vertical"></i><span>${escapedSize}</span></div>
        <div class="pet-detail-item"><i class="fas fa-venus-mars"></i><span>${escapedGender}</span></div>
        <div class="pet-detail-item"><i class="fas fa-map-marker-alt"></i><span>${escapedLocation}</span></div>`;

    if (view === 'grid') {
        return `
            <div class="adopt-pet-card" data-pet-id="${escapedId}">
                ${imageHTML}
                <div class="pet-card-content">
                    <div class="pet-card-header">
                        <h3 class="pet-card-name">${escapedPetName}</h3>
                        <div class="pet-card-breed">${escapedBreed}</div>
                    </div>
                    <p class="pet-card-description">${escapedDescription}</p>
                    <div class="pet-card-details">${detailsHTML}</div>
                    <div class="pet-card-tags">${healthTags}</div>
                    <div class="pet-card-footer">
                        <div class="pet-date">${date}</div>
                        <a href="#" class="pet-card-btn" data-tr="İncele" data-en="View Details"></a>
                    </div>
                </div>
            </div>`;
    } else {
        return `
            <div class="adopt-pet-card" data-pet-id="${escapedId}">
                ${imageHTML}
                <div class="pet-card-content">
                    <div class="pet-card-main">
                        <div class="pet-card-header"><h3 class="pet-card-name">${escapedPetName}</h3><div class="pet-card-breed">${escapedBreed}</div></div>
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
        
        container.appendChild(createButton(`<i class="fas fa-chevron-left"></i> <span data-tr="Önceki" data-en="Previous"></span>`, this.state.currentPage - 1, this.state.currentPage === 1, ['prev-btn']));
        
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.className = 'page-numbers';
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = createButton(i, i, false, ['page-number']);
            if (i === this.state.currentPage) pageBtn.classList.add('active');
            pageNumbersContainer.appendChild(pageBtn);
        }
        container.appendChild(pageNumbersContainer);
        
        container.appendChild(createButton(`<span data-tr="Sonraki" data-en="Next"></span> <i class="fas fa-chevron-right"></i>`, this.state.currentPage + 1, this.state.currentPage === totalPages, ['next-btn']));
    },
    
    updateResultCount() {
        if (this.elements.totalPets) {
            this.elements.totalPets.textContent = this.state.filteredPets.length;
        }
    },

    resetPagination() {
        this.state.currentPage = 1;
    },

updateFilterCounts() {
    const filterMapping = {
        type: {
            'köpek': 'dog', 'dog': 'dog',
            'kedi': 'cat', 'cat': 'cat',
            'diğer': 'other', 'other': 'other'
        },
        ageGroup: {
            'genç': 'young', 'young': 'young',
            'yetişkin': 'adult', 'adult': 'adult',
            'yaşlı': 'senior', 'senior': 'senior'
        },
        size: {
            'küçük': 'small', 'small': 'small',
            'orta': 'medium', 'medium': 'medium',
            'büyük': 'large', 'large': 'large'
        },
        gender: {
            'erkek': 'male', 'male': 'male',
            'dişi': 'female', 'female': 'female',
            'belirtilmemiş': 'unspecified', 'unspecified': 'unspecified'
        }
    };

    const counts = this.state.allPets.reduce((acc, pet) => {
        const normalizedType = this.normalizeValue(pet.type);
        const normalizedSize = this.normalizeValue(pet.size);
        const normalizedGender = this.normalizeValue(pet.gender);
        const normalizedAgeGroup = this.normalizeValue(pet.ageGroup);
        
        // Map to canonical English keys
        const canonicalType = filterMapping.type[normalizedType] || normalizedType;
        const canonicalSize = filterMapping.size[normalizedSize] || normalizedSize;
        const canonicalGender = filterMapping.gender[normalizedGender] || normalizedGender;
        const canonicalAge = filterMapping.ageGroup[normalizedAgeGroup] || normalizedAgeGroup;
        
        acc.animalType[canonicalType] = (acc.animalType[canonicalType] || 0) + 1;
        acc.age[canonicalAge] = (acc.age[canonicalAge] || 0) + 1;
        acc.size[canonicalSize] = (acc.size[canonicalSize] || 0) + 1;
        acc.gender[canonicalGender] = (acc.gender[canonicalGender] || 0) + 1;
        
        // Handle both array and object health format
        const petHealthArray = Array.isArray(pet.health) 
            ? pet.health 
            : Object.keys(pet.health || {}).filter(key => pet.health[key] === true);
        
        petHealthArray.forEach(h => acc.health[h] = (acc.health[h] || 0) + 1);
        return acc;
    }, { animalType: {}, age: {}, size: {}, gender: {}, health: {} });

    this.elements.filterCheckboxes.forEach(cb => {
        const { name, value } = cb;
        const countSpan = cb.parentElement.querySelector('.count');
        if (!countSpan || value === 'all') {
            if (countSpan && value === 'all') {
                countSpan.textContent = `(${this.state.allPets.length})`;
            }
            return;
        }
        
        const normalizedValue = this.normalizeValue(value);
        const mappedValue = filterMapping[name] ? 
            (filterMapping[name][normalizedValue] || normalizedValue) : 
            normalizedValue;
        
        const count = counts[name]?.[mappedValue] || 0;
        countSpan.textContent = `(${count})`;
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
    const normalizedType = this.normalizeValue(pet.type);
    const normalizedSize = this.normalizeValue(pet.size);
    const normalizedGender = this.normalizeValue(pet.gender);
    
    return {
        type: (PET_TRANSLATIONS.type[pet.type] || PET_TRANSLATIONS.type[normalizedType] || {})[lang] || pet.type,
        size: (PET_TRANSLATIONS.size[pet.size] || PET_TRANSLATIONS.size[normalizedSize] || {})[lang] || pet.size,
        gender: (PET_TRANSLATIONS.gender[pet.gender] || PET_TRANSLATIONS.gender[normalizedGender] || {})[lang] || pet.gender,
        breed: pet.breed || (lang === 'tr' ? 'Belirtilmemiş' : 'Unspecified'),
        description: (pet.description || '').substring(0, 100) + '...',
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

document.addEventListener('DOMContentLoaded', () => AdoptPageApp.init());