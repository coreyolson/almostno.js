import { JSDOM } from "jsdom";

let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="app">
                <span data-bind="message"></span>
                <input type="text" data-bind-attr="value:message" />
                <button data-on="click:updateMessage">Click Me</button>
            </div>
        </body>`);

    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

import $ from "../src/index.js";

describe("AnJS State & Binding", () => {
    let state, instance;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app">
                <span data-bind="message"></span>
                <input type="text" data-bind-attr="value:message" />
                <button data-on="click:updateMessage">Click Me</button>
            </div>
        `;

        instance = $(document);
        state = instance.state({ message: "Hello" });
        instance.bind(state);
    });

    describe("state()", () => {
        test("should create an empty object", () => {
            const emptyState = instance.state();
            expect(emptyState).toBeInstanceOf(Object);
        });

        test("should create a state object", () => {
            expect(state).toBeInstanceOf(Object);
            expect(state.message).toBe("Hello");
        });
    });

    describe("bind()", () => {
        test("bound elements should update when state changes", () => {
            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).toBe("Hello");

            state.message = "Updated!";
            expect(span.textContent).toBe("Updated!");
        });

        test("input should reflect bound state changes", () => {
            const input = document.querySelector("input[data-bind-attr='value:message']");
            expect(input.value).toBe("Hello");

            state.message = "Changed Value";
            expect(input.value).toBe("Changed Value");
        });

        test("changing input should update state", () => {
            const input = document.querySelector("input[data-bind-attr='value:message']");
            input.value = "User Typed";
            input.dispatchEvent(new Event("input"));

            expect(state.message).toBe("User Typed");
        });

        test("data-bind should default to empty string if state is undefined", () => {
            document.body.innerHTML = `<span data-bind="undefinedProp"></span>`;

            const undefinedState = instance.state({});
            instance.bind(undefinedState);

            const span = document.querySelector("[data-bind='undefinedProp']");
            expect(span.textContent).toBe("");
        });

        test("data-bind-attr should update attributes when state changes", () => {
            document.body.innerHTML = `<div id="test" data-bind-attr="title:message"></div>`;

            const attrState = instance.state({ message: "Initial" });
            instance.bind(attrState);

            const div = document.getElementById("test");
            expect(div.getAttribute("title")).toBe("Initial");

            attrState.message = "Updated Title";
            expect(div.getAttribute("title")).toBe("Updated Title");
        });

        test("bind() should set empty string for undefined state properties", () => {
            document.body.innerHTML = `<div data-bind-attr="title:missingProp"></div>`;

            const undefinedState = instance.state({});
            instance.bind(undefinedState);

            const div = document.querySelector("[data-bind-attr='title:missingProp']");
            expect(div.getAttribute("title")).toBe("");
        });
    });

    describe("unbind()", () => {
        test("should remove all bindings", () => {
            instance.unbind(state);

            state.message = "Should not update";
            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).not.toBe("Should not update");
        });
    });

    describe("data-on event binding", () => {
        test("button should trigger a state function", () => {
            state.updateMessage = jest.fn((e, s) => { s.message = "Clicked!"; });

            const button = document.querySelector("[data-on='click:updateMessage']");
            button.click();

            expect(state.updateMessage).toHaveBeenCalled();
            expect(state.message).toBe("Clicked!");
        });

        test("data-on should call the function defined in state", () => {
            document.body.innerHTML = `<button data-on="click:testMethod">Click Me</button>`;

            const eventState = instance.state({
                testMethod: jest.fn((e, s) => { s.clicked = true; })
            });

            instance.bind(eventState);

            const button = document.querySelector("button");
            button.click();

            expect(eventState.testMethod).toHaveBeenCalled();
            expect(eventState.clicked).toBe(true);
        });

        test("data-on should ignore non-function state methods", () => {
            document.body.innerHTML = `<button data-on="click:notAFunction">Click</button>`;

            const eventState = instance.state({ notAFunction: "not a function" });
            instance.bind(eventState);

            const button = document.querySelector("button");
            button.click(); // Should not throw an error

            expect(typeof eventState.notAFunction).toBe("string");
        });
    });

    describe("DOMContentLoaded behavior", () => {
        test("should bind to window.AnJSState if defined", () => {
            window.AnJSState = { message: "Hello" };
            const event = new Event("DOMContentLoaded");
            document.dispatchEvent(event);
            expect(document.querySelector("[data-bind='message']").textContent).toBe("Hello");
            delete window.AnJSState;
        });

        test("should not throw if window.AnJSState is undefined", () => {
            delete window.AnJSState;
            expect(() => {
                const event = new Event("DOMContentLoaded");
                document.dispatchEvent(event);
            }).not.toThrow();
        });
    });

    describe("form inputs", () => {
        test("input and textarea should update state on input event", () => {
            document.body.innerHTML = `
                <input type="text" data-bind-attr="value:message" />
                <textarea data-bind-attr="value:message"></textarea>
            `;

            const inputState = instance.state({ message: "Hello" });
            instance.bind(inputState);

            const input = document.querySelector("input");
            const textarea = document.querySelector("textarea");

            input.value = "New input value";
            textarea.value = "New textarea value";

            input.dispatchEvent(new Event("input"));
            textarea.dispatchEvent(new Event("input"));

            expect(inputState.message).toBe("New textarea value");
        });
    });
});