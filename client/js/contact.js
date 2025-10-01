
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

  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const fileInput = document.getElementById("photos");
  let currentStep = 1;
  const totalSteps = 4;

  async function setupCsrfToken() {
    try {
      console.log('🔐 Fetching CSRF token...');
      
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
      
      console.log('✅ CSRF token ready:', data.csrfToken.substring(0, 8) + '...');
      console.log('🍪 Cookies after token fetch:', document.cookie);
      
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

  // City/District handlers
  citySelect.addEventListener("change", () => {
    const selected = citySelect.options[citySelect.selectedIndex];
    const plateId = selected.dataset.plate;
    plateId ? loadDistricts(plateId) : (districtSelect.innerHTML = `<option value="">Önce şehir seçiniz</option>`);
  });

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

async function handleAdoptionFormSubmit(e, currentStep, totalSteps, goToStep, validateStep) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Check if CSRF token is ready
  if (!csrfTokenReady) {
    console.error('❌ CSRF token not ready');
    showNotification('Güvenlik anahtarı hazır değil. Lütfen bekleyin veya sayfayı yenileyin.', 'error');
    
    // Try to fetch token again
    const tokenPromise = fetch('/api/token', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    });
    
    try {
      const response = await tokenPromise;
      const data = await response.json();
      if (data.csrfToken) {
        form.dataset.csrfToken = data.csrfToken;
        csrfTokenReady = true;
        console.log('✅ CSRF token fetched on retry');
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

  // Create FormData from the form
  const formData = new FormData(form);

  // Add the CSRF token from the data attribute
  const csrfToken = form.dataset.csrfToken;
  if (csrfToken) {
    formData.append('csrfToken', csrfToken);
    console.log('🔑 CSRF token added to FormData:', csrfToken.substring(0, 8) + '...');
  } else {
    console.error('❌ No CSRF token available');
    showNotification('Güvenlik hatası. Lütfen sayfayı yenileyin.', 'error');
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

    // Create new FormData with all fields including CSRF token
    const formDataToSend = new FormData();
    
    // Add all form fields
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

    // Debug: Log all fields being sent
    console.log('📋 Fields being sent:', Array.from(formDataToSend.keys()));
    console.log('🔑 CSRF token in final FormData:', formDataToSend.get('csrfToken')?.substring(0, 8) + '...');

    const response = await fetch(ADOPTION_FORM_ENDPOINT, {
      method: 'POST',
      body: formDataToSend,
      credentials: 'include'
    });

    const result = await response.json();

    if (result.result === 'success') {
      showNotification('İlanınız başarıyla gönderildi! En kısa sürede yayınlanacaktır.', 'success');

      // Reset form
      form.reset();
      delete form.dataset.csrfToken; // Clear the stored token
      csrfTokenReady = false; // Reset token ready flag
      
      const fileInput = form.querySelector('#photos');
      if (fileInput) fileInput.value = '';
      const districtSelect = form.querySelector('#district');
      if (districtSelect) {
        districtSelect.innerHTML = '<option value="">Önce şehir seçiniz</option>';
      }
      goToStep(1);
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      
      // Fetch a new token for the next submission
      fetch('/api/token', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' }
      }).then(response => response.json()).then(data => {
        if (data.csrfToken) {
          form.dataset.csrfToken = data.csrfToken;
          csrfTokenReady = true;
          console.log('✅ New CSRF token ready for next submission');
        }
      }).catch(err => console.error('Failed to fetch new token:', err));
      
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