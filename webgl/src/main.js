requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'src',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: 'app',
        lib: 'lib',
        utils: 'utils',
        'lib/gl-matrix': 'lib/gl-matrix.min'
    }
});

// Start the main app logic.
requirejs(['app/App'], function (App) {
    let app = new App();


    app.draw({
        top: .75,
        right: .75,
        bottom: -.25,
        left: -.25,
        w: 1,

        depth: -.5,
        color: [0.4, 1, 0.4, 1]
    });

    app.draw({
        top: .75,
        right: .75,
        bottom: -.25,
        left: -.55,
        w: 1,

        depth: -.75,
        color: [0.4, 0.4, 1, 1]
    });

    app.draw({
        top: .15,
        right: .5,
        bottom: -.5,
        left: -.5,
        w: 1,

        depth: 0,
        color: [1, 0.4, 0.4, 1]
    });
});