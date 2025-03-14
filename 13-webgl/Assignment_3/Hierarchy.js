/**
 * @file
 *
 * Summary.
 * <p>Partial hierarchical Robot object using a {@link Stack matrix stack}.</p>
 * One should add at least the right arm and the legs.
 *
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @see <a href="/cwdc/13-webgl/Assignment_3/Hierarchy.html">link</a>
 * @see <a href="/cwdc/13-webgl/Assignment_3/Hierarchy.js">source</a>
 * @see <a href="/cwdc/13-webgl/lib/teal_book/cuon-matrix.js">cuon-matrix</a>
 * @see <a href="https://students.aiu.edu/submissions/profiles/resources/onlineBook/a6A8H5_computer%20graphics.pdf#page=189">Foley</a>
 * @see <a href="https://www.cs.drexel.edu/~david/Classes/ICG/Lectures_new/L-14_HierchModels.pdf">Hierarchical Modeling</a>
 * @see <a href="/cwdc/13-webgl/Assignment_3/5.hierarchy.pdf">Hierarchy Tutorial</a>
 * @see <img src="/cwdc/13-webgl/Assignment_3/robot3.png" width="256"> <img src="/cwdc/13-webgl/Assignment_3/robot-full.png" width="420">
 * @see <img src="/cwdc/13-webgl/Assignment_3/camera_view_frustum.svg" width="340"> <img src="/cwdc/13-webgl/Assignment_3/side_view_frustum.png" width="340">
 */

"use strict";

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 */
let gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexNormalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexColorBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 */
let lightingShader;

/**
 * Joint angles.
 * @type {Object<{String:Number}>}
 */
const joint = {
  torso: 0.0,
  shoulder: 45.0,
  arm: 45.0,
  hand: 0.0,
  head: 0.0,
};

/**
 * Transformation matrix that is the root of 5 objects in the scene.
 * @type {Matrix4}
 */
const torsoMatrix = new Matrix4()
  .setTranslate(0, 0, 0)
  .rotate(joint.torso, 0, 1, 0);

/**  @type {Matrix4} */
const shoulderMatrix = new Matrix4()
  .setTranslate(6.5, 2, 0)
  .translate(0, 2, 0)
  .rotate(-joint.shoulder, 1, 0, 0)
  .translate(0, -2, 0);

/**  @type {Matrix4} */
const armMatrix = new Matrix4()
  .setTranslate(0, -5, 0)
  .translate(0, 2.5, 1.0)
  .rotate(-joint.arm, 1, 0, 0)
  .translate(0, -2.5, -1.0);

/**  @type {Matrix4} */
const handMatrix = new Matrix4()
  .setTranslate(0, -4, 0)
  .rotate(joint.hand, 0, 1, 0);

/**  @type {Matrix4} */
const headMatrix = new Matrix4()
  .setTranslate(0, 7, 0)
  .rotate(joint.head, 0, 1, 0);

const torsoMatrixLocal = new Matrix4().setScale(10, 10, 5);
const shoulderMatrixLocal = new Matrix4().setScale(3, 5, 2);
const armMatrixLocal = new Matrix4().setScale(3, 5, 2);
const handMatrixLocal = new Matrix4().setScale(1, 3, 3);
const headMatrixLocal = new Matrix4().setScale(4, 4, 4);

/**
 * Camera position.
 * @type {Array<Number>}
 */
const eye = [20, 20, 20];

/**
 * View matrix.
 * @type {Matrix4}
 */
// prettier-ignore
const viewMatrix = new Matrix4().setLookAt(
  ...eye,     // eye
  0, 0, 0,    // at - looking at the origin
  0, 1, 0     // up vector - y axis
);

/**
 * Model matrix.
 * @type {Matrix4}
 */
const modelMatrix = new Matrix4();

/**
 * Returns the magnitude (length) of a vector.
 * @param {Array<Number>} v n-D vector.
 * @returns {Number} vector length.
 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce Array.prototype.reduce()}
 */
const vecLen = (v) =>
  Math.sqrt(v.reduce((accumulator, value) => accumulator + value * value, 0));

/**
 * View distance.
 * @type {Number}
 */
const viewDistance = vecLen(eye);

/**
 * <p>Projection matrix.</p>
 * Here use aspect ratio 3/2 corresponding to canvas size 600 x 400.
 * @type {Matrix4}
 */
let projection = new Matrix4().setPerspective(45, 1.5, 0.1, 1000);

/**
 * Object to enable rotation by mouse dragging (arcball).
 * @type {SimpleRotator}
 */
let rotator;

/**
 * <p>A very basic stack class for traversing a hierarchical transformation tree.</p>
 * This class maintains a {@link Matrix4 matrix} stack,
 * whose top is the current transformation matrix.<br>
 * Each transformation function applied to {@link draw Robot} manipulates the current matrix.
 * <p>If a transformation needs to be reused,
 * it can be copied and pushed onto the top of the stack, by using the command: </p>
 *  • {@link Stack#push push}(); // “remember where you are”
 * <p>The top of the matrix stack can also be removed, by using the command:</p>
 *  • {@link Stack#pop pop}(); // “go back to where you were”
 * @class
 */
class Stack {
  /**
   * Constructor.
   * @constructs Stack
   */
  constructor() {
    /** Array for holding the stack elements. */
    this.elements = [];
    /** Top of the stack. */
    this.t = 0;
  }

  /**
   * Pushes a given matrix onto this stack.
   * @param {Matrix4} m transformation matrix.
   */
  push(m) {
    this.elements[this.t++] = m;
  }

  /**
   * Return the matrix at the top of this stack.
   * @return {Matrix4} m transformation matrix.
   */
  top() {
    if (this.t <= 0) {
      console.log("top = ", this.t);
      console.log("Warning: stack underflow");
    } else {
      return this.elements[this.t - 1];
    }
  }

  /**
   * Pops the matrix at the top of this stack.
   * @return {Matrix4} m transformation matrix.
   */
  pop() {
    if (this.t <= 0) {
      console.log("Warning: stack underflow");
    } else {
      this.t--;
      const temp = this.elements[this.t];
      this.elements[this.t] = undefined;
      return temp;
    }
  }

  /**
   * Returns whether this stack is empty.
   * @returns {Boolean} true if the stack is empty.
   */
  isEmpty() {
    return this.t <= 0;
  }
}

/**
 * <p>A cube model.</p>
 *
 * Creates data (numVertices, vertices, colors, and normal vectors)
 * for a unit cube. <br>
 * (Note this is a "self-invoking" anonymous function.)
 *
 * @type {cube_data}
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
   * Returned value is an object with four attributes:
   * numVertices, vertices, colors, and normals.
   *
   * @return {Object<{numVertices: Number,
   *                  vertices: Float32Array,
   *                  colors: Float32Array,
   *                  normals: Float32Array}>}
   * cube associated attributes.
   * @callback cube_data
   */
  return {
    numVertices: 36, // number of indices
    vertices: new Float32Array(verticesArray), // 36 * 3 = 108
    colors: new Float32Array(colorsArray), // 36 * 4 = 144
    normals: new Float32Array(normalsArray), // 36 * 3 = 108
  };
})();

/**
 * Return a matrix to transform normals, so they stay
 * <a href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48">perpendicular</a>
 * to surfaces after a linear transformation.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @returns {Float32Array} modelview transposed inverse.
 */
function makeNormalMatrixElements(model, view) {
  let n = new Matrix4(view).multiply(model);
  n.transpose();
  n.invert();
  n = n.elements;
  // prettier-ignore
  return new Float32Array([
      n[0], n[1], n[2],
      n[4], n[5], n[6],
      n[8], n[9], n[10]
    ]);
}

/**
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String | null}
 * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * <p>Keydown event handler for
 * adjusting Robot's joint rotations.</p>
 * @param {KeyboardEvent} event keyboard event.
 */
function handleKeyPress(event) {
  const ch = getChar(event);
  let currentShoulderRot, currentArm;
  let d;
  const opt = document.getElementById("options");
  switch (ch) {
    case "t":
      joint.torso += 15;
      torsoMatrix.setTranslate(0, 0, 0).rotate(joint.torso, 0, 1, 0);
      break;
    case "T":
      joint.torso -= 15;
      torsoMatrix.setTranslate(0, 0, 0).rotate(joint.torso, 0, 1, 0);
      break;
    case "s":
      joint.shoulder += 15;
      // rotate shoulder clockwise about a point 2 units above its center
      currentShoulderRot = new Matrix4()
        .setTranslate(0, 2, 0)
        .rotate(-joint.shoulder, 1, 0, 0)
        .translate(0, -2, 0);
      shoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
      break;
    case "S":
      joint.shoulder -= 15;
      currentShoulderRot = new Matrix4()
        .setTranslate(0, 2, 0)
        .rotate(-joint.shoulder, 1, 0, 0)
        .translate(0, -2, 0);
      shoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
      break;
    case "a":
      joint.arm += 15;
      // rotate arm clockwise about its top front corner
      currentArm = new Matrix4()
        .setTranslate(0, 2.5, 1.0)
        .rotate(-joint.arm, 1, 0, 0)
        .translate(0, -2.5, -1.0);
      armMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      break;
    case "A":
      joint.arm -= 15;
      currentArm = new Matrix4()
        .setTranslate(0, 2.5, 1.0)
        .rotate(-joint.arm, 1, 0, 0)
        .translate(0, -2.5, -1.0);
      armMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      break;
    case "h":
      joint.hand += 15;
      handMatrix.setTranslate(0, -4, 0).rotate(joint.hand, 0, 1, 0);
      break;
    case "H":
      joint.hand -= 15;
      handMatrix.setTranslate(0, -4, 0).rotate(joint.hand, 0, 1, 0);
      break;
    case "l":
      joint.head += 15;
      headMatrix.setTranslate(0, 7, 0).rotate(joint.head, 0, 1, 0);
      break;
    case "L":
      joint.head -= 15;
      headMatrix.setTranslate(0, 7, 0).rotate(joint.head, 0, 1, 0);
      break;
    case "ArrowUp":
    case ">":
      // Up pressed
      d = rotator.getViewDistance();
      d = Math.min(d + 1, 90);
      rotator.setViewDistance(d);
      break;
    case "ArrowDown":
    case "<":
      // Down pressed
      d = rotator.getViewDistance();
      d = Math.max(d - 1, 20);
      rotator.setViewDistance(d);
      break;
    default:
      return;
  }
  draw();

  opt.innerHTML = `<br>${gl.getParameter(
    gl.SHADING_LANGUAGE_VERSION,
  )}<br>${gl.getParameter(gl.VERSION)}`;
}

/**
 * Renders a cube based on the model transformation
 * on top of the stack and the given local transformation.
 * @param {Matrix4} matrixStack matrix on top of the stack.
 * @param {Matrix4} matrixLocal local transformation.
 */
function renderCube(matrixStack, matrixLocal) {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  const colorIndex = gl.getAttribLocation(lightingShader, "a_Color");
  if (colorIndex < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  gl.enableVertexAttribArray(colorIndex);

  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

  let loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "u_Color");
  gl.uniform4f(loc, 0.0, 1.0, 0.0, 1.0);
  loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

  const modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
  const normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

  // transform using current model matrix on top of stack
  let current = new Matrix4(matrixStack.top()).multiply(matrixLocal);
  current = new Matrix4(modelMatrix).multiply(current);
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, viewMatrix),
  );

  gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);

  // on safari 10, buffer cannot be disposed before drawing...
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);
}

/**
 * <p>Code to actually render our geometry (scene).</p>
 * @param {Boolean} useRotator whether a {@link SimpleRotator} should be used.
 */
function draw(useRotator = true) {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (useRotator) viewMatrix.elements = rotator.getViewMatrix();

  // set up the matrix stack
  const s = new Stack();
  s.push(torsoMatrix);
  renderCube(s, torsoMatrixLocal);

  // shoulder relative to torso
  s.push(new Matrix4(s.top()).multiply(shoulderMatrix));
  renderCube(s, shoulderMatrixLocal);

  // arm relative to shoulder
  s.push(new Matrix4(s.top()).multiply(armMatrix));
  renderCube(s, armMatrixLocal);

  // hand relative to arm
  s.push(new Matrix4(s.top()).multiply(handMatrix));
  renderCube(s, handMatrixLocal);
  s.pop();
  s.pop();
  s.pop();

  // head relative to torso
  s.push(new Matrix4(s.top()).multiply(headMatrix));
  renderCube(s, headMatrixLocal);
  s.pop();
  s.pop();

  if (!s.isEmpty()) {
    console.log("Warning: pops do not match pushes");
  }
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Starts an {@link animate animation} loop.
 *
 * <p>Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw draw()} does things that have to be repeated each time the canvas is
 * redrawn.</p>
 *
 * <p>At any given time, there can only be one buffer bound for each type
 * (ARRAY_BUFFER and ELEMENT_ARRAY_BUFFER).<br>
 * Therefore, the flow is to bind a buffer and set its data, followed
 * by setting up the vertex attribute pointers for that specific buffer,
 * and then proceed to the next buffer.</p>
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.</p>
   * <p>The callback argument sets the {@link handleKeyPress callback}
   * that will be invoked when the event is dispatched.</p>
   *
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.addEventListener("keydown", (event) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        event.code,
      ) > -1
    ) {
      event.preventDefault();
    }
    handleKeyPress(event);
  });

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById(
    "vertexLightingShader",
  ).textContent;
  const fshaderSource = document.getElementById(
    "fragmentLightingShader",
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  lightingShader = gl.program;
  gl.useProgram(null);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);

  // buffer for vertex colors
  vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);

  // buffer is not needed anymore (not necessary, really)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // fix aspect ratio
  projection = new Matrix4().setPerspective(
    60,
    canvas.width / canvas.height,
    0.1,
    1000,
  );

  // create new rotator object
  rotator = new SimpleRotator(canvas, draw);
  rotator.setViewMatrix(viewMatrix.elements);
  rotator.setViewDistance(viewDistance);

  /**
   * <p>Self-invoking function to define an animation loop.</p>
   * Here is the place to perform an auto rotation, for instance,
   * as long as a self-calling animation loop is executed through
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.
   * @callback animate
   */
  (function animate() {
    draw();
    // requestAnimationFrame(animate);
  })();
});
