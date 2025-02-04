/* AlmostNo.js v0.9.14 */
(() => {
  // src/core.js
  var AnJS = class extends Array {
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
      if (index === void 0) return [...this];
      return this.at(index);
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
  };

  // src/dom.js
  AnJS.prototype.content = function(value, html = false) {
    if (value === void 0) {
      if (!this[0]) return "";
      return html ? this[0].innerHTML : this[0].textContent;
    }
    return this.each((el) => html ? el.innerHTML = value : el.textContent = value);
  };
  AnJS.prototype.text = function(value) {
    return this.content(value, false);
  };
  AnJS.prototype.html = function(value) {
    return this.content(value, true);
  };
  AnJS.prototype.css = function(name, value) {
    if (value === void 0) return this[0] ? getComputedStyle(this[0])[name] : "";
    return this.each((el) => el.style[name] = value);
  };
  AnJS.prototype.class = function(name, add) {
    return this.each((el) => el.classList[add === void 0 ? "toggle" : add ? "add" : "remove"](name));
  };
  AnJS.prototype.display = function(show) {
    return this.each((el) => el.style.display = show ? "" : "none");
  };
  AnJS.prototype.remove = function() {
    return this.each((el) => el.remove());
  };
  AnJS.prototype.empty = function() {
    return this.each((el) => el.innerHTML = "");
  };
  AnJS.prototype.insert = function(content, position = "before") {
    const positions = {
      "before": "beforeBegin",
      "prepend": "afterBegin",
      "append": "beforeEnd",
      "after": "afterEnd"
    };
    if (!positions[position]) return this;
    const clones = Array.isArray(content) ? content.map((el) => el.cloneNode(true)) : null;
    return this.each((target) => {
      if (typeof content === "string") target.insertAdjacentHTML(positions[position], content);
      else if (clones) clones.forEach((el) => target.insertAdjacentElement(positions[position], el));
      else target.insertAdjacentElement(positions[position], content.cloneNode(true));
    });
  };
  AnJS.prototype.prop = function(name, value) {
    if (arguments.length === 1) return this[0]?.[name];
    return this.each((el) => el[name] = value);
  };
  AnJS.prototype.val = function(value) {
    if (arguments.length === 0) return this[0]?.value;
    return this.each((el) => el.value = value);
  };
  AnJS.prototype.has = function(className) {
    return this[0]?.classList.contains(className) ?? false;
  };
  AnJS.prototype.focus = function() {
    this[0]?.focus();
    return this;
  };
  AnJS.prototype.blur = function() {
    this[0]?.blur();
    return this;
  };

  // src/traversal.js
  AnJS.prototype.next = function() {
    return new AnJS(this[0]?.nextElementSibling ? [this[0].nextElementSibling] : []);
  };
  AnJS.prototype.prev = function() {
    return new AnJS(this[0]?.previousElementSibling ? [this[0].previousElementSibling] : []);
  };
  AnJS.prototype.parent = function() {
    return new AnJS(this[0]?.parentElement ? [this[0].parentElement] : []);
  };
  AnJS.prototype.children = function() {
    return new AnJS(this[0] ? [...this[0].children] : []);
  };
  AnJS.prototype.siblings = function() {
    return new AnJS(this[0]?.parentElement ? [...this[0].parentElement.children].filter((el) => el !== this[0]) : []);
  };
  AnJS.prototype.closest = function(selector) {
    return new AnJS(this[0]?.closest(selector) ? [this[0].closest(selector)] : []);
  };

  // src/attributes.js
  AnJS.prototype.id = function(value) {
    if (value === void 0) return this[0]?.id;
    return this.each((el) => el.id = value);
  };
  AnJS.prototype.attr = function(name, value) {
    if (value === void 0) return this[0]?.getAttribute(name);
    return this.each((el) => el.setAttribute(name, value));
  };
  AnJS.prototype.removeAttr = function(name) {
    return this.each((el) => el.removeAttribute(name));
  };
  AnJS.prototype.serialize = function() {
    return this[0] instanceof HTMLFormElement ? new URLSearchParams(new FormData(this[0])).toString() : "";
  };

  // src/events.js
  var eventStore = /* @__PURE__ */ new WeakMap();
  AnJS.prototype.on = function(event, selector, handler) {
    if (typeof selector === "function") return this.delegate(event, null, selector);
    return this.delegate(event, selector, handler);
  };
  AnJS.prototype.off = function(event, selector, handler) {
    if (typeof selector === "function") return this.undelegate(event, null, selector);
    return this.undelegate(event, selector, handler);
  };
  AnJS.prototype.delegate = function(event, selector, handler) {
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
  };
  AnJS.prototype.undelegate = function(event, selector, handler) {
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
  };
  AnJS.prototype.trigger = function(event) {
    return this.each((el) => el.dispatchEvent(new Event(event, { bubbles: true })));
  };

  // src/filtering.js
  AnJS.prototype.filter = function(callbackOrSelector) {
    if (typeof callbackOrSelector === "function") return new AnJS([...this].filter(callbackOrSelector));
    return new AnJS([...this].filter((el) => el.matches(callbackOrSelector)));
  };
  AnJS.prototype.find = function(selector) {
    return new AnJS(this.flatMap((el) => [...el.querySelectorAll(selector)]));
  };
  AnJS.prototype.first = function() {
    return new AnJS(this.length ? [this[0]] : []);
  };
  AnJS.prototype.last = function() {
    return new AnJS(this.length ? [this[this.length - 1]] : []);
  };
  AnJS.prototype.even = function() {
    return new AnJS(this.filter((_, index) => index % 2 === 0));
  };
  AnJS.prototype.odd = function() {
    return new AnJS(this.filter((_, index) => index % 2 !== 0));
  };

  // src/animate.js
  AnJS.prototype.animate = function(styles, duration = 400, easing = "ease") {
    return this.each((el) => {
      el.style.transition = `all ${duration}ms ${easing}`;
      requestAnimationFrame(() => Object.assign(el.style, styles));
      setTimeout(() => el.style.transition = "", duration);
    });
  };
  AnJS.prototype.fade = function(opacity = null, duration = 400) {
    return this.animate({ opacity: opacity ?? (this[0]?.style.opacity === "0" ? 1 : 0) }, duration);
  };
  AnJS.prototype.fadeIn = function(duration = 400) {
    return this.fade(1, duration);
  };
  AnJS.prototype.fadeOut = function(duration = 400) {
    return this.fade(0, duration);
  };

  // src/state.js
  var bindings = {};
  var attrBindings = {};
  AnJS.prototype.state = function(initialState = {}) {
    const proxyState = new Proxy(initialState, {
      // Trap: Retrieve property value
      get(target, prop) {
        return target[prop];
      },
      // Trap: Set property value and update UI
      set(target, prop, value) {
        target[prop] = value;
        if (bindings[prop]) bindings[prop].forEach((el) => el.textContent = value);
        if (attrBindings[prop]) attrBindings[prop].forEach(({ el, attr }) => el.setAttribute(attr, value));
        return true;
      }
    });
    this.bind(proxyState);
    return proxyState;
  };
  AnJS.prototype.bind = function(state, context = document) {
    context.querySelectorAll("[data-bind]").forEach((el) => {
      const prop = el.getAttribute("data-bind");
      if (!bindings[prop]) bindings[prop] = [];
      bindings[prop].push(el);
      el.textContent = state[prop] ?? "";
    });
    context.querySelectorAll("[data-bind-attr]").forEach((el) => {
      const [attr, prop] = el.getAttribute("data-bind-attr").split(":");
      if (!attrBindings[prop]) attrBindings[prop] = [];
      attrBindings[prop].push({ el, attr });
      el.setAttribute(attr, state[prop] ?? "");
      if (attr === "value" && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        el.addEventListener("input", () => state[prop] = el.value);
      }
    });
    context.querySelectorAll("[data-on]").forEach((el) => {
      const [event, method] = el.getAttribute("data-on").split(":");
      el.addEventListener(event, (e) => {
        if (typeof state[method] === "function") {
          state[method](e, state);
        }
      });
    });
  };
  AnJS.prototype.unbind = function(state) {
    Object.keys(state).forEach((key) => {
      delete bindings[key];
      delete attrBindings[key];
    });
  };
  document.addEventListener("DOMContentLoaded", () => {
    if (window.AnJSState) {
      AnJS.prototype.bind(window.AnJSState);
    }
  });

  // src/alias.js
  ["append", "prepend", "before", "after"].forEach(
    (method) => (
      // Create alias method
      AnJS.prototype[method] = function(content) {
        return this.insert(content, method);
      }
    )
  );
  ["click", "change", "submit", "keydown", "keyup", "mouseover", "mouseout"].forEach((event) => {
    AnJS.prototype[event] = function(callback) {
      return callback ? this.on(event, callback) : this.trigger(event);
    };
  });
  AnJS.prototype.hide = function() {
    return this.display(false);
  };
  AnJS.prototype.show = function() {
    return this.display(true);
  };

  // src/request.js
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
    const hasBody = method !== "GET" && method !== "DELETE" && data;
    const headers = mergeHeaders(options.headers, hasBody);
    const body = hasBody ? processBody(data, headers) : void 0;
    const fetchOptions = { method, headers };
    if (body !== void 0) fetchOptions.body = body;
    if (signal) fetchOptions.signal = signal;
    const fetchPromise = fetch(urlObj.toString(), fetchOptions).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
      const contentType = response.headers?.get("Content-Type") || "";
      return contentType.includes("application/json") ? response.json() : response.text();
    });
    return withTimeout(fetchPromise, timeout, url);
  }
  AnJS.prototype.request = function(url, method = "GET", data = null, options = {}) {
    return request(url, method, data, options);
  };
  var http = {
    get: (url, options = {}) => request(url, "GET", null, options),
    delete: (url, options = {}) => request(url, "DELETE", null, options),
    post: (url, data, options = {}) => request(url, "POST", data, options),
    put: (url, data, options = {}) => request(url, "PUT", data, options),
    patch: (url, data, options = {}) => request(url, "PATCH", data, options),
    abortController: () => new AbortController()
  };
  var request_default = http;

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
  var extend = function(name, func, force = false) {
    if (typeof name === "object") {
      if (typeof func === "boolean") force = func;
      return Object.keys(name).forEach((key) => extend(key, name[key], force));
    }
    if (!force && AnJS.prototype.hasOwnProperty(name)) return;
    AnJS.prototype[name] = func;
  };
  var extend_default = { extend };

  // src/index.js
  function $(selector) {
    return new AnJS(selector);
  }
  Object.assign($, request_default, utilities_default, extend_default);
  if (typeof window !== "undefined") window.$ = $;
  var index_default = $;
})();
window.$ = $;
