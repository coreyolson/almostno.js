import { JSDOM } from "jsdom";

// Import AnJS after setting up JSDOM
let dom;
beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html>
        <body>
            <form id="form">
                <input type="text" name="username" value="testuser" />
                <input type="password" name="password" value="secret" />
            </form>
            <div id="div" data-original="value"></div>
        </body>`);

    // Attach JSDOM to global scope **before importing AnJS**
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.NodeList = dom.window.NodeList;
});

// Import AnJS after setting up JSDOM
import $ from "../src/index.js";

describe("AnJS Attributes Methods", () => {

    beforeEach(() => {
        // Ensure a fresh DOM for each test
        document.body.innerHTML = `
            <form id="form">
                <input type="text" name="username" value="testuser" />
                <input type="password" name="password" value="secret" />
            </form>
            <div id="div" data-original="value"></div>
        `;
    });

    test("id() should get an element's ID", () => {
        const element = document.getElementById("div");
        element.id = "test-id";
        const instance = $(element);
        expect(instance.id()).toBe("test-id");
    });

    test("id() should set an element's ID", () => {
        const element = document.getElementById("div");
        const instance = $(element);
        instance.id("new-id");
        expect(element.id).toBe("new-id");
    });

    test("attr() should get an attribute", () => {
        const element = document.getElementById("div");
        const instance = $(element);
        expect(instance.attr("data-original")).toBe("value");
    });

    test("attr() should set an attribute", () => {
        const element = document.getElementById("div");
        const instance = $(element);
        instance.attr("data-original", "newvalue");
        expect(element.getAttribute("data-original")).toBe("newvalue");
    });

    test("removeAttr() should remove an attribute", () => {
        const element = document.getElementById("div");
        element.setAttribute("data-remove", "toremove");
        const instance = $(element);
        instance.removeAttr("data-remove");
        expect(element.hasAttribute("data-remove")).toBe(false);
    });

    describe("serialize() method", () => {

        test("should return URL-encoded form data", () => {
            const form = document.getElementById("form");
            const instance = $(form);
            const serialized = instance.serialize();
            const expected1 = "username=testuser&password=secret";
            const expected2 = "password=secret&username=testuser";
            expect([expected1, expected2]).toContain(serialized);
        });

        test("should return an empty string when form is empty", () => {
            document.body.innerHTML = `<form id="empty-form"></form>`;
            const instance = $("#empty-form");
            expect(instance.serialize()).toBe("");
        });

        test("should return an empty string when called on a non-form element", () => {
            const instance = $("#div");
            expect(instance.serialize()).toBe("");
        });

        test("should handle checkboxes (only checked ones included)", () => {
            document.body.innerHTML = `
            <form id="checkbox-form">
                <input type="checkbox" name="option1" value="yes" checked>
                <input type="checkbox" name="option2" value="no">
            </form>`;
            const instance = $("#checkbox-form");
            expect(instance.serialize()).toBe("option1=yes");
        });

        test("should handle radio buttons (only selected one included)", () => {
            document.body.innerHTML = `
            <form id="radio-form">
                <input type="radio" name="choice" value="a">
                <input type="radio" name="choice" value="b" checked>
            </form>`;
            const instance = $("#radio-form");
            expect(instance.serialize()).toBe("choice=b");
        });

        test("should handle select elements (single selection)", () => {
            document.body.innerHTML = `
            <form id="select-form">
                <select name="dropdown">
                    <option value="1">One</option>
                    <option value="2" selected>Two</option>
                </select>
            </form>`;
            const instance = $("#select-form");
            expect(instance.serialize()).toBe("dropdown=2");
        });

        test("should handle select elements (multiple selection)", () => {
            document.body.innerHTML = `
            <form id="multi-select-form">
                <select name="options" multiple>
                    <option value="a" selected>A</option>
                    <option value="b">B</option>
                    <option value="c" selected>C</option>
                </select>
            </form>`;
            const instance = $("#multi-select-form");
            expect(instance.serialize()).toBe("options=a&options=c");
        });

        test("should ignore disabled inputs", () => {
            document.body.innerHTML = `
            <form id="disabled-form">
                <input type="text" name="username" value="user1" disabled>
                <input type="password" name="password" value="pass1">
            </form>`;
            const instance = $("#disabled-form");
            expect(instance.serialize()).toBe("password=pass1");
        });

    });
});