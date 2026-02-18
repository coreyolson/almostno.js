/* AlmostNo.js v1.3.0 Core */
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
    content(value, html = false) {
      if (value === void 0) {
        if (!this[0]) return "";
        return html ? this[0].innerHTML : this[0].textContent;
      }
      return this.each((el) => html ? el.innerHTML = value : el.textContent = value);
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
  if (false) globalThis.FEATURE_ANIMATE = true;
  if (false) globalThis.FEATURE_SELECTION = true;
  if (typeof FEATURE_FILTERING === "undefined") globalThis.FEATURE_FILTERING = true;
  if (typeof FEATURE_TRAVERSAL === "undefined") globalThis.FEATURE_TRAVERSAL = true;
  if (false) globalThis.FEATURE_STATE = true;
  if (false) globalThis.FEATURE_COMPONENTS = true;
  if (false) globalThis.FEATURE_ELEMENTS = true;
  function $(selector) {
    return new core_default(selector);
  }
  ["on", "off", "trigger"].forEach((method) => {
    $[method] = (...args) => core_default.prototype[method].apply($(), args);
  });
  if (false) {
    null.then((mod) => Object.assign($, mod));
    null.then((mod) => Object.assign($, mod));
  }
  if (false) null.then(() => {
    ["state", "global"].forEach((module) => {
      $[module] = (...args) => core_default.prototype[module].apply($(), args);
    });
  });
  if (false) {
    null.then((mod) => {
      ["component"].forEach((module) => {
        $[module] = (...args) => core_default.prototype[module].apply($(), args);
      });
      $.define = (name, componentClass) => customElements.define(name, componentClass);
    });
  }
  if (false) ;
  if (FEATURE_HTTP) Promise.resolve().then(() => (init_request(), request_exports)).then((mod) => {
    Object.assign($, mod.http);
  });
  if (false) ;
  Object.assign($, bus, utilities_default, extend_default);
  $["define"] = (name, componentClass) => customElements.define(name, componentClass);
  if (typeof window !== "undefined") window.$ = $;
  var prebuilt_default = $;
})();
window.$ = $;
//# sourceMappingURL=almostno.js.map
