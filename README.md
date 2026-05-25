# sneivandt.github.io

Personal website for [stuartneivandt.com](https://stuartneivandt.com).

This repository is a small, dependency-free GitHub Pages site built with plain HTML, native CSS, and vanilla JavaScript Web Components. There is no build step, package manager, framework, or generated asset pipeline.

## Overview

The site is intentionally simple: source files are served directly by GitHub Pages. The main page lives in `index.html`, global styles live in `assets/css/style.css`, and interactive behavior is split into small ES module Web Components under `assets/js/components/`.

## Features

| Area | Details |
| --- | --- |
| Architecture | Native Custom Elements, with Shadow DOM where style isolation helps |
| Performance | No framework runtime, preloaded fonts, compact static assets |
| Accessibility | Semantic markup, skip link, ARIA labels where needed, visible focus states |
| Responsive design | Mobile-first layout with fluid typography using `clamp()` |
| SEO and sharing | Canonical URL, Open Graph metadata, sitemap, robots file, JSON-LD |
| Progressive enhancement | Web app manifest and service worker for offline support |
| Hosting | GitHub Pages with a custom domain configured through `CNAME` |

## Local development

Use the included static server:

```bash
./scripts/serve.py
```

Then open `http://localhost:8000`.

You can also use Python's built-in server:

```bash
python3 -m http.server 8000
```

Avoid opening `index.html` directly from the filesystem; local HTTP serving better matches GitHub Pages and avoids browser restrictions around fonts, modules, and service workers.

## Validation

Pull requests run automated checks for:

- HTML and CSS validation
- JavaScript syntax with `node --check`
- Broken links in HTML and Markdown
- Valid `manifest.json`
- Lighthouse scores for performance, accessibility, best practices, and SEO

For local JavaScript syntax checks:

```bash
find . -name "*.js" -type f ! -path "./.git/*" -exec node --check {} \;
```

## Deployment

GitHub Pages serves the configured publishing branch for this repository. The `CNAME` file maps the site to `stuartneivandt.com`, and DNS is configured outside the repository. HTTPS is provisioned automatically by GitHub Pages.

## Maintenance principles

- Keep the site dependency-free and build-free.
- Prefer semantic HTML, native CSS, and small vanilla JavaScript modules.
- Keep assets optimized before committing them.
- Preserve keyboard access, visible focus states, and reduced-motion support.
- Update `sitemap.xml` when content changes materially.
