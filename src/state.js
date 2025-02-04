// Dependencies
import AnJS from './core.js';

/**
 * Store bindings for elements that track state changes
 */
const bindings = {};

/**
 * Store attribute bindings for elements that need attribute updates
 */
const attrBindings = {};

/**
 * Create a state object
 * 
 * @param {Object} initialState - The initial state values.
 * @returns {Proxy} - A proxy-wrapped state object that triggers UI updates on change.
 */
AnJS.prototype.state = function (initialState = {}) {


    // Create a Proxy to watch for state mutations
    const proxyState = new Proxy(initialState, {

        // Trap: Retrieve property value
        get(target, prop) {

            // Return property value
            return target[prop];
        },

        // Trap: Set property value and update UI
        set(target, prop, value) {

            // Assign new value
            target[prop] = value;

            // Update elements bound to this property
            if (bindings[prop]) bindings[prop].forEach(el => el.textContent = value);

            // Update attribute-bound elements
            if (attrBindings[prop]) attrBindings[prop].forEach(({ el, attr }) => el.setAttribute(attr, value));

            // Return true to indicate success
            return true;
        }
    });

    // Auto-bind state to the DOM
    this.bind(proxyState);

    // Return the proxy-wrapped state object
    return proxyState;
};

/**
 * Bind a state object to the DOM
 * 
 * @param {Object} state - The state object created by state().
 * @param {HTMLElement} [context=document] - The root context for binding elements.
 */
AnJS.prototype.bind = function (state, context = document) {

    // Find and bind all elements with [data-bind]
    context.querySelectorAll('[data-bind]').forEach(el => {

        // Extract property name from attribute
        const prop = el.getAttribute('data-bind');

        // Initialize bindings array if not set
        if (!bindings[prop]) bindings[prop] = [];

        // Add element to bindings
        bindings[prop].push(el);

        // Set initial content
        el.textContent = state[prop] ?? '';
    });

    // Find and bind all elements with [data-bind-attr]
    context.querySelectorAll('[data-bind-attr]').forEach(el => {

        // Extract attribute and property name (e.g., "title:message")
        const [attr, prop] = el.getAttribute('data-bind-attr').split(':');

        // Initialize attribute bindings array if not set
        if (!attrBindings[prop]) attrBindings[prop] = [];

        // Add element + attribute to bindings
        attrBindings[prop].push({ el, attr });

        // Set initial attribute value
        el.setAttribute(attr, state[prop] ?? '');

        // Listen for input events on form elements
        if (attr === "value" && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {

            // Update state on input
            el.addEventListener("input", () => state[prop] = el.value);
        }
    });

    // Find and bind all elements with [data-on]
    context.querySelectorAll('[data-on]').forEach(el => {

        // Extract event and method name (e.g., "click:increment")
        const [event, method] = el.getAttribute('data-on').split(':');

        // Attach event listener
        el.addEventListener(event, e => {

            // Check if method exists in state and is callable
            if (typeof state[method] === 'function') {

                // Call method with event and state
                state[method](e, state);
            }
        });
    });
};

/**
 * Unbinds all UI elements from a state to prevent duplicate updates
 * 
 * @param {Object} state - The old state object.
 */
AnJS.prototype.unbind = function (state) {

    // Remove all bindings to prevent conflicts
    Object.keys(state).forEach(key => {
        delete bindings[key];
        delete attrBindings[key];
    });
};

/**
 * Automatically bind to `window.AnJSState` if defined
 */
document.addEventListener('DOMContentLoaded', () => {

    // Check if global state exists
    if (window.AnJSState) {

        // Bind global state to DOM
        AnJS.prototype.bind(window.AnJSState);
    }
});