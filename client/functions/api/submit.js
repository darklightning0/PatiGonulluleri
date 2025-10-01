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
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;

  // ★★★ CHANGE: Read the secret key from Cloudflare environment variables ★★★
  const SECRET_KEY = env.TOKEN_KEY;

  // Failsafe in case the environment variable is not set
  if (!SECRET_KEY) {
    console.error("CSRF validation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- CSRF VALIDATION START ---
  try {
    const formData = await request.clone().formData();
    const bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    
    console.log("=== CSRF VALIDATION DEBUG ===");
    console.log("📧 All form fields:", Array.from(formData.keys()));
    console.log("🔑 Body token (first 20 chars):", bodyToken?.substring(0, 20));
    console.log("🍪 Cookie header:", cookie);
    
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];
    console.log("🍪 Extracted cookie token (first 20 chars):", cookieToken?.substring(0, 20));

    if (!bodyToken) {
      console.error("❌ No CSRF token in form body");
      throw new Error("CSRF token not found in form body.");
    }
    
    if (!cookieToken) {
      console.error("❌ No CSRF token in cookies");
      throw new Error("CSRF token not found in cookies.");
    }

    const [token, signature] = cookieToken.split(".");
    console.log("🔐 Split cookie - token:", token?.substring(0, 20), "signature:", signature?.substring(0, 20));

    if (!token || !signature) {
      console.error("❌ Cookie token is malformed");
      throw new Error("CSRF cookie is malformed.");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const tokensMatch = bodyToken === token;
    const signatureValid = await verify(key, signature, bodyToken);
    
    console.log("🔍 Tokens match:", tokensMatch);
    console.log("🔍 Signature valid:", signatureValid);

    const isValid = tokensMatch && signatureValid;
    
    if (!isValid) {
      console.error("❌ CSRF validation failed");
      throw new Error("Invalid CSRF token.");
    }
    
    console.log("✅ CSRF validation passed");
  } catch (error) {
    console.error("CSRF Validation Failed:", error.message);
    return new Response(
      JSON.stringify({ 
        result: 'error', 
        message: 'Security check failed. Please refresh the page and try again.',
        debug: error.message // Remove this in production
      }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  // --- CSRF VALIDATION END ---

  if (!GOOGLE_SCRIPT_URL) {
    return new Response(
      JSON.stringify({ result: 'error', message: 'Server configuration error.' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const headers = new Headers();
    const contentType = request.headers.get('Content-Type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    console.log("📤 Forwarding request to Google Script");
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: headers,
      body: request.body,
    });

    console.log("📥 Google Script response status:", googleResponse.status);
    
    return new Response(googleResponse.body, {
      status: googleResponse.status,
      statusText: googleResponse.statusText,
      headers: googleResponse.headers,
    });

  } catch (error) {
    console.error('Error proxying request to Google Script:', error);
    return new Response(
      JSON.stringify({ result: 'error', message: 'An internal server error occurred.' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}