/**
 * Typewriter Effect
 * A lightweight, dependency-free typewriter effect.
 * @class
 */
export default class typewriter {
  /**
   * @param {HTMLElement} element - The DOM element to type into.
   * @param {string[]} strings - Array of strings to type.
   * @param {Object} [options={}] - Configuration options.
   * @param {boolean} [options.loop=false] - Whether to loop the strings.
   * @param {number} [options.typeSpeed=50] - Typing speed in ms.
   * @param {number} [options.backSpeed=30] - Deleting speed in ms.
   * @param {number} [options.startDelay=0] - Delay before starting in ms.
   * @param {number} [options.backDelay=2000] - Pause before deleting in ms.
   */
  constructor(element, strings, {
    loop = false,
    typeSpeed = 50,
    backSpeed = 30,
    startDelay = 0,
    backDelay = 2000
  } = {}) {
    this.element = element;
    this.strings = strings;
    this.loop = loop;
    this.typeSpeed = typeSpeed;
    this.backSpeed = backSpeed;
    this.backDelay = backDelay;

    this.state = {
      textIndex: 0,
      charIndex: 0,
      isDeleting: false,
      isPaused: false
    };

    /** @type {HTMLElement|null} */
    this.cursor = null;
    /** @type {number|null} */
    this.timeout = null;

    // Start with delay
    this.timeout = setTimeout(() => this.init(), startDelay);
  }

  /**
   * Initializes the typewriter and cursor element.
   * @private
   */
  init() {
    if (this.state.isPaused) return;

    // create cursor
    this.cursor = document.createElement('span');
    this.cursor.className = 'typed-cursor';
    this.cursor.textContent = '|';
    this.cursor.ariaHidden = 'true';
    
    // Inject cursor after the element
    if (this.element.parentNode) {
      this.element.parentNode.insertBefore(this.cursor, this.element.nextSibling);
    }
    
    this.tick();
  }

  /**
   * Main animation loop that handles typing and deleting.
   * @private
   */
  tick() {
    if (this.state.isPaused) return;

    const currentString = this.strings[this.state.textIndex];
    if (!currentString) return;

    // Determine state change
    if (this.state.isDeleting) {
      this.state.charIndex--;
    } else {
      this.state.charIndex++;
    }

    // Render text
    this.element.textContent = currentString.substring(0, this.state.charIndex);

    // Calculate next delay
    let delta = this.state.isDeleting ? this.backSpeed : this.typeSpeed;

    if (!this.state.isDeleting && this.state.charIndex === currentString.length) {
      // Finished typing string
      delta = this.backDelay;
      this.state.isDeleting = true;
    } else if (this.state.isDeleting && this.state.charIndex === 0) {
      // Finished deleting string
      this.state.isDeleting = false;
      this.state.textIndex++;
      delta = 500; // Pause before next string

      if (this.state.textIndex >= this.strings.length) {
        if (this.loop) {
          this.state.textIndex = 0;
        } else {
          // Stop
          this.state.isPaused = true;
          // Optionally remove cursor here if desired:
          // if (this.cursor) this.cursor.remove();
          return;
        }
      }
    }

    this.timeout = setTimeout(() => this.tick(), delta);
  }

  /**
   * Stops the typewriter animation and cleans up resources.
   * @public
   */
  destroy() {
    this.state.isPaused = true;
    if (this.timeout) clearTimeout(this.timeout);
    
    // Clean up DOM
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.remove();
    }
    this.cursor = null;

    // Reset text
    if (this.element) {
        this.element.textContent = '';
    }
  }
}
