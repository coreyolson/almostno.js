// Utility: `html` function for clean template rendering
export const html = (strings, ...values) =>

    // Reduce template strings into a single HTML string
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");

// Utility: Register components
export const registerComponent = (name, ComponentClass) => {

    // Define the component only if not already registered
    if (!customElements.get(name)) customElements.define(name, ComponentClass);
};

// Base Class for AnJS Elements
export class AnJSElement extends HTMLElement {

    // Define which attributes to observe (subclasses should override this)
    static get observedAttributes() {

        // Default to an empty array
        return [];
    }

    // Constructor initializes state
    constructor() {

        // Call parent constructor
        super();

        // Create reactive state with auto-update on change
        this.state = new Proxy($.state({}), {

            // Intercept property changes
            set: (target, prop, value) => {

                // Assign new value
                target[prop] = value;

                // Auto-update component UI
                this.update();

                // Confirm change
                return true;
            }
        });
    }

    // Lifecycle: Called when element is added to the DOM
    connectedCallback() {

        // Initialize state from attributes
        this.constructor.observedAttributes.forEach(attr => {

            // Assign attribute values to state
            this.state[attr] = this.getAttribute(attr) ?? "";
        });

        // Ensure UI updates immediately
        this.update();
    }

    // Lifecycle: Called when an observed attribute changes
    attributeChangedCallback(name, oldValue, newValue) {

        // Update state when attributes change
        if (this.state[name] !== newValue) {

            // Assign new value
            this.state[name] = newValue;

            // Re-render component
            this.update();
        }
    }

    // Update DOM based on the current state
    update() {

        // Re-render the component
        this.innerHTML = this.render();

        // Bind state updates to the UI
        $.bind(this.state, this);
    }

    // Default render method (override in subclasses)
    render() {

        // Placeholder message for unimplemented components
        return `<p>${this.constructor.name} is not implemented yet.</p>`;
    }
}