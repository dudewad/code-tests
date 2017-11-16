requirejs.config({
    baseUrl: 'src',
    //Paths, AKA aliases - Loaded relative to baseUrl
    paths: {
        app: 'app',
        lib: 'lib',
        utils: 'utils',
        'lib/gl-matrix': 'lib/gl-matrix.min'
    },
    //Caching is a problem... this fixes that
    urlArgs: "bust=" + (new Date()).getTime()
});

// Start the main app logic.
requirejs(['app/App', 'app/services/globalEventService'], function (App, GlobalEvtSvc) {
    var canvas = document.querySelector('canvas');
    var app = new App();

    app.setColorBuffer([
        30, 150, 280,
        30, 150, 280,
        30, 150, 280,
        30, 150, 280,
        30, 150, 280,
        30, 150, 280,
        150, 50, 160,
        150, 50, 160,
        150, 50, 160,
        150, 50, 160,
        150, 50, 160,
        150, 50, 160,
        220, 70, 120,
        220, 70, 120,
        220, 70, 120,
        220, 70, 120,
        220, 70, 120,
        220, 70, 120,
        50, 250, 200,
        50, 250, 200,
        50, 250, 200,
        50, 250, 200,
        50, 250, 200,
        50, 250, 200,
        90, 120, 240,
        90, 120, 240,
        90, 120, 240,
        90, 120, 240,
        90, 120, 240,
        90, 120, 240,
        170, 240, 80,
        170, 240, 80,
        170, 240, 80,
        170, 240, 80,
        170, 240, 80,
        170, 240, 80
    ]);

    var settings = {
        front: .5,
        back: -.5,
        top: .025,
        right: 1,
        bottom: -.025,
        left: -1,
        w: 1,
        rotateX: .5,
        rotateY: 0
    };

    var lastFrame = 0;
    var rotationDif = 0;
    var rotationSpeed = .25; //Rotation speed in Rad/sec

    function animate() {
        window.requestAnimationFrame(function (now) {
            rotationDif = (now - lastFrame) * .001;
            settings.rotate += rotationDif * 2 * Math.PI * rotationSpeed;
            app.draw(settings);
            lastFrame = now;
            animate();
        });
    }


    var pixelsPerRevX = Math.max(window.outerWidth * .75, 600); //Distance in pixels you'd have to drag to do a full revolution
    var maxYRange = 800; //Distance in pixels you'd have to drag to do a full revolution
    var difH = 0;
    var difV = 0;
    var dragOffsetH = 0;
    var dragOffsetV = .5;

    function onDrag(evt) {
        var evtType = evt.type || evt.currentEvt.type;
        //The drag handler gets drag events, but it also gets the down/up events as well. Catch those separately
        switch(evtType) {
            case 'mouseup':
            case 'touchend':
                dragOffsetH = difH;
                dragOffsetV = difV;
                return;
            case 'mousedown':
            case 'touchstart':
                return;
        }

        difH = (-(evt.deltas.clientX % pixelsPerRevX) / pixelsPerRevX * Math.PI * 2) + dragOffsetH;
        difV = (-(evt.deltas.clientY % maxYRange) / maxYRange * Math.PI * 2) + dragOffsetV;
        settings.rotateY = difH;
        settings.rotateX = difV;
        app.draw(settings);
    }

    GlobalEvtSvc.registerDragHandler(
        canvas,
        onDrag,
        {
            disableDrag: true,
            disableSelect: true
        }
    );

    app.draw(settings);
});