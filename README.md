# sneivandt.github.io ✨

Personal website for [stuartneivandt.com](https://stuartneivandt.com) — a minimalist, fast, accessible, no-framework static site.

## Overview 🗺️

This repository hosts the source for my landing page / profile site. It is intentionally simple: plain HTML, a single CSS file, a light vanilla JS enhancement layer, and a couple of small third-party libraries loaded from CDNs.

## Features 🚀

- Fast first paint (no large framework, fonts preloaded)
- Responsive layout (mobile-first, fluid typography)
- Accessible markup (skip link, proper alt text, ARIA labels, reduced motion friendly)
- SEO & Social:
    - Meta description, canonical link
    - Open Graph tags for rich link previews
    - JSON-LD structured data (Person schema)
- Subtle visual enhancements: typing effect
- Installable as a PWA (manifest)
- Custom domain via `CNAME` (GitHub Pages)

## Tech Stack 🧰

| Area        | Choice |
|-------------|--------|
| Markup      | Plain HTML5 |
| Styling     | CSS (no preprocessor) |
| Scripting   | Vanilla JS |
| Fonts       | Self-hosted Open Sans |
| Effects     | Custom Typewriter (Vanilla JS) |
| Hosting     | GitHub Pages |

## Local Development 💻

Because this is pure static content, you only need a simple HTTP server (avoids font / relative path issues that can occur when opening the file directly).

Using the helper script (macOS/Linux):

```bash
./serve.sh
```

Then visit: http://localhost:8000

## Deployment (GitHub Pages + Custom Domain) 🌐

1. The repository is named `<username>.github.io`, so the `master` branch automatically serves at `https://<username>.github.io`.
2. The `CNAME` file contains `stuartneivandt.com`; GitHub Pages uses this to configure the custom domain.
3. DNS: An A/ALIAS/ANAME (or CNAME for `www`) record points the domain to GitHub Pages (already configured outside of this repo).
4. GitHub automatically provisions HTTPS certificates via Let’s Encrypt.
