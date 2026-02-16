/**
 * @module TypewriterEffect
 * @description A web component that provides a typewriter animation effect.
 */

/**
 * TypewriterEffect Web Component
 * Usage: <typewriter-effect strings="Software Engineer,Music Enthusiast,Chess Player"></typewriter-effect>
 */
export class TypewriterEffect extends HTMLElement {
  constructor() {
    super();
    
    /** @type {string[]} */
    this.strings = [];
    
    /** @type {boolean} */
    this.loop = true;
    
    /** @type {number} */
    this.typeSpeed = 60;
    
    /** @type {number} */
    this.backSpeed = 30;
    
    /** @type {number} */
    this.backDelay = 2000;
    
    /** @type {number} */
    this.startDelay = 500;
    
    /** @type {{textIndex: number, charIndex: number, isDeleting: boolean, isPaused: boolean}} */
    this.state = {
      textIndex: 0,
      charIndex: 0,
      isDeleting: false,
      isPaused: false
    };
    
    /** @type {HTMLElement|null} */
    this.textSpan = null;
    
    /** @type {HTMLElement|null} */
    this.cursor = null;
    
    /** @type {number|null} */
    this.timeout = null;
    
    /** @type {MediaQueryList|null} */
    this.motionQuery = null;
  }
  
  static get observedAttributes() {
    return ['strings', 'loop', 'type-speed', 'back-speed', 'back-delay', 'start-delay', 'fallback'];
  }
  
  connectedCallback() {
    // Parse attributes
    this.parseAttributes();
    
    // Create shadow DOM (only once)
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      
      // Add styles
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline;
          }
          
          .typed-cursor {
            animation: blink 1s infinite;
            opacity: 1;
            user-select: none;
          }
          
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
          
          @media (prefers-reduced-motion: reduce) {
            .typed-cursor {
              animation: none;
              opacity: 1;
            }
          }
        </style>
        <span class="typed-text" aria-hidden="true"></span><span class="typed-cursor" aria-hidden="true">|</span>
      `;
      
      this.textSpan = this.shadowRoot.querySelector('.typed-text');
      this.cursor = this.shadowRoot.querySelector('.typed-cursor');
    }
    
    // Check for reduced motion preference
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.handleMotionPreference = this.handleMotionPreference.bind(this);
    
    if (this.motionQuery.matches) {
      this.setFallbackText();
    } else {
      // Start after delay
      this.timeout = window.setTimeout(() => this.tick(), this.startDelay);
    }
    
    this.motionQuery.addEventListener('change', this.handleMotionPreference);
  }
  
  disconnectedCallback() {
    this.destroy();
    if (this.motionQuery) {
      this.motionQuery.removeEventListener('change', this.handleMotionPreference);
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'strings':
        this.strings = newValue ? newValue.split(',').map(s => s.trim()) : [];
        break;
      case 'loop':
        this.loop = newValue !== 'false';
        break;
      case 'type-speed':
        this.typeSpeed = parseInt(newValue, 10) || 60;
        break;
      case 'back-speed':
        this.backSpeed = parseInt(newValue, 10) || 30;
        break;
      case 'back-delay':
        this.backDelay = parseInt(newValue, 10) || 2000;
        break;
      case 'start-delay':
        this.startDelay = parseInt(newValue, 10) || 500;
        break;
    }
  }
  
  parseAttributes() {
    const stringsAttr = this.getAttribute('strings');
    this.strings = stringsAttr ? stringsAttr.split(',').map(s => s.trim()) : [];
    
    this.loop = this.getAttribute('loop') !== 'false';
    this.typeSpeed = parseInt(this.getAttribute('type-speed'), 10) || 60;
    this.backSpeed = parseInt(this.getAttribute('back-speed'), 10) || 30;
    this.backDelay = parseInt(this.getAttribute('back-delay'), 10) || 2000;
    this.startDelay = parseInt(this.getAttribute('start-delay'), 10) || 500;
  }
  
  handleMotionPreference(e) {
    if (e.matches) {
      this.destroy();
      this.setFallbackText();
    } else {
      // Restart animation - restore cursor visibility
      if (this.cursor) {
        this.cursor.style.display = '';
      }
      this.state = {
        textIndex: 0,
        charIndex: 0,
        isDeleting: false,
        isPaused: false
      };
      this.timeout = window.setTimeout(() => this.tick(), this.startDelay);
    }
  }
  
  setFallbackText() {
    if (this.textSpan) {
      const fallback = this.getAttribute('fallback') || (this.strings[0] || 'Software Engineer');
      this.textSpan.textContent = fallback;
    }
    if (this.cursor) {
      this.cursor.style.display = 'none';
    }
  }
  
  tick() {
    if (this.state.isPaused || !this.textSpan) return;
    
    const currentString = this.strings[this.state.textIndex];
    if (!currentString) return;
    
    // Update character index based on direction
    if (this.state.isDeleting) {
      this.state.charIndex--;
    } else {
      this.state.charIndex++;
    }
    
    // Render current substring
    this.textSpan.textContent = currentString.substring(0, this.state.charIndex);
    
    // Calculate delay for next tick
    let delta = this.state.isDeleting ? this.backSpeed : this.typeSpeed;
    
    if (!this.state.isDeleting && this.state.charIndex === currentString.length) {
      // Completed typing the string
      delta = this.backDelay;
      this.state.isDeleting = true;
    } else if (this.state.isDeleting && this.state.charIndex === 0) {
      // Completed deleting the string
      this.state.isDeleting = false;
      this.state.textIndex++;
      delta = 500; // Small pause before next string
      
      // Handle loop logic
      if (this.state.textIndex >= this.strings.length) {
        if (this.loop) {
          this.state.textIndex = 0;
        } else {
          // Finished all strings and no loop
          this.state.isPaused = true;
          return;
        }
      }
    }
    
    this.timeout = window.setTimeout(() => this.tick(), delta);
  }
  
  destroy() {
    this.state.isPaused = true;
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

// Register the custom element
customElements.define('typewriter-effect', TypewriterEffect);
