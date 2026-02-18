// Template Parts — Surgical DOM updates via tagged template literals
import { html, unsafeHTML, UnsafeHTML, TemplateResult, render as commitTemplate, clearTemplate } from './template.js';

// DOM Morph — Lightweight recursive DOM patcher
import { morph } from './morph.js';

// Keyed list helper for efficient array rendering
import { repeat } from './repeat.js';

// Re-export html, unsafeHTML, and repeat for consumer use
export { html, unsafeHTML, repeat };

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

    /**
     * Update scheduling strategy — override in subclasses
     *
     * @returns {string} 'microtask' (default, fastest) or 'raf' (frame-coalesced, for streaming data)
     */
    static get updateStrategy() {

        // Default to microtask batching
        return 'microtask';
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

        // Auto-cleanup disposer array — functions called on disconnect
        this._disposers = [];

        // Resolve scheduling function from static updateStrategy
        const useRaf = this.constructor.updateStrategy === 'raf';

        // Select scheduler: requestAnimationFrame or queueMicrotask
        this._schedule = useRaf
            ? (fn) => requestAnimationFrame(fn)
            : (fn) => queueMicrotask(fn);

        // Initialize updateComplete promise infrastructure
        this._setupUpdatePromise();

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
                    this._schedule(() => {
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

        // Cancel any pending render (element is detached)
        this._updatePending = false;

        // Call subclass destroy hook
        this.destroy();

        // Run all registered disposers (auto-cleanup)
        for (const dispose of this._disposers) dispose();

        // Clear disposer array
        this._disposers.length = 0;
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

    /**
     * Register a disposer function for automatic cleanup on disconnect
     *
     * @param {Function} disposer - Cleanup function (e.g., returned by $.listen or state.onChange)
     * @returns {Function} - The same disposer, for convenience
     */
    own(disposer) {

        // Store for cleanup in disconnectedCallback
        this._disposers.push(disposer);

        // Return for optional manual invocation
        return disposer;
    }

    /**
     * Create a fresh updateComplete promise (internal)
     * @private
     */
    _setupUpdatePromise() {

        // Create promise that resolves after the next update() completes
        this.updateComplete = new Promise(resolve => {

            // Store resolver for update() to call
            this._resolveUpdate = resolve;
        });
    }

    // Update DOM based on the current state
    update() {

        // Cancel any pending render (explicit update wins)
        this._updatePending = false;

        // Track first-render for init() hook
        const isFirst = !this._initialized;

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

        // Fire init() hook on first render only
        if (isFirst) this.init();

        // Fire updated() hook after every render
        this.updated();

        // Resolve the current updateComplete promise
        if (this._resolveUpdate) this._resolveUpdate();

        // Prepare a fresh promise for the next update cycle
        this._setupUpdatePromise();
    }

    /**
     * Lifecycle hook — called once after the first render completes.
     * Override in subclasses for one-time setup that needs the DOM.
     */
    init() {

        // Backward compatibility: call setup() if subclass defined it
        if (this.setup !== AnJSElement.prototype.setup) this.setup();
    }

    /**
     * @deprecated Use init() instead. Retained for backward compatibility.
     */
    setup() {}

    /**
     * Lifecycle hook — called after every render completes.
     * Override in subclasses for post-render side effects.
     */
    updated() {}

    /**
     * Lifecycle hook — called when element is removed from the DOM,
     * before auto-cleanup runs. Override for custom teardown.
     */
    destroy() {}

    // Default render method (override in subclasses)
    render() {

        // Placeholder message for unimplemented components
        return `<p>${this.constructor.name} is not implemented yet.</p>`;
    }
}