/**
 * Cloudflare Function - /functions/api/upload-to-r2.js
 * 
 * Receives base64 images from Google Apps Script and uploads to R2
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Parse request body
    const body = await request.json();
    const { image, filename, contentType } = body;
    
    if (!image || !filename) {
      return new Response(
        JSON.stringify({ error: 'Missing image or filename' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Decode base64 image
    const imageBuffer = Uint8Array.from(atob(image), c => c.charCodeAt(0));
    
    // Upload to R2
    await env.IMAGES.put(filename, imageBuffer, {
      httpMetadata: {
        contentType: contentType || 'image/jpeg'
      }
    });
    
    // Generate public URL
    const publicUrl = `https://images.patigonulluleri.com/${filename}`;
    
    console.log(`✅ Uploaded to R2: ${filename}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        filename: filename
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('❌ R2 upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Upload failed',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}