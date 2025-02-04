// Dependencies
import { JSDOM } from "jsdom";

// Setup JSDOM before importing AnJS
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <div id="test" class="box">Hello</div>
            <div id="wrapper">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
            </div>
            <form id="form">
                <input type="text" name="username" value="testuser" />
                <input type="password" name="password" value="secret" />
            </form>
        </body>`);

    // Attach JSDOM to global scope
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

// Import AnJS after setting up JSDOM
import $ from "../src/index.js";

describe("AnJS DOM Methods", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="test" class="box">Hello</div>
            <div id="wrapper">
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
            </div>
            <form id="form">
                <input type="text" name="username" value="testuser" />
                <input type="password" name="password" value="secret" />
            </form>
        `;
    });

    describe("content() method", () => {
        test("should get the text content", () => {
            const instance = $("#test");
            expect(instance.content()).toBe("Hello");
        });

        test("should return an empty string when AnJS instance is empty", () => {
            const instance = $(".non-existent"); 
            expect(instance.content()).toBe("");
        });
    });

    describe("text() method", () => {
        test("should get the text content", () => {
            const instance = $("#test");
            expect(instance.text()).toBe("Hello");
        });

        test("should set the text content", () => {
            const instance = $("#test");
            instance.text("Updated Text");
            expect(instance.text()).toBe("Updated Text");
        });

        test("should return an empty string when AnJS instance is empty", () => {
            const instance = $(".non-existent"); 
            expect(instance.text()).toBe("");
        });
    });

    describe("html() method", () => {
        test("should get the HTML content", () => {
            const instance = $("#wrapper");
            expect(instance.html()).toBe(`
                <span class="item">Item 1</span>
                <span class="item">Item 2</span>
            `);
        });

        test("should set the HTML content", () => {
            const instance = $("#wrapper");
            instance.html("<p>New Content</p>");
            expect(instance.html()).toBe("<p>New Content</p>");
        });

        test("should return an empty string when AnJS instance is empty", () => {
            const instance = $(".non-existent"); 
            expect(instance.html()).toBe("");
        });
    });

    describe("css() method", () => {
        test("should get a CSS style", () => {
            const instance = $("#test");
            instance.css("color", "red");
            expect(instance.css("color")).toBe("red");
        });

        test("should set a CSS style", () => {
            const instance = $("#test");
            instance.css("color", "blue");
            expect(instance.css("color")).toBe("blue");
        });

        test("should return an empty string when AnJS instance is empty", () => {
            const instance = $(".non-existent"); 
            expect(instance.css("color")).toBe("");
        });
    });

    describe("class() method", () => {
        test("should add a class", () => {
            const instance = $("#test");
            instance.class("new-class", true);
            expect(instance.has("new-class")).toBe(true);
        });

        test("should remove a class", () => {
            const instance = $("#test");
            instance.class("box", false);
            expect(instance.has("box")).toBe(false);
        });

        test("should toggle a class when add parameter is undefined", () => {
            const instance = $("#test");
            expect(instance.has("toggle-class")).toBe(false);
            instance.class("toggle-class");
            expect(instance.has("toggle-class")).toBe(true);
            instance.class("toggle-class");
            expect(instance.has("toggle-class")).toBe(false);
        });
    });

    describe("display() method", () => {
        test("should hide elements", () => {
            const instance = $("#test");
            instance.display(false);
            expect(instance.css("display")).toBe("none");
        });

        test("should show elements", () => {
            const instance = $("#test");
            instance.display(true);
            expect(["", "block"]).toContain(instance.css("display"));
        });
    });

    describe("remove() method", () => {
        test("should remove elements", () => {
            const instance = $("#test");
            instance.remove();
            expect(document.getElementById("test")).toBeNull();
        });
    });

    describe("empty() method", () => {
        test("should remove child elements", () => {
            const instance = $("#wrapper");
            instance.empty();
            expect(instance.html()).toBe("");
        });
    });

    describe("prop() method", () => {
        test("should get a property value", () => {
            const instance = $("#form input[name='username']");
            expect(instance.prop("value")).toBe("testuser");
        });

        test("should set a property value", () => {
            const instance = $("#form input[name='username']");
            instance.prop("value", "newuser");
            expect(instance.prop("value")).toBe("newuser");
        });
    });

    describe('val() method', () => {
        test('should get the value of an input element', () => {
            const instance = $("#form input[name='username']");
            expect(instance.val()).toBe("testuser");
        });

        test('should set the value of an input element', () => {
            const instance = $("#form input[name='username']");
            instance.val("newuser");
            expect(instance.val()).toBe("newuser");
        });
    });

    describe("has() method", () => {
        test("should check for class existence", () => {
            const instance = $("#test");
            expect(instance.has("box")).toBe(true);
        });

        test("should return false when no elements are selected", () => {
            const instance = $(".non-existent"); 
            expect(instance.has("box")).toBe(false); 
        });

        test("should return false when AnJS instance is empty", () => {
            const instance = $(".non-existent"); 
            expect(instance.has("some-class")).toBe(false); 
        });
    });

    describe("focus() method", () => {
        test("should focus on the element", () => {
            const instance = $("#form input[name='username']");
            instance.focus();
            expect(document.activeElement).toBe(instance[0]);
        });
    });

    describe("blur() method", () => {
        test("should remove focus from the element", () => {
            const instance = $("#form input[name='username']");
            instance.focus();
            expect(document.activeElement).toBe(instance[0]);
            instance.blur();
            expect(document.activeElement).not.toBe(instance[0]);
        });
    });

    describe("insert() method", () => {
        test('should default to "before" position', () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Inserted";
            $("#test").insert(newElement);
            const target = document.getElementById("test");
            expect(target.previousElementSibling?.textContent).toBe("Inserted");
        });

        test("should insert an element before", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Inserted";
            $("#test").insert(newElement, "before");
            const target = document.getElementById("test");
            expect(target.previousElementSibling?.textContent).toBe("Inserted");
        });

        test("should insert an element after", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Inserted After";
            $("#test").insert(newElement, "after");
            const target = document.getElementById("test");
            expect(target.nextElementSibling?.textContent).toBe("Inserted After");
        });

        test("should insert an element as the first child (prepend)", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Inserted First";
            $("#wrapper").insert(newElement, "prepend");
            const wrapper = document.getElementById("wrapper");
            expect(wrapper.firstChild.textContent.trim()).toBe("Inserted First");
        });

        test("should insert an element as the last child (append)", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Inserted Last";
            $("#wrapper").insert(newElement, "append");
            const wrapper = document.getElementById("wrapper");
            expect(wrapper.lastChild.textContent.trim()).toBe("Inserted Last");
        });

        test("should insert multiple elements", () => {
            const firstElement = document.createElement("p");
            const secondElement = document.createElement("p");
            firstElement.textContent = "First";
            secondElement.textContent = "Second";

            $("#test").insert([firstElement, secondElement], "before");

            const target = document.getElementById("test");
            expect(target.previousElementSibling?.textContent).toBe("Second");
            expect(target.previousElementSibling?.previousElementSibling?.textContent).toBe("First");
        });

        test("should insert an HTML string before", () => {
            $("#test").insert("<p>Inserted HTML</p>", "before");
            const target = document.getElementById("test");
            expect(target.previousElementSibling?.textContent).toBe("Inserted HTML");
        });

        test("should insert an HTML string after", () => {
            $("#test").insert("<p>Inserted HTML After</p>", "after");
            const target = document.getElementById("test");
            expect(target.nextElementSibling?.textContent).toBe("Inserted HTML After");
        });

        test("should insert an HTML string inside an empty container (prepend)", () => {
            document.body.innerHTML += `<div id="empty"></div>`;
            $("#empty").insert("<p>Inserted Inside</p>", "prepend");
            const target = document.getElementById("empty");
            expect(target.firstChild.textContent).toBe("Inserted Inside");
        });

        test("should do nothing if position is invalid", () => {
            const originalHTML = document.body.innerHTML;
            const newElement = document.createElement("p");
            newElement.textContent = "Should not be inserted";

            $("#test").insert(newElement, "invalid-position"); 
            expect(document.body.innerHTML).toBe(originalHTML);
        });

        test("should return the AnJS instance for chaining", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Chaining Test";
            const instance = $("#test").insert(newElement, "before");
            expect(instance.text()).toBe("Hello");
        });
    });
});