// Dependencies
import AnJS from './core.js';

/**
 * Animate elements with CSS transitions.
 * 
 * @param {Object} styles - CSS properties to animate.
 * @param {number} [duration=400] - Duration in milliseconds.
 * @param {string} [easing="ease"] - Easing function.
 * @returns {AnJS} - The current AnJS instance for chaining.
 */
AnJS.prototype.animate = function (styles, duration = 400, easing = "ease") {

    // Apply animation
    return this.each(el => {

        // Set initial styles
        el.style.transition = `all ${duration}ms ${easing}`;

        // Apply new styles
        requestAnimationFrame(() => Object.assign(el.style, styles));

        // Reset transition after duration
        setTimeout(() => el.style.transition = "", duration);
    });
};

/**
 * Fade elements to a specific opacity.
 * 
 * @param {number} opacity - Target opacity (0 to 1).
 * @param {number} [duration=400] - Duration in milliseconds.
 * @returns {AnJS} - The current AnJS instance for chaining.
 */
AnJS.prototype.fade = function (opacity = null, duration = 400) {

    // Determine target opacity
    return this.animate({ opacity: opacity ?? (this[0]?.style.opacity === "0" ? 1 : 0) }, duration);
};

/**
 * Fade elements in.
 * 
 * @param {number} [duration=400] - Duration in milliseconds.
 * @returns {AnJS} - The current AnJS instance for chaining.
 */
AnJS.prototype.fadeIn = function (duration = 400) {

    // Fade in elements
    return this.fade(1, duration);
};

/**
 * Fade elements out.
 * 
 * @param {number} [duration=400] - Duration in milliseconds.
 * @returns {AnJS} - The current AnJS instance for chaining.
 */
AnJS.prototype.fadeOut = function (duration = 400) {

    // Fade out elements
    return this.fade(0, duration);
}