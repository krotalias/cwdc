/**
 * @file
 *
 * Summary.
 *
 * <p>Similar to the two cubes <a href="/cwdc/13-webgl/doc-test2">example</a>.</p>
 *
 * <p>There are two cubes and an X. The cubes also orbit around the X as satelytes.</p>
 *
 * <ul>
 * <li>An animation of a colored X orbiting clockwise
 * is rendered about the y-axis, in the x-z plane, in a circle of radius 10.</li>
 *
 * <li>The first cube is half of a unit cube and orbits clockwise around X with a radius of 8,
 * while the second cube is one third of a unit cube and orbits counter-clockwise around X
 * with a radius of 6. </li>
 *
 * <li>Both cubes orbit at a constant
 * {@link https://en.wikipedia.org/wiki/Angular_frequency angular speed} of π radians/s or 180°/s.</li>
 *
 * <li>The X also spins on its own y-axis "rev" times per full orbit, where "rev" is given in the URL (default 365).</li>
 *
 * <li>The transformation is applied passing the model matrix to the vertex shader. </li>
 * </ul>
 *
 * Notes:
 * <ol>
 *  <li>the only modified code is in the {@link draw} and {@link animate} functions,
 *  plus the vertex shader.</li>
 *  <li>it uses the type {@link Matrix4} from the teal book utilities in cuon-matrix.js</li>
 * </ol>
 *
 * @author Paulo Roma
 * @since 27/09/2016
 * @copyright © 2024 Paulo R Cavalcanti
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.en.html GPLv3}
 * @see <a href="/cwdc/13-webgl/homework/hw3/test.html?rev=3">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/test.js">source</a>
 * @see <iframe title="Two cubes orbting an X" style="position: relative; top: 0px; margin-bottom: -250px; width: 820px; height: 520px; transform-origin: 0px 20px; transform: scale(0.5);" src="/cwdc/13-webgl/homework/hw3/test.html?rev=3"></iframe>
 */

"use strict";

// prettier-ignore
const axisVertices = new Float32Array([
  0.0, 0.0, 0.0,
  1.5, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 1.5, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 1.5
]);

// RGB
// prettier-ignore
const axisColors = new Float32Array([
  1.0, 0.0, 0.0, 1.0,
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 1.0, 1.0
]);

/**
 * Handle to buffers on the GPU.
 * @type {WebGLBuffer}
 */
// prettier-ignore
let vertexBuffer;
let vertexColorBuffer;
let indexBuffer;
let axisBuffer;
let axisColorBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let shader;

/**
 * Model transformation.
 * @type {Matrix4}
 */
let modelMatrix;

/**
 * <p>View matrix.</p>
 * One strategy is to identify a
 * <a href="/cs336/examples/lighting/content/doc-lighting2/global.html#viewMatrix">transformation</a>
 * to our camera frame, then invert it. <br>
 *
 * <p>Alternatively use the LookAt function, specifying the view (eye) point,
 * a point at which to look, and a direction for "up".<br>
 * Approximate view point for above is (1.77, 3.54, 3.06)</p>
 * @type {Matrix4}
 */
// prettier-ignore
const viewMatrix = new Matrix4().setLookAt(
  5.77, 3.54, 25.06,  // eye
  0, 0, 0,            // at - looking at the origin
  0, 1, 0             // up vector - y axis
);

/**
 * For projection we can either use an orthographic projection (1), specifying
 * the clipping volume explicitly,
 * or a perspective projection (2), specified with a
 * field of view, an aspect ratio, and distance to near and far
 * clipping planes:</p>
 * <ul>
 *  <li>aspect ratio is 3/2 corresponding to a canvas size 600 x 400.</li>
 *  <li>in (1) below, (right - left) = aspect × (top - bottom),
 *  corresponding to the screen aspect ratio.</li>
 * </ul>
 * <ol>
 *  <li>let projection = new Matrix4().setOrtho(-1.5, 1.5, -1, 1, 4, 6)</li>
 *  <li>let projection = new Matrix4().setPerspective(50, aspect, 0.4, 100)</li>
 * </ol>
 * @type {Matrix4}
 */
let projection;

/**
 * @typedef {Object} cube_data
 * @property {Number} numVertices number of vertices
 * @property {Float32Array} vertices vertex array
 * @property {Float32Array} colors vertex color array
 * @property {Float32Array} normals vertex normal array
 * @property {Uint16Array} indices vertex index array
 * @see {@link https://threejs.org/docs/#api/en/core/BufferGeometry BufferGeometry}
 */

/**
 * <p>Closure for creating a cube model.</p>
 * (Note this is a "self-invoking" anonymous function.)
 * @function
 * @return {cube_data} callback or returning cube properties.
 */
const cube = (() => {
  // vertices of cube
  // prettier-ignore
  const rawVertices = new Float32Array([
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5
  ]);

  // prettier-ignore
  const rawColors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,  // red
    0.0, 1.0, 0.0, 1.0,  // green
    0.0, 0.0, 1.0, 1.0,  // blue
    1.0, 1.0, 0.0, 1.0,  // yellow
    1.0, 0.0, 1.0, 1.0,  // magenta
    0.0, 1.0, 1.0, 1.0,  // cyan
  ]);

  // prettier-ignore
  const rawNormals = new Float32Array([
    0, 0, 1,
    1, 0, 0,
    0, 0, -1,
    -1, 0, 0,
    0, 1, 0,
    0, -1, 0
  ]);

  // prettier-ignore
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,  // +z face
    1, 5, 6, 1, 6, 2,  // +x face
    5, 4, 7, 5, 7, 6,  // -z face
    4, 0, 3, 4, 3, 7,  // -x face
    3, 2, 6, 3, 6, 7,  // +y face
    4, 5, 1, 4, 1, 0   // -y face
  ]);

  const verticesArray = [];
  const colorsArray = [];
  const normalsArray = [];
  for (let i = 0; i < 36; ++i) {
    // for each of the 36 vertices...
    const face = Math.floor(i / 6);
    const index = indices[i];

    // (x, y, z): three numbers for each point
    for (let j = 0; j < 3; ++j) {
      verticesArray.push(rawVertices[3 * index + j]);
    }

    // (r, g, b, a): four numbers for each point
    for (let j = 0; j < 4; ++j) {
      colorsArray.push(rawColors[4 * face + j]);
    }

    // three numbers for each point
    for (let j = 0; j < 3; ++j) {
      normalsArray.push(rawNormals[3 * face + j]);
    }
  }

  /**
   * <p>Return raw data (numVertices, vertices, colors, normal vectors and indices)
   * of a unit cube. </p>
   *
   * <p>This is not the best way of storing a cube,
   * because 6 faces x 2 triangles/face * 3 vertices/face = 36 indices.</p>
   *
   * @callback cube_data
   * @return {cube_data}
   */
  return {
    numVertices: 36, // number of indices
    vertices: new Float32Array(verticesArray), // 36 * 3 = 108
    colors: new Float32Array(colorsArray), // 36 * 4 = 144
    normals: new Float32Array(normalsArray), // 36 * 3 = 108
    indices: new Uint16Array(indices), // 6 * 6 = 36
  };
})();

/**
 * <p>Matrix for taking normals into eye space.</p>
 * Return a matrix to transform normals, so they stay
 * perpendicular to surfaces after a linear transformation.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @returns {Float32Array} (𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup> - transpose of the inverse of the modelview matrix.
 * @see {@link https://krotalias.github.io/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48 Normal “vector” transformation}
 */
function makeNormalMatrixElements(model, view) {
  const modelView = new Matrix4(view).multiply(model);
  modelView.transpose();
  modelView.invert();
  const n = modelView.elements;
  // prettier-ignore
  return new Float32Array([
    n[0], n[1], n[2],
    n[4], n[5], n[6],
    n[8], n[9], n[10],
  ]);
}

/**
 * Convert an angle in degrees to radians.
 *
 * @function
 * @param {Number} deg angle in degrees.
 * @returns {Number} angle in radians.
 */
const deg2rad = (deg) => (deg * Math.PI) / 180.0;

/**
 * Render our geometry.
 *
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {Number} rad rotation angle for the cubes.
 */
function draw(gl, rad) {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // bind the shader and set attributes
  gl.useProgram(shader);
  const positionIndex = gl.getAttribLocation(shader, "a_Position");
  const colorIndex = gl.getAttribLocation(shader, "a_Color");
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

  // identity transformation
  let model = new Matrix4()
    .multiply(modelMatrix)
    .rotate(-45, 0, 0, 1)
    .scale(1, 8, 1);

  // set uniforms in shader for projection * view * model transformation
  let loc = gl.getUniformLocation(shader, "model");
  gl.uniformMatrix4fv(loc, false, model.elements);
  loc = gl.getUniformLocation(shader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix.elements);
  loc = gl.getUniformLocation(shader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(shader, "normalMatrix");
  gl.uniformMatrix3fv(loc, false, makeNormalMatrixElements(model, viewMatrix));

  // draw the X left leg: cube scaled by 8 in y and rotated -45° in z
  gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);

  loc = gl.getUniformLocation(shader, "model");
  model = new Matrix4()
    .multiply(modelMatrix)
    .rotate(45, 0, 0, 1)
    .scale(1, 8, 1);
  gl.uniformMatrix4fv(loc, false, model.elements);
  // draw the X right leg: cube scaled by 8 in y and rotated 45° in z
  gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);

  // second cube
  let x = 8 * Math.cos(rad);
  let z = 8 * Math.sin(rad);
  loc = gl.getUniformLocation(shader, "model");
  model = new Matrix4()
    .translate(x, 0, z)
    .multiply(modelMatrix)
    .scale(1 / 2, 1 / 2, 1 / 2);
  gl.uniformMatrix4fv(loc, false, model.elements);
  gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);

  // third cube
  x = 6 * Math.cos(-rad);
  z = 6 * Math.sin(-rad);
  loc = gl.getUniformLocation(shader, "model");
  model = new Matrix4()
    .translate(x, 0, z)
    .multiply(modelMatrix)
    .scale(1 / 3, 1 / 3, 1 / 3);
  gl.uniformMatrix4fv(loc, false, model.elements);
  gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);

  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

  loc = gl.getUniformLocation(shader, "model");
  model = new Matrix4().multiply(modelMatrix).scale(1, 1, 1.0);
  gl.uniformMatrix4fv(loc, false, model.elements);
  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically, this function does setup that "should" only have to be done once, <br>
 * while {@link draw} does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  // get the rendering context for WebGL
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
    return;
  }

  const aspect = canvas.clientWidth / canvas.clientHeight;
  projection = new Matrix4().setPerspective(50, aspect, 0.4, 100);

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById("vertexShader").textContent;
  const fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  /*
   * Retain a handle to the shader program, then unbind it.
   * This looks odd, but the way initShaders works is that it "binds"
   * the shader and stores the handle in an extra property of the gl object.
   * That's ok, but will really mess things up when we have more than one shader pair.
   */
  shader = gl.program;
  gl.useProgram(null);

  // request a handle for a chunk of GPU memory
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // buffer for vertex colors
  vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);

  // axes
  axisBuffer = gl.createBuffer();
  if (!axisBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

  // buffer for axis colors
  axisColorBuffer = gl.createBuffer();
  if (!axisColorBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisColors, gl.STATIC_DRAW);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // enable z-buffer
  gl.enable(gl.DEPTH_TEST);

  modelMatrix = new Matrix4();

  /**
   * A closure to set up an animation loop in which the
   * angle grows by "increment" each frame.
   * @return {updateModelMatrix}
   * @function
   * @global
   */
  const animate = (() => {
    let degrees = 0;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // complete revolutions about the center per cycle
    const revolution = +urlParams.get("rev") || 365;
    document.getElementById("turns").innerHTML = revolution;

    const increment = 1 / revolution;

    /**
     * Multiply the global {@link modelMatrix} on the right
     * by a rotation followed by a translation.
     * @callback updateModelMatrix
     */
    return () => {
      const rad = deg2rad(degrees % 360);
      draw(gl, 3 * revolution * rad);

      degrees += increment;

      // orbit of radius 10 in the x - z plane
      const x = 10 * Math.cos(rad);
      const z = 10 * Math.sin(rad);
      modelMatrix
        .setTranslate(x, 0, z)
        .rotate((revolution * degrees) % 360, 0, 1, 0);

      requestAnimationFrame(animate);
    };
  })();

  animate();
}

/**
 * Triggers the {@link mainEntrance} animation.
 *
 * @event load - run the animation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", (event) => {
  mainEntrance();
});
