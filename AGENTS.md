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

- `index.html` is the single-page entry point.
- `assets/css/style.css` holds global CSS and design tokens.
- `assets/js/main.js` imports and registers vanilla Web Components from `assets/js/components/`.
- `assets/font/` and `assets/img/` hold self-hosted fonts and images.
- `manifest.json`, `robots.txt`, `sitemap.xml`, `sw.js`, `CNAME`, and `_config.yml` support GitHub Pages, SEO, and PWA behavior.
- `scripts/serve.py` is the local static development server.

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

### Web Components
- Put reusable UI in `assets/js/components/` and import it from `assets/js/main.js`.
- Guard Shadow DOM attachment with `if (!this.shadowRoot)` when using `attachShadow()`.
- Clean up listeners, timers, and observers in `disconnectedCallback()`.
- Use Shadow DOM for standalone encapsulated components; skip it for layout/composition components that rely on global CSS.
- Pass plain text through attributes and render any needed markup inside the component.
- Respect `prefers-reduced-motion`; use `aria-hidden="true"` for decorative rapidly updating animation.

### Best Practices
- Keep logic modular and small (~200 lines max per file)
- No ES module imports that suggest a future build pipeline
- Use `matchMedia('(prefers-reduced-motion: reduce)')` for motion-sensitive features
- Degrade gracefully when optional browser APIs are unavailable, using existing fallback patterns.
- Run `node --check` on touched JavaScript files.

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
- Test with `prefers-reduced-motion: reduce` (animations should stop)
- Test keyboard navigation (Tab, Enter, Escape)
- Verify on mobile viewport

## Pull Request Guidelines

1. **Always include screenshots** of the site after changes (helps reviewers understand visual impact)
2. Keep changes focused and minimal
3. Ensure CI passes before requesting review

## Date Maintenance

When making changes to the repository, update relevant dates if needed:

1. **Sitemap lastmod** — Update `sitemap.xml` `<lastmod>` when content changes materially.
2. **Copyright year** — Keep `LICENSE` current when the copyright year changes; the footer year is generated by `copyright-notice`.

---

Keep it simple, fast, and human-readable. If in doubt, choose the option that requires the fewest moving parts.
