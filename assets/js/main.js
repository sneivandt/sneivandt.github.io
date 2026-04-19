/**
 * @file main.js
 * @description Core entry point for the site's JavaScript. 
 * Registers web components and initializes the service worker.
 */

// Import and register web components
import './components/typewriter-effect.js';
import './components/share-button.js';
import './components/connection-status.js';
import './components/console-brand.js';
import './components/profile-card.js';
import './components/social-links.js';
import './components/copyright-notice.js';
import './components/aurora-background.js';

// Progressive-enhancement micro-interactions (spotlight, magnetic icons,
// profile tilt, letter reveal). Imported after components so the DOM the
// effects target has already been rendered.
import './effects.js';

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
