/**
 * Pet Detail Page JavaScript - Firebase Version
 */

let currentPet = null;
let currentImageIndex = 0;
let isPhoneVisible = false;

import { CachedPetsService } from './firebase-data-service.js';

const elements = {
    petNameBreadcrumb: document.getElementById('pet-name-breadcrumb'),
    petName: document.getElementById('pet-name'),
    petBreed: document.getElementById('pet-breed'),
    petAge: document.getElementById('pet-age'),
    petLocation: document.getElementById('pet-location'),
    petDate: document.getElementById('pet-date'),
    petTypeBadge: document.getElementById('pet-type-badge'),
    petSize: document.getElementById('pet-size'),
    petGender: document.getElementById('pet-gender'),
    urgentBadge: document.getElementById('urgent-badge'),
    healthTags: document.getElementById('health-tags'),
    petDescription: document.getElementById('pet-description'),
    mainImage: document.getElementById('main-image'),
    thumbnailsContainer: document.getElementById('thumbnails-container'),
    totalImages: document.getElementById('total-images'),
    currentImageNum: document.getElementById('current-image-num'),
    prevImageBtn: document.getElementById('prev-image'),
    nextImageBtn: document.getElementById('next-image'),
    caretaker: {
        avatar: document.querySelector('.avatar-img'),
        onlineStatus: document.querySelector('.online-status'),
        name: document.querySelector('.caretaker-name'),
        role: document.querySelector('.caretaker-role'),
    },
    callBtn: document.getElementById('call-btn'),
    whatsappBtn: document.getElementById('whatsapp-btn'),
    messageBtn: document.getElementById('message-btn'),
    phoneDisplay: document.getElementById('phone-number'),
    responseTime: document.getElementById('caretaker-response-time'),
    similarPetsContainer: document.getElementById('similar-pets-container'),
    messageModal: document.getElementById('message-modal'),
    closeMessageModalBtn: document.getElementById('close-message-modal'),
    messageForm: document.getElementById('message-form'),
    modalOverlay: document.querySelector('.modal-overlay'),
    adoptionApplicationForm: document.getElementById('adoption-application-form'),
};

document.addEventListener('DOMContentLoaded', () => {
    initPetDetailPage();
});

async function initPetDetailPage() {
    console.log('🐾 Initializing Pet Detail Page with Firebase');
    
    const urlParams = new URLSearchParams(window.location.search);
    const petId = urlParams.get('id');
    
    if (!petId) {
        window.location.href = 'adopt.html';
        return;
    }

    try {
        
        await loadPetData(petId);
        initImageGallery();
        initContactButtons();
        initApplicationForm();
        initMessageModal();
        initShareButton();
        console.log('✅ Pet Detail Page Initialized');
    } catch (error) {
        console.error('Error initializing pet detail page:', error);
        showNotification('Hayvan bilgileri yüklenemedi', 'error');
        setTimeout(() => window.location.href = 'adopt.html', 2000);
    }
}


async function loadPetData(petId) {
    try {
        // Fetch the pet data
        currentPet = await CachedPetsService.getById(petId);
        
        if (!currentPet) {
            throw new Error('Pet not found');
        }
        
        console.log('Pet data loaded:', currentPet); // Log for debugging
        
        // Update page content only if currentPet is not undefined or null
        updatePageContent();
        updatePageTitle();
        await loadSimilarPets();
    } catch (error) {
        console.error('Error loading pet:', error);
        throw error;
    }
}

function updatePageContent() {
    if (!currentPet) {
        console.error('currentPet is undefined');
        return;
    }

    const currentLang = getCurrentLanguage();
    
    // Safely update the pet details
    elements.petNameBreadcrumb.textContent = currentPet.name || 'Unknown Name';
    elements.petName.textContent = currentPet.name || 'Unknown Name';
    elements.petBreed.textContent = currentPet.breed || 'Unknown Breed';
    elements.petAge.textContent = `${currentPet.age || 'Unknown'} yaşında`;
    elements.petLocation.textContent = currentPet.location || 'Unknown Location';
    
    // Add description
    elements.petDescription.textContent = currentPet.description || 'Açıklama bulunamadı.';
    
    // Update translated fields
    updateTranslatedFields(currentLang);
    
    // Format date safely
    const dateAdded = currentPet.dateAdded ? new Date(currentPet.dateAdded) : new Date();
    const formattedDate = dateAdded.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    elements.petDate.textContent = formattedDate;
    
    // Safely check if urgent property exists
    if (currentPet.urgent) {
        elements.urgentBadge.classList.remove('hidden');
    } else {
        elements.urgentBadge.classList.add('hidden');
    }
    
    // Call other update functions
    updateHealthTags();
    updateCaretakerInfo();
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
    
    const typeBadge = elements.petTypeBadge;
    const typeText = translations.type[currentPet.type];
    if (typeText) {
        typeBadge.textContent = typeText[lang];
        typeBadge.setAttribute('data-tr', typeText.tr);
        typeBadge.setAttribute('data-en', typeText.en);
    }
    
    const sizeElement = elements.petSize;
    const sizeText = translations.size[currentPet.size];
    if (sizeText) {
        sizeElement.textContent = sizeText[lang];
        sizeElement.setAttribute('data-tr', sizeText.tr);
        sizeElement.setAttribute('data-en', sizeText.en);
    }
    
    const genderElement = elements.petGender;
    const genderText = translations.gender[currentPet.gender];
    if (genderText) {
        genderElement.textContent = genderText[lang];
        genderElement.setAttribute('data-tr', genderText.tr);
        genderElement.setAttribute('data-en', genderText.en);
    }
}

function updateHealthTags() {
    const healthContainer = elements.healthTags;
    const healthTranslations = {
        'vaccinated': { tr: 'Aşılı', en: 'Vaccinated' },
        'sterilized': { tr: 'Kısırlaştırılmış', en: 'Sterilized' },
        'microchipped': { tr: 'Çipli', en: 'Microchipped' }
    };
    
    const allHealthOptions = ['vaccinated', 'sterilized', 'microchipped'];
    
    healthContainer.innerHTML = allHealthOptions.map(health => {
        // Handle both old array format and new map format
        let hasHealth = false;
        if (Array.isArray(currentPet.health)) {
            hasHealth = currentPet.health.includes(health);
        } else if (typeof currentPet.health === 'object') {
            hasHealth = currentPet.health[health] === true;
        }
        
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

function updateCaretakerInfo() {
    const caretaker = currentPet.caretaker;
    
    const avatarImg = document.querySelector('.avatar-img');
    if (avatarImg) {
        avatarImg.src = caretaker.avatar;
        avatarImg.alt = caretaker.name;
    }
    
    const onlineStatus = document.querySelector('.online-status');
    if (onlineStatus) {
        onlineStatus.style.backgroundColor = caretaker.online ? '#27ae60' : '#95a5a6';
    }
    
    const caretakerName = document.querySelector('.caretaker-name');
    if (caretakerName) caretakerName.textContent = caretaker.name;

    const caretakerRole = document.querySelector('.caretaker-role');
    if (caretakerRole) caretakerRole.textContent = caretaker.role;
 
    const responseHoursEl = document.querySelector('.availability-hours');
    if (responseHoursEl) {
        responseHoursEl.textContent = caretaker.responseTime || '19:00 - 23:00';
    }
}

function updatePageTitle() {
    document.title = `${currentPet.name} - Sahiplendirme İlanı - Pati Gönüllüleri`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = `${currentPet.name} adlı ${currentPet.breed} ${currentPet.type === 'dog' ? 'köpeğimizi' : 'kedimizi'} sahiplenmek için detaylı bilgiler, fotoğraflar ve iletişim bilgileri.`;
    }
}

function getCurrentLanguage() {
    return window.currentLanguage || 'tr';
}

function initImageGallery() {
    const prevBtn = elements.prevImageBtn;
    const nextBtn = elements.nextImageBtn;
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', showPreviousImage);
        nextBtn.addEventListener('click', showNextImage);
    }
    
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
    
    const mainImage = elements.mainImage;
    const thumbnailsContainer = document.querySelector('.thumbnails-container');
    const totalImages = elements.totalImages;
    const currentImageNum = elements.currentImageNum;
    
    mainImage.src = currentPet.images[0];
    mainImage.alt = currentPet.name;
    
    totalImages.textContent = currentPet.images.length;
    currentImageNum.textContent = '1';
    
    thumbnailsContainer.innerHTML = currentPet.images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${index}">
            <img src="${currentPet.thumbnails ? currentPet.thumbnails[index] : image}" alt="${currentPet.name} ${index + 1}">
        </div>
    `).join('');
    
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
    
    const mainImage = elements.mainImage;
    const thumbnails = document.querySelectorAll('.thumbnail');
    const currentImageNum = elements.currentImageNum;
    
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.src = images[index];
        mainImage.style.opacity = '1';
    }, 150);
    
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    if (thumbnails[index]) {
        thumbnails[index].classList.add('active');
    }
    
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

function initContactButtons() {
    const callBtn = elements.callBtn;
    const whatsappBtn = elements.whatsappBtn;
    const messageBtn = elements.messageBtn;
    const responseEl = elements.responseTime;
    
    if (callBtn) {
        callBtn.addEventListener('click', handleCallClick);
    }
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', handleWhatsAppClick);
    }
    
    if (messageBtn) {
        messageBtn.addEventListener('click', handleMessageClick);
    }
    
}

function handleCallClick() {
    if (!currentPet || !currentPet.caretaker) {
        showNotification('Telefon numarası mevcut değil. Lütfen mesaj veya e-posta ile iletişime geçin.', 'info');
        return;
    }
    
    // Get the raw phone number from the pet's caretaker data
    const rawPhoneNumber = currentPet.caretaker.phone || currentPet.caretaker.phoneNumber;
    
    if (rawPhoneNumber) {
        // Remove all non-digit characters except the leading +
        let cleanedPhoneNumber = rawPhoneNumber.toString().trim();
        
        // If it starts with +, keep it and remove other non-digits
        if (cleanedPhoneNumber.startsWith('+')) {
            cleanedPhoneNumber = '+' + cleanedPhoneNumber.substring(1).replace(/\D/g, '');
        } else {
            // Remove all non-digits
            cleanedPhoneNumber = cleanedPhoneNumber.replace(/\D/g, '');
        }
        
        // Open the phone dialer with the number
        window.location.href = `tel:${cleanedPhoneNumber}`;
        
        console.log('Call initiated for:', cleanedPhoneNumber);
    } else {
        showNotification('Telefon numarası mevcut değil. Lütfen mesaj veya e-posta ile iletişime geçin.', 'info');
    }
}


function handleWhatsAppClick() {
    if (!currentPet) return;
    const rawPhone = currentPet.caretaker.phone || currentPet.caretaker.phoneNumber || '';
    const phoneNumber = rawPhone.replace(/\D/g, '');
    if (!phoneNumber) {
        showNotification('WhatsApp için telefon numarası mevcut değil.', 'info');
        return;
    }
    const message = encodeURIComponent(`Merhaba, ${currentPet.name} hakkında bilgi alabilir miyim?`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    console.log('WhatsApp contact initiated for pet:', currentPet.id);
}

function handleMessageClick() {
    const modal = elements.messageModal;
    if (modal) {
        modal.classList.remove('hidden');
        
        const messageText = document.getElementById('message-text');
        if (messageText) {
            messageText.value = `Merhaba, ${currentPet.name} hakkında daha fazla bilgi alabilir miyim?`;
        }
    }
}

function handleCopyPhone() {
    // Copy phone removed from UI; keep function as no-op
    showNotification('Telefon kopyalama kaldırıldı', 'info');
}

function fallbackCopyPhone(text) {
    // No-op fallback since phone copy was removed
}

function initMessageModal() {
    const modal = elements.messageModal;
    const closeBtn = elements.closeMessageModalBtn;
    const overlay = document.querySelector('.modal-overlay');
    const messageForm = elements.messageForm;
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMessageModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMessageModal);
    }
    
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeMessageModal();
        }
    });
}

function closeMessageModal() {
    const modal = elements.messageModal;
    if (modal) {
        modal.classList.add('hidden');
    }
}

function handleMessageSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Validate required fields
    if (!name || !email || !message) {
        showNotification('Lütfen tüm gerekli alanları doldurun', 'error');
        return;
    }
    
    // Build email content
    const subject = `${currentPet.name} Hakkında Bilgi Talebi - ${name}`;
    const body = `
Merhaba,

${currentPet.name} hakkında bilgi almak istiyorum.

--- İletişim Bilgileri ---
Ad Soyad: ${name}
E-posta: ${email}
Telefon: ${phone || 'Belirtilmedi'}

--- Mesaj ---
${message}

---
Bu mesaj Pati Gönüllüleri web sitesi üzerinden gönderilmiştir.
Hayvan: ${currentPet.name} (ID: ${currentPet.id})
    `.trim();
    
    const caretakerEmail = currentPet.caretaker.mail || currentPet.caretaker.email || 'iletisim@patigonulluleri.com';
    
    // Create mailto link
    const mailtoLink = `mailto:${caretakerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
    // Close modal and reset form
    closeMessageModal();
    e.target.reset();
    
    showNotification('E-posta uygulamanız açılıyor...', 'success');
}

function initApplicationForm() {
    const applicationForm = elements.adoptionApplicationForm;
    
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
        agreement: formData.get('agreement') === 'on'
    };
    
    // Validate required fields
    if (!applicationData.name || !applicationData.phone || !applicationData.email || 
        !applicationData.livingSituation || !applicationData.experience || !applicationData.agreement) {
        showNotification('Lütfen tüm gerekli alanları doldurun', 'error');
        return;
    }
    
    // Get translated values for living situation and experience
    const livingSituationOptions = {
        'apartment': 'Apartman dairesi',
        'house-with-garden': 'Bahçeli ev',
        'house-no-garden': 'Bahçesiz ev',
        'farm': 'Çiftlik/Köy evi'
    };
    
    const experienceOptions = {
        'first-time': 'İlk defa hayvan sahipleneceğim',
        'some-experience': 'Daha önce hayvan besledim',
        'experienced': 'Çok deneyimliyim'
    };
    
    // Build email content
    const subject = `Sahiplendirme Başvurusu - ${currentPet.name} - ${applicationData.name}`;
    const body = `
Merhaba,

${currentPet.name} için sahiplendirme başvurusu yapmak istiyorum.

--- Başvuru Sahibi Bilgileri ---
Ad Soyad: ${applicationData.name}
Telefon: ${applicationData.phone}
E-posta: ${applicationData.email}

--- Yaşam Durumu ---
Konut Tipi: ${livingSituationOptions[applicationData.livingSituation] || applicationData.livingSituation}
Deneyim: ${experienceOptions[applicationData.experience] || applicationData.experience}

--- Ek Notlar ---
${applicationData.notes || 'Ek not bulunmamaktadır.'}

--- Onay ---
✓ Sahiplendirme koşullarını kabul ediyorum

---
Bu başvuru Pati Gönüllüleri web sitesi üzerinden gönderilmiştir.
Hayvan: ${currentPet.name}
ID: ${currentPet.id}
Tarih: ${new Date().toLocaleDateString('tr-TR')}
    `.trim();
    
    // Get caretaker email - handle both 'email' and 'mail' field names
    const caretakerEmail = currentPet.caretaker.mail || currentPet.caretaker.email || 'iletisim@patigonulluleri.com';
    
    // Create mailto link
    const mailtoLink = `mailto:${caretakerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open default email client
    window.location.href = mailtoLink;
    
    // Reset form and show notification
    e.target.reset();
    showNotification('E-posta uygulamanız açılıyor...', 'success');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

async function loadSimilarPets() {
    if (!currentPet) return;

    try {
        const allPets = await CachedPetsService.getAll();
        const similarPets = allPets
            .filter(pet => pet.id !== currentPet.id && pet.type === currentPet.type)
            .slice(0, 3);

        const container = elements.similarPetsContainer;
        if (!container) return;

        if (similarPets.length === 0) {
            container.innerHTML = '<p>Benzer hayvan bulunamadı.</p>';
            return;
        }

        container.innerHTML = similarPets.map(pet => createSimilarPetCard(pet)).join('');

        const petCards = container.querySelectorAll('.adopt-pet-card');
        petCards.forEach(card => {
            card.addEventListener('click', () => {
                const petId = card.dataset.petId;
                window.location.href = `pet-detail.html?id=${petId}`;
            });
        });
    } catch (error) {
        console.error('Error loading similar pets:', error);
    }
}

function createSimilarPetCard(pet) {
    const currentLang = getCurrentLanguage();
    const translatedData = translatePetData(pet, currentLang);
    const urgentBadge = pet.urgent ? `<div class="pet-urgent-badge" data-tr="ACİL" data-en="URGENT">ACİL</div>` : '';
    const healthTags = (() => {
    const healthTranslations = {
        'vaccinated': { tr: 'Aşılı', en: 'Vaccinated' },
        'sterilized': { tr: 'Kısırlaştırılmış', en: 'Sterilized' },
        'microchipped': { tr: 'Çipli', en: 'Microchipped' }
    };
    
    const healthArray = [];
    if (Array.isArray(pet.health)) {
        healthArray.push(...pet.health);
    } else if (typeof pet.health === 'object') {
        Object.keys(pet.health).forEach(key => {
            if (pet.health[key] === true) healthArray.push(key);
        });
    }
    
    return healthArray.map(health => {
        const healthText = healthTranslations[health] ? healthTranslations[health][currentLang] : health;
        return `<span class="pet-tag">${healthText}</span>`;
    }).join('');
})();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', options);
    };

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
        description: pet.description
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