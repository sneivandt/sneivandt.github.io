/**
 * @file effects.js
 * @description Progressive-enhancement micro-interactions:
 *   - Cursor spotlight (CSS variables on body)
 *   - Magnetic pull on social icons
 *   - Letter-by-letter reveal on the H1 name
 *   - Scroll reveal for below-the-fold sections
 *
 * All effects no-op under prefers-reduced-motion or when the relevant DOM is
 * absent. Pointer-only effects are skipped on coarse pointers (touch).
 */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const reduced = () => motionQuery.matches;

/* --------------------------------------------------------------- */
/* Cursor spotlight                                                */
/* --------------------------------------------------------------- */
function initSpotlight() {
  if (!finePointer.matches) return;
  let tx = 50, ty = 30, x = tx, y = ty;
  let pending = false;

  const onMove = (e) => {
    tx = (e.clientX / window.innerWidth) * 100;
    ty = (e.clientY / window.innerHeight) * 100;
    if (!pending) {
      pending = true;
      requestAnimationFrame(tick);
    }
  };

  const tick = () => {
    pending = false;
    // Ease toward target for a smooth feel
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    document.body.style.setProperty('--mx', x.toFixed(2) + '%');
    document.body.style.setProperty('--my', y.toFixed(2) + '%');
    if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
      pending = true;
      requestAnimationFrame(tick);
    }
  };

  document.body.classList.add('has-spotlight');
  window.addEventListener('pointermove', onMove, { passive: true });
}

/* --------------------------------------------------------------- */
/* Magnetic social icons                                           */
/* --------------------------------------------------------------- */
function initMagneticIcons() {
  if (!finePointer.matches || reduced()) return;

  const icons = document.querySelectorAll('.social-icon');
  if (!icons.length) return;

  const STRENGTH = 0.35;   // 0..1 — how hard the icon pulls toward the cursor
  const RADIUS = 80;       // px — activation distance from icon center

  icons.forEach((icon) => {
    let raf = null;
    const reset = () => {
      icon.style.transform = '';
    };

    const onMove = (e) => {
      const rect = icon.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > RADIUS) {
        if (icon.style.transform) reset();
        return;
      }
      const falloff = 1 - dist / RADIUS;
      const tx = dx * STRENGTH * falloff;
      const ty = dy * STRENGTH * falloff;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        icon.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    icon.addEventListener('pointerleave', reset);
  });
}

/* --------------------------------------------------------------- */
/* Letter reveal on the H1                                         */
/* --------------------------------------------------------------- */
function initNameReveal() {
  const h1 = document.querySelector('.hero-copy h1');
  if (!h1 || h1.dataset.split === 'true') return;

  const text = h1.textContent.trim();
  h1.setAttribute('aria-label', text);
  h1.dataset.split = 'true';
  h1.textContent = '';

  const frag = document.createDocumentFragment();
  const words = text.split(/\s+/);
  let visibleIdx = 0;

  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.setAttribute('aria-hidden', 'true');

    for (const ch of word) {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = ch;
      if (!reduced()) {
        charSpan.style.setProperty('--char-delay', (visibleIdx * 35) + 'ms');
      }
      wordSpan.appendChild(charSpan);
      visibleIdx++;
    }

    frag.appendChild(wordSpan);
    if (wordIndex < words.length - 1) {
      frag.appendChild(document.createTextNode(' '));
    }
  });
  h1.appendChild(frag);
}

/* --------------------------------------------------------------- */
/* Scroll reveal                                                   */
/* --------------------------------------------------------------- */
function initScrollReveal() {
  if (reduced() || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach((el) => {
    // Siblings inside the same group stagger; groups restart the count.
    const siblings = el.parentElement
      ? Array.from(el.parentElement.querySelectorAll(':scope > [data-reveal]'))
      : [el];
    const index = Math.max(0, siblings.indexOf(el));
    el.style.setProperty('--reveal-delay', (index * 80) + 'ms');
    // Added by JS so the content stays visible when JS or IO is unavailable.
    el.classList.add('will-reveal');
    io.observe(el);
  });
}

/* --------------------------------------------------------------- */
/* Bootstrap                                                       */
/* --------------------------------------------------------------- */
function boot() {
  initNameReveal();
  initScrollReveal();
}

// Fall back to DOMContentLoaded if the module evaluates before the page is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
