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
                <button type="submit">Submit</button>
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

describe("AnJS Alias Methods", () => {
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
                <button type="submit">Submit</button>
            </form>
        `;
    });

    describe("append() method", () => {
        test("should append an element", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Appended";
            $("#wrapper").append(newElement);
            const wrapper = document.getElementById("wrapper");
            expect(wrapper.lastChild.textContent).toBe("Appended");
        });

        test("should append an HTML string", () => {
            $("#wrapper").append("<p>Appended HTML</p>");
            const wrapper = document.getElementById("wrapper");
            expect(wrapper.lastChild.textContent).toBe("Appended HTML");
        });
    });

    describe("prepend() method", () => {
        test("should prepend an element", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Prepended";
            $("#wrapper").prepend(newElement);
            const wrapper = document.getElementById("wrapper");
            expect(wrapper.firstChild.textContent).toBe("Prepended");
        });

        test("should prepend an HTML string", () => {
            $("#wrapper").prepend("<p>Prepended HTML</p>");
            const wrapper = document.getElementById("wrapper");
            expect(wrapper.firstChild.textContent).toBe("Prepended HTML");
        });
    });

    describe("before() method", () => {
        test("should insert an element before the target", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "Before Test";
            $("#test").before(newElement);
            const target = document.getElementById("test");
            expect(target.previousElementSibling.textContent).toBe("Before Test");
        });

        test("should insert an HTML string before the target", () => {
            $("#test").before("<p>Before HTML</p>");
            const target = document.getElementById("test");
            expect(target.previousElementSibling.textContent).toBe("Before HTML");
        });
    });

    describe("after() method", () => {
        test("should insert an element after the target", () => {
            const newElement = document.createElement("p");
            newElement.textContent = "After Test";
            $("#test").after(newElement);
            const target = document.getElementById("test");
            expect(target.nextElementSibling.textContent).toBe("After Test");
        });

        test("should insert an HTML string after the target", () => {
            $("#test").after("<p>After HTML</p>");
            const target = document.getElementById("test");
            expect(target.nextElementSibling.textContent).toBe("After HTML");
        });
    });

    describe("Event Alias Methods", () => {
        test("should trigger a click event", () => {
            const mockFn = jest.fn();
            $("#test").click(mockFn).click();
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("should trigger a change event", () => {
            const mockFn = jest.fn();
            $("#form input[name='username']").change(mockFn).trigger("change");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("should trigger a submit event", () => {
            const mockFn = jest.fn((e) => e.preventDefault());
            $("#form").submit(mockFn).trigger("submit");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("should trigger a keydown event", () => {
            const mockFn = jest.fn();
            $("#form input[name='username']").keydown(mockFn).trigger("keydown");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("should trigger a keyup event", () => {
            const mockFn = jest.fn();
            $("#form input[name='username']").keyup(mockFn).trigger("keyup");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("should trigger a mouseover event", () => {
            const mockFn = jest.fn();
            $("#test").mouseover(mockFn).trigger("mouseover");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("should trigger a mouseout event", () => {
            const mockFn = jest.fn();
            $("#test").mouseout(mockFn).trigger("mouseout");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });
    });

    describe("hide() method", () => {
        test("should hide the element", () => {
            $("#test").hide();
            expect($("#test").css("display")).toBe("none");
        });
    });

    describe("show() method", () => {
        test("should show the element", () => {
            $("#test").hide().show();
            expect($("#test").css("display")).not.toBe("none");
        });
    });
});