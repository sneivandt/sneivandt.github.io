/**
 * @file main.js
 * @description Core entry point for the site's JavaScript. 
 * Initializes the service worker.
 */

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
