/**
 * @module ConnectionStatus
 * @description Monitors and displays network connection status.
 */

/**
 * ConnectionStatus class
 * Displays a temporary offline indicator when network is unavailable.
 */
export class ConnectionStatus {
  /**
   * Creates an instance of ConnectionStatus.
   * @param {string} elementId - The ID of the status indicator element.
   */
  constructor(elementId) {
    /** @type {HTMLElement|null} */
    this.element = document.getElementById(elementId);
    
    if (!this.element) return;

    // Bind methods to preserve context
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);

    // Add event listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Perform initial check
    this.checkConnection();
  }

  /**
   * Handles the 'online' event.
   * @private
   */
  handleOnline() {
    this.checkConnection();
  }

  /**
   * Handles the 'offline' event.
   * @private
   */
  handleOffline() {
    this.show();
  }

  /**
   * Verifies actual internet connectivity by pinging the server.
   * Useful because navigator.onLine can be false positive.
   * @public
   * @returns {Promise<void>}
   */
  async checkConnection() {
    if (!navigator.onLine) {
      this.show();
      return;
    }

    try {
      // HEAD request to minimize data. 
      // Cache-control ensures we test the network, not the cache.
      const response = await fetch(`./?ping=${Date.now()}`, { 
        method: 'HEAD', 
        cache: 'no-store' 
      });
      
      // Treat specific server errors as "connected" to avoid offline badge confusion
      if (!response.ok && response.status !== 405) {
        // e.g. 500 Internall Server Error means we are connected to the server
      }
      
      this.hide();
    } catch (e) {
      // Fetch failed entirely (DNS, network down)
      this.show();
    }
  }

  /**
   * Shows the offline indicator.
   * @private
   */
  show() {
    if (!this.element) return;

    // Clear existing timer if any
    if (this.timer) clearTimeout(this.timer);

    this.element.classList.add('visible');
    this.element.setAttribute('aria-hidden', 'false');

    // Auto-hide after 5 seconds
    this.timer = setTimeout(() => this.hide(), 5000);
  }

  /**
   * Hides the offline indicator.
   * @private
   */
  hide() {
    if (!this.element) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.element.classList.remove('visible');
    this.element.setAttribute('aria-hidden', 'true');
  }
}
