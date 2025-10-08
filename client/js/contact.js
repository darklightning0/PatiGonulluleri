/**
 * Contact Page JavaScript - FIXED CSRF IMPLEMENTATION
 * Handles form submissions, FAQ interactions, and contact functionality
 */

// ===================
// GLOBAL VARIABLES
// ===================

let isSubmitting = false;
let csrfTokenReady = false; // Track if token is ready
const ADOPTION_FORM_ENDPOINT = "/api/submit";

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
  const form = document.getElementById("Adoption-form");
  if (!form) return;

  const fileInput = document.getElementById("photos");
  let currentStep = 1;
  const totalSteps = 4;

  async function setupCsrfToken() {
    try {
      const response = await fetch('/api/token', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.csrfToken) {
        throw new Error('No CSRF token in response');
      }
      
      // Store the token in a data attribute on the form
      form.dataset.csrfToken = data.csrfToken;
      csrfTokenReady = true;
      
      // Enable submit button now that token is ready
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn && submitBtn.disabled) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paw"></i> İlan Gönder';
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch CSRF token:', error);
      showNotification('Güvenlik anahtarı alınamadı. Lütfen sayfayı yenileyin.', 'error');
      csrfTokenReady = false;
      
      // Keep the submit button disabled
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Güvenlik Hatası';
      }
    }
  }
  
  // Fetch token immediately
  setupCsrfToken(); 

  // Initialize stepper
  initStepper();
  // File upload validation
  fileInput.addEventListener('change', validateFileUpload);

  form.addEventListener("submit", (e) => handleAdoptionFormSubmit(e, currentStep, totalSteps, goToStep, validateStep));

  // Initialize navigation buttons
  const navigationHTML = `
    <div class="form-navigation">
      <button type="button" class="prev-btn" style="display: none">
        <i class="fas fa-arrow-left"></i> Geri
      </button>
      <button type="button" class="next-btn">
        İleri <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  `;
  form.insertAdjacentHTML('beforeend', navigationHTML);

  const prevBtn = form.querySelector('.prev-btn');
  const nextBtn = form.querySelector('.next-btn');

  // Add button event listeners
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // If we're on the last step, trigger form submission
    if (currentStep === totalSteps) {
      form.dispatchEvent(new Event('submit', {
        cancelable: true,
        bubbles: true
      }));
      return;
    }

    // Otherwise, navigate to next step
    navigateStep(1);
  });
  prevBtn.addEventListener('click', () => navigateStep(-1));

  function initStepper() {
    updateStepProgress();
    document.querySelectorAll('.step-indicator').forEach((step, index) => {
      step.addEventListener('click', () => {
        const stepNumber = index + 1;
        if (validatePreviousSteps(stepNumber)) {
          goToStep(stepNumber);
        }
      });
    });
  }

  function navigateStep(direction) {
    const newStep = currentStep + direction;

    if (newStep < 1 || newStep > totalSteps) return;

    // Only validate when moving forward
    if (direction > 0 && !validateStep(currentStep)) {
      showNotification('Lütfen tüm zorunlu alanları doldurun.', 'error');
      return;
    }

    goToStep(newStep);
  }

  function goToStep(step) {
    // Hide current step
    const currentStepEl = form.querySelector(`.form-step[data-step="${currentStep}"]`);
    currentStepEl.classList.remove('active');

    // Show new step
    const newStepEl = form.querySelector(`.form-step[data-step="${step}"]`);
    newStepEl.classList.add('active');

    // Update step indicators
    updateStepProgress(step);

    // Update buttons
    prevBtn.style.display = step === 1 ? 'none' : 'flex';
    nextBtn.innerHTML = step === totalSteps ?
      '<i class="fas fa-paw"></i> İlan Gönder' :
      'İleri <i class="fas fa-arrow-right"></i>';
    nextBtn.type = step === totalSteps ? 'submit' : 'button';

    currentStep = step;
  }

  function validateStep(step) {
    const stepEl = form.querySelector(`.form-step[data-step="${step}"]`);
    const requiredFields = stepEl.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    return isValid;
  }

  function validatePreviousSteps(targetStep) {
    for (let i = 1; i < targetStep; i++) {
      if (!validateStep(i)) {
        showNotification(`Lütfen ${i}. adımdaki tüm zorunlu alanları doldurun.`, 'error');
        goToStep(i);
        return false;
      }
    }
    return true;
  }

  function updateStepProgress(step = currentStep) {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
      const stepNum = index + 1;
      indicator.classList.remove('active', 'completed');

      if (stepNum === step) {
        indicator.classList.add('active');
      } else if (stepNum < step) {
        indicator.classList.add('completed');
      }
    });
  }

  // City/district loading removed — using text inputs instead.
  // Note: city/district are now simple text inputs; no external API calls required.
}

async function compressAndConvertToBase64(file) {
    try {
        let workingFile = file;

        // 🧩 Detect and convert HEIC
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
            console.log('🔄 Converting HEIC to JPEG...');
            const blob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            workingFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg'
            });
        }

        // 🧠 Compression settings
        const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.85
        };

        console.log(`🖼️ Original file: ${workingFile.name}, Size: ${(workingFile.size / 1024 / 1024).toFixed(2)}MB`);

        // 🔧 Compress
        const compressedFile = await imageCompression(workingFile, options);

        console.log(`✅ Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

        // 🔄 Convert to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                const base64 = e.target.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
        });

    } catch (error) {
        console.error('Compression error:', error);
        throw new Error('Fotoğraf sıkıştırılırken hata oluştu. Lütfen farklı bir fotoğraf deneyin.');
    }
}


function validateFileUpload(e) {
  const files = e.target.files;
  const maxFiles = 3;
  const maxSize = 30 * 1024 * 1024; // 30MB total (after compression will be ~3-5MB)
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
    
    // Warn if individual file is very large (will take time to compress)
    if (file.size > 15 * 1024 * 1024) {
      showNotification(`⚠️ ${file.name} çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). Sıkıştırma biraz zaman alabilir.`, 'warning');
    }
  }

  if (totalSize > maxSize) {
    showNotification('Toplam dosya boyutu 30MB\'ı geçemez.', 'error');
    e.target.value = '';
  }
}

async function handleAdoptionFormSubmit(e, currentStep, totalSteps, goToStep, validateStep) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Check if CSRF token is ready
  if (!csrfTokenReady) {
    console.error('❌ CSRF token not ready');
    showNotification('Güvenlik anahtarı hazır değil. Lütfen bekleyin veya sayfayı yenileyin.', 'error');
    
    try {
      const response = await fetch('/api/token', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (data.csrfToken) {
        form.dataset.csrfToken = data.csrfToken;
        csrfTokenReady = true;
      }
    } catch (error) {
      console.error('Failed to fetch token on retry:', error);
      return;
    }
  }

  // Validate all steps before submission
  for (let i = 1; i <= totalSteps; i++) {
    if (!validateStep(i)) {
      showNotification(`Lütfen ${i}. adımdaki tüm zorunlu alanları doldurun.`, 'error');
      goToStep(i);
      return;
    }
  }

  // Get CSRF token
  const csrfToken = form.dataset.csrfToken;
  if (!csrfToken) {
    showNotification('Güvenlik hatası. Lütfen sayfayı yenileyin.', 'error');
    return;
  }

  // Check privacy agreement
  if (!form.querySelector('#privacy-agreement').checked) {
    showNotification('Lütfen KVKK metnini onaylayın.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

  try {
    // ==========================================
    // CREATE CLEAN FORMDATA (NO FILE OBJECTS)
    // ==========================================
    const formDataToSend = new FormData();
    
    // Add CSRF token first
    formDataToSend.append('csrfToken', csrfToken);
    
    // Add all text fields manually (skip file inputs)
    const textFields = [
      'name', 'email', 'phone', 'availableHours', 'city', 'district',
      'petName', 'animalType', 'breed', 'age', 'size', 'gender',
      'extraHealth', 'description', 'privacyAgreement'
    ];
    
    textFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        formDataToSend.append(fieldName, field.value || '');
      }
    });
    
    // Handle health checkboxes
    const healthCheckboxes = form.querySelectorAll('[name="health[]"]:checked');
    healthCheckboxes.forEach(checkbox => {
      formDataToSend.append('health[]', checkbox.value);
    });
    
    // ==========================================
    // HANDLE IMAGE COMPRESSION AND BASE64
    // ==========================================
    const fileInput = form.querySelector('#photos');
    if (fileInput && fileInput.files.length > 0) {
      const files = Array.from(fileInput.files);
      
      console.log(`📸 Processing ${files.length} images...`);
      
      try {
        // Compress and convert each image
        const compressionPromises = files.map(file => compressAndConvertToBase64(file));
        const base64Images = await Promise.all(compressionPromises);
        
        // Add base64 encoded images (NO file objects)
        base64Images.forEach((base64, index) => {
          formDataToSend.append(`photo${index + 1}`, base64);
        });
        
        // Add photo count
        formDataToSend.append('photoCount', files.length);
        
        console.log('✅ All images compressed and ready for upload');
        
      } catch (error) {
        console.error('Error compressing images:', error);
        throw new Error('Fotoğraflar işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      console.log('⚠️ No images to upload');
    }

    // ==========================================
    // LOG WHAT WE'RE SENDING (for debugging)
    // ==========================================
    console.log('📋 Form data being sent to server:');
    const formDataEntries = {};
    for (let [key, value] of formDataToSend.entries()) {
      if (key.startsWith('photo') && key !== 'photoCount') {
        formDataEntries[key] = `[base64 image, ${value.length} chars]`;
      } else {
        formDataEntries[key] = value;
      }
    }
    console.log(formDataEntries);

    // ==========================================
    // SEND TO SERVER
    // ==========================================
    console.log('🚀 Sending request to', ADOPTION_FORM_ENDPOINT);
    
    const response = await fetch(ADOPTION_FORM_ENDPOINT, {
      method: 'POST',
      body: formDataToSend,
      credentials: 'include'
    });

    console.log('📥 Server response:', response.status, response.statusText);

    // Parse response
    let result;
    try {
      result = await response.json();
      console.log('📄 Response data:', result);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error('Sunucu yanıtı işlenemedi.');
    }

    // Check if request was successful
    if (!response.ok) {
      const errorMessages = result.errors 
        ? result.errors.join('<br>') 
        : (result.message || 'Bilinmeyen bir sunucu hatası oluştu.');
      
      throw new Error(errorMessages);
    }

    // ==========================================
    // SUCCESS! 
    // ==========================================
    console.log('✅ Form submitted successfully!');
    
    showNotification('İlanınız başarıyla gönderildi! En kısa sürede yayınlanacaktır.', 'success');

    // Reset form
    form.reset();
    delete form.dataset.csrfToken;
    csrfTokenReady = false;
    
    // Clear file input
    const photoInput = form.querySelector('#photos');
    if (photoInput) photoInput.value = '';
    
    // Clear city/district inputs
    const cityInput = form.querySelector('#city');
    if (cityInput) cityInput.value = '';
    const districtInput = form.querySelector('#district');
    if (districtInput) districtInput.value = '';
    
    // Go back to first step
    goToStep(1);
    
    // Clear error styling
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Fetch a new CSRF token
    fetch('/api/token', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      if (data.csrfToken) {
        form.dataset.csrfToken = data.csrfToken;
        csrfTokenReady = true;
        console.log('✅ New CSRF token ready for next submission');
      }
    })
    .catch(err => console.error('Failed to fetch new token:', err));
    
  } catch (error) {
    console.error('❌ Form submission error:', error);
    showNotification(`İlan gönderilemedi: ${error.message}`, 'error');
    
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
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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

  // POST to /api/subscribe - only send email (no preferences)
  fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(async (response) => {
    const text = await response.text().catch(() => '');
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (err) { data = null; }

    if (!response.ok) {
      const message = (data && (data.error || data.message)) || text || 'Subscription failed';
      throw new Error(message);
    }

    showNotification(getCurrentLanguage() === 'tr' ?
      'E-posta listemize başarıyla kaydoldunuz!' :
      'Successfully subscribed to our email list!', 'success');
    e.target.reset();
    trackFormSubmission('newsletter', { email, timestamp: new Date().toISOString() });
  })
  .catch(err => {
    console.error('Newsletter subscribe error', err);
    showNotification(err.message || 'Subscription failed', 'error');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
  });
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
  if (e.error && e.error.message && (e.error.message.includes('fetch') || e.error.message.includes('network'))) {
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