define(['threejs', 'components/Loader'], function (three, Loader) {
    function App() {
        var that = this;

        this.scene = new three.Scene();
        this.camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
        this.renderer = new three.WebGLRenderer();
        this.loader = new Loader({element: document.getElementById('load-list')});
        this.currSurfaceMaterial = new three.MeshPhongMaterial({
            color: 0x0099FF
        });
        this.currDesktopMesh = null;

        //Camera setup
        this.camera.position.z = 5;

        var toggleList = document.getElementById('toggle-list');
        toggleList.addEventListener('click', function(evt){
            var node = evt.target;
            var loadItem;
            var itemName = evt.target.innerText + ' Texture';

            while(node !== toggleList && !loadItem) {
                loadItem = node.dataset.target;
                node = node.parentNode;
            }

            that.loader.load({
                src: loadItem,
                type: 'texture',
                itemName: itemName
            }).then(function(texture) {
                that.currSurfaceMaterial = new three.MeshPhongMaterial({
                    map: texture
                });
                that.currDesktopMesh.material = that.currSurfaceMaterial;
                that.renderer.render(that.scene, that.camera);
            })
        });


        this.initLights();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        that.loader.load({
            src: '/src/app/meshes/test-mesh.json',
            type: 'mesh',
            itemName: 'Cylinder'
        }).then(function (geometry) {
            that.currDesktopMesh = new three.Mesh(geometry, that.currSurfaceMaterial);
            that.scene.add(that.currDesktopMesh);
            that.currDesktopMesh.rotation.y = Math.PI;
            that.currDesktopMesh.rotation.x = .5;
            that.currDesktopMesh.position.y = -2;
            that.currDesktopMesh.position.x = 1;
        });
    }

    App.prototype = {
        initLights: function() {
            var light;
            light = new three.PointLight(0xFFFFFF);
            light.position.set(300,300,5);
            this.scene.add(light);

            light = new three.PointLight(0xFFFFFF);
            light.position.set(-300,-300,5);
            this.scene.add(light);
        },

        onSurfaceMaterialUpdate: function() {
            this.currDesktopMesh.material = this.currSurfaceMaterial;
        }
    };

    return App;
});