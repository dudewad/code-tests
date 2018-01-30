define(['threejs', 'utils/utils', 'utils/easing', 'components/Loader', 'services/globalEventService', 'objects/Desktop'],
  function (three, utils, easing, Loader, GlobalEvtSvc, Desktop) {
    var fullRev = Math.PI * 2;
    var desktopCfg = {
      width: 60,
      height: 2,
      depth: 30,
      edgeRadius: .5,
      cornerRadius: 2,
      edgeSubdivisions: 5,
      cornerSubdivisions: 5
    };

    /**
     * App configurations that need to be built:
     *
     * Camera configuration:
     *      -Initial config parameters to be used with `new three.PerspectiveCamera()`
     *          -FOV
     *          -Aspect ratio
     *          -Min frustrum clip area
     *          -Max frustrm clip area
     *      -Camera rotation zone definition
     *          -Radius min (max zoom level)
     *          -Radius max (min zoom level)
     *          -Max Height above desktop
     *          -Min Height below desktop
     *          -Rotation easing (quart, quint, etc)
     *          -Rotation lag (how long should it take to catch up)
     *      -Camera stats definition
     *          -Current position
     *          -Current Radius
     */

    function App() {
      var that = this;

      this.scene = new three.Scene();
      this.camera = new three.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        .1,
        1000
      );
      this.renderer = new three.WebGLRenderer();
      this.loader = new Loader({element: document.getElementById('load-list')});
      this.currSurfaceTexture = new three.DataTexture(
        new Uint8Array([200, 200, 200]),
        1,
        1,
        three.RGBFormat
      );
      this.currSurfaceTexture.needsUpdate = true;
      this.currentRAF = null;
      this.inputs = {
        width: document.getElementById('width-input'),
        height: document.getElementById('height-input'),
        depth: document.getElementById('depth-input')
      };

      //TODO: Set camera stats using config default params
      this.cameraStats = {
        position: {
          initial: {azimuth: 1.25, polar: 6},
          current: {azimuth: 1.25, polar: 0},
          target: undefined,
          azimuthMax: 2,
          azimuthMin: .5
        },
        radius: {
          max: 110,
          min: 35,
          initial: 75,
          current: 75,
          target: undefined
        },
        lookTarget: this.scene,
        animFrame: null
      };

      this.setCameraPosition(
        this.cameraStats.position.initial,
        this.cameraStats.radius.initial,
        true
      );

      this.currSurfaceMaterial = new three.MeshPhongMaterial({
        map: this.currSurfaceTexture
      });
      this.currDesktopMesh = null;

      var toggleList = document.getElementById('toggle-list');
      utils.delegateListener(
        toggleList,
        'click',
        'target',
        function (node, evt) {
          var loadItem = node.dataset.target;
          var itemName = evt.target.innerText + ' Texture';

          that.loadSurfaceTexture.call(that, loadItem, itemName);
        }
      );
      // Trigger load of first material in list
      toggleList.querySelector('a').click();

      this.initLights();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      this._initInputs();
      this.loadSurfaceMesh();

      // TODO: Move all of this logic somewhere manageable
      // Distance in pixels you'd have to drag to do a full revolution
      var pprPol = Math.max(window.outerWidth * .75, 600);
      // Distance in pixels you'd have to drag to do a full revolution
      var pprAz = window.outerHeight * 2.25;
      var az = 0;
      var pol = 0;
      var dragOffsetH = this.cameraStats.position.initial.polar;
      var dragOffsetV = this.cameraStats.position.initial.azimuth;
      var cPos = this.cameraStats.position;

      function onDrag(evt) {
        var evtType = evt.type || evt.currentEvt.type;
        // The drag handler gets drag events, but it also gets the down/up
        // events as well. Catch those separately
        switch (evtType) {
          case 'mouseup':
          case 'touchend':
            dragOffsetH = pol;
            dragOffsetV = az;
            return;
          case 'mousedown':
          case 'touchstart':
            return;
        }

        pol = ((evt.deltas.clientX % pprPol) / pprPol * fullRev) + dragOffsetH;
        az = ((evt.deltas.clientY % pprAz) / pprAz * fullRev) + dragOffsetV;
        //Enable azimuth limiting
        az = Math.min(Math.max(az, cPos.azimuthMin), cPos.azimuthMax);

        that.setCameraPosition({azimuth: az, polar: pol});
        that.requestDraw();
      }

      GlobalEvtSvc.registerDragHandler(
        document.querySelector('body'),
        onDrag,
        {
          disableDrag: true,
          disableSelect: true
        }
      );

      this.renderer.domElement.addEventListener('mousewheel', function (evt) {
        that.setCameraPosition(
          null,
          that.cameraStats.radius.current + (evt.deltaY * .25),
          false
        );
      });
    }

    App.prototype = {
      requestDraw: function () {
        if (this.currentRAF) {
          return;
        }
        var that = this;
        this.currentRAF = window.requestAnimationFrame(function () {
          that.camera.lookAt(that.cameraStats.lookTarget.position);
          that.renderer.render(that.scene, that.camera);
          that.currentRAF = null;
        });
      },

      /**
       * Moves the camera to the target position. Supports snapping or easing.
       * Easing will happen if snap is set to false, and can be cancelled by
       * using cameraStats.animFrame id via cancelAnimationFrame if it is set
       *
       * @param targetPos {Array}                   A 2 index array containing
       *                                            spherical angles of phi
       *                                            (azimuth) and theta (polar
       *                                            angle). Can be undefined,
       *                                            which will leave the current
       *                                            orientation alone (it will
       *                                            continue easing if easing
       *                                            is still happening at the
       *                                            time of a radius change)
       *
       * @param radius    {int}                     The distance from the center
       *                                            to move the camera to. Can
       *                                            be undefined, and zoom
       *                                            easing will still work
       *
       * @param snap      {boolean}   [undefined]   Whether to snap to the
       *                                            target position. Defaults to
       *                                            false. If false, this will
       *                                            ease the camera position pe
       *                                            config props
       */
      setCameraPosition: function (targetPos, radius, snap) {
        var that = this;
        var cS = this.cameraStats;
        var cPos = cS.position;
        var cRad = cS.radius;
        cPos.target = targetPos || cPos.target || cPos.current;
        cRad.target = radius || cRad.target || cRad.current;
        var targetAz = cPos.target.azimuth;
        var targetPol = cPos.target.polar;
        var targetRad = cRad.target;
        var cam = this.camera;
        var spherical = new three.Spherical();
        var ease = .09;
        var easeCutoff = .0125;
        var currAz, currPol, currRad, newAz, newPol, newRad;

        window.cancelAnimationFrame(cS.animFrame);
        //Radius limiting
        targetRad = Math.max(cRad.min, Math.min(cRad.max, targetRad));

        //Handle snap-to changes. Simple, requires no additional calculation
        if (snap) {
          cPos.current = targetPos;
          cS.radius.current = targetRad;
          cam.position.setFromSpherical(
            spherical.set(targetRad, targetAz, targetPol)
          );
          this.requestDraw();
          return;
        }

        //Handle eased camera position changes next
        cS.animFrame = window.requestAnimationFrame(function anim() {
          currAz = cPos.current.azimuth;
          currPol = cPos.current.polar;
          currRad = cRad.current;

          newAz = currAz + ((targetAz - currAz) * ease);
          newPol = currPol + ((targetPol - currPol) * ease);
          newRad = currRad + ((targetRad - currRad) * ease);

          cPos.current.azimuth = newAz;
          cPos.current.polar = newPol;
          cRad.current = newRad;

          cam.position.setFromSpherical(spherical.set(newRad, newAz, newPol));

          that.requestDraw();

          if (Math.abs(targetAz - currAz) > easeCutoff
            || Math.abs(targetPol - currPol) > easeCutoff
            || Math.abs(radius - currRad) > easeCutoff) {
            cS.animFrame = window.requestAnimationFrame(anim);
          }
          else {
            cPos.target = cRad.target = undefined;
          }
        });
      },

      initLights: function () {
        var light;
        light = new three.PointLight(0xFFFFFF);
        light.position.set(300, 300, 100);
        this.scene.add(light);

        light = new three.PointLight(0xFFFFFF);
        light.position.set(-300, -300, -100);
        this.scene.add(light);

        light = new three.AmbientLight(0xFF9900);
        this.scene.add(light);
      },

      loadSurfaceMesh: function () {
        this.loader.load({
          src: '/src/app/meshes/test-mesh.json',
          type: 'mesh',
          itemName: 'Cylinder'
        }).then((function (geometry) {
          this.desktopObj = new Desktop(desktopCfg);
          var axesHelper = new three.AxesHelper(5);
          this.scene.add(axesHelper);
          var m = this.currDesktopMesh
            = this.desktopObj.getMesh(this.currSurfaceMaterial);
          this.scene.add(m);
          this.cameraStats.lookTarget = m;
          this.requestDraw();
        }).bind(this));
      },

      loadSurfaceTexture: function (src, itemName) {
        this.loader.load({
          src: src,
          type: 'texture',
          itemName: itemName
        }).then(this.fadeNewTexture.bind(this));
      },

      fadeNewTexture: function (newTexture) {
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
        // Assign additional properties later because three.UniformsUtils.merge
        // clones uniforms and cloning textures is bad.
        uniforms.texture1 = {type: 't', value: this.currSurfaceTexture};
        uniforms.texture2 = {type: 't', value: newTexture};
        uniforms.delta = {type: 'f', value: 0};

        this.currSurfaceMaterial = new three.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: document.getElementById('vertexShader').textContent,
          fragmentShader: document.getElementById('fragmentShader').textContent,
          lights: true
        });

        // To use this, the mesh needs to be changed from type of three.Mesh
        // to three.Points (this is done in the getMesh function of the Desktop
        // model file)
        /*this.currDesktopMesh.material = new three.PointsMaterial({
          size: .0125,
          color: 0x0080ff
        });*/
        // this.currDesktopMesh.material = new three.LineBasicMaterial({
        //   linewidth: 1,
        //   color: 0x0080ff
        // });
        this.currDesktopMesh.material = this.currSurfaceMaterial;

        var doFade = function () {
          delta = Math.min((Date.now() - start) / duration, 1);
          uniforms.delta.value = delta;

          if (delta < 1) {
            that.requestDraw();
            window.requestAnimationFrame(doFade);
          }
          else {
            uniforms.delta.value = 0;
            that.currSurfaceTexture = uniforms.texture1.value = newTexture;
            that.requestDraw();
          }
        };
        window.requestAnimationFrame(doFade);
      },

      _initInputs: function () {
        var el;

        for (var k in this.inputs) {
          if (this.inputs.hasOwnProperty(k)) {
            el = this.inputs[k];
            el.addEventListener(
              'change',
              this._onInputChange.bind(this)
            );
            switch(el.dataset.param) {
              case 'width':
                el.value = desktopCfg.width;
                break;
              case 'height':
                el.value = desktopCfg.height;
                break;
              case 'depth':
                el.value = desktopCfg.depth;
                break;
            }
          }
        }
      },

      _onInputChange: function (evt) {
        var el = evt.target;
        var val = el.value;

        //Need mesh available before handling any changes
        if (!this.currDesktopMesh) {
          return;
        }

        switch (el.dataset.param) {
          case 'width':
            this.desktopObj.setWidth(val);
            break;
          case 'height':
            this.desktopObj.setHeight(val);
            break;
          case 'depth':
            this.desktopObj.setDepth(val);
            break;
        }

        this.requestDraw();
      }
    };

    return App;
  });