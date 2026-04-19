/**
 * @module GeometricLinesBackgroundComponent
 * @description A minimalist animated background:
 *   - A faint dot grid that subtly parallaxes with the pointer
 *   - Slow drifting line segments that draw across the canvas, then fade
 *
 * Monochrome, low-contrast, editorial. Respects prefers-reduced-motion
 * (renders one static frame) and pauses when the document is hidden.
 *
 * Usage: <aurora-background></aurora-background>
 * (Element name preserved for backwards compatibility with index.html.)
 */

export class GeometricLinesBackgroundComponent extends HTMLElement {
  constructor() {
    super();
    this.canvas = null;
    this.ctx = null;
    this.rafId = null;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.lastT = 0;

    this.pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    this.lines = [];
    this.maxLines = 7;
    this.reduced = false;

    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    this._onMotionChange = this._onMotionChange.bind(this);
    this._frame = this._frame.bind(this);
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            display: block;
            contain: strict;
          }
          canvas {
            width: 100%;
            height: 100%;
            display: block;
            opacity: 0;
            transition: opacity 1.2s ease-out;
          }
          canvas.ready { opacity: 1; }
        </style>
        <canvas aria-hidden="true"></canvas>
      `;
      this.canvas = this.shadowRoot.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d', { alpha: true });
    }

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this._onMotionChange);

    this._resize();
    this._seedLines();

    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this._onVisibility);

    this._draw(performance.now());
    requestAnimationFrame(() => this.canvas.classList.add('ready'));
    if (!this.reduced) {
      this.lastT = performance.now();
      this.rafId = requestAnimationFrame(this._frame);
    }
  }

  disconnectedCallback() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('visibilitychange', this._onVisibility);
    if (this.motionQuery) {
      this.motionQuery.removeEventListener('change', this._onMotionChange);
    }
  }

  _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _onResize() {
    this._resize();
    this._draw(performance.now());
  }

  _onPointerMove(e) {
    this.pointer.tx = e.clientX / window.innerWidth;
    this.pointer.ty = e.clientY / window.innerHeight;
  }

  _onVisibility() {
    if (document.hidden) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    } else if (!this.reduced && !this.rafId) {
      this.lastT = performance.now();
      this.rafId = requestAnimationFrame(this._frame);
    }
  }

  _onMotionChange(e) {
    this.reduced = e.matches;
    if (this.reduced) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this._draw(performance.now());
    } else if (!this.rafId) {
      this.lastT = performance.now();
      this.rafId = requestAnimationFrame(this._frame);
    }
  }

  /* ------------------------------------------------------------ */
  /* Lines                                                        */
  /* ------------------------------------------------------------ */

  _seedLines() {
    this.lines = [];
    for (let i = 0; i < this.maxLines; i++) {
      this.lines.push(this._makeLine(true));
    }
  }

  /**
   * Lines draw at editorial angles (axis-aligned or 30/45/60 degrees). Each
   * line has a head that advances and a tail that trails behind. Once the
   * tail reaches the end of the line it is recycled at a new position.
   *
   * @param {boolean} prefill When true, randomize progress so the initial
   *   composition isn't synchronized.
   */
  _makeLine(prefill = false) {
    const angles = [0, 0, 0, Math.PI / 2, Math.PI / 2, Math.PI / 6, -Math.PI / 6, Math.PI / 4];
    const angle = angles[Math.floor(Math.random() * angles.length)];

    const longestSide = Math.hypot(this.width, this.height);
    const length = longestSide * (0.35 + Math.random() * 0.45);

    const ax = 0.05 + Math.random() * 0.9;
    const ay = 0.05 + Math.random() * 0.9;

    const speed = 0.00012 + Math.random() * 0.00016;

    return {
      ax, ay,
      angle,
      length,
      head: prefill ? Math.random() : 0,
      tail: prefill ? Math.random() * 0.4 : -0.25,
      speed,
      maxOpacity: 0.10 + Math.random() * 0.08,
      depth: 0.4 + Math.random() * 0.6
    };
  }

  /* ------------------------------------------------------------ */
  /* Render loop                                                  */
  /* ------------------------------------------------------------ */

  _frame(t) {
    const dt = Math.min(64, t - this.lastT);
    this.lastT = t;

    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.05;

    for (let i = 0; i < this.lines.length; i++) {
      const ln = this.lines[i];
      ln.head += ln.speed * dt;
      ln.tail += ln.speed * dt;
      if (ln.tail >= 1) {
        this.lines[i] = this._makeLine(false);
      }
    }

    this._draw(t);
    this.rafId = requestAnimationFrame(this._frame);
  }

  _draw(t) {
    const { ctx, width: w, height: h } = this;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    const px = (this.pointer.x - 0.5);
    const py = (this.pointer.y - 0.5);

    this._drawDotGrid(px, py);
    this._drawLines(px, py, t);
    this._drawVignette();
  }

  _drawDotGrid(px, py) {
    const { ctx, width: w, height: h } = this;
    const spacing = Math.max(36, Math.min(w, h) / 18);
    const dotRadius = 0.9;

    const shiftX = -px * 14;
    const shiftY = -py * 14;
    const offsetX = ((shiftX % spacing) + spacing) % spacing;
    const offsetY = ((shiftY % spacing) + spacing) % spacing;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
    for (let y = offsetY - spacing; y < h + spacing; y += spacing) {
      for (let x = offsetX - spacing; x < w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _drawLines(px, py, _t) {
    const { ctx, width: w, height: h } = this;
    ctx.lineCap = 'round';

    for (const ln of this.lines) {
      const parallax = (ln.depth - 0.5) * 24;
      const ax = ln.ax * w + (-px * parallax);
      const ay = ln.ay * h + (-py * parallax);

      const dx = Math.cos(ln.angle);
      const dy = Math.sin(ln.angle);

      const hT = Math.max(0, Math.min(1, ln.head));
      const tT = Math.max(0, Math.min(1, ln.tail));
      if (hT <= tT) continue;

      const hx = ax + dx * ln.length * hT;
      const hy = ay + dy * ln.length * hT;
      const tx = ax + dx * ln.length * tT;
      const ty = ay + dy * ln.length * tT;

      const grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, 'rgba(230, 230, 240, 0)');
      grad.addColorStop(0.5, `rgba(230, 230, 240, ${(ln.maxOpacity * 0.6).toFixed(3)})`);
      grad.addColorStop(1, `rgba(245, 245, 255, ${ln.maxOpacity.toFixed(3)})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      ctx.fillStyle = `rgba(245, 245, 255, ${(ln.maxOpacity * 0.9).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(hx, hy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawVignette() {
    const { ctx, width: w, height: h } = this;
    const grad = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.3,
      w / 2, h / 2, Math.hypot(w, h) * 0.55
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

// Element name preserved so index.html / sw.js precache stay stable.
customElements.define('aurora-background', GeometricLinesBackgroundComponent);
