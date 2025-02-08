// Dependencies
import $ from '../src/prebuilt.js';
import AnJS from '../src/core.js';

test('should return an instance of AnJS', () => {
    expect($() instanceof AnJS).toBe(true);
});

describe("Global `$` assignment", () => {

    test("should attach $ to window in a browser", () => {
        if (typeof window !== "undefined") {
            expect(window.$).toBe($);
        }
    });

    test('should not attach $ if window is undefined', () => {
        const originalWindow = global.window;
        delete global.window;
        jest.resetModules();
        const $ = require('../src/prebuilt.js').default;
        expect(global.window).toBeUndefined();
        global.window = originalWindow;
    });

    test("should define a custom element", () => {
        // Mock global customElements API
        const originalDefine = global.customElements.define;
        global.customElements.define = jest.fn();

        // Ensure `$.define` exists before calling it
        expect(typeof $["define"]).toBe("function");

        // Create a mock Web Component class
        class MockComponent extends HTMLElement { }

        // Call $.define
        $["define"]("custom-element", MockComponent);

        // Verify that `customElements.define` was called correctly
        expect(global.customElements.define).toHaveBeenCalledWith("custom-element", MockComponent);

        // Restore original `customElements.define`
        global.customElements.define = originalDefine;
    });
});