// Core Selector Class
export default class AnJS extends Array {

    /**
     * Initialize AnJS
     * 
     * @param {string | HTMLElement | NodeList} query - CSS selector or element.
     */
    constructor(query) {

        // Initialize
        super();

        // Return if no query is provided
        if (!query) return;

        // Handle an Element
        if (query instanceof HTMLElement || query.nodeType === 1) this.push(query);

        // Handle NodeList or Array
        else if (query instanceof NodeList || Array.isArray(query)) this.push(...query);
        
        // Handle CSS selector string
        else if (typeof query === "string") this.push(...document.querySelectorAll(query));
    }

    /**
     * Iterate through elements
     * 
     * @param {Function} fn - Callback function.
     * @returns {AnJS} - Returns self for chaining.
     */
    each(fn) {

        // Iterate over selected elements
        this.forEach(fn);

        // Chainable
        return this;
    }

    /**
     * Get elements by index or return all
     * 
     * @param {number} [index] - The index of the element to retrieve.
     * @returns {HTMLElement | Array} - The specific element or an array of elements.
     */
    get(index) {

        // Return all elements
        if (index === undefined) return [...this];

        // Return specific element
        return this.at(index);
    }

    /**
     * Clone the first selected element
     * 
     * @param {boolean} [deep=true] - Clone children.
     * @returns {HTMLElement | null} - Cloned element.
     */
    clone(deep = true) {

        // Clone first element (shallow or deep)
        return this[0] ? this[0].cloneNode(deep) : null;
    }
}