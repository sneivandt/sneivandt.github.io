# GitHub Copilot Guidance for `sneivandt.github.io`

This repository is intentionally **minimal, dependency-free, build-free static content**. All contributions should preserve that philosophy.

## Core Principles

1. **Pure static hosting** — GitHub Pages serves raw files directly
2. **No build tools** — no bundlers, transpilers, task runners, or preprocessors (no Webpack, Vite, Gulp, Babel, SCSS, Tailwind, etc.)
3. **No package managers** — no `package.json`, `node_modules`, Python deps, etc.
4. **Vanilla HTML/CSS/JS only** — small, CDN-loaded third-party scripts are acceptable if they are optional enhancements
5. **Performance + accessibility first** — fast first paint, semantic markup, keyboard + reduced-motion friendly

> If a change would require a build step, reconsider the approach or propose it explicitly before implementing.

## File Organization

```
.
├── index.html          # Main entry point (single-page site)
├── assets/             # All static assets
│   ├── css/style.css       # Global stylesheet (design tokens + components)
│   ├── js/                 # JavaScript modules
│   │   ├── main.js         # Entry point, component registration, service worker
│   │   ├── components/     # Web Components (Custom Elements)
│   │   │   ├── typewriter-effect.js   # Animated typing with Shadow DOM
│   │   │   ├── share-button.js        # Share functionality with Shadow DOM
│   │   │   ├── connection-status.js   # Network monitor with Shadow DOM
│   │   │   ├── last-updated.js        # GitHub API with Shadow DOM
│   │   │   ├── console-brand.js       # Console branding
│   │   │   ├── profile-card.js        # Profile container (no Shadow DOM)
│   │   │   └── social-links.js        # Social links (no Shadow DOM)
│   │   ├── typewriter.js   # Legacy (kept for reference)
│   │   ├── share-button.js # Legacy (kept for reference)
│   │   ├── connection-status.js # Legacy (kept for reference)
│   │   ├── last-updated.js # Legacy (kept for reference)
│   │   └── console-brand.js # Legacy (kept for reference)
│   ├── font/               # Self-hosted Inter font files (.woff2)
│   └── img/                # Images (profile, favicons)
├── scripts/
│   └── serve.py            # Local development server script
├── CNAME               # Custom domain configuration
├── humans.txt          # Authors and site info
├── LICENSE             # License file
├── manifest.json       # PWA manifest
├── robots.txt          # Search engine directives
├── sitemap.xml         # XML sitemap for SEO
├── sw.js               # Service worker for offline caching
└── _config.yml         # Jekyll config (disables Jekyll processing)
```

---

## HTML Guidelines

### Page Layout Conventions
- Keep each page self-explanatory with minimal DOM depth
- Prefer semantic elements: `<main>`, `<header>`, `<nav>`, `<section>`, `<footer>`
- Only one `<h1>` per page; descending heading order thereafter
- Inline critical meta tags and structured data directly in the HTML (no external JSON fetch)

### Required Meta Tags
Every HTML page should include:
- `<meta charset="UTF-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<meta name="description" content="...">`
- `<link rel="canonical" href="...">`
- Open Graph tags for social sharing
- JSON-LD structured data when appropriate

---

## CSS Guidelines

### Architecture
- **Single global stylesheet**: `assets/css/style.css` for site-wide rules
- **Design tokens**: Use CSS custom properties (defined in `:root`) for colors, typography, spacing
- **No preprocessors**: Native CSS only (no SCSS, Less, PostCSS, Tailwind)

### Best Practices
- Keep selectors shallow; avoid specificity wars
- Prefer utility-like light classes if repetition appears
- Use `prefers-reduced-motion` for animations and keep them subtle
- Use `clamp()` for fluid typography instead of breakpoint-heavy approaches

## JavaScript Guidelines

### Architecture
- **Vanilla JS only** — no frameworks (React, Vue, Svelte, Alpine, jQuery)
- **Web Components** — use native Custom Elements API for reusable components
- **ES modules** — use `import`/`export` for modularity
- **Deferred loading** — scripts must not block first paint (`type="module"` or `defer`)
- **Graceful degradation** — if a script errors or JS is disabled, the page still communicates core content

### Web Components Pattern
The site uses native Web Components (Custom Elements) for all interactive features:

```javascript
// assets/js/components/example.js
export class ExampleComponent extends HTMLElement {
  constructor() {
    super();
    // Initialize state
  }
  
  connectedCallback() {
    // Guard against re-attachment
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.render();
    // Set up event listeners
  }
  
  disconnectedCallback() {
    // Clean up event listeners and timeouts
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>/* Component styles */</style>
      <!-- Component markup -->
    `;
  }
}

customElements.define('example-component', ExampleComponent);
```

### Web Component Best Practices
- **Shadow DOM guards**: Always check `if (!this.shadowRoot)` before attaching to prevent errors on reconnect/adoption
- **Lifecycle management**: Implement `disconnectedCallback()` to clean up event listeners and timeouts
- **Accessibility**: Use `aria-hidden="true"` for rapidly-updating animated content, not `aria-live`
- **Shadow DOM usage**: Use Shadow DOM for components needing style encapsulation; skip for components requiring global CSS integration
- **Attributes**: Pass plain text via attributes, handle HTML rendering inside components
- **Progressive enhancement**: Provide noscript fallbacks for core content

### Best Practices
- Keep logic modular and small (~200 lines max per file)
- No ES module imports that suggest a future build pipeline
- Use `matchMedia('(prefers-reduced-motion: reduce)')` for motion-sensitive features
- Fail silently when features are unavailable (e.g., Clipboard API)
- Always validate with `node --check` before committing

## Web Components 🧩

### Current Components

The site uses 7 native Web Components (Custom Elements):

| Component | File | Shadow DOM | Purpose |
|-----------|------|------------|---------|
| `<typewriter-effect>` | `components/typewriter-effect.js` | ✅ | Animated typing with motion preference support |
| `<share-button>` | `components/share-button.js` | ✅ | Share with Web Share API / Clipboard fallback |
| `<connection-status>` | `components/connection-status.js` | ✅ | Network connectivity indicator |
| `<last-updated>` | `components/last-updated.js` | ✅ | GitHub API last commit date with caching |
| `<console-brand>` | `components/console-brand.js` | ❌ | Browser console signature |
| `<profile-card>` | `components/profile-card.js` | ❌ | Profile container (composes other components) |
| `<social-links>` | `components/social-links.js` | ❌ | Social media navigation |

### When to Use Shadow DOM

✅ **Use Shadow DOM when:**
- Component has self-contained styles that shouldn't leak
- Component needs style isolation from page CSS
- Component is truly independent (share-button, typewriter, etc.)

❌ **Skip Shadow DOM when:**
- Component needs to integrate with global CSS classes
- Component is a composition/layout container
- Component's children need page-level styles

### Component Checklist

When creating or modifying Web Components:

- [ ] Guard shadow DOM attachment: `if (!this.shadowRoot) this.attachShadow(...)`
- [ ] Implement `disconnectedCallback()` for cleanup
- [ ] Remove event listeners in `disconnectedCallback()`
- [ ] Clear timeouts/intervals in `disconnectedCallback()`
- [ ] Use `aria-hidden="true"` for rapidly-updating animations
- [ ] Toggle `aria-hidden` on status messages (with `aria-live="polite"`)
- [ ] Accept plain text via attributes, render HTML in component
- [ ] Support `prefers-reduced-motion` for animations
- [ ] Validate with `node --check`

### Example: Minimal Web Component

```javascript
export class MinimalComponent extends HTMLElement {
  constructor() {
    super();
    this.resizeHandler = null; // Store for cleanup
  }
  
  connectedCallback() {
    // Guard against re-attachment
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>:host { display: block; }</style>
        <slot></slot>
      `;
    }
    
    // Set up listeners
    this.resizeHandler = () => console.log('resize');
    window.addEventListener('resize', this.resizeHandler);
  }
  
  disconnectedCallback() {
    // Clean up
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}

customElements.define('minimal-component', MinimalComponent);
```

## Images & Fonts

### Images
- Optimize images manually before committing (no automated pipeline)
- Prefer WebP format with PNG/JPG fallback when critical
- Use descriptive `alt` text for meaningful images
- Use empty `alt=""` for decorative images
- Include `width` and `height` attributes for layout stability

### Fonts
- Self-host fonts in `assets/font/` directory (currently Inter)
- Use `.woff2` format only (best compression, broad support)
- Preload critical font weights in HTML `<head>`
- Limit to 2-3 weights to minimize transfer size

## Accessibility Requirements

### Checklist
- [ ] Logical heading order (`h1` → `h2` → `h3`, no skipping)
- [ ] Labels / ARIA only where native semantics insufficient
- [ ] Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Focus styles visible (never `outline: none` without replacement)
- [ ] `prefers-reduced-motion` respected for animations

### Icon-Only Links
Use `aria-label` for accessible names. **Do NOT pair with a redundant `title` attribute** — this causes double-speak issues in some screen readers.

```html
<!-- ✓ Correct -->
<a href="..." aria-label="GitHub profile (opens in a new tab)">
  <svg aria-hidden="true">...</svg>
</a>

<!-- ✗ Avoid -->
<a href="..." aria-label="GitHub" title="GitHub">
  <svg>...</svg>
</a>
```

## Things to Avoid

| Category | Avoid | Rationale |
|----------|-------|-----------|
| Tooling | `package.json`, bundlers, npm scripts | Adds complexity & build step |
| CSS | SCSS, Tailwind, large resets | Overhead vs. small scale benefit |
| JS | Frameworks, transpiled syntax, polyfills | Not needed for scope |
| Fonts | Many weights/formats, variable fonts | Increases transfer size |
| Analytics | Heavy trackers, Google Analytics | Privacy + performance cost |
| Images | Unoptimized PNGs, GIFs for photos | Performance cost |

## Testing & Validation

### Automated (CI)
- **HTML5 Validator** — validates HTML and CSS syntax
- **JavaScript Syntax Check** — `node --check` on all JS files
- **Link Checker** — detects broken internal/external links
- **Lighthouse CI** — enforces 90+ scores for performance, accessibility, best practices, SEO

### Manual Before Committing
- Test with JavaScript disabled (content should still be readable)
- Test with `prefers-reduced-motion: reduce` (animations should stop)
- Test keyboard navigation (Tab, Enter, Escape)
- Verify on mobile viewport

## Pull Request Guidelines

1. **Always include screenshots** of the site after changes (helps reviewers understand visual impact)
2. Keep changes focused and minimal
3. Ensure CI passes before requesting review

## Date Maintenance

When making changes to the repository, update relevant dates if needed:

1. **Copyright year** — Update `index.html` footer and `LICENSE` file if the year has changed
2. **Sitemap lastmod** — Update `sitemap.xml` `<lastmod>` date to current date (YYYY-MM-DD format) when content changes
3. **Last updated timestamp** — Automatically fetched from GitHub API via `last-updated.js`; no manual update needed

## FAQ

**Why not add a build step for critical CSS or image pipelines?**
Deliberate constraint: simplicity > micro-optimization. Manual curation is enough at this scale.

**Can we add a service worker?**
Already exists (`sw.js`). Only modify if it meaningfully improves UX without complexity creep.

**Can we add TypeScript?**
Not unless a compelling complexity threshold is reached; current JS is minimal.

**Do we need a custom 404 page?**
No. GitHub Pages provides a default one, and this site is simple enough that a custom one is unnecessary maintenance.

**Do we need a copyright notice?**
No. The content is personal and minimal; adding legal boilerplate would detract from the simplicity.

---

Keep it simple, fast, and human-readable. If in doubt, choose the option that requires the fewest moving parts.
