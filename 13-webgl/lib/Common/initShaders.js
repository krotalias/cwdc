/**
 * @file
 *
 * Auxiliary utility functions.
 *
 * @author Edward Angel
 * @since 20/08/2014
 * @see <a href="/WebGL/Common/initShaders.js">source</a>
 * @see https://scholar.google.com/citations?user=uT_WCZ0AAAAJ&hl=en
 */

/**
 * <p>Reads a WebGL program from its shader source code embedded in the HTML page.</p>
 * WebGL requires 2 shaders every time you draw something.
 * A vertex shader and a fragment shader.
 * @param {WebGL2RenderingContext} gl webgl context.
 * @param {HTMLElement} vertexShaderId vertex shader source.
 * @param {HTMLElement} fragmentShaderId fragment shader source.
 * @return {WebGLProgram} webgl program.
 * @see https://sites.google.com/site/csc8820/educational/read-webgl-programs
 */
function initShaders(gl, vertexShaderId, fragmentShaderId) {
    var vertShdr;
    var fragShdr;

    var vertElem = document.getElementById(vertexShaderId);
    if (!vertElem) {
        alert("Unable to load vertex shader " + vertexShaderId);
        return -1;
    } else {
        vertShdr = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShdr, vertElem.text);
        gl.compileShader(vertShdr);
        if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
            var msg =
                "Vertex shader failed to compile.  The error log is:" +
                "<pre>" +
                gl.getShaderInfoLog(vertShdr) +
                "</pre>";
            alert(msg);
            return -1;
        }
    }

    var fragElem = document.getElementById(fragmentShaderId);
    if (!fragElem) {
        alert("Unable to load vertex shader " + fragmentShaderId);
        return -1;
    } else {
        fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShdr, fragElem.text);
        gl.compileShader(fragShdr);
        if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
            var msg =
                "Fragment shader failed to compile.  The error log is:" +
                "<pre>" +
                gl.getShaderInfoLog(fragShdr) +
                "</pre>";
            alert(msg);
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var msg =
            "Shader program failed to link.  The error log is:" +
            "<pre>" +
            gl.getProgramInfoLog(program) +
            "</pre>";
        alert(msg);
        return -1;
    }

    return program;
}
