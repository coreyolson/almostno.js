/**
 * Almost Nothing JS (AnJS)
 * Copyright (c) Corey Olson
 * Released via MIT license
 */

 // Version 0.9.6

// Closure
(function(w) {

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

    // Standard Object
    function AnJS(query) {

        // Detect query
        this.el = ( ! query ) ? 0

            // Detect "this" or Selector
            : ( typeof query === 'object' )

                // Object "this"
                ? this.el = [query]

                // Query selection
                : document.querySelectorAll(query)

        // Object
        return this;
    }

    // Iterator
    AnJS.prototype.iterator = function(element, fn) {

        // Iterate
        element.forEach(

            // Do Function
            index => fn(index)
        )
    },

    // Count Selected
    AnJS.prototype.length = function() {

        // Length
        return Array.from(this.el).length;
    },

    // Next
    AnJS.prototype.next = function() {

        // Selection
        this.el = [this.el[0].nextElementSibling];

        // Chain
        return this;
    },

    // Previous
    AnJS.prototype.prev = function() {

        // Selection
        this.el = [this.el[0].previousElementSibling];

        // Chain
        return this;
    },

    // Parent
    AnJS.prototype.parent = function() {

        // Selection
        this.el = [this.el[0].parentNode];

        // Chain
        return this;
    },

    // Children
    AnJS.prototype.children = function() {

        // Selection
        this.el = Array.from(this.el[0].children);

        // Chain
        return this;
    },

    // Siblings
    AnJS.prototype.siblings = function() {

        // Selection
        this.el = [...this.el[0].parentElement.children].filter( child => child != this.el[0] );

        // Chain
        return this;
    },

    // Ancestors
    AnJS.prototype.closest = function(ancestor) {

        // Selection
        this.el = [this.el[0].closest(ancestor)];

        // Chain
        return this;
    },

    // Insert
    AnJS.prototype.insert = function(element, placement = 'before') {

        // Translation
        var positions = {
            'before' : 'beforeBegin',
            'prepend': 'afterBegin',
            'append' : 'beforeEnd',
            'after'  : 'afterEnd'
        };

        // Iterate
        this.el.forEach(

            // Perform Insertion with Cloned Element
            target => target.insertAdjacentElement(positions[placement], element.cloneNode(true))
        );

        // Chain
        return this;
    },

    // Class Manipulator
    AnJS.prototype.class = function(name, boolean = 0) {

        // Iterate Classes
        return this.iterator( this.el, element => element.classList[ (boolean === 0)

            // Toggle w/o Boolean
            ? 'toggle' : (boolean)

            // Add (True), Remove (False)
            ? 'add' : 'remove' ](name)

        // Chain
        ) || this },

    // Display Manipulator
    AnJS.prototype.display = function(boolean) {

        // Iterate Classes
        return this.iterator( this.el, element => element.style.display = (boolean)

            // Display (True), None (False)
            ? '' : 'none'

        // Chain
        ) || this },

    // Property
    AnJS.prototype.prop = function(name, text = null, str = '') {

        // Set
        if ( text !== null ) {

            // Update
            this.iterator( this.el, i => i[name] = text );

        // Get
        } else {

            // Retrieve
            this.iterator( this.el, i => str += i[name]);

            // String
            return str;
        }

        // Chain
        return this;
    },

    // Text
    AnJS.prototype.text = function(text) {

        // Setter
        return this.prop('textContent', text);
    },

    // HTML
    AnJS.prototype.html = function(html) {

        //  Setter
        return this.prop('innerHTML', html);
    },

    // Style
    AnJS.prototype.css = function(name, attribute = null) {

        // Set
        if ( attribute ) {

            // Update All
            this.iterator( this.el, i => i.style[name] = attribute );

        // Get
        } else {

            // First Element
            return getComputedStyle(this.el[0])[name];
        }

        // Chain
        return this;
    },

    // Attributes
    AnJS.prototype.attr = function(name, value = null, remove = false) {

        // Detect
        (remove)

            // Remove Attribute
            ? this.iterator( this.el, i => i.removeAttribute(name) )

            // Set Attribute
            : ( value!==null ) ? this.iterator( this.el, i => i.setAttribute(name, value) ) : 0;

        // Get Attribute
        return this.el[0].getAttribute(name);
    },

    // Has Class
    AnJS.prototype.has = function(name) {

        // Detect
        return this.el[0].classList.contains(name);
    },

    // Event (Delegation)
    AnJS.prototype.delegate = function(event, selector, handler) {

        // Listener
        this.el[0].addEventListener(event, function(e) {

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

        // Active
        }, false);

        // Chain
        return this;
    },

    // Event (On)
    AnJS.prototype.on = function(event, mixed, handler = null) {

        // Delegate
        if (handler) {

            // Wrapper
            this.delegate(event, mixed, handler);

        // On
        } else {

            // Add Listeners
            this.iterator( this.el, i => i.addEventListener(event, mixed) );
        }

        // Chain
        return this;
    },

    // Event (Off)
    AnJS.prototype.off = function(name, handler) {

        // Remove Listeners
        this.iterator( this.el, i => i.removeEventListener(name, handler));

        // Chain
        return this;
    },

    // Trigger
    AnJS.prototype.trigger = function(type) {

        // Create Event
        var event = document.createEvent('HTMLEvents');

        // Initialize
        event.initEvent(type, true, false);

        // Dispatch
        this.iterator( this.el, index => index.dispatchEvent(event));

        // Chain
        return this;
    },

    // Empty
    AnJS.prototype.empty = function() {

        //
        Array.from(this.el[0].children).forEach(index => index.remove());
    },

    // Remove
    AnJS.prototype.remove = function() {

        //
        this.iterator( this.el, index => index.remove() );
    },

    // Filter
    AnJS.prototype.filter = function(selector) {

        // Selection
        this.el = this.el[0].parentNode.querySelectorAll(selector);

        // Chain
        return this;
    },

    // Filter: Find
    AnJS.prototype.find = function(selector) {

        // Selection
        this.el = this.el[0].querySelectorAll(selector);

        // Chain
        return this;
    },

    // Filter: First
    AnJS.prototype.first = function() {

        // Selection
        this.el = [this.el[0]];

        // Chain
        return this;
    },

    // Filter: Last
    AnJS.prototype.last = function() {

        // Selection
        this.eq(-1);

        // Chain
        return this;
    },

    // Filter: Modulo
    AnJS.prototype.modulo = function(mod, remainder, oe = []) {

        // Iterate Selection
        this.el.forEach( (v,i) => ( i % mod == remainder ) ? oe.push(v) : 0 );

        // Update Selection
        this.el = oe;

        // Chain
        return this;
    },

    // Filter: Odd
    AnJS.prototype.odd = function() {

        // Perform Filter
        this.modulo(2,0);

        // Chain
        return this;
    },

    // Filter: Even
    AnJS.prototype.even = function() {

        // Perform Filter
        this.modulo(2,1);

        // Chain
        return this;
    },

    // Filter: Nth
    AnJS.prototype.nth = function(n) {

        // Perform Filter
        this.modulo(n,n-1);

        // Chain
        return this;
    },

    // Filter: Xth
    AnJS.prototype.xth = function(x) {

        // Selection
        this.el = [this.el[x-1]];

        // Chain
        return this;
    },

    // Slice
    AnJS.prototype.slice = function(begin, end) {

        // Selection
        this.el = Array.from(this.el).slice(begin, end);

        // Chain
        return this;
    },

    // Raw Element (First of selection)
    AnJS.prototype.element = function() {

        // Single
        return this.el[0];
    },

    // Raw Element (Entire selection)
    AnJS.prototype.elements = function() {

        // Plural
        return this.el;
    },

    // Clone
    AnJS.prototype.clone = function() {

        // First element
        return this.el[0].cloneNode(true);
    },

    // Focus
    AnJS.prototype.focus = function() {

        // First element
        return this.el[0].focus();
    },

    // Blur
    AnJS.prototype.blur = function() {

        // First element
        return this.el[0].blur();
    },

    // Identifier
    AnJS.prototype.id = function(id) {

        // Convenience
        return this.prop('id', id);
    },

    // Serialize
    AnJS.prototype.serialize = function() {

        // First of selection
        return new URLSearchParams(new FormData(this.el[0])).toString();
    }

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
    $.trim = function(string) {

        // String trimmer
        return string.trim();
    };

    // Parse JSON
    $.json = function(string) {

        // Convert to JSON
        return JSON.parse(string);
    };

    // Slice
    $.slice = function(element, begin, end) {

        // Array slicer
        return element.slice(begin, end);
    };

    // Range
    $.range = function(x, min, max) {

        // Numbers between min and max
        return (x - min) * (x - max) <= 0;
    };

    // Array Check
    $.isarr = function(arr) {

        // Convenience
        return Array.isArray(arr);
    };

    // Array Within
    $.inarr = function(needle, arr) {

        // Convenience
        return $.idxof(needle, arr) >= 0;
    };

    // Array Index
    $.idxof = function(needle, arr) {

        // Convenience
        return arr.indexOf(needle);
    };

    // Extend
    $.extend = function(name, func) {

        // Attach
        $[name] = func;
    };

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
            data: null
        };

        // Apply Defaults
        for (let key in defaults) {

            // Unless object specifies...
            object[key] = (object[key]) ? object[key] : defaults[key];
        }

        // Preprocessing
        object.before();

        // Construct XHR Request
        var request = new XMLHttpRequest();

        // Send Cookies
        request.withCredentials = true;

        // XHR Request
        request.open(object.method, object.path, object.async);

        // Await Response
        request.onload = function() {

            // Response
            object.request = this;

            // Expected Response
            if ( this.status >= 200 && this.status < 400 ) {

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
    }

    // Simple XHR Wrapper
    $.ajax = (type,url,fn) => $.xhr({

        // Path
        path: url,

        // Request
        method: type,

        // Handler
        after: fn
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
        after: fn
    });

    // Simple GET Wrapper
    $.get = (url,fn) => $.xhr({

        // Path
        path: url,

        // Handler
        after: fn
    });

    // Query handling
    function $(selector) {

        // Make standard object
        return new AnJS(selector);
    }

    // Publish
    w.$ = $;

// Window
})(window);
