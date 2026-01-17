/**
 * main.js
 * Progressive, dependency-free enhancements for the site:
 *  - Typed text effect (Typed.js) with reduced-motion + graceful fallback
 *  - Optional particles background (particles.js) guarded + resilient
 *
 * All features are defensive: if an enhancement fails or supporting JS is
 * disabled, core content remains usable. No build tooling; pure vanilla JS.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        /* ------------------------------------------------------------
         * Environment + Element References
         * ------------------------------------------------------------ */
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const typedTarget = document.querySelector('#typed');

        /* ------------------------------------------------------------
         * Typed Text Effect (graceful w/ reduced motion + fallback)
         * ------------------------------------------------------------ */
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
                const fallback = typedTarget.getAttribute('data-fallback') || 'Software Engineer';
                typedTarget.textContent = fallback;
            }
        } else if (typedTarget) {
            // Fallback static text if motion is reduced or library absent.
            const fallback = typedTarget.getAttribute('data-fallback') || 'Software Engineer';
            typedTarget.textContent = fallback;
        }

        /* ------------------------------------------------------------
         * Particles Background (optional enhancement)
         * - guarded by reduced motion preference
         * ------------------------------------------------------------ */
        if (!prefersReducedMotion && window.particlesJS) {
            try {
                window.particlesJS('particles-js', {
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
                console.warn('particles.js failed to initialize:', e);
            }
        }
    });
})();
