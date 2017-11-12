define(['lib/gl-matrix', 'utils/webgl-utils'], function(glMatrix, glUtils) {
    var mat4 = glMatrix.mat4;

    function App() {
        this.canvas = document.querySelector('#canvas');
        var gl = this.gl = this.canvas.getContext('webgl');
        if (gl) {
            console.log('Canvas WebGL gl is running!');
        }
        else {
            throw new Error('Canvas WebGL gl could not be started! Aborting...');
        }

        gl.clearColor(0, 0, 0, 1);
        gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.shaders = glUtils.getShaders(gl, document.querySelector('#fragment-shader').innerHTML, document.querySelector('#vertex-shader').innerHTML);
        this.glProgram = this.gl.createProgram();

        gl.attachShader(this.glProgram, this.shaders.vertexShader);
        gl.attachShader(this.glProgram, this.shaders.fragmentShader);
        gl.linkProgram(this.glProgram);

        if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
            throw new Error('Couldn\'t link program!', gl.getProgramInfoLog(this.glProgram))
        }

        gl.useProgram(this.glProgram);

        this.programInfo = {
            attrLocs: {
                position: gl.getAttribLocation(this.glProgram, 'position')
            },
            uniformLocs: {
                color: gl.getUniformLocation(this.glProgram, 'color'),
                modelViewMatrix: gl.getUniformLocation(this.glProgram, 'uModelViewMatrix'),
                projectionMatrix: gl.getUniformLocation(this.glProgram, 'uProjectionMatrix')
            }
        };

        gl.enable(gl.DEPTH_TEST);
    }

    App.prototype = {
        draw: function (settings) {
            glUtils.resize(this.gl, this.canvas);

            var gl = this.gl;
            var attrs = this.programInfo.attrLocs;
            var unis = this.programInfo.uniformLocs;
            var buffer = gl.createBuffer();
            var data = new Float32Array([
                //Triangle 1
                settings.left, settings.bottom, settings.depth, settings.w,
                settings.right, settings.bottom, settings.depth, settings.w,
                settings.left, settings.top, settings.depth, settings.w,

                //Triangle 2
                settings.left, settings.top, settings.depth, settings.w,
                settings.right, settings.bottom, settings.depth, settings.w,
                settings.right, settings.top, settings.depth, settings.w
            ]);
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = mat4.create();
            const modelViewMatrix = mat4.create();

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

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

            gl.enableVertexAttribArray(attrs.position);
            gl.vertexAttribPointer(attrs.position, 4, gl.FLOAT, false, 0, 0);

            gl.uniformMatrix4fv(unis.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(unis.modelViewMatrix, false, modelViewMatrix);
            gl.uniform4fv(unis.color, settings.color);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    };

    return App;
});