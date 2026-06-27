---
name: static-site-maintainer
description: Maintains this GitHub Pages site as pure static HTML, CSS, and vanilla JS. Use for layout, copy, styling, accessibility, performance, and general site edits that must preserve the repo's no-build, no-dependency approach.
---

# Static Site Maintainer

## Purpose

Use this skill when working on the site's core static surface:

- `index.html`
- `assets/css/style.css`
- static assets under `assets/`
- content and presentation changes that do not require app frameworks or tooling

This repository is intentionally minimal. Prefer the smallest direct change that preserves raw GitHub Pages hosting.

## Hard Constraints

- No build tools, package managers, or generated assets.
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

## Site Checklist

- Keep a single `<h1>` on the page.
- Prefer semantic elements such as `<main>`, `<section>`, `<nav>`, and `<footer>`.
- Maintain visible focus states and keyboard access.
- Provide descriptive `alt` text for meaningful images and empty `alt` for decorative ones.
- Preserve mobile-first behavior and fluid sizing with `clamp()` where appropriate.
- Avoid adding large visual systems or utility sprawl for one-off changes.

## Validation

- Verify the page still works as a static site with no build step.
- If JavaScript changes, run `node --check` on the touched JS files.
- If markup changes, re-check metadata, landmarks, and heading order.
- If content changes materially, remember that `sitemap.xml` may need its `lastmod` updated.