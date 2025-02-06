// Dependencies
import AnJS from './core.js';

// Batch assign attribute methods to AnJS prototype
Object.assign(AnJS.prototype, {

    /**
     * Get or set an attribute on selected elements
     * 
     * @param {string} name - Attribute name.
     * @param {string} [value] - Attribute value (if setting).
     * @returns {string | AnJS} - Attribute value if getting, AnJS instance if setting.
     */
    attr(name, value) {

        // Get attribute
        if (value === undefined) return this[0]?.getAttribute(name);

        // Remove attribute if value is null
        if (value === null) return this.each(el => el.removeAttribute(name));

        // Set attribute
        return this.each(el => el.setAttribute(name, value));
    },

    /**
     * Get or set the id attribute
     * 
     * @param {string} [value] - The id to set.
     * @returns {string | AnJS} - The id if getting, otherwise chainable.
     */
    id(value) {

        // Get or set id attribute
        return value === undefined ? this.attr("id") : this.attr("id", value);
    },

    /**
     * Remove an attribute from selected elements
     * 
     * @param {string} name - Attribute name to remove.
     * @returns {AnJS} - Returns self for chaining.
     */
    removeAttr(name) {

        // Remove attribute
        return this.attr(name, null);
    },

    /**
     * Serialize form data from the first selected element
     * 
     * @returns {string} - URL-encoded form data string or an empty string if not a form.
     */
    serialize() {

        // Ensure the selected element is a form before serializing
        return this[0] instanceof HTMLFormElement ? new URLSearchParams(new FormData(this[0])).toString() : '';
    }
});