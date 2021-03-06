define([], function() {
    var cachedShaders;

    /**
     * Given a <canvas> element, gets a WebGL context from it, or fails if not available.
     * @param   {HTMLDomElement}            The <canvas> element to get the context from
     * @returns {WebGLRenderingContext}     The 3d WebGL rendering context, if available
     * @throws  {Error}                     Throws an error if the browser doesn't support WebGL
     */
    function getGLContext(canvas) {
        var context = canvas.getContext('webgl');

        if (context) {
            console.log('Canvas WebGL gl is running!');
        }
        else {
            throw new Error('Canvas WebGL gl could not be started! Aborting...');
        }

        return context;
    }

    /**
     * Create a WebGL Shader object from a src string using the specified type.
     * This will create a shader, set its source to the passed source, and compile it.
     *
     * @param gl    {object}        The WebGL Context, generated by getGLContext
     * @param src   {string}        The shader source, as a string
     * @param type  {string}        The Shader type (should be gl.FAGMENT_SHADER or gl.VERTEX_SHADER)
     * @returns     {WebGLShader}   A Compiled WebGLShader object
     * @throws      {Error}         Shader could compile for some reason. Error includes shader info log.
     */
    function createShader(gl, src, type) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error('Couldn\'t compile shader of type ' + type + '!', gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    /**
     * Gets fragment and vertex shaders
     * @param gl            {object}        The WebGL Context, generated by getGLContext
     * @param vShaderSrc    {string}        The vertex shader source as a string
     * @param fShaderSrc    {string}        The fragment shader source as a string
     * @returns {{fShader: WebGLShader, vShader: WebGLShader}}
     */
    function getShaders(gl, vShaderSrc, fShaderSrc) {
        return {
            fShader: createShader(gl, fShaderSrc, gl.FRAGMENT_SHADER),
            vShader: createShader(gl, vShaderSrc, gl.VERTEX_SHADER)
        }
    }

    /**
     * Create and link a program using the passed shaders. Shaders can be strings or already compiled WebGLShader objects
     * @param gl        {object}        The WebGL Context, generated by getGLContext
     * @param shaders   {object}        An object containing .fShader and .vShader which are both compiled WebGLShaders,
     *                                  or strings of source to be compiled into WebGLShaders
     * @returns {object}                The WebGL program, compiled
     * @throws  {Error}                 Theows an error when program linking failed. Includes programInfo object
     */
    function createAndLinkProgram(gl, shaders) {
        var program = gl.createProgram();

        //If shaders are strings, then we need to generate them. Otherwise they've already
        //been generated (assumption)
        if(typeof shaders.vShader === 'string') {
            shaders = getShaders(gl, shaders.vShader, shaders.fShader);
        }

        gl.attachShader(program, shaders.vShader);
        gl.attachShader(program, shaders.fShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Couldn\'t link program!', gl.getProgramInfoLog(program));
        }

        return program;
    }

    /**
     * Resize the gl canvas, should be used as a prep for drawing
     * @param gl    {object}            The WebGL Context, generated by getGLContext
     * @param c     {HTMLDomElement}    The <canvas> element
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
        createAndLinkProgram: createAndLinkProgram,
        createShader: createShader,
        getGLContext: getGLContext,
        getShaders: getShaders,
        resize: resize
    }
});