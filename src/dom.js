// Dependencies
import AnJS from './core.js';

// Batch assign methods to AnJS prototype
Object.assign(AnJS.prototype, {

    /**
     * Get or set text or HTML content
     * 
     * @param {string} [value] - Content to set.
     * @param {boolean} [html=false] - Whether to set/get as HTML (true) or text (false).
     * @returns {string | AnJS} - Content if getting, or self for chaining if setting.
     */
    content(value, html = false) {

        // Get content
        if (value === undefined) {

            // Return empty string if no elements exist
            if (!this[0]) return '';

            // Return HTML or text content
            return html ? this[0].innerHTML : this[0].textContent;
        }

        // Set content
        return this.each(el => html ? (el.innerHTML = value) : (el.textContent = value));
    },

    /**
     * Get or set text content
     * 
     * @param {string} [value] - Text content to set.
     * @return {string | AnJS} - Text content if getting, or self for chaining if setting.
     */
    text(value) { 
        
        // Convenience wrapper
        return this.content(value, false); 
    },
    
    /**
     * Get or set HTML content
     * 
     * @param {string} [value] - HTML content to set.
     * @return {string | AnJS} - HTML content if getting, or self for chaining if setting.
     */
    html(value) { 
       
        // Convenience wrapper
        return this.content(value, true); 
    },

    /**
     * Get or set CSS styles
     * 
     * @param {string} name - CSS property name.
     * @param {string} [value] - CSS value to set.
     * @returns {string | AnJS} - CSS value if getting, or self for chaining if setting.
     */
    css(name, value) {

        // Get computed CSS value
        if (value === undefined) return this[0]?.style.getPropertyValue(name) || '';

        // Set CSS value
        return this.each(el => el.style[name] = value);
    },

    /**
     * Add, remove, or toggle a class
     * 
     * @param {string} name - Class name.
     * @param {boolean} [add] - Add (true), Remove (false), Toggle (undefined).
     * @returns {AnJS} - Self for chaining.
     */
    class(name, add) {

        // Add, remove, or toggle class
        return this.each(el => el.classList[add === undefined ? 'toggle' : add ? 'add' : 'remove'](name));
    },

    /**
     * Show or hide elements
     * 
     * @param {boolean} show - Show (true), Hide (false).
     * @returns {AnJS} - Self for chaining.
     */
    display(show) {

        // Show or hide elements
        return this.each(el => el.style.display = show ? '' : 'none');
    },

    /**
     * Show or hide elements
     * 
     * @returns {AnJS} - Self for chaining.
     */
    hide() { 
        
        // Hide elements
        return this.display(false); 
    },

    /**
     * Show elements
     * 
     * @returns {AnJS} - Self for chaining.
     */
    show() { 
        
        // Show elements
        return this.display(true); 
    },

    /**
     * Remove elements from the DOM
     * 
     * @returns {AnJS} - Self for chaining.
     */
    remove() {

        // Remove elements
        return this.each(el => el.remove());
    },

    /**
     * Empty elements (remove all children)
     * 
     * @returns {AnJS} - Self for chaining.
     */
    empty() {

        // Empty elements // TODO: Clear input, textarea, select, etc. ..?
        return this.each(el => el.innerHTML = '');
    },

    /**
     * Insert content relative to the selected element(s)
     *
     * @param {string | HTMLElement | HTMLElement[]} content - HTML string, element, or array of elements.
     * @param {string} position - 'before', 'prepend', 'append', 'after'.
     * @returns {AnJS} - Chainable instance.
     */
    insert(content, position = 'before') {

        // Allowed positions
        const positions = { before: 'beforeBegin', prepend: 'afterBegin', append: 'beforeEnd', after: 'afterEnd' };

        // Validate position
        if (!positions[position]) return this;

        // Insert content at specified position
        return this.each(target => {

            // Insert HTML string
            if (typeof content === 'string') return target.insertAdjacentHTML(positions[position], content);

            // Insert element(s)
            (Array.isArray(content) ? content : [content]).forEach(el =>

                // Insert element at specified position
                target.insertAdjacentElement(positions[position], el.cloneNode(true))
            );
        });
    },

    /**
     * Get or set a property
     *
     * @param {string} name - Property name.
     * @param {any} value - Property value (optional).
     * @returns {any | AnJS} - Property value if getting, or self for chaining if setting.
     */
    prop(name, value) {

        // Get property value if no second argument is provided
        if (arguments.length === 1) return this[0]?.[name];

        // Set property value
        return this.each(el => el[name] = value);
    },

    /**
     * Get or set the value of form elements
     * 
     * @param {string} [value] - The value to set (if provided).
     * @returns {string | AnJS} - The current value if getting, or the AnJS instance if setting.
     */
    val(value) {

        // Get value if no argument is passed
        if (arguments.length === 0) return this[0]?.value;

        // Set value
        return this.each(el => el.value = value);
    },

    /**
     * Check if the first selected element has a class
     * 
     * @param {string} className - Class name.
     * @returns {boolean} - True if the class exists, otherwise false.
     */
    has(className) {

        // Check if the first element has the class
        return this[0]?.classList.contains(className) ?? false;
    },

    /**
     * Focus on the first selected element
     * 
     * @returns {AnJS} - Self for chaining.
     */
    focus() {

        // Focus on the first element
        this[0]?.focus();

        // Return self for chaining
        return this;
    },

    /**
     * Remove focus from the first selected element
     * 
     * @returns {AnJS} - Self for chaining.
     */
    blur() {

        // Remove focus from the first element
        this[0]?.blur();

        // Return self for chaining
        return this;
    }
});