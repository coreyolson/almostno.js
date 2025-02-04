declare class AnJS extends Array<HTMLElement> {
    constructor(query: string | HTMLElement | NodeList | HTMLElement[]);
    each(fn: (el: HTMLElement, index: number) => void): AnJS;
    get(index?: number): HTMLElement | HTMLElement[];
    clone(deep?: boolean): HTMLElement | null;
    content(value?: string, html?: boolean): string | AnJS;
    text(value?: string): string | AnJS;
    html(value?: string): string | AnJS;
    css(name: string, value?: string): string | AnJS;
    class(name: string, add?: boolean): AnJS;
    display(show: boolean): AnJS;
    remove(): AnJS;
    empty(): AnJS;
    insert(content: string | HTMLElement | HTMLElement[], position?: string): AnJS;
    prop(name: string, value?: any): any | AnJS;
    has(className: string): boolean;
    focus(): AnJS;
    blur(): AnJS;
    next(): AnJS;
    prev(): AnJS;
    parent(): AnJS;
    children(): AnJS;
    siblings(): AnJS;
    closest(selector: string): AnJS;
    id(value?: string): string | AnJS;
    attr(name: string, value?: string): string | AnJS;
    removeAttr(name: string): AnJS;
    serialize(): string;
    on(event: string, selector: string | ((event: Event) => void), handler?: (event: Event) => void): AnJS;
    off(event: string, selector: string | ((event: Event) => void), handler?: (event: Event) => void): AnJS;
    trigger(event: string): AnJS;
    query(selector: string): AnJS;
    first(): AnJS;
    last(): AnJS;
    even(): AnJS;
    odd(): AnJS;
    animate(styles: object, duration?: number, easing?: string): AnJS;
    fade(opacity?: number, duration?: number): AnJS;
    fadeIn(duration?: number): AnJS;
    fadeOut(duration?: number): AnJS;
    state(initialState?: object): object;
    bind(state: object, context?: HTMLElement): void;
    unbind(state: object): void;
    request(url: string, method?: string, data?: any, options?: object): Promise<any>;
}

declare function $(selector: string | HTMLElement | NodeList | HTMLElement[]): AnJS;

export default $;