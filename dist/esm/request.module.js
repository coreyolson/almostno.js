/* AlmostNo.js v1.2.1 Request (ESM) */

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
core_default.prototype.request = function(url, method = "GET", data = null, options = {}) {
  return request(url, method, data, options);
};
var http = {
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
var request_default = http;
export {
  request_default as default,
  http,
  request
};
