/* AlmostNo.js v1.2.1 Utilities (CJS) */
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

// src/utilities.js
var utilities_exports = {};
__export(utilities_exports, {
  default: () => utilities_default
});
module.exports = __toCommonJS(utilities_exports);
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
