---
name: github-pages-seo-pwa
description: Maintain GitHub Pages publishing metadata, SEO, and PWA behavior. Use for index.html head tags and JSON-LD, manifest.json, robots.txt, sitemap.xml, CNAME, _config.yml, or sw.js caching and offline behavior.
---

# GitHub Pages SEO and PWA

## Purpose

Use this skill when changing any of the site's publishing and discovery surface:

- `index.html` metadata and structured data
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `CNAME`
- `_config.yml`
- `sw.js`

Read `AGENTS.md` for repository-wide conventions. Use `static-site-maintainer` for visible content, layout, assets, JavaScript components, and documentation. Inspect related metadata and asset references, but edit only the surfaces affected by the change.

## Current Architecture

- The canonical site is `https://stuartneivandt.com/`, published at the domain root.
- `index.html` contains a `ProfilePage` with a `Person` as its JSON-LD `mainEntity`.
- `assets/js/main.js` registers `sw.js` after page load.
- The service worker uses network-first navigation, cache-first images/fonts, and stale-while-revalidate for other requests.
- Pull request workflows validate the site; they do not deploy it. Publishing source, DNS, and HTTPS settings are managed outside the source files.

## Metadata Checklist

- Keep `title`, description, canonical URL, Open Graph, and Twitter metadata aligned.
- Preserve required base tags such as charset and viewport.
- Keep JSON-LD valid and synchronized with visible page content.
- Align manifest descriptions and theme colors with the page.
- Preserve image URL, type, dimensions, and alternative text consistency. The page portrait uses WebP; social metadata currently points to PNG.
- Do not add external dependencies that violate the current CSP.

## GitHub Pages and Domain Checklist

- Preserve `CNAME` unless the domain is intentionally changing.
- Keep paths relative where needed for raw static hosting.
- Avoid assumptions that require server-side routing or rewrites.
- Check `_config.yml` exclusions when moving files; do not claim a file is excluded without checking its actual path.
- Do not change repository publishing settings or DNS unless explicitly requested.

## PWA and Service Worker Checklist

- Keep `manifest.json` icons and presentation metadata in sync with actual assets.
- Bump `CACHE_VERSION` when changing cached site files, including CSS, JavaScript, images, fonts, and manifest content. Cache-first assets otherwise retain old contents at unchanged URLs.
- Keep `PRECACHE_ASSETS` limited to essential local files. When adding or removing assets, update references and the precache together; missing files cause installation to fail.
- If new modules are essential offline, include them explicitly; precaching `main.js` does not automatically cache its imports.
- Preserve offline behavior and avoid caching logic that can strand stale HTML indefinitely.
- Preserve non-GET request handling and explicit failures for unavailable uncached resources. Check the lifetime of background cache updates and the scope of cache deletion when changing the worker.
- Do not promise first-visit offline support; caching requires a successful online installation.

## Search and Crawl Checklist

- Update `sitemap.xml` `lastmod` and JSON-LD `dateModified` when published page content changes materially. Documentation and skill edits alone do not change these dates.
- Keep `robots.txt` and canonical signals consistent with the intended public URL.
- Re-check social preview image URLs and absolute URLs after metadata edits.

## Validation

- Re-read the final `<head>` for consistency after edits.
- Run `python3 -m json.tool manifest.json` for manifest changes and `node --check sw.js` for worker changes.
- Parse JSON-LD after structured-data changes and verify sitemap XML after sitemap edits using existing tools or the Python standard library.
- Verify referenced images, icons, and precache paths exist and resolve from the domain root.
- For cache changes, use a local HTTP preview to check online loading, a worker-version upgrade, and offline loading after installation. Check browser Cache Storage rather than assuming a refresh bypasses the worker.
- For documentation-only skill edits, review frontmatter, paths, and routing; no browser audit or deployment is needed.
- Keep CSP, manifest, and service worker changes conservative and explicit.