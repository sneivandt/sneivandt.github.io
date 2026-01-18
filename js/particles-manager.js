/**
 * Particles Manager
 * Handles initialization and cleanup of particles.js
 */

const PARTICLES_ID = 'particles-js';

/**
 * Initializes particles.js if available.
 */
export const startParticles = () => {
  // Guard against missing library or element
  if (typeof window.particlesJS === 'undefined' || !document.getElementById(PARTICLES_ID)) {
    return;
  }

  try {
    window.particlesJS(PARTICLES_ID, {
      particles: {
        number: { value: 50, density: { enable: true, value_area: 800 } },
        color: { value: '#78909C' },
        shape: { type: 'circle' },
        opacity: { value: 0.15, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#78909C', opacity: 0.1, width: 1 },
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
