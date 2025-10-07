/**
 * main.js
 * Progressive, dependency-free enhancements for the site:
 *  - Persisted light/dark theme toggle with accessible button state
 *  - Typed text effect (Typed.js) with reduced-motion + graceful fallback
 *  - Optional particles background (particles.js) guarded + resilient
 *  - Accessible quick navigation menu with focus management + escape handling
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
        const root = document.documentElement;
        const toggleBtn = document.getElementById('theme-toggle');

        /* ------------------------------------------------------------
         * Theme Utilities
         * ------------------------------------------------------------ */
        /**
         * Safely get a stored theme name from localStorage.
         * Returns null if storage is unavailable (privacy mode / quota / denial).
         */
        function getStoredTheme() {
            try { return localStorage.getItem('theme'); } catch (_e) { return null; }
        }

        /**
         * Persist the chosen theme; intentionally silent on failure.
         * @param {string} theme
         */
        function storeTheme(theme) {
            try { localStorage.setItem('theme', theme); } catch (_e) { /* noop */ }
        }

        /**
         * Apply theme to <html> and update toggle button accessible state/icon.
         * @param {string} theme - 'light' | 'dark'
         */
        function applyTheme(theme) {
            root.setAttribute('data-theme', theme);
            if (!toggleBtn) return;

            const isDark = theme === 'dark';
            toggleBtn.setAttribute('aria-pressed', String(isDark));
            toggleBtn.innerHTML = isDark
                ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
                : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
            toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            toggleBtn.title = isDark ? 'Light theme' : 'Dark theme';
        }

        /**
         * Initialize theme preference: stored value > current attribute > system.
         */
        function initTheme() {
            const stored = getStoredTheme();
            if (stored) {
                applyTheme(stored);
            } else {
                const fallback = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                applyTheme(fallback);
            }
        }

        // Theme toggle listener (if button present)
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(current);
                storeTheme(current);
            });
        }

        initTheme();

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
         * ------------------------------------------------------------ */
        if (window.particlesJS) {
            try {
                window.particlesJS('particles-js', {
                    particles: {
                        number: { value: 50, density: { enable: true, value_area: 800 } },
                        color: { value: '#E07A5F' },
                        shape: { type: 'circle' },
                        opacity: { value: 0.15, random: true },
                        size: { value: 3, random: true },
                        line_linked: { enable: true, distance: 150, color: '#E07A5F', opacity: 0.1, width: 1 },
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

        /* ------------------------------------------------------------
         * Quick Navigation Menu (Accessible Toggle + Focus Trap)
         * ------------------------------------------------------------ */
        (function initQuickNav() {
            const toggle = document.getElementById('quick-nav-toggle');
            const menu = document.getElementById('quick-nav-menu');
            if (!toggle || !menu) return; // Abort if structure not present.

            let open = false;

            /** Open the quick nav menu (idempotent) and set ARIA state. */
            function openMenu() {
                if (open) return;
                open = true;
                menu.hidden = false;
                toggle.setAttribute('aria-expanded', 'true');
                document.querySelector('.quick-nav')?.setAttribute('data-state', 'open');

                // Focus first link for keyboard efficiency.
                const firstLink = menu.querySelector('a');
                if (firstLink) firstLink.focus({ preventScroll: true });

                document.addEventListener('click', onDocClick, true);
                document.addEventListener('keydown', onKeyDown, true);
            }

            /** Close menu; optionally restore focus to the toggle button. */
            function closeMenu(focusToggle = false) {
                if (!open) return;
                open = false;
                menu.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
                document.querySelector('.quick-nav')?.setAttribute('data-state', 'closed');
                document.removeEventListener('click', onDocClick, true);
                document.removeEventListener('keydown', onKeyDown, true);
                if (focusToggle) toggle.focus({ preventScroll: true });
            }

            /** Toggle open/closed state. */
            function toggleMenu() { open ? closeMenu(true) : openMenu(); }

            /** Close when clicking outside the menu (capture phase for reliability). */
            function onDocClick(e) {
                if (!menu.contains(e.target) && e.target !== toggle) {
                    closeMenu();
                }
            }

            /**
             * Keyboard interactions: Escape to close, Tab wrap to create a simple focus trap
             * limited to the menu links while open (without complex aria-controls logic).
             */
            function onKeyDown(e) {
                if (e.key === 'Escape') {
                    closeMenu(true);
                } else if (e.key === 'Tab' && open) {
                    const focusable = Array.from(menu.querySelectorAll('a[href]'));
                    if (!focusable.length) return;
                    const idx = focusable.indexOf(document.activeElement);

                    // Wrap backwards
                    if (e.shiftKey && (document.activeElement === toggle || idx === 0)) {
                        e.preventDefault();
                        focusable[focusable.length - 1].focus();
                    }
                    // Wrap forwards
                    else if (!e.shiftKey && idx === focusable.length - 1) {
                        e.preventDefault();
                        focusable[0].focus();
                    }
                }
            }

            // Primary interactions
            toggle.addEventListener('click', toggleMenu);
            toggle.addEventListener('keydown', function (e) {
                if ((e.key === 'Enter' || e.key === ' ') && !open) {
                    e.preventDefault();
                    openMenu();
                }
            });

            // Close when user activates a navigation link
            menu.addEventListener('click', function (e) {
                const link = e.target.closest('a[data-nav-link]');
                if (link) closeMenu();
            });
        })();
    });
})();
