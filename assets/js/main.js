/**
 * @file main.js
 * @description Core entry point for the site's JavaScript.
 * Manages the in-page view switcher and registers the service worker.
 */

/* ------------------------------------------------------------
 * Profile View Switcher (SPA tabs)
 * ------------------------------------------------------------ */
const initViewSwitcher = () => {
  const nav = document.querySelector('.view-nav');
  if (!nav) return;

  const tabs = Array.from(nav.querySelectorAll('[data-view]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  if (!tabs.length || !panels.length) return;

  const validViews = new Set(panels.map((panel) => panel.dataset.panel));
  const defaultView = tabs[0].dataset.view;
  const defaultTitle = document.title;
  const viewTitles = {
    home: defaultTitle,
    career: 'Career | Stuart Neivandt'
  };

  document.documentElement.classList.add('js');

  nav.setAttribute('role', 'tablist');
  for (const tab of tabs) {
    const view = tab.dataset.view;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', view);
    tab.removeAttribute('aria-current');
  }
  for (const panel of panels) {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.dataset.panel}`);
  }

  const viewFromHash = () => {
    const hash = window.location.hash.slice(1).toLowerCase();
    return validViews.has(hash) ? hash : defaultView;
  };

  let currentView = null;

  const setActiveView = (view, { updateHistory = false, focusTab = false, animate = false } = {}) => {
    const target = validViews.has(view) ? view : defaultView;
    const changed = currentView !== target;
    currentView = target;

    for (const tab of tabs) {
      const isActive = tab.dataset.view === target;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) {
        tab.focus();
      }
    }

    for (const panel of panels) {
      const isActive = panel.dataset.panel === target;
      panel.classList.toggle('is-hidden', !isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
      panel.inert = !isActive;
      panel.classList.toggle('is-entering', isActive && animate && changed);
    }

    document.title = viewTitles[target] || defaultTitle;

    if (updateHistory) {
      const nextUrl = target === defaultView
        ? `${window.location.pathname}${window.location.search}`
        : `${window.location.pathname}${window.location.search}#${target}`;
      if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
        window.history.pushState({ view: target }, '', nextUrl);
      }
    }
  };

  nav.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-view]');
    if (!tab || !nav.contains(tab)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    setActiveView(tab.dataset.view, { updateHistory: true, animate: true });
  });

  nav.addEventListener('keydown', (event) => {
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      setActiveView(tabs[nextIndex].dataset.view, { updateHistory: true, focusTab: true, animate: true });
    }
  });

  window.addEventListener('hashchange', () => setActiveView(viewFromHash(), { animate: true }));
  window.addEventListener('popstate', () => setActiveView(viewFromHash(), { animate: true }));

  setActiveView(viewFromHash());
};

initViewSwitcher();

/* ------------------------------------------------------------
 * Service Worker Registration
 * ------------------------------------------------------------ */
if ('serviceWorker' in navigator) {
  const swUrl = new URL('../../sw.js', import.meta.url);

  const registerSw = () => {
    navigator.serviceWorker.register(swUrl.href)
      .catch((err) => {
        console.debug('ServiceWorker registration failed:', err);
      });
  };

  if (document.readyState === 'complete') {
    registerSw();
  } else {
    window.addEventListener('load', registerSw);
  }
}
