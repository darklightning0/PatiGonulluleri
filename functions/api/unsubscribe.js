// functions/api/unsubscribe.js
// One-click unsubscribe

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return new Response('Invalid token', { status: 400 });
  }

  try {
    // Deactivate subscription
    await env.DB.prepare(`
      UPDATE subscriptions 
      SET is_active = 0, unsubscribed_at = ?
      WHERE unsubscribe_token = ?
    `).bind(Date.now(), token).run();

    // Redirect to unsubscribe confirmation page
    return Response.redirect(`${env.FRONTEND_URL}/unsubscribed.html`, 302);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response('Error unsubscribing', { status: 500 });
  }
}