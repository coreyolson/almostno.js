import { JSDOM } from "jsdom";

// Setup JSDOM before importing AnJS
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="container">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
                <span class="item special">Item 3</span>
                <span class="item">Item 4</span>
                <span class="item special">Item 5</span>
            </div>
        </body>`);

    // Attach JSDOM to global scope
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

// Import AnJS after setting up JSDOM
import $ from "../src/index.js";

describe("AnJS Filtering Methods", () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="container">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
                <span class="item special">Item 3</span>
                <span class="item">Item 4</span>
                <span class="item special">Item 5</span>
            </div>
        `;
    });

    test("filter() should select elements matching a selector", () => {
        const instance = $(".item").filter(".special");
        expect(instance.length).toBe(2);
        expect(instance[0].textContent).toBe("Item 3");
        expect(instance[1].textContent).toBe("Item 5");
    });

    test("find() should select child elements inside a parent", () => {
        const instance = $("#container").find(".item");
        expect(instance.length).toBe(5);
    });

    test("first() should select only the first element", () => {
        const instance = $(".item").first();
        expect(instance.length).toBe(1);
        expect(instance[0].textContent).toBe("Item 1");
    });

    test("last() should select only the last element", () => {
        const instance = $(".item").last();
        expect(instance.length).toBe(1);
        expect(instance[0].textContent).toBe("Item 5");
    });

    test("even() should select elements with even indices", () => {
        const instance = $(".item").even();
        expect(instance.length).toBe(3);
        expect(instance[0].textContent).toBe("Item 1");
        expect(instance[1].textContent).toBe("Item 3");
        expect(instance[2].textContent).toBe("Item 5");
    });

    test("odd() should select elements with odd indices", () => {
        const instance = $(".item").odd();
        expect(instance.length).toBe(2);
        expect(instance[0].textContent).toBe("Item 2");
        expect(instance[1].textContent).toBe("Item 4");
    });

    test("filter() should return an empty set when no matches", () => {
        const instance = $(".item").filter(".non-existent");
        expect(instance.length).toBe(0);
    });

    test("find() should return an empty set when no matches", () => {
        const instance = $("#container").find(".non-existent");
        expect(instance.length).toBe(0);
    });

    test("first() should return an empty set when no elements are selected", () => {
        const instance = $(".non-existent").first();
        expect(instance.length).toBe(0);
    });

    test("last() should return an empty set when no elements are selected", () => {
        const instance = $(".non-existent").last();
        expect(instance.length).toBe(0);
    });

    test("even() should return an empty set when no elements are selected", () => {
        const instance = $(".non-existent").even();
        expect(instance.length).toBe(0);
    });

    test("odd() should return an empty set when no elements are selected", () => {
        const instance = $(".non-existent").odd();
        expect(instance.length).toBe(0);
    });

    test("slice() should return a subset of elements", () => {
        const instance = $(".item").slice(0, 1);
        expect(instance.length).toBe(1);
        expect(instance[0].textContent).toBe("Item 1");
    });
});