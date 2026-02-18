# Changelog

All notable changes to AlmostNo.js will be documented in this file.

## [1.3.0] — 2025-07-18

### Added

- **Lifecycle Hooks** — `init()` (called once after first render), `updated()` (called after every render), `destroy()` (called on disconnect before cleanup). Replaces the previous `setup()` hook with a richer three-stage lifecycle.
- **Auto-Cleanup (`this.own()`)** — Register disposer functions that are automatically called when the element disconnects. Integrates with `$.listen()` unsubscribe for zero-leak event patterns.
- **`updateComplete` Promise** — Resolves after each render cycle completes. Enables awaiting DOM updates: `el.state.x = 1; await el.updateComplete;`.
- **Render Throttle Strategy** — `static get updateStrategy()` returns `'microtask'` (default) or `'raf'` for frame-coalesced updates. Components can opt into requestAnimationFrame scheduling for high-frequency state changes.
- **`repeat()` Keyed List Helper** — `repeat(items, keyFn, templateFn)` produces keyed `TemplateResult` arrays for efficient DOM reconciliation. Reuses and reorders existing DOM nodes by key instead of recreating them.
- **Keyed Array Reconciliation** — `commitArray()` in the template engine now detects keyed items and performs map-based DOM reuse, orphan removal, and `insertBefore` reordering.

### Changed

- **`$.listen()` returns unsubscribe** — `$.listen(event, handler)` now returns `() => void` that removes the specific handler. Existing code that ignores the return value is unaffected.
- **`setup()` → `init()`** — The `setup()` lifecycle hook is renamed to `init()` for clarity. `setup()` still works but is no longer documented.

## [1.2.0] — 2025-06-20

### Added

- **Tagged Template Rendering** — `html` tagged template literal that returns a `TemplateResult`. Surgical DOM updates: only changed values are patched on re-render (text nodes, attributes, nested templates, arrays).
- **`render(result, container)`** — Render a `TemplateResult` into a DOM container. Subsequent calls diff values and patch in place.
- **`clearTemplate(container)`** — Remove cached template data from a container, freeing memory.
- **`UnsafeHTML` / `unsafeHTML(string)`** — Mark raw HTML as trusted for insertion inside `html` templates (bypasses text-node escaping).
- **DOM Morphing** — `morph(target, newHTML)` reconciles live DOM against a new HTML string. Preserves focus, event listeners, and input values. Lightweight recursive patcher with no keyed reordering.
- **`AnJSElement`** — Base class for reactive custom elements built on Web Components. Features: reactive state proxy, batched microtask updates, computed properties, `observedAttributes` reflection, `setup()` and `destroy()` lifecycle hooks.
- **`registerComponent(name, cls)`** — Idempotent custom element registration helper.
- **Attribute statics preservation** — Template parts correctly preserve static attribute prefixes (e.g., `class="q-dot ${dynamic}"` retains `q-dot`).
- **Render type guard** — `render()` throws a `TypeError` if the first argument is not a `TemplateResult`, catching common mistakes early.

### Changed

- **Package exports** — Added `./element` export. Removed broken `./template` and `./morph` exports that incorrectly pointed to `element.js`.
- **Description & keywords** — Updated `package.json` description and keywords to reflect template parts, DOM morphing, custom elements, and reactive state.

### Fixed

- **Attribute prefix bug** — `walkTemplate()` no longer drops static content preceding dynamic expressions in attribute values.

## [1.1.0] — 2025-02-18

### Added

- **State management** — Proxy-based reactive state with `onChange`, `onAny`, `patch`, DOM bindings via `data-bind`, and auto-events via `data-action`.
- **Components** — Server-rendered components with `$.component()`, observer-based auto-mounting, and global state via `$.global()`.
- **Event bus** — `$.emit()`, `$.listen()`, `$.forget()` for cross-component communication.
- **Animations** — `.animate()`, `.fade()`, `.fadeIn()`, `.fadeOut()` with CSS transitions.
- **Filtering** — `.filter()`, `.find()`, `.first()`, `.last()`, `.even()`, `.odd()`.
- **Traversal** — `.next()`, `.prev()`, `.parent()`, `.children()`, `.siblings()`, `.closest()`.
- **Aliases** — `.append()`, `.prepend()`, `.before()`, `.after()`, event shortcuts.

## [1.0.0] — 2025-01-15

### Added

- Initial release.
- **Core** — `$()` selector, `.each()`, `.get()`, `.clone()`.
- **DOM** — `.content()`, `.text()`, `.html()`, `.css()`, `.class()`, `.display()`, `.remove()`, `.empty()`, `.insert()`, `.prop()`, `.val()`, `.focus()`, `.blur()`.
- **Attributes** — `.attr()`, `.id()`, `.removeAttr()`, `.serialize()`.
- **Events** — `.on()`, `.off()`, `.delegate()`, `.undelegate()`, `.trigger()`.
- **HTTP** — `$.get()`, `$.post()`, `$.put()`, `$.delete()`, `$.patch()`, `$.head()`, `$.options()`, `$.abortController()`.
- **Utilities** — `$.json()`, `$.trim()`, `$.range()`, `$.isFunction()`, `$.isObject()`, `$.isString()`, `$.isNumber()`, `$.contains()`, `$.debounce()`, `$.throttle()`, `$.element()`.
- **Extend** — `$.extend()` for adding custom methods.
