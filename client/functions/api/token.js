/**
 * Cloudflare Function - /functions/api/token.js
 *
 * Generates a CSRF token for form protection.
 * This uses the "Double Submit Cookie" pattern.
 */

// A secure, random string. In a real app, generate this and store it as a secret.
// For now, this is sufficient for demonstration.

/**
 * Creates a signature for a token to verify it later.
 * @param {CryptoKey} key - The secret key for signing.
 * @param {string} data - The data to sign (the token).
 * @returns {Promise<string>} - The base64-encoded signature.
 */
async function sign(key, data) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Handles GET requests to generate and send a CSRF token.
 */
export async function onRequestGet(context) {
  const SECRET_KEY = context.env.TOKEN_KEY;
  if (!SECRET_KEY) {
    console.error("CSRF token generation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    // 1. Generate a random token
    const token = crypto.randomUUID();

    // 2. Import the secret key for signing
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // 3. Create a signature from the token
    const signature = await sign(key, token);

    // 4. Combine token and signature
    const signedToken = `${token}.${signature}`;

    // 5. Create a response object to set the cookie
    const response = new Response(JSON.stringify({ csrfToken: token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    // 6. Set the signed token in a secure, HttpOnly cookie
    response.headers.set(
      "Set-Cookie",
      `__csrf_token=${signedToken}; HttpOnly; Secure; SameSite=Strict; Path=/`
    );

    return response;

  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return new Response(JSON.stringify({ error: "Failed to generate token" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}