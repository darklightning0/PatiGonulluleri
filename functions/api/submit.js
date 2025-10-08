/**
 * DEBUG VERSION - Cloudflare Worker /functions/api/submit.js
 * Added extensive logging to debug the issue
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
    const petName = formData.get("petName");
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
    if (!petName || petName.trim().length < 2) {
        errors.push("Hayvanın ismi en az 2 karakter olmalıdır.");
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
  console.log("=== CLOUDFLARE WORKER START ===");
  const { request, env } = context;
  
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const SECRET_KEY = env.TOKEN_KEY;

  // Debug: Log environment variables (without exposing sensitive data)
  console.log("Environment check:", {
    hasGoogleUrl: !!GOOGLE_SCRIPT_URL,
    googleUrlLength: GOOGLE_SCRIPT_URL ? GOOGLE_SCRIPT_URL.length : 0,
    googleUrlStart: GOOGLE_SCRIPT_URL ? GOOGLE_SCRIPT_URL.substring(0, 30) + "..." : "MISSING",
    hasSecretKey: !!SECRET_KEY
  });

  if (!SECRET_KEY) {
    console.error("TOKEN_KEY is not set");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error: TOKEN_KEY missing.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!GOOGLE_SCRIPT_URL || !GOOGLE_SCRIPT_URL.startsWith('https://script.google.com/macros/s/')) {
    console.error("GOOGLE_SCRIPT_URL is not set or invalid:", GOOGLE_SCRIPT_URL?.substring(0, 30) + '...');
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Server configuration error: Invalid or missing GOOGLE_SCRIPT_URL.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  let formData;
  let bodyToken;

  // CSRF Validation
  try {
    formData = await request.clone().formData();
    bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    
    console.log("CSRF Check:", {
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
    console.error("CSRF Validation Failed:", error.message);
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

  // Server-side validation
  try {
    console.log("Starting server-side validation...");
    const validationResult = validateFormData(formData);

    if (!validationResult.isValid) {
        console.error("Validation failed:", validationResult.errors);
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
    console.error("Validation error:", error);
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

  // Forward to Google Script
  try {
    console.log("📤 Preparing to forward to Google Script");
    
    // Create clean FormData and log contents
    const cleanFormData = new FormData();
    let fieldCount = 0;
    let totalSize = 0;
    
    console.log("Original form data entries:");
    for (let [key, value] of formData.entries()) {
      if (key !== 'csrfToken') {
        cleanFormData.append(key, value);
        fieldCount++;
        
        // Calculate size and log field info
        let fieldSize = 0;
        if (value instanceof File || value instanceof Blob) {
          fieldSize = value.size;
          console.log(`Field: ${key} = [File/Blob] Type: ${value.type}, Size: ${value.size} bytes`);
        } else {
          fieldSize = new TextEncoder().encode(String(value)).length;
          const preview = String(value).substring(0, 50);
          console.log(`Field: ${key} = "${preview}${preview.length < String(value).length ? '...' : ''}", Size: ${fieldSize} bytes`);
        }
        totalSize += fieldSize;
      }
    }
    
    console.log(`Form Summary:
      Total Fields: ${fieldCount}
      Total Size: ${totalSize} bytes
      Content-Type: ${request.headers.get('Content-Type')}
    `);
    
    console.log(`Total fields to send: ${fieldCount}`);
    console.log(`Sending to URL: ${GOOGLE_SCRIPT_URL}`);
    
    // Make the request to Google Script
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: cleanFormData,
      redirect: 'follow',  // Follow redirects
      headers: {
        'Content-Type': 'multipart/form-data'  // Required for Google Apps Script to process the form data
      }
    });
    
    console.log(`Google Script Response Status: ${googleResponse.status}`);
    console.log(`Response Headers:`, Object.fromEntries(googleResponse.headers.entries()));
    
    // Read response
    const responseText = await googleResponse.text();
    console.log(`Response text length: ${responseText.length}`);
    console.log(`First 200 chars: ${responseText.substring(0, 200)}`);
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("✅ Successfully parsed JSON response");
    } catch (parseError) {
      console.error("Failed to parse as JSON:", parseError);
      
      // Check if it's an HTML error page
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error("Received HTML instead of JSON - likely an error page");
        
        // Check for common error messages in HTML
        if (responseText.includes('does not have permission')) {
          throw new Error("Google Script permission error - check deployment settings");
        }
        if (responseText.includes('Script function not found')) {
          throw new Error("Google Script doPost function not found");
        }
      }
      
      // If status is OK, treat as success
      if (googleResponse.status === 200 || googleResponse.status === 302) {
        console.log("Treating as success despite non-JSON response");
        return new Response(
          JSON.stringify({ result: 'success', message: 'Form submitted successfully' }), 
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } else {
        throw new Error(`Google Script returned status ${googleResponse.status}`);
      }
    }
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error forwarding to Google Script:', error);
    console.error('Error details:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: `Failed to submit form: ${error.message}` 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}