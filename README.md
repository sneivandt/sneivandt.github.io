# sneivandt.github.io

Source for [stuartneivandt.com](https://stuartneivandt.com/), Stuart Neivandt's personal website.

A single-page profile with Home and Career views built with plain HTML, native CSS, and vanilla JavaScript, hosted on GitHub Pages. **No build step, package installation, or framework runtime.** The files in this repository are the site.

A decorative SVG network echoes the profile's cloud infrastructure work. It is anchored to the portrait and fades toward the text. It animates as one layer on arrival and settles within five seconds; the profile stays still. Reduced-motion preferences disable the animation, which works without JavaScript. A custom `404.html` page shares the same stylesheet, icons, font preloads, and Content Security Policy.

## Preview locally

With Python 3 installed, run this from the repository root:

```bash
./scripts/serve.py
```

Open [127.0.0.1:8000](http://127.0.0.1:8000/) (pass a port number as an argument to override `8000`). Edit the source files and refresh the browser; there is nothing to compile. Stop the server with `Ctrl+C`.

The included server sends no-cache HTTP headers and serves `404.html` for missing paths, matching GitHub Pages behavior. A basic alternative is:

```bash
python3 -m http.server 8000
```

Serve over HTTP rather than opening `index.html` as a file so ES modules work correctly.

## Making changes

Keep the site small, readable, and directly publishable:

- Keep visible content, page descriptions, social tags, and structured data consistent.
- Keep `404.html` aligned when changing shared stylesheets, icons, font preloads, or the Content Security Policy.
- Reuse existing CSS custom properties for colors, spacing, and typography.
- Use vanilla JavaScript and native Web Components when interaction is needed. Keep the profile usable without JavaScript.
- Optimize images before committing, include image dimensions, and keep fonts self-hosted.
- Preserve semantic headings, keyboard navigation, visible focus styles, touch-friendly buttons, and reduced-motion support.
- Update the sitemap's `lastmod` and structured data's `dateModified` when published page content changes materially.

The favicon uses a circular version of the existing portrait in a 96×96 PNG, with a multi-size ICO fallback. Apple touch and app icons use the same portrait with square corners so the platform can apply its own mask. Keep these icons consistent when replacing the portrait. Google controls when its search favicon refreshes and how it is presented.

## Checks

Pushes to `main` and pull requests targeting `main` run HTML/CSS validation, JavaScript syntax checks, HTML/Markdown link checks, Python standard-library validation (for `manifest.json`, `.github/lighthouserc.json`, `sitemap.xml`, inline JSON-LD in `index.html`, `index.html`/`404.html` head parity, local manifest/social image assets, and `scripts/serve.py`), and [Lighthouse CI](.github/lighthouserc.json) requiring scores of at least **95** in performance, accessibility, best practices, and SEO. Lighthouse CI can also be triggered manually via `workflow_dispatch`.

HTML and CSS checks use the official [Nu Html Checker](https://github.com/validator/validator) image, whose supported production release is `latest`. This keeps validation compatible with modern CSS without suppressing errors. Errors fail the check; informational warnings remain visible in its output. With Docker available, run the same check locally:

```bash
docker run --rm --volume "$PWD:/data:ro" \
  ghcr.io/validator/validator:latest \
  vnu --skip-non-html --also-check-css /data
```

Check JavaScript syntax with Node.js:

```bash
node --check assets/js/main.js
```

Check JSON files and helper script syntax with Python's standard library:

```bash
python3 -m json.tool manifest.json > /dev/null
python3 -m json.tool .github/lighthouserc.json > /dev/null
python3 -m py_compile scripts/serve.py
```

For visual or interactive changes, also check a mobile viewport, keyboard navigation, and reduced-motion preferences. When opening a pull request for visual changes, include screenshots of the updated site.

## Deployment

GitHub Pages publishes the repository's configured source without a frontend build. The custom domain is declared in `CNAME`; DNS, the publishing source, and HTTPS settings are managed outside these source files.

The canonical homepage is `https://stuartneivandt.com/`. Its page, social, and `ProfilePage`/`Person` metadata use that URL, and the sitemap lists only that page. When checking domain aliases, verify redirects at the host rather than adding JavaScript or duplicate redirect pages. Changes to DNS or GitHub Pages settings require explicit approval.

The workflows in this repository validate the site; they do not deploy it.
