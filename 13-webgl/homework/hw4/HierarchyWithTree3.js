/**
 * @file
 *
 * Summary.
 * <p>Hierarchical Robot object using {@link CS336Object recursion}.</p>
 *
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @see <a href="/cwdc/13-webgl/homework/hw4/HierarchyWithTree3.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw4/HierarchyWithTree3.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/Hierarchy.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/Hierarchy.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/hw4/CS336Object.js">CS336Object</a>
 * @see <img src="/cwdc/13-webgl/homework/hw4/robot2.png" width="512">
 */

import { CS336Object } from "./CS336Object.js";

/**
 * <p>{@link mainEntrance Entry point} when page is loaded.</p>
 * <p>Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw draw()} does things that have to be repeated each time the canvas is
 * redrawn.</p>
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => {
  mainEntrance();
});

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
  body: 10.0,
  torso: 30.0,
  shoulder: 45.0,
  arm: 45.0,
  hand: 90.0,
  head: 10.0,
};

// create the objects

const torso = new CS336Object(drawCube);

/**
 * Object to enable rotation by mouse dragging (arcball).
 * @type {SimpleRotator}
 */
let rotator;

// scale is applied only to the torso
torso.setScale(10, 10, 5);

const shoulder = new CS336Object(drawCube);
shoulder.setPosition(0, -2, 0);
shoulder.setScale(3, 5, 2);

const arm = new CS336Object(drawCube);
arm.setPosition(0, -2.5, -1.0);
arm.setScale(3, 5, 2);

const hand = new CS336Object(drawCube);
hand.setPosition(0, -6.5, -1.0);
hand.rotateY(joint.hand);
hand.setScale(1, 3, 3);

const head = new CS336Object(drawCube);
head.setPosition(0, 7, 0);
head.rotateY(joint.head);
head.setScale(4, 4, 4);

const leg = new CS336Object(drawCube);
leg.setPosition(0, -10, 0);
leg.setScale(3, 11, 2);

const foot = new CS336Object(drawCube);
foot.setPosition(0, -15.5, 0);
foot.setScale(6, 0.5, 6);

/**
 * This will hold transformations to be
 * applied to everything connected to the arm.
 * @type {CS336Object}
 */
const armDummy = new CS336Object();
armDummy.setPosition(0, -4.5, 1.0);
armDummy.rotateX(-joint.arm);
armDummy.addChild(arm);
armDummy.addChild(hand);

/**
 * This will hold transformations to be
 * applied to everything connected to the left shoulder.
 * @type {CS336Object}
 */
const LshoulderDummy = new CS336Object();
LshoulderDummy.rotateX(-joint.shoulder);
LshoulderDummy.setPosition(6.5, 4, 0);
LshoulderDummy.addChild(shoulder);
LshoulderDummy.addChild(armDummy);

/**
 * This will hold transformations to be
 * applied to everything connected to the right shoulder.
 * @type {CS336Object}
 */
const RshoulderDummy = new CS336Object();
RshoulderDummy.rotateX(-joint.shoulder);
RshoulderDummy.setPosition(-6.5, 4, 0);
RshoulderDummy.addChild(shoulder);
RshoulderDummy.addChild(armDummy);

/**
 * This will hold transformations to be
 * applied to everything connected to the torso.
 * @type {CS336Object}
 */
const torsoDummy = new CS336Object();
torsoDummy.rotateY(joint.torso);
torsoDummy.addChild(torso);
torsoDummy.addChild(head);
torsoDummy.addChild(LshoulderDummy);
torsoDummy.addChild(RshoulderDummy);

/**
 * Dummys' purpose is to factor out the scale
 * they pass rotation and translation, only, to its children.
 * <p>Body is torso plus leg and foot.</p>
 * @type {CS336Object}
 */
const bodyDummy = new CS336Object();
bodyDummy.rotateY(joint.body);
bodyDummy.addChild(torsoDummy);
bodyDummy.addChild(leg);
bodyDummy.addChild(foot);

/**
 * Camera position.
 * @type {Array<Number>}
 */
const eye = [20, 10, 40];

/**
 * View matrix.
 * @type {Matrix4}
 */
// prettier-ignore
const viewMatrix = new Matrix4().setLookAt(
  ...eye,   // eye
  0, 0, 0,  // at - looking at the origin
  0, 1, 0   // up vector - y axis
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
 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce MDN Array.prototype.reduce()}
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
 * Here use aspect ratio 3/2 corresponding to canvas size 600 x 400
 * @type {Matrix4}
 */
let projection = new Matrix4().setPerspective(45, 1.5, 0.1, 1000);

/**
 * <p>A cube model.</p>
 *
 * Creates data (numVertices, vertices, colors, and normal vectors)
 * for a unit cube.
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
   *                  normals: Float32Array,
   *                  indices: Uint16Array}>}
   * cube associated attributes.
   * @callback cube_data
   */
  return {
    numVertices: 36, // number of indices
    vertices: new Float32Array(verticesArray), // 36 * 3 = 108
    colors: new Float32Array(colorsArray), // 36 * 4 = 144
    normals: new Float32Array(normalsArray), // 36 * 3 = 108
    indices: indices,
  };
})();

/**
 * Return a matrix to transform normals, so they stay
 * <a href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48">perpendicular</a>
 * to surfaces after a linear transformation.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @returns {Float32Array} elements of the transposed inverse of the modelview matrix.
 */
function makeNormalMatrixElements(model, view) {
  let n = new Matrix4(view).multiply(model);
  n.invert();
  n.transpose();

  // take just the upper-left 3x3 submatrix
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
 * Keydown event handler for
 * adjusting Robot's joint rotations.
 * @param {KeyboardEvent} event keyboard event.
 */
function handleKeyPress(event) {
  const ch = getChar(event);
  let d;
  switch (ch) {
    case "b":
      bodyDummy.rotateY(15);
      break;
    case "B":
      bodyDummy.rotateY(-15);
      break;
    case "t":
      torsoDummy.rotateY(15);
      break;
    case "T":
      torsoDummy.rotateY(-15);
      break;
    case "s":
      LshoulderDummy.rotateX(-15);
      RshoulderDummy.rotateX(-15);
      break;
    case "S":
      LshoulderDummy.rotateX(15);
      RshoulderDummy.rotateX(15);
      break;
    case "a":
      armDummy.rotateX(-15);
      break;
    case "A":
      armDummy.rotateX(15);
      break;
    case "h":
      hand.rotateY(15);
      break;
    case "H":
      hand.rotateY(-15);
      break;
    case "l":
      head.rotateY(15);
      break;
    case "L":
      head.rotateY(-15);
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
}

/**
 * Renders a cube based on the given model transformation.
 * @param {Matrix4} matrix local transformation.
 */
function drawCube(matrix) {
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

  const current = new Matrix4(modelMatrix).multiply(matrix);
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, viewMatrix),
  );

  gl.drawArrays(gl.TRIANGLES, 0, cube.numVertices);

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

  // recursively render everything in the hierarchy
  bodyDummy.render(new Matrix4());
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Starts an {@link animate animation} loop.
 *
 * <p>Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw draw()} does things that have to be repeated each time the canvas is
 * redrawn.</p>
 */
function mainEntrance() {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.</p>
   * <p>The callback argument sets the {@link handleKeyPress callback}
   * that will be invoked when the event is dispatched.</p>
   *
   * @event keydown
   * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
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

  // get the rendering context for WebGL
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
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

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // fix aspect ratio
  projection = new Matrix4().setPerspective(
    45,
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
}
