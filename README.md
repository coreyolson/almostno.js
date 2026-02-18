# AlmostNo.js

![Version](https://img.shields.io/github/v/tag/coreyolson/almostno.js?label=version)
![License](https://img.shields.io/github/license/coreyolson/almostno.js)
![Minified + Gzip](https://img.shields.io/bundlephobia/minzip/almostnojs)
![Flexible & Easy to Learn](https://img.shields.io/badge/flexible-Easy%20to%20Learn-gold)

AlmostNo.js is a **lightweight**, **zero-dependency** JavaScript framework featuring tagged template rendering, DOM morphing, custom elements, reactive state management, chainable DOM manipulation, event handling, animations, and HTTP requests.

## Features

- **Tagged Template Rendering** – Lit-style `html` tagged templates with surgical DOM updates.
- **DOM Morphing** – Reconcile live DOM against new HTML without destroying state.
- **Custom Elements** – Reactive `AnJSElement` base class with batched updates and computed properties.
- **Tiny & Fast** – 5 KB core, 6 KB extended, 12 KB full (minified + gzipped). Zero dependencies.
- **Chainable API** – Familiar `$().method()` syntax for clean, readable code.
- **DOM Manipulation** – Select, traverse, and modify elements effortlessly.
- **Events & Event Bus** – Attach, delegate, trigger events; cross-component communication.
- **Reactive State** – Proxy-based state with `onChange`, `onAny`, `patch`, and DOM bindings.
- **Components** – SSR-compatible server/client components with auto-mounting.
- **HTTP Requests** – Fetch wrappers with timeout handling and abort controllers.
- **Animations** – Simple CSS-based transitions.
- **Utilities** – Debounce, throttle, type checks, JSON parsing, and more.

## Examples

See AlmostNo.js [Live Examples](https://coreyolson.github.io/almostno.js/) in action.

- [Animations](docs/animate.html)
- [Attributes](docs/attributes.html)
- [Components](docs/components.html)
- [Core Features](docs/core.html)
- [DOM Manipulation](docs/dom.html)
- [Elements](docs/elements.html)
- [Events](docs/events.html)
- [Filtering & Traversal](docs/filtering.html)
- [HTTP Requests](docs/request.html)
- [State Management](docs/state.html)
- [Utilities](docs/utilities.html)

## Browser Support

AlmostNo.js targets **ES2020** and works on all modern browsers (Chrome, Firefox, Edge, Safari, Opera).

## Installation

### NPM

```sh
npm install almostnojs
```

```js
import $, { html, render, morph, AnJSElement, registerComponent } from 'almostnojs';
```

### CDN

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/almostnojs@latest/dist/cdn/almostno.full.js"></script>

<!-- UNPKG -->
<script src="https://unpkg.com/almostnojs@latest/dist/cdn/almostno.full.js"></script>
```

### Self-hosting

Download the latest release from `dist/browser/` and include it directly:

```html
<script src="./almostno.full.js"></script>
```

## Choosing the Right Version

Three prebuilt bundles are available, plus NPM with tree-shaking.

### Feature Comparison

| Feature                    | Core | Extended | Full | NPM |
|----------------------------|------|----------|------|-----|
| **DOM Manipulation**       | ✅   | ✅       | ✅   | ✅  |
| **Events & Event Bus**     | ✅   | ✅       | ✅   | ✅  |
| **Attributes**             | ✅   | ✅       | ✅   | ✅  |
| **HTTP Requests**          | ✅   | ✅       | ✅   | ✅  |
| **Animations**             | ❌   | ✅       | ✅   | ✅  |
| **Filtering & Traversal**  | ❌   | ✅       | ✅   | ✅  |
| **State Management**       | ❌   | ❌       | ✅   | ✅  |
| **Components**             | ❌   | ❌       | ✅   | ✅  |
| **Template Parts**         | ❌   | ❌       | ❌   | ✅  |
| **DOM Morphing**           | ❌   | ❌       | ❌   | ✅  |
| **Custom Elements**        | ❌   | ❌       | ❌   | ✅  |

### Bundle Sizes (minified + gzipped)

| Version      | Size    | Path                                  |
|-------------|---------|---------------------------------------|
| **Core**    | ~5 KB   | `dist/browser/almostno.js`            |
| **Extended**| ~6 KB   | `dist/browser/almostno.extended.js`   |
| **Full**    | ~12 KB  | `dist/browser/almostno.full.js`       |

## Quick Start

### Template Parts (Tagged Templates)

Render reactive templates with surgical DOM updates — only changed values are patched.

```js
import { html, render } from 'almostnojs';

const app = document.getElementById('app');

function view(name) {
    render(html`<h1>Hello, ${name}!</h1>`, app);
}

view('World');  // First render: creates DOM
view('AnJS');   // Update: patches only the text node
```

#### Attributes

```js
render(html`<div class="card ${active ? 'active' : ''}">
    <button disabled=${!ready}>Submit</button>
</div>`, container);
```

#### Lists

```js
const items = ['Apple', 'Banana', 'Cherry'];
render(html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`, container);
```

#### Unsafe HTML

```js
import { html, unsafeHTML, render } from 'almostnojs';

render(html`<div>${unsafeHTML('<em>trusted markup</em>')}</div>`, container);
```

### DOM Morphing

Reconcile live DOM against new HTML without destroying state, focus, or event listeners.

```js
import { morph } from 'almostnojs';

morph(document.getElementById('app'), '<div class="updated">New content</div>');
```

### Custom Elements

Build reactive web components with `AnJSElement`.

```js
import { AnJSElement, html, registerComponent } from 'almostnojs';

class MyCounter extends AnJSElement {
    setup() {
        this.state.count = 0;
    }

    render() {
        return html`
            <button @click=${() => this.state.count++}>
                Clicked ${this.state.count} times
            </button>`;
    }
}

registerComponent('my-counter', MyCounter);
```

```html
<my-counter></my-counter>
```

Features: reactive state proxy, batched microtask updates, computed properties, `observedAttributes` reflection, `setup()` and `destroy()` lifecycle hooks.

### DOM Manipulation

```js
$('div').text('Hello, World!');
$('#box').css('color', 'red').class('highlight');
```

### Events

```js
$('#btn').on('click', () => alert('Clicked!'));
$.emit('app:ready', { ts: Date.now() });
$.listen('app:ready', data => console.log(data));
```

### State Management

```js
const state = $('#app').state({ count: 0 });
$('#increment').on('click', () => state.count++);
$('#display').bind(state);
```

```html
<div id="app">
    <span id="display" data-bind="count"></span>
    <button id="increment">+1</button>
</div>
```

### Components

```js
$.component("Card",
    ({ state, props }) => `
        <div class="card">
            <h3>${props.title}</h3>
            <p>Likes: <span data-bind-this="likes"></span></p>
            <button data-action="like">Like</button>
        </div>`,
    () => $.state({ likes: 0, like() { this.likes++ } })
);
```

```html
<Card title="Hello"></Card>
```

### HTTP Requests

```js
$.get('/api/data').then(console.log);
$.post('/api/submit', { name: 'Jane' });
$.get('/api/slow', { timeout: 3000 });
```

## API Reference

### Template Parts

| Function | Description |
|----------|-------------|
| `` html`...` `` | Tagged template literal — returns a `TemplateResult` |
| `render(result, container)` | Render a `TemplateResult` into a DOM element |
| `clearTemplate(container)` | Clear cached template data for a container |
| `unsafeHTML(string)` | Mark a string as trusted HTML (bypasses escaping) |

### DOM Morphing

| Function | Description |
|----------|-------------|
| `morph(target, newHTML)` | Reconcile live DOM to match new HTML string |

### Custom Elements

| Export | Description |
|--------|-------------|
| `AnJSElement` | Base class for reactive custom elements |
| `registerComponent(name, cls)` | Register a custom element (idempotent) |

#### `AnJSElement` Instance API

| Member | Description |
|--------|-------------|
| `state` | Reactive proxy — property writes trigger batched updates |
| `computed(name, deps, fn)` | Define a computed property |
| `render()` | Return `html`\`...\` or a string — called on every update |
| `update()` | Force a synchronous DOM update |
| `setup()` | Lifecycle hook — called once after first render |
| `destroy()` | Lifecycle hook — called on `disconnectedCallback` |

### Core

- `$(selector)` – Select elements.
- `$.extend(name, func, force)` – Extend AlmostNo.js.

### Iteration

- `.each(fn)` – Iterate over matched elements.
- `.get(index)` – Get an element by index.
- `.clone(deep)` – Clone an element.

### DOM Manipulation

- `.content(value, html)` – Get/set text or HTML content.
- `.text(value)` – Get/set text content.
- `.html(value)` – Get/set HTML content.
- `.css(prop, value)` – Get/set CSS styles.
- `.class(name, add)` – Add, remove, or toggle classes.
- `.display(show)` – Show or hide elements.
- `.hide()` / `.show()` – Convenience hide/show.
- `.remove()` – Remove elements from the DOM.
- `.empty()` – Remove all child elements.
- `.insert(content, position)` – Insert elements at a position.
- `.append(content)` / `.prepend(content)` – Insert content at start/end.
- `.before(content)` / `.after(content)` – Insert adjacent content.
- `.prop(name, value)` – Get/set DOM properties.
- `.val(value)` – Get/set form element values.
- `.focus()` / `.blur()` – Focus and blur.

### Attributes

- `.id(value)` – Get/set the `id` attribute.
- `.attr(name, value)` – Get/set attributes.
- `.removeAttr(name)` – Remove an attribute.
- `.serialize()` – Serialize a form.

### Events

- `.on(event, selector?, handler)` – Attach event listeners (optional delegation).
- `.off(event, selector?, handler)` – Remove event listeners.
- `.delegate(event, selector, handler)` – Delegated event listener.
- `.undelegate(event, selector, handler)` – Remove delegated listener.
- `.trigger(event)` – Dispatch an event.

### Event Bus

- `$.emit(event, data)` – Emit a global event.
- `$.listen(event, handler)` – Listen for a global event.
- `$.forget(event, handler)` – Remove a global event listener.

### Traversal

- `.next()` / `.prev()` – Adjacent siblings.
- `.parent()` – Parent element.
- `.children()` – Direct children.
- `.siblings()` – All siblings.
- `.closest(selector)` – Closest matching ancestor.

### Filtering

- `.filter(callbackOrSelector)` – Filter elements.
- `.find(selector)` – Find descendants.
- `.first()` / `.last()` – First or last element.
- `.even()` / `.odd()` – Even or odd indexed elements.
- `.has(className)` – Check for a class.

### Animations

- `.animate(styles, duration, easing)` – Animate CSS properties.
- `.fade(opacity, duration)` – Fade to a specific opacity.
- `.fadeIn(duration)` / `.fadeOut(duration)` – Fade in/out.

### State Management

- `.state(initialState)` – Create a reactive state proxy.
- `.bind(state, context)` – Bind state to DOM via `data-bind`.
- `.unbind(state)` – Remove bindings.
- `$.global(name, initial)` – Create or retrieve global state.
- `$.hasGlobal(name)` – Check if a global state exists.
- `$.clearGlobal(name)` – Remove a global state.

### HTTP Requests

- `$.get(url, options)` – GET request.
- `$.post(url, data, options)` – POST request.
- `$.put(url, data, options)` – PUT request.
- `$.delete(url, options)` – DELETE request.
- `$.patch(url, data, options)` – PATCH request.
- `$.head(url, options)` – HEAD request.
- `$.options(url, options)` – OPTIONS request.
- `$.abortController()` – Create an AbortController.

### Utilities

- `$.json(string)` – Safe JSON parse (returns `null` on failure).
- `$.trim(string)` – Trim whitespace.
- `$.range(x, min, max)` – Check if a number is within range.
- `$.isFunction(v)` / `$.isObject(v)` / `$.isString(v)` / `$.isNumber(v)` – Type checks.
- `$.contains(parent, child)` – Check DOM containment.
- `$.debounce(fn, delay)` – Debounced function.
- `$.throttle(fn, limit)` – Throttled function.
- `$.element(tag, attrs, children)` – Create an element.

### Event Aliases

- `.click(cb)` / `.change(cb)` / `.submit(cb)` / `.keydown(cb)` / `.keyup(cb)` / `.mouseover(cb)` / `.mouseout(cb)` – Event shortcuts.

## Why AlmostNo.js?

- **Modern & Minimal** – No legacy baggage. ES2020 modules with tree-shaking.
- **Tagged Templates** – Lit-inspired rendering without a build step.
- **DOM Morphing** – Efficient reconciliation without virtual DOM overhead.
- **Custom Elements** – First-class web component support.
- **Reactive State** – Proxy-based reactivity with automatic DOM updates.
- **Easy to Learn** – Familiar jQuery-style API with modern capabilities.
- **Fast & Lightweight** – 5–12 KB gzipped depending on bundle.
- **Extensible** – Add custom methods, components, and global state.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
