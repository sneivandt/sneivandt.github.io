/**
 * Particles Manager
 * Handles initialization and cleanup of particles.js
 */

const PARTICLES_ID = 'particles-js';
const SCRIPT_URL = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
let loadPromise = null;

/*
 * Dynamically loads the particles.js library.
 * Returns a promise that resolves when the library is loaded.
 */
const loadParticlesLibrary = () => {
  if (typeof window.particlesJS !== 'undefined') {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    // SRI hash derived from: https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js
    // Verified Jan 2026
    script.integrity = "sha384-d+UOwmNNIC7V4izkTAKSXzWhjC2GxiS9PTykO1XdOPC3nc2z65UOS7SP6QdKPA70";
    script.crossOrigin = "anonymous";
    script.defer = true;
    script.referrerPolicy = "no-referrer";
    script.onload = () => {
      resolve();
    };
    script.onerror = (e) => {
      reject(e);
    };
    document.head.appendChild(script);
  });
    
  return loadPromise;
};

/**
 * Initializes particles.js if available.
 */
export const startParticles = async () => {
  // Guard against missing element
  if (!document.getElementById(PARTICLES_ID)) {
    return;
  }

  try {
    await loadParticlesLibrary();
  } catch (e) {
    console.warn('Failed to load particles.js:', e);
    return;
  }

  // Graceful exit if user prefers reduced motion (race condition protection)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Idempotency: Prevent multiple instances
  if (window.pJSDom && window.pJSDom.length > 0) {
    return;
  }

  // Extract color from CSS variable for consistency
  const style = getComputedStyle(document.documentElement);
  const primaryColor = style.getPropertyValue('--color-primary').trim() || '#78909C';

  try {
    window.particlesJS(PARTICLES_ID, {
      particles: {
        number: { value: 50, density: { enable: true, value_area: 800 } },
        color: { value: primaryColor },
        shape: { type: 'circle' },
        opacity: { value: 0.15, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: primaryColor, opacity: 0.1, width: 1 },
        move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        }
      },
      retina_detect: true
    });
  } catch (e) {
    console.warn('particles.js init failed:', e);
  }
};

/**
 * Cleans up particles.js instance.
 */
export const stopParticles = () => {
  // Standard particles.js cleanup
  if (window.pJSDom && window.pJSDom.length > 0) {
    // Iterate carefully in case multiple instances
    for (const dom of window.pJSDom) {
      dom.pJS?.fn?.vendors?.destroypJS?.();
    }
    window.pJSDom = [];
  }
};
