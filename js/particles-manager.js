/**
 * Particles Manager
 * Handles initialization and cleanup of tsParticles
 */

const PARTICLES_ID = 'particles-js';
const SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/slim@3.9.1/tsparticles.slim.bundle.min.js';
let loadPromise = null;
let particlesContainer = null;

/*
 * Dynamically loads the tsParticles library.
 * Returns a promise that resolves when the library is loaded.
 */
const loadParticlesLibrary = () => {
  if (typeof window.tsParticles !== 'undefined') {
    return Promise.resolve();
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    // SRI hash for: https://cdn.jsdelivr.net/npm/@tsparticles/slim@3.9.1/tsparticles.slim.bundle.min.js
    // Verified Jan 2026
    script.integrity = "sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb";
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
 * Initializes tsParticles if available.
 */
export const startParticles = async () => {
  // Guard against missing element
  if (!document.getElementById(PARTICLES_ID)) {
    return;
  }

  try {
    await loadParticlesLibrary();
  } catch (e) {
    console.warn('Failed to load tsParticles:', e);
    return;
  }

  // Graceful exit if user prefers reduced motion (race condition protection)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Idempotency: Prevent multiple instances
  if (particlesContainer) {
    return;
  }

  // Extract color from CSS variable for consistency
  const style = getComputedStyle(document.documentElement);
  const primaryColor = style.getPropertyValue('--color-primary').trim() || '#78909C';

  try {
    particlesContainer = await window.tsParticles.load({
      id: PARTICLES_ID,
      options: {
        particles: {
          number: { value: 50, density: { enable: true, area: 800 } },
          color: { value: primaryColor },
          shape: { type: 'circle' },
          opacity: { value: 0.15, random: true },
          size: { value: 3, random: true },
          links: { enable: true, distance: 150, color: primaryColor, opacity: 0.1, width: 1 },
          move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, outModes: 'out' }
        },
        interactivity: {
          detectsOn: 'canvas',
          events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
            resize: true
          }
        },
        detectRetina: true
      }
    });
  } catch (e) {
    console.warn('tsParticles init failed:', e);
  }
};

/**
 * Cleans up tsParticles instance.
 */
export const stopParticles = () => {
  if (particlesContainer) {
    particlesContainer.destroy();
    particlesContainer = null;
  }
};
