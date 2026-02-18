/**
 * DOM Morph — Lightweight recursive DOM patcher
 *
 * Reconciles an existing DOM tree with new HTML by walking both trees
 * in parallel. Matching nodes are patched in-place (preserving focus,
 * scroll, event listeners). Mismatched nodes are replaced. New nodes
 * are appended, excess nodes are removed.
 *
 * No keyed reordering — relies on structurally stable templates
 * (same tag order between renders). This keeps it under 60 lines.
 */

/**
 * Morph the contents of `target` to match `newHTML`
 *
 * @param {HTMLElement} target - Live DOM element to patch
 * @param {string} newHTML - Desired HTML content
 */
export function morph(target, newHTML) {

    // Parse new HTML into a temporary container
    const template = document.createElement('template');
    template.innerHTML = newHTML;

    // Reconcile children of target against parsed children
    reconcile(target, target.childNodes, template.content.childNodes);
}

/**
 * Recursively reconcile two sets of child nodes
 *
 * @param {Node} parent - Parent node in the live DOM
 * @param {NodeList} oldNodes - Current live children
 * @param {NodeList} newNodes - Desired children (from parsed HTML)
 */
function reconcile(parent, oldNodes, newNodes) {

    const newLen = newNodes.length;

    // Patch existing nodes in parallel
    for (let i = 0; i < newLen; i++) {

        const oldChild = oldNodes[i];
        const newChild = newNodes[i];

        // Append new node (didn't exist before)
        if (!oldChild) {

            parent.appendChild(newChild.cloneNode(true));
            continue;
        }

        // Same node type — patch in place
        if (oldChild.nodeType === newChild.nodeType) {

            // Text or comment node — update data if different
            if (oldChild.nodeType === 3 || oldChild.nodeType === 8) {

                if (oldChild.data !== newChild.data) {
                    oldChild.data = newChild.data;
                }
                continue;
            }

            // Element node — same tag: sync attributes and recurse
            if (oldChild.nodeType === 1 && oldChild.tagName === newChild.tagName) {

                syncAttributes(oldChild, newChild);
                reconcile(oldChild, oldChild.childNodes, newChild.childNodes);
                continue;
            }
        }

        // Type or tag mismatch — replace entirely
        parent.replaceChild(newChild.cloneNode(true), oldChild);
    }

    // Remove excess old nodes (iterate backwards to avoid index shifts)
    while (parent.childNodes.length > newLen) {

        parent.removeChild(parent.lastChild);
    }
}

/**
 * Sync attributes from a fresh element onto an existing element
 *
 * @param {HTMLElement} oldEl - Live DOM element to update
 * @param {HTMLElement} newEl - Parsed element with desired attributes
 */
function syncAttributes(oldEl, newEl) {

    // Set or update new attributes
    for (const { name, value } of newEl.attributes) {

        if (oldEl.getAttribute(name) !== value) {

            oldEl.setAttribute(name, value);
        }
    }

    // Remove stale attributes
    for (const { name } of [...oldEl.attributes]) {

        if (!newEl.hasAttribute(name)) {

            oldEl.removeAttribute(name);
        }
    }

    // Sync special properties that don't reflect to attributes
    const tag = oldEl.tagName;
    const isFocused = document.activeElement === oldEl;

    if (tag === 'INPUT' || tag === 'TEXTAREA') {

        // Sync value property (doesn't reflect from setAttribute)
        /* istanbul ignore next — isFocused skip verified by mock tests; JSDOM sub-branch limitation */
        if (oldEl.value !== newEl.value && !isFocused) {
            oldEl.value = newEl.value || '';
        }

        // Sync checked property for checkboxes and radio buttons
        if (oldEl.type === 'checkbox' || oldEl.type === 'radio') {
            if (oldEl.checked !== newEl.checked && !isFocused) {
                oldEl.checked = newEl.checked;
            }
        }
    }

    // Sync SELECT value (selectedIndex doesn't reflect from parsing)
    /* istanbul ignore next — isFocused skip verified by mock tests; JSDOM sub-branch limitation */
    if (tag === 'SELECT' && !isFocused) {
        if (oldEl.value !== newEl.value) {
            oldEl.value = newEl.value;
        }
    }
}
