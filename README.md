# sneivandt.github.io ✨

Personal website for [stuartneivandt.com](https://stuartneivandt.com) — a minimalist, fast, accessible, no-framework static site.

## Overview 🗺️

This repository hosts the source for my landing page / profile site. It is intentionally simple: plain HTML, a single CSS file, a light vanilla JS enhancement layer, and a couple of small third‑party libraries loaded from CDNs.

## Features 🚀

- Fast first paint (no large framework, fonts preloaded)
- Responsive layout (mobile-first, fluid typography)
- Accessible markup (skip link, proper alt text, ARIA labels, reduced motion friendly)
- SEO & Social:
	- Meta description, canonical link
	- Open Graph tags for rich link previews
	- JSON-LD structured data (Person schema)
- Subtle visual enhancements: particle background + typing effect
- Custom domain via `CNAME` (GitHub Pages)

## Tech Stack 🧰

| Area        | Choice |
|-------------|--------|
| Markup      | Plain HTML5 |
| Styling     | CSS (no preprocessor) |
| Scripting   | Vanilla JS (`js/main.js`) |
| Fonts       | Self-hosted Open Sans (subset could be a future optimization) |
| Effects     | [particles.js](https://github.com/VincentGarreau/particles.js), [typed.js](https://github.com/mattboldt/typed.js) |
| Hosting     | GitHub Pages |

## Repository Structure �
## Repository Structure 📂
```
.
├── index.html        # Main landing page (SEO + structured data)
├── css/
│   └── style.css     # Core styles (layout, typography, animations)
├── js/
│   └── main.js       # Initialization (particles + typed text setup)
├── img/              # Images (profile, social/share assets)
├── font/
│   └── OpenSans/     # Self-hosted font files
├── CNAME             # Custom domain mapping for GitHub Pages
├── LICENSE           # MIT license
└── README.md         # Project documentation
```

Brief notes:

- `index.html` keeps everything lean; no bundler/build step.
- `css/style.css` could later be split (e.g. components / utilities) if complexity grows.
- `js/main.js` only mounts enhancements; core content works without JS.
- `font/OpenSans/` may be replaced with a subsetted WOFF2-only variant for performance.
- `CNAME` must remain for the custom domain; remove if you fork under a different domain.


## Local Development 💻

Because this is pure static content, you only need a simple HTTP server (avoids font / relative path issues that can occur when opening the file directly).

### Quick start

Using Python (already on most systems):

```bash
python3 -m http.server 8000
```

Then visit: http://localhost:8000

Alternative (Node.js):

```bash
npx serve .
```

## Deployment (GitHub Pages + Custom Domain) 🌐

1. The repository is named `<username>.github.io`, so the `master` (or `main`) branch automatically serves at `https://<username>.github.io`.
2. The `CNAME` file contains `stuartneivandt.com`; GitHub Pages uses this to configure the custom domain.
3. DNS: An A/ALIAS/ANAME (or CNAME for `www`) record points the domain to GitHub Pages (already configured outside of this repo).
4. GitHub automatically provisions HTTPS certificates via Let’s Encrypt.

If you fork this:
- Remove or update `CNAME` (otherwise Pages will not build for your fork)
- Replace analytics / tracking (none present yet) and social meta to match your identity

## Customization Ideas / Future Enhancements 💡

- Add a build step to inline critical CSS for even faster LCP
- Provide reduced‑motion variant for the particle background
- Add dark/light theme toggle (currently relies on system `prefers-color-scheme`)
- Image optimization (generate multiple sizes + `srcset`)
- Subset / WOFF2 encode the font to reduce transfer size

## Accessibility Notes ✅

- Skip link provided for keyboard users
- Decorative particle canvas is `aria-hidden="true"`
- Live typing region contained and polite (fallback static text provided via `data-fallback` + `<noscript>`)

## License 📄

Code & content: MIT (see `LICENSE`).

You may reuse structural or configuration ideas; please replace personal content (name, images, profile links) with your own.

## Contact 🤝

- GitHub: [@sneivandt](https://github.com/sneivandt)
- LinkedIn: [linkedin.com/in/stuartneivandt](https://linkedin.com/in/stuartneivandt)

---

If you spot an issue or have a suggestion, feel free to open an issue or PR.