/**
 * @file main.js
 * @description Core entry point for the site's JavaScript. Handles initialization of all modules.
 */

import { Typewriter } from './typewriter.js';
import { ShareButton } from './share-button.js';
import { ConsoleBrand } from './console-brand.js';
import { LastUpdated } from './last-updated.js';
import { ConnectionStatus } from './connection-status.js';

/* ------------------------------------------------------------
 * DOM References
 * ------------------------------------------------------------ */
const typedTarget = document.getElementById('typed');
const stringsSrc = document.getElementById('typed-strings');

/**
 * Global Typewriter instance reference
 * @type {Typewriter|null}
 */
let typewriterInstance = null;

/* ------------------------------------------------------------
 * Typewriter Logic
 * ------------------------------------------------------------ */

/**
 * Sets fallback text if typewriter is disabled or fails.
 */
const setFallbackText = () => {
  if (typedTarget) {
    const fallback = typedTarget.getAttribute('data-fallback');
    typedTarget.textContent = fallback || 'Software Engineer';
  }
};

/**
 * Initializes the typewriter effect.
 */
const startTypewriter = () => {
  // Cleanup existing instance
  if (typewriterInstance) {
    typewriterInstance.destroy();
  }

  if (!typedTarget || !stringsSrc) return;

  try {
    // Parse strings from hidden DOM elements
    const strings = Array.from(stringsSrc.children)
      .map(el => el.textContent.trim())
      .filter(str => str.length > 0);

    if (strings.length > 0) {
      typewriterInstance = new Typewriter(typedTarget, strings, {
        loop: true,
        typeSpeed: 60,
        backSpeed: 30,
        backDelay: 2000,
        startDelay: 500
      });
    }
  } catch (e) {
    console.warn('Typewriter initialization failed:', e);
    setFallbackText();
  }
};

/**
 * Stops the typewriter effect and displays static text.
 */
const stopTypewriter = () => {
  if (typewriterInstance) {
    typewriterInstance.destroy();
    typewriterInstance = null;
  }
  setFallbackText();
};

/* ------------------------------------------------------------
 * Motion Preferences
 * ------------------------------------------------------------ */
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Responds to changes in reduced motion preferences.
 * @param {MediaQueryListEvent|MediaQueryList} e
 */
const handleMotionPreference = (e) => {
  if (e.matches) {
    stopTypewriter();
  } else {
    startTypewriter();
  }
};

// Initial check and event listener
handleMotionPreference(mediaQuery);
mediaQuery.addEventListener('change', handleMotionPreference);

/* ------------------------------------------------------------
 * Module Initialization
 * ------------------------------------------------------------ */

// Share Button
new ShareButton();

// Console Branding
new ConsoleBrand();

// Last Updated Date
new LastUpdated('last-updated-date');

// Offline Indicator
new ConnectionStatus('offline-status');

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
