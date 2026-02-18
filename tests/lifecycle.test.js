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
    global.requestAnimationFrame = (fn) => setTimeout(fn, 0);
});

// Helper: flush microtask queue
const flush = () => new Promise(resolve => queueMicrotask(resolve));

// Helper: flush rAF queue (setTimeout-based in JSDOM)
const flushRaf = () => new Promise(resolve => setTimeout(resolve, 20));

// Import utilities and base class
import { html, repeat, registerComponent, AnJSElement } from "../src/element.js";
import { TemplateResult } from "../src/template.js";
import $ from "../src/index.js";

// ═══════════════════════════════════════════════════════════
// 1. $.listen() returns unsubscribe function
// ═══════════════════════════════════════════════════════════

describe("$.listen() Unsubscribe", () => {

    test("should return a function", () => {

        const unsub = $.listen("test-unsub-type", () => {});
        expect(typeof unsub).toBe("function");
        unsub();
    });

    test("returned function should remove the listener", () => {

        const handler = jest.fn();
        const unsub = $.listen("test-unsub-remove", handler);

        // Should fire before unsubscribe
        $.emit("test-unsub-remove", "a");
        expect(handler).toHaveBeenCalledTimes(1);

        // Unsubscribe
        unsub();

        // Should no longer fire
        $.emit("test-unsub-remove", "b");
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test("double-unsubscribe should not throw", () => {

        const unsub = $.listen("test-unsub-double", () => {});
        unsub();
        expect(() => unsub()).not.toThrow();
    });

    test("should only remove the specific handler", () => {

        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const unsub1 = $.listen("test-unsub-specific", handler1);
        $.listen("test-unsub-specific", handler2);

        unsub1();
        $.emit("test-unsub-specific", "data");

        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalledWith("data");
    });
});

// ═══════════════════════════════════════════════════════════
// 2. Lifecycle Hooks: init(), updated(), destroy()
// ═══════════════════════════════════════════════════════════

describe("Lifecycle Hooks", () => {

    let initCount, updateCount, destroyCount;

    class LifecycleComponent extends AnJSElement {

        init() { initCount++; }
        updated() { updateCount++; }
        destroy() { destroyCount++; }

        render() {
            return `<span>${this.state.value || "default"}</span>`;
        }
    }

    beforeAll(() => {
        registerComponent("lifecycle-component", LifecycleComponent);
    });

    beforeEach(() => {
        document.body.innerHTML = "";
        initCount = 0;
        updateCount = 0;
        destroyCount = 0;
    });

    test("init() should be called once after first render", () => {

        document.body.innerHTML = `<lifecycle-component></lifecycle-component>`;
        expect(initCount).toBe(1);
        expect(updateCount).toBe(1);
    });

    test("init() should NOT be called on subsequent renders", async () => {

        document.body.innerHTML = `<lifecycle-component></lifecycle-component>`;
        const el = document.querySelector("lifecycle-component");

        el.state.value = "changed";
        await flush();

        expect(initCount).toBe(1);
        expect(updateCount).toBe(2);
    });

    test("updated() should be called after every render", async () => {

        document.body.innerHTML = `<lifecycle-component></lifecycle-component>`;
        const el = document.querySelector("lifecycle-component");

        el.state.value = "a";
        await flush();
        el.state.value = "b";
        await flush();

        // connectedCallback + 2 state changes = 3 updates
        expect(updateCount).toBe(3);
    });

    test("destroy() should be called on disconnectedCallback", () => {

        document.body.innerHTML = `<lifecycle-component></lifecycle-component>`;
        const el = document.querySelector("lifecycle-component");

        el.remove();
        expect(destroyCount).toBe(1);
    });

    test("destroy() should be called before disposers run", () => {

        document.body.innerHTML = `<lifecycle-component></lifecycle-component>`;
        const el = document.querySelector("lifecycle-component");

        const order = [];
        // Override destroy to track order
        el.destroy = () => order.push("destroy");
        el.own(() => order.push("disposer"));

        el.remove();
        expect(order).toEqual(["destroy", "disposer"]);
    });
});

// ═══════════════════════════════════════════════════════════
// 3. Auto-Cleanup: this.own()
// ═══════════════════════════════════════════════════════════

describe("Auto-Cleanup (this.own())", () => {

    class CleanupComponent extends AnJSElement {
        render() {
            return `<div>cleanup test</div>`;
        }
    }

    beforeAll(() => {
        registerComponent("cleanup-component", CleanupComponent);
    });

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("own() should accept a function and return it", () => {

        document.body.innerHTML = `<cleanup-component></cleanup-component>`;
        const el = document.querySelector("cleanup-component");
        const fn = jest.fn();

        const returned = el.own(fn);
        expect(returned).toBe(fn);
    });

    test("disposers should be called on disconnect", () => {

        document.body.innerHTML = `<cleanup-component></cleanup-component>`;
        const el = document.querySelector("cleanup-component");

        const d1 = jest.fn();
        const d2 = jest.fn();
        el.own(d1);
        el.own(d2);

        el.remove();
        expect(d1).toHaveBeenCalledTimes(1);
        expect(d2).toHaveBeenCalledTimes(1);
    });

    test("disposers array should be cleared after disconnect", () => {

        document.body.innerHTML = `<cleanup-component></cleanup-component>`;
        const el = document.querySelector("cleanup-component");

        el.own(jest.fn());
        el.remove();

        expect(el._disposers.length).toBe(0);
    });

    test("should integrate with $.listen() unsubscribe", () => {

        document.body.innerHTML = `<cleanup-component></cleanup-component>`;
        const el = document.querySelector("cleanup-component");
        const handler = jest.fn();

        el.own($.listen("cleanup-event", handler));

        // Event should fire while connected
        $.emit("cleanup-event", "before");
        expect(handler).toHaveBeenCalledTimes(1);

        // Disconnect — auto-cleanup runs
        el.remove();

        // Event should NOT fire after disconnect
        $.emit("cleanup-event", "after");
        expect(handler).toHaveBeenCalledTimes(1);
    });
});

// ═══════════════════════════════════════════════════════════
// 4. updateComplete Promise
// ═══════════════════════════════════════════════════════════

describe("updateComplete Promise", () => {

    class UpdatePromiseComponent extends AnJSElement {
        render() {
            return `<span>${this.state.text || "initial"}</span>`;
        }
    }

    beforeAll(() => {
        registerComponent("update-promise-comp", UpdatePromiseComponent);
    });

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should have an updateComplete property that is a Promise", () => {

        document.body.innerHTML = `<update-promise-comp></update-promise-comp>`;
        const el = document.querySelector("update-promise-comp");

        expect(el.updateComplete).toBeInstanceOf(Promise);
    });

    test("updateComplete should resolve after update()", async () => {

        document.body.innerHTML = `<update-promise-comp></update-promise-comp>`;
        const el = document.querySelector("update-promise-comp");

        el.state.text = "updated";
        await el.updateComplete;

        expect(el.querySelector("span").textContent).toBe("updated");
    });

    test("updateComplete should renew each cycle", async () => {

        document.body.innerHTML = `<update-promise-comp></update-promise-comp>`;
        const el = document.querySelector("update-promise-comp");

        const p1 = el.updateComplete;
        el.state.text = "a";
        await p1;

        const p2 = el.updateComplete;
        expect(p2).not.toBe(p1);

        el.state.text = "b";
        await p2;

        expect(el.querySelector("span").textContent).toBe("b");
    });
});

// ═══════════════════════════════════════════════════════════
// 5. Render Throttle Strategy (updateStrategy)
// ═══════════════════════════════════════════════════════════

describe("updateStrategy", () => {

    class MicrotaskComponent extends AnJSElement {
        render() {
            return `<span>${this.state.count || 0}</span>`;
        }
    }

    class RafComponent extends AnJSElement {

        static get updateStrategy() { return 'raf'; }

        render() {
            return `<span>${this.state.count || 0}</span>`;
        }
    }

    beforeAll(() => {
        registerComponent("microtask-comp", MicrotaskComponent);
        registerComponent("raf-comp", RafComponent);
    });

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("default strategy should be microtask", () => {

        expect(AnJSElement.updateStrategy).toBe("microtask");
    });

    test("microtask component should update within microtask", async () => {

        document.body.innerHTML = `<microtask-comp></microtask-comp>`;
        const el = document.querySelector("microtask-comp");

        el.state.count = 42;
        await flush();

        expect(el.querySelector("span").textContent).toBe("42");
    });

    test("raf component should use requestAnimationFrame scheduling", async () => {

        document.body.innerHTML = `<raf-comp></raf-comp>`;
        const el = document.querySelector("raf-comp");

        el.state.count = 99;

        // Microtask should NOT have applied the update yet
        await flush();
        // The rAF hasn't fired yet (it's setTimeout-based in JSDOM)

        // Wait for rAF (setTimeout in test env)
        await flushRaf();

        expect(el.querySelector("span").textContent).toBe("99");
    });

    test("raf component should coalesce rapid updates", async () => {

        document.body.innerHTML = `<raf-comp></raf-comp>`;
        const el = document.querySelector("raf-comp");
        const renderSpy = jest.spyOn(el, "render");
        const baseCount = renderSpy.mock.calls.length;

        el.state.count = 1;
        el.state.count = 2;
        el.state.count = 3;

        await flushRaf();

        // Should coalesce to single render with final value
        expect(renderSpy.mock.calls.length - baseCount).toBe(1);
        expect(el.querySelector("span").textContent).toBe("3");
    });
});

// ═══════════════════════════════════════════════════════════
// 6. repeat() Keyed List Helper
// ═══════════════════════════════════════════════════════════

describe("repeat() Helper", () => {

    test("should return an array of TemplateResults", () => {

        const items = [{ id: 1, name: "a" }, { id: 2, name: "b" }];
        const result = repeat(items, i => i.id, (item) => html`<li>${item.name}</li>`);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0]).toBeInstanceOf(TemplateResult);
        expect(result[1]).toBeInstanceOf(TemplateResult);
    });

    test("should attach _key to each TemplateResult", () => {

        const items = [{ id: "x" }, { id: "y" }];
        const result = repeat(items, i => i.id, (item) => html`<span>${item.id}</span>`);

        expect(result[0]._key).toBe("x");
        expect(result[1]._key).toBe("y");
    });

    test("should pass item and index to templateFn", () => {

        const items = ["a", "b", "c"];
        const calls = [];
        repeat(items, (_, i) => i, (item, index) => {
            calls.push({ item, index });
            return html`<span>${item}</span>`;
        });

        expect(calls).toEqual([
            { item: "a", index: 0 },
            { item: "b", index: 1 },
            { item: "c", index: 2 },
        ]);
    });

    test("should handle empty arrays", () => {

        const result = repeat([], i => i, () => html`<span></span>`);
        expect(result).toEqual([]);
    });

    test("should work with Sets", () => {

        const items = new Set(["x", "y", "z"]);
        const result = repeat(items, i => i, (item) => html`<span>${item}</span>`);

        expect(result.length).toBe(3);
        expect(result[0]._key).toBe("x");
    });

    test("should render correctly inside html template", () => {

        class RepeatComponent extends AnJSElement {
            render() {
                const items = this.state.items || [];
                return html`<ul>${repeat(items, i => i.id, (item) => html`<li>${item.name}</li>`)}</ul>`;
            }
        }

        registerComponent("repeat-comp", RepeatComponent);
        document.body.innerHTML = `<repeat-comp></repeat-comp>`;
        const el = document.querySelector("repeat-comp");

        el.state.items = [{ id: 1, name: "first" }, { id: 2, name: "second" }];
        el.update();

        const lis = el.querySelectorAll("li");
        expect(lis.length).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════════
// Integration: Combined Features
// ═══════════════════════════════════════════════════════════

describe("Integration", () => {

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("own() + $.listen() + destroy: full lifecycle", () => {

        class IntegrationComp extends AnJSElement {
            init() {
                this.own($.listen("int-event", (data) => {
                    this.state.received = data;
                }));
            }

            render() {
                return `<span>${this.state.received || "none"}</span>`;
            }
        }

        registerComponent("integration-comp", IntegrationComp);
        document.body.innerHTML = `<integration-comp></integration-comp>`;
        const el = document.querySelector("integration-comp");

        // Event should work
        $.emit("int-event", "hello");
        el.update();
        expect(el.querySelector("span").textContent).toBe("hello");

        // Disconnect — auto-cleanup
        el.remove();

        // Event should no longer fire
        $.emit("int-event", "world");
        expect(el.state.received).toBe("hello");
    });

    test("updateComplete + state change: post-render work", async () => {

        class PostRenderComp extends AnJSElement {
            render() {
                return `<input type="text" value="${this.state.val || ""}" />`;
            }
        }

        registerComponent("post-render-comp", PostRenderComp);
        document.body.innerHTML = `<post-render-comp></post-render-comp>`;
        const el = document.querySelector("post-render-comp");

        el.state.val = "focused";
        await el.updateComplete;

        // DOM should be updated by now
        expect(el.querySelector("input")).toBeTruthy();
    });
});
