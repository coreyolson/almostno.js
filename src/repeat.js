/**
 * Keyed list helper for efficient array rendering in template parts.
 *
 * Instead of `.map(fn).join('')` (which collapses to a string and kills
 * surgical updates), `repeat()` returns an array of keyed TemplateResults
 * that the template parts system can diff by identity.
 *
 * @param {Iterable} items - The data items to render
 * @param {Function} keyFn - Extracts a unique key from each item (e.g., item => item.id)
 * @param {Function} templateFn - Returns a TemplateResult for each item (receives item, index)
 * @returns {Array<TemplateResult>} - Array of keyed TemplateResults for template interpolation
 */
export function repeat(items, keyFn, templateFn) {

    // Collect results as an array of TemplateResults
    const results = [];

    // Build index for iteration
    let index = 0;

    // Iterate the input (supports arrays, Sets, Maps, generators)
    for (const item of items) {

        // Generate the TemplateResult for this item
        const result = templateFn(item, index);

        // Attach the key for identity tracking (used by commitArray)
        if (result && typeof result === 'object') {

            // Store key on the result for stable reconciliation
            result._key = keyFn(item, index);
        }

        // Add to output
        results.push(result);

        // Increment position
        index++;
    }

    // Return array — interpolated directly in html`...${repeat(items, ...)}...`
    return results;
}
