---
name: static-site-maintainer
description: Maintain this dependency-free static site, including page content, layout, CSS, vanilla JavaScript, native Web Components, assets, and README documentation. Use for site edits that must preserve raw GitHub Pages hosting without a build step.
---

# Static Site Maintainer

## Purpose

Use this skill for the site's content, presentation, and local maintenance:

- `index.html` and `404.html`
- `assets/css/style.css`
- `assets/js/main.js`
- fonts and images under `assets/`
- `README.md` and `scripts/serve.py`

Read `AGENTS.md` for repository-wide conventions. Use `github-pages-seo-pwa` for head metadata, structured data, domain configuration, the manifest, crawling files, and service worker caching.

The current page is a single profile. `assets/js/main.js` only registers the service worker; there are no active Web Components. Inspect the current source before assuming a component or footer is active.

## Hard Constraints

- No build tools, package manifests, dependency installation, or generated asset pipelines.
- No frameworks or CSS preprocessors.
- Vanilla HTML, native CSS, and ES modules only.
- Keep the DOM shallow and semantic.
- Preserve fast first paint and accessible defaults.

## Working Style

- Start from existing structure instead of introducing new abstractions.
- Reuse the global design tokens in `assets/css/style.css` before adding new values.
- Keep selectors shallow and avoid specificity creep.
- Respect `prefers-reduced-motion` for any added animation.
- Keep changes readable in source form because the repo has no compilation step.
- Keep core content and navigation usable without JavaScript.
- Keep documentation aligned with actual imports, markup, and CI configuration rather than describing unused capabilities as live features.

## Site Checklist

- Keep a single `<h1>` on the page.
- Prefer semantic elements such as `<main>`, `<section>`, `<nav>`, and `<footer>`.
- Maintain visible focus states and keyboard access.
- Provide descriptive `alt` text for meaningful images and empty `alt` for decorative ones.
- Preserve mobile-first behavior and fluid sizing with `clamp()` where appropriate.
- Avoid adding large visual systems or utility sprawl for one-off changes.

## JavaScript and Components

- Use relative ES module imports and native Custom Elements only when reusable interaction is needed.
- Wire new components through `assets/js/main.js` and add their markup where they are used. Do not add an import merely because a component file exists.
- Guard `attachShadow()` with `if (!this.shadowRoot)`; use Shadow DOM for standalone encapsulation, not composition that depends on global styles.
- Treat attribute values as plain text. Use `textContent` or escape them before inserting them into HTML.
- Clean up listeners, timers, and observers in `disconnectedCallback()` when allocated; verify reconnecting does not duplicate them.
- Prefer native controls and keyboard behavior. Label icon-only links without redundant `title` attributes and hide decorative animation from assistive technology.
- Respect reduced-motion preferences and avoid unnecessary helpers or libraries.

## Local Preview

Run `./scripts/serve.py` from the repository root and open `http://127.0.0.1:8000/`. The server sends no-cache headers and serves `404.html` for missing paths, but the service worker can still serve cached assets. For stale local content, unregister the worker and clear this origin's Cache Storage in browser developer tools.

## Validation

- Run `node --check` on touched JavaScript files, including `main.js` when imports change, and `python3 -m py_compile scripts/serve.py` when editing the local preview server.
- For page changes, verify static serving, landmarks, heading order, keyboard navigation, mobile layout, and reduced-motion behavior.
- Include screenshots when opening pull requests for visual changes.
- For documentation-only edits, check commands and relative links against the repository; no site audit or content-date change is needed.
- Pushes to `main` and pull requests targeting `main` run HTML/CSS, JavaScript, link, and JSON/XML/JSON-LD/Python checks (`ci.yml`). Pull requests targeting `main` also run Lighthouse CI (`lighthouse.yml` and `.github/lighthouserc.json`). Check the workflow files before changing or describing those checks.
- For material page-content changes, synchronize `sitemap.xml` `lastmod` and JSON-LD `dateModified` with the change date.
- For cached site-file changes, follow `github-pages-seo-pwa` to update the service worker cache version.

## Shipping

Committing and pushing directly to `main` is the preferred way to ship changes in this repository. Verify relevant local checks before pushing, then monitor GitHub Actions CI on the pushed `main` commit until it passes. Use a pull request only when explicitly requested or when PR-only Lighthouse CI is needed beforehand.
