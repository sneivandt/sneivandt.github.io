/**
 * main.js
 * Progressive, dependency-free enhancements for the site:
 *  - Typed text effect (Custom lightweight implementation)
 *  - Optional particles background (particles.js) guarded + resilient
 *
 * All features are defensive: if an enhancement fails or supporting JS is
 * disabled, core content remains usable. No build tooling; pure vanilla JS.
 */
(function () {
    'use strict';

    /**
     * Minimal Typewriter effect to replace typed.js dependency
     * ~1KB minified equivalent, zero external deps.
     */
    class Typewriter {
        constructor(element, strings, options = {}) {
            this.element = element;
            this.strings = strings;
            this.loop = options.loop || false;
            this.typeSpeed = options.typeSpeed || 50;
            this.backSpeed = options.backSpeed || 30;
            this.startDelay = options.startDelay || 0;
            this.backDelay = options.backDelay || 2000;

            this.state = {
                textIndex: 0,
                charIndex: 0,
                isDeleting: false,
                isPaused: false
            };

            this.cursor = null;
            this.timeout = null;

            this.init();
        }

        init() {
            // Create cursor element to match existing CSS
            this.cursor = document.createElement('span');
            this.cursor.className = 'typed-cursor';
            this.cursor.innerHTML = '|';
            this.cursor.ariaHidden = 'true';

            if (this.element.nextSibling) {
                this.element.parentNode.insertBefore(this.cursor, this.element.nextSibling);
            } else {
                this.element.parentNode.appendChild(this.cursor);
            }

            // Start typing loop
            this.timeout = setTimeout(() => this.tick(), this.startDelay);
        }

        tick() {
            if (this.state.isPaused) return;

            const currentString = this.strings[this.state.textIndex];

            // Determine operation
            if (this.state.isDeleting) {
                this.state.charIndex--;
            } else {
                this.state.charIndex++;
            }

            // Update visible text
            this.element.textContent = currentString.substring(0, this.state.charIndex);

            // Determine next delay
            let delta = this.typeSpeed;
            if (this.state.isDeleting) {
                delta = this.backSpeed;
            }

            // End of string reached?
            if (!this.state.isDeleting && this.state.charIndex === currentString.length) {
                delta = this.backDelay;
                this.state.isDeleting = true;
            }
            // Fully deleted?
            else if (this.state.isDeleting && this.state.charIndex === 0) {
                this.state.isDeleting = false;
                this.state.textIndex++;
                delta = 500; // Small pause before typing next

                // Loop or Stop?
                if (this.state.textIndex >= this.strings.length) {
                    if (this.loop) {
                        this.state.textIndex = 0;
                    } else {
                        // Stop here (maybe hide cursor?)
                        this.state.isPaused = true;
                        return;
                    }
                }
            }

            this.timeout = setTimeout(() => this.tick(), delta);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        /* ------------------------------------------------------------
         * Environment + Element References
         * ------------------------------------------------------------ */
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const typedTarget = document.querySelector('#typed');
        const stringsSrc = document.querySelector('#typed-strings');

        /* ------------------------------------------------------------
         * Typed Text Effect (Custom)
         * ------------------------------------------------------------ */
        if (!prefersReducedMotion && typedTarget && stringsSrc) {
            try {
                // Extract strings from the hidden container
                const strings = Array.from(stringsSrc.children)
                    .map(el => el.textContent.trim())
                    .filter(str => str.length > 0);

                if (strings.length > 0) {
                    new Typewriter(typedTarget, strings, {
                        loop: true,
                        typeSpeed: 60,
                        backSpeed: 30,
                        backDelay: 2000,
                        startDelay: 500
                    });
                }
            } catch (e) {
                console.warn('Typewriter failed to initialize:', e);
                // Fallback is handled by HTML data-fallback if JS fails,
                // but if we are here, we might want to ensure text exists.
                if (!typedTarget.textContent) {
                    typedTarget.textContent = typedTarget.getAttribute('data-fallback') || 'Software Engineer';
                }
            }
        } else if (typedTarget) {
            // Fallback static text if motion is reduced.
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
