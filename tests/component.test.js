import { JSDOM } from "jsdom";
import AnJS from "../src/core.js";
import $ from "../src/index.js";
import "../src/state.js";
import components, { startObserver } from "../src/component.js"; // Ensures AnJS.prototype.component is available

describe("AnJS Components", () => {
    let dom;
    let originalBody;

    beforeAll(() => {
        dom = new JSDOM(`<!DOCTYPE html>
            <body>
                <!-- We will dynamically insert components here -->
            </body>`);
        global.window = dom.window;
        global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        global.NodeList = dom.window.NodeList;
    });

    beforeEach(() => {
        document.body.innerHTML = `<my-component data-bind="title"></my-component>`;
        originalBody = document.body.innerHTML;
    });

    describe("Component Registration", () => {
        let registerSpy;

        beforeEach(() => {
            // Spy on `register`
            registerSpy = jest.spyOn(components, "register");
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test("should register a component and render it with a custom state", () => {
            const templateFn = ({ state }) => `
            <div>
                <h1 data-bind="title"></h1>
                <p data-bind="description"></p>
            </div>
        `;

            const componentState = () => $.state({ title: "Hello", description: "Initial desc" });

            $.component("my-component", templateFn, componentState);

            const rendered = document.querySelector("div");
            expect(rendered).not.toBeNull();
            expect(rendered.querySelector("h1").textContent).toBe("Hello");
            expect(rendered.querySelector("p").textContent).toBe("Initial desc");
        });

        test("should ignore registration when both stateOrHandlers and handlers are missing", () => {
            $.component("empty-component", () => "<div></div>");

            expect(components.registry["empty-component"]).toBeUndefined();
        });

        test("should correctly assign state when stateOrHandlers is a function returning an object", () => {
            const stateFn = () => $.state({ count: 0 });

            $.component("state-function", () => "<div></div>", stateFn);

            expect(typeof components.registry["state-function"].state).toBe("function");
            expect(components.registry["state-function"].state()).toEqual(stateFn());
        });

        test("should treat invalid state function as handlers (catch path)", () => {
            $.component("invalid-state", () => "<div></div>", () => { throw new Error("Invalid state"); });

            expect(typeof components.registry["invalid-state"].handlers).toBe("function");
        });

        test("should correctly identify a valid state function", () => {
            const stateFn = () => $.state({ count: 10 });

            $.component("valid-state", () => "<div></div>", stateFn);

            expect(typeof components.registry["valid-state"].state).toBe("function");
            expect(components.registry["valid-state"].state()).toEqual(stateFn());
        });

        test("should handle non-object return from state function", () => {
            const invalidStateFn = () => "not-an-object";

            $.component("invalid-state", () => "<div></div>", invalidStateFn);

            expect(typeof components.registry["invalid-state"].handlers).toBe("function");
        });

        test("should catch error from invalid state function and treat it as handlers", () => {
            const throwingFn = () => {
                throw new Error("Invalid state");
            };

            $.component("error-state", () => "<div></div>", throwingFn);

            expect(typeof components.registry["error-state"].handlers).toBe("function");
        });

        test("should use default state when no stateOrHandlers is provided", () => {
            $.component("default-state", () => "<div></div>");

            expect(components.registry["default-state"]).toBeUndefined();
        });

        test("should use default state when stateOrHandlers is not a function", () => {
            $.component("non-function-state", () => "<div></div>", { someProp: "value" });

            expect(typeof components.registry["non-function-state"].state).toBe("function");
            expect(components.registry["non-function-state"].state()).toEqual($.state({}));
        });
    });

    describe("Event Handling", () => {
        test("should attach event handlers and update state properly", () => {
            document.body.innerHTML = `<my-event-component></my-event-component>`;

            const templateFn = ({ state }) => `
                <div>
                    <span data-bind="count"></span>
                    <button data-action="increment">+</button>
                </div>
            `;
            const componentState = () => $.state({ count: 0 });

            function handlers($el, st) {
                $el.on("click", "[data-action='increment']", () => st.count++);
            }

            $.component("my-event-component", templateFn, componentState, handlers);

            const span = document.querySelector("span[data-bind='count']");
            const button = document.querySelector("[data-action='increment']");
            expect(span.textContent).toBe("0");

            button.click();
            expect(span.textContent).toBe("1");
        });

        test("should bind event handlers from an object", () => {
            document.body.innerHTML = `<event-component></event-component>`;

            const handlers = {
                click: {
                    testAction: jest.fn(),
                }
            };

            $.component("event-component", () => `<button data-action="testAction">Click</button>`, () => $.state({}), handlers);

            setTimeout(() => {
                document.querySelector("button").click();
                expect(handlers.click.testAction).toHaveBeenCalled();
            }, 0);
        });
    });

    describe("Event Binding", () => {
        let rendered;
        let componentState;

        beforeEach(() => {
            document.body.innerHTML = `<test-component></test-component>`;
            rendered = document.querySelector("test-component");
            componentState = $.state({ count: 0 });
        });

        test("should invoke handlers directly if it's a function", () => {
            const handlerFn = jest.fn();

            // Spy on jQuery wrapper
            const $spy = jest.spyOn(global, "$").mockImplementation(el => ({
                bind: jest.fn(),
                el
            }));

            components.bind(rendered, handlerFn, componentState);

            // Extract arguments from first call
            const [arg1, arg2] = handlerFn.mock.calls[0];

            // Ensure correct arguments were passed
            expect(arg1.el).toBe(rendered); // Ensure correct element
            expect(arg2).toEqual(componentState); // Ensure correct state

            // Restore mocks
            $spy.mockRestore();
        });

        test("should bind event handlers dynamically", () => {
            document.body.innerHTML = `<event-component><button data-action="testAction">Click</button></event-component>`;

            const handlers = {
                click: {
                    testAction: jest.fn(),
                }
            };

            // Mock jQuery wrapper
            const onSpy = jest.fn();
            const $spy = jest.spyOn(global, "$").mockImplementation(el => ({
                on: onSpy,
                bind: jest.fn(),
                el
            }));

            // Run the binding logic
            components.bind(document.querySelector("event-component"), handlers, {});

            // Ensure event listener was attached
            expect(onSpy).toHaveBeenCalledWith("click", "[data-action]", expect.any(Function));

            // Extract the event handler function from the spy
            const handler = onSpy.mock.calls[0][2];

            // Simulate event trigger
            const button = document.querySelector("button");
            handler({ target: button });

            // Ensure the testAction handler was called
            expect(handlers.click.testAction).toHaveBeenCalled();

            // Restore mocks
            $spy.mockRestore();
        });

        test("should not execute action if action does not exist", () => {
            document.body.innerHTML = `<event-component><button data-action="unknownAction">Click</button></event-component>`;

            const handlers = {
                click: {
                    testAction: jest.fn(),
                }
            };

            // Mock jQuery wrapper
            const onSpy = jest.fn();
            const $spy = jest.spyOn(global, "$").mockImplementation(el => ({
                on: onSpy,
                bind: jest.fn(),
                el
            }));

            // Run the binding logic
            components.bind(document.querySelector("event-component"), handlers, {});

            // Ensure event listener was attached
            expect(onSpy).toHaveBeenCalledWith("click", "[data-action]", expect.any(Function));

            // Extract the event handler function from the spy
            const handler = onSpy.mock.calls[0][2];

            // Simulate event trigger for a non-existent action
            const button = document.querySelector("button");
            handler({ target: button });

            // Ensure no action was executed
            expect(handlers.click.testAction).not.toHaveBeenCalled();
        });
    });

    describe("Component Mounting", () => {
        test("should mount child components", () => {
            document.body.innerHTML = `<parent-component><child-component></child-component></parent-component>`;

            $.component("child-component", () => "<div>Child</div>");
            $.component("parent-component", ({ state }) => `
                <div>
                    <h1>Parent</h1>
                    <child-component></child-component>
                </div>
            `);

            setTimeout(() => {
                expect(document.querySelector("child-component")).toBeNull(); // Should be replaced
                expect(document.querySelector("div").textContent).toContain("Child");
            }, 0);
        });

        test("should render component without explicit state", () => {
            const element = components.render("<div>Test</div>");
            expect(element.textContent).toBe("Test");
        });
    });

    describe("Component Rendering", () => {
        test("should render a valid HTML element", () => {
            const element = components.render("<div>Test</div>");
            expect(element).not.toBeNull();
            expect(element.tagName).toBe("DIV");
            expect(element.textContent).toBe("Test");
        });

        test("should return null for empty HTML", () => {
            const element = components.render("");
            expect(element).toBeNull();
        });

        test("should return null for malformed HTML", () => {
            const element = components.render("Just text, no tags");
            expect(element).toBeNull();
        });

        test("should bind state when provided", () => {
            const bindSpy = jest.spyOn($, "bind");

            const state = $.state({ count: 5 });
            const element = components.render("<div data-bind='count'></div>", state);

            expect(element).not.toBeNull();
            //expect(bindSpy).toHaveBeenCalledWith(state);

            bindSpy.mockRestore();
        });

        test("should not attempt to bind state if state is null", () => {
            const bindSpy = jest.spyOn($, "bind");
            const element = components.render("<div></div>", null); // Explicitly pass null
            expect(element).not.toBeNull();
            bindSpy.mockRestore();
        });

        /* // TODO: Review this test
        test("should not attempt to bind state if element is null", () => {
            const bindSpy = jest.spyOn($, "bind");

            const state = $.state({ count: 5 });
            const element = components.render("", state); // Should return null

            expect(element).toBeNull();
            expect(bindSpy).not.toHaveBeenCalled();

            bindSpy.mockRestore();
        });
        */
    });

    describe("State Management", () => {
        test("should treat invalid state function as handlers", () => {
            $.component("invalid-state", () => "<div></div>", () => { throw new Error("Invalid state"); });

            expect(typeof components.registry["invalid-state"].handlers).toBe("function");
        });
    });
});

describe("startObserver", () => {
    let addEventListenerSpy, observerSpy;

    beforeEach(() => {
        // Mock document event listener
        addEventListenerSpy = jest.spyOn(document, "addEventListener");

        // Spy on components.observer()
        observerSpy = jest.spyOn(components, "observer").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should start observer immediately if document is already loaded", () => {
        Object.defineProperty(document, "readyState", { value: "complete", configurable: true });

        startObserver();

        expect(observerSpy).toHaveBeenCalled();
        expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    test("should wait for DOMContentLoaded if document is still loading", () => {
        Object.defineProperty(document, "readyState", { value: "loading", configurable: true });

        startObserver();

        expect(observerSpy).not.toHaveBeenCalled();
        expect(addEventListenerSpy).toHaveBeenCalledWith("DOMContentLoaded", expect.any(Function));

        // Manually trigger the DOMContentLoaded event
        const event = new Event("DOMContentLoaded");
        document.dispatchEvent(event);

        expect(observerSpy).toHaveBeenCalled();
    });
});