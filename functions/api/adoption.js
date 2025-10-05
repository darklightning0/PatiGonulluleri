// /api/adoption - receives adoption application submissions and emails the caretaker
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const required = ['name','phone','email','livingSituation','experience','agreement','petId','petName'];
  for (const field of required) {
    if (!data[field]) {
      return new Response(JSON.stringify({ error: `Missing field: ${field}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Determine recipient: prefer caretakerEmail provided by client, otherwise ADMIN_CONTACT
  const caretakerEmail = data.caretakerEmail || env.ADMINS_EMAIL || '';
  const recipient = caretakerEmail || (env.ADMINS_EMAIL || '');

  if (!recipient) {
    console.error('No recipient configured for adoption emails');
    return new Response(JSON.stringify({ error: 'No recipient configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const subject = `Sahiplendirme Başvurusu - ${data.petName} (${data.petId})`;
  const html = `
    <h3>Yeni Sahiplendirme Başvurusu</h3>
    <p><strong>İlgilenen:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>E-posta:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Yaşam Durumu:</strong> ${escapeHtml(data.livingSituation)}</p>
    <p><strong>Deneyim:</strong> ${escapeHtml(data.experience)}</p>
    <p><strong>Notlar:</strong> ${escapeHtml(data.notes || '')}</p>
    <p><strong>İlan:</strong> ${escapeHtml(data.petName)} (ID: ${escapeHtml(String(data.petId))})</p>
    <p><em>Bu mesaj Pati Gönüllüleri tarafından iletilmiştir.</em></p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({ from: env.ADOPTION_FROM || 'Pati Gönüllüleri <noreply@patigonulluleri.com>', to: recipient, subject, html })
    });

    const text = await res.text().catch(() => '<no-body>');
    if (!res.ok) {
      console.error('Resend adoption send error', res.status, text);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: text }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('Adoption email sent', { to: recipient, status: res.status });
    return new Response(JSON.stringify({ message: 'Application sent' }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Adoption email error', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
