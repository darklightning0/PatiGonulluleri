// Clean Cloudflare Pages Function for subscription

// Handles OPTIONS preflight and POST requests. Always returns JSON for both
// success and error responses and includes CORS headers so the frontend
// can safely parse error bodies.

export async function onRequest(context) {
  const { request } = context;

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

  return onRequestPost(context);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
  const data = await request.json();
  const { email } = data || {};

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: 'Invalid email' }, 400);
    }

    const rateLimitKey = `ratelimit:${email}`;
    const emailAttempts = await env.RATE_LIMIT.get(rateLimitKey);
    if (emailAttempts && parseInt(emailAttempts) >= 3) {
      return jsonResponse({ error: 'Too many attempts. Please try again in an hour.' }, 429);
    }

    const unsubscribeToken = crypto.randomUUID();

    // Upsert into subscriptions table - if email exists and is inactive, reactivate
    await env.DB.prepare(`
      INSERT INTO subscriptions (email, preferences, unsubscribe_token, is_active, created_at)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(email) DO UPDATE SET is_active = 1, unsubscribe_token = excluded.unsubscribe_token
    `).bind(email, JSON.stringify({}), unsubscribeToken, Date.now()).run();
    await env.RATE_LIMIT.put(rateLimitKey, (parseInt(emailAttempts || '0') + 1).toString(), { expirationTtl: 3600 });

  // Send a welcome email (non-blocking)
  sendWelcomeEmail(env, email).catch(err => console.error('sendWelcomeEmail error:', err));

  return jsonResponse({ message: 'Subscribed successfully. Welcome email sent.' }, 200);

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