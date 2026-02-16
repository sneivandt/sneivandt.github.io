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
    const bio = this.getAttribute('bio') || 'Building secure distributed systems at Microsoft. Based in <span class="nowrap">Bellevue, WA.</span>';
    
    this.innerHTML = `
      <div class="profile-card">
        <div class="profile-container">
          <div class="profile-image">
            <img src="assets/img/stuart-neivandt.webp" 
                 alt="Portrait of ${name}" 
                 id="profile-img" 
                 width="300" 
                 height="300" 
                 decoding="async" 
                 loading="eager" 
                 fetchpriority="high">
          </div>
        </div>
        <div class="profile-content">
          <h1>${name}</h1>
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
            <span id="typed-placeholder" class="typed" aria-live="polite">
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
            <noscript><span class="typed">Software Engineer</span></noscript>
          </div>
          <div class="bio-text">
            <p>${bio}</p>
          </div>
          <social-links></social-links>
        </div>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('profile-card', ProfileCardComponent);
