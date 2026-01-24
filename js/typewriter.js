/**
 * @module Typewriter
 * @description A dependency-free typewriter effect for text elements.
 */

/**
 * Typewriter class
 * Animates text typing and deleting.
 */
export class Typewriter {
  /**
   * Creates an instance of Typewriter.
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
    /** @type {HTMLElement} */
    this.element = element;
    
    /** @type {string[]} */
    this.strings = strings;
    
    /** @type {boolean} */
    this.loop = loop;
    
    /** @type {number} */
    this.typeSpeed = typeSpeed;
    
    /** @type {number} */
    this.backSpeed = backSpeed;
    
    /** @type {number} */
    this.backDelay = backDelay;

    /** @type {Object} */
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

    // Start initialization after delay
    this.timeout = window.setTimeout(() => this.init(), startDelay);
  }

  /**
   * Initializes the typewriter and cursor element.
   * @private
   */
  init() {
    if (this.state.isPaused) return;

    // Create and inject cursor
    this.cursor = document.createElement('span');
    this.cursor.className = 'typed-cursor';
    this.cursor.textContent = '|';
    this.cursor.ariaHidden = 'true';
    
    if (this.element.parentNode) {
      this.element.parentNode.insertBefore(this.cursor, this.element.nextSibling);
    }
    
    // Start the loop
    this.tick();
  }

  /**
   * Main animation loop handle.
   * @private
   */
  tick() {
    if (this.state.isPaused) return;

    const currentString = this.strings[this.state.textIndex];
    if (!currentString) return;

    // Update character index based on direction
    if (this.state.isDeleting) {
      this.state.charIndex--;
    } else {
      this.state.charIndex++;
    }

    // Render current substring
    this.element.textContent = currentString.substring(0, this.state.charIndex);

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

  /**
   * Stops the typewriter animation and cleans up resources.
   * @public
   */
  destroy() {
    this.state.isPaused = true;
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    // Remove cursor from DOM
    if (this.cursor && this.cursor.parentNode) {
      this.cursor.remove();
    }
    this.cursor = null;

    // Clear text content
    if (this.element) {
        this.element.textContent = '';
    }
  }
}
