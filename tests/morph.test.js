import { JSDOM } from "jsdom";

let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html><body><div id="root"></div></body>`);
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
});

import { morph } from "../src/morph.js";

describe("DOM Morph", () => {

    let root;

    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        root = document.getElementById("root");
    });

    describe("Text content patching", () => {

        test("should update text content when different", () => {
            root.innerHTML = "<p>Old text</p>";
            morph(root, "<p>New text</p>");
            expect(root.querySelector("p").textContent).toBe("New text");
        });

        test("should not replace element when only text changes", () => {
            root.innerHTML = "<p>Old</p>";
            const p = root.querySelector("p");
            morph(root, "<p>New</p>");
            expect(root.querySelector("p")).toBe(p); // Same reference
        });

        test("should handle empty to text", () => {
            root.innerHTML = "<p></p>";
            morph(root, "<p>Content</p>");
            expect(root.querySelector("p").textContent).toBe("Content");
        });

        test("should handle text to empty", () => {
            root.innerHTML = "<p>Content</p>";
            morph(root, "<p></p>");
            expect(root.querySelector("p").textContent).toBe("");
        });
    });

    describe("Attribute sync", () => {

        test("should add new attributes", () => {
            root.innerHTML = '<div></div>';
            morph(root, '<div class="active"></div>');
            expect(root.querySelector("div").getAttribute("class")).toBe("active");
        });

        test("should update changed attributes", () => {
            root.innerHTML = '<div class="old"></div>';
            morph(root, '<div class="new"></div>');
            expect(root.querySelector("div").getAttribute("class")).toBe("new");
        });

        test("should remove stale attributes", () => {
            root.innerHTML = '<div class="old" data-x="y"></div>';
            morph(root, '<div class="old"></div>');
            expect(root.querySelector("div").hasAttribute("data-x")).toBe(false);
        });

        test("should not modify unchanged attributes", () => {
            root.innerHTML = '<div class="same" id="test"></div>';
            morph(root, '<div class="same" id="test"></div>');
            expect(root.querySelector("div").getAttribute("class")).toBe("same");
        });
    });

    describe("Child node management", () => {

        test("should add new child elements", () => {
            root.innerHTML = "<ul><li>A</li></ul>";
            morph(root, "<ul><li>A</li><li>B</li></ul>");
            expect(root.querySelectorAll("li")).toHaveLength(2);
        });

        test("should remove excess child elements", () => {
            root.innerHTML = "<ul><li>A</li><li>B</li><li>C</li></ul>";
            morph(root, "<ul><li>A</li></ul>");
            expect(root.querySelectorAll("li")).toHaveLength(1);
        });

        test("should preserve existing elements and update text", () => {
            root.innerHTML = "<ul><li>Old A</li><li>Old B</li></ul>";
            const firstLi = root.querySelector("li");
            morph(root, "<ul><li>New A</li><li>New B</li></ul>");
            expect(root.querySelector("li")).toBe(firstLi);
            expect(firstLi.textContent).toBe("New A");
        });

        test("should handle empty to populated", () => {
            root.innerHTML = "";
            morph(root, "<p>Hello</p><p>World</p>");
            expect(root.querySelectorAll("p")).toHaveLength(2);
        });

        test("should handle populated to empty", () => {
            root.innerHTML = "<p>Hello</p><p>World</p>";
            morph(root, "");
            expect(root.children).toHaveLength(0);
        });
    });

    describe("Mixed node types", () => {

        test("should handle text and element nodes together", () => {
            root.innerHTML = "<div>Text <span>bold</span> more</div>";
            morph(root, "<div>Updated <span>styled</span> end</div>");
            expect(root.querySelector("span").textContent).toBe("styled");
        });

        test("should replace element with different tag", () => {
            root.innerHTML = "<div><span>old</span></div>";
            morph(root, "<div><em>new</em></div>");
            expect(root.querySelector("em")).not.toBeNull();
            expect(root.querySelector("span")).toBeNull();
        });

        test("should replace text node with element node (type mismatch)", () => {
            root.innerHTML = "just text";
            morph(root, "<p>element now</p>");
            expect(root.querySelector("p")).not.toBeNull();
            expect(root.querySelector("p").textContent).toBe("element now");
        });

        test("should replace element node with text node (type mismatch)", () => {
            root.innerHTML = "<p>was element</p>";
            morph(root, "just text now");
            expect(root.querySelector("p")).toBeNull();
            expect(root.textContent).toBe("just text now");
        });
    });

    describe("Deep nesting", () => {

        test("should patch deeply nested elements", () => {
            root.innerHTML = "<div><section><p><span>deep</span></p></section></div>";
            const span = root.querySelector("span");
            morph(root, "<div><section><p><span>patched</span></p></section></div>");
            expect(root.querySelector("span")).toBe(span);
            expect(span.textContent).toBe("patched");
        });
    });

    describe("Input preservation", () => {

        test("should preserve focused input value", () => {
            root.innerHTML = '<input type="text" value="old">';
            const input = root.querySelector("input");
            input.value = "old";

            // Mock activeElement to reliably simulate focus in JSDOM
            Object.defineProperty(document, 'activeElement', { value: input, configurable: true });
            morph(root, '<input type="text" value="new">');
            Object.defineProperty(document, 'activeElement', { value: document.body, configurable: true });

            // Focused input should preserve its value
            expect(root.querySelector("input")).toBe(input);
            expect(input.value).toBe("old");
        });

        test("should sync input value when not focused", () => {
            root.innerHTML = '<input type="text" value="old">';
            const input = root.querySelector("input");
            input.value = "old";

            morph(root, '<input type="text" value="updated">');

            expect(root.querySelector("input")).toBe(input);
            expect(input.value).toBe("updated");
        });

        test("should sync textarea value when not focused", () => {
            root.innerHTML = '<textarea>old content</textarea>';
            const textarea = root.querySelector("textarea");
            textarea.value = "old content";

            morph(root, '<textarea>new content</textarea>');

            expect(root.querySelector("textarea")).toBe(textarea);
        });

        test("should sync checkbox checked state", () => {
            root.innerHTML = '<input type="checkbox">';
            const cb = root.querySelector("input");
            cb.checked = false;

            morph(root, '<input type="checkbox" checked>');

            expect(root.querySelector("input")).toBe(cb);
            expect(cb.checked).toBe(true);
        });

        test("should uncheck checkbox when new HTML lacks checked", () => {
            root.innerHTML = '<input type="checkbox" checked>';
            const cb = root.querySelector("input");
            cb.checked = true;

            morph(root, '<input type="checkbox">');

            expect(root.querySelector("input")).toBe(cb);
            expect(cb.checked).toBe(false);
        });

        test("should sync radio button checked state", () => {
            root.innerHTML = '<input type="radio" name="opt" value="a">';
            const radio = root.querySelector("input");
            radio.checked = false;

            morph(root, '<input type="radio" name="opt" value="a" checked>');

            expect(root.querySelector("input")).toBe(radio);
            expect(radio.checked).toBe(true);
        });

        test("should not change focused checkbox", () => {
            root.innerHTML = '<input type="checkbox">';
            const cb = root.querySelector("input");
            cb.checked = false;

            // Mock activeElement to reliably simulate focus in JSDOM
            Object.defineProperty(document, 'activeElement', { value: cb, configurable: true });
            morph(root, '<input type="checkbox" checked>');
            Object.defineProperty(document, 'activeElement', { value: document.body, configurable: true });

            // Focused checkbox should preserve its checked state
            expect(root.querySelector("input")).toBe(cb);
            expect(cb.checked).toBe(false);
        });

        test("should sync select value when not focused", () => {
            root.innerHTML = '<select><option value="a">A</option><option value="b">B</option></select>';
            const select = root.querySelector("select");
            select.value = "a";

            morph(root, '<select><option value="a">A</option><option value="b" selected>B</option></select>');

            expect(root.querySelector("select")).toBe(select);
        });

        test("should preserve focused select value", () => {
            root.innerHTML = '<select><option value="a">A</option><option value="b">B</option></select>';
            const select = root.querySelector("select");
            select.value = "a";

            // Mock activeElement to reliably simulate focus in JSDOM
            Object.defineProperty(document, 'activeElement', { value: select, configurable: true });
            morph(root, '<select><option value="a">A</option><option value="b">B</option></select>');
            Object.defineProperty(document, 'activeElement', { value: document.body, configurable: true });

            // Focused select should be preserved (same DOM node)
            expect(root.querySelector("select")).toBe(select);
            expect(select.value).toBe("a");
        });
    });

    describe("Comment node patching", () => {

        test("should update comment node data", () => {
            root.innerHTML = "<!-- old comment -->";
            morph(root, "<!-- new comment -->");
            // Should not throw and comment should be updated
            expect(root.childNodes[0].nodeType).toBe(8);
            expect(root.childNodes[0].data).toContain("new comment");
        });
    });
});
