// Dependencies
import AnJS from './core.js';

// WeakMap to store event handlers per element
const eventStore = new WeakMap();

// Batch assign event handling methods to AnJS prototype
Object.assign(AnJS.prototype, {

    /**
     * Attach an event listener (direct or delegated)
     * 
     * @param {string} event - Event type (e.g., 'click')
     * @param {string | Function} selector - Selector for delegation or event handler
     * @param {Function} [handler] - Event handler if delegation is used
     * @returns {AnJS} - Chainable instance
     */
    on(event, selector, handler) {

        // If no selector is provided, attach directly
        return typeof selector === "function"

            // Attach directly
            ? this.delegate(event, null, selector)

            // Attach with delegation
            : this.delegate(event, selector, handler);
    },

    /**
     * Remove an event listener (direct or delegated)
     * 
     * @param {string} event - Event type (e.g., 'click')
     * @param {string | Function} selector - Selector for delegation or event handler
     * @param {Function} [handler] - Event handler if delegation is used
     * @returns {AnJS} - Chainable instance
     */
    off(event, selector, handler) {

        // If no selector is provided, remove directly
        return typeof selector === "function"

            // Remove directly
            ? this.undelegate(event, null, selector)

            // Remove with delegation
            : this.undelegate(event, selector, handler);
    },

    /**
     * Attach a delegated event listener using WeakMap for storage
     * 
     * @param {string} event - Event type (e.g., 'click')
     * @param {string | null} selector - Selector to match (e.g., '.btn') or `null` for direct binding
     * @param {Function} handler - Event callback function
     * @returns {AnJS} - Chainable instance
     */
    delegate(event, selector, handler) {

        // Iterate over each element
        return this.each(el => {

            // Retrieve or initialize event storage for the element
            if (!eventStore.has(el)) eventStore.set(el, {});

            // Retrieve the event storage
            const events = eventStore.get(el);

            // Ensure event storage exists for the given type
            if (!events[event]) events[event] = [];

            // Create a wrapper function for delegation
            const delegateHandler = e => {

                // Find the closest matching element
                const target = selector ? e.target.closest(selector) : el;

                // If a match is found, call the handler
                if (target && el.contains(target)) handler.call(target, e);
            };

            // Store multiple handlers per selector-event combination
            events[event].push({ selector, handler, delegateHandler });

            // Attach event listener
            el.addEventListener(event, delegateHandler);
        });
    },

    /**
     * Remove a delegated event listener using WeakMap
     * 
     * @param {string} event - Event type (e.g., 'click')
     * @param {string | null} selector - Selector for delegation or `null` for direct binding
     * @param {Function} [handler] - Specific handler to remove (optional)
     * @returns {AnJS} - Chainable instance
     */
    undelegate(event, selector, handler) {

        // Iterate over each element
        return this.each(el => {

            // If no event store exists, return early
            if (!eventStore.has(el)) return;

            // Retrieve the event storage
            const events = eventStore.get(el);

            // If no handlers exist for this event, return early
            if (!events[event]) return;

            // Non-specific handler removal
            if (!handler) {

                // Remove all event listeners for this event
                events[event].forEach(item => el.removeEventListener(event, item.delegateHandler));

                // Delete the event entry from events
                delete events[event];

                // Specific handler removal
            } else {

                // Remove only matching handlers
                events[event] = events[event].filter(item => {

                    // If the selector and handler match, remove the event listener
                    if (item.selector === selector && item.handler === handler) {

                        // Remove the event listener
                        el.removeEventListener(event, item.delegateHandler);

                        // Filter the removed handler
                        return false;
                    }

                    // Keep the handler
                    return true;
                });

                // If no handlers remain for this event, remove it
                if (events[event].length === 0) delete events[event];
            }

            // If no events remain, remove the element from the store
            if (Object.keys(events).length === 0) eventStore.delete(el);
        });
    },

    /**
     * Trigger a custom event on elements
     * 
     * @param {string} event - Event type to trigger (e.g., 'click')
     * @returns {AnJS} - Chainable instance
     */
    trigger(event) {

        // Trigger the event on each element
        return this.each(el => el.dispatchEvent(new Event(event, { bubbles: true })));
    },
});

// Object to store global event bus handlers
const eventBus = {};

// Event Bus API
export const bus = {
    /**
     * Emit a global event
     * 
     * @param {string} event - The event name
     * @param {any} [data] - Optional data to send
     */
    emit(event, data) {

        // If the event exists, call each handler
        eventBus[event]?.forEach(handler => handler(data));
    },

    /**
     * Listen for a global event
     * 
     * @param {string} event - The event name
     * @param {Function} handler - The callback function
     */
    listen(event, handler) {

        // If the event doesn't exist, create it
        if (!eventBus[event]) eventBus[event] = [];

        // Add the handler to the event
        eventBus[event].push(handler);
    },

    /**
     * Remove a global event listener
     * 
     * @param {string} event - The event name
     * @param {Function} handler - The callback function to remove
     */
    forget(event, handler) {

        // If the event exists
        if (eventBus[event]) {

            // Remove the handler from the event
            eventBus[event] = eventBus[event].filter(h => h !== handler);

            // If no handlers remain, delete the event
            if (eventBus[event].length === 0) delete eventBus[event];
        }
    }
};