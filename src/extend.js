import AnJS from './core.js';

/**
 * Extend the `AnJS` prototype with new methods or multiple methods via an object.
 * 
 * @param {string | Object} name - Method name or an object of methods.
 * @param {Function | Object} func - Method function if `name` is a string, otherwise ignored.
 * @param {boolean} [force=false] - Force override.
 */
const extend = function(name, func, force = false) {

    // Handle object input recursively
    if (typeof name === "object") {

        // If second argument is boolean, use it as force
        if (typeof func === "boolean") force = func;

        // Extend each key in the object
        return Object.keys(name).forEach(key => extend(key, name[key], force));
    }

    // Prevent overwriting existing methods unless forced
    if (!force && AnJS.prototype.hasOwnProperty(name)) return;

    // Assign method to prototype of AnJS
    AnJS.prototype[name] = func;
}

// Export module
export default { extend };