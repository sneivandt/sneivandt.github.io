/**
 * Particles Manager
 * Handles initialization and cleanup of particles.js (Classic version)
 */

const PARTICLES_ID = 'particles-js';
const SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js';
const SCRIPT_INTEGRITY = 'sha384-oHYQNeDBTZNj6KnIfJMAzcEn2OTbeMKKXFeEwU6T+pH0oS1yTIzEBaW6BXmCtvs2';

let loadPromise = null;

// Helper to get theme color from CSS variables
const getThemeColor = () => {
  if (typeof getComputedStyle !== 'function') return '#ffffff';
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue('--color-primary').trim() || '#4DD0E1';
};

/**
 * Loads the particles.js library dynamically.
 */
const loadLibrary = () => {
  // Check if already loaded
  if (window.particlesJS) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.integrity = SCRIPT_INTEGRITY;
    script.crossOrigin = 'anonymous';
    script.src = SCRIPT_URL;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => {
      loadPromise = null; // Reset on failure so we can retry
      reject(e);
    };
    document.head.appendChild(script);
  });
  return loadPromise;
};

/**
 * Initializes the particles effect.
 */
export const startParticles = async () => {
  const container = document.getElementById(PARTICLES_ID);
  if (!container) return;

  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    await loadLibrary();

    const colorHex = getThemeColor(); // e.g., "#4DD0E1"

    if (window.particlesJS) {
      // Basic configuration for the classic particles.js
      window.particlesJS(PARTICLES_ID, {
        "particles": {
          "number": {
            "value": 60,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": colorHex
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#000000"
            }
          },
          "opacity": {
            "value": 0.5,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 3,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 40,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 150,
            "color": colorHex,
            "opacity": 0.4,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
              "enable": false,
              "rotateX": 600,
              "rotateY": 1200
            }
          }
        },
        "interactivity": {
          "detect_on": "window", // Important: listeners on window to handle background clicks
          "events": {
            "onhover": {
              "enable": true,
              "mode": "repulse"
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 400,
              "line_linked": {
                "opacity": 1
              }
            },
            "bubble": {
              "distance": 400,
              "size": 40,
              "duration": 2,
              "opacity": 8,
              "speed": 3
            },
            "repulse": {
              "distance": 100,
              "duration": 0.4
            },
            "push": {
              "particles_nb": 4
            },
            "remove": {
              "particles_nb": 2
            }
          }
        },
        "retina_detect": true
      });
    }
  } catch (e) {
    console.error('Failed to initialize particles.js:', e);
  }
};

/**
 * Stops and cleans up the particles effect.
 */
export const stopParticles = () => {
  // Access the global array pJSDom where particles.js stores instances
  if (window.pJSDom && Array.isArray(window.pJSDom) && window.pJSDom.length > 0) {
    // Iterate and destroy all instances related to our ID
    // Note: particles.js stores the pJS object which has a destroy methods
    for (let i = window.pJSDom.length - 1; i >= 0; i--) {
        const instance = window.pJSDom[i];
        if (instance.pJS && instance.pJS.canvas && instance.pJS.canvas.el) {
            // Check if this instance belongs to our container
            // (or just clear all for safety since we only use one)
             if (instance.pJS.fn.vendors.destroypJS) {
                 instance.pJS.fn.vendors.destroypJS();
             }
        }
    }
    // Reset the array
    window.pJSDom = [];
  }
};
