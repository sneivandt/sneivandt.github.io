/**
 * @file main.js
 * @description Core entry point for the site's JavaScript.
 * Manages the in-page view switcher.
 */

/* ------------------------------------------------------------
 * Profile View Switcher (SPA tabs)
 * ------------------------------------------------------------ */
const initViewSwitcher = () => {
  const nav = document.querySelector('.view-nav');
  if (!nav) return;

  const tabs = Array.from(nav.querySelectorAll('[data-view]'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const panelsContainer = document.querySelector('.card-panels');
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
    panel.removeAttribute('aria-label');
    panel.addEventListener('animationend', (event) => {
      if (event.target === panel) {
        panel.classList.remove('is-entering');
      }
    });
  }

  const updateIndicator = (activeTab) => {
    if (!activeTab) return;
    nav.style.setProperty('--indicator-x', `${activeTab.offsetLeft}px`);
    nav.style.setProperty('--indicator-w', `${activeTab.offsetWidth}px`);
  };

  const viewFromHash = () => {
    const hash = window.location.hash.slice(1).toLowerCase();
    return validViews.has(hash) ? hash : defaultView;
  };

  let currentView = null;

  const setActiveView = (view, { historyMode = 'none', focusTab = false, animate = false } = {}) => {
    const target = validViews.has(view) ? view : defaultView;
    const changed = currentView !== target;

    if (!changed) {
      if (focusTab) {
        const activeTab = tabs.find((tab) => tab.dataset.view === target);
        activeTab?.focus();
      }
      return;
    }

    const prevIndex = tabs.findIndex((tab) => tab.dataset.view === currentView);
    const nextIndex = tabs.findIndex((tab) => tab.dataset.view === target);
    const direction = prevIndex !== -1 && nextIndex < prevIndex ? 'backward' : 'forward';
    currentView = target;

    if (panelsContainer) {
      panelsContainer.dataset.direction = direction;
    }

    let activeTab = null;
    for (const tab of tabs) {
      const isActive = tab.dataset.view === target;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive) {
        activeTab = tab;
        if (focusTab) {
          tab.focus();
        }
      }
    }

    updateIndicator(activeTab);

    for (const panel of panels) {
      const isActive = panel.dataset.panel === target;
      panel.classList.toggle('is-hidden', !isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
      panel.inert = !isActive;
      panel.classList.remove('is-entering');
      if (isActive && animate) {
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
    }

    document.title = viewTitles[target] || defaultTitle;

    if (historyMode !== 'none') {
      const nextUrl = target === defaultView
        ? `${window.location.pathname}${window.location.search}`
        : `${window.location.pathname}${window.location.search}#${target}`;
      if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
        const method = historyMode === 'replace' ? 'replaceState' : 'pushState';
        window.history[method]({ view: target }, '', nextUrl);
      }
    }
  };

  nav.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-view]');
    if (!tab || !nav.contains(tab)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    setActiveView(tab.dataset.view, { historyMode: 'push', animate: true });
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
      setActiveView(tabs[nextIndex].dataset.view, { historyMode: 'replace', focusTab: true, animate: true });
    }
  });

  window.addEventListener('hashchange', () => setActiveView(viewFromHash(), { animate: true }));
  window.addEventListener('popstate', () => setActiveView(viewFromHash(), { animate: true }));
  window.addEventListener('resize', () => {
    const activeTab = tabs.find((tab) => tab.dataset.view === currentView);
    updateIndicator(activeTab);
  });

  const initialHash = window.location.hash.slice(1).toLowerCase();
  setActiveView(viewFromHash());
  nav.classList.add('has-indicator');
  requestAnimationFrame(() => nav.classList.add('is-indicator-ready'));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const activeTab = tabs.find((tab) => tab.dataset.view === currentView);
      updateIndicator(activeTab);
    });
  }
  if (validViews.has(initialHash)) {
    window.scrollTo(0, 0);
  }
};

/* ------------------------------------------------------------
 * Timeline Rail Pointer Highlight
 * ------------------------------------------------------------ */
const initTimelineHighlight = () => {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const hoverQuery = window.matchMedia('(hover: hover)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  timeline.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || !hoverQuery.matches || reducedMotionQuery.matches) return;
    const rect = timeline.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    timeline.style.setProperty('--timeline-pointer-y', `${y.toFixed(1)}px`);
    timeline.classList.add('is-pointer-active');
  });

  timeline.addEventListener('pointerleave', () => {
    timeline.classList.remove('is-pointer-active');
  });
};

initViewSwitcher();
initTimelineHighlight();
