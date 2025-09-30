/**
 * Articles page caching utilities
 */

// Cache for filtered and sorted results
class ResultsCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 50; // Maximum number of cache entries
    }

    generateKey({ search, category, sort, page }) {
        return JSON.stringify({ search, category, sort, page });
    }

    get({ search, category, sort, page }) {
        const key = this.generateKey({ search, category, sort, page });
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Check if cache is still valid (5 minutes)
        if (Date.now() - cached.timestamp > 300000) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    set({ search, category, sort, page }, data) {
        const key = this.generateKey({ search, category, sort, page });
        
        // Clear oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clear() {
        this.cache.clear();
    }
}

// Initialize global results cache
window.resultsCache = new ResultsCache();

// Export utilities
window.utils = {
    ...window.utils,
    ResultsCache
};