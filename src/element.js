// Template Parts — Surgical DOM updates via tagged template literals
import { html, unsafeHTML, UnsafeHTML, TemplateResult, render as commitTemplate, clearTemplate } from './template.js';

// DOM Morph — Lightweight recursive DOM patcher
import { morph } from './morph.js';

// Re-export html and unsafeHTML for consumer use
export { html, unsafeHTML };

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

        // Track whether a microtask update is pending
        this._updatePending = false;

        // Track whether first render has occurred
        this._initialized = false;

        // Computed property definitions — Map<name, { deps, fn }>
        this._computedDefs = new Map();

        // Create reactive state with auto-update on change
        this.state = new Proxy($.state({}), {

            // Intercept property changes
            set: (target, prop, value) => {

                // Assign new value
                target[prop] = value;

                // Recalculate computed properties that depend on this property
                this._recompute(prop);

                // Queue a batched update (coalesces multiple sets into one render)
                if (!this._updatePending) {
                    this._updatePending = true;
                    queueMicrotask(() => {
                        if (this._updatePending) {
                            this._updatePending = false;
                            this.update();
                        }
                    });
                }

                // Confirm change
                return true;
            }
        });
    }

    // Lifecycle: Called when element is added to the DOM
    connectedCallback() {

        // Initialize state from attributes
        this.constructor.observedAttributes.forEach(attr => {

            // Assign attribute values to state (batched — only one render at end)
            this.state[attr] = this.getAttribute(attr) ?? "";
        });

        // Ensure UI updates immediately (cancels any pending microtask)
        this.update();
    }

    // Lifecycle: Called when element is removed from the DOM
    disconnectedCallback() {

        // Cancel any pending microtask render (element is detached)
        this._updatePending = false;
    }

    // Lifecycle: Called when an observed attribute changes
    attributeChangedCallback(name, oldValue, newValue) {

        // Update state when attributes change (proxy handles the render)
        if (this.state[name] !== newValue) {

            // Assign new value — proxy set trap queues batched update
            this.state[name] = newValue;
        }
    }

    /**
     * Define a computed property that auto-recalculates when dependencies change
     *
     * @param {string} name - Computed property name (set on this.state)
     * @param {string[]} deps - Array of state property names to watch
     * @param {Function} fn - Compute function, receives dependency values as arguments
     */
    computed(name, deps, fn) {

        // Store the definition
        this._computedDefs.set(name, { deps, fn });

        // Calculate initial value
        const values = deps.map(d => this.state[d]);
        this.state[name] = fn(...values);
    }

    /**
     * Recalculate computed properties when a dependency changes
     *
     * @param {string} changedProp - The property that just changed
     * @private
     */
    _recompute(changedProp) {

        // Skip if already inside a recomputation (prevent infinite loops)
        if (this._computing) return;

        for (const [name, { deps, fn }] of this._computedDefs) {

            // Only recompute if the changed property is a dependency
            if (deps.includes(changedProp)) {

                const values = deps.map(d => this.state[d]);
                const newVal = fn(...values);

                // Only update if value actually changed
                if (this.state[name] !== newVal) {

                    this._computing = true;
                    this.state[name] = newVal;
                    this._computing = false;
                }
            }
        }
    }

    // Update DOM based on the current state
    update() {

        // Cancel any pending microtask render (explicit update wins)
        this._updatePending = false;

        // Get the render result
        const result = this.render();

        // Template parts — surgical updates (preferred path)
        if (result instanceof TemplateResult) {

            commitTemplate(result, this);
        }

        // String result with existing DOM — morph (patch in place)
        else if (typeof result === 'string' && this._initialized) {

            morph(this, result);
        }

        // String result, first render — innerHTML (fast bootstrap)
        else if (typeof result === 'string') {

            this.innerHTML = result;
        }

        // Mark as initialized after first render
        this._initialized = true;

        // Bind state updates to the UI
        $.bind(this.state, this);
    }

    // Default render method (override in subclasses)
    render() {

        // Placeholder message for unimplemented components
        return `<p>${this.constructor.name} is not implemented yet.</p>`;
    }
}