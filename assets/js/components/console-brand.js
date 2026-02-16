/**
 * @module ConsoleBrandComponent
 * @description A web component that displays a branded signature in the browser console.
 */

/**
 * ConsoleBrand Web Component
 * Usage: <console-brand></console-brand>
 */
export class ConsoleBrandComponent extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    // Log signature immediately when connected
    this.logSignature();
  }
  
  disconnectedCallback() {
    // No cleanup needed - console logs persist
  }
  
  logSignature() {
    const style = [
      'background: #222',
      'color: #fff',
      'padding: 4px 8px',
      'border-radius: 4px',
      'font-family: monospace'
    ].join(';');
    
    const linkStyle = 'font-family: monospace; margin-left: 8px;';
    
    console.log(
      '%cWelcome to my site!%c https://github.com/sneivandt/sneivandt.github.io',
      style,
      linkStyle
    );
  }
}

// Register the custom element
customElements.define('console-brand', ConsoleBrandComponent);
