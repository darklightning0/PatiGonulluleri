/**
 * Cloudflare Function - /functions/api/delete-from-r2.js
 * 
 * Deletes images from R2 bucket
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { uniqueId, imageCount } = body;
    
    if (!uniqueId) {
      return new Response(
        JSON.stringify({ error: 'Missing uniqueId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`🗑️ Deleting images for: ${uniqueId}, count: ${imageCount}`);
    
    let deletedCount = 0;
    const errors = [];
    
    // Try to delete all possible image files
    const maxImages = imageCount || 10; // Default to 10 if not specified
    
    for (let i = 1; i <= maxImages; i++) {
      // Try common extensions
      const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      
      for (const ext of extensions) {
        const filename = `${uniqueId}_${i}.${ext}`;
        
        try {
          await env.IMAGES.delete(filename);
          deletedCount++;
          console.log(`✅ Deleted: ${filename}`);
        } catch (error) {
          // File might not exist, continue
          console.log(`⏭️ Skipped: ${filename}`);
        }
      }
    }
    
    console.log(`✅ Total deleted: ${deletedCount}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        deletedCount: deletedCount,
        uniqueId: uniqueId
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('❌ R2 deletion error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Deletion failed',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}