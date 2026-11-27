# Agent guidance

This is a small personal website served directly by GitHub Pages. Keep changes simple, readable, fast, and accessible.

## Constraints

- Use plain HTML, native CSS, and vanilla JavaScript. No frameworks, preprocessors, bundlers, package manifests, or dependency installation.
- Preserve direct static hosting: no build step, generated asset pipeline, server-side routing, or rewrites.
- Keep changes focused. Reuse existing patterns and helpers instead of introducing speculative abstractions.
- Keep core content and navigation usable without JavaScript. Optional enhancements must respect the page's Content Security Policy.
- Do not add heavy analytics, trackers, or unnecessary third-party assets.

## Implementation

- Keep markup shallow and semantic, with one `h1` and logical heading order.
- Keep metadata and JSON-LD inline and consistent with visible content, the canonical URL, and social previews.
- Keep `404.html` aligned when changing shared stylesheets, icons, font preloads, or the Content Security Policy.
- Reuse global CSS custom properties; keep selectors shallow and prefer fluid sizing with `clamp()`.
- Preserve keyboard access and visible focus styles. Use native semantics before ARIA.
- Maintain contrast of at least 4.5:1 for normal text and 3:1 for large text.
- Label icon-only links with `aria-label`, without a redundant `title`. Hide decorative icons and animation from assistive technology.
- Respect `prefers-reduced-motion` in CSS and JavaScript.
- Use small, relative ES modules loaded with `type="module"` or `defer`.
- Use native Web Components for reusable UI only when needed. Guard Shadow DOM creation, clean up listeners/timers/observers on disconnect, and support reconnection.
- Treat component attributes as plain text; escape values or use `textContent` rather than inserting raw input into HTML.
- Optimize images before committing. Prefer WebP with fallback when needed, provide appropriate alt text, and include image dimensions.
- Keep fonts self-hosted as WOFF2, preload critical weights, and limit the site to two or three weights.

## Task-specific skills

Use the relevant skill under `.agents/skills/`:

- `static-site-maintainer`: content, layout, styling, JavaScript, components, assets, and documentation.
- `github-pages-seo-pwa`: metadata, structured data, publishing configuration, crawling files, and service worker caching.

Inspect the current source before assuming a feature is active. The JavaScript entry point currently manages the in-page Home/Career view switcher and registers the service worker.

## Validation

- Preview with `./scripts/serve.py` from the repository root at `http://127.0.0.1:8000/` (also serves `404.html` for missing paths).
- If local assets appear stale, unregister the service worker and clear this origin's Cache Storage; no-cache HTTP headers do not bypass it.
- Run `node --check` on touched JavaScript files, `python3 -m json.tool` on touched JSON files (`manifest.json`, `.github/lighthouserc.json`), and `python3 -m py_compile scripts/serve.py` when changing the dev server.
- For visual or interactive changes, check mobile layout, keyboard navigation, and reduced-motion behavior. Include screenshots when opening a pull request.
- Pushes to `main` and pull requests targeting `main` run HTML/CSS validation, JavaScript syntax checks, HTML/Markdown link checks, and JSON/XML/JSON-LD/Python checks. Pull requests targeting `main` also run Lighthouse audits (`.github/lighthouserc.json`) requiring at least 90 in all four categories.
- Documentation-only changes need accurate commands and links, not a site audit.

## Maintenance

- Committing and pushing directly to `main` is the preferred way to ship changes in this repository. Run local checks first, push to `main`, and verify GitHub Actions CI (and Pages deployment when site files change) succeeds on the pushed commit. Use a pull request only when explicitly requested or when PR-only Lighthouse CI is needed beforehand.
- Bump `CACHE_VERSION` in `sw.js` when changing cached site files. Update precache references when adding or removing essential offline assets.
- For material published page-content changes, update sitemap `lastmod` and JSON-LD `dateModified`. Do not change those dates for documentation or skill edits alone.
- Keep the copyright year in `LICENSE` current.
- Preserve the custom domain unless a domain change is requested. Do not change DNS or repository publishing settings without explicit authorization.
- Update directly related documentation when behavior or maintenance instructions change.
