# GitHub Copilot Guidance for `sneivandt.github.io`

This repository is intentionally **minimal, dependency-free, build-free static content**. All contributions should preserve that philosophy.

## Core Principles
1. Pure static hosting (GitHub Pages serves raw files).
2. **No build tools**: Do not introduce bundlers, transpilers, task runners, or preprocessors (no Webpack, Vite, Gulp, Babel, SCSS, Tailwind, etc.).
3. **No package managers**: Avoid `package.json`, `node_modules`, Python deps, etc.
4. **Vanilla HTML/CSS/JS only**. Small, CDN-loaded third-party scripts are acceptable if they are optional enhancements.
6. **Performance + accessibility first**: Fast first paint, semantic markup, keyboard + reduced-motion friendly.

If a change would require a build step, reconsider the approach or propose it explicitly before implementing.

## Current High-Level Structure

```
.
├── index.html              # Landing page (SEO, structured data)
├── assets/
│   ├── css/
│   │   └── style.css       # Global styles
│   ├── js/
│   │   └── main.js         # Light enhancement layer
│   ├── img/                # Images
│   └── font/               # Self-hosted fonts (Open Sans)
├── CNAME                   # Custom domain mapping
├── LICENSE                 # MIT License
└── README.md               # Project overview
```

### Page Layout Conventions
- Keep each page self-explanatory with minimal DOM depth.
- Prefer `<main>`, `<header>`, `<nav>`, `<section>`, `<footer>` where appropriate.
- Only one `<h1>` per page; descending heading order thereafter.
- Inline critical meta tags and structured data directly in the HTML file (no external JSON fetch).

### CSS Guidelines
- Single global stylesheet in `assets/css/style.css` for site-wide rules.
- Page- or feature-specific styles live alongside their feature (e.g., `feature/assets/css/feature.css`).
- Avoid preprocessors and custom properties overuse; use native CSS features first.
- Keep selectors shallow; avoid specificity wars. Prefer utility-like light classes if repetition appears.
- Use `prefers-reduced-motion` for animations and keep them subtle.

### JavaScript Guidelines
- Vanilla JS only. No frameworks (React, Vue, Svelte, Alpine, jQuery, etc.).
- Scripts should be **deferred** and must not block first paint.
- Fail gracefully: if a script errors or JS is disabled, the page still communicates core content.
- Keep logic modular and small; if a script grows past ~200 lines, consider splitting per feature folder (still without bundling).
- Do not rely on ES module imports that would suggest a future build pipeline—inline or single-file modules are fine.

### Adding a New Page
1. Create a new folder if the page has its own assets (`/feature-name/`). Otherwise, add a single `.html` at root if it's top-level navigation.
2. Reference shared styles via relative path: `<link rel="stylesheet" href="/assets/css/style.css">` (or relative `../` if nested).
3. Add only page-specific CSS/JS if truly necessary; co-locate under `feature-name/assets/` mirroring the existing pattern.
4. Ensure semantic markup + descriptive title + meta description + social preview tags (if relevant).
5. Test without JS enabled to confirm graceful degradation.
6. Keep all paths root-relative or correct relative to depth to avoid broken asset references when served by GitHub Pages.

### Images & Fonts
- Optimize images manually before committing (no automated pipeline). Prefer modern formats if widely supported (e.g., WebP) plus fallback when critical.
- Use `alt` text for meaningful images; empty `alt` for decorative ones.
- Self-host fonts; avoid adding variable fonts or large families unless necessary.

### Accessibility Checklist
- Logical heading order.
- Labels / ARIA only where native semantics insufficient.
- Sufficient color contrast.
- Focus styles visible.

### Things to Avoid
| Category  | Avoid | Rationale |
|-----------|-------|-----------|
| Tooling   | `package.json`, bundlers | Adds complexity & build step |
| CSS       | SCSS, Tailwind, large resets | Overhead vs. small scale benefit |
| JS        | Frameworks, transpiled syntax | Not needed for scope |
| Assets    | Unoptimized large images | Slows first paint |
| Fonts     | Many weights/formats | Increases transfer size |
| Analytics | Heavy trackers | Privacy + performance cost |

### Acceptable Lightweight Additions (If Justified)
- Tiny (≤5KB) vanilla JS utilities for enhancement.
- Single external script for a visual effect (already using particles / typed).
- Inline SVG icons instead of icon fonts.

## Example Prompts for Copilot
Use these to keep suggestions aligned with project values.

> Add a new static page `now.html` reusing the existing global stylesheet and minimal markup; include an `<h1>` and a list of current focuses. No JS.

> Extend `main.js` with a reduced-motion fallback that disables the particle effect if `prefers-reduced-motion: reduce`.

> Create a `projects/` page listing 3–5 projects with semantic `<article>` elements and accessible headings.

> Add a keyboard-only visible focus outline improvement in `style.css` without changing existing color variables.

## Maintenance Notes
- Prefer small, atomic commits with descriptive messages.
- Avoid churn: do not reformat all files for stylistic nits.
- Keep HTML attributes ordered logically (lang, meta, links, scripts at end with `defer`).

## FAQ
**Why not add a build step for critical CSS or image pipelines?**
Deliberate constraint: simplicity > micro-optimization. Manual curation is enough at this scale.

**Can we add a service worker or PWA manifest?**
Only if it meaningfully improves UX (offline access) without complexity creep.

**Can we add TypeScript?**
Not unless a compelling complexity threshold is reached; current JS is minimal.

---

Keep it simple, fast, and human-readable. If in doubt, choose the option that requires the fewest moving parts.
