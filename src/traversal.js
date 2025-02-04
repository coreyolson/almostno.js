// Dependencies
import AnJS from "./core.js";

/**
 * Select the next sibling element
 * 
 * @returns {AnJS} - New AnJS instance with the next sibling.
 */
AnJS.prototype.next = function () {

    // Return new AnJS instance with the next sibling
    return new AnJS(this[0]?.nextElementSibling ? [this[0].nextElementSibling] : []);
};

/**
 * Select the previous sibling element
 * 
 * @returns {AnJS} - New AnJS instance with the previous sibling.
 */
AnJS.prototype.prev = function () {

    // Return new AnJS instance with the previous sibling
    return new AnJS(this[0]?.previousElementSibling ? [this[0].previousElementSibling] : []);
};

/**
 * Select the parent element
 * 
 * @returns {AnJS} - New AnJS instance with the parent.
 */
AnJS.prototype.parent = function () {

    // Return new AnJS instance with the parent
    return new AnJS(this[0]?.parentElement ? [this[0].parentElement] : []);
};

/**
 * Select child elements
 * 
 * @returns {AnJS} - New AnJS instance with children.
 */
AnJS.prototype.children = function () {

    // Return new AnJS instance with children
    return new AnJS(this[0] ? [...this[0].children] : []);
};

/**
 * Select all sibling elements
 * 
 * @returns {AnJS} - New AnJS instance with all siblings except the current element.
 */
AnJS.prototype.siblings = function () {

    // Return new AnJS instance with all siblings except the current element
    return new AnJS(this[0]?.parentElement ? [...this[0].parentElement.children].filter(el => el !== this[0]) : []);
};

/**
 * Select the closest ancestor matching a selector
 * 
 * @param {string} selector - CSS selector to match.
 * @returns {AnJS} - New AnJS instance with the closest matching ancestor.
 */
AnJS.prototype.closest = function (selector) {

    // Return new AnJS instance with the closest matching ancestor
    return new AnJS(this[0]?.closest(selector) ? [this[0].closest(selector)] : []);
};