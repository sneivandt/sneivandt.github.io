/**
 * Handles share button functionality.
 * Uses native share API when available, falls back to clipboard.
 * @class
 */
export class ShareButton {
  constructor() {
    this.btn = document.getElementById('share-btn');
    this.toast = document.getElementById('share-toast');
    this.toastTimeout = null;
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
   * Initialize event listeners
   * @private
   */
  init() {
    this.btn.addEventListener('click', () => this.handleShare());
  }

  /**
   * Handle the share action
   * @private
   */
  async handleShare() {
    // Try Native Share API first (Mobile/Supported Browsers)
    if (navigator.share) {
      try {
        await navigator.share(this.shareData);
        return; // Success
      } catch (err) {
        // If user cancelled, do nothing. If error, fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Clipboard API
    this.copyToClipboard();
  }

  /**
   * Access clipboard to copy link
   * @private
   */
  async copyToClipboard() {
    try {
      // Smart Clipboard:
      // 1. Plain Text = URL only (better for address bars)
      // 2. HTML = Rich Link (better for documents/emails)
      if (typeof ClipboardItem !== 'undefined') {
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
        // Legacy fallback: Just simple URL
        await navigator.clipboard.writeText(this.shareData.url);
      }

      this.showToast();
    } catch (err) {
      console.warn('Rich copy failed, falling back to text', err);
      // Last resort: simple writeText if the complex write failed
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

    // Clear existing timeout to prevent premature hiding
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    // Reset animation if needed
    this.toast.classList.remove('visible');

    // Force reflow
    void this.toast.offsetWidth;

    this.toast.classList.add('visible');

    // Auto hide
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 3000);
  }
}
