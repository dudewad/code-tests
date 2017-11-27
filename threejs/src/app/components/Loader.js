define(['threejs', 'components/LoadItem'], function (three, LoadItem) {

    /**
     * @param cfg
     *          cfg.src     {string}        The string for the source of the item to load
     *          cfg.type    {string}
     *
     * @constructor
     */
    function Loader(cfg) {
        this.element = cfg.element;

        three.Cache.enabled = true;
    }

    Loader.prototype = {
        load: function (itemCfg) {
            var that = this;
            var cfg = {
                parent: this.element,
                itemCfg: itemCfg
            };
            var item = new LoadItem(cfg);
            var promise;

            this.element.appendChild(item.getElement());
            promise = item.load();

            promise.then(function() {
                that.onComplete(item);
            });

            return promise;
        },

        abort: function () {

        },

        onComplete: function (item) {
            var that = this;
            var el = item.getElement();

            window.setTimeout(function() {
                el.style.opacity = 0;
                window.setTimeout(function() {
                    that.destroyItem(item);
                }, 1000);
            }, 1000);
        },

        destroyItem: function(item) {
            item.destroy();
        }
    };

    return Loader;
});