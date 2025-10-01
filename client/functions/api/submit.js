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
    const sig = atob(signature);
    const sigBytes = Uint8Array.from(sig, (c) => c.charCodeAt(0));
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );
  } catch (e) {
    return false;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const SECRET_KEY = env.TOKEN_KEY;

  if (!SECRET_KEY) {
    console.error("CSRF validation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error.' }), { status: 500 });
  }

  // --- CSRF VALIDATION START ---
  try {
    const formData = await request.clone().formData();
    const bodyToken = formData.get("csrfToken");

    const cookie = request.headers.get("Cookie");
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];

    if (!bodyToken || !cookieToken) {
      throw new Error("CSRF tokens not found");
    }

    const [token, signature] = cookieToken.split(".");

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = (bodyToken === token) && (await verify(key, signature, bodyToken));
    if (!isValid) {
      throw new Error("Invalid CSRF token");
    }
  } catch (error) {
    console.error("CSRF Validation Failed:", error.message);
    return new Response(JSON.stringify({ result: 'error', message: 'Security check failed. Please refresh the page and try again.' }), { status: 403 });
  }
  // --- CSRF VALIDATION END ---

  if (!GOOGLE_SCRIPT_URL) {
    return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error.' }), { status: 500 });
  }

  try {
    const headers = new Headers();
    const contentType = request.headers.get('Content-Type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: headers,
      body: request.body,
    });

    return new Response(googleResponse.body, {
      status: googleResponse.status,
      statusText: googleResponse.statusText,
      headers: googleResponse.headers,
    });

  } catch (error) {
    console.error('Error proxying request to Google Script:', error);
    return new Response(JSON.stringify({ result: 'error', message: 'An internal server error occurred.' }), { status: 500 });
  }
}