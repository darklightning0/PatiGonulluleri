// functions/api/confirm.js
// Confirm email subscription

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return new Response('Invalid token', { status: 400 });
  }

  try {
    // Get pending subscription
    const pending = await env.DB.prepare(`
      SELECT * FROM pending_subscriptions 
      WHERE token = ? AND expires_at > ?
    `).bind(token, Date.now()).first();

    if (!pending) {
      return new Response('Invalid or expired token', { status: 400 });
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomUUID();

    // Move to active subscriptions
    await env.DB.prepare(`
      INSERT INTO subscriptions (email, preferences, unsubscribe_token, confirmed_at, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).bind(
      pending.email,
      pending.preferences,
      unsubscribeToken,
      Date.now()
    ).run();

    // Delete pending subscription
    await env.DB.prepare(`
      DELETE FROM pending_subscriptions WHERE token = ?
    `).bind(token).run();

    // Redirect to success page
    return Response.redirect(`${env.FRONTEND_URL}/subscription-confirmed.html`, 302);

  } catch (error) {
    console.error('Confirmation error:', error);
    return new Response('Error confirming subscription', { status: 500 });
  }
}