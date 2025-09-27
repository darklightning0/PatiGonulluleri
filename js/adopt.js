/**
 * Sahiplen (Adopt) Page JavaScript
 * Handles filtering, sorting, pagination, and pet card generation
 */

// ===================
// GLOBAL VARIABLES
// ===================

let currentFilters = {
    animalType: [],
    age: [],
    size: [],
    gender: [],
    health: []
};

let currentSort = 'newest';
let currentView = 'grid';
let currentPage = 1;
const itemsPerPage = 6;
let filteredPets = [];

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    initAdoptPage();
});

document.getElementById('pets-container').addEventListener('click', (e) => {
    const petCard = e.target.closest('.adopt-pet-card');
    if (petCard) {
        const petId = petCard.dataset.petId;
        if (petId) {
            window.location.href = `pet-detail.html?id=${petId}`;
        }
    }
});

function initAdoptPage() {
    console.log('🐾 Initializing Adopt Page');
    
    // Check if PETS_DATA is available
    if (typeof PETS_DATA === 'undefined') {
        console.error('PETS_DATA not found. Make sure pets-data.js is loaded.');
        return;
    }
    
    // Initialize with centralized data
    filteredPets = [...PETS_DATA];
    
    // Initialize components
    updateFilterCounts(); // Update counts first
    initFilters();
    initSorting();
    initViewToggle();
    initPagination();
    initMobileFilters();
    
    // Load initial data
    applyFiltersAndSort();
    updateResultCount();
    
    console.log('✅ Adopt Page Initialized');
}

// ===================
// FILTER COUNTS CALCULATION
// ===================

function updateFilterCounts() {
    const filterCounts = calculateFilterCounts();
    
    // Update animal type counts
    updateFilterCountDisplay('animalType', 'all', PETS_DATA.length);
    updateFilterCountDisplay('animalType', 'dog', filterCounts.animalType.dog || 0);
    updateFilterCountDisplay('animalType', 'cat', filterCounts.animalType.cat || 0);
    updateFilterCountDisplay('animalType', 'other', filterCounts.animalType.other || 0);
    
    // Update age counts
    updateFilterCountDisplay('age', 'young', filterCounts.age.young || 0);
    updateFilterCountDisplay('age', 'adult', filterCounts.age.adult || 0);
    updateFilterCountDisplay('age', 'senior', filterCounts.age.senior || 0);
    
    // Update size counts
    updateFilterCountDisplay('size', 'small', filterCounts.size.small || 0);
    updateFilterCountDisplay('size', 'medium', filterCounts.size.medium || 0);
    updateFilterCountDisplay('size', 'large', filterCounts.size.large || 0);
    
    // Update gender counts
    updateFilterCountDisplay('gender', 'male', filterCounts.gender.male || 0);
    updateFilterCountDisplay('gender', 'female', filterCounts.gender.female || 0);
    
    // Update health counts
    updateFilterCountDisplay('health', 'vaccinated', filterCounts.health.vaccinated || 0);
    updateFilterCountDisplay('health', 'sterilized', filterCounts.health.sterilized || 0);
    updateFilterCountDisplay('health', 'microchipped', filterCounts.health.microchipped || 0);
}

function calculateFilterCounts() {
    const counts = {
        animalType: {},
        age: {},
        size: {},
        gender: {},
        health: {}
    };
    
    PETS_DATA.forEach(pet => {
        // Count animal types
        counts.animalType[pet.type] = (counts.animalType[pet.type] || 0) + 1;
        
        // Count age groups
        counts.age[pet.ageGroup] = (counts.age[pet.ageGroup] || 0) + 1;
        
        // Count sizes
        counts.size[pet.size] = (counts.size[pet.size] || 0) + 1;
        
        // Count genders
        counts.gender[pet.gender] = (counts.gender[pet.gender] || 0) + 1;
        
        // Count health attributes
        pet.health.forEach(healthAttr => {
            counts.health[healthAttr] = (counts.health[healthAttr] || 0) + 1;
        });
    });
    
    return counts;
}

function updateFilterCountDisplay(filterType, filterValue, count) {
    const filterOption = document.querySelector(`input[name="${filterType}"][value="${filterValue}"]`);
    if (filterOption) {
        const countSpan = filterOption.parentElement.querySelector('.count');
        if (countSpan) {
            countSpan.textContent = `(${count})`;
        }
    }
}

// ===================
// FILTER FUNCTIONALITY
// ===================

function initFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');
    
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Handle "All" checkboxes
    const allCheckboxes = document.querySelectorAll('input[value="all"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleAllFilter);
    });
}

function handleFilterChange(event) {
    const checkbox = event.target;
    const filterType = checkbox.name;
    const filterValue = checkbox.value;
    
    // Skip "all" checkboxes - they're handled separately
    if (filterValue === 'all') return;
    
    if (checkbox.checked) {
        if (!currentFilters[filterType].includes(filterValue)) {
            currentFilters[filterType].push(filterValue);
        }
    } else {
        currentFilters[filterType] = currentFilters[filterType].filter(val => val !== filterValue);
    }
    
    // Uncheck "all" if other options are selected
    const allCheckbox = document.querySelector(`input[name="${filterType}"][value="all"]`);
    if (allCheckbox && currentFilters[filterType].length > 0) {
        allCheckbox.checked = false;
    }
    
    applyFiltersAndSort();
    updateResultCount();
    resetPagination();
}

function handleAllFilter(event) {
    const checkbox = event.target;
    const filterType = checkbox.name;
    
    if (checkbox.checked) {
        // Clear specific filters and uncheck other checkboxes
        currentFilters[filterType] = [];
        const otherCheckboxes = document.querySelectorAll(`input[name="${filterType}"]:not([value="all"])`);
        otherCheckboxes.forEach(cb => {
            cb.checked = false;
        });
    }
    
    applyFiltersAndSort();
    updateResultCount();
    resetPagination();
}

function clearAllFilters() {
    // Reset filter state
    currentFilters = {
        animalType: [],
        age: [],
        size: [],
        gender: [],
        health: []
    };
    
    // Uncheck all checkboxes except "all"
    const allCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        if (checkbox.value === 'all') {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    
    applyFiltersAndSort();
    updateResultCount();
    resetPagination();
    
    // Show success message
    showNotification('Filtreler temizlendi', 'success');
}

function applyFiltersAndSort() {
    // Start with all pets
    filteredPets = [...PETS_DATA];
    
    // Apply filters
    filteredPets = filteredPets.filter(pet => {
        // Animal type filter
        if (currentFilters.animalType.length > 0 && !currentFilters.animalType.includes(pet.type)) {
            return false;
        }
        
        // Age group filter
        if (currentFilters.age.length > 0 && !currentFilters.age.includes(pet.ageGroup)) {
            return false;
        }
        
        // Size filter
        if (currentFilters.size.length > 0 && !currentFilters.size.includes(pet.size)) {
            return false;
        }
        
        // Gender filter
        if (currentFilters.gender.length > 0 && !currentFilters.gender.includes(pet.gender)) {
            return false;
        }
        
        // Health filter - pet must have ALL selected health attributes
        if (currentFilters.health.length > 0) {
            const hasAllHealthFilters = currentFilters.health.every(healthFilter => 
                pet.health.includes(healthFilter)
            );
            if (!hasAllHealthFilters) {
                return false;
            }
        }
        
        return true;
    });
    
    // Apply sorting
    applySorting();
    
    // Render pets
    renderPets();
}

function loadSimilarPets() {
    if (!currentPet) return;
    
    // Find similar pets (same type, excluding current pet)
    const similarPets = PETS_DATA.filter(pet => 
        pet.id !== currentPet.id && 
        pet.type === currentPet.type
    ).slice(0, 3); // Show max 3 similar pets
    
    const container = document.getElementById('similar-pets-container');
    if (!container) return;
    
    if (similarPets.length === 0) {
        container.innerHTML = '<p>Benzer hayvan bulunamadı.</p>';
        return;
    }
    
    container.innerHTML = similarPets.map(pet => createSimilarPetCard(pet)).join('');
    
    // Add click handlers
    const petCards = container.querySelectorAll('.similar-pet-card');
    petCards.forEach(card => {
        card.addEventListener('click', () => {
            const petId = card.dataset.petId;
            window.location.href = `pet-detail.html?id=${petId}`;
        });
    });
}

function applySorting() {
    switch (currentSort) {
        case 'newest':
            filteredPets.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'oldest':
            filteredPets.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            break;
        case 'age-asc':
            filteredPets.sort((a, b) => a.age - b.age);
            break;
        case 'age-desc':
            filteredPets.sort((a, b) => b.age - a.age);
            break;
        case 'name-asc':
            filteredPets.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
            break;
        case 'name-desc':
            filteredPets.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
            break;
        default:
            // Default to newest
            filteredPets.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }
}

// ===================
// SORTING FUNCTIONALITY
// ===================

function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

function handleSortChange(event) {
    currentSort = event.target.value;
    applyFiltersAndSort();
    resetPagination();
}

// ===================
// VIEW TOGGLE FUNCTIONALITY
// ===================

function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
}

function handleViewChange(event) {
    const button = event.currentTarget;
    const view = button.dataset.view;
    
    if (view !== currentView) {
        currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update container class
        const container = document.getElementById('pets-container');
        container.className = `pets-container ${view}-view`;
        
        // Re-render pets with new view
        renderPets();
    }
}

// ===================
// PET RENDERING
// ===================

function renderPets() {
    const container = document.getElementById('pets-container');
    
    if (!container) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const petsToShow = filteredPets.slice(startIndex, endIndex);
    
    // Show loading state
    container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><span>Yükleniyor...</span></div>';
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        if (petsToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3 data-tr="Sonuç Bulunamadı" data-en="No Results Found">Sonuç Bulunamadı</h3>
                    <p data-tr="Seçtiğiniz filtrelere uygun hayvan bulunamadı. Lütfen filtrelerinizi genişletmeyi deneyin." data-en="No animals found matching your selected filters. Please try broadening your filters.">
                        Seçtiğiniz filtrelere uygun hayvan bulunamadı. Lütfen filtrelerinizi genişletmeyi deneyin.
                    </p>
                </div>
            `;
            updateLanguageTexts();
            return;
        }
        
        // Render pets
        container.innerHTML = petsToShow.map(pet => createPetCard(pet)).join('');
        
        // Update language texts
        updateLanguageTexts();
        
        // Add entrance animations
        const cards = container.querySelectorAll('.adopt-pet-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-up');
        });
        
        // Update pagination
        updatePagination();
        
    }, 300); // 300ms loading delay
}

function createPetCard(pet) {
    const currentLang = getCurrentLanguage();
    
    // Translate data based on current language
    const translatedData = translatePetData(pet, currentLang);
    
    const urgentBadge = pet.urgent ? `<div class="pet-urgent-badge" data-tr="ACİL" data-en="URGENT">ACİL</div>` : '';
    
    const healthTags = pet.health.map(health => {
        const healthTranslations = {
            'vaccinated': { tr: 'Aşılı', en: 'Vaccinated' },
            'sterilized': { tr: 'Kısırlaştırılmış', en: 'Sterilized' },
            'microchipped': { tr: 'Çipli', en: 'Microchipped' }
        };
        const healthText = healthTranslations[health] ? healthTranslations[health][currentLang] : health;
        return `<span class="pet-tag">${healthText}</span>`;
    }).join('');
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', options);
    };
    
    if (currentView === 'grid') {
        return `
            <div class="adopt-pet-card" data-pet-id="${pet.id}">
                <div class="pet-card-image">
                    <img src="${pet.image}" alt="${pet.name}" loading="lazy">
                    ${urgentBadge}
                    <div class="pet-type-badge" data-tr="${translatedData.type.tr}" data-en="${translatedData.type.en}">
                        ${translatedData.type[currentLang]}
                    </div>
                </div>
                <div class="pet-card-content">
                    <div class="pet-card-header">
                        <h3 class="pet-card-name">${pet.name}</h3>
                        <div class="pet-card-breed">${translatedData.breed}</div>
                    </div>
                    <p class="pet-card-description">${translatedData.description}</p>
                    <div class="pet-card-details">
                        <div class="pet-detail-item">
                            <i class="fas fa-birthday-cake"></i>
                            <span>${pet.age} <span data-tr="yaşında" data-en="years old">yaşında</span></span>
                        </div>
                        <div class="pet-detail-item">
                            <i class="fas fa-ruler-vertical"></i>
                            <span data-tr="${translatedData.size.tr}" data-en="${translatedData.size.en}">${translatedData.size[currentLang]}</span>
                        </div>
                        <div class="pet-detail-item">
                            <i class="fas fa-venus-mars"></i>
                            <span data-tr="${translatedData.gender.tr}" data-en="${translatedData.gender.en}">${translatedData.gender[currentLang]}</span>
                        </div>
                        <div class="pet-detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${pet.location}</span>
                        </div>
                    </div>
                    <div class="pet-card-tags">
                        ${healthTags}
                    </div>
                    <div class="pet-card-footer">
                        <div class="pet-date">${formatDate(pet.dateAdded)}</div>
                        <a href="pet-detail.html?id=${pet.id}" class="pet-card-btn" data-tr="İncele" data-en="View Details">İncele</a>
                    </div>
                </div>
            </div>
        `;
    } else {
        // List view
        return `
            <div class="adopt-pet-card" data-pet-id="${pet.id}">
                <div class="pet-card-image">
                    <img src="${pet.image}" alt="${pet.name}" loading="lazy">
                    ${urgentBadge}
                    <div class="pet-type-badge" data-tr="${translatedData.type.tr}" data-en="${translatedData.type.en}">
                        ${translatedData.type[currentLang]}
                    </div>
                </div>
                <div class="pet-card-content">
                    <div class="pet-card-main">
                        <div class="pet-card-header">
                            <h3 class="pet-card-name">${pet.name}</h3>
                            <div class="pet-card-breed">${translatedData.breed}</div>
                        </div>
                        <div class="pet-card-details">
                            <div class="pet-detail-item">
                                <i class="fas fa-birthday-cake"></i>
                                <span>${pet.age} <span data-tr="yaşında" data-en="years old">yaşında</span></span>
                            </div>
                            <div class="pet-detail-item">
                                <i class="fas fa-ruler-vertical"></i>
                                <span data-tr="${translatedData.size.tr}" data-en="${translatedData.size.en}">${translatedData.size[currentLang]}</span>
                            </div>
                            <div class="pet-detail-item">
                                <i class="fas fa-venus-mars"></i>
                                <span data-tr="${translatedData.gender.tr}" data-en="${translatedData.gender.en}">${translatedData.gender[currentLang]}</span>
                            </div>
                            <div class="pet-detail-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${pet.location}</span>
                            </div>
                        </div>
                        <div class="pet-card-tags">
                            ${healthTags}
                        </div>
                        <p class="pet-card-description">${translatedData.description}</p>
                    </div>
                    <div class="pet-card-side">
                        <div class="pet-date">${formatDate(pet.dateAdded)}</div>
                        <a href="pet-detail.html?id=${pet.id}" class="pet-card-btn" data-tr="İncele" data-en="View Details">İncele</a>
                    </div>
                </div>
            </div>
        `;
    }
}

function translatePetData(pet, lang) {
    const translations = {
        type: {
            dog: { tr: 'Köpek', en: 'Dog' },
            cat: { tr: 'Kedi', en: 'Cat' },
            other: { tr: 'Diğer', en: 'Other' }
        },
        size: {
            small: { tr: 'Küçük', en: 'Small' },
            medium: { tr: 'Orta', en: 'Medium' },
            large: { tr: 'Büyük', en: 'Large' }
        },
        gender: {
            male: { tr: 'Erkek', en: 'Male' },
            female: { tr: 'Dişi', en: 'Female' }
        }
    };
    
    return {
        type: translations.type[pet.type] || { tr: pet.type, en: pet.type },
        size: translations.size[pet.size] || { tr: pet.size, en: pet.size },
        gender: translations.gender[pet.gender] || { tr: pet.gender, en: pet.gender },
        breed: pet.breed, // Breed names typically stay the same
        description: pet.description // For now, keeping original description
    };
}

function getCurrentLanguage() {
    // Get current language from the main.js currentLanguage variable or default to 'tr'
    return window.currentLanguage || 'tr';
}

function updateLanguageTexts() {
    // Update all translatable elements in the newly rendered content
    const currentLang = getCurrentLanguage();
    const translatableElements = document.querySelectorAll('[data-tr][data-en]');
    
    translatableElements.forEach(element => {
        const trText = element.dataset.tr;
        const enText = element.dataset.en;
        
        if (currentLang === 'tr') {
            element.textContent = trText;
        } else if (currentLang === 'en') {
            element.textContent = enText;
        }
    });
}

// ===================
// PAGINATION FUNCTIONALITY
// ===================

function initPagination() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const pageNumbers = document.querySelectorAll('.page-number');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPets();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderPets();
            }
        });
    }
    
    pageNumbers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(e.target.dataset.page);
            if (page !== currentPage) {
                currentPage = page;
                renderPets();
            }
        });
    });
}

// Update pagination function to use the new renderer
function updatePagination() {
    const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const pageNumbers = document.querySelector('.page-numbers');
    
    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    // Update page numbers
    if (pageNumbers) {
        let paginationHTML = '';
        
        // Calculate which pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Add first page and ellipsis if needed
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationHTML += `<button class="page-btn page-number ${activeClass}" data-page="${i}">${i}</button>`;
        }
        
        // Add last page and ellipsis if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="page-btn page-number" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        pageNumbers.innerHTML = paginationHTML;
        
        // Re-attach event listeners to new page buttons
        const newPageButtons = pageNumbers.querySelectorAll('.page-number');
        newPageButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page !== currentPage) {
                    currentPage = page;
                    renderPets(); // Use the new function
                    // Scroll to top of results
                    document.querySelector('.main-content').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            });
        });
    }
}

// Update the view change handler
function handleViewChange(event) {
    const button = event.currentTarget;
    const view = button.dataset.view;
    
    if (view !== currentView) {
        currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update container class
        const container = document.getElementById('pets-container');
        container.className = `pets-container ${view}-view`;
        
        // Re-render pets with new view and event listeners
        renderPets();
    }
}

// Update sort change handler
function handleSortChange(event) {
    currentSort = event.target.value;
    applyFiltersAndSort(); // This will call renderPets
    resetPagination();
}

function resetPagination() {
    currentPage = 1;
}

// ===================
// MOBILE FILTERS
// ===================

function initMobileFilters() {
    // Create mobile filter toggle button
    const filtersContainer = document.querySelector('.filters-container');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    
    if (window.innerWidth <= 768 && filtersContainer && filtersSidebar) {
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'filters-toggle';
        toggleButton.innerHTML = `
            <span data-tr="Filtreleri Göster" data-en="Show Filters">Filtreleri Göster</span>
            <i class="fas fa-chevron-down"></i>
        `;
        
        // Insert button before filters container
        filtersSidebar.insertBefore(toggleButton, filtersContainer);
        
        // Initially hide filters on mobile
        filtersContainer.classList.add('collapsed');
        
        // Add click handler
        toggleButton.addEventListener('click', toggleMobileFilters);
    }
    
    // Update on window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            // Desktop view - remove mobile filter toggle
            const toggleButton = document.querySelector('.filters-toggle');
            if (toggleButton) {
                toggleButton.remove();
            }
            filtersContainer?.classList.remove('collapsed');
        } else {
            // Mobile view - add toggle if it doesn't exist
            const existingToggle = document.querySelector('.filters-toggle');
            if (!existingToggle && filtersContainer && filtersSidebar) {
                initMobileFilters();
            }
        }
    }, 250));
}

function toggleMobileFilters() {
    const filtersContainer = document.querySelector('.filters-container');
    const toggleButton = document.querySelector('.filters-toggle');
    const icon = toggleButton.querySelector('i');
    const span = toggleButton.querySelector('span');
    
    filtersContainer.classList.toggle('collapsed');
    toggleButton.classList.toggle('active');
    
    // Update button text and icon
    if (filtersContainer.classList.contains('collapsed')) {
        span.textContent = getCurrentLanguage() === 'tr' ? 'Filtreleri Göster' : 'Show Filters';
        icon.className = 'fas fa-chevron-down';
    } else {
        span.textContent = getCurrentLanguage() === 'tr' ? 'Filtreleri Gizle' : 'Hide Filters';
        icon.className = 'fas fa-chevron-up';
    }
}

// ===================
// UTILITY FUNCTIONS
// ===================

function updateResultCount() {
    const totalPetsElement = document.getElementById('total-pets');
    if (totalPetsElement) {
        totalPetsElement.textContent = filteredPets.length;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
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
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set background color based on type
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
    }, 3000);
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

// ===================
// URL PARAMETER HANDLING
// ===================

function initURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('pet');
    
    if (petId) {
        // If specific pet is requested, highlight it or scroll to it
        setTimeout(() => {
            const petCard = document.querySelector(`[data-pet-id="${petId}"]`);
            if (petCard) {
                petCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                petCard.style.boxShadow = '0 0 20px rgba(233, 133, 50, 0.5)';
                setTimeout(() => {
                    petCard.style.boxShadow = '';
                }, 2000);
            }
        }, 500);
    }
}

// ===================
// SEARCH FUNCTIONALITY (Future Enhancement)
// ===================

function initSearch() {
    // This can be added in the future to search by name, breed, etc.
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (searchTerm) {
                filteredPets = mockPetsData.filter(pet => 
                    pet.name.toLowerCase().includes(searchTerm) ||
                    pet.breed.toLowerCase().includes(searchTerm) ||
                    pet.description.toLowerCase().includes(searchTerm)
                );
            } else {
                applyFiltersAndSort();
                return;
            }
            
            applySorting();
            renderPets();
            updateResultCount();
            resetPagination();
        }, 300));
    }
}

// ===================
// PERFORMANCE OPTIMIZATION
// ===================

// Lazy load images when they come into viewport
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================
// ERROR HANDLING
// ===================

window.addEventListener('error', (e) => {
    console.error('Sahiplen Page Error:', e.error);
    showNotification('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// ===================
// EXPORTS
// ===================

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAdoptPage,
        applyFiltersAndSort,
        renderPets,
        currentFilters,
        filteredPets
    };
}