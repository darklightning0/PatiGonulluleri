// functions/api/admin/pets.js
// Admin endpoint to add/update pets in Firebase

// Authentication middleware
function checkAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}

// POST - Add new pet
export async function onRequestPost(context) {
  const { request, env } = context;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;

  try {
    const petData = await request.json();
    
    if (!petData.name || !petData.type || !petData.age) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: name, type, age' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ageGroup = petData.age <= 2 ? 'young' : 
                    (petData.age <= 7 ? 'adult' : 'senior');

    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/pets`;

    const petDoc = {
      fields: {
        name: { stringValue: petData.name },
        type: { stringValue: petData.type },
        breed: { stringValue: petData.breed || '' },
        age: { integerValue: petData.age },
        ageGroup: { stringValue: ageGroup },
        size: { stringValue: petData.size },
        gender: { stringValue: petData.gender },
        description: { stringValue: petData.description },
        image: { stringValue: petData.image },
        location: { stringValue: petData.location || 'İzmir' },
        urgent: { booleanValue: petData.urgent || false },
        dateAdded: { integerValue: Date.now() },
        notificationSent: { booleanValue: false },
        active: { booleanValue: true },
        views: { integerValue: 0 }
      }
    };

    const response = await fetch(firebaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petDoc)
    });

    if (!response.ok) {
      throw new Error('Firebase error: ' + await response.text());
    }

    const result = await response.json();
    const petId = result.name.split('/').pop();

    return new Response(JSON.stringify({
      success: true,
      message: 'Pet added successfully',
      petId: petId,
      note: 'Notifications will be sent within the next hour'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error adding pet:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT - Update existing pet
export async function onRequestPut(context) {
  const { request, env } = context;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const petId = url.searchParams.get('id');
    
    if (!petId) {
      return new Response(JSON.stringify({ error: 'Pet ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates = await request.json();
    const updateMask = Object.keys(updates).map(k => `updateMask.fieldPaths=${k}`).join('&');
    
    const fields = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') fields[key] = { stringValue: value };
      else if (typeof value === 'number') fields[key] = { integerValue: value };
      else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    }

    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/pets/${petId}?${updateMask}`;

    const response = await fetch(firebaseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      throw new Error('Firebase error: ' + await response.text());
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Pet updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating pet:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE - Soft delete pet
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  const authError = checkAuth(request, env);
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const petId = url.searchParams.get('id');
    
    if (!petId) {
      return new Response(JSON.stringify({ error: 'Pet ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/pets/${petId}?updateMask.fieldPaths=active`;

    await fetch(firebaseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: { active: { booleanValue: false } }
      })
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Pet deactivated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting pet:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}