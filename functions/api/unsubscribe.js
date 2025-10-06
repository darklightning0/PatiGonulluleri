// functions/api/unsubscribe.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  }

  try {
    const data = await request.json();
    const { email } = data || {};

    if (!email || !isValidEmail(email)) {
      return jsonResponse({ error: 'Invalid email' }, 400);
    }

    if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID) {
      console.error('Resend API configuration missing');
      return jsonResponse({ error: 'Service not configured' }, 500);
    }

    // Get all contacts to find the one to unsubscribe
    const getContactRes = await fetch(
      `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!getContactRes.ok) {
      const errorText = await getContactRes.text().catch(() => '<no-body>');
      console.error('Failed to fetch contacts:', getContactRes.status, errorText);
      return jsonResponse({ error: 'Failed to fetch subscriber list' }, 500);
    }

    const contactsData = await getContactRes.json();
    const existingContact = (contactsData.data || []).find(c => c.email === email);

    if (!existingContact) {
      // Email not found in the list
      return jsonResponse({ 
        message: 'Email address not found in our mailing list',
        notFound: true 
      }, 200);
    }

    if (existingContact.unsubscribed) {
      // Already unsubscribed
      return jsonResponse({ 
        message: 'This email is already unsubscribed',
        alreadyUnsubscribed: true 
      }, 200);
    }

    // Unsubscribe the contact
    const updateRes = await fetch(
      `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts/${existingContact.id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          unsubscribed: true
        })
      }
    );

    if (!updateRes.ok) {
      const errorText = await updateRes.text().catch(() => '<no-body>');
      console.error('Failed to unsubscribe contact:', updateRes.status, errorText);
      return jsonResponse({ 
        error: 'Failed to unsubscribe',
        details: errorText,
        status: updateRes.status 
      }, 500);
    }

    console.log('Successfully unsubscribed:', email);

    // Optionally send a goodbye email (non-blocking)
    sendGoodbyeEmail(env, email).catch(err => 
      console.error('sendGoodbyeEmail error:', err)
    );

    return jsonResponse({ 
      message: 'Successfully unsubscribed',
      success: true 
    }, 200);

  } catch (err) {
    console.error('Unsubscribe handler error:', err);
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

async function sendGoodbyeEmail(env, email) {
  console.log('sendGoodbyeEmail: sending goodbye to', email);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.GOODBYE_FROM || 'Pati Gönüllüleri <noreply@patigonulluleri.com>',
        to: email,
        subject: env.GOODBYE_SUBJECT || 'Abonelikten Çıktınız - Pati Gönüllüleri',
        html: env.GOODBYE_HTML || `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #725037;">Abonelikten Başarıyla Çıktınız</h2>
            <p>E-posta listemizden çıkarıldınız. Artık bizden bildirim almayacaksınız.</p>
            <p>Hayvanlara olan sevginiz için teşekkür ederiz! 🐾</p>
            <p>Fikrini değiştirirsen, istediğin zaman <a href="https://patigonulluleri.com">patigonulluleri.com</a> adresinden tekrar abone olabilirsin.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="font-size: 12px; color: #888;">Pati Gönüllüleri - İzmir, Türkiye</p>
          </div>
        `
      })
    });

    const text = await res.text().catch(() => '<no-body>');
    if (!res.ok) {
      console.error('Resend goodbye error', res.status, text);
    } else {
      console.log('Resend goodbye success', res.status, text);
    }
    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error('sendGoodbyeEmail failed', err);
    throw err;
  }
}