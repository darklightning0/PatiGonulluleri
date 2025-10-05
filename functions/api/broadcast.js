// Admin broadcast endpoint - sends an email to all active subscribers in D1
// Protect this endpoint by setting ADMIN_SECRET in environment variables.

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const auth = request.headers.get('x-admin-secret') || request.headers.get('authorization');
  if (!auth || auth !== (env.ADMIN_SECRET || '')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { subject, html, text } = payload;
  if (!subject || (!html && !text)) {
    return new Response(JSON.stringify({ error: 'Missing subject or content' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Fetch active subscribers from D1
    const rows = await env.DB.prepare('SELECT email FROM subscriptions WHERE is_active = 1').all();
    const emails = (rows && rows.results) ? rows.results.map(r => r.email) : [];

    if (!emails || emails.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscribers' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Batch recipients to avoid very large requests. Use batches of 100.
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const body = {
        from: env.BROADCAST_FROM || 'Pati Gönüllüleri <noreply@patigonulluleri.com>',
        to: batch,
        subject,
      };
      if (html) body.html = html;
      if (text) body.text = text;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      const textBody = await res.text().catch(() => '<no-body>');
      results.push({ status: res.status, ok: res.ok, body: textBody, batchCount: batch.length });
      console.log('broadcast batch sent', { status: res.status, batchCount: batch.length, body: textBody });
    }

    return new Response(JSON.stringify({ message: 'Broadcast sent', batches: results }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Broadcast error', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
