// Dependencies
import $ from '../src/index.js';

describe('Utility Functions', () => {

    test('trim should remove spaces from start and end', () => {
        expect($.trim('  hello world  ')).toBe('hello world');
        expect($.trim('\t  spaced out  \n')).toBe('spaced out');
    });

    test('json should parse valid JSON', () => {
        const jsonString = '{"key": "value"}';
        expect($.json(jsonString)).toEqual({ key: 'value' });

        const jsonArray = '[1, 2, 3]';
        expect($.json(jsonArray)).toEqual([1, 2, 3]);
    });

    test('json should return null for invalid JSON', () => {
        expect($.json('invalid')).toBeNull();
        expect($.json('{key: value}')).toBeNull();
    });

    test('range should check if a number is within range', () => {
        expect($.range(5, 1, 10)).toBe(true);
        expect($.range(11, 1, 10)).toBe(false);
        expect($.range(1, 1, 10)).toBe(true);
        expect($.range(10, 1, 10)).toBe(true);
        expect($.range(0, 1, 10)).toBe(false);
    });

    test('isFunction should check if a value is a function', () => {
        expect($.isFunction(() => { })).toBe(true);
        expect($.isFunction(function () { })).toBe(true);
        expect($.isFunction(async function () { })).toBe(true);
        expect($.isFunction(class { })).toBe(true);
        expect($.isFunction(null)).toBe(false);
        expect($.isFunction({})).toBe(false);
        expect($.isFunction(123)).toBe(false);
    });

    test('isObject should check if a value is an object', () => {
        expect($.isObject({})).toBe(true);
        expect($.isObject([])).toBe(true); // Arrays are objects
        expect($.isObject(null)).toBe(false);
        expect($.isObject(123)).toBe(false);
        expect($.isObject("string")).toBe(false);
        expect($.isObject(() => { })).toBe(false);
    });

    test('isString should check if a value is a string', () => {
        expect($.isString('hello')).toBe(true);
        expect($.isString('')).toBe(true);
        expect($.isString(123)).toBe(false);
        expect($.isString({})).toBe(false);
        expect($.isString([])).toBe(false);
        expect($.isString(null)).toBe(false);
    });

    test('isNumber should check if a value is a number', () => {
        expect($.isNumber(123)).toBe(true);
        expect($.isNumber(0)).toBe(true);
        expect($.isNumber(-123)).toBe(true);
        expect($.isNumber(NaN)).toBe(false);
        expect($.isNumber('123')).toBe(false);
        expect($.isNumber(null)).toBe(false);
        expect($.isNumber({})).toBe(false);
    });

    test('contains should check if an element is contained within another', () => {
        document.body.innerHTML = `
            <div id="parent">
                <div id="child"></div>
            </div>
        `;
        const parent = document.getElementById("parent");
        const child = document.getElementById("child");
        const unrelated = document.createElement("div");

        expect($.contains(parent, child)).toBe(true);
        expect($.contains(child, parent)).toBe(false);
        expect($.contains(parent, unrelated)).toBe(false);
    });
});


describe('Debounce & Throttle', () => {
    test('debounce should delay function execution', (done) => {
        jest.useFakeTimers();
        const mockFn = jest.fn();
        const debouncedFn = $.debounce(mockFn, 200);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        expect(mockFn).not.toBeCalled();

        jest.advanceTimersByTime(200);
        expect(mockFn).toBeCalledTimes(1);

        jest.useRealTimers();
        done();
    });

    test('throttle should limit function execution rate', () => {
        jest.useFakeTimers();
        const mockFn = jest.fn();
        const throttledFn = $.throttle(mockFn, 200);

        throttledFn();
        throttledFn();
        throttledFn();

        expect(mockFn).toBeCalledTimes(1);

        jest.advanceTimersByTime(200);
        throttledFn();

        expect(mockFn).toBeCalledTimes(2);

        jest.useRealTimers();
    });
});

describe('createElement', () => {
    test('should create an element with attributes and children', () => {
        const el = $.element("div", { class: "test", id: "created" }, ["Hello"]);

        expect(el.tagName).toBe("DIV");
        expect(el.className).toBe("test");
        expect(el.id).toBe("created");
        expect(el.textContent).toBe("Hello");
    });

    test('should support multiple child elements', () => {
        const span1 = document.createElement("span");
        span1.textContent = "Span 1";

        const span2 = document.createElement("span");
        span2.textContent = "Span 2";

        const el = $.element("div", {}, [span1, "Text", span2]);

        expect(el.children.length).toBe(2);
        expect(el.children[0].textContent).toBe("Span 1");
        expect(el.children[1].textContent).toBe("Span 2");
        expect(el.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
    });


    test('should create an element with no attributes and no children', () => {
        const el = $.element("div");
        expect(el.tagName).toBe("DIV");
        expect(el.hasAttributes()).toBe(false);
        expect(el.childNodes.length).toBe(0);
    });

    test('should create an element with attributes but no children', () => {
        const el = $.element("div", { id: "test", "data-value": "123" });
        expect(el.id).toBe("test");
        expect(el.getAttribute("data-value")).toBe("123");
        expect(el.childNodes.length).toBe(0);
    });

    test('should create an element with children that are text nodes', () => {
        const el = $.element("div", {}, ["Hello", " World"]);
        expect(el.childNodes.length).toBe(2);
        expect(el.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
        expect(el.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
        expect(el.textContent).toBe("Hello World");
    });

    test('should create an element with children that are both nodes and text', () => {
        const span = document.createElement("span");
        span.textContent = "Inside Span";

        const el = $.element("div", {}, [span, "Text Node"]);
        expect(el.childNodes.length).toBe(2);
        expect(el.childNodes[0]).toBe(span);
        expect(el.childNodes[1].nodeType).toBe(Node.TEXT_NODE);
    });
});