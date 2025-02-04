// Dependencies
import AnJS from './core.js';

// Modules
import './dom.js';
import './traversal.js';
import './attributes.js';
import './events.js';
import './filtering.js';
import './animate.js';
import './state.js';

// Alias methods
import './alias.js';

// Utilities
import http from './request.js';
import utils from './utilities.js';

// Extension Support
import extend from './extend.js';

/**
 * Factory function for creating AnJS instances
 * 
 * @param {string | HTMLElement} selector - CSS selector or element.
 * @returns {AnJS} - AnJS instance.
 */
function $(selector) {

    // New instance of AnJS
    return new AnJS(selector);
}

// Attach utilities to `$`
Object.assign($, http, utils, extend);

// Attach to `window` if in browser
if (typeof window !== "undefined") window.$ = $;

// Export module
export default $;

// Named export
export { $ };