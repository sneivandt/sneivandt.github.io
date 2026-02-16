# Web Components

This directory contains native Web Components (Custom Elements) used throughout the site.

## Components

### `<typewriter-effect>`
Animated typewriter effect for text. Uses Shadow DOM for encapsulation.

**Attributes:**
- `strings` - Comma-separated list of strings to type
- `loop` - Whether to loop (default: true)
- `type-speed` - Typing speed in ms (default: 60)
- `back-speed` - Backspace speed in ms (default: 30)
- `back-delay` - Pause before backspacing in ms (default: 2000)
- `start-delay` - Initial delay before starting in ms (default: 500)
- `fallback` - Text to show if animation is disabled

**Features:**
- Respects `prefers-reduced-motion` 
- Automatic cleanup on disconnect

### `<share-button>`
Share button with Web Share API and Clipboard API fallback. Uses Shadow DOM.

**Attributes:**
- `title` - Share title
- `text` - Share description
- `url` - URL to share (default: current page)

**Features:**
- Native share dialog on supported platforms
- Clipboard copy fallback
- Toast notification on copy

### `<connection-status>`
Network connectivity indicator. Uses Shadow DOM.

**Features:**
- Monitors online/offline events
- Auto-hides after 5 seconds
- Verifies actual connectivity with fetch

### `<last-updated>`
Displays last commit date from GitHub API. Uses Shadow DOM.

**Attributes:**
- `repo` - Repository in `owner/repo` format

**Features:**
- LocalStorage caching (1 hour)
- Graceful failure handling

### `<console-brand>`
Logs a branded message to browser console.

**Features:**
- Runs once on connect
- Minimal footprint

### `<profile-card>`
Main profile section container. No Shadow DOM (maintains CSS compatibility).

**Attributes:**
- `name` - Person's name
- `bio` - Bio text (can include HTML)

**Contains:**
- Profile image
- Name heading
- Typewriter effect
- Bio text
- Social links

### `<social-links>`
Social media navigation links. No Shadow DOM (maintains CSS compatibility).

**Features:**
- Hardcoded social links (LinkedIn, GitHub, Facebook, Instagram)
- Proper ARIA labels
- rel="me" for identity verification

## Design Philosophy

These web components follow the repository's core principles:

1. **No build tools** - Pure vanilla JavaScript, no compilation
2. **No dependencies** - Built with native Web Components API
3. **Shadow DOM where appropriate** - Encapsulation for self-contained features
4. **CSS compatibility** - Some components skip Shadow DOM to maintain existing styles
5. **Progressive enhancement** - Works without JavaScript via noscript fallbacks
6. **Accessibility first** - ARIA labels, semantic HTML, keyboard navigation
7. **Performance** - Minimal overhead, efficient rendering

## Browser Support

These components use:
- Custom Elements v1
- Shadow DOM v1  
- ES Modules

Supported by all modern browsers (Chrome, Firefox, Safari, Edge).
