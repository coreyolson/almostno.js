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

// Import utilities and base class
import { html, registerComponent, AnJSElement } from "../src/element.js";
import $ from "../src/index.js"; // Ensure `$` is available

describe("AnJS Element Utilities & Components", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    describe("html() Utility", () => {
        test("should return a properly formatted string", () => {
            const result = html`Hello, ${"world"}!`;
            expect(result).toBe("Hello, world!");
        });

        test("should handle multiple values", () => {
            const name = "Alice";
            const age = 30;
            const result = html`Name: ${name}, Age: ${age}`;
            expect(result).toBe("Name: Alice, Age: 30");
        });

        test("should handle missing values", () => {
            const result = html`Hello, ${undefined}!`;
            expect(result).toBe("Hello, !");
        });

        test("should handle empty input", () => {
            expect(html``).toBe("");
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

        test("should update when attribute changes", () => {
            const element = document.querySelector("sample-component");
            element.setAttribute("value", "100");
            expect(element.state.value).toBe("100");
            expect(element.querySelector("span").textContent).toBe("100");
        });

        test("should update UI when state changes", () => {
            const element = document.querySelector("sample-component");
            element.state.value = "Updated!";
            expect(element.querySelector("span").textContent).toBe("Updated!");
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
    class SampleComponent extends AnJSElement {
        static get observedAttributes() {
            return ["value"];
        }

        render() {
            return `<span data-bind="value">${this.state.value}</span>`;
        }
    }

    beforeAll(() => {
        registerComponent("sample-component", SampleComponent);
    });

    let element;

    beforeEach(() => {
        document.body.innerHTML = `<sample-component value="42"></sample-component>`;
        element = document.querySelector("sample-component");
    });

    test("should update state when attribute changes (hitting if branch)", () => {
        const updateSpy = jest.spyOn(element, "update");

        element.setAttribute("value", "100");

        expect(element.state.value).toBe("100");
        expect(updateSpy).toHaveBeenCalled();
    });

    test("should NOT update if state already matches new attribute value (hitting else branch)", () => {
        element.state.value = "42";
        const updateSpy = jest.spyOn(element, "update");

        element.setAttribute("value", "42");

        expect(element.state.value).toBe("42");
        expect(updateSpy).not.toHaveBeenCalled();
    });

    test("should initialize missing attributes as empty strings", () => {
        const spy = jest.spyOn(element, "getAttribute").mockReturnValue(null);

        element.connectedCallback(); // Trigger manually

        expect(spy).toHaveBeenCalledWith("value");
        expect(element.state.value).toBe(""); // Should still be empty string, NOT undefined or null

        spy.mockRestore();
    });
});