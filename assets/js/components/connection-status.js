/**
 * @module ConnectionStatusComponent
 * @description A web component that monitors and displays network connection status.
 */

// HTTP Status Codes
const HTTP_STATUS = {
  METHOD_NOT_ALLOWED: 405
};

/**
 * ConnectionStatus Web Component
 * Usage: <connection-status></connection-status>
 */
export class ConnectionStatusComponent extends HTMLElement {
  constructor() {
    super();
    
    /** @type {number|null} */
    this.timer = null;
    
    /** @type {Function|null} */
    this.handleOnline = null;
    
    /** @type {Function|null} */
    this.handleOffline = null;
    
    /** @type {HTMLElement|null} */
    this.statusElement = null;
  }
  
  connectedCallback() {
    // Create shadow DOM (only once)
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    // Render component
    this.render();
    
    // Clean up any existing listeners before adding new ones
    if (this.handleOnline) {
      window.removeEventListener('online', this.handleOnline);
    }
    if (this.handleOffline) {
      window.removeEventListener('offline', this.handleOffline);
    }
    
    // Bind methods to preserve context
    this.handleOnline = this._handleOnline.bind(this);
    this.handleOffline = this._handleOffline.bind(this);
    
    // Add event listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Perform initial check
    this.checkConnection();
  }
  
  disconnectedCallback() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    if (this.handleOnline) {
      window.removeEventListener('online', this.handleOnline);
    }
    
    if (this.handleOffline) {
      window.removeEventListener('offline', this.handleOffline);
    }
  }
  
  render() {
    if (!this.shadowRoot) return;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .offline-status {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: var(--color-accent, #f5f5f5);
          color: var(--color-bg, #111111);
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          opacity: 0;
          transition: all 0.3s ease-out;
          pointer-events: none;
          z-index: 1000;
        }
        
        .offline-status.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      </style>
      
      <div class="offline-status" role="status" aria-hidden="true">
        Offline Mode
      </div>
    `;
    
    // Cache the status element reference
    this.statusElement = this.shadowRoot.querySelector('.offline-status');
  }
  
  _handleOnline() {
    this.checkConnection();
  }
  
  _handleOffline() {
    this.show();
  }
  
  async checkConnection() {
    if (!navigator.onLine) {
      this.show();
      return;
    }
    
    try {
      // HEAD request to minimize data
      // Cache-control ensures we test the network, not the cache
      const response = await fetch(`./?ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store'
      });
      
      // Treat specific server errors as "connected" to avoid offline badge confusion
      if (!response.ok && response.status !== HTTP_STATUS.METHOD_NOT_ALLOWED) {
        // e.g. 500 Internal Server Error means we are connected to the server
      }
      
      this.hide();
    } catch (e) {
      // Fetch failed entirely (DNS, network down)
      this.show();
    }
  }
  
  show() {
    if (!this.statusElement) return;
    
    // Clear existing timer if any
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    this.statusElement.classList.add('visible');
    this.statusElement.setAttribute('aria-hidden', 'false');
    
    // Auto-hide after 5 seconds
    this.timer = window.setTimeout(() => {
      // Check element still exists before accessing
      if (this.statusElement) {
        this.hide();
      }
    }, 5000);
  }
  
  hide() {
    if (!this.statusElement) return;
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    this.statusElement.classList.remove('visible');
    this.statusElement.setAttribute('aria-hidden', 'true');
  }
}

// Register the custom element
customElements.define('connection-status', ConnectionStatusComponent);
