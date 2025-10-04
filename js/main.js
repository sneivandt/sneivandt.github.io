/* main.js
 * - Initializes typed text effect (unless user prefers reduced motion)
 * - Configures particles background (if library available)
 * Defensive checks ensure graceful degradation if external libs fail to load.
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const typedTarget = document.querySelector('#typed');
    const root = document.documentElement;
    const toggleBtn = document.getElementById('theme-toggle');

    function getStoredTheme() {
      try { return localStorage.getItem('theme'); } catch(e) { return null; }
    }

    function storeTheme(t) {
      try { localStorage.setItem('theme', t); } catch(e) { /* ignore */ }
    }

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      if (toggleBtn) {
        const isDark = theme === 'dark';
        toggleBtn.setAttribute('aria-pressed', String(isDark));
        // Swap icon
        toggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>' : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        toggleBtn.title = isDark ? 'Light theme' : 'Dark theme';
      }
    }

    function initTheme() {
      const stored = getStoredTheme();
      if (stored) {
        applyTheme(stored);
      } else {
        // Respect existing attribute set by inline script; fallback to prefers-color-scheme
        const current = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(current);
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(current);
        storeTheme(current);
      });
    }

    initTheme();

    // Typed.js initialization (skip if reduced motion)
    if (!prefersReducedMotion && window.Typed && typedTarget) {
      try {
        new window.Typed('#typed', {
          stringsElement: '#typed-strings',
          typeSpeed: 50,
          backSpeed: 30,
            backDelay: 2000,
          startDelay: 1000,
          loop: true,
          showCursor: true,
          cursorChar: '|'
        });
      } catch (e) {
        console.warn('Typed.js failed to initialize:', e);
        // Fallback to first string
        const fallback = typedTarget.getAttribute('data-fallback') || 'Software Engineer';
        typedTarget.textContent = fallback;
      }
    } else if (typedTarget) {
      // Reduced motion or library missing: show first fallback phrase
      const fallback = typedTarget.getAttribute('data-fallback') || 'Software Engineer';
      typedTarget.textContent = fallback;
    }

    // Particles.js initialization (optional)
    if (window.particlesJS) {
      try {
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: '#E07A5F' },
            shape: { type: 'circle' },
            opacity: { value: 0.15, random: true },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#E07A5F',
              opacity: 0.1,
              width: 1
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out',
              bounce: false
            }
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
        console.warn('particles.js failed to initialize:', e);
      }
    }
  });
})();