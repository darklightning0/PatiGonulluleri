// js/firebase-data-service.js
// This replaces your static pets-data.js and articles-data.js

import { 
  getFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  increment,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Get db from window (set in index.html)
const db = window.db;

const COLLECTIONS = {
  PETS: 'pets',
  ARTICLES: 'articles'
};
// ====================
// PETS SERVICE
// ====================

export const PetsService = {
  /**
   * Get all active pets
   */
  async getAll() {
    const q = query(
      collection(db, COLLECTIONS.PETS),
      where('active', '==', true),
      orderBy('dateAdded', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get featured pets (for homepage)
   */
  async getFeatured(count = 3) {
    const q = query(
      collection(db, COLLECTIONS.PETS),
      where('active', '==', true),
      orderBy('urgent', 'desc'),
      orderBy('dateAdded', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get pet by ID
   */
  async getById(petId) {
    const docRef = doc(db, COLLECTIONS.PETS, petId.toString());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        views: increment(1)
      });
      
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  /**
   * Filter pets by criteria
   */
  async filter(filters) {
    let q = query(collection(db, COLLECTIONS.PETS), where('active', '==', true));
    
    if (filters.type && filters.type !== 'all') {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.size && filters.size !== 'all') {
      q = query(q, where('size', '==', filters.size));
    }
    
    if (filters.ageGroup && filters.ageGroup !== 'all') {
      q = query(q, where('ageGroup', '==', filters.ageGroup));
    }
    
    if (filters.urgent) {
      q = query(q, where('urgent', '==', true));
    }
    
    q = query(q, orderBy('dateAdded', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get newly added pets (for notifications)
   */
  async getNewPets(sinceTimestamp) {
    const q = query(
      collection(db, COLLECTIONS.PETS),
      where('active', '==', true),
      where('dateAdded', '>', sinceTimestamp),
      where('notificationSent', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Mark pets as notified
   */
  async markAsNotified(petIds) {
    const promises = petIds.map(petId => 
      updateDoc(doc(db, COLLECTIONS.PETS, petId.toString()), {
        notificationSent: true,
        lastNotificationAt: serverTimestamp()
      })
    );
    
    await Promise.all(promises);
  }
};

// ====================
// ARTICLES SERVICE
// ====================

export const ArticlesService = {
  /**
   * Get all active articles
   */
  async getAll() {
    const q = query(
      collection(db, COLLECTIONS.ARTICLES),
      where('active', '==', true),
      orderBy('publishDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get featured articles (for homepage)
   */
  async getFeatured(count = 3) {
    const q = query(
      collection(db, COLLECTIONS.ARTICLES),
      where('active', '==', true),
      where('featured', '==', true),
      orderBy('publishDate', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get latest articles
   */
  async getLatest(count = 3) {
    const q = query(
      collection(db, COLLECTIONS.ARTICLES),
      where('active', '==', true),
      orderBy('publishDate', 'desc'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get article by ID or slug
   */
  async getById(articleId) {
    const docRef = doc(db, COLLECTIONS.ARTICLES, articleId.toString());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        actualViews: increment(1)
      });
      
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  /**
   * Get article by slug
   */
  async getBySlug(slug) {
    const q = query(
      collection(db, COLLECTIONS.ARTICLES),
      where('slug', '==', slug),
      where('active', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      // Increment view count
      await updateDoc(doc.ref, {
        actualViews: increment(1)
      });
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  /**
   * Filter articles by category
   */
  async filterByCategory(categoryTr) {
    const q = query(
      collection(db, COLLECTIONS.ARTICLES),
      where('active', '==', true),
      where('category.tr', '==', categoryTr),
      orderBy('publishDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Search articles by title
   */
  async search(searchTerm, lang = 'tr') {
    // Note: Firestore doesn't have full-text search
    // For production, use Algolia or similar
    const allArticles = await this.getAll();
    
    return allArticles.filter(article => 
      article.title[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary[lang].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

// ====================
// CACHE LAYER (Optional but recommended)
// ====================

class DataCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export const cache = new DataCache();

// ====================
// CACHED SERVICE WRAPPERS
// ====================

export const CachedPetsService = {
  async getFeatured(count = 3) {
    const cacheKey = `featured_pets_${count}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    const data = await PetsService.getFeatured(count);
    cache.set(cacheKey, data);
    return data;
  },

  async getAll() {
    const cacheKey = 'all_pets';
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    const data = await PetsService.getAll();
    cache.set(cacheKey, data);
    return data;
  },

  async getById(petId) {
    const cacheKey = `pet_${petId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const data = await PetsService.getById(petId);
    if (data) cache.set(cacheKey, data);
    return data;
  }
};

export const CachedArticlesService = {
  async getLatest(count = 3) {
    const cacheKey = `latest_articles_${count}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    const data = await ArticlesService.getLatest(count);
    cache.set(cacheKey, data);
    return data;
  },

  async getAll() {
    const cacheKey = 'all_articles';
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    const data = await ArticlesService.getAll();
    cache.set(cacheKey, data);
    return data;
  }
};