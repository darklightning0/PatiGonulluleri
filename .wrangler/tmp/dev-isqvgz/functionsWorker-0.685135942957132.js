var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-I9Gyxe/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// ../../../../../../.wrangler/tmp/pages-Rb51PZ/functionsWorker-0.685135942957132.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
function checkAuth(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(checkAuth, "checkAuth");
__name2(checkAuth, "checkAuth");
async function onRequestPost(context) {
  const { request, env } = context;
  const authError = checkAuth(request, env);
  if (authError) return authError;
  try {
    const petData = await request.json();
    if (!petData.name || !petData.type || !petData.age) {
      return new Response(JSON.stringify({
        error: "Missing required fields: name, type, age"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const ageGroup = petData.age <= 2 ? "young" : petData.age <= 7 ? "adult" : "senior";
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/pets`;
    const petDoc = {
      fields: {
        name: { stringValue: petData.name },
        type: { stringValue: petData.type },
        breed: { stringValue: petData.breed || "" },
        age: { integerValue: petData.age },
        ageGroup: { stringValue: ageGroup },
        size: { stringValue: petData.size },
        gender: { stringValue: petData.gender },
        description: { stringValue: petData.description },
        image: { stringValue: petData.image },
        location: { stringValue: petData.location || "\u0130zmir" },
        urgent: { booleanValue: petData.urgent || false },
        dateAdded: { integerValue: Date.now() },
        notificationSent: { booleanValue: false },
        active: { booleanValue: true },
        views: { integerValue: 0 }
      }
    };
    const response = await fetch(firebaseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(petDoc)
    });
    if (!response.ok) {
      throw new Error("Firebase error: " + await response.text());
    }
    const result = await response.json();
    const petId = result.name.split("/").pop();
    return new Response(JSON.stringify({
      success: true,
      message: "Pet added successfully",
      petId,
      note: "Notifications will be sent within the next hour"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error adding pet:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestPut(context) {
  const { request, env } = context;
  const authError = checkAuth(request, env);
  if (authError) return authError;
  try {
    const url = new URL(request.url);
    const petId = url.searchParams.get("id");
    if (!petId) {
      return new Response(JSON.stringify({ error: "Pet ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const updates = await request.json();
    const updateMask = Object.keys(updates).map((k) => `updateMask.fieldPaths=${k}`).join("&");
    const fields = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "string") fields[key] = { stringValue: value };
      else if (typeof value === "number") fields[key] = { integerValue: value };
      else if (typeof value === "boolean") fields[key] = { booleanValue: value };
    }
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/pets/${petId}?${updateMask}`;
    const response = await fetch(firebaseUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields })
    });
    if (!response.ok) {
      throw new Error("Firebase error: " + await response.text());
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Pet updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut, "onRequestPut");
__name2(onRequestPut, "onRequestPut");
async function onRequestDelete(context) {
  const { request, env } = context;
  const authError = checkAuth(request, env);
  if (authError) return authError;
  try {
    const url = new URL(request.url);
    const petId = url.searchParams.get("id");
    if (!petId) {
      return new Response(JSON.stringify({ error: "Pet ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/pets/${petId}?updateMask.fieldPaths=active`;
    await fetch(firebaseUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: { active: { booleanValue: false } }
      })
    });
    return new Response(JSON.stringify({
      success: true,
      message: "Pet deactivated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return new Response("Invalid token", { status: 400 });
  }
  try {
    const pending = await env.DB.prepare(`
      SELECT * FROM pending_subscriptions 
      WHERE token = ? AND expires_at > ?
    `).bind(token, Date.now()).first();
    if (!pending) {
      return new Response("Invalid or expired token", { status: 400 });
    }
    const unsubscribeToken = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO subscriptions (email, preferences, unsubscribe_token, confirmed_at, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).bind(
      pending.email,
      pending.preferences,
      unsubscribeToken,
      Date.now()
    ).run();
    await env.DB.prepare(`
      DELETE FROM pending_subscriptions WHERE token = ?
    `).bind(token).run();
    return Response.redirect(`${env.FRONTEND_URL}/subscription-confirmed.html`, 302);
  } catch (error) {
    console.error("Confirmation error:", error);
    return new Response("Error confirming subscription", { status: 500 });
  }
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestPost2(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { uniqueId, imageCount } = body;
    if (!uniqueId) {
      return new Response(
        JSON.stringify({ error: "Missing uniqueId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(`\u{1F5D1}\uFE0F Deleting images for: ${uniqueId}, count: ${imageCount}`);
    let deletedCount = 0;
    const errors = [];
    const maxImages = imageCount || 10;
    for (let i = 1; i <= maxImages; i++) {
      const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
      for (const ext of extensions) {
        const filename = `${uniqueId}_${i}.${ext}`;
        try {
          await env.IMAGES.delete(filename);
          deletedCount++;
          console.log(`\u2705 Deleted: ${filename}`);
        } catch (error) {
          console.log(`\u23ED\uFE0F Skipped: ${filename}`);
        }
      }
    }
    console.log(`\u2705 Total deleted: ${deletedCount}`);
    return new Response(
      JSON.stringify({
        success: true,
        deletedCount,
        uniqueId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("\u274C R2 deletion error:", error);
    return new Response(
      JSON.stringify({
        error: "Deletion failed",
        message: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
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
__name(verify, "verify");
__name2(verify, "verify");
function validateFormData(formData) {
  const errors = [];
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const city = formData.get("city");
  const district = formData.get("district");
  const petName = formData.get("petName");
  const animalType = formData.get("animalType");
  const size = formData.get("size");
  const description = formData.get("description");
  const privacyAgreement = formData.get("privacyAgreement");
  if (!name || name.trim().length < 2) {
    errors.push("Ad Soyad alan\u0131 zorunludur.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Ge\xE7erli bir e-posta adresi giriniz.");
  }
  if (!phone || !/^[\+]?[(]?[\d\s\-\(\)]{10,}$/.test(phone)) {
    errors.push("Ge\xE7erli bir telefon numaras\u0131 giriniz.");
  }
  if (!city) {
    errors.push("\u015Eehir se\xE7imi zorunludur.");
  }
  if (!district) {
    errors.push("\u0130l\xE7e se\xE7imi zorunludur.");
  }
  if (!petName || petName.trim().length < 2) {
    errors.push("Hayvan\u0131n ad\u0131 zorunludur.");
  }
  if (!animalType) {
    errors.push("Hayvan t\xFCr\xFC se\xE7imi zorunludur.");
  }
  if (!size) {
    errors.push("Boyut se\xE7imi zorunludur.");
  }
  if (!description || description.trim().length < 2) {
    errors.push("A\xE7\u0131klama alan\u0131 en az 10 karakter olmal\u0131d\u0131r.");
  }
  if (privacyAgreement !== "on") {
    errors.push("KVKK metnini onaylaman\u0131z gerekmektedir.");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
__name(validateFormData, "validateFormData");
__name2(validateFormData, "validateFormData");
async function onRequestPost3(context) {
  const { request, env } = context;
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;
  const SECRET_KEY = env.TOKEN_KEY;
  if (!SECRET_KEY) {
    console.error("CSRF validation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ result: "error", message: "Server configuration error: TOKEN_KEY missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!GOOGLE_SCRIPT_URL) {
    console.error("GOOGLE_SCRIPT_URL is not set.");
    return new Response(
      JSON.stringify({ result: "error", message: "Server configuration error: GOOGLE_SCRIPT_URL missing." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  let formData;
  let bodyToken;
  try {
    formData = await request.clone().formData();
    bodyToken = formData.get("csrfToken");
    const cookie = request.headers.get("Cookie");
    if (!bodyToken) {
      console.error("\u274C No CSRF token in form body");
      throw new Error("CSRF token not found in form body.");
    }
    const cookieToken = cookie?.match(/__csrf_token=([^;]+)/)?.[1];
    if (!cookieToken) {
      console.error("\u274C No CSRF token in cookies");
      throw new Error("CSRF token not found in cookies.");
    }
    const [token, signature] = cookieToken.split(".");
    if (!token || !signature) {
      console.error("\u274C Cookie token is malformed");
      throw new Error("CSRF cookie is malformed.");
    }
    const tokensMatch = bodyToken === token;
    if (!tokensMatch) {
      console.error("\u274C Token mismatch - Body:", bodyToken, "Cookie:", token);
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
      console.error("\u274C Invalid signature");
      throw new Error("Invalid CSRF token signature.");
    }
  } catch (error) {
    console.error("CSRF Validation Failed:", error.message);
    return new Response(
      JSON.stringify({
        result: "error",
        message: "Security check failed. Please refresh the page and try again."
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    console.log("\u{1F50D} Starting server-side validation...");
    const validationResult = validateFormData(formData);
    if (!validationResult.isValid) {
      console.error("\u274C Server-side validation failed:", validationResult.errors);
      return new Response(
        JSON.stringify({
          result: "error",
          message: "Form verileri ge\xE7ersiz. L\xFCtfen alanlar\u0131 kontrol edip tekrar deneyin.",
          errors: validationResult.errors
        }),
        {
          status: 400,
          // Bad Request
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("\u2705 Server-side validation passed.");
  } catch (error) {
    console.error("Validation error:", error.message);
    return new Response(
      JSON.stringify({
        result: "error",
        message: "Form do\u011Frulan\u0131rken bir hata olu\u015Ftu."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  try {
    const cleanFormData = new FormData();
    for (let [key, value] of formData.entries()) {
      if (key !== "csrfToken") {
        cleanFormData.append(key, value);
      }
    }
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: cleanFormData
    });
    const responseText = await googleResponse.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Google Script response as JSON:", parseError);
      if (googleResponse.status === 200 || googleResponse.status === 302) {
        return new Response(
          JSON.stringify({ result: "success", message: "Form submitted successfully" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      } else {
        throw new Error("Google Script returned non-JSON error response");
      }
    }
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Error forwarding to Google Script:", error);
    console.error("Error details:", error.stack);
    if (error.message.includes("JSON")) {
      return new Response(
        JSON.stringify({
          result: "success",
          message: "Form submitted (with warnings)"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        result: "error",
        message: "An error occurred while processing your request. Please try again."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequest(context) {
  const { request } = context;
  try {
    console.log("subscribe.onRequest - method=", request.method);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }
    return await onRequestPost4(context);
  } catch (err) {
    console.error("subscribe.onRequest unexpected error:", err && (err.stack || err.message) || err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
__name(onRequest, "onRequest");
__name2(onRequest, "onRequest");
async function onRequestPost4(context) {
  const { request, env } = context;
  try {
    let data;
    try {
      data = await request.json();
    } catch (jsonErr) {
      console.error("JSON parse error:", jsonErr);
      return jsonResponse({ error: "Invalid JSON in request body" }, 400);
    }
    const { email } = data || {};
    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: "Invalid email" }, 400);
    }
    if (env.RATE_LIMIT) {
      const rateLimitKey = `ratelimit:${email}`;
      const emailAttempts = await env.RATE_LIMIT.get(rateLimitKey);
      if (emailAttempts && parseInt(emailAttempts) >= 6) {
        return jsonResponse({ error: "Too many attempts. Please try again in an hour." }, 429);
      }
    }
    if (!env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");
      return jsonResponse({ error: "Service not configured: Missing API key" }, 500);
    }
    if (!env.RESEND_AUDIENCE_ID) {
      console.error("RESEND_AUDIENCE_ID is missing");
      return jsonResponse({ error: "Service not configured: Missing Audience ID" }, 500);
    }
    try {
      const getContactRes = await fetch(
        `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts?limit=100`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      let existingContact = null;
      if (getContactRes.ok) {
        const contactsData = await getContactRes.json();
        existingContact = (contactsData.data || []).find((c) => c.email === email);
      }
      if (existingContact) {
        if (!existingContact.unsubscribed) {
          console.log("Email already subscribed:", email);
          return jsonResponse({
            message: "Bu e-posta adresi zaten kay\u0131tl\u0131. Te\u015Fekk\xFCrler!",
            alreadySubscribed: true
          }, 200);
        } else {
          const updateRes = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts/${existingContact.id}`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              unsubscribed: false
            })
          });
          if (!updateRes.ok) {
            const errorText = await updateRes.text().catch(() => "<no-body>");
            console.error("Failed to resubscribe contact:", updateRes.status, errorText);
            return jsonResponse({
              error: "Failed to update subscription",
              details: errorText,
              status: updateRes.status
            }, 500);
          }
          console.log("Reactivated subscription for:", email);
        }
      } else {
        const createRes = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            unsubscribed: false
          })
        });
        if (!createRes.ok) {
          const errorText = await createRes.text().catch(() => "<no-body>");
          console.error("Failed to create contact:", createRes.status, errorText);
          return jsonResponse({
            error: "Failed to create subscription",
            details: errorText,
            status: createRes.status
          }, 500);
        }
        console.log("Created new subscription for:", email);
      }
      if (env.RATE_LIMIT) {
        const rateLimitKey = `ratelimit:${email}`;
        await env.RATE_LIMIT.put(rateLimitKey, "0", { expirationTtl: 3600 });
      }
    } catch (apiErr) {
      console.error("Resend API error in subscribe:", {
        message: apiErr.message,
        stack: apiErr.stack,
        email
      });
      return jsonResponse({
        error: "Service error while creating subscription",
        message: apiErr.message
      }, 500);
    }
    sendWelcomeEmail(env, email).catch((err) => console.error("sendWelcomeEmail error:", err));
    return jsonResponse({ message: "Subscribed successfully." }, 200);
  } catch (err) {
    console.error("Subscription handler error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
__name(isValidEmail, "isValidEmail");
__name2(isValidEmail, "isValidEmail");
function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
async function sendWelcomeEmail(env, email) {
  console.log("sendWelcomeEmail: sending welcome to", email);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.WELCOME_FROM || "Pati G\xF6n\xFCll\xFCleri <noreply@patigonulluleri.com>",
        to: email,
        subject: env.WELCOME_SUBJECT || "Pati G\xF6n\xFCll\xFCleri - Aboneli\u011Finize Ho\u015Fgeldiniz",
        html: env.WELCOME_HTML || `<p>Ho\u015Fgeldiniz! Pati G\xF6n\xFCll\xFCleri e-posta listesine kaydoldunuz. Yeni makaleler ve duyurular i\xE7in bizi takip edin.</p>`
      })
    });
    const text = await res.text().catch(() => "<no-body>");
    if (!res.ok) {
      console.error("Resend welcome error", res.status, text);
    } else {
      console.log("Resend welcome success", res.status, text);
    }
    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error("sendWelcomeEmail failed", err);
    throw err;
  }
}
__name(sendWelcomeEmail, "sendWelcomeEmail");
__name2(sendWelcomeEmail, "sendWelcomeEmail");
async function sign(key, data) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
__name(sign, "sign");
__name2(sign, "sign");
async function onRequestGet2(context) {
  const SECRET_KEY = context.env.TOKEN_KEY;
  if (!SECRET_KEY) {
    console.error("CSRF token generation failed: TOKEN_KEY secret is not set.");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const token = crypto.randomUUID();
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await sign(key, token);
    const signedToken = `${token}.${signature}`;
    const response = new Response(JSON.stringify({ csrfToken: token }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    response.headers.set(
      "Set-Cookie",
      `__csrf_token=${signedToken}; HttpOnly; Secure; SameSite=Lax; Path=/`
    );
    return response;
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return new Response(JSON.stringify({ error: "Failed to generate token" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPost5(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { image, filename, contentType } = body;
    if (!image || !filename) {
      return new Response(
        JSON.stringify({ error: "Missing image or filename" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const imageBuffer = Uint8Array.from(atob(image), (c) => c.charCodeAt(0));
    await env.IMAGES.put(filename, imageBuffer, {
      httpMetadata: {
        contentType: contentType || "image/jpeg"
      }
    });
    const publicUrl = `https://images.patigonulluleri.com/${filename}`;
    console.log(`\u2705 Uploaded to R2: ${filename}`);
    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("\u274C R2 upload error:", error);
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        message: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
async function onRequest2(context) {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }
  const auth = request.headers.get("x-admin-secret") || request.headers.get("authorization");
  if (!auth || auth !== (env.ADMIN_SECRET || "")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const { subject, html, text } = payload;
  if (!subject || !html && !text) {
    return new Response(JSON.stringify({ error: "Missing subject or content" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return new Response(JSON.stringify({ error: "Resend API configuration missing" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  try {
    const contactsRes = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    if (!contactsRes.ok) {
      const errorText = await contactsRes.text().catch(() => "<no-body>");
      console.error("Failed to fetch contacts from Resend:", contactsRes.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriber list" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    const contactsData = await contactsRes.json();
    const emails = (contactsData.data || []).filter((contact) => !contact.unsubscribed).map((contact) => contact.email);
    if (!emails || emails.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscribers" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }
    const results = [];
    for (const batch of batches) {
      const body = {
        from: env.BROADCAST_FROM || "Pati G\xF6n\xFCll\xFCleri <noreply@patigonulluleri.com>",
        to: batch,
        subject
      };
      if (html) body.html = html;
      if (text) body.text = text;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify(body)
      });
      const textBody = await res.text().catch(() => "<no-body>");
      results.push({ status: res.status, ok: res.ok, body: textBody, batchCount: batch.length });
      console.log("broadcast batch sent", { status: res.status, batchCount: batch.length, body: textBody });
    }
    return new Response(JSON.stringify({ message: "Broadcast sent", batches: results, totalSubscribers: emails.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Broadcast error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequest2, "onRequest2");
__name2(onRequest2, "onRequest");
async function onRequest3(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "POST") {
    return jsonResponse2({ error: "Method Not Allowed" }, 405);
  }
  try {
    const data = await request.json();
    const { email } = data || {};
    if (!email || !isValidEmail2(email)) {
      return jsonResponse2({ error: "Invalid email" }, 400);
    }
    if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
      console.error("Resend API configuration missing");
      return jsonResponse2({ error: "Service not configured" }, 500);
    }
    const getContactRes = await fetch(
      `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    if (!getContactRes.ok) {
      const errorText = await getContactRes.text().catch(() => "<no-body>");
      console.error("Failed to fetch contacts:", getContactRes.status, errorText);
      return jsonResponse2({ error: "Failed to fetch subscriber list" }, 500);
    }
    const contactsData = await getContactRes.json();
    const existingContact = (contactsData.data || []).find((c) => c.email === email);
    if (!existingContact) {
      return jsonResponse2({
        message: "Email address not found in our mailing list",
        notFound: true
      }, 200);
    }
    if (existingContact.unsubscribed) {
      return jsonResponse2({
        message: "This email is already unsubscribed",
        alreadyUnsubscribed: true
      }, 200);
    }
    const updateRes = await fetch(
      `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts/${existingContact.id}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          unsubscribed: true
        })
      }
    );
    if (!updateRes.ok) {
      const errorText = await updateRes.text().catch(() => "<no-body>");
      console.error("Failed to unsubscribe contact:", updateRes.status, errorText);
      return jsonResponse2({
        error: "Failed to unsubscribe",
        details: errorText,
        status: updateRes.status
      }, 500);
    }
    console.log("Successfully unsubscribed:", email);
    sendGoodbyeEmail(env, email).catch(
      (err) => console.error("sendGoodbyeEmail error:", err)
    );
    return jsonResponse2({
      message: "Successfully unsubscribed",
      success: true
    }, 200);
  } catch (err) {
    console.error("Unsubscribe handler error:", err);
    return jsonResponse2({ error: "Internal server error" }, 500);
  }
}
__name(onRequest3, "onRequest3");
__name2(onRequest3, "onRequest");
function isValidEmail2(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
__name(isValidEmail2, "isValidEmail2");
__name2(isValidEmail2, "isValidEmail");
function jsonResponse2(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(jsonResponse2, "jsonResponse2");
__name2(jsonResponse2, "jsonResponse");
async function sendGoodbyeEmail(env, email) {
  console.log("sendGoodbyeEmail: sending goodbye to", email);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.GOODBYE_FROM || "Pati G\xF6n\xFCll\xFCleri <noreply@patigonulluleri.com>",
        to: email,
        subject: env.GOODBYE_SUBJECT || "Abonelikten \xC7\u0131kt\u0131n\u0131z - Pati G\xF6n\xFCll\xFCleri",
        html: env.GOODBYE_HTML || `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #725037;">Abonelikten Ba\u015Far\u0131yla \xC7\u0131kt\u0131n\u0131z</h2>
            <p>E-posta listemizden \xE7\u0131kar\u0131ld\u0131n\u0131z. Art\u0131k bizden bildirim almayacaks\u0131n\u0131z.</p>
            <p>Hayvanlara olan sevginiz i\xE7in te\u015Fekk\xFCr ederiz! \u{1F43E}</p>
            <p>Fikrini de\u011Fi\u015Ftirirsen, istedi\u011Fin zaman <a href="https://patigonulluleri.com">patigonulluleri.com</a> adresinden tekrar abone olabilirsin.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="font-size: 12px; color: #888;">Pati G\xF6n\xFCll\xFCleri - \u0130zmir, T\xFCrkiye</p>
          </div>
        `
      })
    });
    const text = await res.text().catch(() => "<no-body>");
    if (!res.ok) {
      console.error("Resend goodbye error", res.status, text);
    } else {
      console.log("Resend goodbye success", res.status, text);
    }
    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error("sendGoodbyeEmail failed", err);
    throw err;
  }
}
__name(sendGoodbyeEmail, "sendGoodbyeEmail");
__name2(sendGoodbyeEmail, "sendGoodbyeEmail");
var routes = [
  {
    routePath: "/api/admin/pets",
    mountPath: "/api/admin",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/admin/pets",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/pets",
    mountPath: "/api/admin",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/confirm",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/delete-from-r2",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/submit",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/subscribe",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/token",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/upload-to-r2",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/broadcast",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/subscribe",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/unsubscribe",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-I9Gyxe/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-I9Gyxe/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.685135942957132.js.map
