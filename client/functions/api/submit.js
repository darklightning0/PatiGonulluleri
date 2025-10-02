/**
 * Cloudflare Function - /functions/api/submit.js
 *
 * Securely proxies form data to Google Apps Script
 * and includes CSRF protection.
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
    // Decode the base64 signature
    const sig = atob(signature);
    // Convert the string to a byte array
    const sigBytes = Uint8Array.from(sig, (c) => c.charCodeAt(0));
    // Verify the signature
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

export async function onRequestPost(context) {
  const { request, env } = context;
  
  console.log("=== REQUEST RECEIVED ===");
  console.log("Method:", request.method);
  console.log("URL:", request.url);
  console.log("Headers:", Object.fromEntries(request.headers.entries()));
  
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const SECRET_KEY = env.TOKEN_KEY;

  // Check environment variables
  if (!SECRET_KEY) {
    console.error("CSRF validation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error: TOKEN_KEY missing.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!GOOGLE_SCRIPT_URL) {
    console.error("GOOGLE_SCRIPT_URL is not set.");
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

  // --- CSRF VALIDATION START ---
  try {
    // Clone request to read form data without consuming the body
    formData = await request.clone().formData();
    bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    
    console.log("=== CSRF VALIDATION DEBUG ===");
    console.log("📧 All form fields:", Array.from(formData.keys()));
    console.log("🔑 Body token:", bodyToken);
    console.log("🍪 Cookie header:", cookie);
    
    if (!bodyToken) {
      console.error("❌ No CSRF token in form body");
      throw new Error("CSRF token not found in form body.");
    }
    
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];
    console.log("🍪 Extracted cookie token:", cookieToken?.substring(0, 40) + "...");

    if (!cookieToken) {
      console.error("❌ No CSRF token in cookies");
      throw new Error("CSRF token not found in cookies.");
    }

    const [token, signature] = cookieToken.split(".");
    console.log("🔍 Split cookie - token:", token, "signature:", signature?.substring(0, 20) + "...");

    if (!token || !signature) {
      console.error("❌ Cookie token is malformed");
      throw new Error("CSRF cookie is malformed.");
    }

    // Check if tokens match
    const tokensMatch = bodyToken === token;
    console.log("🔍 Tokens match:", tokensMatch);
    
    if (!tokensMatch) {
      console.error("❌ Token mismatch - Body:", bodyToken, "Cookie:", token);
      throw new Error("CSRF token mismatch.");
    }

    // Verify signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureValid = await verify(key, signature, bodyToken);
    console.log("🔍 Signature valid:", signatureValid);

    if (!signatureValid) {
      console.error("❌ Invalid signature");
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
  // --- CSRF VALIDATION END ---

  // --- FORWARD TO GOOGLE SCRIPT ---
  try {
    console.log("📤 Preparing to forward to Google Script...");
    
    // Remove CSRF token from form data before forwarding
    const cleanFormData = new FormData();
    for (let [key, value] of formData.entries()) {
      if (key !== 'csrfToken') {
        cleanFormData.append(key, value);
      }
    }
    
    console.log("📋 Fields being sent to Google:", Array.from(cleanFormData.keys()));
    
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: cleanFormData,
    });

    console.log("📥 Google Script response status:", googleResponse.status);
    console.log("📥 Google Script response headers:", Object.fromEntries(googleResponse.headers.entries()));
    
    // Read the response body as text first
    const responseText = await googleResponse.text();
    console.log("📥 Google Script response body:", responseText.substring(0, 500));
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Google Script response as JSON:", parseError);
      // If Google Script returns HTML or non-JSON, treat as success if status is 200/302
      if (googleResponse.status === 200 || googleResponse.status === 302) {
        console.log("✅ Google Script returned non-JSON success response");
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
      console.log("⚠️ Data may have been saved despite JSON parsing error");
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