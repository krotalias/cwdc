/**
 * @file
 *
 * Summary.
 * <p>Same as <a href="/cwdc/13-webgl/examples/example123/content/GL_example1.js">GL_example1</a>,
 * but the shader source is in script tags
 * in the html file. </p>
 *
 * Advantage: you don't have to put quotes around everything. <br>
 * (See shader source in <a href="/cwdc/13-webgl/examples/example123/content/showCode.php?f=GL_example1b">GL_example1b.html</a>)
 *
 * @since 27/03/2015
 * @author {@link https://stevekautz.com Steve Kautz}
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example1b.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example1b.js">source</a>
 */

/**
 * <p>Raw data for some point positions - this will be a square,
 * consisting of two triangles.</p>
 *
 * We provide two values per vertex for the x and y coordinates<br>
 * (z will be zero by default).
 */
const vertices = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/**
 * Number of vertices.
 * @type {Number}
 */
const numPoints = 6;

// A few global variables...

/**
 * The WebGL context.
 * @type {WebGL2RenderingContext}
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
 * Code to actually render our geometry.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

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
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  //gl.drawArrays(gl.LINES, 0, numPoints);

  // we can unbind the buffer now (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * <p>Entry point when page is loaded.</p>
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
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  /**
   * <p>Define an animation loop.</p>
   *
   * We could just call {@link draw} once to see the result,
   * but setting up an animation loop to continually update the canvas,
   * makes it easier to experiment with the shaders.
   * @function
   * @global
   */
  const animate = () => {
    draw();

    // request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();
}
