requirejs.config({
    baseUrl: 'src',
    //Paths, AKA aliases - Loaded relative to baseUrl
    paths: {
        app: 'app',
        lib: 'lib',
        utils: 'app/utils',
        components: 'app/components',
        services: 'app/services',
        threejs: 'lib/three.min'
    },
    //Caching is a problem... this fixes that
    urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(['app/App'], function (App) {
    new App();
});