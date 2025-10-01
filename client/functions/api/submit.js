/**
 * Cloudflare Function - /functions/api/submit.js
 *
 * This function acts as a secure proxy to your Google Apps Script.
 * 1. It receives the form data from your frontend.
 * 2. It retrieves the secret Google Script URL from environment variables.
 * 3. It forwards the request to the Google Script.
 * 4. It returns the response from the Google Script back to your frontend.
 */
export async function onRequestPost(context) {
  // context contains information about the request, including environment variables.
  const { request, env } = context;

  // Step 1: Get the secret URL from the environment variables.
  // Make sure you have set 'GOOGLE_SCRIPT_URL' in your Cloudflare Pages project settings.
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;

  // Failsafe: If the secret URL is not configured, return an error.
  if (!GOOGLE_SCRIPT_URL) {
    return new Response(
      JSON.stringify({
        result: 'error',
        message: 'Server configuration error: Google Script URL is not set.',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );
  }

  try {
    // Step 2: Forward the incoming request directly to the Google Script URL.
    // We pass the body and headers from the original request.
    // This correctly handles the multipart/form-data format.
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });

    // Step 3: Return the response from Google directly back to the client.
    return new Response(googleResponse.body, {
      status: googleResponse.status,
      statusText: googleResponse.statusText,
      headers: googleResponse.headers,
    });
  } catch (error) {
    console.error('Error proxying request to Google Script:', error);
    return new Response(
      JSON.stringify({
        result: 'error',
        message: 'An internal server error occurred while sending the form.',
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );
  }
}