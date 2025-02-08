// Check if AnJS is already defined globally
const globalScope = typeof window !== "undefined" ? window : global;

// Check if AnJS is already defined globally
if (!globalScope.__AnJS__) {

    // Core Selector Class
    class AnJS extends Array {

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

            // Return all elements if no index is provided
            return index === undefined ? this : this.at(index);
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
    
    // Assign AnJS to a global variable
    globalScope.__AnJS__ = AnJS;
}

// Export the globally defined AnJS class
export default globalScope.__AnJS__;