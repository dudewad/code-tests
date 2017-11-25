define([], {
    extend: function(superClass, childClass) {
        if(typeof superClass === 'function' && typeof childClass === 'function') {
            childClass.prototype = Object.create(superClass.prototype);
            childClass.prototype.constructor = childClass;
        }
        else {
            throw new Error('Could not extend class. Both superClass and childClass must be functions.');
        }
    }
});