/**
 * Loads three Textures with progress events
 * @augments three.TextureLoader
 */
define(['threejs'], function(three) {
    function AsyncTextureLoader() {
        /**
         * three's texture loader doesn't support onProgress events, because it uses image tags under the hood.
         *
         * A relatively simple workaround is to AJAX the file into the cache with a FileLoader, create an image from the Blob,
         * then extract that into a texture with a separate TextureLoader call.
         *
         * The cache is in memory, so this will work even if the server doesn't return a cache-control header.
         */

        var cache = three.Cache;

        // Turn on shared caching for FileLoader, ImageLoader and TextureLoader
        cache.enabled = true;

        var textureLoader = new three.TextureLoader();
        var fileLoader = new three.FileLoader();
        fileLoader.setResponseType('blob');

        function load(url, onLoad, onProgress, onError) {
            var cached = cache.get(url);

            if (cached) {
                loadImageAsTexture(url);
            }
            else {
                fileLoader.load(url, cacheImage, onProgress, onError);
            }

            /**
             * The cache is currently storing a Blob, but we need to cast it to an Image
             * or else it won't work as a texture. TextureLoader won't do this automatically.
             */
            function cacheImage(blob) {
                // ObjectURLs should be released as soon as is safe, to free memory
                var objUrl = URL.createObjectURL(blob);
                var img = document.createElement('img');

                img.onload = function() {
                    cache.add(url, img);
                    URL.revokeObjectURL(objUrl);
                    loadImageAsTexture(url);
                };
                img.src = objUrl;
            }

            function loadImageAsTexture(url) {
                textureLoader.load(url, onLoad, function() {}, onError);
            }
        }

        return Object.assign({}, textureLoader, {load: load});
    }

    return AsyncTextureLoader;
});
