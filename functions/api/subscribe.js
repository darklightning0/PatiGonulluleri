// Clean Cloudflare Pages Function for subscription using Resend Audience API
// Required env vars: RESEND_API_KEY, RESEND_AUDIENCE_ID

export async function onRequest(context) {
  const { request } = context;

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

    // Check if KV is available for rate limiting
    if (env.RATE_LIMIT) {
      const rateLimitKey = `ratelimit:${email}`;
      const emailAttempts = await env.RATE_LIMIT.get(rateLimitKey);
      if (emailAttempts && parseInt(emailAttempts) >= 6) {
        return jsonResponse({ error: 'Too many attempts. Please try again in an hour.' }, 429);
      }
    }

    // Check if Resend API is configured
    if (!env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is missing');
  return jsonResponse({ error: 'Service not configured: Missing API key' }, 500);
}
if (!env.RESEND_AUDIENCE_ID) {
  console.error('RESEND_AUDIENCE_ID is missing');
  return jsonResponse({ error: 'Service not configured: Missing Audience ID' }, 500);
}

    try {
      // Check if contact already exists in Resend Audience
      const getContactRes = await fetch(
  `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts?limit=100`, 
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);

      let existingContact = null;
      if (getContactRes.ok) {
        const contactsData = await getContactRes.json();
        existingContact = (contactsData.data || []).find(c => c.email === email);
      }

      if (existingContact) {
        // Contact exists - check if unsubscribed
        if (!existingContact.unsubscribed) {
          console.log('Email already subscribed:', email);
          return jsonResponse({ 
            message: 'Bu e-posta adresi zaten kayıtlı. Teşekkürler!',
            alreadySubscribed: true 
          }, 200);
        } else {
          // Resubscribe the contact
          const updateRes = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts/${existingContact.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              unsubscribed: false
            })
          });

          if (!updateRes.ok) {
  const errorText = await updateRes.text().catch(() => '<no-body>');
  console.error('Failed to resubscribe contact:', updateRes.status, errorText);
  // MORE DETAILED ERROR
  return jsonResponse({ 
    error: 'Failed to update subscription', 
    details: errorText,
    status: updateRes.status 
  }, 500);
}

          console.log('Reactivated subscription for:', email);
        }
      } else {
        // Create new contact
        const createRes = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            unsubscribed: false
          })
        });

if (!createRes.ok) {
  const errorText = await createRes.text().catch(() => '<no-body>');
  console.error('Failed to create contact:', createRes.status, errorText);
  // MORE DETAILED ERROR
  return jsonResponse({ 
    error: 'Failed to create subscription', 
    details: errorText,
    status: createRes.status 
  }, 500);
}

        console.log('Created new subscription for:', email);
      }

      // Reset rate limit counter
      if (env.RATE_LIMIT) {
        const rateLimitKey = `ratelimit:${email}`;
        await env.RATE_LIMIT.put(rateLimitKey, '0', { expirationTtl: 3600 });
      }

    } catch (apiErr) {
  console.error('Resend API error in subscribe:', {
    message: apiErr.message,
    stack: apiErr.stack,
    email: email
  });
  return jsonResponse({ 
    error: 'Service error while creating subscription',
    message: apiErr.message 
  }, 500);
}

    // Send welcome email (non-blocking)
    sendWelcomeEmail(env, email).catch(err => console.error('sendWelcomeEmail error:', err));

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