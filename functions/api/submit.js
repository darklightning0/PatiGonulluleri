/**
 * CORRECTED VERSION - Cloudflare Worker /functions/api/submit.js
 * Forwards the original request body to Google Apps Script to ensure compatibility.
 */

// Helper function to verify the CSRF token signature
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

// Helper function for server-side validation of form data
function validateFormData(formData) {
    const errors = [];
    const requiredFields = ["name", "email", "phone", "city", "district", "animalType", "size", "petName", "description", "privacyAgreement"];
    
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    if (formData.get("petName") && formData.get("petName").trim().length < 2) {
        errors.push("Hayvanın ismi en az 2 karakter olmalıdır.");
    }
    if (formData.get("description") && formData.get("description").trim().length < 10) {
        errors.push("Açıklama alanı en az 10 karakter olmalıdır.");
    }
     if (formData.get("privacyAgreement") !== "on") {
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

    if (!SECRET_KEY || !GOOGLE_SCRIPT_URL) {
        console.error("Server configuration error: TOKEN_KEY or GOOGLE_SCRIPT_URL is missing.");
        return new Response(JSON.stringify({ result: 'error', message: 'Server configuration error.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // --- CSRF and Form Validation ---
        // We must clone the request to read its body for validation,
        // leaving the original request body intact to be forwarded later.
        const clonedRequest = request.clone();
        const formData = await clonedRequest.formData();

        const bodyToken = formData.get("csrfToken");
        const cookie = request.headers.get("Cookie");

        if (!bodyToken || !cookie) {
            throw new Error("CSRF token missing from body or cookie.");
        }

        const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];
        if (!cookieToken) {
            throw new Error("CSRF token not found in cookies.");
        }

        const [token, signature] = cookieToken.split(".");
        if (!token || !signature || bodyToken !== token) {
            throw new Error("CSRF token mismatch or malformed.");
        }

        const key = await crypto.subtle.importKey(
            "raw", new TextEncoder().encode(SECRET_KEY),
            { name: "HMAC", hash: "SHA-265" },
            false, ["verify"]
        );

        const signatureValid = await verify(key, signature, token);
        if (!signatureValid) {
            throw new Error("Invalid CSRF token signature.");
        }
        console.log("✅ CSRF validation passed");

        // --- Server-side Form Data Validation ---
        const validationResult = validateFormData(formData);
        if (!validationResult.isValid) {
            console.error("Server-side validation failed:", validationResult.errors);
            return new Response(JSON.stringify({
                    result: 'error',
                    message: 'Form data is invalid.',
                    errors: validationResult.errors,
                }), { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        console.log("✅ Server-side validation passed");


        // --- Forward the ORIGINAL request to Google Script ---
        // This is the critical change. We forward the original, untouched request body
        // and its 'Content-Type' header, which includes the multipart boundary.
        
        console.log("📤 Forwarding original request to Google Script...");

        const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: request.body, // Use the original request's body stream
            headers: {
                // Pass the original Content-Type header, which is essential
                // for the Google Apps Script to parse the multipart data correctly.
                'Content-Type': request.headers.get('Content-Type'),
            },
            redirect: 'follow'
        });

        console.log(`Google Script Response Status: ${googleResponse.status}`);
        
        // Return the response from Google Script directly to the client
        const responseBody = await googleResponse.text();
         console.log(`Response from Google: ${responseBody}`);

        // It's important to return a Response object
        return new Response(responseBody, {
            status: googleResponse.status,
            headers: { 'Content-Type': 'application/json' }
        });


    } catch (error) {
        console.error('❌ Worker error:', error.message);
        return new Response(
            JSON.stringify({
                result: 'error',
                message: `An error occurred: ${error.message}`
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}