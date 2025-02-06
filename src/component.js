// Dependencies
import AnJS from './core.js';

// Handles component registration and mounting
const components = {

    // Registry for components
    registry: {},

    /**
     * Start observing the DOM for dynamically added components.
     * 
     * @returns {void}
     */
    observer() {

        // Watch for dynamically added components
        new MutationObserver(mutations => {

            // Process each mutation
            mutations.forEach(({ addedNodes }) => {

                // Process each added node
                addedNodes.forEach(node => {

                    // Check if the node is an element and has a registered component
                    if (node.nodeType === Node.ELEMENT_NODE && this.registry[node.tagName.toLowerCase()]) this.mount(node, node.tagName.toLowerCase());
                });
            });
        
        // Start observing the document body
        }).observe(document.body, { childList: true, subtree: true });
    },

    /**
     * Register a new component.
     * 
     * @param {string} name - Component tag name.
     * @param {Function} template - Rendering function.
     * @param {Function | Object} [stateOrHandlers] - State function or event handlers.
     * @param {Function} [handlers] - Optional event handlers.
     */
    register(name, template, stateOrHandlers, handlers) {

        // Ignore empty registrations
        if (!stateOrHandlers && !handlers) return;

        // Default state
        let state = () => $.state({});
        let finalHandlers = () => { };

        // Determine if argument is state or handlers
        if (typeof stateOrHandlers === "function") {

            // Try to determine if it's a state function or handlers
            try {

                // Assume it's a state function
                state = typeof stateOrHandlers() === "object" ? stateOrHandlers : state;

            // So hacky, but it works...
            } catch {

                // Assume it's handlers
                finalHandlers = stateOrHandlers;
            }
        }

        // If handlers are provided, use them
        if (typeof handlers === "function") finalHandlers = handlers;

        // Store component definition
        this.registry[name.toLowerCase()] = { template, state, handlers: finalHandlers };

        // Mount all existing instances
        document.querySelectorAll(name.toLowerCase()).forEach(el => this.mount(el, name));
    },

    /**
     * Mount a component dynamically.
     * 
     * @param {HTMLElement} el - Element to replace.
     * @param {string} name - Component name.
     */
    mount(el, name) {

        // Retrieve component definition
        const { template, state, handlers } = this.registry[name.toLowerCase()];

        // Ensure the component isn't already mounted
        if (el.dataset.__mounted) return;

        // Mark the component as mounted
        el.dataset.__mounted = "true";

        // Extract props from attributes
        const props = Object.fromEntries([...el.attributes].map(attr => [attr.name, attr.value]));

        // Create an isolated state
        const componentState = AnJS.prototype.state({ ...state(), ...props });

        // Render and replace the component
        const rendered = this.render(template({ state: componentState, props }), componentState);

        // Replace the original element with the rendered component
        el.replaceWith(rendered);

        // Bind the component state
        $(rendered).bind(componentState);

        // Auto-mount child components
        rendered.querySelectorAll(Object.keys(this.registry).join(",")).forEach(child => this.mount(child, child.tagName.toLowerCase()));

        // Attach event handlers
        this.bind(rendered, handlers, componentState);
    },

    /**
     * Render an HTML string into a DOM element.
     * 
     * @param {string} html - Component HTML.
     * @param {Object} [state={}] - Optional state to bind.
     * @returns {HTMLElement} - Rendered DOM element.
     */
    render(html, state = {}) {

        // Create a temporary container to parse the HTML
        const container = document.createElement("div");

        // Set the inner HTML and extract the first child element
        container.innerHTML = html.trim();

        // Ensure a valid element exists
        const element = container.firstElementChild || null;

        // If no element, return null gracefully
        if (!element) return null;

        // Bind state if provided
        if (state) $(element).bind(state);

        // Return the rendered element
        return element;
    },

    /**
     * Attach event handlers to a mounted component.
     * 
     * @param {HTMLElement} rendered - Rendered component element.
     * @param {Function | Object} handlers - Event handlers.
     * @param {Object} componentState - Component state.
     */
    bind(rendered, handlers, componentState) {

        // Directly invoke if it's a function
        if (typeof handlers === "function") return handlers($(rendered), componentState);

        // Otherwise, bind event handlers dynamically
        Object.entries(handlers).forEach(([event, actions]) => {

            // Attach event listener
            $(rendered).on(event, "[data-action]", e => {

                // Extract action name
                const action = e.target.dataset.action;

                // Execute the corresponding action
                if (actions[action]) {

                    // Execute the action
                    actions[action](componentState, e);

                    // Re-render the component
                    $(rendered).bind(componentState);
                }
            });
        });
    }
};

// Start component observer
function startObserver() {

    // Start observer 
    document.readyState !== "loading"

        // If the document is already loaded, start observing immediately
        ? components.observer()

        // Otherwise, wait for the DOMContentLoaded event
        : document.addEventListener("DOMContentLoaded", () => components.observer());
}

// Attach component registration to AnJS prototype
AnJS.prototype.component = function (name, template, stateOrHandlers, handlers) {

    // Register the component
    components.register(name, template, stateOrHandlers, handlers);
};

// Attach `render()` explicitly to `AnJS.prototype`
AnJS.prototype.render = components.render;

// Execute observer start
startObserver();

// Export function for testing
export { startObserver };

// Export components
export default components;