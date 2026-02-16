/**
 * @file main.js
 * @description Core entry point for the site's JavaScript. 
 * Registers web components and initializes the service worker.
 */

// Import and register web components
import './components/typewriter-effect.js';
import './components/share-button.js';
import './components/connection-status.js';
import './components/last-updated.js';
import './components/console-brand.js';
import './components/profile-card.js';
import './components/social-links.js';

/* ------------------------------------------------------------
 * Service Worker Registration
 * ------------------------------------------------------------ */
if ('serviceWorker' in navigator) {
  const registerSw = () => {
    navigator.serviceWorker.register('./sw.js')
      .catch((err) => {
        console.debug('ServiceWorker registration failed:', err);
      });
  };

  if (document.readyState === 'complete') {
    registerSw();
  } else {
    window.addEventListener('load', registerSw);
  }
}
