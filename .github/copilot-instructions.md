# GitHub Copilot Guidance for `sneivandt.github.io`

This repository is intentionally **minimal, dependency-free, build-free static content**. All contributions should preserve that philosophy.

## Core Principles
1. Pure static hosting (GitHub Pages serves raw files).
2. **No build tools**: Do not introduce bundlers, transpilers, task runners, or preprocessors (no Webpack, Vite, Gulp, Babel, SCSS, Tailwind, etc.).
3. **No package managers**: Avoid `package.json`, `node_modules`, Python deps, etc.
4. **Vanilla HTML/CSS/JS only**. Small, CDN-loaded third-party scripts are acceptable if they are optional enhancements.
6. **Performance + accessibility first**: Fast first paint, semantic markup, keyboard + reduced-motion friendly.

If a change would require a build step, reconsider the approach or propose it explicitly before implementing.

### Page Layout Conventions
- Keep each page self-explanatory with minimal DOM depth.
- Prefer `<main>`, `<header>`, `<nav>`, `<section>`, `<footer>` where appropriate.
- Only one `<h1>` per page; descending heading order thereafter.
- Inline critical meta tags and structured data directly in the HTML file (no external JSON fetch).

### CSS Guidelines
- Single global stylesheet in `css/style.css` for site-wide rules.
- Avoid preprocessors and custom properties overuse; use native CSS features first.
- Keep selectors shallow; avoid specificity wars. Prefer utility-like light classes if repetition appears.
- Use `prefers-reduced-motion` for animations and keep them subtle.

### JavaScript Guidelines
- Vanilla JS only. No frameworks (React, Vue, Svelte, Alpine, jQuery, etc.).
- Scripts should be **deferred** and must not block first paint.
- Fail gracefully: if a script errors or JS is disabled, the page still communicates core content.
- Keep logic modular and small; if a script grows past ~200 lines, consider splitting per feature folder (still without bundling).
- Do not rely on ES module imports that would suggest a future build pipeline—inline or single-file modules are fine.

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
| Fonts     | Many weights/formats | Increases transfer size |
| Analytics | Heavy trackers | Privacy + performance cost |

### Acceptable Lightweight Additions (If Justified)
- Tiny (≤5KB) vanilla JS utilities for enhancement.
- Single external script for a visual effect (already using particles / typed).
- Inline SVG icons instead of icon fonts.

## FAQ
**Why not add a build step for critical CSS or image pipelines?**
Deliberate constraint: simplicity > micro-optimization. Manual curation is enough at this scale.

**Can we add a service worker?**
Only if it meaningfully improves UX (offline access) without complexity creep. (A `manifest.json` exists for basic installability).

**Can we add TypeScript?**
Not unless a compelling complexity threshold is reached; current JS is minimal.

**Do we need a custom 404 page?**
No. GitHub Pages provides a default one, and this site is simple enough that a custom one is unnecessary maintenance.

**Do we need a copyright notice?**
No. The content is personal and minimal; adding legal boilerplate would detract from the simplicity

---

Keep it simple, fast, and human-readable. If in doubt, choose the option that requires the fewest moving parts.
