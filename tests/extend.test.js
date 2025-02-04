// Dependencies
import $ from '../src/index.js';
import AnJS from '../src/core.js';

describe("AnJS Core - $.extend Method", () => {
    beforeEach(() => {
        delete AnJS.prototype.testMethod;
        delete AnJS.prototype.method1;
        delete AnJS.prototype.method2;
    });

    test("should add a new method if it does not exist", () => {
        $.extend("testMethod", function () {
            return "success";
        });

        expect(typeof AnJS.prototype.testMethod).toBe("function");
        expect(new AnJS("").testMethod()).toBe("success");
    });

    test("should NOT overwrite an existing method if force is false", () => {
        AnJS.prototype.testMethod = () => "original";
        $.extend("testMethod", () => "new");
        expect(new AnJS("").testMethod()).toBe("original");
    });

    test("should overwrite an existing method if force is true", () => {
        AnJS.prototype.testMethod = () => "original";
        $.extend("testMethod", () => "forced", true);
        expect(new AnJS("").testMethod()).toBe("forced");
    });

    test("should add multiple methods when passing an object", () => {
        $.extend({
            method1: () => "one",
            method2: () => "two"
        });

        expect(typeof AnJS.prototype.method1).toBe("function");
        expect(typeof AnJS.prototype.method2).toBe("function");
        expect(new AnJS("").method1()).toBe("one");
        expect(new AnJS("").method2()).toBe("two");
    });

    test("should NOT overwrite existing methods when passing an object unless forced", () => {
        AnJS.prototype.method1 = () => "original";

        $.extend({
            method1: () => "new",
            method2: () => "two"
        });

        expect(new AnJS("").method1()).toBe("original");
        expect(new AnJS("").method2()).toBe("two");
    });

    test("should overwrite existing methods when passing an object with force", () => {
        AnJS.prototype.method1 = () => "original";

        $.extend(
            {
                method1: () => "forced",
                method2: () => "two"
            },
            true
        );

        expect(new AnJS("").method1()).toBe("forced");
        expect(new AnJS("").method2()).toBe("two");
    });
});