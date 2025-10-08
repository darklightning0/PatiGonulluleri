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

  // Validate Google Script URL
  if (!GOOGLE_SCRIPT_URL) {
    console.error("GOOGLE_SCRIPT_URL is not set");
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Server configuration error: GOOGLE_SCRIPT_URL is not set.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const scriptUrl = new URL(GOOGLE_SCRIPT_URL);
    if (!scriptUrl.hostname.endsWith('script.google.com') || !scriptUrl.pathname.includes('/macros/s/')) {
      console.error("Invalid Google Script URL format:", 
        `Host: ${scriptUrl.hostname}, ` +
        `Path: ${scriptUrl.pathname.substring(0, 20)}...`
      );
      return new Response(
        JSON.stringify({ 
          result: 'error', 
          message: 'Server configuration error: Invalid Google Script URL format.' 
        }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    console.log("✅ Google Script URL validated");
  } catch (urlError) {
    console.error("Invalid Google Script URL:", urlError);
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Server configuration error: GOOGLE_SCRIPT_URL is not a valid URL.' 
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
    
    // Safe conversion of FormData to a simple object
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file
    const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total limit
    let formDataTotalSize = 0;

    // Function to safely process form values
    async function processFormValue(value) {
      if (value instanceof File || value instanceof Blob) {
        if (value.size > MAX_FILE_SIZE) {
          throw new Error(`File ${value.name} exceeds size limit of 5MB`);
        }
        
        // Convert File/Blob to base64
        const buffer = await value.arrayBuffer();
        formDataTotalSize += buffer.byteLength;
        
        if (formDataTotalSize > MAX_TOTAL_SIZE) {
          throw new Error('Total file size exceeds 20MB limit');
        }
        
        // Convert to base64 in chunks to avoid memory issues
        const chunks = [];
        const uint8Array = new Uint8Array(buffer);
        const chunkSize = 1024 * 512; // 512KB chunks
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          chunks.push(String.fromCharCode.apply(null, chunk));
        }
        
        return {
          name: value.name,
          type: value.type,
          size: value.size,
          content: btoa(chunks.join(''))
        };
      }
      
      // For non-file values, ensure they're simple strings
      return String(value);
    }

    // Process form data
    console.log('Processing form data...');
    const formEntries = {};
    
    for (let [key, value] of cleanFormData.entries()) {
      try {
        console.log(`Processing field: ${key} (${typeof value})`);
        formEntries[key] = await processFormValue(value);
      } catch (error) {
        console.error(`Error processing field ${key}:`, error);
        throw new Error(`Failed to process form field ${key}: ${error.message}`);
      }
    }

    console.log('Form data processed:', {
      fields: Object.keys(formEntries),
      totalSize: `${Math.round(formDataTotalSize / 1024)}KB`
    });

    // Make the request to Google Script
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        data: formEntries
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    });
    
    console.log(`Google Script Response Status: ${googleResponse.status}`);
    console.log(`Response Headers:`, Object.fromEntries(googleResponse.headers.entries()));
    
    // Read response
    const responseText = await googleResponse.text();
    console.log(`Response text length: ${responseText.length}`);
    console.log(`First 200 chars: ${responseText.substring(0, 200)}`);
    
    // Handle response
    let responseData;
    
    // Handle different response status codes
    if (googleResponse.status === 400) {
      throw new Error('Google Script rejected the request format. Check if all required fields are present.');
    } else if (googleResponse.status === 401 || googleResponse.status === 403) {
      throw new Error('Google Script authentication failed. Check deployment permissions.');
    } else if (googleResponse.status === 404) {
      throw new Error('Google Script URL not found. Verify the deployment URL.');
    } else if (googleResponse.status >= 500) {
      throw new Error('Google Script server error. Check script logs for details.');
    }

    try {
      const responseText = await googleResponse.text();
      console.log('Google Script Response:', responseText.substring(0, 200));

      try {
        responseData = JSON.parse(responseText);
        console.log("✅ Successfully parsed JSON response");
      } catch (parseError) {
        console.error("Response is not JSON:", responseText.substring(0, 200));
        
        // Check if it's an HTML error page
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          if (responseText.includes('does not have permission')) {
            throw new Error("Google Script permission error - check deployment settings");
          }
          if (responseText.includes('Script function not found')) {
            throw new Error("Google Script doPost function not found");
          }
          throw new Error("Received HTML error page from Google Script");
        }
        
        // If status is OK but not JSON, treat as success
        if (googleResponse.status === 200 || googleResponse.status === 302) {
          console.log("Non-JSON success response");
          return new Response(
            JSON.stringify({ 
              result: 'success', 
              message: 'Form submitted successfully',
              response: responseText.substring(0, 100)
            }), 
            { 
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        throw new Error(`Invalid response format from Google Script: ${responseText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Response processing error:', error);
      throw error;
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