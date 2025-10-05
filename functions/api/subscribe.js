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
    const { email, animalType, size, age } = data || {};

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: 'Invalid email' }, 400);
    }

    const rateLimitKey = `ratelimit:${email}`;
    const emailAttempts = await env.RATE_LIMIT.get(rateLimitKey);
    if (emailAttempts && parseInt(emailAttempts) >= 3) {
      return jsonResponse({ error: 'Too many attempts. Please try again in an hour.' }, 429);
    }

    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await env.DB.prepare(`
      INSERT INTO pending_subscriptions (email, token, preferences, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(email, token, JSON.stringify({ animalType, size, age }), expiresAt, Date.now()).run();

    await env.RATE_LIMIT.put(rateLimitKey, (parseInt(emailAttempts || '0') + 1).toString(), { expirationTtl: 3600 });

    // Send email but don't block the response if the mail provider is slow
    sendConfirmationEmail(env, email, token).catch(err => console.error('sendConfirmationEmail error:', err));

    return jsonResponse({ message: 'Confirmation email sent. Please check your inbox.' }, 200);

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
  const confirmUrl = `${env.FRONTEND_URL}/api/confirm?token=${token}`;
  console.log('sendConfirmationEmail: sending to', email);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Pati Gönüllüleri <noreply@patigonulluleri.com>',
        to: email,
        subject: 'Aboneliğinizi Onaylayın',
        html: `
          <h2>Hoş Geldiniz!</h2>
          <p>Aboneliğinizi onaylamak için tıklayın:</p>
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #E98532; color: white; text-decoration: none; border-radius: 8px;">Aboneliği Onayla</a>
          <p style="margin-top:20px; color:#666; font-size:14px;">Bu linkin geçerlilik süresi 24 saattir.</p>
        `
      })
    });

    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = '<no body>';
    }

    if (!res.ok) {
      console.error('Resend API error', res.status, text);
    } else {
      // Log the response body (might be JSON)
      console.log('Resend API success', res.status, text);
    }
    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error('sendConfirmationEmail fetch failed', err);
    throw err;
  }
}