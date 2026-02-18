/* AlmostNo.js v1.3.0 Element (CJS) */
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
  registerComponent: () => registerComponent,
  repeat: () => repeat,
  unsafeHTML: () => unsafeHTML
});
module.exports = __toCommonJS(element_exports);

// src/template.js
var templateCache = /* @__PURE__ */ new WeakMap();
var EMPTY = Symbol("empty");
var TemplateResult = class {
  constructor(strings, values) {
    this.strings = strings;
    this.values = values;
  }
};
var UnsafeHTML = class {
  constructor(value) {
    this.value = String(value ?? "");
  }
};
function unsafeHTML(value) {
  if (typeof console !== "undefined") console.warn("[AnJS] unsafeHTML() is an escape hatch \u2014 convert this call site to use html`...` instead.");
  return new UnsafeHTML(value);
}
function html(strings, ...values) {
  return new TemplateResult(strings, values);
}
function render(result, container) {
  if (!(result instanceof TemplateResult)) {
    throw new TypeError(`render() expects a TemplateResult, got ${Array.isArray(result) ? "Array" : typeof result}. Wrap with html\`...\` first.`);
  }
  let instance = templateCache.get(container);
  if (!instance || instance.strings !== result.strings) {
    const markup = result.strings.reduce((acc, str, i) => {
      if (i >= result.values.length) return acc + str;
      const marker = markerFor(i);
      if (/=\s*$/.test(str)) return acc + str + '"' + marker + '"';
      return acc + str + marker;
    }, "");
    const tpl = document.createElement("template");
    tpl.innerHTML = markup;
    const parts = [];
    walkTemplate(tpl.content, parts);
    container.innerHTML = "";
    container.appendChild(tpl.content.cloneNode(true));
    const liveParts = resolveParts(parts, container);
    instance = { strings: result.strings, parts: liveParts, values: result.values.map(() => EMPTY) };
    templateCache.set(container, instance);
  }
  commitValues(instance, result.values);
}
var MARKER_PREFIX = "<!--anjs-";
var MARKER_SUFFIX = "-->";
function markerFor(index) {
  return `${MARKER_PREFIX}${index}${MARKER_SUFFIX}`;
}
function walkTemplate(root, parts, path = []) {
  let childIndex = 0;
  for (let node = root.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === 8) {
      const text = node.data.trim();
      if (text.startsWith("anjs-")) {
        const index = parseInt(text.slice(5), 10);
        if (!isNaN(index)) {
          parts.push({ type: "node", index, path: [...path, childIndex] });
        }
      }
    } else if (node.nodeType === 1) {
      const attrs = [...node.attributes];
      for (const attr of attrs) {
        const markerRe = /<!--anjs-(\d+)-->/g;
        const segments = attr.value.split(markerRe);
        if (segments.length <= 1) continue;
        const statics = [];
        const indices = [];
        for (let s = 0; s < segments.length; s++) {
          if (s % 2 === 0) {
            statics.push(segments[s]);
          } else {
            indices.push(parseInt(segments[s], 10));
          }
        }
        for (let k = 0; k < indices.length; k++) {
          parts.push({
            type: "attr",
            index: indices[k],
            path: [...path, childIndex],
            name: attr.name,
            statics,
            attrIndices: indices,
            slotIndex: k
          });
        }
        node.setAttribute(attr.name, statics.join(""));
      }
      walkTemplate(node, parts, [...path, childIndex]);
    }
    childIndex++;
  }
}
function resolveParts(parts, container) {
  return parts.map((part) => {
    let node = container;
    for (const idx of part.path) {
      node = node.childNodes[idx];
      if (!node) return null;
    }
    if (part.type === "node") {
      const text = document.createTextNode("");
      node.parentNode.replaceChild(text, node);
      return { type: "node", index: part.index, node: text };
    }
    const resolved = { type: "attr", index: part.index, node, name: part.name };
    if (part.statics) {
      resolved.statics = part.statics;
      resolved.attrIndices = part.attrIndices;
      resolved.slotIndex = part.slotIndex;
    }
    return resolved;
  }).filter(Boolean);
}
function commitValues(instance, newValues) {
  for (const part of instance.parts) {
    const newVal = newValues[part.index];
    const oldVal = instance.values[part.index];
    if (newVal === oldVal) continue;
    if (part.type === "node") {
      if (newVal instanceof TemplateResult) {
        if (!part._container) {
          part._container = document.createElement("span");
          part._container.style.display = "contents";
          part.node.parentNode.replaceChild(part._container, part.node);
        }
        render(newVal, part._container);
      } else if (newVal instanceof UnsafeHTML) {
        if (!part._container) {
          part._container = document.createElement("span");
          part._container.style.display = "contents";
          part.node.parentNode.replaceChild(part._container, part.node);
        }
        part._container.innerHTML = newVal.value;
      } else if (Array.isArray(newVal)) {
        commitArray(part, newVal);
      } else if (newVal == null || newVal === false) {
        if (part._container) {
          const text = document.createTextNode("");
          part._container.parentNode.replaceChild(text, part._container);
          part.node = text;
          delete part._container;
          delete part._items;
        } else {
          part.node.data = "";
        }
      } else {
        if (part._container) {
          const text = document.createTextNode(String(newVal));
          part._container.parentNode.replaceChild(text, part._container);
          part.node = text;
          delete part._container;
        } else {
          part.node.data = String(newVal);
        }
      }
    } else if (part.type === "attr") {
      if (part.statics) {
        const statics = part.statics;
        const indices = part.attrIndices;
        if (indices.length === 1 && statics[0] === "" && statics[1] === "" && typeof newVal === "boolean") {
          if (newVal) {
            part.node.setAttribute(part.name, "");
          } else {
            part.node.removeAttribute(part.name);
          }
        } else {
          let assembled = statics[0];
          for (let k = 0; k < indices.length; k++) {
            const v = newValues[indices[k]];
            assembled += v == null || v === false ? "" : String(v);
            assembled += statics[k + 1];
          }
          part.node.setAttribute(part.name, assembled);
        }
      } else {
        if (newVal === true) {
          part.node.setAttribute(part.name, "");
        } else if (newVal === false || newVal == null) {
          part.node.removeAttribute(part.name);
        } else {
          part.node.setAttribute(part.name, String(newVal));
        }
      }
    }
  }
  instance.values = [...newValues];
}
function commitArray(part, items) {
  if (!part._items) {
    part._items = [];
    part._keys = [];
    if (!part._container) {
      part._container = document.createElement("span");
      part._container.style.display = "contents";
      part.node.parentNode.replaceChild(part._container, part.node);
    }
  }
  const container = part._container;
  const existing = part._items;
  const oldKeys = part._keys;
  const isKeyed = items.length > 0 && items[0] && items[0]._key !== void 0;
  if (isKeyed) {
    const oldMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < oldKeys.length; i++) {
      oldMap.set(oldKeys[i], existing[i]);
    }
    const newSlots = [];
    const newKeys = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = item._key;
      newKeys.push(key);
      const slot = oldMap.get(key);
      if (slot) {
        if (item instanceof TemplateResult) {
          render(item, slot);
        } else {
          slot.textContent = String(item ?? "");
        }
        newSlots.push(slot);
        oldMap.delete(key);
      } else {
        const newSlot = document.createElement("span");
        newSlot.style.display = "contents";
        if (item instanceof TemplateResult) {
          render(item, newSlot);
        } else {
          newSlot.textContent = String(item ?? "");
        }
        newSlots.push(newSlot);
      }
    }
    for (const orphan of oldMap.values()) {
      orphan.remove();
    }
    for (let i = 0; i < newSlots.length; i++) {
      const slot = newSlots[i];
      const current = container.childNodes[i];
      if (current !== slot) {
        container.insertBefore(slot, current || null);
      }
    }
    part._items = newSlots;
    part._keys = newKeys;
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i < existing.length) {
      if (item instanceof TemplateResult) {
        render(item, existing[i]);
      } else {
        existing[i].textContent = String(item ?? "");
      }
    } else {
      const slot = document.createElement("span");
      slot.style.display = "contents";
      if (item instanceof TemplateResult) {
        render(item, slot);
      } else {
        slot.textContent = String(item ?? "");
      }
      container.appendChild(slot);
      existing.push(slot);
    }
  }
  while (existing.length > items.length) {
    const removed = existing.pop();
    removed.remove();
  }
}

// src/morph.js
function morph(target, newHTML) {
  const template = document.createElement("template");
  template.innerHTML = newHTML;
  reconcile(target, target.childNodes, template.content.childNodes);
}
function reconcile(parent, oldNodes, newNodes) {
  const newLen = newNodes.length;
  for (let i = 0; i < newLen; i++) {
    const oldChild = oldNodes[i];
    const newChild = newNodes[i];
    if (!oldChild) {
      parent.appendChild(newChild.cloneNode(true));
      continue;
    }
    if (oldChild.nodeType === newChild.nodeType) {
      if (oldChild.nodeType === 3 || oldChild.nodeType === 8) {
        if (oldChild.data !== newChild.data) {
          oldChild.data = newChild.data;
        }
        continue;
      }
      if (oldChild.nodeType === 1 && oldChild.tagName === newChild.tagName) {
        syncAttributes(oldChild, newChild);
        reconcile(oldChild, oldChild.childNodes, newChild.childNodes);
        continue;
      }
    }
    parent.replaceChild(newChild.cloneNode(true), oldChild);
  }
  while (parent.childNodes.length > newLen) {
    parent.removeChild(parent.lastChild);
  }
}
function syncAttributes(oldEl, newEl) {
  for (const { name, value } of newEl.attributes) {
    if (oldEl.getAttribute(name) !== value) {
      oldEl.setAttribute(name, value);
    }
  }
  for (const { name } of [...oldEl.attributes]) {
    if (!newEl.hasAttribute(name)) {
      oldEl.removeAttribute(name);
    }
  }
  const tag = oldEl.tagName;
  const isFocused = document.activeElement === oldEl;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    if (oldEl.value !== newEl.value && !isFocused) {
      oldEl.value = newEl.value || "";
    }
    if (oldEl.type === "checkbox" || oldEl.type === "radio") {
      if (oldEl.checked !== newEl.checked && !isFocused) {
        oldEl.checked = newEl.checked;
      }
    }
  }
  if (tag === "SELECT" && !isFocused) {
    if (oldEl.value !== newEl.value) {
      oldEl.value = newEl.value;
    }
  }
}

// src/repeat.js
function repeat(items, keyFn, templateFn) {
  const results = [];
  let index = 0;
  for (const item of items) {
    const result = templateFn(item, index);
    if (result && typeof result === "object") {
      result._key = keyFn(item, index);
    }
    results.push(result);
    index++;
  }
  return results;
}

// src/element.js
var registerComponent = (name, ComponentClass) => {
  if (!customElements.get(name)) customElements.define(name, ComponentClass);
};
var AnJSElement = class _AnJSElement extends HTMLElement {
  // Define which attributes to observe (subclasses should override this)
  static get observedAttributes() {
    return [];
  }
  /**
   * Update scheduling strategy — override in subclasses
   *
   * @returns {string} 'microtask' (default, fastest) or 'raf' (frame-coalesced, for streaming data)
   */
  static get updateStrategy() {
    return "microtask";
  }
  // Constructor initializes state
  constructor() {
    super();
    this._updatePending = false;
    this._initialized = false;
    this._computedDefs = /* @__PURE__ */ new Map();
    this._disposers = [];
    const useRaf = this.constructor.updateStrategy === "raf";
    this._schedule = useRaf ? (fn) => requestAnimationFrame(fn) : (fn) => queueMicrotask(fn);
    this._setupUpdatePromise();
    this.state = new Proxy($.state({}), {
      // Intercept property changes
      set: (target, prop, value) => {
        target[prop] = value;
        this._recompute(prop);
        if (!this._updatePending) {
          this._updatePending = true;
          this._schedule(() => {
            if (this._updatePending) {
              this._updatePending = false;
              this.update();
            }
          });
        }
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
  // Lifecycle: Called when element is removed from the DOM
  disconnectedCallback() {
    this._updatePending = false;
    this.destroy();
    for (const dispose of this._disposers) dispose();
    this._disposers.length = 0;
  }
  // Lifecycle: Called when an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.state[name] !== newValue) {
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
    this._computedDefs.set(name, { deps, fn });
    const values = deps.map((d) => this.state[d]);
    this.state[name] = fn(...values);
  }
  /**
   * Recalculate computed properties when a dependency changes
   *
   * @param {string} changedProp - The property that just changed
   * @private
   */
  _recompute(changedProp) {
    if (this._computing) return;
    for (const [name, { deps, fn }] of this._computedDefs) {
      if (deps.includes(changedProp)) {
        const values = deps.map((d) => this.state[d]);
        const newVal = fn(...values);
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
    this._disposers.push(disposer);
    return disposer;
  }
  /**
   * Create a fresh updateComplete promise (internal)
   * @private
   */
  _setupUpdatePromise() {
    this.updateComplete = new Promise((resolve) => {
      this._resolveUpdate = resolve;
    });
  }
  // Update DOM based on the current state
  update() {
    this._updatePending = false;
    const isFirst = !this._initialized;
    const result = this.render();
    if (result instanceof TemplateResult) {
      render(result, this);
    } else if (typeof result === "string" && this._initialized) {
      morph(this, result);
    } else if (typeof result === "string") {
      this.innerHTML = result;
    }
    this._initialized = true;
    $.bind(this.state, this);
    if (isFirst) this.init();
    this.updated();
    if (this._resolveUpdate) this._resolveUpdate();
    this._setupUpdatePromise();
  }
  /**
   * Lifecycle hook — called once after the first render completes.
   * Override in subclasses for one-time setup that needs the DOM.
   */
  init() {
    if (this.setup !== _AnJSElement.prototype.setup) this.setup();
  }
  /**
   * @deprecated Use init() instead. Retained for backward compatibility.
   */
  setup() {
  }
  /**
   * Lifecycle hook — called after every render completes.
   * Override in subclasses for post-render side effects.
   */
  updated() {
  }
  /**
   * Lifecycle hook — called when element is removed from the DOM,
   * before auto-cleanup runs. Override for custom teardown.
   */
  destroy() {
  }
  // Default render method (override in subclasses)
  render() {
    return `<p>${this.constructor.name} is not implemented yet.</p>`;
  }
};
