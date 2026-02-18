// Dependencies 
import AnJS from './core.js';

// Stores element bindings for reactive text updates (`data-bind`)
export const bindings = {};

// Tracks scoped bindings per state instance
export const localBindings = new Map();

// Global State Storage
const globalStates = (typeof window !== "undefined" && (window.__AnJS_GLOBAL_STATES__ ||= {})) || {};

// Stores attribute bindings for reactive updates (`data-bind-attr`)
const attrBindings = {};

// List of boolean attributes (handled differently from regular attributes)
const boolAttrs = new Set([
    "disabled", "checked", "selected", "readonly", "multiple",
    "hidden", "autoplay", "controls", "loop", "muted"
]);

/**
 * Retrieve or create a **global state**
 * 
 * @param {string} name - The unique global state name.
 * @param {Object} [initial] - The initial state values (optional).
 * @param {Object} [options] - State options (`{ persist: "local" | "session" }`).
 * @returns {Proxy} - The reactive global state object.
 */
AnJS.prototype.global = function (name, initial, options = {}) {

    // Ensure valid state name
    if (!name || typeof name !== "string") throw new Error("Global state must have a unique name.");

    // If no initial state and state doesn't exist, throw an error (restoring original test behavior)
    if (!globalStates[name] && initial === undefined) throw new Error(`Global state "${name}" does not exist. Provide an initial state.`);

    // Load persisted state if enabled
    if (options.persist) {

        // Determine storage type
        const storage = options.persist === "session" ? sessionStorage : localStorage;

        // Load saved state from storage
        const saved = storage.getItem(name);

        // Use saved state if available
        if (saved) initial = JSON.parse(saved);
    }

    // Register new state only if it's missing
    if (!globalStates[name] && initial !== undefined) {

        // Create new global state
        globalStates[name] = $.state(persistent(name, initial, options.persist));
    }

    // Return the global state
    return globalStates[name];
};

/**
 * Clear a **global state** (removes from memory and storage)
 * 
 * @param {string} name - The global state name to clear.
 */
AnJS.prototype.clearGlobal = function (name) {

    // Ensure the state exists before clearing
    if (globalStates[name]) {

        // Remove from in-memory storage
        delete globalStates[name];

        // Remove from persistent storage (local)
        localStorage.removeItem(name);

        // Remove from persistent storage (session)
        sessionStorage.removeItem(name);
    }
};

/**
 * Check if a global state exists
 * 
 * @param {string} name - The global state name to check.
 * @returns {boolean} - `true` if the global state exists, otherwise `false`.
 */
AnJS.prototype.hasGlobal = function (name) {

    // Check if the state exists
    return !!globalStates[name];
};

/**
 * Create a **reactive state object**
 * 
 * @param {Object} initial - The initial state values.
 * @param {Object} [options] - Options for state behavior.
 * @returns {Proxy} - The reactive proxy object with onChange, onAny, patch.
 */
AnJS.prototype.state = function (initial = {}, options = {}) {

    // Handle global state registration
    const isGlobal = !!options.global;

    if (isGlobal) {

        // Ensure a valid name is provided
        if (!options.name) throw new Error("Global state must have a name.");

        // Register global state
        initial = globalStates[options.name] ??= initial;
    }

    // Per-property change listeners — Map<string, Set<Function>>
    const listeners = new Map();

    // Batch queue — when non-null, defers notifications until batch ends
    let batchQueue = null;

    // Fire listeners for a specific property (and wildcards)
    function notify(prop, value) {

        // Fire property-specific listeners
        const handlers = listeners.get(prop);
        if (handlers) handlers.forEach(fn => fn(value, prop));

        // Fire wildcard listeners
        const wildcards = listeners.get('*');
        if (wildcards) wildcards.forEach(fn => fn(value, prop));
    }

    // Create proxy for reactive updates
    const proxy = new Proxy(initial, {

        // Retrieve state property — also exposes onChange, onAny, patch as methods
        get: (target, prop) => {

            // Expose onChange as a non-enumerable method
            if (prop === 'onChange') return (path, handler) => {
                if (!listeners.has(path)) listeners.set(path, new Set());
                listeners.get(path).add(handler);
                return () => listeners.get(path)?.delete(handler);
            };

            // Expose onAny as convenience for wildcard
            if (prop === 'onAny') return (handler) => {
                if (!listeners.has('*')) listeners.set('*', new Set());
                listeners.get('*').add(handler);
                return () => listeners.get('*')?.delete(handler);
            };

            // Expose patch for batch updates
            if (prop === 'patch') return (changes) => {
                batchQueue = new Set();
                for (const [key, val] of Object.entries(changes)) {
                    proxy[key] = val;
                }
                const changed = batchQueue;
                batchQueue = null;
                for (const key of changed) {
                    notify(key, target[key]);
                }
            };

            return target[prop];
        },

        // Update state property & trigger UI updates
        set: (target, prop, value) => {

            // Assign new value
            target[prop] = value;

            // Only scan global bindings for global state (performance optimization)
            if (isGlobal) {
                Object.keys(bindings).forEach(bindKey => {

                    // Handle nested properties (e.g., `cards.title`)
                    let [root, ...rest] = bindKey.split(".");

                    // Skip if the root object doesn't exist
                    if (!bindings[bindKey]) return;

                    // Update nested properties
                    let nestedValue = rest.reduce((obj, key) => obj?.[key], globalStates[root]);

                    // Update elements bound with `data-bind`
                    bindings[bindKey].forEach(el => el.textContent = nestedValue ?? "");
                });
            }

            // Update elements bound with `data-bind`
            bindings[prop]?.forEach(el => el.textContent = value ?? "");

            // Update elements bound with `data-bind-this`
            localBindings.get(proxy)?.[prop]?.forEach(el => el.textContent = value ?? "");

            // Update elements bound with `data-bind-attr`
            attrBindings[prop]?.forEach(({ el, attr }) => {

                // Decide whether to remove or set the attribute
                value == null

                    // Remove attribute if value is `null`
                    ? el.removeAttribute(attr)

                    // Set attribute value
                    : boolAttrs.has(attr.toLowerCase()) ? el.toggleAttribute(attr, !!value) : el.setAttribute(attr, value);
            });

            // Fire onChange listeners (or queue if batching)
            if (batchQueue) {
                batchQueue.add(prop);
            } else {
                notify(prop, value);
            }

            return true;
        }
    });

    // Store local bindings
    localBindings.set(proxy, {});

    // Auto-bind state to the DOM
    this.bind(proxy);

    // Return reactive proxy
    return proxy;
};

/**
 * Bind state properties to UI elements
 * 
 * @param {Object} state - The state object to bind.
 * @param {HTMLElement} [context=document] - The container to bind within.
 */
AnJS.prototype.bind = function (state, context = document) {

    // Bind all types: `data-bind`, `data-bind-this`, `data-bind-attr`
    context.querySelectorAll("[data-bind], [data-bind-this], [data-bind-attr]").forEach(el => {

        // Skip already bound elements
        if (el.dataset.bound) return;

        // Mark element as bound
        el.dataset.bound = "true";

        // Extract attribute and property names
        const [attr, prop] = el.getAttribute("data-bind-attr")?.split(":") || [null, el.getAttribute("data-bind") || el.getAttribute("data-bind-this")];

        // Handle nested properties (e.g., `cards.title`)
        const parts = prop?.split(".");

        // Retrieve the property value
        const value = parts?.length > 1

            // Nested properties (e.g., `cards.title`)
            ? parts.slice(1).reduce((o, k) => o?.[k], globalStates[parts[0]] ?? state)

            // Regular properties
            : state[prop] ?? globalStates[prop];

        // Bind `data-bind` (text updates)
        if (el.hasAttribute("data-bind")) {

            // Store global bindings
            (bindings[prop] ||= []).push(el);

            // Set initial text content
            el.textContent = value ?? "";
        }

        // Bind `data-bind-this` (scoped text updates)
        else if (el.hasAttribute("data-bind-this")) {

            // Store local bindings
            (localBindings.get(state)[prop] ||= []).push(el);

            // Set initial text content
            el.textContent = value ?? "";
        }

        // Bind `data-bind-attr` (attribute updates)
        else {

            // Store attribute bindings
            (attrBindings[prop] ||= []).push({ el, attr });

            // Set attribute value
            boolAttrs.has(attr.toLowerCase()) ? el.toggleAttribute(attr, !!value) : el.setAttribute(attr, value ?? "");

            // Sync input fields (`data-bind-attr="value:someState"`)
            if (attr === "value" && ["INPUT", "TEXTAREA"].includes(el.tagName)) el.addEventListener("input", () => state[prop] = el.value);
        }
    });

    // Auto-bind events
    this.autoEvents(state, context);
};

/**
 * Automatically bind `[data-on]` and `[data-action]` events
 * 
 * @param {Object} state - The state object.
 * @param {HTMLElement} [context=document] - The container to bind within.
 */
AnJS.prototype.autoEvents = function (state, context = document) {

    // Query all elements with `data-on` attributes
    context.querySelectorAll("[data-on]").forEach(el => {

        // Extract event type and handler method name
        const [event, method] = el.getAttribute("data-on")?.split(":");

        // Ensure the event is not already bound
        if (!el.dataset.boundEvent && typeof state[method] === "function") {

            // Mark the element as bound
            el.dataset.boundEvent = "true";

            // Define event handler
            const handler = (e) => state[method]?.(e, state);

            // Bind event listener to element
            el.addEventListener(event, handler);

            // Store reference in localBindings for proper unbinding
            if (!localBindings.has(state)) {

                // Initialize bindings storage for the state
                localBindings.set(state, {});
            }

            // Store the event handler for removal in `unbind`
            (localBindings.get(state)[event] ||= []).push({ el, event, handler });
        }
    });

    // Bind `[data-action]` events
    context.querySelectorAll("[data-action]").forEach(el => {

        // Extract the action name
        let action = el.dataset.action;

        // Skip if already bound
        if (!el.dataset.boundAction) {

            // Mark element as bound
            el.dataset.boundAction = "true";

            // Bind the action to the element
            el.addEventListener("click", e => {

                // 🔎 Check if the action exists locally
                if (typeof state[action] === "function") return state[action](e, state);

                // 🔎 Check if it's a global state method (e.g., `cards.share`)
                let [globalName, globalMethod] = (action || "").split(".");

                // 🔎 Check if the global state method exists
                if (typeof globalStates[globalName]?.[globalMethod] === "function") {

                    // Call the global state method
                    globalStates[globalName][globalMethod](e, globalStates[globalName]);
                }
            });
        }
    });
};

/**
 * Unbind all UI elements from a state
 * 
 * @param {Object} state - The state object to unbind.
 */
AnJS.prototype.unbind = function (state) {

    // Remove all event listeners
    Object.values(localBindings.get(state)).forEach(bindings =>

        // Remove each event listener
        bindings.forEach(({ el, event, handler }) => el.removeEventListener(event, handler))
    );

    // Clear bindings
    [bindings, attrBindings].forEach(obj => Object.keys(state).forEach(prop => delete obj[prop]));

    // Remove from local bindings
    localBindings.delete(state);
};


/**
 * Create a **reactive state object** with persistence
 * 
 * @param {string} name - The global state name.
 * @param {Object} initial - The initial state values.
 * @param {string} [persist] - Storage type (`"local"` or `"session"`).
 * @returns {Proxy} - The reactive proxy object.
 */
function persistent(name, initial, persist) {

    // Define reactive state with a Proxy
    return new Proxy(initial, {

        // Retrieve property
        get: (target, prop) => target[prop],

        // Update property & auto-save if persistence is enabled
        set: (target, prop, value) => {

            // Assign new value
            target[prop] = value;

            // Persist updated state if needed
            if (persist) {

                // Determine correct storage type
                const storage = persist === "session" ? sessionStorage : localStorage;

                // Save updated state
                storage.setItem(name, JSON.stringify(target));
            }

            return true;
        }
    });
}