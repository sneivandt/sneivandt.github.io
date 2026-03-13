# sneivandt.github.io ✨

Personal website for [stuartneivandt.com](https://stuartneivandt.com) — a minimalist, fast, accessible, no-framework static site built with native Web Components.

## Overview 🗺️

This repository hosts the source for my landing page / profile site. It is intentionally simple: plain HTML, a single CSS file, and vanilla JS Web Components. **No build tools, no package managers, no dependencies.**

## Features 🚀

| Category | Details |
|----------|---------|
| **Architecture** | Native Web Components (Custom Elements) with Shadow DOM encapsulation |
| **Performance** | Fast first paint, fonts preloaded, zero framework overhead |
| **Responsive** | Mobile-first layout, fluid typography via `clamp()` |
| **Accessible** | Skip link, proper alt text, ARIA labels, respects `prefers-reduced-motion` |
| **SEO & Social** | Meta description, canonical link, Open Graph tags, JSON-LD Person schema |
| **Progressive** | PWA installable via `manifest.json`, service worker for offline support |
| **Effects** | Typewriter animation, share button, connection status (all as reusable Web Components) |
| **Hosting** | GitHub Pages with custom domain via `CNAME` |

## Tech Stack 🧰

| Area        | Choice |
|-------------|--------|
| Markup      | Plain HTML5 (semantic elements + Web Components) |
| Styling     | Native CSS (custom properties, Shadow DOM, no preprocessor) |
| Scripting   | Vanilla JS (ES modules, Web Components API, deferred loading) |
| Fonts       | Self-hosted Inter |
| Hosting     | GitHub Pages |

## Architecture 🧩

The site uses native Web Components (Custom Elements) for modular, encapsulated functionality with Shadow DOM where appropriate for style isolation.

### Key Benefits
- **Encapsulation**: Shadow DOM prevents style conflicts
- **Reusability**: Components work anywhere in the DOM
- **Lifecycle**: Proper cleanup and event management
- **Accessibility**: ARIA-compliant, screen reader support

## Local Development 💻

Because this is pure static content, you only need a simple HTTP server (avoids font / CORS issues that can occur when opening the file directly).

```bash
./scripts/serve.py
```

Then visit: http://localhost:8000

Alternatively, use any static server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## CI/CD ⚙️

Pull requests automatically run:

- **HTML5 Validator** — validates HTML and CSS syntax
- **JavaScript Syntax Check** — ensures all JS files parse correctly
- **Link Checker** — detects broken internal/external links
- **Lighthouse CI** — enforces minimum scores (90+) for performance, accessibility, best practices, and SEO

## Deployment 🌐

1. The repository is named `<username>.github.io`, so GitHub Pages serves the configured publishing branch, typically `main`, at `https://<username>.github.io`.
2. The `CNAME` file configures the custom domain (`stuartneivandt.com`).
3. DNS records point to GitHub Pages (configured externally).
4. GitHub provisions HTTPS certificates via Let's Encrypt automatically.

## Philosophy 🎯

This site intentionally avoids complexity:

- **No build step** — what you see in the repo is what gets served
- **No dependencies** — zero `node_modules`, no version conflicts
- **Accessibility first** — semantic HTML, keyboard navigation, motion preferences
