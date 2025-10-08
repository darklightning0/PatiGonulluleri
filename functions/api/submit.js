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

  const { request, env } = context;
  
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const SECRET_KEY = env.TOKEN_KEY;

  if (!SECRET_KEY) {
    console.error("TOKEN_KEY is not set");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error: TOKEN_KEY missing.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error("GOOGLE_SCRIPT_URL is not set");
    return new Response(
      JSON.stringify({ result: 'error', message: 'Server configuration error: GOOGLE_SCRIPT_URL missing.' }), 
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
    
    // Remove CSRF token from form data before forwarding
    const cleanFormData = new FormData();
    for (let [key, value] of formData.entries()) {
      if (key !== 'csrfToken') {
        cleanFormData.append(key, value);
      }
    }
    
    
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: cleanFormData,
    });
    
    // Read the response body as text first
    const responseText = await googleResponse.text();
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Google Script response as JSON:", parseError);
      // If Google Script returns HTML or non-JSON, treat as success if status is 200/302
      if (googleResponse.status === 200 || googleResponse.status === 302) {
        return new Response(
          JSON.stringify({ result: 'success', message: 'Form submitted successfully' }), 
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } else {
        throw new Error("Google Script returned non-JSON error response");
      }
    }
    
    // Return the parsed response
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error forwarding to Google Script:', error);
    console.error('Error details:', error.stack);
    
    // Since the data might have been saved despite the error, 
    // check if it's a response parsing issue
    if (error.message.includes('JSON')) {
      return new Response(
        JSON.stringify({ 
          result: 'success', 
          message: 'Form submitted (with warnings)' 
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'An error occurred while processing your request. Please try again.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}