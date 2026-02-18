/* AlmostNo.js v1.2.0 Extend (ESM) */

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

// src/extend.js
var extend = function(name, func, force = false) {
  if (typeof name === "object") {
    if (typeof func === "boolean") force = func;
    return Object.keys(name).forEach((key) => extend(key, name[key], force));
  }
  if (!force && core_default.prototype.hasOwnProperty(name)) return;
  core_default.prototype[name] = func;
};
var extend_default = { extend };
export {
  extend_default as default
};
