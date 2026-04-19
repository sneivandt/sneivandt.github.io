/**
 * @file effects.js
 * @description Progressive-enhancement micro-interactions:
 *   - Cursor spotlight (CSS variables on body)
 *   - Magnetic pull on social icons
 *   - 3D parallax tilt on the profile image
 *   - Letter-by-letter reveal on the H1 name
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
/* Profile image 3D tilt                                           */
/* --------------------------------------------------------------- */
function initProfileTilt() {
  if (!finePointer.matches || reduced()) return;

  const wrap = document.querySelector('.profile-image');
  if (!wrap) return;

  const MAX = 8; // degrees
  let raf = null;

  const onMove = (e) => {
    const rect = wrap.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const cdx = Math.max(-1, Math.min(1, dx));
    const cdy = Math.max(-1, Math.min(1, dy));
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      wrap.style.setProperty('--tilt-x', (cdy * -MAX).toFixed(2) + 'deg');
      wrap.style.setProperty('--tilt-y', (cdx * MAX).toFixed(2) + 'deg');
      wrap.style.setProperty('--tilt-gx', ((cdx + 1) * 50).toFixed(1) + '%');
      wrap.style.setProperty('--tilt-gy', ((cdy + 1) * 50).toFixed(1) + '%');
    });
  };

  const reset = () => {
    if (raf) cancelAnimationFrame(raf);
    wrap.style.removeProperty('--tilt-x');
    wrap.style.removeProperty('--tilt-y');
    wrap.style.removeProperty('--tilt-gx');
    wrap.style.removeProperty('--tilt-gy');
  };

  wrap.classList.add('has-tilt');
  wrap.addEventListener('pointermove', onMove);
  wrap.addEventListener('pointerleave', reset);
}

/* --------------------------------------------------------------- */
/* Letter reveal on the H1                                         */
/* --------------------------------------------------------------- */
function initNameReveal() {
  const h1 = document.querySelector('.profile-content h1');
  if (!h1 || h1.dataset.split === 'true') return;

  const text = h1.textContent.trim();
  h1.setAttribute('aria-label', text);
  h1.dataset.split = 'true';
  h1.textContent = '';

  const frag = document.createDocumentFragment();
  let visibleIdx = 0;
  for (const ch of text) {
    if (ch === ' ') {
      // Preserve real space for line wrapping
      frag.appendChild(document.createTextNode(' '));
      continue;
    }
    const span = document.createElement('span');
    span.className = 'char';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch;
    if (!reduced()) {
      span.style.setProperty('--char-delay', (visibleIdx * 35) + 'ms');
    }
    frag.appendChild(span);
    visibleIdx++;
  }
  h1.appendChild(frag);
}

/* --------------------------------------------------------------- */
/* Bootstrap                                                       */
/* --------------------------------------------------------------- */
function boot() {
  initNameReveal();
  initProfileTilt();
}

// The profile-card component renders synchronously in connectedCallback,
// so by the time main.js evaluates this module the DOM is already in place.
// Still, fall back to DOMContentLoaded just in case scripts load earlier.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
