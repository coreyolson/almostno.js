// Dependencies
import AnJS from './core.js';

// Modules
import './animate.js';
import './attributes.js';
import './dom.js';
import './filtering.js';
import './state.js';
import './traversal.js';

// Utilities
import http from './request.js';
import utils from './utilities.js';
import extend from './extend.js';
import components from './component.js';

// AnJS Events System
import { bus } from './events.js';

// AnJS Element System
import './element.js';

// Alias methods
import './alias.js';

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
Object.assign($, bus, http, utils, extend, components);

// Define custom element
$["define"] = (name, componentClass) => customElements.define(name, componentClass);

// Attach to `window` if in browser
if (typeof window !== "undefined") window.$ = $;

// Export module
export default $;

// Named export
export { $ };

/**
 * Feature Improvements:
 * 
 * // TODO: Consider lifecycle hooks (onMount(), onDestroy()) for advanced use cases.
 * // TODO: Consider adding built-in routing for single-page applications.
 */