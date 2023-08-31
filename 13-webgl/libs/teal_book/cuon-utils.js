/**
 * @file
 *
 * Summary.
 * <p>This is a class for creating shaders.</p>
 *
 * @author Kanda and Matsuda (c) 2012
 * @since 25/09/2016
 * @see <a href="/WebGL/teal_book/cuon-utils.js">source</a>
 */

/**
 * Create a program object and make it current.
 * @param {WebGLRenderingContext} GL context.
 * @param {String} vshader a vertex shader program.
 * @param {String} fshader a fragment shader program.
 * @return {Boolean} true, if the program object was created and successfully made current.
 */
function initShaders(gl, vshader, fshader) {
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.log("Failed to create program");
        return false;
    }

    gl.useProgram(program);
    gl.program = program;

    return true;
}

/**
 * Create the linked program object
 * @param {WebGLRenderingContext} gl GL context.
 * @param {String} vshader a vertex shader program.
 * @param {String} fshader a fragment shader program.
 * @return {WebGLProgram} created program object, or null if the creation has failed.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram
 */
function createProgram(gl, vshader, fshader) {
    // Create shader object
    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
        return null;
    }

    // Create a program object
    var program = gl.createProgram();
    if (!program) {
        return null;
    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program object
    gl.linkProgram(program);

    // Check the result of linking
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log("Failed to link program: " + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
    }
    return program;
}

/**
 * Create a shader object
 * @param {WebGLRenderingContext} gl GL context.
 * @param {gl.VERTEX_SHADER | gl.FRAGMENT_SHADER} type the type of the shader object to be created,
 * @param {DOMString} source shader program.
 * @return {WebGLShader} created shader object, or null if the creation has failed.
 * @see https://udn.realityripple.com/docs/Web/API/WebGLRenderingContext/shaderSource
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createShader
 */
function loadShader(gl, type, source) {
    // Create shader object
    var shader = gl.createShader(type);
    if (shader == null) {
        console.log("unable to create shader");
        return null;
    }

    // Set the shader program
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check the result of compilation
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log("Failed to compile shader: " + error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Initialize and get the rendering context for WebGL.
 * This will make any GL errors show up in your browser JavaScript console.
 * @param {HTMLCanvasElement} canvas &lt;canvas&gt; element.
 * @param {Boolean} opt_debug flag to initialize the context for debugging.
 * @return {WebGL2RenderingContext} the rendering context for WebGL.
 * @see https://www.khronos.org/webgl/wiki/Debugging
 * @see https://sites.google.com/site/csc8820/educational/how-to-create-a-webgl-context
 */
function getWebGLContext(canvas, opt_debug) {
    // Get the rendering context for WebGL
    var gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) return null;

    // if opt_debug is explicitly false, create the context for debugging
    if (arguments.length < 2 || opt_debug) {
        gl = WebGLDebugUtils.makeDebugContext(gl);
    }

    return gl;
}
