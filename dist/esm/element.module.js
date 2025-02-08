/* AlmostNo.js v1.1.3 Element (ESM) */

// src/element.js
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
export {
  AnJSElement,
  html,
  registerComponent
};
