// Dependencies
import AnJS from './core.js';

/**
 * Get or set the id attribute
 * 
 * @param {string} [value] - The id to set.
 * @returns {string | AnJS} - The id if getting, otherwise chainable.
 */
AnJS.prototype.id = function (value) {

    // Get or set the id attribute
    if (value === undefined) return this[0]?.id;

    // Set the id attribute
    return this.each(el => (el.id = value));
};

/**
 * Get or set an attribute on selected elements
 * 
 * @param {string} name - Attribute name.
 * @param {string} [value] - Attribute value (if setting).
 * @returns {string | AnJS} - Attribute value if getting, AnJS instance if setting.
 */
AnJS.prototype.attr = function (name, value) {

    // Get attribute
    if (value === undefined) return this[0]?.getAttribute(name);

    // Set attribute
    return this.each(el => el.setAttribute(name, value));
};

/**
 * Remove an attribute from selected elements
 * 
 * @param {string} name - Attribute name to remove.
 * @returns {AnJS} - Returns self for chaining.
 */
AnJS.prototype.removeAttr = function (name) {

    // Remove attribute from all elements
    return this.each(el => el.removeAttribute(name));
};

/**
 * Serialize form data from the first selected element
 * 
 * @returns {string} - URL-encoded form data string or an empty string if not a form.
 */
AnJS.prototype.serialize = function () {

    // Ensure the selected element is a form before serializing
    return this[0] instanceof HTMLFormElement ? new URLSearchParams(new FormData(this[0])).toString() : '';
};