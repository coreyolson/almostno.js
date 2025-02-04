// Dependencies
import AnJS from './core.js';

// Create alias methods for insertion
["append", "prepend", "before", "after"].forEach(method =>

    // Create alias method
    AnJS.prototype[method] = function (content) {

        // Insert content at specified position
        return this.insert(content, method);
    }
);

// Create alias methods for event binding and triggering
["click", "change", "submit", "keydown", "keyup", "mouseover", "mouseout"].forEach(event => {

    // Create alias method
    AnJS.prototype[event] = function (callback) {

        // Bind event if a callback is provided
        return callback ? this.on(event, callback) : this.trigger(event);
    };
});
