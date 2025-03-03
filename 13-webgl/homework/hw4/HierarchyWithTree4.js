/**
 * @file
 *
 * Summary.
 * <p>Hierarchical Rotor object using <a href="/cwdc/13-webgl/homework/hw4/doc-object">recursion</a>.</p>
 *
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @see <a href="/cwdc/13-webgl/homework/hw4/HierarchyWithTree4.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw4/HierarchyWithTree4.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/hw4/rotor.colors.txt">colors</a>
 * @see <a href="/cwdc/13-webgl/lib/teal_book/cuon-matrix.js">cuon-matrix</a>
 * @see <a href="/cwdc/13-webgl/homework/hw4/CS336Object.js">CS336Object</a>
 * @see <a href="/cwdc/13-webgl/homework/hw4/hw4.pdf">Homework</a>
 * @see <a href="/cwdc/13-webgl/videos/rotor.mp4">video</a>
 * @see <img src="/cwdc/13-webgl/homework/hw4/rotor.png" width="512">
 * @see <img src="/cwdc/13-webgl/homework/hw4/vertex-transform-pipeline.png" width="512">
 */

import { CS336Object } from "./CS336Object.js";

/**
 * <p>Module creates a scope to avoid name collisions.</p>
 * Either expose your {@link mainEntrance function}
 * to the global window object, or use addEventListener to bind handler.
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => mainEntrance(event));

/**
 * Enum for rotation direction: clockwise x counterclockwise.
 * @readonly
 * @enum {Number}
 */
const direction = Object.freeze({
  /** Clockwise */
  CW: 0,
  /** Counterclockwise */
  CCW: 1,
});

/**
 * Rotation direction.
 * @type {direction}
 */
let rotorRotation = direction.CW;

/**
 * Rotor blade state.
 * @type {Boolean}
 */
let paused = false;

/**
 * Rotor blade angle.
 * @type {Number}
 */
let bladeAngle = 0;

/**
 * Object to enable rotation by mouse dragging (arcball).
 * @type {SimpleRotator}
 */
let rotator;

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
let vertexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexNormalBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 */
let lightingShader;

/**
 * Create the root object container: shaft + {@link generatorDummy generator} + base.
 * @type {CS336Object}
 */
const shaftDummy = new CS336Object();

const shaft = new CS336Object(drawCubeCyan);
shaft.setPosition(0, -5, 0);
shaft.setScale(2, 25, 2);
shaftDummy.addChild(shaft);

const base = new CS336Object(drawCube);
base.setPosition(0, -17.5, 0);
base.setScale(6, 0.5, 6);
shaftDummy.addChild(base);

/**
 * Create the generator object container: generator + generatorBlob + {@link rotorDummy rotor}.
 * @type {CS336Object}
 */
const generatorDummy = new CS336Object();
shaftDummy.addChild(generatorDummy);

const generator = new CS336Object(drawCubeMagenta);
generator.setPosition(0, 8, 0);
generator.setScale(4, 3, 6);
generatorDummy.addChild(generator);

const generatorBlob = new CS336Object(drawCubeYellow);
generatorBlob.setPosition(0, 0.5, 0);
generatorBlob.setScale(0.5, 0.3, 0.8);
generator.addChild(generatorBlob);

/**
 * Create the rotor object container: rotor + rotorBlob + blade.
 * @type {CS336Object}
 */
const rotorDummy = new CS336Object();
rotorDummy.setPosition(0, 8, 3);
generatorDummy.addChild(rotorDummy);

const rotor = new CS336Object(drawCubeRed);
rotor.setPosition(0, 0, 0.3);
rotor.setScale(1.5, 1.5, 1.5);
rotorDummy.addChild(rotor);

const rotorBlob = new CS336Object(drawCubeBlue);
rotorBlob.setPosition(0, 0, 0.5);
rotorBlob.setScale(0.5, 0.5, 0.5);
rotor.addChild(rotorBlob);

const blade = new CS336Object(drawCube);
blade.setPosition(0, 0, 0.5);
blade.setScale(1, 20, 0.3);
rotorDummy.addChild(blade);

/**
 * Camera position.
 * @type {Array<Number>}
 */
const eye = [30, 30, 30];

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
 * Initial View matrix.
 * @type {Matrix4}
 */
const vMatrix = new Matrix4(viewMatrix);

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
 * @returns {Float32Array} elements of the transpose of the inverse of the modelview matrix.
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
 * <p>Keydown event handler for adjusting joint object rotations.</p>
 * Each event is {@link getChar translated} into a string and mapped to a function call.
 * @param {KeyboardEvent} event keyboard event.
 */
function handleKeyPress(event) {
  const ch = getChar(event);
  const angle = 1;
  let d;
  switch (ch) {
    case " ":
      paused = !paused;
      animate();
      break;

    case "t":
      shaftDummy.rotateY(15);
      break;

    case "T":
      shaftDummy.rotateY(-15);
      break;

    case "g":
      generatorDummy.rotateY(15);
      break;

    case "G":
      generatorDummy.rotateY(-15);
      break;

    case "r":
      rotorRotation = direction.CW;
      break;

    case "R":
      rotorRotation = direction.CCW;
      break;

    case "ArrowUp":
    case ">":
      // Up pressed
      d = rotator.getViewDistance();
      d = Math.min(d + 1, 90);
      rotator.setViewDistance(d);
      draw();
      break;

    case "ArrowDown":
    case "<":
      // Down pressed
      d = rotator.getViewDistance();
      d = Math.max(d - 1, 20);
      rotator.setViewDistance(d);
      draw();
      break;

    case "o":
      modelMatrix.setIdentity();
      rotator.setViewMatrix(vMatrix.elements);
      rotator.setViewDistance(viewDistance);
      draw();
      break;

    case "b":
      if (bladeAngle < 45 && bladeAngle >= -45) {
        bladeAngle++;
        bladeDummy.rotateY(angle);
      }
      break;

    case "B":
      if (bladeAngle <= 45 && bladeAngle > -45) {
        bladeAngle--;
        bladeDummy.rotateY(-angle);
      }
      break;

    default:
      return;
  }
}

/**
 * Renders a cube based on the given model transformation.
 * @param {Matrix4} matrix local transformation.
 * @param {Array<Number>} color cube's color in {@link https://en.wikipedia.org/wiki/RGB_color_model RGB} format.
 */
function drawCube(matrix, color = [0, 1, 0]) {
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

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);

  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);

  let loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getAttribLocation(lightingShader, "a_Color");
  gl.vertexAttrib4f(loc, ...color, 1.0);
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
 * <p>Code to actually render our geometry (scene). </p>
 * @param {Boolean} useRotator whether a {@link SimpleRotator} should be used.
 */
function draw(useRotator = true) {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (useRotator) viewMatrix.elements = rotator.getViewMatrix();

  // recursively render everything in the hierarchy
  shaftDummy.render(new Matrix4());
}

/**
 * Draw a red {@link drawCube cube}.
 * @param {Matrix4} matrix local transformation.
 */
function drawCubeRed(matrix) {
  drawCube(matrix, [1, 0, 0]);
}

/**
 * Draw a blue {@link drawCube cube}.
 * @param {Matrix4} matrix local transformation.
 */
function drawCubeBlue(matrix) {
  drawCube(matrix, [0, 0, 1]);
}

/**
 * Draw a yellow {@link drawCube cube}.
 * @param {Matrix4} matrix local transformation.
 */
function drawCubeYellow(matrix) {
  drawCube(matrix, [1, 1, 0]);
}

/**
 * Draw a magenta {@link drawCube cube}.
 * @param {Matrix4} matrix local transformation.
 */
function drawCubeMagenta(matrix) {
  drawCube(matrix, [1, 0, 1]);
}

/**
 * Draw a cyan {@link drawCube cube}.
 * @param {Matrix4} matrix local transformation.
 */
function drawCubeCyan(matrix) {
  drawCube(matrix, [0, 1, 1]);
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Start the {@link animate animation} loop.
 *
 * <p>Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw} does things that have to be repeated each time the canvas is
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

  animate();
}

/**
 * <p>Define an animation loop.</p>
 * Rotor should spin proportionally to the blade's {@link bladeAngle pitch}.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame()}
 */
const animate = () => {
  if (!paused) {
    const speed = Math.abs(bladeAngle / 10) + 1;

    rotorDummy.rotateZ(rotorRotation == direction.CCW ? speed : -speed);

    draw();
    requestAnimationFrame(animate);
  }
};
