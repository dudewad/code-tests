define([], function() {
    var cachedShaders;

    function createShader(gl, src, type) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Couldn\'t compile shader of type ' + type + '!', gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    function getShaders(gl, vShader, fShader) {
        return cachedShaders || {
            fragmentShader: this.createShader(gl, document.querySelector('#fragment-shader').innerHTML, gl.FRAGMENT_SHADER),
            vertexShader: this.createShader(gl, document.querySelector('#vertex-shader').innerHTML, gl.VERTEX_SHADER)
        }
    }

    /**
     * Resize the gl canvas, should be used as a prep for drawing
     * @param gl    The GL object
     * @param c     The Canvas object
     */
    function resize (gl, c) {
        var cW = c.clientWidth;
        var cH = c.clientHeight;

        if (c.width !== cW || c.height !== cH) {
            c.width = cW;
            c.height = cH;
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    return {
        createShader: createShader,
        getShaders: getShaders,
        resize: resize
    }
});