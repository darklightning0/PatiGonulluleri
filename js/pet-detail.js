// ===================
// GLOBAL VARIABLES
// ===================

let currentPet = null;
let currentImageIndex = 0;
let isPhoneVisible = false;

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', () => {
    initPetDetailPage();
});

function initPetDetailPage() {
    console.log('🐾 Initializing Pet Detail Page');
    
    // Get pet ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');
    
    // Check if PETS_DATA is available
    if (typeof PETS_DATA === 'undefined') {
        console.error('PETS_DATA not found. Make sure pets-data.js is loaded.');
        return;
    }
    
    if (petId) {
        loadPetData(petId);
    } else {
        // Fallback to first pet if no ID provided
        loadPetData(PETS_DATA[0].id);
    }
    
    // Initialize components
    initImageGallery();
    initContactButtons();
    initApplicationForm();
    initMessageModal();
    initShareButton();
    
    console.log('✅ Pet Detail Page Initialized');
}

// ===================
// PET DATA LOADING
// ===================

function loadPetData(petId) {
    // Find pet in PETS_DATA
    currentPet = PETS_DATA.find(pet => pet.id === parseInt(petId));
    
    if (!currentPet) {
        console.error('Pet not found:', petId);
        // Redirect to adopt page or show error
        window.location.href = 'adopt.html';
        return;
    }
    
    // Update page with pet data
    updatePageContent();
    updatePageTitle();
    loadSimilarPets();
    
    console.log('Pet data loaded:', currentPet);
}

function updatePageContent() {
    const currentLang = getCurrentLanguage();
    
    // Update basic info
    document.getElementById('pet-name-breadcrumb').textContent = currentPet.name;
    document.getElementById('pet-name').textContent = currentPet.name;
    document.getElementById('pet-breed').textContent = currentPet.breed;
    document.getElementById('pet-age').textContent = `${currentPet.age} yaşında`;
    document.getElementById('pet-location').textContent = currentPet.location;
    
    // Update translated fields
    updateTranslatedFields(currentLang);
    
    // Update date
    const dateAdded = new Date(currentPet.dateAdded);
    const formattedDate = dateAdded.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('pet-date').textContent = formattedDate;
    
    // Update urgent badge
    const urgentBadge = document.getElementById('urgent-badge');
    if (currentPet.urgent) {
        urgentBadge.classList.remove('hidden');
    } else {
        urgentBadge.classList.add('hidden');
    }
    
    // Update health tags
    updateHealthTags();
    
    // Update description
    const descriptionContainer = document.getElementById('pet-description');
    const paragraphs = currentPet.description.split('\n\n');
    descriptionContainer.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    
    // Update special notes
    updateSpecialNotes();
    
    // Update caretaker info
    updateCaretakerInfo();
    
    // Update images
    updateImageGallery();
}

function updateTranslatedFields(lang) {
    const translations = {
        type: {
            dog: { tr: 'Köpek', en: 'Dog' },
            cat: { tr: 'Kedi', en: 'Cat' }
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
    
    // Update type badge
    const typeBadge = document.getElementById('pet-type-badge');
    const typeText = translations.type[currentPet.type];
    if (typeText) {
        typeBadge.textContent = typeText[lang];
        typeBadge.setAttribute('data-tr', typeText.tr);
        typeBadge.setAttribute('data-en', typeText.en);
    }
    
    // Update size
    const sizeElement = document.getElementById('pet-size');
    const sizeText = translations.size[currentPet.size];
    if (sizeText) {
        sizeElement.textContent = sizeText[lang];
        sizeElement.setAttribute('data-tr', sizeText.tr);
        sizeElement.setAttribute('data-en', sizeText.en);
    }
    
    // Update gender
    const genderElement = document.getElementById('pet-gender');
    const genderText = translations.gender[currentPet.gender];
    if (genderText) {
        genderElement.textContent = genderText[lang];
        genderElement.setAttribute('data-tr', genderText.tr);
        genderElement.setAttribute('data-en', genderText.en);
    }
}

function updateHealthTags() {
    const healthContainer = document.getElementById('health-tags');
    const healthTranslations = {
        'vaccinated': { tr: 'Aşılı', en: 'Vaccinated' },
        'sterilized': { tr: 'Kısırlaştırılmış', en: 'Sterilized' },
        'microchipped': { tr: 'Çipli', en: 'Microchipped' }
    };
    
    const allHealthOptions = ['vaccinated', 'sterilized', 'microchipped'];
    
    healthContainer.innerHTML = allHealthOptions.map(health => {
        const hasHealth = currentPet.health.includes(health);
        const healthText = healthTranslations[health];
        const statusClass = hasHealth ? 'verified' : 'not-verified';
        const iconClass = hasHealth ? 'fas fa-check-circle' : 'fas fa-times-circle';
        
        return `
            <span class="health-tag ${statusClass}" data-tr="${healthText.tr}" data-en="${healthText.en}">
                <i class="${iconClass}"></i> ${healthText.tr}
            </span>
        `;
    }).join('');
}

function updateSpecialNotes() {
    const notesContainer = document.querySelector('.notes-content');
    
    notesContainer.innerHTML = currentPet.specialNotes.map(note => `
        <div class="note-item">
            <i class="fas ${note.icon}"></i>
            <span>${note.text}</span>
        </div>
    `).join('');
}

function updateCaretakerInfo() {
    const caretaker = currentPet.caretaker;
    
    // Update avatar and online status
    const avatarImg = document.querySelector('.avatar-img');
    if (avatarImg) {
        avatarImg.src = caretaker.avatar;
        avatarImg.alt = caretaker.name;
    }
    
    const onlineStatus = document.querySelector('.online-status');
    if (onlineStatus) {
        onlineStatus.style.backgroundColor = caretaker.online ? '#27ae60' : '#95a5a6';
    }
    
    // Update caretaker details safely
    const caretakerName = document.querySelector('.caretaker-name');
    if (caretakerName) caretakerName.textContent = caretaker.name;

    const caretakerRole = document.querySelector('.caretaker-role');
    if (caretakerRole) caretakerRole.textContent = caretaker.role;
    
    // Safely update phone number
    const phoneText = document.querySelector('.phone-text');
    if (phoneText) {
        phoneText.textContent = caretaker.phone;
    }
}

function updatePageTitle() {
    document.title = `${currentPet.name} - Sahiplendirme İlanı - Pati Gönüllüleri`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = `${currentPet.name} adlı ${currentPet.breed} ${currentPet.type === 'dog' ? 'köpeğimizi' : 'kedimizi'} sahiplenmek için detaylı bilgiler, fotoğraflar ve iletişim bilgileri.`;
    }
}

function getCurrentLanguage() {
    return window.currentLanguage || 'tr';
}

// ===================
// IMAGE GALLERY
// ===================

function initImageGallery() {
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', showPreviousImage);
        nextBtn.addEventListener('click', showNextImage);
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });
}

function updateImageGallery() {
    if (!currentPet || !currentPet.images) return;
    
    const mainImage = document.getElementById('main-image');
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    const totalImages = document.getElementById('total-images');
    const currentImageNum = document.getElementById('current-image-num');
    
    // Update main image
    mainImage.src = currentPet.images[0];
    mainImage.alt = currentPet.name;
    
    // Update total count
    totalImages.textContent = currentPet.images.length;
    currentImageNum.textContent = '1';
    
    // Update thumbnails
    thumbnailsContainer.innerHTML = currentPet.images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${index}">
            <img src="${currentPet.thumbnails ? currentPet.thumbnails[index] : image}" alt="${currentPet.name} ${index + 1}">
        </div>
    `).join('');
    
    // Add thumbnail click handlers
    const thumbnails = thumbnailsContainer.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => showImage(index));
    });
    
    currentImageIndex = 0;
}

function showImage(index) {
    if (!currentPet || !currentPet.images) return;
    
    const images = currentPet.images;
    if (index < 0 || index >= images.length) return;
    
    const mainImage = document.getElementById('main-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const currentImageNum = document.getElementById('current-image-num');
    
    // Update main image
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.src = images[index];
        mainImage.style.opacity = '1';
    }, 150);
    
    // Update active thumbnail
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    if (thumbnails[index]) {
        thumbnails[index].classList.add('active');
    }
    
    // Update counter
    currentImageNum.textContent = index + 1;
    currentImageIndex = index;
}

function showNextImage() {
    if (!currentPet) return;
    const nextIndex = (currentImageIndex + 1) % currentPet.images.length;
    showImage(nextIndex);
}

function showPreviousImage() {
    if (!currentPet) return;
    const prevIndex = currentImageIndex === 0 ? currentPet.images.length - 1 : currentImageIndex - 1;
    showImage(prevIndex);
}

// ===================
// CONTACT FUNCTIONALITY
// ===================

function initContactButtons() {
    const callBtn = document.getElementById('call-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const messageBtn = document.getElementById('message-btn');
    const copyBtn = document.querySelector('.copy-btn');
    
    if (callBtn) {
        callBtn.addEventListener('click', handleCallClick);
    }
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', handleWhatsAppClick);
    }
    
    if (messageBtn) {
        messageBtn.addEventListener('click', handleMessageClick);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopyPhone);
    }
}

function handleCallClick() {
    const phoneNumber = document.querySelector('.phone-text').textContent;
    const phoneDisplay = document.getElementById('phone-number');
    
    if (!isPhoneVisible) {
        // Show phone number
        phoneDisplay.classList.remove('hidden');
        isPhoneVisible = true;
        
        // Update button text
        const callBtn = document.getElementById('call-btn');
        callBtn.innerHTML = `
            <i class="fas fa-phone"></i>
            <span>Gizle</span>
            <small>Telefonu gizle</small>
        `;
        
        // Track phone reveal (analytics)
        console.log('Phone number revealed for pet:', currentPet.id);
    } else {
        // Hide phone number
        phoneDisplay.classList.add('hidden');
        isPhoneVisible = false;
        
        // Reset button text
        const callBtn = document.getElementById('call-btn');
        callBtn.innerHTML = `
            <i class="fas fa-phone"></i>
            <span data-tr="Ara" data-en="Call">Ara</span>
            <small data-tr="Hemen görüş" data-en="Talk now">Hemen görüş</small>
        `;
    }
}

function handleWhatsAppClick() {
    if (!currentPet) return;
    
    const phoneNumber = currentPet.caretaker.phone.replace(/\D/g, ''); // Remove non-digits
    const message = encodeURIComponent(`Merhaba, ${currentPet.name} hakkında bilgi alabilir miyim?`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp click
    console.log('WhatsApp contact initiated for pet:', currentPet.id);
}

function handleMessageClick() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Pre-fill message
        const messageText = document.getElementById('message-text');
        if (messageText) {
            messageText.value = `Merhaba, ${currentPet.name} hakkında daha fazla bilgi alabilir miyim?`;
        }
    }
}

function handleCopyPhone() {
    const phoneText = document.querySelector('.phone-text').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(phoneText).then(() => {
            showNotification('Telefon numarası kopyalandı!', 'success');
        }).catch(() => {
            fallbackCopyPhone(phoneText);
        });
    } else {
        fallbackCopyPhone(phoneText);
    }
}

function fallbackCopyPhone(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Telefon numarası kopyalandı!', 'success');
    } catch (err) {
        showNotification('Kopyalama başarısız oldu', 'error');
    }
    
    document.body.removeChild(textArea);
}

// ===================
// MESSAGE MODAL
// ===================

function initMessageModal() {
    const modal = document.getElementById('message-modal');
    const closeBtn = document.getElementById('close-message-modal');
    const overlay = document.querySelector('.modal-overlay');
    const messageForm = document.getElementById('message-form');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMessageModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMessageModal);
    }
    
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeMessageModal();
        }
    });
}

function closeMessageModal() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function handleMessageSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const messageData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        message: formData.get('message'),
        petId: currentPet.id,
        petName: currentPet.name
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Gönderiliyor...</span>';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In real app, send to backend
        console.log('Message sent:', messageData);
        
        // Show success message
        showNotification('Mesajınız gönderildi! En kısa sürede dönüş yapılacaktır.', 'success');
        
        // Close modal and reset form
        closeMessageModal();
        e.target.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    }, 2000);
}

// ===================
// APPLICATION FORM
// ===================

function initApplicationForm() {
    const applicationForm = document.getElementById('adoption-application-form');
    
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }
}

function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const applicationData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        livingSituation: formData.get('livingSituation'),
        experience: formData.get('experience'),
        notes: formData.get('notes'),
        agreement: formData.get('agreement') === 'on',
        petId: currentPet.id,
        petName: currentPet.name,
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!applicationData.name || !applicationData.phone || !applicationData.email || 
        !applicationData.livingSituation || !applicationData.experience || !applicationData.agreement) {
        showNotification('Lütfen tüm gerekli alanları doldurun', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Gönderiliyor...</span>';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In real app, send to backend
        console.log('Application submitted:', applicationData);
        
        // Show success message
        showNotification('Başvurunuz alındı! Sahiplendirme ekibimiz en kısa sürede sizinle iletişime geçecektir.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    }, 2000);
}

// ===================
// SHARE
// ===================

function initShareButton() {
    const shareBtn = document.querySelector('.share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShareClick);
    }
}

function handleShareClick() {
    if (!currentPet) return;
    
    const shareData = {
        title: `${currentPet.name} - Sahiplendirme İlanı`,
        text: `${currentPet.name} adlı ${currentPet.breed} sahiplenmeyi bekliyor!`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                console.log('Content shared successfully');
                showNotification('Başarıyla paylaşıldı!', 'success');
            })
            .catch(err => {
                console.error('Error sharing:', err);
                fallbackShare();
            });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Create share modal or copy URL to clipboard
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link kopyalandı! Paylaşabilirsiniz.', 'success');
        }).catch(() => {
            showManualShare(url);
        });
    } else {
        showManualShare(url);
    }
}

function showManualShare(url) {
    // Create temporary input to select URL
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Link kopyalandı! Paylaşabilirsiniz.', 'success');
    } catch (err) {
        showNotification('URL: ' + url, 'info');
    }
    
    document.body.removeChild(textArea);
}

// ===================
// SIMILAR PETS
// ===================

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
    const petCards = container.querySelectorAll('.adopt-pet-card');
    petCards.forEach(card => {
        card.addEventListener('click', () => {
            const petId = card.dataset.petId;
            window.location.href = `pet-detail.html?id=${petId}`;
        });
    });
}

function calculateSimilarityScore(pet, currentPet) {
    let score = 0;
    
    // Type match (highest weight)
    if (pet.type === currentPet.type) score += 5;
    
    // Age group match (assuming ageGroup property exists in your data)
    if (pet.ageGroup === currentPet.ageGroup) score += 3;
    
    // Size match
    if (pet.size === currentPet.size) score += 2;
    
    // Gender match
    if (pet.gender === currentPet.gender) score += 1;
    
    // Health attributes match
    const healthMatch = pet.health.filter(h => currentPet.health.includes(h)).length;
    score += healthMatch * 0.5;
    
    return score;
}

// THIS FUNCTION IS NOW CORRECTED TO MATCH THE STYLE FROM ADOPT.JS
function createSimilarPetCard(pet) {
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

    // Always render in grid style, without description
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
                <!-- NO DESCRIPTION -->
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
}

// Helper function for translations, needed by the new card function
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
        breed: pet.breed,
        description: pet.description // Not used for similar cards
    };
}



// ===================
// UTILITY FUNCTIONS
// ===================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
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
        max-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        line-height: 1.4;
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
    }, 4000);
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
// ANALYTICS & TRACKING
// ===================

function trackPetView() {
    if (!currentPet) return;
    
    // In real app, send to analytics service
    const viewData = {
        petId: currentPet.id,
        petName: currentPet.name,
        petType: currentPet.type,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent
    };
    
    console.log('Pet view tracked:', viewData);
    
    // Could also update view count in database
    // updatePetViewCount(currentPet.id);
}

// ===================
// INITIALIZATION COMPLETION
// ===================

// Call additional initialization functions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after main initialization
    setTimeout(() => {
        initShareButton();
        trackPetView();
    }, 500);
});


