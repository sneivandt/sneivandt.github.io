/**
 * @module ProfileCardComponent
 * @description A web component for displaying profile information.
 */

/**
 * ProfileCard Web Component
 * Usage: <profile-card name="..." bio="..."></profile-card>
 */
export class ProfileCardComponent extends HTMLElement {
  constructor() {
    super();
    
    /** @type {HTMLElement|null} */
    this._escapeDiv = null;
  }
  
  static get observedAttributes() {
    return ['name', 'bio'];
  }
  
  connectedCallback() {
    // Don't use shadow DOM for this component since it needs to interact
    // with existing CSS and contain other web components
    this.render();
  }
  
  disconnectedCallback() {
    // No cleanup needed - static content only
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }
  
  render() {
    const name = this.getAttribute('name') || 'Stuart Neivandt';
    const bioText = this.getAttribute('bio') || 'I build secure, reliable distributed systems at Microsoft with a focus on cloud engineering and AI developer tools. Based in Redmond, WA.';
    
    // Escape HTML to prevent XSS
    const escapedName = this.escapeHtml(name);
    
    this.innerHTML = `
      <div class="profile-card">
        <div class="profile-container">
          <div class="profile-image">
            <img src="assets/img/stuart-neivandt.webp" 
                 alt="Portrait of ${escapedName}" 
                 id="profile-img" 
                 width="300" 
                 height="300" 
                 decoding="async" 
                 loading="eager" 
                 fetchpriority="high">
          </div>
        </div>
        <div class="profile-content">
          <h1>${escapedName}</h1>
          <div class="bio-text">
            <p class="bio-paragraph"></p>
          </div>
          <ul class="highlight-chips" aria-label="Profile highlights">
            <li>Software Engineer</li>
            <li>Agent Chaperone</li>
            <li>Husband</li>
            <li>Chess Player</li>
            <li>Music Enthusiast</li>
          </ul>
          <social-links></social-links>
        </div>
      </div>
    `;
    
    // Safely add bio text with nowrap span using DOM manipulation
    const bioParagraph = this.querySelector('.bio-paragraph');
    if (bioParagraph) {
      // Split the bio text at "Redmond, WA." to add nowrap span
      const parts = bioText.split('Redmond, WA.');
      if (parts.length > 1) {
        bioParagraph.textContent = parts[0];
        const nowrapSpan = document.createElement('span');
        nowrapSpan.className = 'nowrap';
        nowrapSpan.textContent = 'Redmond, WA.';
        bioParagraph.appendChild(nowrapSpan);
        bioParagraph.appendChild(document.createTextNode(parts.slice(1).join('Redmond, WA.')));
      } else {
        bioParagraph.textContent = bioText;
      }
    }
  }
  
  /**
   * Escape HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!this._escapeDiv) {
      this._escapeDiv = document.createElement('div');
    }
    this._escapeDiv.textContent = text;
    return this._escapeDiv.innerHTML;
  }
}

// Register the custom element
customElements.define('profile-card', ProfileCardComponent);
