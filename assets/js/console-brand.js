/**
 * @module ConsoleBrand
 * @description Displays a branded signature in the browser console.
 */

/**
 * ConsoleBrand class
 * Automatically logs a styled signature to the console upon instantiation.
 */
export class ConsoleBrand {
  /**
   * Creates an instance of ConsoleBrand.
   */
  constructor() {
    this.logSignature();
  }

  /**
   * Logs the branded message to the console.
   * @private
   */
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
