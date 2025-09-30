/**
 * Language Manager for centralized language handling
 */

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'tr';
        this.listeners = new Set();
        window.currentLanguage = this.currentLang; // Legacy support
    }
    
    setLanguage(lang) {
        if (this.currentLang === lang) return;
        
        // Add transition class
        document.body.classList.add('changing-language');
        
        this.currentLang = lang;
        window.currentLanguage = lang; // Legacy support
        localStorage.setItem('preferredLanguage', lang);
        
        // Update all translatable elements
        this.updateDOM();
        
        // Notify all listeners
        this.listeners.forEach(callback => {
            try {
                callback(lang);
            } catch (err) {
                console.error('Error in language change listener:', err);
            }
        });
        
        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
        
        // Remove transition class
        setTimeout(() => {
            document.body.classList.remove('changing-language');
        }, 200);
    }
    
    getLanguage() {
        return this.currentLang;
    }
    
    subscribe(callback) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }
    
    updateDOM() {
        // Update all elements with data-tr/data-en attributes
        document.querySelectorAll('[data-tr][data-en]').forEach(element => {
            const text = element.dataset[this.currentLang];
            
            if (!text) return;
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // Handle form elements
                if (element.placeholder !== undefined) {
                    element.placeholder = text;
                }
            } else if (element.tagName === 'OPTION') {
                // Handle select options
                element.textContent = text;
            } else {
                // Handle regular elements while preserving child elements
                const childElements = Array.from(element.children);
                element.textContent = text;
                childElements.forEach(child => {
                    if (!child.matches('[data-tr][data-en]')) {
                        element.appendChild(child);
                    }
                });
            }
        });
        
        // Update document language attribute
        document.documentElement.lang = this.currentLang;
        
        // Update meta description if available
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.dataset[this.currentLang]) {
            metaDesc.content = metaDesc.dataset[this.currentLang];
        }
    }
}

// Initialize global language manager and expose it
window.languageManager = new LanguageManager();

// CSS for language transitions
const styleSheet = document.createElement('style');
styleSheet.textContent = `
[data-tr][data-en] {
    transition: opacity 0.2s ease;
}

body.changing-language [data-tr][data-en] {
    opacity: 0.7;
}
`;
document.head.appendChild(styleSheet);

// Export utilities
window.utils = {
    ...window.utils,
    LanguageManager
};