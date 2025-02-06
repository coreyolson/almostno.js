// Dependencies
import AnJS from './core.js';

// Batch assign animation methods to AnJS prototype
Object.assign(AnJS.prototype, {

    /**
     * Animate elements with CSS transitions.
     * 
     * @param {Object} styles - CSS properties to animate.
     * @param {number} [duration=400] - Duration in milliseconds.
     * @param {string} [easing="ease"] - Easing function.
     * @returns {AnJS} - The current AnJS instance for chaining.
     */
    animate(styles, duration = 400, easing = "ease") {

        // Apply animation
        return this.each(el => {

            // Set transition effect
            el.style.transition = `all ${duration}ms ${easing}`;

            // Apply new styles
            Object.assign(el.style, styles);

            // Reset transition after duration if styles changed
            if (duration > 0) setTimeout(() => el.style.transition = "", duration);
        });
    },

    /**
     * Fade elements to a specific opacity.
     * 
     * @param {number} [opacity] - Target opacity (0 to 1).
     * @param {number} [duration=400] - Duration in milliseconds.
     * @returns {AnJS} - The current AnJS instance for chaining.
     */
    fade(opacity = +(this[0]?.style.opacity === "0"), duration = 400) {

        // Animate opacity change
        return this.animate({ opacity }, duration);
    },

    /**
     * Fade elements in or out.
     * 
     * @param {number} [duration=400] - Duration in milliseconds.
     * @return {AnJS} - The current AnJS instance for chaining.
     */
    fadeIn(duration) { 
        
        // Convenience wrapper
        return this.fade(1, duration); 
    },

    /**
     * Fade elements out.
     * 
     * @param {number} [duration=400] - Duration in milliseconds.
     * @return {AnJS} - The current AnJS instance for chaining.
     */
    fadeOut(duration) { 
        
        // Convenience wrapper
        return this.fade(0, duration); 
    }
});