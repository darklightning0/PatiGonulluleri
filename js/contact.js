/**
 * Contact Page JavaScript
 * Handles form submissions, FAQ interactions, and contact functionality
 */

// ===================
// GLOBAL VARIABLES
// ===================

let isSubmitting = false;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzk-mCVqMgOB4tJrqkNDJRmyA-0qLIw9w8vMP7dEmjm9vSEB6chvDn9dLblkF0EILDIng/exec";

// ===================
// INITIALIZATION
// ===================

document.addEventListener("DOMContentLoaded", () => {
  initContactPage();
  initAdoptionForm();
});

function initContactPage() {
  console.log('📞 Initializing Contact Page');
  
  initForms();
  initFAQ();
  initScrollAnimations();
  initNewsletterSignup();
  initAccessibilityEnhancements();
  
  console.log('✅ Contact Page Initialized');
}

// ===================
// ADOPTION FORM
// ===================

function initAdoptionForm() {
  const form = document.getElementById("adoptation-form");
  if (!form) return;

  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const fileInput = document.getElementById("photos");

  // File upload validation
  fileInput.addEventListener('change', validateFileUpload);

  // Form submission handler
  form.addEventListener("submit", handleAdoptionFormSubmit);

  // City/District handlers
  citySelect.addEventListener("change", () => {
    const selected = citySelect.options[citySelect.selectedIndex];
    const plateId = selected.dataset.plate;
    plateId ? loadDistricts(plateId) : (districtSelect.innerHTML = `<option value="">Önce şehir seçiniz</option>`);
  });

  loadCities();

  // Load cities
  async function loadCities() {
    try {
      const res = await fetch("https://turkiyeapi.dev/api/v1/provinces");
      const data = await res.json();
      citySelect.innerHTML = `<option value="">Şehir seçiniz</option>`;
      data.data.forEach(city => {
        const opt = document.createElement("option");
        opt.value = city.name;
        opt.textContent = city.name;
        opt.dataset.plate = city.id;
        citySelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Şehirler yüklenemedi:", err);
      citySelect.innerHTML = `<option value="">Şehir yüklenemedi</option>`;
    }
  }

  // Load districts
  async function loadDistricts(plateId) {
    try {
      const res = await fetch(`https://turkiyeapi.dev/api/v1/provinces/${plateId}`);
      const data = await res.json();
      districtSelect.innerHTML = `<option value="">İlçe seçiniz</option>`;
      data.data.districts.forEach(dist => {
        const opt = document.createElement("option");
        opt.value = dist.name;
        opt.textContent = dist.name;
        districtSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("İlçeler yüklenemedi:", err);
      districtSelect.innerHTML = `<option value="">İlçe yüklenemedi</option>`;
    }
  }
}

function validateFileUpload(e) {
  const files = e.target.files;
  const maxFiles = 3;
  const maxSize = 50 * 1024 * 1024;
  let totalSize = 0;

  if (files.length > maxFiles) {
    showNotification('En fazla 3 fotoğraf yükleyebilirsiniz.', 'error');
    e.target.value = '';
    return;
  }

  for (let file of files) {
    totalSize += file.size;
    if (!file.type.startsWith('image/')) {
      showNotification('Lütfen sadece fotoğraf yükleyin.', 'error');
      e.target.value = '';
      return;
    }
  }

  if (totalSize > maxSize) {
    showNotification('Toplam dosya boyutu 50MB\'ı geçemez.', 'error');
    e.target.value = '';
  }
}

async function handleAdoptionFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector(".submit-btn");

  if (!validateForm(form)) {
    showNotification('Lütfen tüm zorunlu alanları doldurun.', 'error');
    return;
  }

  if (!formData.get('privacyAgreement')) {
    showNotification('Lütfen KVKK metnini onaylayın.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

  try {
    const files = form.querySelector('#photos').files;
    
    // Convert files to Base64
    const filesData = await Promise.all(
      Array.from(files).map((file, i) => 
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({
            index: i + 1,
            data: e.target.result.split(',')[1],
            name: file.name,
            type: file.type
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    );

    // Create FormData with all fields
    const formDataToSend = new FormData();
    for (let [key, value] of formData.entries()) {
      if (key !== 'photos[]') {
        formDataToSend.append(key, value);
      }
    }

    // Append Base64 file data
    filesData.forEach(file => {
      formDataToSend.append(`photo${file.index}`, file.data);
      formDataToSend.append(`photo${file.index}_name`, file.name);
      formDataToSend.append(`photo${file.index}_type`, file.type);
    });

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formDataToSend
    });

    const result = await response.json();

    if (result.result === 'success') {
      showNotification('İlanınız başarıyla gönderildi! En kısa sürede yayınlanacaktır.', 'success');
      form.reset();
    } else {
      throw new Error(result.message || 'Bir hata oluştu');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showNotification('İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paw"></i> İlan Gönder';
  }
}

// ===================
// GENERAL CONTACT FORM
// ===================

function initForms() {
  const generalForm = document.getElementById('general-contact-form');
  
  if (generalForm) {
    generalForm.addEventListener('submit', handleGeneralFormSubmit);
    initFormValidation(generalForm);
  }
}

function initFormValidation(form) {
  if (!form) return;
  
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
  
  const emailInputs = form.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.addEventListener('blur', () => validateEmail(input));
  });
}

function handleGeneralFormSubmit(e) {
  e.preventDefault();
  
  if (isSubmitting) return;
  
  const form = e.target;
  const formData = new FormData(form);
  
  if (!validateForm(form)) {
    showNotification(getCurrentLanguage() === 'tr' ? 
      'Lütfen tüm gerekli alanları doğru şekilde doldurun.' : 
      'Please fill all required fields correctly.', 'error');
    return;
  }
  
  if (!formData.get('privacyAgreement')) {
    showNotification(getCurrentLanguage() === 'tr' ? 
      'Kişisel verilerin işlenmesi onayını vermelisiniz.' : 
      'You must consent to personal data processing.', 'error');
    return;
  }
  
  const contactData = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    timestamp: new Date().toISOString(),
    type: 'general_contact'
  };
  
  submitForm(form, contactData, 'Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.');
}

function submitForm(form, data, successMessage) {
  isSubmitting = true;
  
  const submitBtn = form.querySelector('.submit-btn');
  const originalHTML = submitBtn.innerHTML;
  
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Gönderiliyor...</span>';
  
  setTimeout(() => {
    try {
      console.log('Form submitted:', data);
      showNotification(successMessage, 'success');
      form.reset();
      clearAllFieldErrors(form);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      trackFormSubmission(data.type, data);
    } catch (error) {
      console.error('Form submission error:', error);
      showNotification(getCurrentLanguage() === 'tr' ? 
        'Bir hata oluştu. Lütfen tekrar deneyin.' : 
        'An error occurred. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      isSubmitting = false;
    }
  }, 2000);
}

// ===================
// VALIDATION
// ===================

function validateForm(form) {
  const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = getCurrentLanguage() === 'tr' ? 
      'Bu alan zorunludur.' : 'This field is required.';
  }
  
  if (field.type === 'email' && value && !isValidEmail(value)) {
    isValid = false;
    errorMessage = getCurrentLanguage() === 'tr' ? 
      'Geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.';
  }
  
  if (field.type === 'tel' && value && !isValidPhone(value)) {
    isValid = false;
    errorMessage = getCurrentLanguage() === 'tr' ? 
      'Geçerli bir telefon numarası giriniz.' : 'Please enter a valid phone number.';
  }
  
  isValid ? clearFieldError(field) : showFieldError(field, errorMessage);
  return isValid;
}

function validateEmail(field) {
  const value = field.value.trim();
  if (value && !isValidEmail(value)) {
    showFieldError(field, getCurrentLanguage() === 'tr' ? 
      'Geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.');
    return false;
  }
  clearFieldError(field);
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\+]?[(]?[\d\s\-\(\)]{10,}$/.test(phone);
}

function showFieldError(field, message) {
  field.style.borderColor = '#e74c3c';
  
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) existingError.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
  field.closest('.form-group').classList.add('error');
}

function clearFieldError(field) {
  field.style.borderColor = '';
  
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) errorMessage.remove();
  
  const formGroup = field.closest('.form-group');
  if (formGroup) formGroup.classList.remove('error');
}

function clearAllFieldErrors(form) {
  form.querySelectorAll('.error-message').forEach(error => error.remove());
  form.querySelectorAll('.form-group.error').forEach(group => group.classList.remove('error'));
  form.querySelectorAll('input, select, textarea').forEach(field => field.style.borderColor = '');
}

// ===================
// FAQ FUNCTIONALITY
// ===================

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => toggleFAQ(item));
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFAQ(item);
        }
      });
      question.setAttribute('tabindex', '0');
      question.setAttribute('role', 'button');
      question.setAttribute('aria-expanded', 'false');
    }
  });
}

function toggleFAQ(faqItem) {
  const isActive = faqItem.classList.contains('active');
  const answer = faqItem.querySelector('.faq-answer');
  const question = faqItem.querySelector('.faq-question');
  
  if (isActive) {
    faqItem.classList.remove('active');
    answer.style.maxHeight = '0';
    question.setAttribute('aria-expanded', 'false');
  } else {
    closeAllFAQs();
    faqItem.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    question.setAttribute('aria-expanded', 'true');
  }
}

function closeAllFAQs() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
    const answer = item.querySelector('.faq-answer');
    const question = item.querySelector('.faq-question');
    if (answer) answer.style.maxHeight = '0';
    if (question) question.setAttribute('aria-expanded', 'false');
  });
}

// ===================
// NEWSLETTER SIGNUP
// ===================

function initNewsletterSignup() {
  const newsletterForm = document.getElementById('newsletter-signup');
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
    showNotification(getCurrentLanguage() === 'tr' ? 
      'Geçerli bir e-posta adresi giriniz.' : 
      'Please enter a valid email address.', 'error');
    return;
  }
  
  if (!consent) {
    showNotification(getCurrentLanguage() === 'tr' ? 
      'E-posta bildirimleri için onay vermelisiniz.' : 
      'You must consent to email notifications.', 'error');
    return;
  }
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  
  setTimeout(() => {
    const newsletterData = {
      email: email,
      timestamp: new Date().toISOString(),
      type: 'newsletter_signup'
    };
    
    console.log('Newsletter signup:', newsletterData);
    showNotification(getCurrentLanguage() === 'tr' ? 
      'E-posta listemize başarıyla kaydoldunuz!' : 
      'Successfully subscribed to our email list!', 'success');
    e.target.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
    trackFormSubmission('newsletter', newsletterData);
  }, 1500);
}

// ===================
// SCROLL ANIMATIONS
// ===================

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.contact-card, .form-section, .faq-item, .newsletter-card'
  );
  
  animatedElements.forEach(element => element.classList.add('scroll-reveal'));
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(element => observer.observe(element));
}

// ===================
// UTILITY FUNCTIONS
// ===================

function showNotification(message, type = 'info') {
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
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
  
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f1c40f',
    info: '#3498db'
  };
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

function getCurrentLanguage() {
  return window.currentLanguage || 'tr';
}

function trackFormSubmission(type, data) {
  console.log(`Form submission tracked: ${type}`, {
    type: type,
    timestamp: data.timestamp,
    fields: Object.keys(data).length
  });
}

// ===================
// EVENT HANDLERS
// ===================

window.addEventListener('error', (e) => {
  console.error('Contact Page Error:', e.error);
  if (e.error.message.includes('fetch') || e.error.message.includes('network')) {
    showNotification(getCurrentLanguage() === 'tr' ? 
      'İnternet bağlantınızı kontrol edin.' : 
      'Please check your internet connection.', 'error');
  }
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    document.querySelectorAll('.faq-item.active .faq-answer').forEach(answer => {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  }, 250);
});

// ===================
// ACCESSIBILITY
// ===================

function initAccessibilityEnhancements() {
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input, select, textarea').forEach(input => {
      const label = form.querySelector(`label[for="${input.id}"]`);
      if (label && !input.getAttribute('aria-label')) {
        input.setAttribute('aria-label', label.textContent);
      }
    });
  });
  
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
  document.body.appendChild(liveRegion);
  
  const originalShow = showNotification;
  window.showNotification = (message, type) => {
    liveRegion.textContent = message;
    originalShow(message, type);
  };
}

// ===================
// EXPORTS (for testing)
// ===================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateField,
    isValidEmail,
    isValidPhone,
    toggleFAQ,
    showNotification
  };
}