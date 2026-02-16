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
  }
  
  static get observedAttributes() {
    return ['name', 'bio'];
  }
  
  connectedCallback() {
    // Don't use shadow DOM for this component since it needs to interact
    // with existing CSS and contain other web components
    this.render();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }
  
  render() {
    const name = this.getAttribute('name') || 'Stuart Neivandt';
    const bioText = this.getAttribute('bio') || 'Building secure distributed systems at Microsoft. Based in Bellevue, WA.';
    
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
          <div class="typed-container">
            <div class="visually-hidden" data-nosnippet>
              <ul id="typed-strings">
                <li>Software Engineer</li>
                <li>Music Enthusiast</li>
                <li>Chess Player</li>
                <li>Continuous Learner</li>
                <li>Coffee Addict</li>
                <li>Mediocre Investor</li>
              </ul>
            </div>
            <span id="typed" class="typed" aria-hidden="true">
              <typewriter-effect 
                strings="Software Engineer,Music Enthusiast,Chess Player,Continuous Learner,Coffee Addict,Mediocre Investor"
                loop="true"
                type-speed="60"
                back-speed="30"
                back-delay="2000"
                start-delay="500"
                fallback="Software Engineer">
              </typewriter-effect>
            </span>
          </div>
          <div class="bio-text">
            <p class="bio-paragraph"></p>
          </div>
          <social-links></social-links>
        </div>
      </div>
    `;
    
    // Safely add bio text with nowrap span using DOM manipulation
    const bioParagraph = this.querySelector('.bio-paragraph');
    if (bioParagraph) {
      // Split the bio text at "Bellevue, WA." to add nowrap span
      const parts = bioText.split('Bellevue, WA.');
      if (parts.length > 1) {
        bioParagraph.textContent = parts[0];
        const nowrapSpan = document.createElement('span');
        nowrapSpan.className = 'nowrap';
        nowrapSpan.textContent = 'Bellevue, WA.';
        bioParagraph.appendChild(nowrapSpan);
        bioParagraph.appendChild(document.createTextNode(parts.slice(1).join('Bellevue, WA.')));
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register the custom element
customElements.define('profile-card', ProfileCardComponent);
