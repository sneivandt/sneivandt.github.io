/**
 * @module ShareButton
 * @description Handles sharing functionality via the Web Share API or Clipboard API.
 */

/**
 * ShareButton class
 * Manages the share button click event and provides fallback for unsupported browsers.
 */
export class ShareButton {
  /**
   * Creates an instance of ShareButton.
   * @param {string} buttonId - The ID of the share button element.
   * @param {string} toastId - The ID of the toast notification element.
   */
  constructor(buttonId = 'share-btn', toastId = 'share-toast') {
    /** @type {HTMLElement|null} */
    this.btn = document.getElementById(buttonId);
    
    /** @type {HTMLElement|null} */
    this.toast = document.getElementById(toastId);
    
    /** @type {number|null} */
    this.toastTimeout = null;
    
    /** @type {ShareData} */
    this.shareData = {
      title: 'Stuart Neivandt | Software Engineer',
      text: 'Check out Stuart Neivandt\'s profile.',
      url: window.location.href
    };

    if (this.btn) {
      this.init();
    }
  }

  /**
   * Initializes event listeners.
   * @private
   */
  init() {
    this.btn.addEventListener('click', () => this.handleShare());
  }

  /**
   * Handles the share action.
   * Tries Web Share API first, falls back to Clipboard API.
   * @private
   * @returns {Promise<void>}
   */
  async handleShare() {
    // Try Native Share API first (Mobile/Supported Browsers)
    if (navigator.share) {
      try {
        await navigator.share(this.shareData);
        return;
      } catch (err) {
        // If user cancelled, do nothing.
        if (err.name === 'AbortError') return;
        // If other error, fall through to clipboard
        console.warn('Share API failed, falling back to clipboard:', err);
      }
    }

    // Fallback
    await this.copyToClipboard();
  }

  /**
   * Copies the URL to the clipboard.
   * Uses the Clipboard API with a fallback for older implementations.
   * @private
   * @returns {Promise<void>}
   */
  async copyToClipboard() {
    try {
      if (typeof ClipboardItem !== 'undefined') {
        // Modern approach: Write rich text (HTML) and plain text
        const textBlob = new Blob([this.shareData.url], { type: 'text/plain' });
        const htmlBlob = new Blob(
          [`<a href="${this.shareData.url}">${this.shareData.title}</a>`],
          { type: 'text/html' }
        );

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob
          })
        ]);
      } else {
        // Legacy fallback: Simple text
        await navigator.clipboard.writeText(this.shareData.url);
      }

      this.showToast();
    } catch (err) {
      console.warn('Rich copy failed, attempting simple text fallback', err);
      try {
        await navigator.clipboard.writeText(this.shareData.url);
        this.showToast();
      } catch (err2) {
        console.error('All copy methods failed', err2);
      }
    }
  }

  /**
   * Displays the toast notification.
   * @private
   */
  showToast() {
    if (!this.toast) return;

    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Reset animation
    this.toast.classList.remove('visible');
    void this.toast.offsetWidth; // Force reflow
    this.toast.classList.add('visible');

    // Auto hide after 3 seconds
    this.toastTimeout = window.setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 3000);
  }
}
