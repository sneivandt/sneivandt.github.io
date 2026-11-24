# sneivandt.github.io

Source for [stuartneivandt.com](https://stuartneivandt.com/), Stuart Neivandt's personal website.

A single-page profile built with plain HTML, native CSS, and vanilla JavaScript, hosted on GitHub Pages. **No build step, package installation, or framework runtime.** The files in this repository are the site.

A decorative SVG network echoes the profile's distributed-systems work. It is anchored to the portrait and fades toward the text. It animates as one layer on arrival and settles within five seconds; the profile stays still. Reduced-motion preferences disable the animation, which works without JavaScript.

## Preview locally

With Python 3 installed, run this from the repository root:

```bash
./serve.py
```

Open [localhost:8000](http://localhost:8000/). Edit the source files and refresh the browser; there is nothing to compile. Stop the server with `Ctrl+C`.

The included server sends no-cache HTTP headers. A basic alternative is:

```bash
python3 -m http.server 8000
```

Serve over HTTP rather than opening `index.html` as a file so ES modules and service worker registration work correctly.

**Seeing stale assets?** The service worker caches files independently of the server's HTTP headers. During development, unregister it and clear the site's Cache Storage in your browser's developer tools, then reload.

## Making changes

Keep the site small, readable, and directly publishable:

- Keep visible content, page descriptions, social tags, and structured data consistent.
- Reuse existing CSS custom properties for colors, spacing, and typography.
- Use vanilla JavaScript and native Web Components when interaction is needed. Keep the profile usable without JavaScript.
- Optimize images before committing, include image dimensions, and keep fonts self-hosted.
- Preserve semantic headings, keyboard navigation, visible focus styles, touch-friendly buttons, and reduced-motion support.
- Update the sitemap's `lastmod` and structured data's `dateModified` when published page content changes materially.

When changing cached site files, bump `CACHE_VERSION` in `sw.js` so the next service worker installation refreshes the precache. Add new essential offline assets to `PRECACHE_ASSETS` as needed. HTML uses network-first caching, images and fonts use cache-first caching, and other assets use stale-while-revalidate.

The favicon uses a circular version of the existing portrait in a 96×96 PNG, with a multi-size ICO fallback. Apple touch and app icons use the same portrait with square corners so the platform can apply its own mask. Keep these icons consistent when replacing the portrait. Google controls when its search favicon refreshes and how it is presented.

## Checks

Pushes to `main` and pull requests targeting `main` run HTML/CSS validation, JavaScript syntax checks, HTML/Markdown link checks, and JSON syntax validation for `manifest.json`. On pull requests, [Lighthouse CI](.lighthouserc.json) also requires scores of at least **90** in performance, accessibility, best practices, and SEO.

HTML and CSS checks use the official [Nu Html Checker](https://github.com/validator/validator) image, whose supported production release is `latest`. This keeps validation compatible with modern CSS without suppressing errors. Errors fail the check; informational warnings remain visible in its output. With Docker available, run the same check locally:

```bash
docker run --rm --volume "$PWD:/data:ro" \
  ghcr.io/validator/validator:latest \
  vnu --skip-non-html --also-check-css /data
```

Check JavaScript syntax with Node.js:

```bash
node --check sw.js
node --check assets/js/main.js
```

Check the manifest with Python's standard library:

```bash
python3 -m json.tool manifest.json
```

For visual or interactive changes, also check a mobile viewport, keyboard navigation, and reduced-motion preferences. Include screenshots of the updated site in the pull request.

## Deployment

GitHub Pages publishes the repository's configured source without a frontend build. The custom domain is declared in `CNAME`; DNS, the publishing source, and HTTPS settings are managed outside these source files.

The canonical homepage is `https://stuartneivandt.com/`. Its page, social, and `ProfilePage`/`Person` metadata use that URL, and the sitemap lists only that page. When checking domain aliases, verify redirects at the host rather than adding JavaScript or duplicate redirect pages. Changes to DNS or GitHub Pages settings require explicit approval.

The workflows in this repository validate the site; they do not deploy it.
