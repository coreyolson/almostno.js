/**
 * Template Parts — Surgical DOM updates via tagged template literals
 *
 * First render: parses HTML and builds DOM. Subsequent renders: compares
 * old values to new and directly patches only changed text nodes and
 * attributes. No innerHTML, no diffing, no virtual DOM.
 */

// Cache parsed templates by their static strings array (reference identity)
const templateCache = new WeakMap();

// Sentinel for empty template parts (first render detection)
const EMPTY = Symbol('empty');

/**
 * Represents the result of a tagged `html` template call.
 * Holds the static structure (strings) and the dynamic values.
 */
export class TemplateResult {

    constructor(strings, values) {

        // Static template fragments (immutable between renders for same call site)
        this.strings = strings;

        // Dynamic values for this render pass
        this.values = values;
    }
}

/**
 * Wraps a raw HTML string for DOM insertion (bypasses text-node escaping).
 * Use when interpolating pre-built HTML markup inside html`...` templates.
 */
export class UnsafeHTML {

    constructor(value) {

        // Store the raw HTML string
        this.value = String(value ?? '');
    }
}

/**
 * Mark a string as trusted HTML for DOM insertion inside html`...` templates.
 * Without this wrapper, strings are safely inserted as text nodes.
 *
 * @param {string} value - Raw HTML string to insert as DOM
 * @returns {UnsafeHTML}
 */
export function unsafeHTML(value) {

    if (typeof console !== 'undefined') console.warn('[AnJS] unsafeHTML() is an escape hatch — convert this call site to use html`...` instead.');
    return new UnsafeHTML(value);
}

/**
 * Tagged template literal — returns a TemplateResult instead of a string
 *
 * @param {TemplateStringsArray} strings - Static template parts
 * @param {...*} values - Dynamic interpolated values
 * @returns {TemplateResult}
 */
export function html(strings, ...values) {

    // Return a trackable result object
    return new TemplateResult(strings, values);
}

/**
 * Commit a TemplateResult into a container element.
 * First call builds DOM from scratch; subsequent calls patch only changes.
 *
 * @param {TemplateResult} result - The template result to render
 * @param {HTMLElement} container - The target DOM element
 */
export function render(result, container) {

    // Guard: render() requires a TemplateResult 
    if (!(result instanceof TemplateResult)) {

        // Developer error — render() should only be called with the result of html`...`
        throw new TypeError(`render() expects a TemplateResult, got ${Array.isArray(result) ? 'Array' : typeof result}. Wrap with html\`...\` first.`);
    }

    // Retrieve or create instance data for this container
    let instance = templateCache.get(container);

    // First render — build DOM from scratch
    if (!instance || instance.strings !== result.strings) {

        // Build full HTML string for initial parse
        const markup = result.strings.reduce((acc, str, i) =>
            acc + str + (i < result.values.length ? markerFor(i) : ""), "");

        // Parse into a template element (inert, no scripts execute)
        const tpl = document.createElement('template');
        tpl.innerHTML = markup;

        // Walk the parsed DOM to find marker positions
        const parts = [];
        walkTemplate(tpl.content, parts);

        // Clear container and adopt the parsed DOM
        container.innerHTML = '';
        container.appendChild(tpl.content.cloneNode(true));

        // Resolve parts to live DOM references within the container
        const liveParts = resolveParts(parts, container);

        // Store instance data
        instance = { strings: result.strings, parts: liveParts, values: result.values.map(() => EMPTY) };
        templateCache.set(container, instance);
    }

    // Patch — update only parts whose values changed
    commitValues(instance, result.values);
}

// ── Internal Helpers ──────────────────────────────────────────────────

// Unique markers injected into HTML to locate dynamic insertion points
const MARKER_PREFIX = '<!--anjs-';
const MARKER_SUFFIX = '-->';

/**
 * Generate a comment marker for a value index
 */
function markerFor(index) {

    return `${MARKER_PREFIX}${index}${MARKER_SUFFIX}`;
}

/**
 * Walk a parsed template DOM to find all marker positions.
 * Records the path (child indices) from root to each marker.
 *
 * @param {Node} root - Template content fragment
 * @param {Array} parts - Output array of part descriptors
 * @param {number[]} path - Current path from root
 */
function walkTemplate(root, parts, path = []) {

    // Iterate children
    let childIndex = 0;

    for (let node = root.firstChild; node; node = node.nextSibling) {

        // Comment node — check if it's a marker
        if (node.nodeType === 8) {

            const text = node.data.trim();

            // Match marker pattern
            if (text.startsWith('anjs-')) {

                const index = parseInt(text.slice(5), 10);

                if (!isNaN(index)) {

                    // Record as a node part (text insertion point)
                    parts.push({ type: 'node', index, path: [...path, childIndex] });
                }
            }
        }

        // Element node — check attributes for markers
        else if (node.nodeType === 1) {

            // Check each attribute for marker values
            const attrs = [...node.attributes];
            for (const attr of attrs) {

                // Split attribute value on all markers to extract static/dynamic segments
                const markerRe = /<!--anjs-(\d+)-->/g;
                const segments = attr.value.split(markerRe);

                // segments with markers: ['prefix', '0', 'mid', '1', 'suffix']
                // No markers → segments.length === 1 → skip
                if (segments.length <= 1) continue;

                // Extract alternating statics and value indices
                const statics = [];
                const indices = [];
                for (let s = 0; s < segments.length; s++) {
                    if (s % 2 === 0) {
                        statics.push(segments[s]);
                    } else {
                        indices.push(parseInt(segments[s], 10));
                    }
                }

                // Record each dynamic index as an attribute part sharing the same statics
                for (let k = 0; k < indices.length; k++) {
                    parts.push({
                        type: 'attr',
                        index: indices[k],
                        path: [...path, childIndex],
                        name: attr.name,
                        statics,
                        attrIndices: indices,
                        slotIndex: k
                    });
                }

                // Clean the markers from the attribute (leave statics joined)
                node.setAttribute(attr.name, statics.join(''));
            }

            // Recurse into children
            walkTemplate(node, parts, [...path, childIndex]);
        }

        childIndex++;
    }
}

/**
 * Resolve part descriptors (paths) to live DOM node references
 *
 * @param {Array} parts - Part descriptors with paths
 * @param {HTMLElement} container - Live DOM container
 * @returns {Array} - Resolved parts with direct node references
 */
function resolveParts(parts, container) {

    return parts.map(part => {

        // Walk the path to find the target node
        let node = container;
        for (const idx of part.path) {

            node = node.childNodes[idx];
            if (!node) return null;
        }

        // For node parts, replace the comment with a text node
        if (part.type === 'node') {

            const text = document.createTextNode('');
            node.parentNode.replaceChild(text, node);
            return { type: 'node', index: part.index, node: text };
        }

        // For attribute parts, store the element, attribute name, and statics
        const resolved = { type: 'attr', index: part.index, node, name: part.name };
        if (part.statics) {
            resolved.statics = part.statics;
            resolved.attrIndices = part.attrIndices;
            resolved.slotIndex = part.slotIndex;
        }
        return resolved;

    }).filter(Boolean);
}

/**
 * Commit new values to resolved parts — only updates what changed
 *
 * @param {Object} instance - Template instance (parts, old values)
 * @param {Array} newValues - New dynamic values
 */
function commitValues(instance, newValues) {

    for (const part of instance.parts) {

        const newVal = newValues[part.index];
        const oldVal = instance.values[part.index];

        // Skip unchanged values
        if (newVal === oldVal) continue;

        if (part.type === 'node') {

            // Handle nested TemplateResults
            if (newVal instanceof TemplateResult) {

                // Create a transparent container and render into it
                if (!part._container) {
                    part._container = document.createElement('span');
                    part._container.style.display = 'contents';
                    part.node.parentNode.replaceChild(part._container, part.node);
                }
                render(newVal, part._container);
            }

            // Handle raw HTML strings (unsafeHTML wrapper)
            else if (newVal instanceof UnsafeHTML) {

                if (!part._container) {
                    part._container = document.createElement('span');
                    part._container.style.display = 'contents';
                    part.node.parentNode.replaceChild(part._container, part.node);
                }
                part._container.innerHTML = newVal.value;
            }

            // Handle arrays
            else if (Array.isArray(newVal)) {

                commitArray(part, newVal);
            }

            // Handle null/undefined/false — clear
            else if (newVal == null || newVal === false) {

                // Restore text node if we previously had a container (array/nested)
                if (part._container) {

                    const text = document.createTextNode('');
                    part._container.parentNode.replaceChild(text, part._container);
                    part.node = text;
                    delete part._container;
                    delete part._items;
                } else {
                    part.node.data = '';
                }
            }

            // Handle primitive values — update text
            else {

                // Restore text node if we previously had a container
                if (part._container) {

                    const text = document.createTextNode(String(newVal));
                    part._container.parentNode.replaceChild(text, part._container);
                    part.node = text;
                    delete part._container;
                }
                else {
                    part.node.data = String(newVal);
                }
            }
        }

        else if (part.type === 'attr') {

            // Reconstruct full attribute value from statics + all dynamic values
            if (part.statics) {

                // Build value: static[0] + val[0] + static[1] + val[1] + ... + static[n]
                const statics = part.statics;
                const indices = part.attrIndices;
                let assembled = statics[0];
                for (let k = 0; k < indices.length; k++) {
                    const v = newValues[indices[k]];
                    assembled += (v == null || v === false ? '' : String(v));
                    assembled += statics[k + 1];
                }
                part.node.setAttribute(part.name, assembled);

            /* istanbul ignore else — walkTemplate always provides statics */
            } else {

                // Legacy single-value attribute (no statics info)
                if (newVal === true) {
                    part.node.setAttribute(part.name, '');
                } else if (newVal === false || newVal == null) {
                    part.node.removeAttribute(part.name);
                } else {
                    part.node.setAttribute(part.name, String(newVal));
                }
            }
        }
    }

    // Store current values for next diff
    instance.values = [...newValues];
}

/**
 * Handle array values — render each item, add/remove as needed
 *
 * @param {Object} part - The node part
 * @param {Array} items - Array of values (strings or TemplateResults)
 */
function commitArray(part, items) {

    // Initialize array tracking on first use
    if (!part._items) {

        part._items = [];

        // Replace text node with a container
        if (!part._container) {
            part._container = document.createElement('span');
            part._container.style.display = 'contents';
            part.node.parentNode.replaceChild(part._container, part.node);
        }
    }

    const container = part._container;
    const existing = part._items;

    // Update existing items and append new ones
    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        if (i < existing.length) {

            // Update existing slot
            if (item instanceof TemplateResult) {
                render(item, existing[i]);
            } else {
                existing[i].textContent = String(item ?? '');
            }
        } else {

            // Create new slot
            const slot = document.createElement('span');
            slot.style.display = 'contents';

            if (item instanceof TemplateResult) {
                render(item, slot);
            } else {
                slot.textContent = String(item ?? '');
            }

            container.appendChild(slot);
            existing.push(slot);
        }
    }

    // Remove excess items
    while (existing.length > items.length) {

        const removed = existing.pop();
        removed.remove();
    }
}

/**
 * Flush template cache for a container (used during teardown)
 *
 * @param {HTMLElement} container
 */
export function clearTemplate(container) {

    templateCache.delete(container);
}
