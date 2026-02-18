// AlmostNo.js — Type Declarations (v1.3.0)

// ---------------------------------------------------------------------------
// Template Parts
// ---------------------------------------------------------------------------

/** Result of the html tagged template literal */
export declare class TemplateResult {
    constructor(strings: TemplateStringsArray, values: any[]);
    readonly strings: TemplateStringsArray;
    readonly values: any[];
}

/** Wraps a raw HTML string for DOM insertion inside html`...` templates */
export declare class UnsafeHTML {
    constructor(value: string);
    readonly value: string;
}

/** Tagged template literal — returns a TemplateResult for use with render() */
export declare function html(strings: TemplateStringsArray, ...values: any[]): TemplateResult;

/** Mark a string as trusted HTML for DOM insertion (bypasses text-node escaping) */
export declare function unsafeHTML(value: string): UnsafeHTML;

/** Render a TemplateResult into a container element (alias: renderTemplate) */
export declare function render(result: TemplateResult, container: HTMLElement): void;
export { render as renderTemplate };

/** Clear cached template data for a container */
export declare function clearTemplate(container: HTMLElement): void;

// ---------------------------------------------------------------------------
// DOM Morphing
// ---------------------------------------------------------------------------

/** Morph existing DOM to match new HTML string (preserves focus, listeners, input state) */
export declare function morph(target: HTMLElement, newHTML: string): void;

// ---------------------------------------------------------------------------
// Reactive State
// ---------------------------------------------------------------------------

/** Reactive state proxy returned by $.state(), element.state, etc. */
export interface ReactiveState {
    [key: string]: any;
    /** Subscribe to changes on a specific property */
    onChange(property: string, handler: (value: any, property: string) => void): () => void;
    /** Subscribe to changes on any property */
    onAny(handler: (value: any, property: string) => void): () => void;
    /** Batch-apply multiple property changes */
    patch(changes: Record<string, any>): void;
}

// ---------------------------------------------------------------------------
// Custom Elements
// ---------------------------------------------------------------------------

/** Register a custom element (idempotent — safe to call multiple times) */
export declare function registerComponent(name: string, componentClass: typeof HTMLElement): void;

/** Keyed list helper — produces keyed TemplateResults for efficient DOM reconciliation */
export declare function repeat<T>(
    items: Iterable<T>,
    keyFn: (item: T, index: number) => string | number,
    templateFn: (item: T, index: number) => TemplateResult
): TemplateResult[];

/** Base class for AnJS custom elements with reactive state and batched rendering */
export declare class AnJSElement extends HTMLElement {
    static observedAttributes: string[];

    /** Render scheduling strategy — 'microtask' (default) or 'raf' for frame-coalesced updates */
    static readonly updateStrategy: 'microtask' | 'raf';

    /** Reactive state proxy — property writes trigger batched updates */
    state: ReactiveState;

    /** Whether a microtask update is pending */
    _updatePending: boolean;

    /** Whether the element has been initialized (first render complete) */
    _initialized: boolean;

    /** Array of disposer functions called on disconnect */
    _disposers: Array<() => void>;

    /** Promise that resolves after the current render cycle completes */
    updateComplete: Promise<void>;

    /** Define a computed property that auto-recalculates when dependencies change */
    computed(name: string, deps: string[], fn: (state: ReactiveState) => any): void;

    /** Render method — return a TemplateResult (from html``) or an HTML string */
    render(): TemplateResult | string;

    /** Trigger a synchronous DOM update */
    update(): void;

    /** Register a disposer function to be called on disconnect. Returns the function for chaining. */
    own<T extends () => void>(disposer: T): T;

    /** Lifecycle hook — called once after first render */
    init(): void;

    /** Lifecycle hook — called after every render (including first) */
    updated(): void;

    /** Lifecycle hook — called on disconnect before auto-cleanup runs */
    destroy(): void;
}

// ---------------------------------------------------------------------------
// Core — AnJS Collection
// ---------------------------------------------------------------------------

export declare class AnJS extends Array<HTMLElement> {
    constructor(query: string | HTMLElement | NodeList | HTMLElement[]);

    // -- Iteration --
    each(fn: (el: HTMLElement, index: number) => void): AnJS;
    get(index?: number): HTMLElement | HTMLElement[];
    clone(deep?: boolean): HTMLElement | null;

    // -- DOM Manipulation --
    content(value?: string, asHTML?: boolean): string | AnJS;
    text(value?: string): string | AnJS;
    html(value?: string): string | AnJS;
    css(name: string, value?: string): string | AnJS;
    class(name: string, add?: boolean): AnJS;
    display(show?: boolean): AnJS;
    hide(): AnJS;
    show(): AnJS;
    remove(): AnJS;
    empty(): AnJS;
    insert(content: string | HTMLElement | HTMLElement[], position?: string): AnJS;
    append(content: string | HTMLElement): AnJS;
    prepend(content: string | HTMLElement): AnJS;
    before(content: string | HTMLElement): AnJS;
    after(content: string | HTMLElement): AnJS;
    prop(name: string, value?: any): any | AnJS;
    val(value?: string): string | AnJS;
    has(className: string): boolean;
    focus(): AnJS;
    blur(): AnJS;

    // -- Attributes --
    id(value?: string): string | AnJS;
    attr(name: string, value?: string): string | AnJS;
    removeAttr(name: string): AnJS;
    serialize(): string;

    // -- Events --
    on(event: string, selectorOrHandler: string | ((event: Event) => void), handler?: (event: Event) => void): AnJS;
    off(event: string, selectorOrHandler: string | ((event: Event) => void), handler?: (event: Event) => void): AnJS;
    delegate(event: string, selector: string, handler: (event: Event) => void): AnJS;
    undelegate(event: string, selector: string, handler: (event: Event) => void): AnJS;
    trigger(event: string): AnJS;

    // -- Traversal --
    next(): AnJS;
    prev(): AnJS;
    parent(): AnJS;
    children(): AnJS;
    siblings(): AnJS;
    closest(selector: string): AnJS;

    // -- Filtering --
    filter(callbackOrSelector: string | ((el: HTMLElement, index: number) => boolean)): AnJS;
    find(selector: string): AnJS;
    first(): AnJS;
    last(): AnJS;
    even(): AnJS;
    odd(): AnJS;

    // -- Animations --
    animate(styles: Record<string, string>, duration?: number, easing?: string): AnJS;
    fade(opacity?: number, duration?: number): AnJS;
    fadeIn(duration?: number): AnJS;
    fadeOut(duration?: number): AnJS;

    // -- State --
    state(initialState?: Record<string, any>, options?: { isGlobal?: boolean }): ReactiveState;
    bind(state: ReactiveState, context?: HTMLElement): void;
    autoEvents(state: ReactiveState, context?: HTMLElement): void;
    unbind(state: ReactiveState): void;

    // -- HTTP (instance) --
    request(url: string, method?: string, data?: any, options?: RequestOptions): Promise<any>;

    // -- Components --
    component(name: string, templateFn: Function, stateFn?: Function): void;
    render(state?: ReactiveState, context?: HTMLElement): void;

    // -- Event Aliases --
    click(callback?: (event: Event) => void): AnJS;
    change(callback?: (event: Event) => void): AnJS;
    submit(callback?: (event: Event) => void): AnJS;
    keydown(callback?: (event: Event) => void): AnJS;
    keyup(callback?: (event: Event) => void): AnJS;
    mouseover(callback?: (event: Event) => void): AnJS;
    mouseout(callback?: (event: Event) => void): AnJS;
}

// ---------------------------------------------------------------------------
// Request Options
// ---------------------------------------------------------------------------

export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
    [key: string]: any;
}

// ---------------------------------------------------------------------------
// Factory ($) and Static Methods
// ---------------------------------------------------------------------------

/** Factory function — select elements and return an AnJS collection */
declare function $(selector: string | HTMLElement | NodeList | HTMLElement[]): AnJS;

declare namespace $ {
    // -- Extension --
    function extend(name: string, func: Function, force?: boolean): void;

    // -- Event Bus --
    function emit(event: string, data?: any): void;
    function listen(event: string, handler: (data: any) => void): () => void;
    function forget(event: string, handler?: (data: any) => void): void;

    // -- HTTP --
    function head(url: string, options?: RequestOptions): Promise<any>;
    function get(url: string, options?: RequestOptions): Promise<any>;
    function options(url: string, options?: RequestOptions): Promise<any>;
    function post(url: string, data?: any, options?: RequestOptions): Promise<any>;
    function put(url: string, data?: any, options?: RequestOptions): Promise<any>;
    function patch(url: string, data?: any, options?: RequestOptions): Promise<any>;

    /** Note: delete is a reserved word; call as $.delete() */
    function _delete(url: string, options?: RequestOptions): Promise<any>;
    export { _delete as delete };

    function abortController(): AbortController;

    // -- State --
    function state(initialState?: Record<string, any>): ReactiveState;
    function global(name: string, initial?: Record<string, any>): ReactiveState;
    function hasGlobal(name: string): boolean;
    function clearGlobal(name: string): void;

    // -- Components --
    function component(name: string, templateFn: Function, stateFn?: Function): void;

    // -- Events (static) --
    function on(event: string, selectorOrHandler: string | Function, handler?: Function): AnJS;
    function off(event: string, selectorOrHandler: string | Function, handler?: Function): AnJS;
    function trigger(event: string): AnJS;

    // -- Utilities --
    function json(string: string): any | null;
    function trim(string: string): string;
    function range(x: number, min: number, max: number): boolean;
    function isFunction(value: any): value is Function;
    function isObject(value: any): value is Record<string, any>;
    function isString(value: any): value is string;
    function isNumber(value: any): value is number;
    function contains(parent: HTMLElement, child: HTMLElement): boolean;
    function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T;
    function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T;
    function element(tag: string, attrs?: Record<string, any>, children?: (string | HTMLElement)[]): HTMLElement;
}

export default $;
