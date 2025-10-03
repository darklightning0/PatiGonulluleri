// functions/api/subscribe.js
// Cloudflare Pages Function for subscription

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const data = await request.json();
    const { email, animalType, size, age } = data;

    // Validate email
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting check
    const ip = request.headers.get('CF-Connecting-IP');
    const rateLimitKey = `ratelimit:${email}`;
    const ipKey = `ip:${ip}`;
    
    // Check email rate limit (3 per hour)
    const emailAttempts = await env.RATE_LIMIT.get(rateLimitKey);
    if (emailAttempts && parseInt(emailAttempts) >= 3) {
      return new Response(JSON.stringify({ 
        error: 'Too many attempts. Please try again in an hour.' 
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate confirmation token
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

    // Store pending subscription in D1
    await env.DB.prepare(`
      INSERT INTO pending_subscriptions (email, token, preferences, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      email,
      token,
      JSON.stringify({ animalType, size, age }),
      expiresAt,
      Date.now()
    ).run();

    // Update rate limit
    await env.RATE_LIMIT.put(rateLimitKey, (parseInt(emailAttempts || '0') + 1).toString(), {
      expirationTtl: 3600
    });

    // Send confirmation email
    await sendConfirmationEmail(env, email, token);

    return new Response(JSON.stringify({ 
      message: 'Confirmation email sent. Please check your inbox.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendConfirmationEmail(env, email, token) {
  const confirmUrl = `${env.FRONTEND_URL}/api/confirm?token=${token}`;
  
  await fetch('https://api.resend.com/emails', {
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
        <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #E98532; color: white; text-decoration: none; border-radius: 8px;">
          Aboneliği Onayla
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Bu linkin geçerlilik süresi 24 saattir.
        </p>
      `
    })
  });
}