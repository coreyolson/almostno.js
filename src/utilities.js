/**
 * Trim a string
 * 
 * @param {string} string - String to trim.
 * @returns {string} - Trimmed string.
 */
const trim = string => string.trim();

/**
 * Parse JSON safely
 * 
 * @param {string} string - JSON string.
 * @returns {Object} - Parsed JSON.
 */
const json = string => { try { return JSON.parse(string); } catch { return null; } };

/**
 * Check if a number is within a range
 * 
 * @param {number} x - Value to check.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {boolean} - True if in range.
 */
const range = (x, min, max) => (x - min) * (x - max) <= 0;

/**
 * Check if a value is a function
 * 
 * @param {any} obj - Value to check.
 * @returns {boolean} - True if function.
 */
const isFunction = obj => typeof obj === "function";

/**
 * Check if a value is a plain object
 * 
 * @param {any} obj - Value to check.
 * @returns {boolean} - True if an object.
 */
const isObject = obj => obj !== null && typeof obj === "object";

/**
 * Check if a value is a string
 * 
 * @param {any} obj - Value to check.
 * @returns {boolean} - True if a string.
 */
const isString = obj => typeof obj === "string";

/**
 * Check if a value is a number
 * 
 * @param {any} obj - Value to check.
 * @returns {boolean} - True if a number.
 */
const isNumber = obj => typeof obj === "number" && !isNaN(obj);

/**
 * Check if an element is contained within another
 * 
 * @param {HTMLElement} parent - The parent element.
 * @param {HTMLElement} child - The child element.
 * @returns {boolean} - True if `child` is inside `parent`, but not equal to it.
 */
const contains = (parent, child) => parent !== child && parent.contains(child);

/**
 * Delay function execution until after a specified time
 * 
 * @param {Function} fn - Function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function} - Debounced function.
 */
const debounce = (fn, delay) => {

    // Timeout reference
    let timeout;

    // Return debounced function
    return (...args) => {

        // Clear previous timeout
        clearTimeout(timeout);

        // Set new timeout
        timeout = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Limit function execution to once within a time period
 * 
 * @param {Function} fn - Function to throttle.
 * @param {number} limit - Limit in milliseconds.
 * @returns {Function} - Throttled function.
 */
const throttle = (fn, limit) => {

    // Track last execution time
    let lastCall = 0;

    // Return throttled function
    return (...args) => {

        // Get current time
        const now = Date.now();

        // Execute if time has passed
        if (now - lastCall >= limit) {

            // Update last call
            lastCall = now;

            // Call function
            fn(...args);
        }
    };
};

/**
 * Create an element with attributes and children
 * 
 * @param {string} tag - HTML tag name.
 * @param {Object} [attrs={}] - Attributes to set.
 * @param {Array} [children=[]] - Child elements or text.
 * @returns {HTMLElement} - Created element.
 */
const element = (tag, attrs = {}, children = []) => {

    // Create element
    const el = document.createElement(tag);

    // Assign attributes
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));

    // Append children
    children.forEach(child => el.append(child instanceof Node ? child : document.createTextNode(child)));

    // Return element
    return el;
};

// Export module
export default { trim, json, range, isFunction, isObject, isString, isNumber, contains, debounce, throttle, element };