// Dependencies
import AnJS from './core.js';

/**
 * Filter elements based on a callback function or CSS selector
 * 
 * @param {Function | string} callbackOrSelector - Callback function or CSS selector.
 * @returns {AnJS} - Returns a new instance of AnJS.
 */
AnJS.prototype.filter = function (callbackOrSelector) {

    // If a function is provided, use native Array filter
    if (typeof callbackOrSelector === "function") return new AnJS([...this].filter(callbackOrSelector));

    // Otherwise, assume it's a CSS selector and filter elements that match
    return new AnJS([...this].filter(el => el.matches(callbackOrSelector)));
};

/**
 * Find child elements by a CSS selector
 * 
 * @param {string} selector - CSS selector to find child elements.
 * @returns {AnJS} - Returns a new instance of AnJS.
 */
AnJS.prototype.find = function (selector) {

    // Select all matching children of each element in the collection
    return new AnJS(this.flatMap(el => [...el.querySelectorAll(selector)]));
};

/**
 * Select the first element from the current selection
 * 
 * @returns {AnJS} - Returns a new instance of AnJS.
 */
AnJS.prototype.first = function () {

    // Keep only the first element
    return new AnJS(this.length ? [this[0]] : []);
};

/**
 * Select the last element from the current selection
 * 
 * @returns {AnJS} - Returns a new instance of AnJS.
 */
AnJS.prototype.last = function () {

    // Keep only the last element
    return new AnJS(this.length ? [this[this.length - 1]] : []);
};

/**
 * Select only elements with an even index
 * 
 * @returns {AnJS} - Returns a new instance of AnJS.
 */
AnJS.prototype.even = function () {

    // Select elements with even indices
    return new AnJS(this.filter((_, index) => index % 2 === 0));
};

/**
 * Select only elements with an odd index
 * 
 * @returns {AnJS} - Returns a new instance of AnJS.
 */
AnJS.prototype.odd = function () {

    // Select elements with odd indices
    return new AnJS(this.filter((_, index) => index % 2 !== 0));
};