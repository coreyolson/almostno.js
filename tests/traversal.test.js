// Dependencies
import { JSDOM } from "jsdom";

// Setup JSDOM before importing AnJS
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="parent">
                <div class="child" id="first">First</div>
                <div class="child">Second</div>
                <div class="child">Third</div>
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
import AnJS from "../src/core.js";

describe("AnJS Traversal Methods", () => {

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="parent">
                <div class="child" id="first">First</div>
                <div class="child">Second</div>
                <div class="child">Third</div>
            </div>
        `;
    });

    test("next() should select the next sibling", () => {
        const instance = $("#first").next();
        expect(instance.length).toBe(1);
        expect(instance[0].textContent).toBe("Second");
    });

    test("prev() should select the previous sibling", () => {
        const instance = $(".child").last().prev();
        expect(instance.length).toBe(1);
        expect(instance[0].textContent).toBe("Second");
    });

    test("parent() should select the parent element", () => {
        const instance = $("#first").parent();
        expect(instance.length).toBe(1);
        expect(instance[0].id).toBe("parent");
    });

    test("closest() should find the nearest ancestor matching the selector", () => {
        const instance = $(".child").closest("#parent");
        expect(instance.length).toBe(1);
        expect(instance[0].id).toBe("parent");
    });

    test("next() should return empty instance if no next sibling exists", () => {
        const instance = $(".child").last().next();
        expect(instance.length).toBe(0);
    });

    test("prev() should return empty instance if no previous sibling exists", () => {
        const instance = $(".child").first().prev();
        expect(instance.length).toBe(0);
    });

    test("parent() should select the parent element", () => {
        document.body.innerHTML = `
            <div id="parent">
                <div id="first"></div>
            </div>
        `;
        const instance = $("#first").parent();
        expect(instance.length).toBe(1);
        expect(instance[0].id).toBe("parent");
    });

    test("parent() should return empty instance if no parent exists", () => {
        const instance = $("html").parent();
        expect(instance.length).toBe(0);
    });

    test("children() should return empty instance if no children exist", () => {
        const instance = $(".child").first().children();
        expect(instance.length).toBe(0);
    });

    test("closest() should return empty instance if no matching ancestor exists", () => {
        const instance = $(".child").closest(".nonexistent");
        expect(instance.length).toBe(0);
    });
});

describe("children()", () => {

    test("children() should return an empty instance when called on document", () => {
        const instance = $(document).children();
        expect(instance.length).toBe(0);
    });

    test("should return an empty instance when called on a non-existent element", () => {
        const instance = $("#does-not-exist").children();
        expect(instance.length).toBe(0);
    });

    test("should return an empty instance when called on an empty AnJS instance", () => {
        const instance = $(null).children();
        expect(instance.length).toBe(0);
    });

    test("should return an empty instance when called on an AnJS instance with no elements", () => {
        const emptyInstance = new AnJS(); 
        const instance = emptyInstance.children();
        expect(instance.length).toBe(0);
    });

});

describe("siblings()", () => {

    test("should select all siblings", () => {
        const instance = $("#first").siblings();
        expect(instance.length).toBe(2);
        expect(instance[0].textContent).toBe("Second");
        expect(instance[1].textContent).toBe("Third");
    });

    test("should return an empty instance when the only child in a parent is selected", () => {
        document.body.innerHTML = `
                <div id="parent">
                    <div id="only-child">Only Child</div>
                </div>
            `;
        const instance = $("#only-child").siblings();
        expect(instance.length).toBe(0);
    });

    test("should return an empty instance when called on a non-existent element", () => {
        const instance = $("#does-not-exist").siblings();
        expect(instance.length).toBe(0);
    });

    test("should correctly return siblings even when some contain text nodes", () => {
        document.body.innerHTML = `
                <div id="parent">
                    Text Node
                    <div class="child" id="first">First</div>
                    <div class="child">Second</div>
                </div>
            `;
        const instance = $("#first").siblings();
        expect(instance.length).toBe(1);
        expect(instance[0].textContent).toBe("Second");
    });

    test("should return all siblings except the selected element", () => {
        document.body.innerHTML = `
                <div id="parent">
                    <div class="child">First</div>
                    <div class="child">Second</div>
                    <div class="child">Third</div>
                </div>
            `;

        // Get the second .child element and wrap it in AnJS
        const instance = $($(".child").get(1)).siblings();

        expect(instance.length).toBe(2);
        expect(instance[0].textContent).toBe("First");
        expect(instance[1].textContent).toBe("Third");
    });
});