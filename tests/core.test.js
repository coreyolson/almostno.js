// Dependencies
import { JSDOM } from "jsdom";

// Import AnJS after setting up JSDOM
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="test">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
            </div>
        </body>`);

    // Attach JSDOM to global scope **before importing AnJS**
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

// Import AnJS after setting up JSDOM
import AnJS from "../src/core.js";
import $ from "../src/index.js";

describe("`$` function (AnJS wrapper)", () => {

    test("should return an empty AnJS instance when called with `undefined`", () => {
        const instance = $(undefined);
        expect(instance.length).toBe(0);
    });

    test("should return an empty AnJS instance when called with `null`", () => {
        const instance = $(null);
        expect(instance.length).toBe(0);
    });

    test("should return an empty AnJS instance when called with an empty string", () => {
        const instance = $("");
        expect(instance.length).toBe(0);
    });

    test("should return an AnJS instance wrapping an HTMLElement when called with an element", () => {
        document.body.innerHTML = `<div id="test-element"></div>`;
        const element = document.getElementById("test-element");

        const instance = $(element);
        expect(instance.length).toBe(1);
        expect(instance[0]).toBe(element);
    });

    test("should return an AnJS instance with selected elements when called with a valid selector", () => {
        document.body.innerHTML = `
            <div class="test"></div>
            <div class="test"></div>
        `;

        const instance = $(".test");
        expect(instance.length).toBe(2);
    });

    test("should return an empty AnJS instance when called with a non-matching selector", () => {
        const instance = $(".non-existent-class");
        expect(instance.length).toBe(0);
    });

    test("should return an AnJS instance when called with an array of elements", () => {
        document.body.innerHTML = `
            <div class="test"></div>
            <div class="test"></div>
        `;

        const elements = [...document.querySelectorAll(".test")];
        const instance = $(elements);

        expect(instance.length).toBe(2);
    });
});

describe("AnJS Core - Selector Branch Coverage", () => {
    
    test("should return empty array when no query is provided", () => {
        const instance = new AnJS();
        expect(instance.get()).toEqual([]);
    });

    test("should wrap an HTMLElement in an array", () => {
        const element = document.createElement("div");
        const instance = new AnJS(element); // Directly pass the element
        expect(instance.get()).toEqual([element]); // Compare the wrapped array
    });

    test("should convert a NodeList to an array", () => {
        const nodeList = document.querySelectorAll(".item");
        const instance = new AnJS(nodeList);
        expect(instance.get()).toEqual([...nodeList]);
    });

    test("should select elements by valid selector", () => {
        const instance = $(".item");
        expect(instance.get()).toEqual([...document.querySelectorAll(".item")]);
    });

    test("should return empty array when selector matches nothing", () => {
        const instance = $(".non-existent");
        expect(instance.get()).toEqual([]);
    });
});

describe("AnJS Core - Selector and Utility Methods", () => {

    beforeEach(() => {
        // Reset DOM before each test
        document.body.innerHTML = `
            <div id="test">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
            </div>
        `;
    });

    test("should create an AnJS instance", () => {
        const instance = $("#test");
        expect(instance).toBeInstanceOf(AnJS);
    });

    test("should select an element by ID", () => {
        const instance = $("#test");
        expect(instance.get(0)).toBe(document.querySelector("#test"));
    });

    test("should select multiple elements by class", () => {
        const instance = $(".item");
        expect(instance.get().length).toBe(2);
        expect(instance.get()).toEqual([...document.querySelectorAll(".item")]);
    });

    test("should return correct length of selected elements", () => {
        const instance = $(".item");
        expect(instance.length).toBe(2);
    });

    test("should iterate over selected elements using each()", () => {
        const instance = $(".item");
        const mockFn = jest.fn();
        instance.each(mockFn);
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test("should convert selected elements to an array", () => {
        const instance = $(".item");
        expect(Array.isArray(instance)).toBe(true);
        expect(instance.length).toBe(2);
    });

    test('should return undefined when no elements are selected', () => {
        const instance = $(".non-existent");
        expect(instance.get(0)).toBeUndefined();
    });

    test("should return the first selected element", () => {
        const instance = $(".item");
        expect(instance.get(0)).toBe(document.querySelector(".item"));
    });

    test("should return all selected elements as an array", () => {
        const instance = $(".item");
        expect(instance.get()).toEqual([...document.querySelectorAll(".item")]);
    });
});

describe("AnJS Core - clone Method", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="test">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
            </div>
        `;
    });

    test("should return a cloned element when element exists", () => {
        const instance = $("#test");
        const clone = instance.clone();
        expect(clone).not.toBeNull();
        expect(clone.isEqualNode(document.querySelector("#test"))).toBe(true);
    });

    test("should return null when no elements are selected", () => {
        const instance = $("#nonexistent");
        expect(instance.clone()).toBeNull();
    });
});
