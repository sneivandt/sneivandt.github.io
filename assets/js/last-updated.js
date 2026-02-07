/**
 * @module LastUpdated
 * @description Fetches and displays the last commit date for a GitHub repository.
 */

/**
 * LastUpdated class
 * Updates a DOM element with the formatted date of the last commit.
 */
export class LastUpdated {
  /**
   * Creates an instance of LastUpdated.
   * @param {string} elementId - ID of the element to display the date.
   * @param {Object} [options] - Configuration options.
   * @param {string} [options.repo='sneivandt/sneivandt.github.io'] - Repository in 'owner/repo' format.
   */
  constructor(elementId, options = {}) {
    /** @type {HTMLElement|null} */
    this.element = document.getElementById(elementId);

    /** @type {string} */
    this.repo = options.repo || 'sneivandt/sneivandt.github.io';

    if (this.element) {
      this.showCurrentDate();
      this.init();
      this.setupWrapDetection();
    }
  }

  /**
   * Sets up detection for footer wrapping to hide/show separator.
   * @private
   */
  setupWrapDetection() {
    const checkWrap = () => {
      const copyright = document.querySelector('.copyright-wrapper');
      const separator = document.querySelector('.footer-separator');
      const lastUpdated = this.element;

      if (copyright && separator && lastUpdated) {
        // Check if items are on different lines by comparing vertical positions
        const copyrightTop = copyright.offsetTop;
        const lastUpdatedTop = lastUpdated.offsetTop;
        
        if (copyrightTop !== lastUpdatedTop) {
          separator.style.display = 'none';
        } else {
          separator.style.display = '';
        }
      }
    };

    // Check on load and resize
    window.addEventListener('resize', checkWrap);
    // Initial check after a short delay to ensure layout is complete
    setTimeout(checkWrap, 100);
  }

  /**
   * Shows the current date in the copyright section.
   * @private
   */
  showCurrentDate() {
    const copyrightDate = document.getElementById('copyright-date');
    if (copyrightDate) {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric'
      });
      copyrightDate.textContent = ` ${formatter.format(now)}`;
    }
  }

  /**
   * Fetches the commit data and updates the UI.
   * Uses localStorage cache to minimize API calls.
   * @private
   */
  async init() {
    const cacheKey = `lastUpdated_${this.repo}`;
    const cacheTimeKey = `${cacheKey}_time`;
    const cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds

    try {
      // Check cache first
      const cachedDate = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      
      if (cachedDate && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < cacheExpiry) {
          // Use cached data
          this.render(new Date(cachedDate));
          return;
        }
      }

      // Fetch from API
      const response = await fetch(`https://api.github.com/repos/${this.repo}/commits?per_page=1`);

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0 && data[0].commit) {
        // Use committer date for when the change was actually applied
        const dateStr = data[0].commit.committer.date;
        const date = new Date(dateStr);
        
        // Cache the result
        localStorage.setItem(cacheKey, dateStr);
        localStorage.setItem(cacheTimeKey, Date.now().toString());
        
        this.render(date);
      }
    } catch (error) {
      console.warn('LastUpdated: Failed to fetch date.', error);
      // Hide element on failure
      if (this.element) {
        this.element.style.display = 'none';
      }
    }
  }

  /**
   * Formats and displays the date.
   * @param {Date} date - The date object to format.
   * @private
   */
  render(date) {
    if (!this.element) return;

    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.element.textContent = `Last updated: ${formatter.format(date)}`;

    // Hide the copyright date and year once we have the last updated date
    const copyrightDate = document.getElementById('copyright-date');
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightDate) {
      copyrightDate.textContent = '';
      copyrightDate.style.display = 'none';
    }
    if (copyrightYear) {
      copyrightYear.style.display = 'none';
    }

    // Re-check wrap status after content changes
    setTimeout(() => {
      const copyright = document.querySelector('.copyright-wrapper');
      const separator = document.querySelector('.footer-separator');
      
      if (copyright && separator && this.element) {
        const copyrightTop = copyright.offsetTop;
        const lastUpdatedTop = this.element.offsetTop;
        
        if (copyrightTop !== lastUpdatedTop) {
          separator.style.display = 'none';
        } else {
          separator.style.display = '';
        }
      }
    }, 100);
  }
}
