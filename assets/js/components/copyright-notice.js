/**
 * @module CopyrightNoticeComponent
 * @description A web component that displays copyright information with the current year.
 */

/**
 * CopyrightNotice Web Component
 * Usage: <copyright-notice name="Stuart Neivandt"></copyright-notice>
 */
export class CopyrightNoticeComponent extends HTMLElement {
  static DEFAULT_NAME = 'Stuart Neivandt';
  
  constructor() {
    super();
    
    /** @type {string} */
    this.copyrightName = CopyrightNoticeComponent.DEFAULT_NAME;
  }
  
  static get observedAttributes() {
    return ['name'];
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
  }
  
  disconnectedCallback() {
    // No cleanup needed - static content only
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'name') {
      this.copyrightName = newValue || CopyrightNoticeComponent.DEFAULT_NAME;
      if (this.shadowRoot) {
        this.render();
      }
    }
  }
  
  parseAttributes() {
    this.copyrightName = this.getAttribute('name') || CopyrightNoticeComponent.DEFAULT_NAME;
  }
  
  render() {
    const currentYear = new Date().getFullYear();
    
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
      <span>© ${currentYear} ${this.copyrightName}</span>
    `;
  }
}

// Register the custom element
customElements.define('copyright-notice', CopyrightNoticeComponent);
