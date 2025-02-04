// Dependencies
import $ from '../src/index.js';
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
        const $ = require('../src/index.js').default;
        expect(global.window).toBeUndefined();
        global.window = originalWindow;
    });
});