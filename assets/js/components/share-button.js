/**
 * @module ShareButtonComponent
 * @description A web component for sharing functionality via Web Share API or Clipboard API.
 */

/**
 * ShareButton Web Component
 * Usage: <share-button title="..." text="..." url="..."></share-button>
 */
export class ShareButtonComponent extends HTMLElement {
  constructor() {
    super();
    
    /** @type {number|null} */
    this.toastTimeout = null;
    
    /** @type {Function|null} */
    this.handleShareBound = null;
    
    /** @type {{title: string, text: string, url: string}} */
    this.shareData = {
      title: '',
      text: '',
      url: window.location.href
    };
    
    /** @type {HTMLElement|null} */
    this.buttonElement = null;
    
    /** @type {HTMLElement|null} */
    this.toastElement = null;
  }
  
  static get observedAttributes() {
    return ['title', 'text', 'url'];
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
    
    // Clean up existing listener if any
    if (this.buttonElement && this.handleShareBound) {
      this.buttonElement.removeEventListener('click', this.handleShareBound);
    }
    
    // Set up event listeners
    if (this.buttonElement) {
      this.handleShareBound = () => this.handleShare();
      this.buttonElement.addEventListener('click', this.handleShareBound);
    }
  }
  
  disconnectedCallback() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    
    // Clean up event listener
    if (this.buttonElement && this.handleShareBound) {
      this.buttonElement.removeEventListener('click', this.handleShareBound);
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'title':
        this.shareData.title = newValue || '';
        break;
      case 'text':
        this.shareData.text = newValue || '';
        break;
      case 'url':
        this.shareData.url = newValue || window.location.href;
        break;
    }
  }
  
  parseAttributes() {
    this.shareData.title = this.getAttribute('title') || 'Stuart Neivandt | Software Engineer';
    this.shareData.text = this.getAttribute('text') || 'Check out Stuart Neivandt\'s profile.';
    this.shareData.url = this.getAttribute('url') || window.location.href;
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .share-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          border: 1px solid var(--color-border, rgba(255, 255, 255, 0.15));
          background: var(--color-bg-alt, #161616);
          color: var(--color-accent, #f5f5f5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-out;
          z-index: 100;
        }
        
        .share-btn:hover {
          background: var(--color-accent, #f5f5f5);
          color: var(--color-bg, #111111);
          transform: scale(1.1);
        }
        
        .share-btn:focus-visible {
          outline: 1px solid var(--color-accent, #f5f5f5);
          outline-offset: 4px;
        }
        
        .share-btn svg {
          width: 24px;
          height: 24px;
        }
        
        .toast {
          position: fixed;
          bottom: 7rem;
          right: 2rem;
          background: var(--color-accent, #f5f5f5);
          color: var(--color-bg, #111111);
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease-out;
          pointer-events: none;
          z-index: 101;
        }
        
        .toast.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .share-btn {
            bottom: 1.5rem;
            right: 1.5rem;
          }
          
          .toast {
            bottom: 6rem;
            right: 1.5rem;
          }
        }
      </style>
      
      <button class="share-btn" aria-label="Share contact info">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
      </button>
      
      <div class="toast" role="status" aria-live="polite" aria-hidden="true">Link copied to clipboard</div>
    `;
    
    // Cache element references
    this.buttonElement = this.shadowRoot.querySelector('.share-btn');
    this.toastElement = this.shadowRoot.querySelector('.toast');
  }
  
  async handleShare() {
    // Try Native Share API first (Mobile/Supported Browsers)
    if (navigator.share) {
      try {
        await navigator.share(this.shareData);
        return;
      } catch (err) {
        // If user cancelled, do nothing
        if (err.name === 'AbortError') return;
        // If other error, fall through to clipboard
        console.warn('Share API failed, falling back to clipboard:', err);
      }
    }
    
    // Fallback to clipboard
    await this.copyToClipboard();
  }
  
  async copyToClipboard() {
    // Check if clipboard API is available
    if (!navigator.clipboard) {
      console.warn('Clipboard API not available');
      return;
    }
    
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
  
  showToast() {
    if (!this.toastElement) return;
    
    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    
    // Reset animation and make visible to screen readers
    this.toastElement.classList.remove('visible');
    this.toastElement.setAttribute('aria-hidden', 'false');
    void this.toastElement.offsetWidth; // Force reflow
    this.toastElement.classList.add('visible');
    
    // Auto hide after 3 seconds
    this.toastTimeout = window.setTimeout(() => {
      this.toastElement.classList.remove('visible');
      this.toastElement.setAttribute('aria-hidden', 'true');
    }, 3000);
  }
}

// Register the custom element
customElements.define('share-button', ShareButtonComponent);
