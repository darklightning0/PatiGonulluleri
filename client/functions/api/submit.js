/**
 * FIXED Cloudflare Function - /functions/api/submit.js
 * Improved error handling and logging
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
    if (!description || description.trim().length < 10) {
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

  console.log("=== NEW FORM SUBMISSION ===");
  console.log("Request URL:", request.url);
  console.log("Request Method:", request.method);

  // Configuration checks
  if (!SECRET_KEY) {
    console.error("❌ TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ 
      result: 'error', 
      message: 'Server configuration error: TOKEN_KEY missing.' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error("❌ GOOGLE_SCRIPT_URL is not set.");
    return new Response(JSON.stringify({ 
      result: 'error', 
      message: 'Server configuration error: GOOGLE_SCRIPT_URL missing.' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  console.log("✅ Configuration validated");
  console.log("Google Script URL:", GOOGLE_SCRIPT_URL);

  // Parse form data
  let formData;
  try {
    formData = await request.formData();
    console.log("✅ Form data parsed successfully");
    
    // Log form fields (excluding files for brevity)
    const fieldNames = [];
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        fieldNames.push(key);
      } else {
        fieldNames.push(key + " (file)");
      }
    }
    console.log("Form fields:", fieldNames.join(", "));
    
  } catch (e) {
    console.error("❌ Failed to parse form data:", e);
    return new Response(JSON.stringify({ 
      result: 'error', 
      message: 'Invalid form submission.' 
    }), {
      status: 400, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // CSRF VALIDATION
  try {
    console.log("🔒 Starting CSRF validation...");
    
    const bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    
    if (!bodyToken) throw new Error("CSRF token not found in form body.");
    console.log("✅ Body token found");
    
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];
    if (!cookieToken) throw new Error("CSRF token not found in cookies.");
    console.log("✅ Cookie token found");

    const [token, signature] = cookieToken.split(".");
    if (!token || !signature) throw new Error("CSRF cookie is malformed.");

    if (bodyToken !== token) throw new Error("CSRF token mismatch.");
    console.log("✅ Tokens match");

    const key = await crypto.subtle.importKey(
      "raw", 
      new TextEncoder().encode(SECRET_KEY), 
      { name: "HMAC", hash: "SHA-256" }, 
      false, 
      ["verify"]
    );
    const signatureValid = await verify(key, signature, bodyToken);

    if (!signatureValid) throw new Error("Invalid CSRF token signature.");
    console.log("✅ CSRF validation passed");
    
  } catch (error) {
    console.error("❌ CSRF Validation Failed:", error.message);
    return new Response(JSON.stringify({ 
      result: 'error', 
      message: 'Security check failed. Please refresh the page and try again.' 
    }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // SERVER-SIDE VALIDATION
  try {
    console.log("🔍 Starting server-side validation...");
    const validationResult = validateFormData(formData);
    
    if (!validationResult.isValid) {
      console.error("❌ Server-side validation failed:", validationResult.errors);
      return new Response(JSON.stringify({ 
        result: 'error', 
        message: 'Form verileri geçersiz.', 
        errors: validationResult.errors 
      }), {
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log("✅ Validation passed");
    
  } catch (error) {
    console.error("❌ Validation error:", error.message);
    return new Response(JSON.stringify({ 
      result: 'error', 
      message: 'Form doğrulanırken bir hata oluştu.' 
    }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // FORWARD TO GOOGLE SCRIPT
  try {
    console.log("📤 Forwarding to Google Script...");
    
    // Remove CSRF token from form data
    formData.delete('csrfToken');
    
    // Create new request with form data
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow' // Follow redirects from Google
    });
    
    console.log("📥 Google Script response status:", googleResponse.status);
    console.log("Response headers:", JSON.stringify([...googleResponse.headers.entries()]));
    
    const responseText = await googleResponse.text();
    console.log("Response text (first 500 chars):", responseText.substring(0, 500));
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("✅ Successfully parsed JSON response");
    } catch (parseError) {
      console.warn("⚠️ Failed to parse Google Script response as JSON");
      console.log("Parse error:", parseError.message);
      
      // Google Scripts often return 302 redirects on success
      if (googleResponse.status === 200 || googleResponse.status === 302) {
        console.log("✅ Treating as success based on status code");
        return new Response(JSON.stringify({ 
          result: 'success', 
          message: 'Form başarıyla gönderildi.' 
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      } else {
        throw new Error(`Google Script returned error. Status: ${googleResponse.status}, Response: ${responseText.substring(0, 200)}`);
      }
    }
    
    console.log("✅ Form submission completed successfully");
    return new Response(JSON.stringify(responseData), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Error forwarding to Google Script:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      result: 'error', 
      message: 'Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
      technical_error: error.message
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}