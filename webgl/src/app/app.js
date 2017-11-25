define(['lib/gl-matrix', 'utils/webgl-utils', 'app/scenes/DesktopConfigurator_scn'], function (glMatrix, glUtils, Scene) {
    var mat4 = glMatrix.mat4;
    var scene = new Scene();

    function App() {
        this.canvas = document.querySelector('#canvas');
        var gl = this.gl = glUtils.getGLContext(this.canvas);
        gl.getExtension('EXT_texture_filter_anisotropic');
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.glProgram = glUtils.createAndLinkProgram(gl, {
            fShader: document.querySelector('#fragment-shader').innerHTML,
            vShader: document.querySelector('#vertex-shader').innerHTML
        });

        gl.useProgram(this.glProgram);

        this.programInfo = {
            attrLocs: {
                position: gl.getAttribLocation(this.glProgram, 'position'),
                color: gl.getAttribLocation(this.glProgram, 'a_color'),
                texCoord: gl.getAttribLocation(this.glProgram, 'a_texCoord')
            },
            uniformLocs: {
                modelViewMatrix: gl.getUniformLocation(this.glProgram, 'uModelViewMatrix'),
                projectionMatrix: gl.getUniformLocation(this.glProgram, 'uProjectionMatrix')
            }
        };
        this.buffers = {};

        var buffer = gl.createBuffer();
        var texCoordLoc = this.programInfo.attrLocs.texCoord;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(texCoordLoc);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        this.setTexCoords();

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        var image = new Image();
        var that = this;
        image.src = "asset/wood.png";
        image.addEventListener('load', function () {
            // Now that the image has loaded copy it to the texture.
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            that.draw();
        });

        gl.enable(gl.DEPTH_TEST);
    }

    App.prototype = {
        draw: function (settings) {
            if (!settings) {
                settings = this.lastSettings;
            }
            this.lastSettings = settings;
            glUtils.resize(this.gl, this.canvas);

            var gl = this.gl;
            var attrs = this.programInfo.attrLocs;
            var unis = this.programInfo.uniformLocs;
            var buffer = gl.createBuffer();
            var data = new Float32Array([
                //Front 1
                settings.left, settings.top, settings.front, settings.w,
                settings.left, settings.bottom, settings.front, settings.w,
                settings.right, settings.top, settings.front, settings.w,

                //Front 2
                settings.left, settings.bottom, settings.front, settings.w,
                settings.right, settings.bottom, settings.front, settings.w,
                settings.right, settings.top, settings.front, settings.w,

                //Left 1
                settings.left, settings.top, settings.back, settings.w,
                settings.left, settings.bottom, settings.back, settings.w,
                settings.left, settings.top, settings.front, settings.w,

                //Left 2
                settings.left, settings.bottom, settings.back, settings.w,
                settings.left, settings.bottom, settings.front, settings.w,
                settings.left, settings.top, settings.front, settings.w,

                //Right 1
                settings.right, settings.top, settings.back, settings.w,
                settings.right, settings.top, settings.front, settings.w,
                settings.right, settings.bottom, settings.back, settings.w,

                //Right 2
                settings.right, settings.top, settings.front, settings.w,
                settings.right, settings.bottom, settings.front, settings.w,
                settings.right, settings.bottom, settings.back, settings.w,

                //Top 1
                settings.left, settings.top, settings.front, settings.w,
                settings.right, settings.top, settings.front, settings.w,
                settings.left, settings.top, settings.back, settings.w,

                //Top 2
                settings.right, settings.top, settings.front, settings.w,
                settings.right, settings.top, settings.back, settings.w,
                settings.left, settings.top, settings.back, settings.w,

                //Bottom 1
                settings.left, settings.bottom, settings.front, settings.w,
                settings.right, settings.bottom, settings.front, settings.w,
                settings.left, settings.bottom, settings.back, settings.w,

                //Bottom 2
                settings.right, settings.bottom, settings.front, settings.w,
                settings.right, settings.bottom, settings.back, settings.w,
                settings.left, settings.bottom, settings.back, settings.w,

                //Back 1
                settings.right, settings.top, settings.back, settings.w,
                settings.right, settings.bottom, settings.back, settings.w,
                settings.left, settings.top, settings.back, settings.w,

                //Back 2
                settings.right, settings.bottom, settings.back, settings.w,
                settings.left, settings.bottom, settings.back, settings.w,
                settings.left, settings.top, settings.back, settings.w
            ]);
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = mat4.create();
            const modelViewMatrix = mat4.create();

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //Assigns perspective o the projectionMatrix
            mat4.perspective(
                projectionMatrix,
                fieldOfView,
                aspect,
                zNear,
                zFar
            );
            mat4.translate(modelViewMatrix,
                modelViewMatrix,
                [0.0, 0.0, -3.0]);
            mat4.rotate(modelViewMatrix,
                modelViewMatrix,
                settings.rotateX,
                [1, 0, 0]);
            mat4.rotate(modelViewMatrix,
                modelViewMatrix,
                settings.rotateY,
                [0, 1, 0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(attrs.position);
            gl.vertexAttribPointer(attrs.position, 4, gl.FLOAT, false, 0, 0);

            gl.uniformMatrix4fv(unis.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(unis.modelViewMatrix, false, modelViewMatrix);

            gl.drawArrays(gl.TRIANGLES, 0, 36);
        },

        setColorBuffer: function (colors) {
            var gl = this.gl;
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);
            this.buffers.color = buffer;
        },

        setTexCoords: function () {
            var gl = this.gl;
            var coords = [
                //Front face
                0, 0, //left top
                0, .1, //left bottom
                1, 0, //right top

                0, .1, //left bottom
                1, .1, //right bottom
                1, 0, //right top

                //Left face
                0, 0, //top back
                .05, 0, //bottom back
                0, -1, //top front

                .05, 0, //bottom back
                .05, -1, //bottom front
                0, -1, //top front

                //Right face
                1, 0, //top back
                1, 1, //top front
                .95, 0, //bottom back

                1, 1, //top front
                .95, 1, //bottom front
                .95, 0, //bottom back

                //Top face
                0, 0, //left front
                1, 0, //right front
                0, 1, //left back

                1, 0, //right front
                1, 1, //right back
                0, 1, //left back

                //Bottom face
                0, 0, //left front
                1, 0, //right front
                0, 1, //left back

                1, 0, //right front
                1, 1, //right back
                0, 1, //left back

                //Back face
                0, 0, //right top
                0, .1, //right bottom
                1, 0, //left top

                0, .1, //right bottom
                1, .1, //left bottom
                1, 0 //left top
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
        },

        getContext: function () {
            return this.gl;
        }
    };

    return App;
});