/**
 * Progressive, dependency-free enhancements for the site:
 * - Typewriter effect for the header
 * - Particle background effect
 *
 * Respects user preferences for reduced motion.
 */

import Typewriter from './typewriter.js';
import { startParticles, stopParticles } from './particles-manager.js';

/* ------------------------------------------------------------
 * Environment + Element References
 * ------------------------------------------------------------ */
const typedTarget = document.getElementById('typed');
const stringsSrc = document.getElementById('typed-strings');

let typewriterInstance = null;

/* ------------------------------------------------------------
 * Feature Control Logic
 * ------------------------------------------------------------ */

/**
 * Sets fallback text if typewriter is disabled or fails.
 */
const setFallbackText = () => {
  if (typedTarget) {
    typedTarget.textContent = typedTarget.getAttribute('data-fallback') || 'Software Engineer';
  }
};

/**
 * Initializes the typewriter effect.
 */
const startTypewriter = () => {
  // Cleanup if exists (safety)
  if (typewriterInstance) {
    typewriterInstance.destroy();
  }

  if (!typedTarget || !stringsSrc) return;

  try {
    // Extract strings from the hidden container
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
    console.warn('Typewriter init failed:', e);
    setFallbackText();
  }
};

/**
 * Stops the typewriter effect and sets fallback text.
 */
const stopTypewriter = () => {
  if (typewriterInstance) {
    typewriterInstance.destroy();
    typewriterInstance = null;
  }
  setFallbackText();
};

/* ------------------------------------------------------------
 * Orchestration
 * ------------------------------------------------------------ */
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Handles changes in reduced motion preference.
 * @param {MediaQueryListEvent|MediaQueryList} e
 */
const handleMotionPreference = (e) => {
  if (e.matches) {
    // Reduced motion requested
    stopTypewriter();
    stopParticles();
  } else {
    // Motion allowed
    startTypewriter();
    startParticles();
  }
};

// Initialize based on current state
handleMotionPreference(mediaQuery);

// Listen for changes
mediaQuery.addEventListener('change', handleMotionPreference);

/* ------------------------------------------------------------
 * Service Worker Registration for PWA / Offline Support
 * ------------------------------------------------------------ */
if ('serviceWorker' in navigator) {
  // Register after load to prioritize content rendering
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW failed:', err));
  });
}
