/* AlmostNo.js v1.1.2 Element (CJS) */
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

// src/element.js
var element_exports = {};
__export(element_exports, {
  AnJSElement: () => AnJSElement,
  html: () => html,
  registerComponent: () => registerComponent
});
module.exports = __toCommonJS(element_exports);
var html = (strings, ...values) => (
  // Reduce template strings into a single HTML string
  strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "")
);
var registerComponent = (name, ComponentClass) => {
  if (!customElements.get(name)) customElements.define(name, ComponentClass);
};
var AnJSElement = class extends HTMLElement {
  // Define which attributes to observe (subclasses should override this)
  static get observedAttributes() {
    return [];
  }
  // Constructor initializes state
  constructor() {
    super();
    this.state = new Proxy($.state({}), {
      // Intercept property changes
      set: (target, prop, value) => {
        target[prop] = value;
        this.update();
        return true;
      }
    });
  }
  // Lifecycle: Called when element is added to the DOM
  connectedCallback() {
    this.constructor.observedAttributes.forEach((attr) => {
      this.state[attr] = this.getAttribute(attr) ?? "";
    });
    this.update();
  }
  // Lifecycle: Called when an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.state[name] !== newValue) {
      this.state[name] = newValue;
      this.update();
    }
  }
  // Update DOM based on the current state
  update() {
    this.innerHTML = this.render();
    $.bind(this.state, this);
  }
  // Default render method (override in subclasses)
  render() {
    return `<p>${this.constructor.name} is not implemented yet.</p>`;
  }
};
export { $ };
