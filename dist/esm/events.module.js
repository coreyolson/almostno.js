/* AlmostNo.js v1.3.0 Events (ESM) */

// src/core.js
var globalScope = typeof window !== "undefined" ? window : global;
if (!globalScope.__AnJS__) {
  class AnJS extends Array {
    /**
     * Initialize AnJS
     * 
     * @param {string | HTMLElement | NodeList} query - CSS selector or element.
     */
    constructor(query) {
      super();
      if (!query) return;
      if (query instanceof HTMLElement || query.nodeType === 1) this.push(query);
      else if (query instanceof NodeList || Array.isArray(query)) this.push(...query);
      else if (typeof query === "string") this.push(...document.querySelectorAll(query));
    }
    /**
     * Iterate through elements
     * 
     * @param {Function} fn - Callback function.
     * @returns {AnJS} - Returns self for chaining.
     */
    each(fn) {
      this.forEach(fn);
      return this;
    }
    /**
     * Get elements by index or return all
     * 
     * @param {number} [index] - The index of the element to retrieve.
     * @returns {HTMLElement | Array} - The specific element or an array of elements.
     */
    get(index) {
      return index === void 0 ? this : this.at(index);
    }
    /**
     * Clone the first selected element
     * 
     * @param {boolean} [deep=true] - Clone children.
     * @returns {HTMLElement | null} - Cloned element.
     */
    clone(deep = true) {
      return this[0] ? this[0].cloneNode(deep) : null;
    }
  }
  globalScope.__AnJS__ = AnJS;
}
var core_default = globalScope.__AnJS__;

// src/events.js
var eventStore = /* @__PURE__ */ new WeakMap();
Object.assign(core_default.prototype, {
  /**
   * Attach an event listener (direct or delegated)
   * 
   * @param {string} event - Event type (e.g., 'click')
   * @param {string | Function} selector - Selector for delegation or event handler
   * @param {Function} [handler] - Event handler if delegation is used
   * @returns {AnJS} - Chainable instance
   */
  on(event, selector, handler) {
    return typeof selector === "function" ? this.delegate(event, null, selector) : this.delegate(event, selector, handler);
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
    return typeof selector === "function" ? this.undelegate(event, null, selector) : this.undelegate(event, selector, handler);
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
    return this.each((el) => {
      if (!eventStore.has(el)) eventStore.set(el, {});
      const events = eventStore.get(el);
      if (!events[event]) events[event] = [];
      const delegateHandler = (e) => {
        const target = selector ? e.target.closest(selector) : el;
        if (target && el.contains(target)) handler.call(target, e);
      };
      events[event].push({ selector, handler, delegateHandler });
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
    return this.each((el) => {
      if (!eventStore.has(el)) return;
      const events = eventStore.get(el);
      if (!events[event]) return;
      if (!handler) {
        events[event].forEach((item) => el.removeEventListener(event, item.delegateHandler));
        delete events[event];
      } else {
        events[event] = events[event].filter((item) => {
          if (item.selector === selector && item.handler === handler) {
            el.removeEventListener(event, item.delegateHandler);
            return false;
          }
          return true;
        });
        if (events[event].length === 0) delete events[event];
      }
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
    return this.each((el) => el.dispatchEvent(new Event(event, { bubbles: true })));
  }
});
var eventBus = {};
var bus = {
  /**
   * Emit a global event
   * 
   * @param {string} event - The event name
   * @param {any} [data] - Optional data to send
   */
  emit(event, data) {
    eventBus[event]?.forEach((handler) => handler(data));
  },
  /**
   * Listen for a global event
   * 
   * @param {string} event - The event name
   * @param {Function} handler - The callback function
   * @returns {Function} - Unsubscribe function that removes this listener
   */
  listen(event, handler) {
    if (!eventBus[event]) eventBus[event] = [];
    eventBus[event].push(handler);
    return () => bus.forget(event, handler);
  },
  /**
   * Remove a global event listener
   * 
   * @param {string} event - The event name
   * @param {Function} handler - The callback function to remove
   */
  forget(event, handler) {
    if (eventBus[event]) {
      eventBus[event] = eventBus[event].filter((h) => h !== handler);
      if (eventBus[event].length === 0) delete eventBus[event];
    }
  }
};
export {
  bus
};
