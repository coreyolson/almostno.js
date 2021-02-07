/**
 * Almost Nothing JS Library
 * Copyright (c) Corey Olson
 * Released via MIT license
 */

// Version 0.9.3

/**
 * Almost Nothing - Selector
 * ------------------------------------------------
 * A minimalist JS framework.
 *
 * Copyright (c) 2020 - 2021 Corey Olson
 * https://opensource.org/licenses/MIT
 *
 * // #######################################################################
 *
 * $('.selector')                               // Selector
 * $('.selector').length()                      // Length of Selection
 * $('.selector').next()                        // Traverse: Next
 * $('.selector').prev()                        // Traverse: Previous
 * $('.selector').parent()                      // Traverse: Parent
 * $('.selector').children()                    // Traverse: Children
 * $('.selector').siblings()                    // Traverse: Siblings
 * $('.selector').closest()                     // Traverse: Ancestors
 * $('.selector').insert([element], [position]) // Insert: Before, Prepend, Append, After
 * $('.selector').class([class], [boolean])     // Element: Add (true); Remove (false) Class
 * $('.selector').display([boolean])            // Element: Show (true); Hide (false) Element
 * $('.selector').property([get], [set])        // Element: Get property(); Set property(value)
 * $('.selector').text([set])                   // Element: Get text(); Set text(value)
 * $('.selector').html([set])                   // Element: Get html(); Set html(value)
 * $('.selector').css([get], [set])             // Element: Get style(attr); Set style(attr, value)
 * $('.selector').attr([get], [set])            // Element: Get attr(name); Set attr(name, value)
 * $('.selector').has([classs])                 // Element: Has Class
 * $('.selector').delegate([e], [select], [fn]) // Event: Delegation
 * $('.selector').on([event], [handler])        // Event: Add
 * $('.selector').off([event], [handler])       // Event: Remove
 * $('.selector').trigger([event])              // Event: Trigger
 * $('.selector').empty()                       // Remove: Children
 * $('.selector').remove()                      // Remove: Node
 * $('.selector').filter([selector])            // Filter: Selection
 * $('.selector').find()                        // Filter: Sub Query
 * $('.selector').first()                       // Filter: First Node
 * $('.selector').last()                        // Filter: Last Node
 * $('.selector').modulo([mod], [remainder])    // Filter: Modulo
 * $('.selector').odd()                         // Filter: Odd Nodes
 * $('.selector').even()                        // Filter: Even Nodes
 * $('.selector').nth([num])                    // Filter: Nth Every Nth Node
 * $('.selector').xth([num])                    // Filter: Xth Only Xth Node
 * $('.selector').slice([begin], [end])         // Filter: Slice Array
 * $('.selector').focus()                       // Helper: Focus
 * $('.selector').blur()                        // Helper: Blur
 * $('.selector').id()                          // Helper: Get id(); Set id(value)
 * $('.selector').serialize()                   // Helper: Serialize Form Data
 */

// Framework Accessor
var $ = function(query){

    // Window, Document, Element, Object
    var [w,d,el,object] = [window,document,,{

        // Selector
        _ = q => ( ! query ) ? 0

            // Detect "this" or Selector
            : ( typeof query === 'object' )

                // Object "this"
                ? el = [query]

                // Query selection
                : d.querySelectorAll(query),

        // Iterator
        i = (element,fn) => element.forEach(

            // Do Function
            index => fn(index)
        ),

        // Count Selected
        length = length => Array.from(el).length,

        // Next
        next() {

            // Selection
            el = [el[0].nextElementSibling];

            // Chain
            return this;
        },

        // Previous
        prev() {

            // Selection
            el = [el[0].previousElementSibling];

            // Chain
            return this;
        },

        // Parent
        parent() {

            // Selection
            el = [el[0].parentNode];

            // Chain
            return this;
        },

        // Children
        children() {

            // Selection
            el = Array.from(el[0].children);

            // Chain
            return this;
        },

        // Siblings
        siblings() {

            // Selection
            el = [...el[0].parentElement.children].filter( child => child != el[0] );

            // Chain
            return this;
        },

        // Ancestors
        closest(ancestor) {

            // Selection
            el = [el[0].closest(ancestor)];

            // Chain
            return this;
        },

        // Insert
        insert(element, placement = 'before') {

            // Translation
            var positions = {
                'before' : 'beforeBegin',
                'prepend': 'afterBegin',
                'append' : 'beforeEnd',
                'after'  : 'afterEnd',
            };

            // Iterate
            el.forEach(

                // Perform Insertion with Cloned Element
                target => target.insertAdjacentElement(positions[placement], element.cloneNode(true))
            );

            // Chain
            return this;
        },

        // Class Manipulator
        class(name, boolean = 0) {

            // Iterate Classes
            return object.i( el, element => element.classList[ (boolean === 0)

                // Toggle w/o Boolean
                ? 'toggle' : (boolean)

                // Add (True), Remove (False)
                ? 'add' : 'remove' ](name)

            // Chain
            ) || this },

        // Display Manipulator
        display(boolean) {

            // Iterate Classes
            return object.i( el, element => element.style.display = (boolean)

                // Display (True), None (False)
                ? '' : 'none'

            // Chain
            ) || this },

        // Property
        prop(name, text = null, str = '') {

            // Set
            if ( text !== null ) {

                // Update
                object.i( el, i => i[name] = text );

            // Get
            } else {

                // Retrieve
                object.i( el, i => str += i[name]);

                // String
                return str;
            }

            // Chain
            return this;
        },

        // Text
        text = text => object.prop('textContent', text),

        // HTML
        html = html => object.prop('innerHTML', html),

        // Style
        css(name, attribute = null) {

            // Set
            if ( attribute ) {

                // Update All
                object.i( el, i => i.style[name] = attribute );

            // Get
            } else {

                // First Element
                return getComputedStyle(el[0])[name];
            }

            // Chain
            return this;
        },

        // Attributes
        attr(name, value = null, remove = false) {

            // Detect
            (remove)

                // Remove Attribute
                ? object.i( el, i => i.removeAttribute(name) )

                // Set Attribute
                : ( value!==null ) ? object.i( el, i => i.setAttribute(name, value) ) : 0;

            // Get Attribute
            return el[0].getAttribute(name);
        },

        // Has Class
        has = name => el[0].classList.contains(name),

        // Event (Delegation)
        delegate(event, selector, handler) {

            // Listener
            el[0].addEventListener(event, function(e) {

                // Iterate Upwards
                for (var target = e.target; target && target != this; target = target.parentNode) {

                    // Detect Match
                    if (target.matches(selector)) {

                        // Handler
                        handler(e);

                        // Stop
                        break;
                    }
                }

            // Passive
            }, true);

            // Chain
            return this;
        },

        // Event (On)
        on(event, mixed, handler = null) {

            // Delegate
            if (handler) {

                // Wrapper
                object.delegate(event, mixed, handler);

            // On
            } else {

                // Add Listeners (Passive)
                object.i( el, i => i.addEventListener(event, mixed, true) );
            }

            // Chain
            return this;
        },

        // Event (Off)
        off(name, handler) {

            // Remove Listeners
            object.i( el, i => i.removeEventListener(name, handler));

            // Chain
            return this;
        },

        // Trigger
        trigger(type) {

            // Create Event
            var event = d.createEvent('HTMLEvents');

            // Initialize
            event.initEvent(type, true, false);

            // Dispatch
            object.i( el, index => index.dispatchEvent(event));

            // Chain
            return this;
        },

        // Empty
        empty = empty => Array.from(el[0].children).forEach(index => index.remove()),

        // Remove
        remove = remove => object.i( el, index => index.remove() ),

        // Filter
        filter(selector) {

            // Selection
            el = el[0].parentNode.querySelectorAll(selector);

            // Chain
            return this;
        },

        // Filter: Find
        find(selector) {

            // Selection
            el = el[0].querySelectorAll(selector);

            // Chain
            return this;
        },

        // Filter: First
        first() {

            // Selection
            el = [el[0]];

            // Chain
            return this;
        },

        // Filter: Last
        last() {

            // Selection
            object.eq(-1);

            // Chain
            return this;
        },

        // Filter: Modulo
        modulo(mod, remainder, oe = []) {

            // Iterate Selection
            el.forEach( (v,i) => ( i % mod == remainder ) ? oe.push(v) : 0 );

            // Update Selection
            el = oe;

            // Chain
            return this;
        },

        // Filter: Odd
        odd() {

            // Perform Filter
            object.modulo(2,0);

            // Chain
            return this;
        },

        // Filter: Even
        even() {

            // Perform Filter
            object.modulo(2,1);

            // Chain
            return this;
        },

        // Filter: Nth
        nth(n) {

            // Perform Filter
            object.modulo(n,n-1);

            // Chain
            return this;
        },

        // Filter: Xth
        xth(x) {

            // Selection
            el = [el[x-1]];

            // Chain
            return this;
        },

        // Slice
        slice(begin, end) {

            // Selection
            el = Array.from(el).slice(begin, end);

            // Chain
            return this;
        },

        // Raw Element (Single)
        element = e => el[0],

        // Raw Element (Plural)
        elements = e => el,

        // Clone
        clone = clone => el[0].cloneNode(true),

        // Focus
        focus = focus => el[0].focus(),

        // Blur
        blur = blur => el[0].blur(),

        // Identifier
        id = (id) => object.prop('id', id),

        // Serialize
        serialize = serialize => new URLSearchParams(new FormData(el[0])).toString(),
    }];

    // Select
    el = object._(query);

    // Object
    return object;
};


/**
 * Almost Nothing - Helpers
 * ------------------------------------------------
 * A minimalist JS framework.
 *
 * Copyright (c) 2020 - 2021 Corey Olson
 * https://opensource.org/licenses/MIT
 *
 * // #######################################################################
 *
 * $.trim([string])                             // Trims String
 * $.json([string])                             // Parse JSON from string
 * $.slice([element], [begin], [end])           // Slice Array Object
 * $.range([x], [min], [max])                   // Checks if withing range
 * $.isarr([mixed])                             // Checks if variable is Array
 * $.inarr([needle], [array])                   // Checks if items is in array
 * $.idxof([needle], [array])                   // Returns Index of Array
 */

// Trim
$.trim = string => string.trim();

// Parse JSON
$.json = string => JSON.parse(string);

// Slice
$.slice = (element, begin, end) => element.slice(begin, end);

// Range
$.range = (x, min, max) => (x - min) * (x - max) <= 0;

// Array Check
$.isarr = arr => Array.isArray(arr);

// Array Within
$.inarr = (needle, arr) => $.idxof(needle, arr) >= 0;

// Array Index
$.idxof = (needle, arr) => arr.indexOf(needle);


/**
 * Almost Nothing - XHR
 * ------------------------------------------------
 * A minimalist JS framework.
 *
 * Copyright (c) 2020 - 2021 Corey Olson
 * https://opensource.org/licenses/MIT
 *
 * // #######################################################################
 *
 * $.xhr({
 *      path: '/path/',
 *      method: 'POST',
 *      before: function(){}
 *      after: function(){}
 *      fail: function(){}
 * });
 * $.ajax('METHOD', '/PATH', [before], [after])
 * $.post('/PATH', [data], [after])
 * $.get('/PATH', [after])
 */

// Advanced XHR Function
$.xhr = function(object){

    // Config
    var defaults = {

        // Non-blocking
        async: true,

        // Request
        method: 'GET',

        // Before Handler
        before: function(){},

        // Post Handler
        after: function(){},

        // Failure Handler
        fail: function(){},

        // Form data
        data: null,
    };

    // Apply Defaults
    for (key in defaults) {

        // Unless object specifies...
        object[key] = (object[key]) ? object[key] : defaults[key];
    }

    // Preprocessing
    object.before();

    // Construct XHR Request
    var request = new XMLHttpRequest();

    // XHR Request
    request.open(object.method, object.path, object.async);

    // Await Response
    request.onload = function() {

        // Response
        object.request = this;

        // Expected Response
        if ( $.range(this.status, 200, 399)) {

            // Completed
            object.after(this, object);

        // Error
        } else {

            // Unexpected
            object.fail(this, object);
        }
    };

    // Detect Connection Failure
    request.onerror = function() {

        // Connection
        object.fail(this, object);
    };

    // If Payload
    if (object.data) {

        // Set Request Header
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    // Submit XHR
    request.send(object.data);

    // Processed
    return object;
};

// Simple XHR Wrapper
$.ajax = (type,url,fn) => $.xhr({

    // Path
    path: url,

    // Request
    method: type,

    // Handler
    after: fn,
});

// Simple POST Wrapper
$.post = (url,payload,fn) => $.xhr({

    // Path
    path: url,

    // Method
    method: 'POST',

    // Form Data
    data: payload,

    // Handler
    after: fn,
});

// Simple GET Wrapper
$.get = (url,fn) => $.xhr({

    // Path
    path: url,

    // Handler
    after: fn,
});
