/**
 * FIXED VERSION - Cloudflare Worker /functions/api/submit.js
 * Properly forwards FormData to Google Apps Script
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

function validateFormData(formData) {
    const errors = [];
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const city = formData.get("city");
    const district = formData.get("district");
    const petName = formData.get("petName");
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
    if (!petName) {
        errors.push("Hayvanınızın adı zorunludur.");
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

  console.log("📥 Received POST request");
  console.log("GOOGLE_SCRIPT_URL:", GOOGLE_SCRIPT_URL ? "✅ Set" : "❌ Missing");

  // Check configuration
  if (!SECRET_KEY) {
    console.error("❌ TOKEN_KEY is not set");
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Server configuration error: TOKEN_KEY missing.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error("❌ GOOGLE_SCRIPT_URL is not set");
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Server configuration error: GOOGLE_SCRIPT_URL missing.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  let formData;
  let bodyToken;

  // ==================
  // CSRF Validation
  // ==================
  try {
    formData = await request.formData();
    bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    
    console.log("🔒 CSRF Check:", {
      hasBodyToken: !!bodyToken,
      hasCookie: !!cookie
    });
    
    if (!bodyToken) {
      throw new Error("CSRF token not found in form body.");
    }
    
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];

    if (!cookieToken) {
      throw new Error("CSRF token not found in cookies.");
    }

    const [token, signature] = cookieToken.split(".");

    if (!token || !signature) {
      throw new Error("CSRF cookie is malformed.");
    }

    const tokensMatch = bodyToken === token;
    
    if (!tokensMatch) {
      throw new Error("CSRF token mismatch.");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureValid = await verify(key, signature, bodyToken);

    if (!signatureValid) {
      throw new Error("Invalid CSRF token signature.");
    }
    
    console.log("✅ CSRF validation passed");
    
  } catch (error) {
    console.error("❌ CSRF Validation Failed:", error.message);
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Security check failed. Please refresh the page and try again.'
      }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // ==================
  // Server Validation
  // ==================
  try {
    console.log("🔍 Starting server-side validation...");
    const validationResult = validateFormData(formData);

    if (!validationResult.isValid) {
      console.error("❌ Validation failed:", validationResult.errors);
      return new Response(
        JSON.stringify({
          result: 'error',
          message: 'Form verileri geçersiz.',
          errors: validationResult.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    console.log("✅ Validation passed");
  } catch (error) {
    console.error("❌ Validation error:", error);
    return new Response(
      JSON.stringify({
        result: 'error',
        message: 'Form doğrulanırken bir hata oluştu.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // ==================
  // Forward to Google Apps Script
  // ==================
  try {
    console.log("📤 Forwarding to Google Apps Script...");
    
    // Remove CSRF token before forwarding
    const cleanFormData = new FormData();
    let fieldCount = 0;
    
    for (let [key, value] of formData.entries()) {
      if (key !== 'csrfToken') {
        cleanFormData.append(key, value);
        fieldCount++;
        
        // Log field info (but not full base64 data)
        if (key.startsWith('photo')) {
          console.log(`  📸 ${key}: [base64 image, ${value.length} chars]`);
        } else {
          console.log(`  📝 ${key}: ${String(value).substring(0, 50)}${value.length > 50 ? '...' : ''}`);
        }
      }
    }
    
    console.log(`📋 Forwarding ${fieldCount} fields to Google Apps Script`);
    
    // CRITICAL: Forward the FormData directly, preserving multipart/form-data
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: cleanFormData,
      // DON'T set Content-Type header - let fetch() set it automatically with boundary
      redirect: 'follow' // Follow redirects from Google Apps Script
    });
    
    console.log("📥 Google Apps Script response:", {
      status: googleResponse.status,
      statusText: googleResponse.statusText,
      headers: Object.fromEntries(googleResponse.headers.entries())
    });
    
    // Read response
    const responseText = await googleResponse.text();
    console.log("📄 Response body:", responseText.substring(0, 200));
    
    // Parse response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("✅ Parsed JSON response:", responseData);
    } catch (parseError) {
      console.warn("⚠️ Response is not JSON:", parseError.message);
      
      // Google Apps Script sometimes returns HTML on success
      if (googleResponse.status === 200 || googleResponse.status === 302) {
        console.log("✅ Treating as success based on status code");
        return new Response(
          JSON.stringify({ 
            result: 'success', 
            message: 'Form submitted successfully' 
          }), 
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } else {
        throw new Error("Google Script returned non-JSON error response");
      }
    }
    
    // Return parsed response
    console.log("✅ Request completed successfully");
    return new Response(
      JSON.stringify(responseData), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error forwarding to Google Script:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'An error occurred while processing your request. Please try again.',
        details: error.message
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}