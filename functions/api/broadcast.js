// Admin broadcast endpoint - sends an email to all active subscribers using Resend Audience API
// Protect this endpoint by setting ADMIN_SECRET in environment variables.
// Required env vars: ADMIN_SECRET, RESEND_API_KEY, RESEND_AUDIENCE_ID

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

  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
    return new Response(JSON.stringify({ error: 'Resend API configuration missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Fetch all contacts from Resend Audience API
    const contactsRes = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!contactsRes.ok) {
      const errorText = await contactsRes.text().catch(() => '<no-body>');
      console.error('Failed to fetch contacts from Resend:', contactsRes.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriber list' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const contactsData = await contactsRes.json();
    // Filter only subscribed contacts (unsubscribed: false)
    const emails = (contactsData.data || [])
      .filter(contact => !contact.unsubscribed)
      .map(contact => contact.email);

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

    return new Response(JSON.stringify({ message: 'Broadcast sent', batches: results, totalSubscribers: emails.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Broadcast error', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}