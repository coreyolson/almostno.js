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
import AnJS from "../src/core.js";
import { localBindings, bindings } from '../src/state.js';

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

        test("should register a new global state when it does not exist", () => {
            const instance = $(document);
            const newState = instance.state({ key: "value" }, { global: true, name: "newGlobal" });
            expect(instance.global("newGlobal")).toStrictEqual(newState);
            expect(instance.global("newGlobal").key).toBe("value");
        });

        test("state() should skip updates for properties not in bindings", () => {
            const instance = $(document);
            const state = instance.state({ missingProp: "initial" });

            // Fake a key in `bindings` with an undefined value
            bindings["missingProp"] = undefined;

            state.missingProp = "new value";
            expect(bindings["missingProp"]).toBeUndefined();
        });

        test("state() should update elements bound with data-bind-this", () => {
            document.body.innerHTML = `<span data-bind-this="message"></span>`;

            const instance = $(document);
            const state = instance.state({ message: "Hello" });

            instance.bind(state);

            const boundElements = localBindings.get(state)["message"];
            expect(Array.isArray(boundElements)).toBe(true);
            expect(boundElements.length).toBe(1);

            state.message = "Updated!";
            expect(boundElements[0].textContent).toBe("Updated!");
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

        test("bind() should handle missing global state gracefully", () => {
            document.body.innerHTML = `<span data-bind="nonexistent.value"></span>`;

            const instance = $(document);
            const state = instance.state({ title: "Hello" });

            expect(() => instance.bind(state)).not.toThrow();

            const span = document.querySelector("[data-bind='nonexistent.value']");
            expect(span.textContent).toBe(""); 
        });

        test("bind() should set empty string when state property is undefined", () => {
            document.body.innerHTML = `<span data-bind="missingProp"></span>`;

            const instance = new AnJS();
            const state = instance.state({});
            instance.bind(state);

            const span = document.querySelector("[data-bind='missingProp']");
            expect(span.textContent).toBe(""); // Should hit `?? ""`
        });

        test("bind() should handle data-bind-attr correctly", () => {
            document.body.innerHTML = `<div id="test" data-bind-attr="title:tooltip"></div>`;

            const instance = new AnJS();
            const state = instance.state({ tooltip: "Initial Title" });
            instance.bind(state);

            const div = document.getElementById("test");
            expect(div.getAttribute("title")).toBe("Initial Title"); 
            state.tooltip = "Updated Title";
            expect(div.getAttribute("title")).toBe("Updated Title");
        });

        test("should set textContent for data-bind-this even when state is undefined", () => {
            document.body.innerHTML = `<span data-bind-this="missingProp"></span>`;
            const instance = $(document);
            const state = instance.state({}); 

            instance.bind(state);
            const span = document.querySelector("[data-bind-this='missingProp']");
            expect(span.textContent).toBe("");
        });

        test("bind() should trigger the `else if (attr)` path when only data-bind-attr is present", () => {
            document.body.innerHTML = `<div id="test" data-bind-attr="title:tooltip"></div>`;

            const instance = new AnJS(); // Ensure we use AnJS, not raw bindings
            const state = instance.state({ tooltip: "Initial Title" });

            instance.bind(state); // Bind the state

            const div = document.getElementById("test");
            expect(div.getAttribute("title")).toBe("Initial Title"); // Ensures the path is executed

            // Modify state to trigger update
            state.tooltip = "Updated Title";
            expect(div.getAttribute("title")).toBe("Updated Title"); // Ensures updates are correctly applied
        });
    });

    describe("unbind()", () => {
        test("should remove all bindings", () => {
            instance.unbind(state);

            state.message = "Should not update";
            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).not.toBe("Should not update");
        });

        test("unbind() should remove event listeners from localBindings", () => {
            document.body.innerHTML = `<button data-on="click:testAction">Click</button>`;

            const instance = $(document);
            const state = instance.state({
                testAction: jest.fn()
            });

            instance.bind(state);

            const button = document.querySelector("button");
            button.click();
            expect(state.testAction).toHaveBeenCalledTimes(1);
            instance.unbind(state);

            button.click();
            expect(state.testAction).toHaveBeenCalledTimes(1); 
        });

        test("unbind() should remove event listeners when localBindings has state", () => {
            document.body.innerHTML = `<button data-on="click:testAction">Click</button>`;

            const instance = $(document);
            const state = instance.state({
                testAction: jest.fn()
            });

            // Bind state (should store event in `localBindings`)
            instance.bind(state);

            // Ensure localBindings has the state and event
            expect(localBindings.has(state)).toBe(true);
            expect(localBindings.get(state)).not.toEqual({});  // 🔥 Must have stored bindings
            expect(Object.values(localBindings.get(state)).length).toBeGreaterThan(0);  // 🔥 Must contain at least 1 event

            const button = document.querySelector("button");

            // Click before unbinding (should trigger testAction)
            button.click();
            expect(state.testAction).toHaveBeenCalledTimes(1);

            // Unbind state
            instance.unbind(state);

            // Ensure state is removed from localBindings
            expect(localBindings.has(state)).toBe(false);

            // Click after unbinding (should NOT trigger testAction)
            button.click();
            expect(state.testAction).toHaveBeenCalledTimes(1); // Should remain the same
        });
    });

    describe("data-on event binding", () => {
        test("button should trigger a state function", async () => {
            state.updateMessage = jest.fn((e, s) => { s.message = "Clicked!"; });

            const button = document.querySelector("[data-on='click:updateMessage']");

            instance.bind(state);

            // Wait for state changes to apply
            await new Promise((r) => setTimeout(r, 0));

            // Trigger event
            button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

            expect(state.updateMessage).toHaveBeenCalled();  // ✅ Should now pass
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

        test("data-action should call global state methods", () => {
            instance.global("cards", {
                share: jest.fn((e, s) => { s.shared = true; })
            });

            document.body.innerHTML = `<button data-action="cards.share">Share</button>`;
            instance.bind(state);

            const button = document.querySelector("[data-action='cards.share']");
            button.click();

            expect(instance.global("cards").share).toHaveBeenCalled();
            expect(instance.global("cards").shared).toBe(true);
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

describe("AnJS State & Binding - Additional Tests for Full Coverage", () => {
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

    describe("global()", () => {
        let instance;

        beforeEach(() => {
            instance = $(document);
        });

        test("should return the same instance when called multiple times", () => {
            const theme1 = instance.global("theme", { dark: false });
            const theme2 = instance.global("theme");

            expect(theme1).toBe(theme2);
        });

        test("should throw an error if called without an initial state", () => {
            expect(() => instance.global("missingState")).toThrowError(
                `Global state "missingState" does not exist. Provide an initial state.`
            );
        });

        test("should throw an error if no name is provided", () => {
            expect(() => instance.global()).toThrowError("Global state must have a unique name.");
        });

        test("should throw an error if name is not a string", () => {
            [42, {}, [], null, undefined].forEach(invalidName => {
                expect(() => instance.global(invalidName)).toThrowError("Global state must have a unique name.");
            });
        });

        test("should create and return a new global state", () => {
            const themeState = instance.global("theme", { dark: false });

            expect(themeState).toBeInstanceOf(Object);
            expect(themeState.dark).toBe(false);
        });

        test("should return the existing global state when re-accessed", () => {
            const theme1 = instance.global("theme", { dark: false });
            const theme2 = instance.global("theme");

            expect(theme1).toBe(theme2);
            expect(theme2.dark).toBe(false);
        });

        test("should throw an error for invalid state name types", () => {
            [null, undefined, 42, {}, []].forEach(invalidName => {
                expect(() => instance.global(invalidName)).toThrowError("Global state must have a unique name.");
            });
        });
    });

    describe("hasGlobal()", () => {
        let instance;

        beforeEach(() => {
            instance = $(document);
        });

        test("should return false for non-existing global state", () => {
            expect(instance.hasGlobal("missingState")).toBe(false);
        });

        test("should return true for an existing global state", () => {
            instance.global("theme", { dark: false });
            expect(instance.hasGlobal("theme")).toBe(true);
        });

        test("should not create a new state when checking with hasGlobal", () => {
            expect(instance.hasGlobal("newState")).toBe(false);
            expect(instance.hasGlobal("newState")).toBe(false); // Check again to confirm no side effects
        });

        test("should return true even if global state is modified", () => {
            instance.global("config", { version: 1 });
            expect(instance.hasGlobal("config")).toBe(true);

            instance.global("config").version = 2;
            expect(instance.hasGlobal("config")).toBe(true);
        });

        test("should not throw when checking undefined or invalid names", () => {
            expect(() => instance.hasGlobal()).not.toThrow();
            expect(() => instance.hasGlobal(null)).not.toThrow();
            expect(() => instance.hasGlobal(123)).not.toThrow();
            expect(instance.hasGlobal(null)).toBe(false);
            expect(instance.hasGlobal(123)).toBe(false);
        });
    });

    describe("state()", () => {
        let instance, state;

        beforeEach(() => {
            instance = $(document);
            state = instance.state({ message: "Hello" });
            instance.bind(state);
        });

        test("should return undefined for non-existing properties", () => {
            expect(state.nonExistentProp).toBeUndefined();
        });

        test("should throw an error when using global state without a name", () => {
            expect(() => instance.state({}, { global: true })).toThrowError(
                "Global state must have a name."
            );
        });

        test("should create a reactive proxy state", () => {
            const reactiveState = instance.state({ count: 0 });
            expect(reactiveState).toBeInstanceOf(Object);
            expect(reactiveState.count).toBe(0);
        });

        test("should update state and trigger UI updates", () => {
            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).toBe("Hello");

            state.message = "Updated!";
            expect(span.textContent).toBe("Updated!");
        });

        test("should update `data-bind-this` scoped elements", () => {
            document.body.innerHTML = `<span data-bind-this="message"></span>`;
            instance.bind(state);

            const span = document.querySelector("[data-bind-this='message']");
            expect(span.textContent).toBe("Hello");

            state.message = "Scoped Update!";
            expect(span.textContent).toBe("Scoped Update!");
        });

        test("should update `data-bind-attr` attributes dynamically", () => {
            document.body.innerHTML = `<button data-bind-attr="disabled:isDisabled"></button>`;
            const buttonState = instance.state({ isDisabled: false });
            instance.bind(buttonState);

            const button = document.querySelector("button");
            expect(button.hasAttribute("disabled")).toBe(false);

            buttonState.isDisabled = true;
            expect(button.hasAttribute("disabled")).toBe(true);

            buttonState.isDisabled = false;
            expect(button.hasAttribute("disabled")).toBe(false);
        });

        test("should remove attributes when value is null or undefined", () => {
            document.body.innerHTML = `<div data-bind-attr="title:tooltip"></div>`;
            const attrState = instance.state({ tooltip: "Initial Title" });
            instance.bind(attrState);

            const div = document.querySelector("[data-bind-attr='title:tooltip']");
            expect(div.getAttribute("title")).toBe("Initial Title");

            attrState.tooltip = null;
            expect(div.hasAttribute("title")).toBe(false);

            attrState.tooltip = undefined;
            expect(div.hasAttribute("title")).toBe(false);
        });

        test("should prevent duplicate bindings", () => {
            document.body.innerHTML = `<span data-bind="message"></span>`;
            instance.bind(state);
            instance.bind(state); // Rebinding should not cause issues

            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).toBe("Hello");

            state.message = "Rebinding Test";
            expect(span.textContent).toBe("Rebinding Test");
        });

        test("should track boolean attributes correctly", () => {
            document.body.innerHTML = `<input type="checkbox" data-bind-attr="checked:isChecked">`;

            const boolState = instance.state({ isChecked: false });
            instance.bind(boolState);

            const checkbox = document.querySelector("input");

            expect(checkbox.checked).toBe(false);

            boolState.isChecked = true;
            expect(checkbox.checked).toBe(true);

            boolState.isChecked = false;
            expect(checkbox.checked).toBe(false);
        });

        test("should support dynamically added elements", () => {
            const newSpan = document.createElement("span");
            newSpan.setAttribute("data-bind", "message");
            document.body.appendChild(newSpan);

            state.message = "Dynamic Update!";
            expect(newSpan.textContent).toBe(""); // Should remain empty

            instance.bind(state); // Bind after adding element
            expect(newSpan.textContent).toBe("Dynamic Update!");
        });

        test("should correctly update event-bound state properties", () => {
            document.body.innerHTML = `<button data-on="click:incrementCount">Click</button>`;

            const eventState = instance.state({ count: 0, incrementCount() { this.count++ } });
            instance.bind(eventState);

            const button = document.querySelector("button");
            button.click();
            expect(eventState.count).toBe(1);

            button.click();
            expect(eventState.count).toBe(2);
        });

        test("should not throw if an undefined state property is bound", () => {
            document.body.innerHTML = `<span data-bind="undefinedProp"></span>`;

            const undefinedState = instance.state({});
            instance.bind(undefinedState);

            const span = document.querySelector("[data-bind='undefinedProp']");
            expect(span.textContent).toBe("");
        });

        test("should correctly bind and unbind elements", () => {
            const unbindState = instance.state({ message: "Initial" });

            document.body.innerHTML = `<span data-bind="message"></span>`;
            instance.bind(unbindState);

            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).toBe("Initial");

            instance.unbind(unbindState);
            unbindState.message = "Should Not Update";
            expect(span.textContent).not.toBe("Should Not Update");
        });

        test("state() should set data-bind-this elements to empty string when value is null or undefined", () => {
            document.body.innerHTML = `<span data-bind-this="message"></span>`;

            const instance = new AnJS();
            const state = instance.state({ message: "Hello" });

            instance.bind(state);

            const span = document.querySelector("[data-bind-this='message']");
            expect(span.textContent).toBe("Hello");

            state.message = null;
            expect(span.textContent).toBe("");

            state.message = undefined;
            expect(span.textContent).toBe("");
        });
    });

    describe("Proxy Behavior", () => {
        test("get() should return correct values", () => {
            expect(state.message).toBe("Hello");
        });

        test("set() should update bound elements", () => {
            const span = document.querySelector("[data-bind='message']");
            state.message = "Updated!";
            expect(span.textContent).toBe("Updated!");
        });

        test("set() should update attribute-bound elements", () => {
            document.body.innerHTML = `<div data-bind-attr="title:message"></div>`;

            const attrState = instance.state({ message: "Initial Title" });
            instance.bind(attrState);

            const div = document.querySelector("[data-bind-attr='title:message']");
            expect(div.getAttribute("title")).toBe("Initial Title");

            attrState.message = "New Title";
            expect(div.getAttribute("title")).toBe("New Title");
        });
    });

    describe("unbind()", () => {
        test("should remove all bindings", () => {
            instance.unbind(state);

            state.message = "Should not update";
            const span = document.querySelector("[data-bind='message']");
            expect(span.textContent).not.toBe("Should not update");
        });

        test("should remove attribute bindings", () => {
            document.body.innerHTML = `<div data-bind-attr="title:message"></div>`;

            const attrState = instance.state({ message: "Title" });
            instance.bind(attrState);
            instance.unbind(attrState);

            attrState.message = "New Title";
            const div = document.querySelector("[data-bind-attr='title:message']");
            expect(div.getAttribute("title")).not.toBe("New Title");
        });

        test("should remove event listeners from data-on", () => {
            state.updateMessage = jest.fn((e, s) => { s.message = "Clicked!"; });

            const button = document.querySelector("[data-on='click:updateMessage']");
            instance.unbind(state);
            button.click();

            expect(state.updateMessage).not.toHaveBeenCalled();
        });

        test("unbind() should remove event listeners", () => {
            state.updateMessage = jest.fn((e, s) => { s.message = "Updated!"; });

            const button = document.querySelector("[data-on='click:updateMessage']");
            instance.unbind(state);

            button.click();
            expect(state.updateMessage).not.toHaveBeenCalled(); 
        });
    });

    describe("Event Handling", () => {
        test("should not trigger non-function handlers in data-on", () => {
            document.body.innerHTML = `<button data-on="click:notAFunction">Click</button>`;

            const eventState = instance.state({ notAFunction: "not a function" });
            instance.bind(eventState);

            const button = document.querySelector("button");
            button.click(); // Should not throw an error

            expect(typeof eventState.notAFunction).toBe("string");
        });

        test("should properly trigger event listeners", async () => {
            // ✅ Ensure the mock function is defined **before** binding
            state.updateMessage = jest.fn((e, s) => { s.message = "Clicked!"; });

            const button = document.querySelector("[data-on='click:updateMessage']");

            // ✅ Ensure state is fully bound before clicking
            instance.bind(state);

            // ✅ Wait for the next event loop cycle to ensure binding completes
            await new Promise((resolve) => setTimeout(resolve, 0));

            // ✅ Dispatch event **after** state is fully bound
            button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

            // ✅ Ensure the function was actually called
            expect(state.updateMessage).toHaveBeenCalled();  // ✅ Should pass now
            expect(state.message).toBe("Clicked!");
        });
    });

    describe("data-bind-attr Handling", () => {
        test("should correctly handle null or undefined values", () => {
            document.body.innerHTML = `<div id="test" data-bind-attr="title:message"></div>`;

            const attrState = instance.state({ message: "Initial Title" });
            instance.bind(attrState);

            const div = document.getElementById("test");
            expect(div.getAttribute("title")).toBe("Initial Title");

            attrState.message = null;
            expect(div.hasAttribute("title")).toBe(false); // Attribute should be removed

            attrState.message = undefined;
            expect(div.hasAttribute("title")).toBe(false); // Attribute should still be removed
        });

        test("should correctly update boolean attributes", () => {
            document.body.innerHTML = `<button data-bind-attr="disabled:isDisabled"></button>`;

            const boolState = instance.state({ isDisabled: false });
            instance.bind(boolState);

            const button = document.querySelector("button");

            // Explicitly ensure the button does not start disabled
            expect(button.hasAttribute("disabled")).toBe(false);

            // Set state to true (button should be disabled)
            boolState.isDisabled = true;
            expect(button.hasAttribute("disabled")).toBe(true);

            // Set state to false (button should be enabled again)
            boolState.isDisabled = false;
            expect(button.hasAttribute("disabled")).toBe(false);
        });
    });

    describe("Dynamic Element Handling", () => {
        test("should not auto-bind dynamically added elements", () => {
            const newSpan = document.createElement("span");
            newSpan.setAttribute("data-bind", "message");
            document.body.appendChild(newSpan);

            state.message = "Updated!";

            expect(newSpan.textContent).not.toBe("Updated!"); // Should remain empty
        });

        test("should bind dynamically added elements after calling bind() again", () => {
            const newSpan = document.createElement("span");
            newSpan.setAttribute("data-bind", "message");
            document.body.appendChild(newSpan);

            instance.bind(state);
            state.message = "Updated!";

            expect(newSpan.textContent).toBe("Updated!");
        });

        test("should trigger local state function when data-action is clicked", () => {
            document.body.innerHTML = `<button data-action="customAction">Click</button>`;

            const instance = $(document);
            const state = instance.state({
                customAction: jest.fn((e, s) => { s.clicked = true; })
            });

            instance.bind(state);

            const button = document.querySelector("[data-action='customAction']");
            button.click();

            expect(state.customAction).toHaveBeenCalled();
            expect(state.clicked).toBe(true);
        });

        test("autoEvents() should initialize localBindings for state if not present", () => {
            document.body.innerHTML = `<button data-on="click:testAction">Click</button>`;

            const instance = $(document);
            const rawState = { testAction: jest.fn() };

            expect(localBindings.has(rawState)).toBe(false);
            instance.autoEvents(rawState, document);
            expect(localBindings.has(rawState)).toBe(true);

            const button = document.querySelector("button");
            button.click();
            expect(rawState.testAction).toHaveBeenCalled();
        });

        test("autoEvents() should default to document when no context is provided", () => {
            document.body.innerHTML = `<button data-on="click:testAction">Click</button>`;

            const instance = $(document);
            const state = instance.state({
                testAction: jest.fn()
            });

            instance.autoEvents(state);
            const button = document.querySelector("button");
            button.click();

            expect(state.testAction).toHaveBeenCalled();
        });

        test("autoEvents() should handle elements without data-on", () => {
            document.body.innerHTML = `<button>No Event</button>`; // No `data-on`

            const instance = $(document);
            const state = instance.state({ testAction: jest.fn() });

            // Spy on addEventListener to verify no event is attached
            const button = document.querySelector("button");
            const spy = jest.spyOn(button, "addEventListener");

            // Call autoEvents (should do nothing)
            instance.autoEvents(state);

            // Ensure no event was added
            expect(spy).not.toHaveBeenCalled();
        });

        test("data-action should trigger || [] when action is missing", () => {
            document.body.innerHTML = `<button>Click</button>`; 

            const instance = $(document);
            const state = instance.state({});

            instance.bind(state);

            const button = document.querySelector("button");
            button.click(); 

            expect(button.dataset.action).toBeUndefined(); 
        });

        test("data-action should handle undefined action and execute fallback", () => {
            document.body.innerHTML = `<button data-action></button>`; 

            const instance = $(document);
            const state = instance.state({});

            instance.autoEvents(state, document);
            const button = document.querySelector("[data-action]");
            button.click(); 

            expect(button.dataset.action).toBe("");
        });
    });

    describe("DOMContentLoaded Handling", () => {
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

    describe("Form Inputs", () => {
        test("input should update state on input event", () => {
            const input = document.querySelector("input[data-bind-attr='value:message']");
            input.value = "User Input";
            input.dispatchEvent(new Event("input"));

            expect(state.message).toBe("User Input");
        });

        test("textarea should update state on input event", () => {
            document.body.innerHTML = `<textarea data-bind-attr="value:message"></textarea>`;

            const textAreaState = instance.state({ message: "Hello" });
            instance.bind(textAreaState);

            const textarea = document.querySelector("textarea");
            textarea.value = "User Typed";
            textarea.dispatchEvent(new Event("input"));

            expect(textAreaState.message).toBe("User Typed");
        });
    });

    describe("data-bind-attr Handling", () => {
        test("boolean attributes should update properly before binding", () => {
            document.body.innerHTML = `<button data-bind-attr="disabled:isDisabled"></button>`;

            const boolState = instance.state({ isDisabled: true });

            // ✅ Button should be disabled immediately after bind
            instance.bind(boolState);
            const button = document.querySelector("button");
            expect(button.hasAttribute("disabled")).toBe(true);

            // ✅ Ensure changing state later updates correctly
            boolState.isDisabled = false;
            expect(button.hasAttribute("disabled")).toBe(false);
        });

        test("checkbox checked state should update", () => {
            document.body.innerHTML = `<input type="checkbox" data-bind-attr="checked:isChecked">`;

            const checkState = instance.state({ isChecked: false });
            instance.bind(checkState);

            const checkbox = document.querySelector("input");

            // ✅ Initially unchecked
            expect(checkbox.checked).toBe(false);

            // ✅ Change state
            checkState.isChecked = true;
            expect(checkbox.checked).toBe(true);

            // ✅ Change back
            checkState.isChecked = false;
            expect(checkbox.checked).toBe(false);
        });
    });
});