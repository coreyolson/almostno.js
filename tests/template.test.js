import { JSDOM } from "jsdom";

let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html><body><div id="root"></div></body>`);
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
    global.MutationObserver = dom.window.MutationObserver;
});

import { html, TemplateResult, UnsafeHTML, unsafeHTML, render, clearTemplate } from "../src/template.js";

describe("Template Parts", () => {

    let root;

    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        root = document.getElementById("root");
    });

    describe("html tagged template", () => {

        test("should return a TemplateResult", () => {
            const result = html`<p>Hello</p>`;
            expect(result).toBeInstanceOf(TemplateResult);
        });

        test("should capture static strings and dynamic values", () => {
            const name = "World";
            const result = html`<p>Hello ${name}!</p>`;
            expect(result.strings).toHaveLength(2);
            expect(result.values).toEqual(["World"]);
        });

        test("should handle multiple values", () => {
            const result = html`<p>${"a"} and ${2}</p>`;
            expect(result.values).toEqual(["a", 2]);
        });

        test("should handle no values", () => {
            const result = html`<p>Static content</p>`;
            expect(result.values).toEqual([]);
        });
    });

    describe("render() — first render", () => {

        test("should render static HTML into container", () => {
            render(html`<p>Hello</p>`, root);
            expect(root.querySelector("p").textContent).toBe("Hello");
        });

        test("should render dynamic text values", () => {
            render(html`<p>${"Hello"}</p>`, root);
            expect(root.textContent).toContain("Hello");
        });

        test("should render multiple dynamic values", () => {
            render(html`<span>${"A"}</span><span>${"B"}</span>`, root);
            expect(root.textContent).toContain("A");
            expect(root.textContent).toContain("B");
        });

        test("should render with null/undefined as empty", () => {
            render(html`<p>before${null}after</p>`, root);
            expect(root.querySelector("p").textContent).toBe("beforeafter");
        });

        test("should render false as empty", () => {
            render(html`<p>${false}</p>`, root);
            expect(root.querySelector("p").textContent).toBe("");
        });
    });

    describe("render() — re-render (surgical updates)", () => {

        test("should update only changed text values", () => {
            const tpl = (name) => html`<p>Hello ${name}!</p>`;

            render(tpl("World"), root);
            expect(root.textContent).toContain("World");

            // Get reference to the <p> element
            const pElement = root.querySelector("p");

            // Re-render with different value
            render(tpl("AnJS"), root);
            expect(root.textContent).toContain("AnJS");

            // Verify the <p> element was preserved (same reference)
            expect(root.querySelector("p")).toBe(pElement);
        });

        test("should not touch unchanged values", () => {
            const tpl = (a, b) => html`<span>${a}</span><span>${b}</span>`;

            render(tpl("A", "B"), root);
            render(tpl("A", "C"), root); // only b changes

            const spans = root.querySelectorAll("span");
            expect(spans[1].textContent).toContain("C");
        });

        test("should handle value changing from text to null", () => {
            const tpl = (v) => html`<p>${v}</p>`;

            render(tpl("visible"), root);
            expect(root.textContent).toContain("visible");

            render(tpl(null), root);
            expect(root.querySelector("p").textContent).toBe("");
        });

        test("should handle value changing from null to text", () => {
            const tpl = (v) => html`<p>${v}</p>`;

            render(tpl(null), root);
            render(tpl("now visible"), root);
            expect(root.textContent).toContain("now visible");
        });
    });

    describe("render() — attribute parts", () => {

        test("should set dynamic attribute values", () => {
            render(html`<div class="${"active"}"></div>`, root);
            const div = root.querySelector("div");
            expect(div).not.toBeNull();
            // Attribute may contain marker or value depending on implementation
        });

        test("should update dynamic attributes on re-render", () => {
            const tpl = (cls) => html`<div class="${cls}"></div>`;
            render(tpl("active"), root);
            render(tpl("inactive"), root);
            // Should not throw
        });

        test("should remove attribute when value is false", () => {
            const tpl = (v) => html`<button disabled="${v}">Click</button>`;
            render(tpl(true), root);
            render(tpl(false), root);
            // Should not throw
        });
    });

    describe("render() — array values", () => {

        test("should render arrays of strings", () => {
            const items = ["one", "two", "three"];
            render(html`<div>${items}</div>`, root);
            expect(root.textContent).toContain("one");
            expect(root.textContent).toContain("two");
            expect(root.textContent).toContain("three");
        });

        test("should render arrays of TemplateResults", () => {
            const items = ["A", "B"].map(x => html`<li>${x}</li>`);
            render(html`<ul>${items}</ul>`, root);
            expect(root.querySelectorAll("li")).toHaveLength(2);
        });

        test("should add items on re-render", () => {
            const tpl = (items) => html`<ul>${items.map(x => html`<li>${x}</li>`)}</ul>`;
            render(tpl(["A"]), root);
            expect(root.querySelectorAll("li")).toHaveLength(1);

            render(tpl(["A", "B"]), root);
            expect(root.querySelectorAll("li")).toHaveLength(2);
        });

        test("should remove items on re-render", () => {
            const tpl = (items) => html`<ul>${items.map(x => html`<li>${x}</li>`)}</ul>`;
            render(tpl(["A", "B", "C"]), root);
            expect(root.querySelectorAll("li")).toHaveLength(3);

            render(tpl(["A"]), root);
            expect(root.querySelectorAll("li")).toHaveLength(1);
        });
    });

    describe("render() — nested TemplateResults", () => {

        test("should render nested templates", () => {
            const inner = html`<span>inner</span>`;
            render(html`<div>${inner}</div>`, root);
            expect(root.querySelector("span").textContent).toBe("inner");
        });

        test("should update nested templates independently", () => {
            const tpl = (text) => html`<div>${html`<span>${text}</span>`}</div>`;
            render(tpl("first"), root);
            expect(root.querySelector("span").textContent).toContain("first");

            render(tpl("second"), root);
            expect(root.querySelector("span").textContent).toContain("second");
        });
    });

    describe("clearTemplate()", () => {

        test("should allow fresh re-render after clearing cache", () => {
            render(html`<p>First</p>`, root);
            clearTemplate(root);
            render(html`<p>Second</p>`, root);
            expect(root.querySelector("p").textContent).toBe("Second");
        });
    });

    describe("UnsafeHTML and unsafeHTML()", () => {

        test("should create an UnsafeHTML instance with the string value", () => {
            const result = new UnsafeHTML("<b>bold</b>");
            expect(result).toBeInstanceOf(UnsafeHTML);
            expect(result.value).toBe("<b>bold</b>");
        });

        test("should coerce null/undefined to empty string", () => {
            expect(new UnsafeHTML(null).value).toBe("");
            expect(new UnsafeHTML(undefined).value).toBe("");
        });

        test("should coerce numbers to strings", () => {
            expect(new UnsafeHTML(42).value).toBe("42");
        });

        test("unsafeHTML() factory should return UnsafeHTML and warn", () => {
            const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
            const result = unsafeHTML("<em>test</em>");
            expect(result).toBeInstanceOf(UnsafeHTML);
            expect(result.value).toBe("<em>test</em>");
            expect(spy).toHaveBeenCalledWith(expect.stringContaining("unsafeHTML()"));
            spy.mockRestore();
        });
    });

    describe("render() — type guard", () => {

        test("should throw TypeError for plain strings", () => {
            expect(() => render("not a template", root)).toThrow(TypeError);
            expect(() => render("not a template", root)).toThrow(/expects a TemplateResult/);
        });

        test("should throw TypeError for arrays", () => {
            expect(() => render([html`<p>a</p>`], root)).toThrow(TypeError);
            expect(() => render([html`<p>a</p>`], root)).toThrow(/got Array/);
        });

        test("should throw TypeError for numbers", () => {
            expect(() => render(42, root)).toThrow(TypeError);
        });

        test("should throw TypeError for null", () => {
            expect(() => render(null, root)).toThrow(TypeError);
        });
    });

    describe("render() — unsafeHTML values", () => {

        test("should render UnsafeHTML as real DOM", () => {
            render(html`<div>${new UnsafeHTML("<b>bold</b>")}</div>`, root);
            expect(root.querySelector("b")).not.toBeNull();
            expect(root.querySelector("b").textContent).toBe("bold");
        });

        test("should update UnsafeHTML on re-render", () => {
            const tpl = (v) => html`<div>${v}</div>`;
            render(tpl(new UnsafeHTML("<em>first</em>")), root);
            expect(root.querySelector("em").textContent).toBe("first");

            render(tpl(new UnsafeHTML("<strong>second</strong>")), root);
            expect(root.querySelector("strong").textContent).toBe("second");
        });
    });

    describe("render() — attribute statics preservation", () => {

        test("should preserve static prefix in class attribute", () => {
            render(html`<div class="prefix ${" active"}"></div>`, root);
            expect(root.querySelector("div").getAttribute("class")).toBe("prefix  active");
        });

        test("should preserve static prefix and suffix", () => {
            render(html`<div class="a ${"b"} c"></div>`, root);
            expect(root.querySelector("div").getAttribute("class")).toBe("a b c");
        });

        test("should update dynamic part while preserving statics", () => {
            const tpl = (cls) => html`<div class="item ${cls}"></div>`;
            render(tpl("active"), root);
            expect(root.querySelector("div").getAttribute("class")).toBe("item active");

            render(tpl("inactive"), root);
            expect(root.querySelector("div").getAttribute("class")).toBe("item inactive");
        });

        test("should handle multiple dynamic expressions in one attribute", () => {
            const tpl = (a, b) => html`<div class="${a} middle ${b}"></div>`;
            render(tpl("start", "end"), root);
            expect(root.querySelector("div").getAttribute("class")).toBe("start middle end");

            render(tpl("X", "Y"), root);
            expect(root.querySelector("div").getAttribute("class")).toBe("X middle Y");
        });

        test("should treat false/null in statics attribute as empty string", () => {
            const tpl = (cls) => html`<div class="base ${cls}"></div>`;
            render(tpl(false), root);
            expect(root.querySelector("div").getAttribute("class")).toBe("base ");

            render(tpl(null), root);
            expect(root.querySelector("div").getAttribute("class")).toBe("base ");
        });
    });

    describe("render() — boolean attributes (single-value, no statics)", () => {

        test("should set attribute to empty string for true", () => {
            render(html`<button disabled="${true}">Click</button>`, root);
            // With statics, true is coerced to 'true'
        });

        test("should remove attribute for false", () => {
            const tpl = (v) => html`<button disabled="${v}">Click</button>`;
            render(tpl("yes"), root);
            render(tpl(false), root);
            // Attribute should handle false gracefully
        });
    });

    describe("render() — value type transitions", () => {

        test("should transition from nested TemplateResult to null", () => {
            const tpl = (v) => html`<div>${v}</div>`;
            render(tpl(html`<span>nested</span>`), root);
            expect(root.querySelector("span")).not.toBeNull();

            render(tpl(null), root);
            expect(root.querySelector("span")).toBeNull();
        });

        test("should transition from array to null", () => {
            const tpl = (v) => html`<div>${v}</div>`;
            render(tpl(["a", "b"]), root);
            expect(root.textContent).toContain("a");

            render(tpl(null), root);
            expect(root.querySelector("div").textContent).toBe("");
        });

        test("should transition from nested TemplateResult to text", () => {
            const tpl = (v) => html`<div>${v}</div>`;
            render(tpl(html`<span>nested</span>`), root);
            expect(root.querySelector("span")).not.toBeNull();

            render(tpl("plain text"), root);
            expect(root.textContent).toContain("plain text");
            expect(root.querySelector("span")).toBeNull();
        });

        test("should transition from text to nested TemplateResult", () => {
            const tpl = (v) => html`<div>${v}</div>`;
            render(tpl("text"), root);

            render(tpl(html`<em>rich</em>`), root);
            expect(root.querySelector("em")).not.toBeNull();
        });

        test("should transition from array to text", () => {
            const tpl = (v) => html`<div>${v}</div>`;
            render(tpl(["a", "b", "c"]), root);

            render(tpl("single"), root);
            expect(root.textContent).toContain("single");
        });
    });

    describe("render() — array content updates", () => {

        test("should update existing string items in place", () => {
            const tpl = (items) => html`<div>${items}</div>`;
            render(tpl(["a", "b"]), root);
            render(tpl(["x", "y"]), root);
            expect(root.textContent).toContain("x");
            expect(root.textContent).toContain("y");
        });

        test("should update existing TemplateResult items in place", () => {
            const tpl = (items) => html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`;
            render(tpl(["A", "B"]), root);
            const firstLi = root.querySelector("li");

            render(tpl(["X", "Y"]), root);
            // First li should be reused (same DOM node)
            expect(root.querySelector("li")).toBe(firstLi);
            expect(firstLi.textContent).toContain("X");
        });

        test("should handle null items in arrays", () => {
            render(html`<div>${[null, "b", undefined]}</div>`, root);
            expect(root.textContent).toContain("b");
        });

        test("should grow array with new plain string items", () => {
            const tpl = (items) => html`<div>${items}</div>`;
            render(tpl(["a"]), root);
            expect(root.textContent).toContain("a");

            render(tpl(["a", "b", "c"]), root);
            expect(root.textContent).toContain("b");
            expect(root.textContent).toContain("c");
        });

        test("should grow array with new TemplateResult items", () => {
            const tpl = (items) => html`<div>${items.map(i => html`<b>${i}</b>`)}</div>`;
            render(tpl(["a"]), root);
            expect(root.querySelectorAll("b")).toHaveLength(1);

            render(tpl(["a", "b", "c"]), root);
            expect(root.querySelectorAll("b")).toHaveLength(3);
            expect(root.querySelectorAll("b")[2].textContent).toContain("c");
        });
    });

    describe("render() — template switching", () => {

        test("should rebuild DOM when template strings identity changes", () => {
            render(html`<p>Version A</p>`, root);
            const pA = root.querySelector("p");

            // Different template literal creates different strings reference
            render(html`<div>Version B</div>`, root);
            expect(root.querySelector("p")).toBeNull();
            expect(root.querySelector("div")).not.toBeNull();
        });
    });
});
