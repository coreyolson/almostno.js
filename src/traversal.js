// Dependencies
import AnJS from "./core.js";

// Batch assign traversal methods to AnJS prototype
Object.assign(AnJS.prototype, {

    /**
     * Select the next sibling element
     * 
     * @returns {AnJS} - New AnJS instance with the next sibling.
     */
    next() {

        // Check if the first element exists and has a next sibling
        return new AnJS(this[0]?.nextElementSibling ? [this[0].nextElementSibling] : []);
    },

    /**
     * Select the previous sibling element
     * 
     * @returns {AnJS} - New AnJS instance with the previous sibling.
     */
    prev() {

        // Check if the first element exists and has a previous sibling
        return new AnJS(this[0]?.previousElementSibling ? [this[0].previousElementSibling] : []);
    },

    /**
     * Select the parent element
     * 
     * @returns {AnJS} - New AnJS instance with the parent.
     */
    parent() {

        // Check if the first element exists and has a parent
        return new AnJS(this[0]?.parentElement ? [this[0].parentElement] : []);
    },

    /**
     * Select child elements
     * 
     * @returns {AnJS} - New AnJS instance with children.
     */
    children() {

        // Check if the first element exists and has children
        return new AnJS(this[0] ? [...this[0].children] : []);
    },

    /**
     * Select all sibling elements
     * 
     * @returns {AnJS} - New AnJS instance with all siblings except the current element.
     */
    siblings() {

        // Get parent element
        const parent = this[0]?.parentElement;

        // Return siblings if parent exists, otherwise return empty
        return new AnJS(parent ? [...parent.children].filter(el => el !== this[0]) : []);
    },

    /**
     * Select the closest ancestor matching a selector
     * 
     * @param {string} selector - CSS selector to match.
     * @returns {AnJS} - New AnJS instance with the closest matching ancestor.
     */
    closest(selector) {

        // Check if the first element exists and find the closest matching ancestor
        return new AnJS(this[0]?.closest(selector) ? [this[0].closest(selector)] : []);
    }
});