// Dependencies
import AnJS from './core.js';

/**
 * Merge and normalize request headers
 * 
 * @param {Object} customHeaders - Headers from options.
 * @param {boolean} hasBody - Whether the request includes a body.
 * @returns {Object} - Merged headers with defaults.
 */
function mergeHeaders(customHeaders = {}, hasBody) {

    // Default headers
    const headers = {
        'Accept': 'application/json',
        ...customHeaders
    };

    // Ensure JSON requests explicitly set Content-Type
    if (hasBody && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    // Return merged headers
    return headers;
}

/**
 * Process request body based on Content-Type
 * 
 * @param {Object | FormData | string | null} data - Request body.
 * @param {Object} headers - Headers to determine encoding.
 * @returns {string | FormData | URLSearchParams | undefined} - Encoded body.
 */
function processBody(data, headers) {

    // FormData (auto-sets headers)
    if (data instanceof FormData) {

        // Ensure Content-Type is removed (let browser handle it)
        delete headers['Content-Type'];

        // Return FormData object
        return data;
    }

    // Detect form-encoded body
    const isFormEncoded = headers['Content-Type'] === 'application/x-www-form-urlencoded';

    // Convert to URL-encoded form data
    return isFormEncoded ? new URLSearchParams(data).toString() : JSON.stringify(data);
}

/**
 * Handle request timeout using Promise.race
 * 
 * @param {Promise} fetchPromise - The fetch request promise.
 * @param {number} timeout - Timeout duration in milliseconds.
 * @param {string} url - Request URL for error reporting.
 * @returns {Promise} - Fetch promise with timeout logic.
 */
function withTimeout(fetchPromise, timeout, url) {

    // No timeout
    if (timeout === 0 || timeout == null) return fetchPromise;

    // Race against timeout
    return Promise.race([

        // Fetch promise
        fetchPromise,

        // Timeout promise
        new Promise((_, reject) =>

            // Reject with timeout error
            setTimeout(() => reject(new Error(`Request timed out: ${url}`)), timeout)
        )
    ]);
}

/**
 * Perform an HTTP request using fetch
 * 
 * @param {string} url - The request URL.
 * @param {string} method - The HTTP method.
 * @param {Object | FormData | string | null} data - Request body.
 * @param {Object} options - Additional fetch options.
 * @returns {Promise} - Resolves with JSON or text response.
 * @throws {Error} - Rejects on network or response errors.
 */
export function request(url, method = 'GET', data = null, options = {}) {

    // Request timeout & signal
    const { timeout = 5000, signal } = options;

    // Construct absolute URL
    const urlObj = new URL(url, window.location.origin);

    // Determine if request has a body
    const hasBody = (method !== 'GET' && method !== 'DELETE' && data);

    // Merge headers
    const headers = mergeHeaders(options.headers, hasBody);

    // Process request body
    const body = hasBody ? processBody(data, headers) : undefined;

    // Fetch options
    const fetchOptions = { method, headers };

    // Only attach body if it's present
    if (body !== undefined) fetchOptions.body = body;

    // Attach signal if provided
    if (signal) fetchOptions.signal = signal;

    // Execute fetch request
    const fetchPromise = fetch(urlObj.toString(), fetchOptions).then(response => {

        // Throw error if response is not OK
        if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);

        // Ensure headers exist before accessing them
        const contentType = response.headers?.get('Content-Type') || '';

        // Return JSON if applicable, otherwise return as text
        return contentType.includes('application/json') ? response.json() : response.text();
    });

    // Handle timeout
    return withTimeout(fetchPromise, timeout, url);
}

/**
 * Attach request function to `AnJS.prototype`
 */
AnJS.prototype.request = function (url, method = 'GET', data = null, options = {}) {

    // Delegate to request function
    return request(url, method, data, options);
};

/**
 * Define HTTP method shortcuts
 */
const http = {
    get: (url, options = {}) => request(url, 'GET', null, options),
    delete: (url, options = {}) => request(url, 'DELETE', null, options),
    post: (url, data, options = {}) => request(url, 'POST', data, options),
    put: (url, data, options = {}) => request(url, 'PUT', data, options),
    patch: (url, data, options = {}) => request(url, 'PATCH', data, options),
    abortController: () => new AbortController(),
};

// Export module
export default http;