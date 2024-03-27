/**
 * @file
 *
 * Summary.
 * <p>Hierarchical object using a matrix stack.</p>
 *
 * @author Paulo Roma
 * @since 27/09/2016
 * @see <a href="/cwdc/13-webgl/homework/hw3/Hierarchy.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/Hierarchy.js">source</a>
 * @see <a href="/roma/books/Computer Graphics/Computer Graphics (3rd Edition).pdf#page=189">Foley</a>
 * @see <a href="https://www.cs.drexel.edu/~david/Classes/ICG/Lectures_new/L-14_HierchModels.pdf">Hierarchical Modeling</a>
 * @see <img src="/cwdc/13-webgl/homework/hw3/robot-full.png" width="256" title="Danger, Will Robson!!"> <img src="/cwdc/13-webgl/homework/hw3/robot-lis.png" width="256" title="Danger, Will Robson!!">
 */

"use strict";

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 */
var gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexNormalBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 */
var lightingShader;

/**
 * Joint angles.
 * @type {Object<{String:Number}>}
 */
var joint = {
  body: 10.0,
  torso: 30.0,
  shoulder: 45.0,
  arm: 45.0,
  hand: 90.0,
  head: 10.0,
};

/**
 * Transformation matrix applied to all objects in the scene.
 * @type {Matrix4}
 */
var bodyMatrix = new Matrix4()
  .setTranslate(0, 0, 0)
  .rotate(joint.body, 0, 1, 0);

/**
 * Transformation matrix applied to objects connected to the torso.
 * @type {Matrix4}
 */
var torsoMatrix = new Matrix4()
  .setTranslate(0, 0, 0)
  .rotate(joint.torso, 0, 1, 0);

/**
 * Left shoulder: half torso width + half shoulder = 5+1.5
 * @type {Matrix4}
 */
var LshoulderMatrix = new Matrix4()
  .setTranslate(6.5, 2, 0)
  .translate(0, 2, 0)
  .rotate(-joint.shoulder, 1, 0, 0)
  .translate(0, -2, 0);

/**
 * Right shoulder: half torso width + half shoulder = -5-1.5
 * @type {Matrix4}
 */
var RshoulderMatrix = new Matrix4()
  .setTranslate(-6.5, 2, 0)
  .translate(0, 2, 0)
  .rotate(-joint.shoulder, 1, 0, 0)
  .translate(0, -2, 0);

/**
 * Shoulder length = 5
 * @type {Matrix4}
 */
var armMatrix = new Matrix4()
  .setTranslate(0, -5, 0)
  .translate(0, 2.5, 1.0)
  .rotate(-joint.arm, 1, 0, 0)
  .translate(0, -2.5, -1.0);

/**
 * Half arm length + half hand length = 2.5 + 1.5
 * @type {Matrix4}
 */
var handMatrix = new Matrix4()
  .setTranslate(0, -4, 0)
  .rotate(joint.hand, 0, 1, 0);

/**
 * Half torso height + half edge heigh = 5 + 2
 * @type {Matrix4}
 */
var headMatrix = new Matrix4()
  .setTranslate(0, 7, 0)
  .rotate(joint.head, 0, 1, 0);

/**
 * Leg length
 * @type {Matrix4}
 */
var legMatrix = new Matrix4().setTranslate(0, -10, 0);

/**
 * Leg length + half torso + foot length = 11 + 5 + 0.5
 * @type {Matrix4}
 */
var footMatrix = new Matrix4().setTranslate(0, -15.5, 0);

var torsoMatrixLocal = new Matrix4().setScale(10, 10, 5);

/**
 * 3 x 5 x 2 shoulder
 * @type {Matrix4}
 */
var shoulderMatrixLocal = new Matrix4().setScale(3, 5, 2);

var armMatrixLocal = new Matrix4().setScale(3, 5, 2);
var handMatrixLocal = new Matrix4().setScale(1, 3, 3);
var headMatrixLocal = new Matrix4().setScale(4, 4, 4);

/**
 * 3.0 width and 11.0 length
 * @type {Matrix4}
 */
var legMatrixLocal = new Matrix4().setScale(3, 11, 2);

/**
 * 6 x 0.5 x 6 foot
 * @type {Matrix4}
 */
var footMatrixLocal = new Matrix4().setScale(6, 0.5, 6);

/**
 * Camera position.
 * @type {Array<Number>}
 */
var eye = [20, 10, 40];

/**
 * View matrix.
 * @type {Matrix4}
 */
// prettier-ignore
var viewMatrix = new Matrix4().setLookAt(
  ...eye,   // eye
  0, 0, 0,  // at - looking at the origin
  0, 1, 0   // up vector - y axis
);

/**
 * Initial View matrix.
 * @type {Matrix4}
 */
var vMatrix = new Matrix4(viewMatrix);

/**
 * Model matrix.
 * @type {Matrix4}
 */
var modelMatrix = new Matrix4();

/**
 * Returns the magnitude (length) of a vector.
 * @param {Array<Number>} v n-D vector.
 * @returns {Number} vector length.
 * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 */
var vecLen = (v) =>
  Math.sqrt(v.reduce((accumulator, value) => accumulator + value * value, 0));

/**
 * View distance.
 * @type {Number}
 */
var viewDistance = vecLen(eye);

/**
 * Here use aspect ratio 3/2 corresponding to canvas size 600 x 400.
 * @type {Matrix4}
 */
var projection = new Matrix4().setPerspective(45, 1.5, 0.1, 1000);

/**
 * Object to enable rotation by mouse dragging (arcball).
 * @type {SimpleRotator}
 */
var rotator;

/**
 * Rotation axis.
 * @type {Number}
 */
var axis = "y";

/**
 * Turn autorotate ON/OFF.
 * @type {Boolean}
 */
var paused = true;

/**
 * Color array in RGBA.
 * @type {Object<{String: Float32Array}>}
 */
var color = {
  red: new Float32Array([1.0, 0.0, 0.0, 1.0]),
  green: new Float32Array([0.0, 1.0, 0.0, 1.0]),
  blue: new Float32Array([0.0, 0.0, 1.0, 1.0]),
  yellow: new Float32Array([1.0, 1.0, 0.0, 1.0]),
  magenta: new Float32Array([1.0, 0.0, 1.0, 1.0]),
  cyan: new Float32Array([0.0, 1.0, 1.0, 1.0]),
  white: new Float32Array([1.0, 1.0, 1.0, 1.0]),
  black: new Float32Array([0.0, 0.0, 0.0, 1.0]),
};

/**
 * A very basic stack class,
 * for keeping a hierarchy of transformations.
 * @class
 */
class Stack {
  /**
   * Constructor.
   * @constructs Stack
   */
  constructor() {
    /**
     * Array for holding the stack elements.
     * @type {Float32Array}
     */
    this.elements = [];

    /**
     * Top of the stack.
     * @type {Number}
     */
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
      var temp = this.elements[this.t];
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
 *
 * (Note this is a "self-invoking" anonymous function.)
 *
 * @type {cube_data}
 */
var cube = (() => {
  // vertices of cube
  // prettier-ignore
  var rawVertices = new Float32Array([
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5]
  );

  // prettier-ignore
  var rawColors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,  // red
    0.0, 1.0, 0.0, 1.0,  // green
    0.0, 0.0, 1.0, 1.0,  // blue
    1.0, 1.0, 0.0, 1.0,  // yellow
    1.0, 0.0, 1.0, 1.0,  // magenta
    0.0, 1.0, 1.0, 1.0,  // cyan
  ]);

  // prettier-ignore
  var rawNormals = new Float32Array([
    0, 0, 1,
    1, 0, 0,
    0, 0, -1,
    -1, 0, 0,
    0, 1, 0,
    0, -1, 0
  ]);

  // prettier-ignore
  var indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,  // +z face
    1, 5, 6, 1, 6, 2,  // +x face
    5, 4, 7, 5, 7, 6,  // -z face
    4, 0, 3, 4, 3, 7,  // -x face
    3, 2, 6, 3, 6, 7,  // +y face
    4, 5, 1, 4, 1, 0   // -y face
  ]);

  var verticesArray = [];
  var colorsArray = [];
  var normalsArray = [];
  for (var i = 0; i < 36; ++i) {
    // for each of the 36 vertices...
    var face = Math.floor(i / 6);
    var index = indices[i];

    // (x, y, z): three numbers for each point
    for (var j = 0; j < 3; ++j) {
      verticesArray.push(rawVertices[3 * index + j]);
    }

    // (r, g, b, a): four numbers for each point
    for (var j = 0; j < 4; ++j) {
      colorsArray.push(rawColors[4 * face + j]);
    }

    // three numbers for each point
    for (var j = 0; j < 3; ++j) {
      normalsArray.push(rawNormals[3 * face + j]);
    }
  }

  /**
   * Returned value is an object with four attributes:
   * numVertices, vertices, colors, and normals.
   *
   * @return {Object<{numVertices: Number,
   *                  vertices: Float32Array,
   *                   colors: Float32Array,
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
 * perpendicular to surfaces after a linear transformation.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @returns {Float32Array} modelview transposed inverse.
 */
function makeNormalMatrixElements(model, view) {
  var n = new Matrix4(view).multiply(model);
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
 * @param {WebGLContextEvent} event keyboard event.
 * @return {String | null}
 * @see http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  let charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * <p>Handler for keydown events.</p>
 * Adjusts object rotations.
 * @param {WebGLContextEvent} event keyboard event.
 */
function handleKeyPress(event) {
  var ch = getChar(event);
  var d;
  switch (ch) {
    case "b":
      joint.body += 15;
      bodyMatrix.setTranslate(0, 0, 0).rotate(joint.body, 0, 1, 0);
      break;
    case "B":
      joint.body -= 15;
      bodyMatrix.setTranslate(0, 0, 0).rotate(joint.body, 0, 1, 0);
      break;
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
      var currentShoulderRot = new Matrix4()
        .setTranslate(0, 2, 0)
        .rotate(-joint.shoulder, 1, 0, 0)
        .translate(0, -2, 0);
      LshoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
      RshoulderMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
      break;
    case "S":
      joint.shoulder -= 15;
      var currentShoulderRot = new Matrix4()
        .setTranslate(0, 2, 0)
        .rotate(-joint.shoulder, 1, 0, 0)
        .translate(0, -2, 0);
      LshoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
      RshoulderMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
      break;
    case "a":
      joint.arm += 15;
      // rotate arm clockwise about its top front corner
      var currentArm = new Matrix4()
        .setTranslate(0, 2.5, 1.0)
        .rotate(-joint.arm, 1, 0, 0)
        .translate(0, -2.5, -1.0);
      armMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      break;
    case "A":
      joint.arm -= 15;
      var currentArm = new Matrix4()
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
      // Up pressed
      d = rotator.getViewDistance();
      d = Math.min(d + 1, 90);
      rotator.setViewDistance(d);
      break;
    case "ArrowDown":
      // Down pressed
      d = rotator.getViewDistance();
      d = Math.max(d - 1, 20);
      rotator.setViewDistance(d);
      break;
    case "x":
    case "y":
    case "z":
      axis = ch;
      break;
    case " ":
      paused = !paused;
      animate();
      break;
    case "o":
      modelMatrix.setIdentity();
      rotator.setViewMatrix(vMatrix.elements);
      rotator.setViewDistance(viewDistance);
      axis = "x";
      break;
    default:
      return;
  }
  draw();
}

/**
 * <p>Helper function.</p>
 * Renders the cube based on the model transformation
 * on top of the stack and the given local transformation.
 * @param {Matrix4} matrixStack matrix on top of the stack;
 * @param {Matrix4} matrixLocal local transformation.
 * @param {Float32Array} c cube color.
 */
function renderCube(matrixStack, matrixLocal, c = color.green) {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
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

  var loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "u_Color");
  gl.uniform4fv(loc, c);
  var loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

  // transform using current model matrix on top of stack
  var current = new Matrix4(matrixStack.top()).multiply(matrixLocal);
  current = new Matrix4(modelMatrix).multiply(current);
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
 * <p>Code to actually render our geometry.</p>
 * @param {Boolean} useRotator whether a {@link SimpleRotator} should be used.
 */
function draw(useRotator = true) {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (useRotator) viewMatrix.elements = rotator.getViewMatrix();

  // set up the matrix stack
  var s = new Stack();
  s.push(bodyMatrix);
  s.push(new Matrix4(s.top()).multiply(torsoMatrix));
  renderCube(s, torsoMatrixLocal, color.blue);

  // left shoulder relative to torso
  s.push(new Matrix4(s.top()).multiply(LshoulderMatrix));
  renderCube(s, shoulderMatrixLocal, color.red);

  // arm relative to shoulder
  s.push(new Matrix4(s.top()).multiply(armMatrix));
  renderCube(s, armMatrixLocal, color.white);

  // hand relative to arm
  s.push(new Matrix4(s.top()).multiply(handMatrix));
  renderCube(s, handMatrixLocal, color.green);
  s.pop();
  s.pop();
  s.pop();

  // right shoulder relative to torso
  s.push(new Matrix4(s.top()).multiply(RshoulderMatrix));
  renderCube(s, shoulderMatrixLocal, color.red);

  // arm relative to shoulder
  s.push(new Matrix4(s.top()).multiply(armMatrix));
  renderCube(s, armMatrixLocal, color.white);

  // hand relative to arm
  s.push(new Matrix4(s.top()).multiply(handMatrix));
  renderCube(s, handMatrixLocal, color.green);
  s.pop();
  s.pop();
  s.pop();

  // head relative to torso
  s.push(new Matrix4(s.top()).multiply(headMatrix));
  renderCube(s, headMatrixLocal, color.magenta);
  s.pop();
  s.pop();

  // leg relative to body
  s.push(new Matrix4(s.top()).multiply(legMatrix));
  renderCube(s, legMatrixLocal, color.cyan);
  s.pop();
  // foot relative to body
  s.push(new Matrix4(s.top()).multiply(footMatrix));
  renderCube(s, footMatrixLocal, color.black);
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
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.</p>
 */
function mainEntrance() {
  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

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

  // get the rendering context for WebGL
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById(
    "vertexLightingShader",
  ).textContent;
  var fshaderSource = document.getElementById(
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
  draw();
}

/**
 * <p>Define an animation loop as a {@link frame closure}.</p>
 * Start drawing!
 */
var animate = (() => {
  const increment = 0.5;
  /** @type {Number} */
  var requestID = 0;
  const axes = {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1],
  };

  /**
   * Callback to keep drawing frames.
   * @callback frame
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
   */
  return () => {
    draw();
    if (requestID != 0) {
      cancelAnimationFrame(requestID);
      requestID = 0;
    }
    if (!paused) {
      modelMatrix.rotate(increment, ...axes[axis]);
      requestID = requestAnimationFrame(animate);
    }
  };
})();

/**
 * <p>Loads the {@link mainEntrance application}.</p>
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
addEventListener("load", (event) => {
  mainEntrance();
});
