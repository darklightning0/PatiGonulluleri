export async function onRequestPost(context) {
  const { request, env } = context;
  const GOOGLE_SCRIPT_URL = env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    return new Response(
      JSON.stringify({
        result: 'error',
        message: 'Server configuration error: Google Script URL is not set.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Clone the request body so it can be read safely
    const formData = await request.formData();

    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
    });

    const text = await googleResponse.text();

    return new Response(text, {
      status: googleResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error proxying request to Google Script:', error);
    return new Response(
      JSON.stringify({
        result: 'error',
        message: 'An internal server error occurred while sending the form.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
