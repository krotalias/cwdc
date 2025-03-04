/**
 * @file
 *
 * Summary.
 *
 * <p>Vertices are scaled by an amount that varies by
 * frame, and this value is passed to the draw function
 * and to the vertex shader as a {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/uniform uniform} variable.</p>
 *
 * <p>Similar to <a href="/cwdc/13-webgl/examples/example123/content/GL_example1b.js">GL_example1b</a>,
 * but illustrates applying a transformation
 * in the vertex shader.</p>
 * (See shader source in <a href="/cwdc/13-webgl/examples/example123/content/showCode.php?f=GL_example3">GL_example3.html</a>)
 *
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3.js">source</a>
 * @see <img src="../shader_pipeline_example.jpg" width="512">
 */

"use strict";

/**
 * Raw data for some point positions -
 * this will be a square, consisting of two triangles.
 * <p>We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).</p>
 * @type {Float32Array}
 */
const vertices = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/**
 * Number of points (vertices).
 * @type {Number}
 */
const numPoints = vertices.length / 2;

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
let gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexbuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let shader;

/**
 * Color table.
 * @type {Object<String:Float32Array>}
 */
const color = {
  red: new Float32Array([1.0, 0.0, 0.0, 1.0]),
  black: new Float32Array([0.0, 0.0, 0.0, 1.0]),
  teal: new Float32Array([0.0, 0.8, 0.8, 1.0]),
};

/**
 * Code to actually render our geometry.
 * This is the WebGL version.
 * @param {Number} scale scale factor.
 */
function draw(scale) {
  console.log("starting draw");

  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // set the value of the uniform variable in the shader
  const scale_loc = gl.getUniformLocation(shader, "u_scale");
  gl.uniform1f(scale_loc, scale);

  // bind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(shader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.
  // Don't worry about the last three args just yet.)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // draw, specifying the type of primitive to assemble from the vertices
  const color_loc = gl.getUniformLocation(shader, "u_color");
  gl.uniform4fv(color_loc, color.red);
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  // draw edges
  gl.uniform4fv(color_loc, color.black);
  gl.drawArrays(gl.LINES, 0, numPoints);

  // we can unbind the buffer now (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  // get the rendering context for WebGL
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById("vertexShader").textContent;
  const fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // retain a handle to the shader program, then unbind it
  // This looks odd, but the way initShaders works is that it "binds" the shader and
  // stores the handle in an extra property of the gl object.
  // That's ok, but will really mess things up when we have more than one shader pair.
  shader = gl.program;
  gl.useProgram(null);

  // request a handle for a chunk of GPU memory
  vertexbuffer = gl.createBuffer();
  if (!vertexbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(...color.teal);

  /**
   * A closure to set up an animation loop in which the
   * scale grows by "increment" each frame.
   * @return {loop} animation loop.
   * @global
   * @function
   */
  const runanimation = (() => {
    let scale = 1.0;
    let increment = 0.05;

    /**
     * <p>Keep drawing frames.</p>
     * Request that the browser calls {@link runanimation} again "as soon as it can".
     * @callback loop
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}
     */
    return () => {
      draw(scale);
      scale += increment;
      if (scale >= 1.5 || scale <= 0.5) increment = -increment;

      requestAnimationFrame(runanimation);
    };
  })();

  // draw!
  runanimation();
}
