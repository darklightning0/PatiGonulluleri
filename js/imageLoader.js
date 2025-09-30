/**
 * Image loading optimization utilities using Intersection Observer
 */

class ImageLoader {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1,
            ...options
        };
        
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Start loading
        img.classList.add('loading');
        
        // Create a new image to preload
        const tempImage = new Image();
        
        tempImage.onload = () => {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        
        tempImage.onerror = () => {
            console.error('Failed to load image:', src);
            img.classList.remove('loading');
            img.classList.add('error');
        };
        
        tempImage.src = src;
    }

    observe(element) {
        this.observer.observe(element);
    }

    disconnect() {
        this.observer.disconnect();
    }
}

// Initialize global image loader
window.imageLoader = new ImageLoader();

/**
 * Initialize lazy loading for all images with data-src
 */
function initImageLazyLoading() {
    if (!window.imageLoader) {
        console.error('ImageLoader not initialized');
        return;
    }

    document.querySelectorAll('img[data-src]').forEach(img => {
        window.imageLoader.observe(img);
    });
}

// Export utilities
window.utils = {
    ...window.utils,
    initImageLazyLoading
};