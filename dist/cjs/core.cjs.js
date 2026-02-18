/* AlmostNo.js v1.2.1 Core (CJS) */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core.js
var core_exports = {};
__export(core_exports, {
  default: () => core_default
});
module.exports = __toCommonJS(core_exports);
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
