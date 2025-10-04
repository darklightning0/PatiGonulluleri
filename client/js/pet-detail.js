/**
 * Pet Detail Page JavaScript - Firebase Version
 */

let currentPet = null;
let currentImageIndex = 0;
let isPhoneVisible = false;

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
    specialNotesContainer: document.getElementById('special-notes-container'),
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
        phoneText: document.querySelector('.phone-text'),
    },
    callBtn: document.getElementById('call-btn'),
    whatsappBtn: document.getElementById('whatsapp-btn'),
    messageBtn: document.getElementById('message-btn'),
    phoneDisplay: document.getElementById('phone-number'),
    copyBtn: document.querySelector('.copy-btn'),
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
        // Wait for PetsService to be ready
        await waitForService('PetsService');
        
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

function waitForService(serviceName, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkService = () => {
            if (window[serviceName]) {
                console.log(`${serviceName} is ready`);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`${serviceName} not available after ${timeout}ms`));
            } else {
                setTimeout(checkService, 100);
            }
        };
        
        checkService();
    });
}

async function loadPetData(petId) {
    try {
        if (typeof window.PetsService === 'undefined') {
            throw new Error('PetsService not available');
        }

        currentPet = await window.PetsService.getPetById(petId);
        
        if (!currentPet) {
            throw new Error('Pet not found');
        }
        
        updatePageContent();
        updatePageTitle();
        await loadSimilarPets();
        
        console.log('Pet data loaded:', currentPet);
    } catch (error) {
        console.error('Error loading pet:', error);
        throw error;
    }
}

function updatePageContent() {
    const currentLang = getCurrentLanguage();
    
    elements.petNameBreadcrumb.textContent = currentPet.name;
    elements.petName.textContent = currentPet.name;
    elements.petBreed.textContent = currentPet.breed;
    elements.petAge.textContent = `${currentPet.age} yaşında`;
    elements.petLocation.textContent = currentPet.location;
    
    updateTranslatedFields(currentLang);
    
    const dateAdded = new Date(currentPet.dateAdded);
    const formattedDate = dateAdded.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    elements.petDate.textContent = formattedDate;
    
    if (currentPet.urgent) {
        elements.urgentBadge.classList.remove('hidden');
    } else {
        elements.urgentBadge.classList.add('hidden');
    }
    
    updateHealthTags();
    
    const descriptionContainer = elements.petDescription;
    const paragraphs = currentPet.description.split('\n\n');
    descriptionContainer.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    
    updateSpecialNotes();
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
    
    const phoneText = document.querySelector('.phone-text');
    if (phoneText) {
        phoneText.textContent = caretaker.phone;
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
    const phoneDisplay = elements.phoneNumber;
    
    if (!isPhoneVisible) {
        phoneDisplay.classList.remove('hidden');
        isPhoneVisible = true;
        
        const callBtn = elements.callBtn;
        callBtn.innerHTML = `
            <i class="fas fa-phone"></i>
            <span>Gizle</span>
            <small>Telefonu gizle</small>
        `;
        
        console.log('Phone number revealed for pet:', currentPet.id);
    } else {
        phoneDisplay.classList.add('hidden');
        isPhoneVisible = false;
        
        const callBtn = elements.callBtn;
        callBtn.innerHTML = `
            <i class="fas fa-phone"></i>
            <span data-tr="Ara" data-en="Call">Ara</span>
            <small data-tr="Hemen görüş" data-en="Talk now">Hemen görüş</small>
        `;
    }
}

function handleWhatsAppClick() {
    if (!currentPet) return;
    
    const phoneNumber = currentPet.caretaker.phone.replace(/\D/g, '');
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
    const messageData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        message: formData.get('message'),
        petId: currentPet.id,
        petName: currentPet.name
    };
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Gönderiliyor...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        console.log('Message sent:', messageData);
        
        showNotification('Mesajınız gönderildi! En kısa sürede dönüş yapılacaktır.', 'success');
        
        closeMessageModal();
        e.target.reset();
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    }, 2000);
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
        agreement: formData.get('agreement') === 'on',
        petId: currentPet.id,
        petName: currentPet.name,
        timestamp: new Date().toISOString()
    };
    
    if (!applicationData.name || !applicationData.phone || !applicationData.email || 
        !applicationData.livingSituation || !applicationData.experience || !applicationData.agreement) {
        showNotification('Lütfen tüm gerekli alanları doldurun', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Gönderiliyor...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        console.log('Application submitted:', applicationData);
        
        showNotification('Başvurunuz alındı! Sahiplendirme ekibimiz en kısa sürede sizinle iletişime geçecektir.', 'success');
        
        e.target.reset();
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    }, 2000);
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
        const allPets = await window.PetsService.getAllPets();
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