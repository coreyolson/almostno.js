// Dependencies
import { JSDOM } from "jsdom";

// Setup JSDOM before importing AnJS
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <button id="btn">Click Me</button>
            <div id="container">
                <span class="child">Child</span>
            </div>
        </body>`);

    // Attach JSDOM to global scope
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

// Import AnJS after setting up JSDOM
import AnJS from "../src/core.js";
import $ from "../src/index.js";
import "../src/events.js";

describe("AnJS Event Methods", () => {
    let btn, container, child, mockHandler1, mockHandler2;

    beforeEach(() => {
        document.body.innerHTML = `
            <button id="btn">Click Me</button>
            <div id="container">
                <span class="child">Child</span>
            </div>
        `;

        btn = $("#btn");
        container = $("#container");
        child = $(".child");
        mockHandler1 = jest.fn();
        mockHandler2 = jest.fn();
    });

    describe("on()", () => {
        test("should attach event listener directly", () => {
            btn.on("click", mockHandler1);
            const btnEl = btn.get(0);
            expect(btnEl).not.toBeUndefined();

            btnEl.dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).toHaveBeenCalled();
        });

        test("should support multiple handlers for the same event", () => {
            btn.on("click", mockHandler1);
            btn.on("click", mockHandler2);

            const btnEl = btn.get(0);
            btnEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).toHaveBeenCalled();
            expect(mockHandler2).toHaveBeenCalled();
        });

        test("should attach a direct event listener when only function is provided", () => {
            btn.on("click", mockHandler1);

            btn.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).toHaveBeenCalled();
        });

        test("should attach a delegated event listener when selector is provided", () => {
            container.on("click", ".child", mockHandler1);

            child.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).toHaveBeenCalled();
        });

        test("should not fail when attaching event to an empty AnJS instance", () => {
            const empty = $(".does-not-exist");
            expect(() => empty.on("click", mockHandler1)).not.toThrow();
        });
    });

    describe("off()", () => {
        test("should remove event listener", () => {
            btn.on("click", mockHandler1);
            btn.off("click", mockHandler1);

            const btnEl = btn.get(0);
            expect(btnEl).not.toBeUndefined();

            btnEl.dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).not.toHaveBeenCalled();
        });

        test("should remove only the specified handler", () => {
            btn.on("click", mockHandler1);
            btn.on("click", mockHandler2);
            btn.off("click", mockHandler1);

            const btnEl = btn.get(0);
            btnEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).not.toHaveBeenCalled();
            expect(mockHandler2).toHaveBeenCalled();
        });

        test("should remove a direct event listener", () => {
            btn.on("click", mockHandler1);
            btn.off("click", mockHandler1);

            btn.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).not.toHaveBeenCalled();
        });

        test("should remove a delegated event listener", () => {
            container.on("click", ".child", mockHandler1);
            container.off("click", ".child", mockHandler1);

            child.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).not.toHaveBeenCalled();
        });

        test("should not throw an error when removing an event that does not exist", () => {
            expect(() => btn.off("click", mockHandler1)).not.toThrow();
        });

        test("should not remove other event handlers when removing a specific handler", () => {
            btn.on("click", mockHandler1);
            btn.on("click", mockHandler2);
            btn.off("click", mockHandler1);

            btn.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler2).toHaveBeenCalled();
            expect(mockHandler1).not.toHaveBeenCalled();
        });

        test("should remove all event handlers for an event if no handler is provided", () => {
            btn.on("click", mockHandler1);
            btn.on("click", mockHandler2);
            btn.off("click"); // Remove all "click" handlers

            btn.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).not.toHaveBeenCalled();
            expect(mockHandler2).not.toHaveBeenCalled();
        });

        test("should not fail when calling off() on an empty AnJS instance", () => {
            const empty = $(".does-not-exist");
            expect(() => empty.off("click", mockHandler1)).not.toThrow();
        });
    });

    describe("delegate()", () => {
        test("should attach delegated event listener", () => {
            container.delegate("click", ".child", mockHandler1);

            const childEl = child.get(0);
            childEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).toHaveBeenCalled();
        });

        test("should support multiple handlers for the same selector", () => {
            container.delegate("click", ".child", mockHandler1);
            container.delegate("click", ".child", mockHandler2);

            const childEl = child.get(0);
            childEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).toHaveBeenCalled();
            expect(mockHandler2).toHaveBeenCalled();
        });

        test("should not trigger event if selector does not match", () => {
            container.delegate("click", ".not-existing", mockHandler1);

            const childEl = child.get(0);
            childEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).not.toHaveBeenCalled();
        });
    });

    describe("undelegate()", () => {
        test("should remove delegated event listener", () => {
            container.delegate("click", ".child", mockHandler1);
            container.undelegate("click", ".child", mockHandler1);

            const childEl = child.get(0);
            childEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).not.toHaveBeenCalled();
        });

        test("should remove only the specified delegated handler", () => {
            container.delegate("click", ".child", mockHandler1);
            container.delegate("click", ".child", mockHandler2);
            container.undelegate("click", ".child", mockHandler1);

            const childEl = child.get(0);
            childEl.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).not.toHaveBeenCalled();
            expect(mockHandler2).toHaveBeenCalled();
        });

        test("should return early if no handlers exist for the event", () => {
            container.undelegate("click", ".child", mockHandler1); // No event was ever added
            child.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).not.toHaveBeenCalled();
        });

        test("should return early if no handlers exist for a specific event", () => {
            container.on("mouseover", mockHandler1);
            container.undelegate("click", ".child", mockHandler1);
            child.get(0).dispatchEvent(new Event("click", { bubbles: true }));
            expect(mockHandler1).not.toHaveBeenCalled();
        });
    });

    describe("trigger()", () => {
        test("should manually dispatch an event", () => {
            btn.on("click", mockHandler1);
            btn.trigger("click");

            expect(mockHandler1).toHaveBeenCalled();
        });

        test("should bubble events to container", () => {
            container.on("click", mockHandler1);
            child.get(0)?.dispatchEvent(new Event("click", { bubbles: true }));

            expect(mockHandler1).toHaveBeenCalled();
        });

        test("should not bubble if event is not set to bubble", () => {
            container.on("click", mockHandler1);
            child.get(0)?.dispatchEvent(new Event("click", { bubbles: false }));

            expect(mockHandler1).not.toHaveBeenCalled();
        });
    });
});

describe("AnJS Event Bus", () => {
    let mockHandler1, mockHandler2;

    beforeEach(() => {
        // Reset mock handlers before each test
        mockHandler1 = jest.fn();
        mockHandler2 = jest.fn();
    });

    /** 
     * Emit: Fire a global event
     */
    describe("emit()", () => {
        test("should trigger all listeners for an event", () => {
            $.listen("testEvent", mockHandler1);
            $.listen("testEvent", mockHandler2);

            $.emit("testEvent", { data: 123 });

            expect(mockHandler1).toHaveBeenCalledWith({ data: 123 });
            expect(mockHandler2).toHaveBeenCalledWith({ data: 123 });
        });

        test("should not fail if no listeners exist", () => {
            expect(() => $.emit("nonExistingEvent")).not.toThrow();
        });
    });

    /** 
     * Listen: Attach a global event listener
     */
    describe("listen()", () => {
        test("should register a global event listener", () => {
            $.listen("myEvent", mockHandler1);
            $.emit("myEvent", "hello");

            expect(mockHandler1).toHaveBeenCalledWith("hello");
        });

        test("should support multiple handlers for the same event", () => {
            $.listen("myEvent", mockHandler1);
            $.listen("myEvent", mockHandler2);

            $.emit("myEvent", "world");

            expect(mockHandler1).toHaveBeenCalledWith("world");
            expect(mockHandler2).toHaveBeenCalledWith("world");
        });

        test("should not trigger handlers of other events", () => {
            $.listen("eventA", mockHandler1);
            $.listen("eventB", mockHandler2);

            $.emit("eventA", "test");

            expect(mockHandler1).toHaveBeenCalledWith("test");
            expect(mockHandler2).not.toHaveBeenCalled();
        });
    });

    /** 
     * Forget: Remove a global event listener
     */
    describe("forget()", () => {
        test("should remove a specific listener", () => {
            $.listen("testEvent", mockHandler1);
            $.listen("testEvent", mockHandler2);

            $.forget("testEvent", mockHandler1);
            $.emit("testEvent", "data");

            expect(mockHandler1).not.toHaveBeenCalled();
            expect(mockHandler2).toHaveBeenCalledWith("data");
        });

        test("should remove all listeners if they are cleared one by one", () => {
            $.listen("testEvent", mockHandler1);
            $.listen("testEvent", mockHandler2);

            $.forget("testEvent", mockHandler1);
            $.forget("testEvent", mockHandler2);
            $.emit("testEvent", "data");

            expect(mockHandler1).not.toHaveBeenCalled();
            expect(mockHandler2).not.toHaveBeenCalled();
        });

        test("should not fail when removing a non-existent listener", () => {
            expect(() => $.forget("nonExistingEvent", mockHandler1)).not.toThrow();
        });

        test("should remove all listeners when the last one is forgotten", () => {
            $.listen("clearEvent", mockHandler1);
            $.forget("clearEvent", mockHandler1);

            expect(() => $.emit("clearEvent")).not.toThrow();
        });
    });
});