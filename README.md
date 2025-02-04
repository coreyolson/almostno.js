# AlmostNo.js

![Version](https://img.shields.io/badge/version-0.9.9-blue.svg)

AlmostNo.js is a lightweight JavaScript library (~8 KB minified, ~2.9 KB gzipped) designed for DOM manipulation, event handling, animations, and state management. It follows a minimalist approach similar to Zepto.js, making it a fast, modern alternative with a familiar API.

## Features

- **Tiny & Fast** – Small file size with no dependencies.
- **Chainable API** – Similar to jQuery/Zepto for clean, readable code.
- **DOM Manipulation** – Select, traverse, and modify elements effortlessly.
- **Events** – Attach, delegate, and trigger events easily.
- **Animations** – Simple CSS-based animations.
- **State Management** – Lightweight state bindings.
- **Convenience Fetch API** – Wrappers for HTTP requests with optional timeout handling.
- **Utility Functions** – Small but useful built-in helpers.

## Examples
See AlmostNo.js [Live Examples](https://coreyolson.github.io/almostno.js/) in action.

- [Animations](docs/animate.html)
- [Attributes](docs/attributes.html)
- [Core Features](docs/core.html)
- [DOM Manipulation](docs/dom.html)
- [Events](docs/events.html)
- [Filtering & Traversal](docs/filtering.html)
- [HTTP Requests](docs/request.html)
- [State Management](docs/state.html)
- [Utilities](docs/utilities.html)

Explore more at the [Examples Index](docs/index.html).

## **Browser Support**
AlmostNo.js is built for **modern browsers** and targets **ES2020**. It works on Chrome, Firefox, Edge, Safari, and Opera. If you're still worried about Internet Explorer... 🤔 No polyfills, no regrets.

## Installation

AlmostNo.js can be installed via NPM, included via a CDN, or self-hosted.

### NPM
```sh
npm install almostnojs
```

### Self-hosting
Download the latest release from the `dist/` directory and include it manually:
```html
<script src="./almostno.min.js"></script>
```

## Basic Usage
AlmostNo.js provides a simple and intuitive API for common tasks.

### Select Elements
```js
$('div').addClass('active');
```

### Handle Events
```js
$('#button').on('click', () => alert('Clicked!'));
```

### State Management
```js
// Create a state object
const state = $('#app').state({ count: 0 });

// Automatically updates the UI when state changes
$('#increment').on('click', () => state.count++);

// Bind state directly to an element
$('#count-display').bind(state);
```

```html
<!-- HTML -->
<div id="app">
  <span id="count-display" data-bind="count"></span>
  <button id="increment">Increase</button>
</div>
```

### Perform HTTP Requests

#### **GET Request**
```js
$.get('/api/data')
  .then(response => console.log(response))
  .catch(error => console.error('Request failed:', error));
```

#### **POST Request with JSON Data**
```js
$.post('/api/submit', { name: 'John Doe', email: 'john@example.com' })
  .then(response => console.log('Success:', response))
  .catch(error => console.error('Error:', error));
```

#### **PUT Request**
```js
$.put('/api/update', { id: 123, status: 'active' })
  .then(response => console.log('Updated:', response))
  .catch(error => console.error('Update failed:', error));
```

#### **DELETE Request**
```js
$.delete('/api/remove?id=123')
  .then(response => console.log('Deleted:', response))
  .catch(error => console.error('Delete failed:', error));
```

#### **Custom Headers**
```js
$.get('/api/protected', { headers: { Authorization: 'Bearer TOKEN' } })
  .then(response => console.log(response))
  .catch(error => console.error('Request failed:', error));
```

#### **Handling Timeouts**
```js
$.get('/api/slow-response', { timeout: 3000 }) // Auto-aborts after 3 seconds
  .then(response => console.log(response))
  .catch(error => console.error('Request timed out:', error));
```

## API

### Core
- `$(selector)` – Select elements.
- `$.extend(name, func, force)` – Extend AlmostNo.js.

### Iteration
- `.each(fn)` – Iterate over elements.
- `.get(index)` – Get an element by index.
- `.clone(deep)` – Clone an element.

### DOM Manipulation
- `.content(value, html)` – Get/set text or HTML content.
- `.text(value)` – Get/set text content.
- `.html(value)` – Get/set HTML content.
- `.css(prop, value)` – Get/set CSS styles.
- `.class(name, add)` – Add, remove, or toggle classes.
- `.display(show)` – Show or hide elements.
- `.remove()` – Remove elements from the DOM.
- `.empty()` – Remove all child elements.
- `.insert(content, position)` – Insert elements.
- `.focus()` – Focus on the first matched element.
- `.blur()` – Remove focus from the first matched element.

### Attributes
- `.id(value)` – Get/set the `id` attribute.
- `.attr(name, value)` – Get/set attributes.
- `.removeAttr(name)` – Remove an attribute.
- `.prop(name, value)` – Get/set properties.
- `.val(value)` – Get/set the value of form elements.

### Events
- `.on(event, selector, handler)` – Attach event listeners.
- `.off(event, selector, handler)` – Remove event listeners.
- `.delegate(event, selector, handler)` – Attach delegated event listeners.
- `.undelegate(event, selector, handler)` – Remove delegated event listeners.
- `.trigger(event)` – Trigger an event.

### Traversal
- `.next()` – Get the next sibling.
- `.prev()` – Get the previous sibling.
- `.parent()` – Get the parent element.
- `.children()` – Get child elements.
- `.siblings()` – Get sibling elements.
- `.closest(selector)` – Get the closest matching ancestor.

### Filtering
- `.filter(callbackOrSelector)` – Filter elements.
- `.find(selector)` – Find child elements.
- `.first()` – Get the first matched element.
- `.last()` – Get the last matched element.
- `.even()` – Get even-indexed elements.
- `.odd()` – Get odd-indexed elements.
- `.has(className)` – Check if an element has a class.

### Forms
- `.serialize()` – Serialize a form.

### Animations
- `.animate(styles, duration, easing)` – Animate CSS properties.
- `.fade(opacity, duration)` – Fade elements in or out.
- `.fadeIn(duration)` – Fade elements in.
- `.fadeOut(duration)` – Fade elements out.

### State Management
- `.state(initialState)` – Create a state object.
- `.bind(state, context)` – Bind state values to the DOM.
- `.unbind(state)` – Remove bindings.

### HTTP Requests
- `$.get(url, options)` – Perform a GET request.
- `$.post(url, data, options)` – Perform a POST request.
- `$.put(url, data, options)` – Perform a PUT request.
- `$.delete(url, options)` – Perform a DELETE request.
- `$.patch(url, data, options)` – Perform a PATCH request.
- `$.abortController()` – Create an abort controller.

### Utilities
- `$.json(string)` – Parse JSON safely, returns `null` on failure.
- `$.trim(string)` – Trim whitespace from a string.
- `$.range(x, min, max)` – Check if a number is within a range.
- `$.isFunction(obj)` – Check if a value is a function.
- `$.isObject(obj)` – Check if a value is a plain object.
- `$.isString(obj)` – Check if a value is a string.
- `$.isNumber(obj)` – Check if a value is a number (excluding `NaN`).
- `$.contains(parent, child)` – Check if a parent element contains a child element.
- `$.debounce(fn, delay)` – Create a debounced function that delays execution.
- `$.throttle(fn, limit)` – Create a throttled function that limits execution.
- `$.element(tag, attrs, children)` – Create an HTML element with attributes and children.

### Aliases
- `.append(content)` – Insert content at the end of each element.
- `.prepend(content)` – Insert content at the beginning of each element.
- `.before(content)` – Insert content before each element.
- `.after(content)` – Insert content after each element.
- `.click(callback)` – Attach or trigger a `click` event.
- `.change(callback)` – Attach or trigger a `change` event.
- `.submit(callback)` – Attach or trigger a `submit` event.
- `.keydown(callback)` – Attach or trigger a `keydown` event.
- `.keyup(callback)` – Attach or trigger a `keyup` event.
- `.mouseover(callback)` – Attach or trigger a `mouseover` event.
- `.mouseout(callback)` – Attach or trigger a `mouseout` event.
- `.hide()` – Hide elements.
- `.show()` – Show elements.

## Comparisons

| Feature | AlmostNo.js | Zepto | jQuery |
|---------|------------|--------|--------|
| File Size (gzipped) | 2.8 KB | 9 KB | 32 KB |
| DOM Manipulation | ✅ | ✅ | ✅ |
| Event Handling | ✅ | ✅ | ✅ |
| AJAX/Fetch Wrappers | ✅ | ✅ | ✅ |
| Animations | ✅ | ✅ | ✅ |
| State Management | ✅ | ❌ | ❌ |
| Modern API (ES2020) | ✅ | ✅ | ❌ |

## Why AlmostNo.js?
- **Modern & Minimalist** – Small size, no legacy baggage.
- **Fast & Lightweight** – Ideal for performance-sensitive applications.
- **Convenient Fetch API** – Provides wrappers over `fetch`, similar to Axios.
- **Familiar API** – Works like jQuery but optimized for modern web development.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

