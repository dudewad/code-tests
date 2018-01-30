define([], function() {
    return {

        /**
         * @param t     {int}       Current time
         * @param b     {float}     Start value
         * @param c     {float}     Target value
         * @param d     {int}       Duration
         * @returns {*}
         */
        easeInOutQuad: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },

        /**
         * @param t     {int}       Current time
         * @param b     {float}     Start value
         * @param c     {float}     Target value
         * @param d     {int}       Duration
         * @returns {*}
         */
        easeInOutQuint: function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            t -= 2;
            return c / 2 * (t * t * t * t * t + 2) + b;
        }
    }
});