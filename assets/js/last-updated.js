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
      this.init();
    }
  }

  /**
   * Fetches the commit data and updates the UI.
   * @private
   */
  async init() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repo}/commits?per_page=1`);
      
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0 && data[0].commit) {
        // Use committer date for when the change was actually applied
        const dateStr = data[0].commit.committer.date;
        const date = new Date(dateStr);
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
  }
}
