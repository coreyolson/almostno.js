/* AlmostNo.js v1.2.1 Utilities (ESM) */

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
export {
  utilities_default as default
};
