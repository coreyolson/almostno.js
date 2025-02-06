// Dependencies
import AnJS from './core.js';

// Modules
import './animate.js';
import './attributes.js';
import './dom.js';
import './events.js';
import './filtering.js';
import './state.js';
import './traversal.js';

// Alias methods
import './alias.js';

// Utilities
import http from './request.js';
import utils from './utilities.js';
import extend from './extend.js';
import components from './component.js';

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

// AnJS methods that should be accessible via `$`
["on", "off", "trigger", "state", "global", "component"].forEach(method => {

    // Dynamically assign methods to `$`
    $[method] = (...args) => AnJS.prototype[method].apply($(), args);
});

// Attach utilities to `$`
Object.assign($, http, utils, extend, components);

// Attach to `window` if in browser
if (typeof window !== "undefined") window.$ = $;

// Export module
export default $;

// Named export
export { $ };