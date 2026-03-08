---
name: web-components-maintainer
description: Maintains the site's native Web Components in assets/js/components using plain custom elements, Shadow DOM where appropriate, lifecycle cleanup, accessibility, and reduced-motion support.
---

# Web Components Maintainer

## Purpose

Use this skill for any change to:

- `assets/js/components/*.js`
- `assets/js/main.js`
- component markup, registration, lifecycle logic, or encapsulated styles

The site uses native Custom Elements, not a framework. Keep components small, direct, and dependency-free.

## Component Rules

- Guard Shadow DOM attachment with `if (!this.shadowRoot)` before `attachShadow()`.
- Implement `disconnectedCallback()` when listeners, timers, or observers need cleanup.
- Remove all event listeners and clear all timeouts or intervals on disconnect.
- Use plain-text attributes as inputs; render markup inside the component.
- Register new components explicitly from `assets/js/main.js`.

## Shadow DOM Guidance

Use Shadow DOM when a component needs style encapsulation and stands alone.

Skip Shadow DOM when a component needs to participate in global layout or inherit page-level styling patterns.

## Accessibility Guidance

- Use native semantics first.
- For rapidly updating decorative text, prefer `aria-hidden="true"` instead of chatty live regions.
- Keep icon-only controls labeled with `aria-label`.
- Ensure keyboard interaction and visible focus behavior remain intact.
- Respect `prefers-reduced-motion` for animated components.

## Implementation Checklist

- Confirm the component can reconnect cleanly without duplicate listeners or duplicate Shadow DOM creation.
- Keep component state internal and simple.
- Avoid introducing helper libraries or shared abstractions unless repetition is real and sustained.
- Keep imports relative ES modules only.
- Preserve compatibility with direct static hosting on GitHub Pages.

## Validation

- Run `node --check` on any modified component files and on `assets/js/main.js` if imports changed.
- Confirm new components are imported and registered exactly once.
- Re-check motion behavior when `prefers-reduced-motion: reduce` is enabled.