requirejs.config({
    baseUrl: 'src',
    //Paths, AKA aliases - Loaded relative to baseUrl
    paths: {
        app: 'app',
        lib: 'lib',
        utils: 'utils'
    },
    //Caching is a problem... this fixes that
    urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(['app/App', 'app/services/globalEventService'], function (App, GlobalEvtSvc) {

});