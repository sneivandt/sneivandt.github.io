---
name: github-pages-seo-pwa
description: Maintains this site's GitHub Pages metadata and platform files including index.html head tags, structured data, manifest, robots, sitemap, CNAME, and service worker caching behavior.
---

# GitHub Pages SEO and PWA

## Purpose

Use this skill when changing any of the site's publishing and discovery surface:

- `index.html` metadata and structured data
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `CNAME`
- `sw.js`

These files are tightly coupled. Make changes consistently across them instead of updating only one surface.

## Metadata Checklist

- Keep `title`, description, canonical URL, Open Graph, and Twitter metadata aligned.
- Preserve required base tags such as charset and viewport.
- Keep JSON-LD valid and synchronized with visible page content.
- Do not add external dependencies that violate the current CSP.

## GitHub Pages and Domain Checklist

- Preserve `CNAME` unless the domain is intentionally changing.
- Keep paths relative where needed for raw static hosting.
- Avoid assumptions that require server-side routing or rewrites.

## PWA and Service Worker Checklist

- Keep `manifest.json` icons and presentation metadata in sync with actual assets.
- When changing precached assets in `sw.js`, update the cache version if needed to force refresh.
- Preserve offline behavior and avoid caching logic that can strand stale HTML indefinitely.
- Ensure any newly referenced assets actually exist in the repository.

## Search and Crawl Checklist

- Update `sitemap.xml` `lastmod` when meaningful content changes ship.
- Keep `robots.txt` and canonical signals consistent with the intended public URL.
- Re-check social preview image URLs and absolute URLs after metadata edits.

## Validation

- Re-read the final `<head>` for consistency after edits.
- Verify service worker asset paths are correct for GitHub Pages root hosting.
- Keep CSP, manifest, and service worker changes conservative and explicit.