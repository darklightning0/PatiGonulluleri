/**
 * Cloudflare Function - /functions/api/submit.js
 *
 * Securely proxies form data to Google Apps Script
 * and includes CSRF protection.
 *
 * CORRECTED VERSION: Uses formData.delete() to preserve file uploads.
 */

/**
 * Verifies the HMAC signature of the token.
 * @param {CryptoKey} key - The secret key for signing.
 * @param {string} signature - The base64-encoded signature from the cookie.
 * @param {string} data - The data to verify (the token from the form).
 * @returns {Promise<boolean>} - True if the signature is valid.
 */
async function verify(key, signature, data) {
  try {
    const sig = atob(signature);
    const sigBytes = Uint8Array.from(sig, (c) => c.charCodeAt(0));
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

/**
 * Validates the form data against a set of rules.
 * @param {FormData} formData - The form data to validate.
 * @returns {{isValid: boolean, errors: string[]}} - An object containing the validation result.
 */
function validateFormData(formData) {
    const errors = [];
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const city = formData.get("city");
    const district = formData.get("district");
    const animalType = formData.get("animalType");
    const size = formData.get("size");
    const description = formData.get("description");
    const privacyAgreement = formData.get("privacyAgreement");

    if (!name || name.trim().length < 2) {
        errors.push("Ad Soyad alanı zorunludur.");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Geçerli bir e-posta adresi giriniz.");
    }
    if (!phone || !/^[\+]?[(]?[\d\s\-\(\)]{10,}$/.test(phone)) {
        errors.push("Geçerli bir telefon numarası giriniz.");
    }
    if (!city) {
        errors.push("Şehir seçimi zorunludur.");
    }
    if (!district) {
        errors.push("İlçe seçimi zorunludur.");
    }
    if (!animalType) {
        errors.push("Hayvan türü seçimi zorunludur.");
    }
    if (!size) {
        errors.push("Boyut seçimi zorunludur.");
    }
    if (!description || description.trim().length < 2) {
        errors.push("Açıklama alanı en az 10 karakter olmalıdır.");
    }
    if (privacyAgreement !== "on") {
        errors.push("KVKK metnini onaylamanız gerekmektedir.");
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const SECRET_KEY = env.TOKEN_KEY;

  if (!SECRET_KEY) {
    console.error("CSRF validation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error: TOKEN_KEY missing.' }), { 
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error("GOOGLE_SCRIPT_URL is not set.");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error: GOOGLE_SCRIPT_URL missing.' }), { 
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error("Failed to parse form data:", e);
    return new Response(JSON.stringify({ result: 'error', message: 'Invalid form submission.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- CSRF VALIDATION ---
  try {
    const bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    
    if (!bodyToken) throw new Error("CSRF token not found in form body.");
    
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];
    if (!cookieToken) throw new Error("CSRF token not found in cookies.");

    const [token, signature] = cookieToken.split(".");
    if (!token || !signature) throw new Error("CSRF cookie is malformed.");

    if (bodyToken !== token) throw new Error("CSRF token mismatch.");

    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const signatureValid = await verify(key, signature, bodyToken);

    if (!signatureValid) throw new Error("Invalid CSRF token signature.");
    
  } catch (error) {
    console.error("CSRF Validation Failed:", error.message);
    return new Response(JSON.stringify({ result: 'error', message: 'Security check failed. Please refresh the page and try again.' }), { 
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // --- SERVER-SIDE VALIDATION ---
  try {
    const validationResult = validateFormData(formData);
    if (!validationResult.isValid) {
        console.error("❌ Server-side validation failed:", validationResult.errors);
        return new Response(JSON.stringify({ result: 'error', message: 'Form verileri geçersiz.', errors: validationResult.errors }), {
            status: 400, headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error("Validation error:", error.message);
    return new Response(JSON.stringify({ result: 'error', message: 'Form doğrulanırken bir hata oluştu.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- FORWARD TO GOOGLE SCRIPT ---
  try {
    // *** FIX: Use .delete() on the original FormData object ***
    // This preserves the file data correctly.
    formData.delete('csrfToken');
    
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData, // Send the original, modified formData object
    });
    
    const responseText = await googleResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Google Script response as JSON:", responseText);
      if (googleResponse.status === 200 || googleResponse.status === 302) { // Google often redirects on success
        return new Response(JSON.stringify({ result: 'success', message: 'Form submitted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        throw new Error(`Google Script returned a non-JSON error response. Status: ${googleResponse.status}`);
      }
    }
    
    return new Response(JSON.stringify(responseData), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Error forwarding to Google Script:', error);
    return new Response(JSON.stringify({ result: 'error', message: 'An error occurred while processing your request. Please try again.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}