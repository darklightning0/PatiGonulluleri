// Clean Cloudflare Pages Function for subscription

// Handles OPTIONS preflight and POST requests. Always returns JSON for both
// success and error responses and includes CORS headers so the frontend
// can safely parse error bodies.

export async function onRequest(context) {
  const { request } = context;

  // Top-level guard: ensure any unexpected error returns JSON and is logged,
  // rather than letting Cloudflare return an HTML 502 page which the client can't parse.
  try {
    console.log('subscribe.onRequest - method=', request.method);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method Not Allowed' }, 405);
    }

    return await onRequestPost(context);
  } catch (err) {
    console.error('subscribe.onRequest unexpected error:', err && (err.stack || err.message) || err);
    // Return JSON so the frontend can handle and show a proper message
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    let data;
    try {
      data = await request.json();
    } catch (jsonErr) {
      console.error('JSON parse error:', jsonErr);
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }

    const { email } = data || {};

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: 'Invalid email' }, 400);
    }

    // Check if KV is available before using it
    if (env.RATE_LIMIT) {
      const rateLimitKey = `ratelimit:${email}`;
      const emailAttempts = await env.RATE_LIMIT.get(rateLimitKey);
      if (emailAttempts && parseInt(emailAttempts) >= 6) {
        return jsonResponse({ error: 'Too many attempts. Please try again in an hour.' }, 429);
      }
    }

    const unsubscribeToken = crypto.randomUUID();

    // Check if DB is available
    if (!env.DB) {
      console.error('DB binding not found');
      return jsonResponse({ error: 'Database not configured' }, 500);
    }

    try {
  const now = Date.now();
  
  console.log('Attempting DB insert for email:', email);
  console.log('DB binding exists:', !!env.DB);
  
  const stmt = env.DB.prepare(`
    INSERT INTO subscriptions (email, preferences, unsubscribe_token, confirmed_at, is_active, created_at)
    VALUES (?, ?, ?, ?, 1, ?)
    ON CONFLICT(email) DO UPDATE SET is_active = 1, unsubscribe_token = excluded.unsubscribe_token, confirmed_at = excluded.confirmed_at
  `);
  
  console.log('Statement prepared, binding values...');
  const bound = stmt.bind(email, JSON.stringify({}), unsubscribeToken, now, now);
  
  console.log('Executing query...');
  const result = await bound.run();
  
  console.log('DB insert successful:', result);
  
  // Reset rate limit counter on success
  if (env.RATE_LIMIT) {
    const rateLimitKey = `ratelimit:${email}`;
    await env.RATE_LIMIT.put(rateLimitKey, '0', { expirationTtl: 3600 });
  }
} catch (dbErr) {
  console.error('DB upsert error in subscribe:', dbErr);
  console.error('Error message:', dbErr.message);
  console.error('Error stack:', dbErr.stack);
  console.error('Error details:', JSON.stringify(dbErr, null, 2));
  return jsonResponse({ error: 'Database error while creating subscription', details: dbErr.message }, 500);
}

    // Send welcome email (non-blocking) - only if API key exists
    if (env.RESEND_API_KEY) {
      sendWelcomeEmail(env, email).catch(err => console.error('sendWelcomeEmail error:', err));
    } else {
      console.warn('RESEND_API_KEY not configured, skipping welcome email');
    }

    return jsonResponse({ message: 'Subscribed successfully.' }, 200);

  } catch (err) {
    console.error('Subscription handler error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function sendConfirmationEmail(env, email, token) {
  // Deprecated: confirmation flow. Keep function as informational fallback.
  console.log('sendConfirmationEmail called but confirmation flow is deprecated for this project');
  return { ok: true };
}

async function sendWelcomeEmail(env, email) {
  console.log('sendWelcomeEmail: sending welcome to', email);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.WELCOME_FROM || 'Pati Gönüllüleri <noreply@patigonulluleri.com>',
        to: email,
        subject: env.WELCOME_SUBJECT || 'Pati Gönüllüleri - Aboneliğinize Hoşgeldiniz',
        html: env.WELCOME_HTML || `<p>Hoşgeldiniz! Pati Gönüllüleri e-posta listesine kaydoldunuz. Yeni makaleler ve duyurular için bizi takip edin.</p>`
      })
    });

    const text = await res.text().catch(() => '<no-body>');
    if (!res.ok) {
      console.error('Resend welcome error', res.status, text);
    } else {
      console.log('Resend welcome success', res.status, text);
    }
    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error('sendWelcomeEmail failed', err);
    throw err;
  }
}