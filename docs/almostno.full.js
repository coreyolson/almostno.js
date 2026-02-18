/* AlmostNo.js v1.2.1 Full */
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/core.js
  var globalScope, core_default;
  var init_core = __esm({
    "src/core.js"() {
      globalScope = typeof window !== "undefined" ? window : global;
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
      core_default = globalScope.__AnJS__;
    }
  });

  // src/filtering.js
  var filtering_exports = {};
  var init_filtering = __esm({
    "src/filtering.js"() {
      init_core();
      Object.assign(core_default.prototype, {
        /**
         * Filter elements based on a callback function or CSS selector
         * 
         * @param {Function | string} callbackOrSelector - Callback function or CSS selector.
         * @returns {AnJS} - Returns a new instance of AnJS.
         */
        filter(callbackOrSelector) {
          if (typeof callbackOrSelector === "function") return new core_default([...this].filter(callbackOrSelector));
          return new core_default([...this].filter((el) => el.matches(callbackOrSelector)));
        },
        /**
         * Find child elements by a CSS selector
         * 
         * @param {string} selector - CSS selector to find child elements.
         * @returns {AnJS} - Returns a new instance of AnJS.
         */
        find(selector) {
          return new core_default(this.flatMap((el) => [...el.querySelectorAll(selector)]));
        },
        /**
         * Select the first element from the current selection
         * 
         * @returns {AnJS} - Returns a new instance of AnJS.
         */
        first() {
          return new core_default(this.length ? [this[0]] : []);
        },
        /**
         * Select the last element from the current selection
         * 
         * @returns {AnJS} - Returns a new instance of AnJS.
         */
        last() {
          return new core_default(this.length ? [this[this.length - 1]] : []);
        },
        /**
         * Select only elements with an even index
         * 
         * @returns {AnJS} - Returns a new instance of AnJS.
         */
        even() {
          return new core_default(this.filter((_, index) => !(index % 2)));
        },
        /**
         * Select only elements with an odd index
         * 
         * @returns {AnJS} - Returns a new instance of AnJS.
         */
        odd() {
          return new core_default(this.filter((_, index) => index % 2));
        }
      });
    }
  });

  // src/traversal.js
  var traversal_exports = {};
  var init_traversal = __esm({
    "src/traversal.js"() {
      init_core();
      Object.assign(core_default.prototype, {
        /**
         * Select the next sibling element
         * 
         * @returns {AnJS} - New AnJS instance with the next sibling.
         */
        next() {
          return new core_default(this[0]?.nextElementSibling ? [this[0].nextElementSibling] : []);
        },
        /**
         * Select the previous sibling element
         * 
         * @returns {AnJS} - New AnJS instance with the previous sibling.
         */
        prev() {
          return new core_default(this[0]?.previousElementSibling ? [this[0].previousElementSibling] : []);
        },
        /**
         * Select the parent element
         * 
         * @returns {AnJS} - New AnJS instance with the parent.
         */
        parent() {
          return new core_default(this[0]?.parentElement ? [this[0].parentElement] : []);
        },
        /**
         * Select child elements
         * 
         * @returns {AnJS} - New AnJS instance with children.
         */
        children() {
          return new core_default(this[0] ? [...this[0].children] : []);
        },
        /**
         * Select all sibling elements
         * 
         * @returns {AnJS} - New AnJS instance with all siblings except the current element.
         */
        siblings() {
          const parent = this[0]?.parentElement;
          return new core_default(parent ? [...parent.children].filter((el) => el !== this[0]) : []);
        },
        /**
         * Select the closest ancestor matching a selector
         * 
         * @param {string} selector - CSS selector to match.
         * @returns {AnJS} - New AnJS instance with the closest matching ancestor.
         */
        closest(selector) {
          return new core_default(this[0]?.closest(selector) ? [this[0].closest(selector)] : []);
        }
      });
    }
  });

  // src/state.js
  var state_exports = {};
  __export(state_exports, {
    bindings: () => bindings,
    localBindings: () => localBindings
  });
  function persistent(name, initial, persist) {
    return new Proxy(initial, {
      // Retrieve property
      get: (target, prop) => target[prop],
      // Update property & auto-save if persistence is enabled
      set: (target, prop, value) => {
        target[prop] = value;
        if (persist) {
          const storage = persist === "session" ? sessionStorage : localStorage;
          storage.setItem(name, JSON.stringify(target));
        }
        return true;
      }
    });
  }
  var bindings, localBindings, globalStates, attrBindings, boolAttrs;
  var init_state = __esm({
    "src/state.js"() {
      init_core();
      bindings = {};
      localBindings = /* @__PURE__ */ new Map();
      globalStates = typeof window !== "undefined" && (window.__AnJS_GLOBAL_STATES__ || (window.__AnJS_GLOBAL_STATES__ = {})) || {};
      attrBindings = {};
      boolAttrs = /* @__PURE__ */ new Set([
        "disabled",
        "checked",
        "selected",
        "readonly",
        "multiple",
        "hidden",
        "autoplay",
        "controls",
        "loop",
        "muted"
      ]);
      core_default.prototype.global = function(name, initial, options = {}) {
        if (!name || typeof name !== "string") throw new Error("Global state must have a unique name.");
        if (!globalStates[name] && initial === void 0) throw new Error(`Global state "${name}" does not exist. Provide an initial state.`);
        if (options.persist) {
          const storage = options.persist === "session" ? sessionStorage : localStorage;
          const saved = storage.getItem(name);
          if (saved) initial = JSON.parse(saved);
        }
        if (!globalStates[name] && initial !== void 0) {
          globalStates[name] = $.state(persistent(name, initial, options.persist));
        }
        return globalStates[name];
      };
      core_default.prototype.clearGlobal = function(name) {
        if (globalStates[name]) {
          delete globalStates[name];
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        }
      };
      core_default.prototype.hasGlobal = function(name) {
        return !!globalStates[name];
      };
      core_default.prototype.state = function(initial = {}, options = {}) {
        var _a;
        const isGlobal = !!options.global;
        if (isGlobal) {
          if (!options.name) throw new Error("Global state must have a name.");
          initial = globalStates[_a = options.name] ?? (globalStates[_a] = initial);
        }
        const listeners = /* @__PURE__ */ new Map();
        let batchQueue = null;
        function notify(prop, value) {
          const handlers = listeners.get(prop);
          if (handlers) handlers.forEach((fn) => fn(value, prop));
          const wildcards = listeners.get("*");
          if (wildcards) wildcards.forEach((fn) => fn(value, prop));
        }
        const proxy = new Proxy(initial, {
          // Retrieve state property — also exposes onChange, onAny, patch as methods
          get: (target, prop) => {
            if (prop === "onChange") return (path, handler) => {
              if (!listeners.has(path)) listeners.set(path, /* @__PURE__ */ new Set());
              listeners.get(path).add(handler);
              return () => listeners.get(path)?.delete(handler);
            };
            if (prop === "onAny") return (handler) => {
              if (!listeners.has("*")) listeners.set("*", /* @__PURE__ */ new Set());
              listeners.get("*").add(handler);
              return () => listeners.get("*")?.delete(handler);
            };
            if (prop === "patch") return (changes) => {
              batchQueue = /* @__PURE__ */ new Set();
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
            target[prop] = value;
            if (isGlobal) {
              Object.keys(bindings).forEach((bindKey) => {
                let [root, ...rest] = bindKey.split(".");
                if (!bindings[bindKey]) return;
                let nestedValue = rest.reduce((obj, key) => obj?.[key], globalStates[root]);
                bindings[bindKey].forEach((el) => el.textContent = nestedValue ?? "");
              });
            }
            bindings[prop]?.forEach((el) => el.textContent = value ?? "");
            localBindings.get(proxy)?.[prop]?.forEach((el) => el.textContent = value ?? "");
            attrBindings[prop]?.forEach(({ el, attr }) => {
              value == null ? el.removeAttribute(attr) : boolAttrs.has(attr.toLowerCase()) ? el.toggleAttribute(attr, !!value) : el.setAttribute(attr, value);
            });
            if (batchQueue) {
              batchQueue.add(prop);
            } else {
              notify(prop, value);
            }
            return true;
          }
        });
        localBindings.set(proxy, {});
        this.bind(proxy);
        return proxy;
      };
      core_default.prototype.bind = function(state, context = document) {
        context.querySelectorAll("[data-bind], [data-bind-this], [data-bind-attr]").forEach((el) => {
          var _a;
          if (el.dataset.bound) return;
          el.dataset.bound = "true";
          const [attr, prop] = el.getAttribute("data-bind-attr")?.split(":") || [null, el.getAttribute("data-bind") || el.getAttribute("data-bind-this")];
          const parts = prop?.split(".");
          const value = parts?.length > 1 ? parts.slice(1).reduce((o, k) => o?.[k], globalStates[parts[0]] ?? state) : state[prop] ?? globalStates[prop];
          if (el.hasAttribute("data-bind")) {
            (bindings[prop] || (bindings[prop] = [])).push(el);
            el.textContent = value ?? "";
          } else if (el.hasAttribute("data-bind-this")) {
            ((_a = localBindings.get(state))[prop] || (_a[prop] = [])).push(el);
            el.textContent = value ?? "";
          } else {
            (attrBindings[prop] || (attrBindings[prop] = [])).push({ el, attr });
            boolAttrs.has(attr.toLowerCase()) ? el.toggleAttribute(attr, !!value) : el.setAttribute(attr, value ?? "");
            if (attr === "value" && ["INPUT", "TEXTAREA"].includes(el.tagName)) el.addEventListener("input", () => state[prop] = el.value);
          }
        });
        this.autoEvents(state, context);
      };
      core_default.prototype.autoEvents = function(state, context = document) {
        context.querySelectorAll("[data-on]").forEach((el) => {
          var _a;
          const [event, method] = el.getAttribute("data-on")?.split(":");
          if (!el.dataset.boundEvent && typeof state[method] === "function") {
            el.dataset.boundEvent = "true";
            const handler = (e) => state[method]?.(e, state);
            el.addEventListener(event, handler);
            if (!localBindings.has(state)) {
              localBindings.set(state, {});
            }
            ((_a = localBindings.get(state))[event] || (_a[event] = [])).push({ el, event, handler });
          }
        });
        context.querySelectorAll("[data-action]").forEach((el) => {
          let action = el.dataset.action;
          if (!el.dataset.boundAction) {
            el.dataset.boundAction = "true";
            el.addEventListener("click", (e) => {
              if (typeof state[action] === "function") return state[action](e, state);
              let [globalName, globalMethod] = (action || "").split(".");
              if (typeof globalStates[globalName]?.[globalMethod] === "function") {
                globalStates[globalName][globalMethod](e, globalStates[globalName]);
              }
            });
          }
        });
      };
      core_default.prototype.unbind = function(state) {
        Object.values(localBindings.get(state)).forEach(
          (bindings2) => (
            // Remove each event listener
            bindings2.forEach(({ el, event, handler }) => el.removeEventListener(event, handler))
          )
        );
        [bindings, attrBindings].forEach((obj) => Object.keys(state).forEach((prop) => delete obj[prop]));
        localBindings.delete(state);
      };
    }
  });

  // src/component.js
  var component_exports = {};
  __export(component_exports, {
    default: () => component_default,
    startObserver: () => startObserver
  });
  function startObserver() {
    document.readyState !== "loading" ? components.observer() : document.addEventListener("DOMContentLoaded", () => components.observer());
  }
  var components, component_default;
  var init_component = __esm({
    "src/component.js"() {
      init_core();
      components = {
        // Registry for components
        registry: {},
        /**
         * Start observing the DOM for dynamically added components.
         * 
         * @returns {void}
         */
        observer() {
          new MutationObserver((mutations) => {
            mutations.forEach(({ addedNodes }) => {
              addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && this.registry[node.tagName.toLowerCase()]) this.mount(node, node.tagName.toLowerCase());
              });
            });
          }).observe(document.body, { childList: true, subtree: true });
        },
        /**
         * Register a new component.
         * 
         * @param {string} name - Component tag name.
         * @param {Function} template - Rendering function.
         * @param {Function | Object} [stateOrHandlers] - State function or event handlers.
         * @param {Function} [handlers] - Optional event handlers.
         */
        register(name, template, stateOrHandlers, handlers) {
          if (!stateOrHandlers && !handlers) return;
          let state = () => $.state({});
          let finalHandlers = () => {
          };
          if (typeof stateOrHandlers === "function") {
            try {
              state = typeof stateOrHandlers() === "object" ? stateOrHandlers : state;
            } catch {
              finalHandlers = stateOrHandlers;
            }
          }
          if (typeof handlers === "function") finalHandlers = handlers;
          this.registry[name.toLowerCase()] = { template, state, handlers: finalHandlers };
          document.querySelectorAll(name.toLowerCase()).forEach((el) => this.mount(el, name));
        },
        /**
         * Mount a component dynamically.
         * 
         * @param {HTMLElement} el - Element to replace.
         * @param {string} name - Component name.
         */
        mount(el, name) {
          const { template, state, handlers } = this.registry[name.toLowerCase()];
          if (el.dataset.__mounted) return;
          el.dataset.__mounted = "true";
          const props = Object.fromEntries([...el.attributes].map((attr) => [attr.name, attr.value]));
          const componentState = core_default.prototype.state({ ...state(), ...props });
          const rendered = this.render(template({ state: componentState, props }), componentState);
          el.replaceWith(rendered);
          $(rendered).bind(componentState);
          rendered.querySelectorAll(Object.keys(this.registry).join(",")).forEach((child) => this.mount(child, child.tagName.toLowerCase()));
          this.bind(rendered, handlers, componentState);
        },
        /**
         * Render an HTML string into a DOM element.
         * 
         * @param {string} html - Component HTML.
         * @param {Object} [state={}] - Optional state to bind.
         * @returns {HTMLElement} - Rendered DOM element.
         */
        render(html2, state = {}) {
          const container = document.createElement("div");
          container.innerHTML = html2.trim();
          const element2 = container.firstElementChild || null;
          if (!element2) return null;
          if (state) $(element2).bind(state);
          return element2;
        },
        /**
         * Attach event handlers to a mounted component.
         * 
         * @param {HTMLElement} rendered - Rendered component element.
         * @param {Function | Object} handlers - Event handlers.
         * @param {Object} componentState - Component state.
         */
        bind(rendered, handlers, componentState) {
          if (typeof handlers === "function") return handlers($(rendered), componentState);
          Object.entries(handlers).forEach(([event, actions]) => {
            $(rendered).on(event, "[data-action]", (e) => {
              const action = e.target.dataset.action;
              if (actions[action]) {
                actions[action](componentState, e);
                $(rendered).bind(componentState);
              }
            });
          });
        }
      };
      core_default.prototype.component = function(name, template, stateOrHandlers, handlers) {
        components.register(name, template, stateOrHandlers, handlers);
      };
      core_default.prototype.render = components.render;
      startObserver();
      component_default = components;
    }
  });

  // src/template.js
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
      if (!part._container) {
        part._container = document.createElement("span");
        part._container.style.display = "contents";
        part.node.parentNode.replaceChild(part._container, part.node);
      }
    }
    const container = part._container;
    const existing = part._items;
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
  var templateCache, EMPTY, TemplateResult, UnsafeHTML, MARKER_PREFIX, MARKER_SUFFIX;
  var init_template = __esm({
    "src/template.js"() {
      templateCache = /* @__PURE__ */ new WeakMap();
      EMPTY = Symbol("empty");
      TemplateResult = class {
        constructor(strings, values) {
          this.strings = strings;
          this.values = values;
        }
      };
      UnsafeHTML = class {
        constructor(value) {
          this.value = String(value ?? "");
        }
      };
      MARKER_PREFIX = "<!--anjs-";
      MARKER_SUFFIX = "-->";
    }
  });

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
  var init_morph = __esm({
    "src/morph.js"() {
    }
  });

  // src/element.js
  var element_exports = {};
  __export(element_exports, {
    AnJSElement: () => AnJSElement,
    html: () => html,
    registerComponent: () => registerComponent,
    unsafeHTML: () => unsafeHTML
  });
  var registerComponent, AnJSElement;
  var init_element = __esm({
    "src/element.js"() {
      init_template();
      init_morph();
      registerComponent = (name, ComponentClass) => {
        if (!customElements.get(name)) customElements.define(name, ComponentClass);
      };
      AnJSElement = class extends HTMLElement {
        // Define which attributes to observe (subclasses should override this)
        static get observedAttributes() {
          return [];
        }
        // Constructor initializes state
        constructor() {
          super();
          this._updatePending = false;
          this._initialized = false;
          this._computedDefs = /* @__PURE__ */ new Map();
          this.state = new Proxy($.state({}), {
            // Intercept property changes
            set: (target, prop, value) => {
              target[prop] = value;
              this._recompute(prop);
              if (!this._updatePending) {
                this._updatePending = true;
                queueMicrotask(() => {
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
        // Update DOM based on the current state
        update() {
          this._updatePending = false;
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
        }
        // Default render method (override in subclasses)
        render() {
          return `<p>${this.constructor.name} is not implemented yet.</p>`;
        }
      };
    }
  });

  // src/request.js
  var request_exports = {};
  __export(request_exports, {
    default: () => request_default,
    http: () => http,
    request: () => request
  });
  function mergeHeaders(customHeaders = {}, hasBody) {
    const headers = {
      "Accept": "application/json",
      ...customHeaders
    };
    if (hasBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    return headers;
  }
  function processBody(data, headers) {
    if (data instanceof FormData) {
      delete headers["Content-Type"];
      return data;
    }
    const isFormEncoded = headers["Content-Type"] === "application/x-www-form-urlencoded";
    return isFormEncoded ? new URLSearchParams(data).toString() : JSON.stringify(data);
  }
  function withTimeout(fetchPromise, timeout, url) {
    if (timeout === 0 || timeout == null) return fetchPromise;
    return Promise.race([
      // Fetch promise
      fetchPromise,
      // Timeout promise
      new Promise(
        (_, reject) => (
          // Reject with timeout error
          setTimeout(() => reject(new Error(`Request timed out: ${url}`)), timeout)
        )
      )
    ]);
  }
  function request(url, method = "GET", data = null, options = {}) {
    const { timeout = 5e3, signal } = options;
    const urlObj = new URL(url, window.location.origin);
    const hasBody = data && !["GET", "DELETE"].includes(method);
    const headers = mergeHeaders(options.headers, hasBody);
    const body = hasBody ? processBody(data, headers) : void 0;
    const fetchOptions = { method, headers, ...body && { body }, ...signal && { signal } };
    const fetchPromise = fetch(urlObj.toString(), fetchOptions).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
      const contentType = response.headers?.get("Content-Type") || "";
      return contentType.includes("application/json") ? response.json() : response.text();
    });
    return withTimeout(fetchPromise, timeout, url);
  }
  var http, request_default;
  var init_request = __esm({
    "src/request.js"() {
      init_core();
      core_default.prototype.request = function(url, method = "GET", data = null, options = {}) {
        return request(url, method, data, options);
      };
      http = {
        // Read operations (safe, idempotent)
        head: (url, options = {}) => request(url, "HEAD", null, options),
        get: (url, options = {}) => request(url, "GET", null, options),
        options: (url, options = {}) => request(url, "OPTIONS", null, options),
        // Write operations (modifying data)
        post: (url, data, options = {}) => request(url, "POST", data, options),
        put: (url, data, options = {}) => request(url, "PUT", data, options),
        patch: (url, data, options = {}) => request(url, "PATCH", data, options),
        delete: (url, options = {}) => request(url, "DELETE", null, options),
        // Utilities
        abortController: () => new AbortController()
      };
      request_default = http;
    }
  });

  // src/animate.js
  var animate_exports = {};
  var init_animate = __esm({
    "src/animate.js"() {
      init_core();
      Object.assign(core_default.prototype, {
        /**
         * Animate elements with CSS transitions.
         * 
         * @param {Object} styles - CSS properties to animate.
         * @param {number} [duration=400] - Duration in milliseconds.
         * @param {string} [easing="ease"] - Easing function.
         * @returns {AnJS} - The current AnJS instance for chaining.
         */
        animate(styles, duration = 400, easing = "ease") {
          return this.each((el) => {
            el.style.transition = `all ${duration}ms ${easing}`;
            Object.assign(el.style, styles);
            if (duration > 0) setTimeout(() => el.style.transition = "", duration);
          });
        },
        /**
         * Fade elements to a specific opacity.
         * 
         * @param {number} [opacity] - Target opacity (0 to 1).
         * @param {number} [duration=400] - Duration in milliseconds.
         * @returns {AnJS} - The current AnJS instance for chaining.
         */
        fade(opacity = +(this[0]?.style.opacity === "0"), duration = 400) {
          return this.animate({ opacity }, duration);
        },
        /**
         * Fade elements in or out.
         * 
         * @param {number} [duration=400] - Duration in milliseconds.
         * @return {AnJS} - The current AnJS instance for chaining.
         */
        fadeIn(duration) {
          return this.fade(1, duration);
        },
        /**
         * Fade elements out.
         * 
         * @param {number} [duration=400] - Duration in milliseconds.
         * @return {AnJS} - The current AnJS instance for chaining.
         */
        fadeOut(duration) {
          return this.fade(0, duration);
        }
      });
    }
  });

  // src/prebuilt.js
  init_core();

  // src/dom.js
  init_core();
  Object.assign(core_default.prototype, {
    /**
     * Get or set text or HTML content
     * 
     * @param {string} [value] - Content to set.
     * @param {boolean} [html=false] - Whether to set/get as HTML (true) or text (false).
     * @returns {string | AnJS} - Content if getting, or self for chaining if setting.
     */
    content(value, html2 = false) {
      if (value === void 0) {
        if (!this[0]) return "";
        return html2 ? this[0].innerHTML : this[0].textContent;
      }
      return this.each((el) => html2 ? el.innerHTML = value : el.textContent = value);
    },
    /**
     * Get or set text content
     * 
     * @param {string} [value] - Text content to set.
     * @return {string | AnJS} - Text content if getting, or self for chaining if setting.
     */
    text(value) {
      return this.content(value, false);
    },
    /**
     * Get or set HTML content
     * 
     * @param {string} [value] - HTML content to set.
     * @return {string | AnJS} - HTML content if getting, or self for chaining if setting.
     */
    html(value) {
      return this.content(value, true);
    },
    /**
     * Get or set CSS styles
     * 
     * @param {string} name - CSS property name.
     * @param {string} [value] - CSS value to set.
     * @returns {string | AnJS} - CSS value if getting, or self for chaining if setting.
     */
    css(name, value) {
      if (value === void 0) return this[0]?.style.getPropertyValue(name) || "";
      return this.each((el) => el.style[name] = value);
    },
    /**
     * Add, remove, or toggle a class
     * 
     * @param {string} name - Class name.
     * @param {boolean} [add] - Add (true), Remove (false), Toggle (undefined).
     * @returns {AnJS} - Self for chaining.
     */
    class(name, add) {
      return this.each((el) => el.classList[add === void 0 ? "toggle" : add ? "add" : "remove"](name));
    },
    /**
     * Show or hide elements
     * 
     * @param {boolean} show - Show (true), Hide (false).
     * @returns {AnJS} - Self for chaining.
     */
    display(show) {
      return this.each((el) => el.style.display = show ? "" : "none");
    },
    /**
     * Show or hide elements
     * 
     * @returns {AnJS} - Self for chaining.
     */
    hide() {
      return this.display(false);
    },
    /**
     * Show elements
     * 
     * @returns {AnJS} - Self for chaining.
     */
    show() {
      return this.display(true);
    },
    /**
     * Remove elements from the DOM
     * 
     * @returns {AnJS} - Self for chaining.
     */
    remove() {
      return this.each((el) => el.remove());
    },
    /**
     * Empty elements (remove all children)
     * 
     * @returns {AnJS} - Self for chaining.
     */
    empty() {
      return this.each((el) => el.innerHTML = "");
    },
    /**
     * Insert content relative to the selected element(s)
     *
     * @param {string | HTMLElement | HTMLElement[]} content - HTML string, element, or array of elements.
     * @param {string} position - 'before', 'prepend', 'append', 'after'.
     * @returns {AnJS} - Chainable instance.
     */
    insert(content, position = "before") {
      const positions = { before: "beforeBegin", prepend: "afterBegin", append: "beforeEnd", after: "afterEnd" };
      if (!positions[position]) return this;
      return this.each((target) => {
        if (typeof content === "string") return target.insertAdjacentHTML(positions[position], content);
        (Array.isArray(content) ? content : [content]).forEach(
          (el) => (
            // Insert element at specified position
            target.insertAdjacentElement(positions[position], el.cloneNode(true))
          )
        );
      });
    },
    /**
     * Get or set a property
     *
     * @param {string} name - Property name.
     * @param {any} value - Property value (optional).
     * @returns {any | AnJS} - Property value if getting, or self for chaining if setting.
     */
    prop(name, value) {
      if (arguments.length === 1) return this[0]?.[name];
      return this.each((el) => el[name] = value);
    },
    /**
     * Get or set the value of form elements
     * 
     * @param {string} [value] - The value to set (if provided).
     * @returns {string | AnJS} - The current value if getting, or the AnJS instance if setting.
     */
    val(value) {
      if (arguments.length === 0) return this[0]?.value;
      return this.each((el) => el.value = value);
    },
    /**
     * Check if the first selected element has a class
     * 
     * @param {string} className - Class name.
     * @returns {boolean} - True if the class exists, otherwise false.
     */
    has(className) {
      return this[0]?.classList.contains(className) ?? false;
    },
    /**
     * Focus on the first selected element
     * 
     * @returns {AnJS} - Self for chaining.
     */
    focus() {
      this[0]?.focus();
      return this;
    },
    /**
     * Remove focus from the first selected element
     * 
     * @returns {AnJS} - Self for chaining.
     */
    blur() {
      this[0]?.blur();
      return this;
    }
  });

  // src/attributes.js
  init_core();
  Object.assign(core_default.prototype, {
    /**
     * Get or set an attribute on selected elements
     * 
     * @param {string} name - Attribute name.
     * @param {string} [value] - Attribute value (if setting).
     * @returns {string | AnJS} - Attribute value if getting, AnJS instance if setting.
     */
    attr(name, value) {
      if (value === void 0) return this[0]?.getAttribute(name);
      if (value === null) return this.each((el) => el.removeAttribute(name));
      return this.each((el) => el.setAttribute(name, value));
    },
    /**
     * Get or set the id attribute
     * 
     * @param {string} [value] - The id to set.
     * @returns {string | AnJS} - The id if getting, otherwise chainable.
     */
    id(value) {
      return value === void 0 ? this.attr("id") : this.attr("id", value);
    },
    /**
     * Remove an attribute from selected elements
     * 
     * @param {string} name - Attribute name to remove.
     * @returns {AnJS} - Returns self for chaining.
     */
    removeAttr(name) {
      return this.attr(name, null);
    },
    /**
     * Serialize form data from the first selected element
     * 
     * @returns {string} - URL-encoded form data string or an empty string if not a form.
     */
    serialize() {
      return this[0] instanceof HTMLFormElement ? new URLSearchParams(new FormData(this[0])).toString() : "";
    }
  });

  // src/events.js
  init_core();
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
     */
    listen(event, handler) {
      if (!eventBus[event]) eventBus[event] = [];
      eventBus[event].push(handler);
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

  // src/alias.js
  init_core();
  ["append", "prepend", "before", "after"].forEach(
    (method) => (
      // Create alias method
      core_default.prototype[method] = function(content) {
        return this.insert(content, method);
      }
    )
  );
  ["click", "change", "submit", "keydown", "keyup", "mouseover", "mouseout"].forEach((event) => {
    core_default.prototype[event] = function(callback) {
      return callback ? this.on(event, callback) : this.trigger(event);
    };
  });

  // src/utilities.js
  var trim = (string) => string.trim();
  var json = (string) => {
    try {
      return JSON.parse(string);
    } catch {
      return null;
    }
  };
  var range = (x, min, max) => (x - min) * (x - max) <= 0;
  var isFunction = (obj) => typeof obj === "function";
  var isObject = (obj) => obj !== null && typeof obj === "object";
  var isString = (obj) => typeof obj === "string";
  var isNumber = (obj) => typeof obj === "number" && !isNaN(obj);
  var contains = (parent, child) => parent !== child && parent.contains(child);
  var debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };
  var throttle = (fn, limit) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn(...args);
      }
    };
  };
  var element = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    children.forEach((child) => el.append(child instanceof Node ? child : document.createTextNode(child)));
    return el;
  };
  var utilities_default = { trim, json, range, isFunction, isObject, isString, isNumber, contains, debounce, throttle, element };

  // src/extend.js
  init_core();
  var extend = function(name, func, force = false) {
    if (typeof name === "object") {
      if (typeof func === "boolean") force = func;
      return Object.keys(name).forEach((key) => extend(key, name[key], force));
    }
    if (!force && core_default.prototype.hasOwnProperty(name)) return;
    core_default.prototype[name] = func;
  };
  var extend_default = { extend };

  // src/prebuilt.js
  if (typeof FEATURE_HTTP === "undefined") globalThis.FEATURE_HTTP = true;
  if (typeof FEATURE_ANIMATE === "undefined") globalThis.FEATURE_ANIMATE = true;
  if (typeof FEATURE_SELECTION === "undefined") globalThis.FEATURE_SELECTION = true;
  if (typeof FEATURE_FILTERING === "undefined") globalThis.FEATURE_FILTERING = true;
  if (typeof FEATURE_TRAVERSAL === "undefined") globalThis.FEATURE_TRAVERSAL = true;
  if (false) globalThis.FEATURE_STATE = true;
  if (false) globalThis.FEATURE_COMPONENTS = true;
  if (false) globalThis.FEATURE_ELEMENTS = true;
  function $2(selector) {
    return new core_default(selector);
  }
  ["on", "off", "trigger"].forEach((method) => {
    $2[method] = (...args) => core_default.prototype[method].apply($2(), args);
  });
  if (FEATURE_SELECTION) {
    Promise.resolve().then(() => (init_filtering(), filtering_exports)).then((mod) => Object.assign($2, mod));
    Promise.resolve().then(() => (init_traversal(), traversal_exports)).then((mod) => Object.assign($2, mod));
  }
  if (true) Promise.resolve().then(() => (init_state(), state_exports)).then(() => {
    ["state", "global"].forEach((module) => {
      $2[module] = (...args) => core_default.prototype[module].apply($2(), args);
    });
  });
  if (true) {
    Promise.resolve().then(() => (init_component(), component_exports)).then((mod) => {
      ["component"].forEach((module) => {
        $2[module] = (...args) => core_default.prototype[module].apply($2(), args);
      });
      $2.define = (name, componentClass) => customElements.define(name, componentClass);
    });
  }
  if (true) Promise.resolve().then(() => init_element());
  if (FEATURE_HTTP) Promise.resolve().then(() => (init_request(), request_exports)).then((mod) => {
    Object.assign($2, mod.http);
  });
  if (FEATURE_ANIMATE) Promise.resolve().then(() => init_animate());
  Object.assign($2, bus, utilities_default, extend_default);
  $2["define"] = (name, componentClass) => customElements.define(name, componentClass);
  if (typeof window !== "undefined") window.$ = $2;
  var prebuilt_default = $2;
})();
window.$ = $;
//# sourceMappingURL=almostno.full.js.map
