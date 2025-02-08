// Ensure feature flags exist at runtime
if (typeof FEATURE_HTTP === "undefined") globalThis.FEATURE_HTTP = true;
if (typeof FEATURE_ANIMATE === "undefined") globalThis.FEATURE_ANIMATE = true;
if (typeof FEATURE_SELECTION === "undefined") globalThis.FEATURE_SELECTION = true;
if (typeof FEATURE_FILTERING === "undefined") globalThis.FEATURE_FILTERING = true;
if (typeof FEATURE_TRAVERSAL === "undefined") globalThis.FEATURE_TRAVERSAL = true;
if (typeof FEATURE_STATE === "undefined") globalThis.FEATURE_STATE = true;
if (typeof FEATURE_COMPONENTS === "undefined") globalThis.FEATURE_COMPONENTS = true;
if (typeof FEATURE_ELEMENTS === "undefined") globalThis.FEATURE_ELEMENTS = true;

// Dependencies
import AnJS from './core.js';

// Modules
import './dom.js';
import './attributes.js';
import './events.js';
import './alias.js';

// Utilities
import utils from './utilities.js';
import extend from './extend.js';

// AnJS Events System
import { bus } from './events.js';

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
["on", "off", "trigger"].forEach(method => {

    // Dynamically assign methods to `$`
    $[method] = (...args) => AnJS.prototype[method].apply($(), args);
});

/**
 * Dynamic Imports (Only Load If Enabled)
 * 
 * @constant {boolean} FEATURE_SELECTION - Feature flag for selection module.
 * @constant {boolean} FEATURE_STATE - Feature flag for state module.
 * @constant {boolean} FEATURE_COMPONENTS - Feature flag for components module.
 * @constant {boolean} FEATURE_ELEMENTS - Feature flag for elements module.
 * @constant {boolean} FEATURE_HTTP - Feature flag for HTTP module.
 * @constant {boolean} FEATURE_ANIMATE - Feature flag for animate module.
 * @constant {boolean} FEATURE_FILTERING - Feature flag for filtering module.
 * @constant {boolean} FEATURE_TRAVERSAL - Feature flag for traversal module.
 */

// Feature flag: Selection
if (FEATURE_SELECTION) {

    // Dynamic import of filtering
    import('./filtering.js').then(mod => Object.assign($, mod));

    // Dynamic import of traversal
    import('./traversal.js').then(mod => Object.assign($, mod));
}

// Dynamically import "State" module
if (FEATURE_STATE) import('./state.js').then(() => { 
    
    /// Attach state functions dynamically
    ["state", "global"].forEach(module => {

        // Dynamically assign methods to `$`
        $[module] = (...args) => AnJS.prototype[module].apply($(), args);
    });
});

// Dynamically import "Component" module
if (FEATURE_COMPONENTS) {

    // Perform the file import
    import('./component.js').then(mod => {

        // Attach component methods dynamically
        ["component"].forEach(module => {

            // Dynamically assign methods to `$`
            $[module] = (...args) => AnJS.prototype[module].apply($(), args);
        });

        // Attach $.define only if the module is loaded
        $.define = (name, componentClass) => customElements.define(name, componentClass);
    });
}

// Dynamically import "Element" module
if (FEATURE_ELEMENTS) import('./element.js');

// Dynamically import "HTTP" module
if (FEATURE_HTTP) import ('./request.js').then(mod => {

    // Attach HTTP utilities
    Object.assign($, mod.http);  
});

// Dynamically import "Animate" module
if (FEATURE_ANIMATE) import('./animate.js');

// Attach utilities to `$`
Object.assign($, bus, utils, extend);

// Define custom element
$["define"] = (name, componentClass) => customElements.define(name, componentClass);

// Attach to `window` if in browser
if (typeof window !== "undefined") window.$ = $;

// Export module
export default $;

// Named export
export { $ };