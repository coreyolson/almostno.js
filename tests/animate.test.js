import { JSDOM } from "jsdom";

// Import AnJS after setting up JSDOM
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="box" style="opacity: 1;"></div>
        </body>`);

    // Attach JSDOM to global scope **before importing AnJS**
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

// Import AnJS after setting up JSDOM
import $ from "../src/index.js";

describe("AnJS Animate Methods", () => {

    beforeEach(() => {
        document.body.innerHTML = `<div id="box" style="opacity: 1;"></div>`;
    });

    beforeAll(() => { jest.useFakeTimers(); });
    afterAll(() => { jest.useRealTimers(); });

    test("animate() should modify styles with transition", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.animate({ opacity: 0.5 });
        jest.runAllTimers();
        expect(box.style.opacity).toBe("0.5");
    });

    test("fade() should modify opacity", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.fade(0);
        jest.runAllTimers();
        expect(box.style.opacity).toBe("0");
    });

    test('fade() should toggle opacity', () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.fade();
        jest.runAllTimers();
        expect(box.style.opacity).toBe("0");
    });

    test("animate() should handle duration", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.animate({ opacity: 0.5 }, 1000);
        jest.advanceTimersByTime(1000);
        expect(box.style.opacity).toBe("0.5");
    });

    test("fadeIn() should set opacity to 1", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.fadeIn();
        jest.runAllTimers();
        expect(box.style.opacity).toBe("1");
    });

    test("fadeOut() should set opacity to 0", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.fadeOut();
        jest.runAllTimers();
        expect(box.style.opacity).toBe("0");
    });

    test("fade() without parameters should toggle opacity", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        instance.fade();
        jest.runAllTimers();
        expect(box.style.opacity).toBe("0");
    });

    test("fade() should toggle opacity based on current state", () => {
        const box = document.getElementById("box");
        const instance = $(box);
        box.style.opacity = "0";
        instance.fade();
        jest.runAllTimers();
        expect(box.style.opacity).toBe("1");
    });
});