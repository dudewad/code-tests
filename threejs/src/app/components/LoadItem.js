define(['threejs', 'components/AsyncTextureLoader'], function(three, AsyncTextureLoader) {
    function LoadItem(cfg) {
        this.cfg = cfg.itemCfg;

        this.cfg.itemName = this.cfg.itemName || 'item';

        this.outerEl = document.createElement('div');
        this.progBar = document.createElement('div');
        this.status = document.createElement('p');

        this.outerEl.classList.add('load-item');
        this.progBar.classList.add('progress');
        this.status.classList.add('status');

        this.outerEl.appendChild(this.progBar);
        this.outerEl.appendChild(this.status);

        this.setPercentage(0);
    }

    LoadItem.prototype = {
        getElement: function() {
            return this.outerEl;
        },

        load: function() {
            var that = this;
            var cfg = this.cfg;
            var type = cfg.type;
            var loader;

            return new Promise(function(resolve, reject) {
                switch (type) {
                    case 'mesh':
                        loader = new three.JSONLoader();
                        loader.load(
                            cfg.src,
                            function (geometry, materials) {
                                that.setPercentage(100);
                                resolve(geometry);
                            },
                            that.onProgress.bind(that),
                            function(err) {
                                reject(err);
                            });
                        break;
                    case 'texture':
                        loader = new AsyncTextureLoader();
                        loader.load(
                            cfg.src,
                            function (texture) {
                                that.setPercentage(100);
                                resolve(texture);
                            },
                            that.onProgress.bind(that),
                            function (err) {
                                reject(err);
                            });

                        break;

                    default:
                        reject(new Error('Can\'t load item: Unknown load type.'));
                        break
                }
            });
        },

        /**
         * Expects an XHR progress event
         * @param evt   {Event}
         */
        onProgress: function (evt) {
            this.setPercentage(evt.loaded / evt.total * 100);
        },

        setPercentage: function (p) {
            var percentage = parseInt(p);
            if(p === -1) {
                percentage = 'Aborted!';
            }
            else {
                percentage = percentage + '%';
            }
            this.status.innerText = 'Loading ' + this.cfg.itemName + '... ' + percentage;
            this.progBar.style.width = percentage;
        },

        destroy: function() {
            this.outerEl.remove();
        }
    };

    return LoadItem;
});