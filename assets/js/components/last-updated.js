/**
 * @module LastUpdatedComponent
 * @description A web component that fetches and displays the last commit date for a GitHub repository.
 */

/**
 * LastUpdated Web Component
 * Usage: <last-updated repo="owner/repo"></last-updated>
 */
export class LastUpdatedComponent extends HTMLElement {
  constructor() {
    super();
    
    /** @type {string} */
    this.repo = 'sneivandt/sneivandt.github.io';
    
    /** @type {Function|null} */
    this.resizeHandler = null;
    
    /** @type {number|null} */
    this.wrapTimeout = null;
  }
  
  static get observedAttributes() {
    return ['repo'];
  }
  
  connectedCallback() {
    // Parse attributes
    this.parseAttributes();
    
    // Create shadow DOM (only once)
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    // Render component
    this.render();
    
    // Fetch and display last updated date
    this.init();
    this.setupWrapDetection();
  }
  
  disconnectedCallback() {
    // Clean up resize listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    // Clean up any pending timeouts
    if (this.wrapTimeout) {
      clearTimeout(this.wrapTimeout);
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'repo') {
      this.repo = newValue || 'sneivandt/sneivandt.github.io';
    }
  }
  
  parseAttributes() {
    this.repo = this.getAttribute('repo') || 'sneivandt/sneivandt.github.io';
  }
  
  /**
   * Validate GitHub API commit data structure
   * @param {any} data - Data from GitHub API
   * @returns {string|null} Commit date string if valid, null otherwise
   */
  extractCommitDate(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const commit = data[0];
    if (!commit?.commit?.committer?.date) {
      return null;
    }
    
    return commit.commit.committer.date;
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline;
          opacity: 0.7;
          font-size: 0.8rem;
          font-weight: 300;
          color: var(--color-text-muted, #888888);
        }
      </style>
      <span class="last-updated-text"></span>
    `;
  }
  
  setupWrapDetection() {
    // Clean up existing listener if any
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    this.resizeHandler = () => {
      const copyright = document.querySelector('copyright-notice');
      const separator = document.querySelector('.footer-separator');
      
      if (!copyright || !separator || !this) return;
      
      // Check if items are on different lines by comparing vertical positions
      const copyrightTop = copyright.offsetTop;
      const thisTop = this.offsetTop;
      
      if (copyrightTop !== thisTop) {
        separator.style.display = 'none';
      } else {
        separator.style.display = '';
      }
    };
    
    // Check on load and resize
    window.addEventListener('resize', this.resizeHandler);
    // Initial check after a short delay to ensure layout is complete
    if (this.wrapTimeout) {
      clearTimeout(this.wrapTimeout);
    }
    this.wrapTimeout = setTimeout(this.resizeHandler, 100);
  }
  
  async init() {
    const cacheKey = `lastUpdated_${this.repo}`;
    const cacheTimeKey = `${cacheKey}_time`;
    const cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
    
    try {
      // Check cache first
      let cachedDate = null;
      let cachedTime = null;
      
      try {
        cachedDate = localStorage.getItem(cacheKey);
        cachedTime = localStorage.getItem(cacheTimeKey);
      } catch (storageError) {
        // localStorage may be unavailable or disabled
      }
      
      if (cachedDate && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < cacheExpiry) {
          // Use cached data
          this.renderDate(new Date(cachedDate));
          return;
        }
      }
      
      // Fetch from API
      const response = await fetch(`https://api.github.com/repos/${this.repo}/commits?per_page=1`);
      
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const dateStr = this.extractCommitDate(data);
      
      if (dateStr) {
        const date = new Date(dateStr);
        
        // Validate date
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date received from API');
        }
        
        // Cache the result
        try {
          localStorage.setItem(cacheKey, dateStr);
          localStorage.setItem(cacheTimeKey, Date.now().toString());
        } catch (storageError) {
          // localStorage may be full or disabled - continue without caching
        }
        
        this.renderDate(date);
      }
    } catch (error) {
      console.warn('LastUpdated: Failed to fetch date.', error);
      // Hide element on failure
      this.style.display = 'none';
    }
  }
  
  renderDate(date) {
    if (!this.shadowRoot) return;
    
    const textSpan = this.shadowRoot.querySelector('.last-updated-text');
    if (!textSpan) return;
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    textSpan.textContent = `Last updated: ${formatter.format(date)}`;
    
    // Re-check wrap status after content changes
    if (this.resizeHandler && this.wrapTimeout) {
      clearTimeout(this.wrapTimeout);
    }
    this.wrapTimeout = setTimeout(this.resizeHandler, 100);
  }
}

// Register the custom element
customElements.define('last-updated', LastUpdatedComponent);
