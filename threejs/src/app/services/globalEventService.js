/**
 * globalEvents
 */
define([], function () {

    var _dragHandlers = {};
    var _dragHandlerID = 0;

    var _resizeHandlers = [];
    var _resizeHandlerID = 0;
    var _resizeTimeout = null;
    var _lastResizeEvent = null;

    var _scrollHandlers = [];
    var _scrollHandlerID = 0;
    var _pendingScrollHandlers = false;
    var _lastScrollEvent = null;

    var _pointerMoveHandlers = [];
    var _pointerMoveHandlerID = 0;
    var _pendingPointerMoveHandlers = false;
    var _lastPointerEvent = null;

    var _body = document.querySelector('body');

    var _debugMode = false;

    /**
     * Registers a handler to perform when window.resize occurs. This should be the single point globally where resize
     * events are handled.
     *
     * @param handler   {function}      The handler function to be executed on window.resize
     *
     * @returns {int}                   Returns an integer ID number of the handler to be called with the
     *                                   unregisterResizeHandler() method so it knows what to unregister.
     */
    function registerResizeHandler(handler) {
        var h = _ResizeHandlerInstance(handler);
        _resizeHandlers.push(h);
        //When adding the first listener, add the window.onresize handler
        _resizeHandlers.length === 1 && window.addEventListener('resize', _resizeHandler);
        return h.id;
    }

    /**
     * Registers a handler to perform when window.onscroll occurs. This should be the single point globally where scroll
     * events are handled.
     *
     * @param handler   {function}      The handler function to be executed on window.onscroll
     *
     * @returns {int}                   Returns an integer ID number of the handler to be called with the
     *                                   unregisterScrollHandler() method so it knows what to unregister.
     */
    function registerScrollHandler(handler) {
        var h = _ScrollHandlerInstance(handler);
        _scrollHandlers.push(h);
        //When adding the first listener, add the window.scroll handler
        _scrollHandlers.length === 1 && window.addEventListener('scroll', _scrollHandler);
        return h.id;
    }

    /**
     * Registers a pointer handler to perform when body.onmousemove or body.touchmove occurs. This should be the
     * single point globally where body-only mousemove/touchmove events are handled.
     * Should be used sparingly, obviously.
     *
     * @param handler   {function}      The handler function to be executed on body.onmousemove or body.ontouchmove
     *
     * @returns {int}                   Returns an integer ID number of the handler to be called with the
     *                                   unregisterPointerMoveHandler() method so it knows what to unregister.
     */
    function registerPointerMoveHandler(handler) {
        var h = _PointerMoveHandlerInstance(handler);
        _pointerMoveHandlers.push(h);
        //When adding the first listener, add the global handlers
        if(_pointerMoveHandlers.length === 1) {
            _body.addEventListener('mousemove', _pointerMoveHandler);
            _body.addEventListener('touchmove', _pointerMoveHandler);
        }
        return h.id;
    }

    /**
     * Unregister a resize handler with a given ID
     *
     * @param id    {int}               The ID of the resize handler to unregister, given by the return value of the
     *                                  registerResizeHandler() method.
     */
    function unregisterResizeHandler(id) {
        for (var i = 0; i < _resizeHandlers.length; i++) {
            var h = _resizeHandlers[i];
            if (h.id === id) {
                _resizeHandlers.splice(i, 1);
                break;
            }
        }
        //When unregistering the last handler, remove the window.onresize handler
        !_resizeHandlers.length && window.removeEventListener('resize', _resizeHandler);
    }

    /**
     * Unregister a scroll handler with a given ID
     *
     * @param id    {int}               The ID of the scroll handler to unregister, given by the return value of the
     *                                   registerScrollHandler() method.
     */
    function unregisterScrollHandler(id) {
        for (var i = 0; i < _scrollHandlers.length; i++) {
            var h = _scrollHandlers[i];
            if (h.id === id) {
                _scrollHandlers.splice(i, 1);
                break;
            }
        }
        //When unregistering the last handler, remove the window.onscroll handler
        !_scrollHandlers.length && window.removeEventListener('scroll', _scrollHandler);
    }

    /**
     * Unregister a pointer move handler with a given ID
     *
     * @param id    {int}               The ID of the pointer move handler to unregister, given by the return value of
     *                                   the registerPointerMoveHandler() method.
     */
    function unregisterPointerMoveHandler(id) {
        for (var i = 0; i < _pointerMoveHandlers.length; i++) {
            var h = _pointerMoveHandlers[i];
            if (h.id === id) {
                _pointerMoveHandlers.splice(i, 1);
                break;
            }
        }
        //When unregistering the last handler, remove the global handler
        if(!_pointerMoveHandlers.length) {
            _body.removeEventListener('mousemove', _pointerMoveHandler);
            _body.removeEventListener('touchmove', _pointerMoveHandler);
        }
    }

    /**
     * Requests that all scroll handlers be called. The reason this is a 'request' is because to stay performant it's
     * wrapped in a window.rAF call and may not fire listeners if a pending call is waiting to occur.
     *
     * @private
     */
    function _scrollHandler(e) {
        _lastScrollEvent = e;

        if (!_pendingScrollHandlers) {
            window.requestAnimationFrame(_callScrollHandlers);
        }
        _pendingScrollHandlers = true;
    }

    /**
     * Calls all scroll handlers and sets the last scrollEvent to null.
     *
     * @private
     */
    function _callScrollHandlers() {
        _log('Scroll Handler Called');
        for (var i = 0; i < _scrollHandlers.length; i++) {
            (_scrollHandlers[i].handler)(_lastScrollEvent);
        }
        _pendingScrollHandlers = false;
        _lastScrollEvent = null;
    }

    /**
     * Handle a resize event, if applicable. Won't fire until the user is 'done' resizing the window (meaning they've
     * not caused a resize event to occur in over 150ms).
     *
     * @private
     */
    function _resizeHandler(e) {
        window.clearTimeout(_resizeTimeout);
        _lastResizeEvent = e;

        //If user stops resizing, call all handlers passing the last resize event, and then set it to null.
        _resizeTimeout = window.setTimeout(function () {
            for (var i = 0; i < _resizeHandlers.length; i++) {
                (_resizeHandlers[i].handler)(_lastResizeEvent);
            }
            _lastResizeEvent = null;
        }, 150);
    }

    /**
     * Requests that all pointer move handlers be called. The reason this is a 'request' is because to stay performant
     * it's wrapped in a window.rAF call and may not fire listeners if a pending call is waiting to occur.
     *
     * @private
     */
    function _pointerMoveHandler(e) {
        _lastPointerEvent = e;

        if (!_pendingPointerMoveHandlers) {
            window.requestAnimationFrame(_callPointerMoveHandlers);
        }
        _pendingPointerMoveHandlers = true;
    }

    /**
     * Calls all pointer move handlers
     *
     * @private
     */
    function _callPointerMoveHandlers() {
        _log('Pointer Move Handler Called');
        for (var i = 0; i < _pointerMoveHandlers.length; i++) {
            (_pointerMoveHandlers[i].handler)(_lastPointerEvent);
        }
        _pendingPointerMoveHandlers = false;
        _lastPointerEvent = null;
    }

    /**
     * Creates a _ResizeHandlerInstance object, to track ID and handler function.
     *
     * @param handler   {function}          The function to be executed as a handler
     * @returns {{id: number, handler: function}}
     * @throws {Error}    Will throw an error if the passed handler is not a function
     * @constructor
     */
    function _ResizeHandlerInstance(handler) {
        //Requires a function for handler
        if (typeof handler !== 'function') {
            throw new Error('Cannot create _ResizeHandlerInstance. Handler must be a function.');
        }

        return {
            id: ++_resizeHandlerID,
            handler: handler
        };
    }

    /**
     * Creates a _ScrollHandlerInstance object, to track ID and handler function.
     *
     * @param handler   {function}          The function to be executed as a handler
     * @returns {{id: number, handler: function}}
     * @throws {Error}    Will throw an error if the passed handler is not a function
     * @private
     */
    function _ScrollHandlerInstance(handler) {
        //Requires a function for handler
        if (typeof handler !== 'function') {
            throw new Error('Cannot create _ScrollHandlerInstance. Handler must be a function.');
        }

        return {
            id: ++_scrollHandlerID,
            handler: handler
        };
    }

    /**
     * Creates a _PointerMoveHandlerInstance object, to track ID and handler function.
     *
     * @param handler   {function}              The function to be executed as a handler
     * @returns {{id: number, handler: function}}
     * @throws {Error}    Will throw an error if the passed handler is not a function
     * @private
     */
    function _PointerMoveHandlerInstance(handler) {
        //Requires a function for handler
        if (typeof handler !== 'function') {
            throw new Error('Cannot create _PointerMoveHandlerInstance. Handler must be a function.');
        }

        return {
            id: ++_pointerMoveHandlerID,
            handler: handler
        };
    }

    /**
     * Creates a _dragHandlerInstance object, to track ID, element, and handler function.
     *
     * @param handler   {function}              The function to be executed as a handler
     * @param el        {HTMLElement}           A reference to the HTML DOM element that this listener applies to
     * @returns {{id: number, handler: function}}
     * @throws {Error}    Will throw an error if the passed handler is not a function
     * @private
     */
    function _dragHandlerInstance(handler, el) {
        //Requires a function for handler
        if (typeof handler !== 'function') {
            throw new Error('Cannot create _PointerMoveHandlerInstance. Handler must be a function.');
        }
        if(!el) {
            throw new Error('Cannot create _DragHandlerInstance')
        }

        return {
            id: ++_dragHandlerID,
            handler: handler,
            element: el,
            handlers: {}
        };
    }

    /**
     * Registers a drag handler, which includes pointerdown and pointerup. This wraps the mousemove handler as well, and
     * calls coming from the mousemove handler are wrappd by the internally generated handler here. These are passed as
     * an object containing the current drag event as well as the initial one, making finding deltas much easier.
     *
     *
     * @param el                    {HTMLElement}   The HTML element to add the listener to
     * @param handler               {function}      The callback handler function to receive the drag events
     * @param opts                  {object}
     *        [opts.disableDrag]    {boolean}       Whether to kill the dragStart event to avoid element dragging while
     *                                              dragging. Defaults to false, but this will likely resolve a lot of
     *                                              UI and functional issues (for instance, the standard HTML ghost
     *                                              image drag)
     *
     *        [opts.disableSelect]  {boolean}       Whether to kill the selectstart event to avoid page selection while
     *                                              dragging. Defaults to false, but this will likely resolve a lot of
     *                                              UI and functional issues, namely selection-related
     * @returns {string|number|*}
     */
    function registerDragHandler(el, handler, opts) {
        opts = opts || {};

        var moveHandlerId;
        var h = new _dragHandlerInstance(handler, el);
        var initialEvt = null;
        var disableDrag = opts.disableDrag !== false;
        var disableSelect = opts.disableSelect !== false;

        _dragHandlers[h.id] = h;

        var dragHandler = function(evt) {
            _log('Drag Handler Called');

            var deltaCX;
            var deltaCY;
            var deltaSX;
            var deltaSY;

            if(!initialEvt) {
                initialEvt = evt;
            }

            if(evt.touches) {
                var tInitial = initialEvt.touches[0];
                var tCurr = evt.touches[0];
                deltaCX = tInitial.clientX - tCurr.clientX;
                deltaCY = tInitial.clientY - tCurr.clientY;
                deltaSX = tInitial.screenX - tCurr.screenX;
                deltaSY = tInitial.screenY - tCurr.screenY;
            }
            else {
                deltaCX = initialEvt.clientX - evt.clientX;
                deltaCY = initialEvt.clientY - evt.clientY;
                deltaSX = initialEvt.screenX - evt.screenX;
                deltaSY = initialEvt.screenY - evt.screenY;
            }

            handler({
                deltas: {
                    clientX: deltaCX,
                    clientY: deltaCY,
                    screenX: deltaSX,
                    screenY: deltaSY
                },
                initialEvt: initialEvt,
                currentEvt: evt
            });
        };
        //Need this in case the user mouse-ups outside the browser window (can happen on desktops, for instance)
        function clearListeners() {
            if(moveHandlerId !== null) {
                unregisterPointerMoveHandler(moveHandlerId);
            }
            _body.removeEventListener('mouseup', mouseupHandler);
            _body.removeEventListener('touchend', mouseupHandler);
            _body.removeEventListener('dragstart', _cancelEvent);
            _body.removeEventListener('selectstart', _cancelEvent);
            moveHandlerId = null;
        }
        //Nested handlers to allow for easier scope manipulation!
        function mousedownHandler(evt) {
            handler(evt);
            clearListeners(dragHandler);
            _body.addEventListener('mouseup', mouseupHandler);
            _body.addEventListener('touchend', mouseupHandler);
            if (disableDrag) {
                _body.addEventListener('dragstart', _cancelEvent);
            }
            if (disableSelect) {
                _body.addEventListener('selectstart', _cancelEvent);
            }
            moveHandlerId = registerPointerMoveHandler(dragHandler);
            initialEvt = null;
        }
        function mouseupHandler(evt) {
            handler(evt);
            clearListeners(dragHandler);
        }

        el.addEventListener('mousedown', mousedownHandler);
        el.addEventListener('touchstart', mousedownHandler);
        h.handlers.mousedown = mousedownHandler;

        return h.id;
    }

    /**
     * Unregisters a drag handler for a given element
     *
     * @param id        {int}                   The id of the handler to remove, returned by a registerDragHandler call
     */
    function unregisterDragHandler(id) {
        var handler = _dragHandlers[id];

        if(handler) {
            var el = handler.element;

            el.removeEventListener('mousedown', handler.handlers.mousedown);
            el.removeEventListener('touchstart', handler.handlers.mousedown);
            delete _dragHandlers[id];
        }
    }

    /**
     * Turns on/off debugging mode. This will make the service verbose on the console.
     *
     * @param active {boolean}      Can be any value that equates to true or false. Truthy values turn it on, falsey
     *                              values turn it off.
     */
    function debugMode(active) {
        _debugMode = !!active;
    }

    /**
     * Log with debug levels. Requires debugMode to be enabled.
     *
     * @param msg   {string}    The debug message to log
     * @private
     */
    function _log(msg) {
        if(_debugMode) {
            console.log(msg);
        }
    }

    function _cancelEvent(evt) {
        evt.preventDefault();
        return false;
    }

    return {
        registerResizeHandler: registerResizeHandler,
        registerScrollHandler: registerScrollHandler,
        registerPointerMoveHandler: registerPointerMoveHandler,
        unregisterResizeHandler: unregisterResizeHandler,
        unregisterScrollHandler: unregisterScrollHandler,
        unregisterPointerMoveHandler: unregisterPointerMoveHandler,
        registerDragHandler: registerDragHandler,
        unregisterDragHandler: unregisterDragHandler,
        debugMode: debugMode
    };
});