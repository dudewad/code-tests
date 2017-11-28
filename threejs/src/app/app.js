define(['threejs', 'utils/utils', 'components/Loader', 'services/globalEventService'], function (three, utils, Loader, GlobalEvtSvc) {
    function App() {
        var that = this;

        this.scene = new three.Scene();
        this.camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
        this.renderer = new three.WebGLRenderer();
        this.loader = new Loader({element: document.getElementById('load-list')});
        this.currSurfaceTexture = new three.DataTexture(new Uint8Array([200,200,200]), 1, 1, three.RGBFormat);
        this.currSurfaceTexture.needsUpdate = true;

        this.currSurfaceMaterial = new three.MeshPhongMaterial({
            map: this.currSurfaceTexture
        });
        this.currDesktopMesh = null;

        //Camera setup
        this.camera.position.z = 5;

        var toggleList = document.getElementById('toggle-list');
        utils.delegateListener(toggleList, 'click', 'target', function(node, evt){
            var loadItem = node.dataset.target;
            var itemName = evt.target.innerText + ' Texture';

            that.loadSurfaceTexture.call(that, loadItem, itemName);
        });
        //Trigger load of first material in list
        toggleList.querySelector('a').click();


        this.initLights();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.loadSurfaceMesh();




        //TODO: Move all of this logic somewhere manageable
        var pixelsPerRevX = Math.max(window.outerWidth * .75, 600); //Distance in pixels you'd have to drag to do a full revolution
        var maxYRange = 800; //Distance in pixels you'd have to drag to do a full revolution
        var difH = 0;
        var difV = 0;
        var dragOffsetH = 0;
        var dragOffsetV = .5;
        function onDrag(evt) {
            var evtType = evt.type || evt.currentEvt.type;
            //The drag handler gets drag events, but it also gets the down/up events as well. Catch those separately
            switch (evtType) {
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
            that.currDesktopMesh.rotation.y = difH;
            that.draw();
        }

        GlobalEvtSvc.registerDragHandler(
            document.querySelector('body'),
            onDrag,
            {
                disableDrag: true,
                disableSelect: true
            }
        );
    }

    App.prototype = {
        draw: function(){
            this.renderer.render(this.scene, this.camera);
        },

        initLights: function() {
            var light;
            light = new three.PointLight(0xFFFFFF);
            light.position.set(300,300,5);
            this.scene.add(light);

            light = new three.PointLight(0xFFFFFF);
            light.position.set(-300,-300,5);
            this.scene.add(light);
        },

        loadSurfaceMesh: function() {
            this.loader.load({
                src: '/src/app/meshes/test-mesh.json',
                type: 'mesh',
                itemName: 'Cylinder'
            }).then((function (geometry) {
                this.currDesktopMesh = new three.Mesh(geometry, this.currSurfaceMaterial);
                this.scene.add(this.currDesktopMesh);
                this.currDesktopMesh.rotation.y = Math.PI;
                this.currDesktopMesh.rotation.x = .5;
                this.currDesktopMesh.position.y = -2;
                this.currDesktopMesh.position.x = 1;
                this.draw();
            }).bind(this));
        },

        loadSurfaceTexture: function(src, itemName) {
            this.loader.load({
                src: src,
                type: 'texture',
                itemName: itemName
            }).then(this.fadeNewTexture.bind(this));
        },

        fadeNewTexture: function(newTexture) {
            var that = this;
            //TODO: Make this a config parameter
            var duration = 500;
            var start = Date.now();
            var delta = 0;

            var uniforms = three.UniformsUtils.merge([
                three.UniformsLib['lights'],
                {
                    lightIntensity: {type: 'f', value: 1.0},
                    textureSampler: {type: 't', value: null}
                }
            ]);
            //Assign additional properties later because three.UniformsUtils.merge clones uniforms and cloning texturs is bad.
            uniforms.texture1 = {type: 't', value: this.currSurfaceTexture};
            uniforms.texture2 = {type: 't', value: newTexture};
            uniforms.delta = {type: 'f', value: 0};

            this.currSurfaceMaterial = new three.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShader').textContent,
                lights: true
            });

            this.currDesktopMesh.material = this.currSurfaceMaterial;

            var doFade = function () {
                delta = Math.min((Date.now() - start) / duration, 1);
                uniforms.delta.value = delta;

                //TODO: Eliminate calls to draw, and let it be handled by the animation loop if possible
                if(delta < 1) {
                    that.draw();
                    window.requestAnimationFrame(doFade);
                }
                else {
                    uniforms.delta.value = 0;
                    that.currSurfaceTexture = uniforms.texture1.value = newTexture;
                    that.draw();
                }
            };
            window.requestAnimationFrame(doFade);
        }
    };

    return App;
});