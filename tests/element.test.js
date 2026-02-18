import { JSDOM } from "jsdom";

// Setup JSDOM before importing AnJS components
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="test-container"></div>
        </body>`);

    // Attach JSDOM to global scope
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
});

// Helper: flush microtask queue (allows batched proxy updates to complete)
const flush = () => new Promise(resolve => queueMicrotask(resolve));

// Import utilities and base class
import { html, registerComponent, AnJSElement } from "../src/element.js";
import { TemplateResult } from "../src/template.js";
import $ from "../src/index.js"; // Ensure `$` is available

describe("AnJS Element Utilities & Components", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    describe("html() Utility", () => {
        test("should return a TemplateResult", () => {
            const result = html`Hello, ${"world"}!`;
            expect(result).toBeInstanceOf(TemplateResult);
        });

        test("should capture static strings and dynamic values", () => {
            const name = "Alice";
            const age = 30;
            const result = html`Name: ${name}, Age: ${age}`;
            expect(result.strings).toHaveLength(3);
            expect(result.values).toEqual(["Alice", 30]);
        });

        test("should handle missing values", () => {
            const result = html`Hello, ${undefined}!`;
            expect(result.values).toEqual([undefined]);
        });

        test("should handle empty input", () => {
            const result = html``;
            expect(result).toBeInstanceOf(TemplateResult);
            expect(result.values).toEqual([]);
        });
    });

    describe("registerComponent()", () => {
        class TestComponent extends AnJSElement {
            render() {
                return `<p>Test Component</p>`;
            }
        }

        test("should register a custom element", () => {
            registerComponent("test-component", TestComponent);
            expect(customElements.get("test-component")).toBe(TestComponent);
        });

        test("should create an instance of the registered component", () => {
            registerComponent("test-component", TestComponent);
            const element = document.createElement("test-component");
            document.body.appendChild(element);
            expect(element instanceof TestComponent).toBe(true);
        });
    });

    describe("AnJSElement Base Class", () => {
        class SampleComponent extends AnJSElement {
            static get observedAttributes() {
                return ["value"];
            }

            render() {
                return `<span data-bind="value">${this.state.value}</span>`;
            }
        }

        beforeEach(() => {
            registerComponent("sample-component", SampleComponent);
            document.body.innerHTML = `<sample-component value="42"></sample-component>`;
        });

        test("should initialize with state from attributes", () => {
            const element = document.querySelector("sample-component");
            expect(element.state.value).toBe("42");
            expect(element.querySelector("span").textContent).toBe("42");
        });

        test("should update when attribute changes", async () => {
            const element = document.querySelector("sample-component");
            element.setAttribute("value", "100");

            // attributeChangedCallback sets state which queues microtask update
            await flush();

            expect(element.state.value).toBe("100");
            expect(element.querySelector("span").textContent).toBe("100");
        });

        test("should update UI when state changes (after microtask)", async () => {
            const element = document.querySelector("sample-component");
            element.state.value = "Updated!";

            // Proxy-triggered renders are microtask-batched
            await flush();

            expect(element.querySelector("span").textContent).toBe("Updated!");
        });

        test("should coalesce multiple state changes into one render", async () => {
            const element = document.querySelector("sample-component");
            const updateSpy = jest.spyOn(element, "update");

            // Multiple synchronous state changes
            element.state.value = "A";
            element.state.value = "B";
            element.state.value = "C";

            // No update yet (all queued)
            expect(updateSpy).not.toHaveBeenCalled();

            await flush();

            // Only one update for all three changes
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(element.state.value).toBe("C");
        });

        test("explicit update() should cancel pending microtask", async () => {
            const element = document.querySelector("sample-component");
            const renderSpy = jest.spyOn(element, "render");
            const initialCallCount = renderSpy.mock.calls.length;

            element.state.value = "queued";
            element.update(); // explicit — runs immediately

            await flush();

            // render should have been called once (by explicit update), not twice
            expect(renderSpy.mock.calls.length - initialCallCount).toBe(1);
        });
    });
});

// Define a test element without overriding `render()`
class TestElement extends AnJSElement { }

// Register the test element
registerComponent("test-element", TestElement);

describe("AnJSElement Default Render Method", () => {

    test("should return default message when render() is not overridden", () => {

        // Append element to the DOM
        document.body.innerHTML = `<test-element></test-element>`;

        // Select the element
        const element = document.querySelector("test-element");

        // Ensure default render output is used
        expect(element.innerHTML).toBe("<p>TestElement is not implemented yet.</p>");
    });
});

describe("AnJSElement Attribute Change Handling", () => {
    class AttrComponent extends AnJSElement {
        static get observedAttributes() {
            return ["value"];
        }

        render() {
            return `<span data-bind="value">${this.state.value}</span>`;
        }
    }

    beforeAll(() => {
        registerComponent("attr-component", AttrComponent);
    });

    let element;

    beforeEach(() => {
        document.body.innerHTML = `<attr-component value="42"></attr-component>`;
        element = document.querySelector("attr-component");
    });

    test("should update state when attribute changes", async () => {
        element.setAttribute("value", "100");

        // Proxy set queues microtask update
        await flush();

        expect(element.state.value).toBe("100");
        expect(element.querySelector("span").textContent).toBe("100");
    });

    test("should NOT update if state already matches new attribute value", () => {
        const updateSpy = jest.spyOn(element, "update");

        // State is already "42" from connectedCallback
        element.setAttribute("value", "42");

        expect(element.state.value).toBe("42");
        expect(updateSpy).not.toHaveBeenCalled();
    });

    test("should initialize missing attributes as empty strings", async () => {
        const spy = jest.spyOn(element, "getAttribute").mockReturnValue(null);

        element.connectedCallback(); // Trigger manually

        expect(spy).toHaveBeenCalledWith("value");
        expect(element.state.value).toBe(""); // Should still be empty string

        spy.mockRestore();
    });
});

describe("AnJSElement Morph Rendering", () => {
    class MorphComponent extends AnJSElement {
        render() {
            return `<div class="wrapper"><p>${this.state.text || "default"}</p></div>`;
        }
    }

    beforeAll(() => {
        registerComponent("morph-component", MorphComponent);
    });

    test("should use innerHTML on first render", () => {
        document.body.innerHTML = `<morph-component></morph-component>`;
        const element = document.querySelector("morph-component");
        expect(element.querySelector("p").textContent).toBe("default");
    });

    test("should morph (preserve DOM nodes) on subsequent renders", async () => {
        document.body.innerHTML = `<morph-component></morph-component>`;
        const element = document.querySelector("morph-component");
        const wrapper = element.querySelector(".wrapper");

        element.state.text = "updated";
        await flush();

        // Same wrapper element should be preserved
        expect(element.querySelector(".wrapper")).toBe(wrapper);
        expect(element.querySelector("p").textContent).toBe("updated");
    });
});

describe("AnJSElement Computed State", () => {
    class ComputedComponent extends AnJSElement {
        constructor() {
            super();
            this.computed("total", ["price", "quantity"], (p, q) => (p || 0) * (q || 0));
        }

        render() {
            return `<span>${this.state.total}</span>`;
        }
    }

    beforeAll(() => {
        registerComponent("computed-component", ComputedComponent);
    });

    test("should compute initial value", () => {
        document.body.innerHTML = `<computed-component></computed-component>`;
        const element = document.querySelector("computed-component");
        expect(element.state.total).toBe(0);
    });

    test("should recompute when dependencies change", async () => {
        document.body.innerHTML = `<computed-component></computed-component>`;
        const element = document.querySelector("computed-component");

        element.state.price = 10;
        element.state.quantity = 5;
        await flush();

        expect(element.state.total).toBe(50);
    });

    test("should update when a single dependency changes", async () => {
        document.body.innerHTML = `<computed-component></computed-component>`;
        const element = document.querySelector("computed-component");

        element.state.price = 10;
        element.state.quantity = 3;
        await flush();

        expect(element.state.total).toBe(30);

        element.state.quantity = 7;
        await flush();

        expect(element.state.total).toBe(70);
    });
});