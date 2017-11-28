define([], function() {
    return {
        /**
         * Delegates some event to some child descendant with the given data attribute. Calls the callback with the
         * targeted node, and the original event.
         *
         * @param el        {HTMLElement}       The element to apply the listener to
         * @param evtType   {string}            The event name
         * @param attr      {string}            The data attribute to look for on descendants
         * @param callback  {function}          The callback function to call when the event is fired and finds a
         *                                      matching delegate. Passes the found node as well as the original event
         *
         * @returns         {function}          A de-registration function. This will allow the caller to remove the
         *                                      event listener
         */
        delegateListener: function(el, evtType, attr, callback) {
            var rmCallback = function (evt) {
                var node = evt.target;
                var hasTarget;

                while (node !== el && !hasTarget) {
                    if (node.dataset[attr]) {
                        callback(node, evt);
                        return;
                    }
                    node = node.parentNode;
                }
            };

            el.addEventListener(evtType, rmCallback);

            return function () {
                el.removeEventListener(evtType, rmCallback);
            };
        }
    }
});