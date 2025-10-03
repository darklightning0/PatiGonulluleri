// workers/notification-scheduler-firebase.js
// Updated cron worker that reads from Firebase

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(processNotifications(env));
  }
};

async function processNotifications(env) {
  try {
    // 1. Get Firebase credentials from environment
    const firebaseProjectId = env.FIREBASE_PROJECT_ID;
    const firebaseApiKey = env.FIREBASE_API_KEY;
    
    // 2. Get new pets from Firebase (added in last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    const newPetsQuery = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents:runQuery`;
    
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: 'pets' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'active' },
                  op: 'EQUAL',
                  value: { booleanValue: true }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'dateAdded' },
                  op: 'GREATER_THAN',
                  value: { integerValue: oneHourAgo.toString() }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'notificationSent' },
                  op: 'EQUAL',
                  value: { booleanValue: false }
                }
              }
            ]
          }
        }
      }
    };

    const petsResponse = await fetch(queryBody, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    });

    const petsData = await petsResponse.json();
    
    if (!petsData || petsData.length === 0) {
      console.log('No new pets to notify about');
      return;
    }

    // Parse Firebase response
    const newPets = petsData
      .filter(item => item.document)
      .map(item => parseFirestoreDocument(item.document));

    if (newPets.length === 0) {
      console.log('No new pets found');
      return;
    }

    // 3. Get active subscriptions from D1 (keeping subscription data in D1)
    const subscriptions = await env.DB.prepare(`
      SELECT * FROM subscriptions WHERE is_active = 1
    `).all();

    // 4. Group notifications by subscriber
    const notificationGroups = new Map();

    for (const sub of subscriptions.results) {
      const prefs = JSON.parse(sub.preferences);
      const matchingPets = newPets.filter(pet => 
        matchesPreferences(pet, prefs)
      );

      if (matchingPets.length > 0) {
        notificationGroups.set(sub.email, {
          subscription: sub,
          pets: matchingPets
        });
      }
    }

    // 5. Send batched emails
    const emailPromises = [];
    for (const [email, data] of notificationGroups) {
      emailPromises.push(
        sendNotificationEmail(env, email, data.pets, data.subscription)
      );
    }

    await Promise.allSettled(emailPromises);

    // 6. Mark pets as notified in Firebase
    await markPetsAsNotified(env, firebaseProjectId, newPets.map(p => p.id));

    console.log(`Sent ${emailPromises.length} notification emails`);

  } catch (error) {
    console.error('Notification processing error:', error);
  }
}

// Helper function to parse Firestore document
function parseFirestoreDocument(doc) {
  const fields = doc.fields;
  const parsed = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue) parsed[key] = value.stringValue;
    else if (value.integerValue) parsed[key] = parseInt(value.integerValue);
    else if (value.booleanValue !== undefined) parsed[key] = value.booleanValue;
    else if (value.mapValue) parsed[key] = parseFirestoreDocument({ fields: value.mapValue.fields });
    else if (value.arrayValue) parsed[key] = value.arrayValue.values.map(v => parseFirestoreValue(v));
  }
  
  // Extract ID from document name
  const pathParts = doc.name.split('/');
  parsed.id = pathParts[pathParts.length - 1];
  
  return parsed;
}

function parseFirestoreValue(value) {
  if (value.stringValue) return value.stringValue;
  if (value.integerValue) return parseInt(value.integerValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.mapValue) return parseFirestoreDocument({ fields: value.mapValue.fields });
  return null;
}

// Mark pets as notified in Firebase
async function markPetsAsNotified(env, projectId, petIds) {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pets`;
  
  const promises = petIds.map(async (petId) => {
    const updateUrl = `${baseUrl}/${petId}?updateMask.fieldPaths=notificationSent&updateMask.fieldPaths=lastNotificationAt`;
    
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          notificationSent: { booleanValue: true },
          lastNotificationAt: { timestampValue: new Date().toISOString() }
        }
      })
    });
  });
  
  await Promise.all(promises);
}

function matchesPreferences(pet, prefs) {
  if (prefs.animalType !== 'any' && pet.type !== prefs.animalType) {
    return false;
  }

  if (prefs.size !== 'any' && pet.size !== prefs.size) {
    return false;
  }

  if (prefs.age !== 'any') {
    const petAgeGroup = pet.age <= 2 ? 'young' : (pet.age <= 7 ? 'adult' : 'senior');
    if (petAgeGroup !== prefs.age) {
      return false;
    }
  }

  return true;
}

async function sendNotificationEmail(env, email, pets, subscription) {
  // Use the same email template from before
  // ... (email sending code remains the same)
}