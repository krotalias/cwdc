/**
 *  @file
 *
 *  Summary.
 *  <p>Blobby Man.</p>
 *
 *  Description.
 *  <p>
 *  Based upon Jim Blim's Corner:
 * {@link https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4057037 Nested Transformations and The Blobby Man}<br>
 *  IEEE Computer Graphics & Applications, No. 10, October 1987
 *  </p>
 * <p>There is only one graphical primitive corresponding to a
 * {@link https://threejs.org/docs/#api/en/geometries/SphereGeometry sphere},<br>
 * which is scaled, rotated and translated for each joint in the
 * <a href="/cwdc/13-webgl/Assignment_3/5.hierarchy.pdf">hierarchy</a>.</p>
 *
 *  @author Flavia Roma Cavalcanti
 *  @since 07/11/2015.
 *  @license LGPL.
 *  @see <a href="/cwdc/13-webgl/homework/final/blobby.html">link</a>
 *  @see <a href="/cwdc/13-webgl/homework/final/blobby.js">source</a>
 *  @see <a href="/cwdc/13-webgl/lib/teal_book/cuon-matrix.js">cuon-matrix</a>
 *  @see <a href="/cwdc/13-webgl/homework/presentation.pdf">tutorial</a>
 *  @see <a href="/cwdc/13-webgl/videos/Macarena.mp4">vídeo</a>
 *  @see <img src="../blobby.png">
 */

"use strict";

/**
 * @class
 * A very basic stack class.
 */
class Stack {
  constructor() {
    /**
     * Transformation array.
     * @type {Array<Matrix4>}
     */
    this.elements = [];

    /**
     * Index of the stack top.
     * @type {Number}
     */
    this.t = 0;
  }

  /**
   * Push a transformation onto the stack.
   * @param {Matrix4} m a transformation matrix.
   */
  push(m) {
    this.elements[this.t++] = m;
  }

  /**
   * Return transformation on top of the stack.
   * @return {Matrix4} matrix on top.
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
   * Pop transformation on top of the stack.
   * @return {Matrix4} the matrix on top of the stack.
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
   * Return whether the stack is empty.
   * @return {boolean} true if the stack is empty.
   */
  isEmpty() {
    return this.t <= 0;
  }
}

/**
 * Given an instance of
 * <ul>
 * <li><a href="https://threejs.org/build/three.js">THREE.BufferGeometry</a></li>
 * </ul>
 * returns an object containing raw data for
 * vertices, indices, texture coordinates, and normal vectors.
 * @param {THREE.BufferGeometry} geom THREE.SphereGeometry, THREE.PlaneGeometry.
 * @return {Object<{vertices: Float32Array, normals: Float32Array, texCoords: Float32Array, indices: Uint16Array}>}
 * @see https://threejs.org/docs/#api/en/core/BufferGeometry
 */
function getModelData(geom) {
  return {
    vertices: geom.getAttribute("position").array,
    normals: geom.getAttribute("normal").array,
    texCoords: geom.getAttribute("uv").array,
    indices: geom.index.array,
  };
}

/**
 * Configure texture.
 * @param {HTMLImageElement} image texture image.
 */
function configureTexture(image) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // bind the shader
  gl.useProgram(texturedShader);
  gl.uniform1i(gl.getUniformLocation(texturedShader, "texture"), 0);
}

/**
 * Invert vector directions.
 * @param {Vector4} v vector.
 * @return {Vector4} inverted vector.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
 */
function reverseDirection(v) {
  return v.map(function (item) {
    return -item;
  });
}

/**
 * Returns elements of the transpose of the inverse of the modelview matrix.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @return {Float32Array} modelview matrix transposed inverse.
 */
function makeNormalMatrixElements(model, view) {
  var n = new Matrix4(view).multiply(model);
  n.invert();
  n.transpose();

  // take just the upper-left 3x3 submatrix
  n = n.elements;
  // prettier-ignore
  return new Float32Array([
    n[0], n[1], n[2],
    n[4], n[5], n[6],
    n[8], n[9], n[10],
  ]);
}

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
var gl;

/**
 * @type {HTMLAudioElement}
 */
var player;

/**
 * @type {Boolean}
 */
var paused = false;

/**
 * Delay for the steps in the macarena animation.
 * @type {Number}
 */
var delay = 60;

/**
 * Delay for the jump in the macarena animation.
 * @type {Number}
 */
var delay2 = 10;

/**
 * Holds all callbacks from setTimeout. Used for canceling all callbacks.
 * @type {Array<timeoutID>}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
 */
var callBackArray = [];

/**
 * Global stack.
 * @type {Stack}
 */
var stk = new Stack();

var XAXIS = new Float32Array([-1.0, 0.0, 0.0]);
var YAXIS = new Float32Array([0.0, -1.0, 0.0]);
var ZAXIS = new Float32Array([0.0, 0.0, -1.0]);

var red = new Float32Array([1.0, 0.0, 0.0, 1.0]);
var blue = new Float32Array([0.0, 0.0, 1.0, 1.0]);
var green = new Float32Array([0.0, 1.0, 0.0, 1.0]);
var yellow = new Float32Array([0.8, 0.8, 0.0, 1.0]);
var skin = new Float32Array([0.937, 0.815, 0.811]);
var white = new Float32Array([1.0, 1.0, 1.0, 1.0]);
var bgcolor = new Float32Array([0.9, 0.9, 0.9, 1.0]); // background color
var flcolor = new Float32Array([1.0, 1.0, 1.0, 1.0]); // floor color
var glColor = white;

var FOV = 45.0,
  ZN = 1.17,
  ZF = 20.7;
var XSCR = -0.1,
  YSCR = 1.6,
  ZSCR = 7.9;
var XM = 0.0,
  YM = 0.0,
  ZM = 1.75;

// rotate Blobby
var JUMP = 0.0;
var TURN = 0.0;

// rotate the world
var BACK = -90.0; /* x */
var SPIN = -30.0; /* z */
var TILT = 0.0; /* x */

// joint angles
var ROT = 0.0; /* z - rotate torso around hip */
var EXTEN = 0.0; /* x - rotate torso forward or backward */
var BTWIS = 0.0; /* y - rotate torso sideways */

var NOD = -25.0; /* x - rotate head forward or backward */
var NECK = 28.0; /* z - rotate head sideways */

var RANKL = 0.0; /* x - rotate right foot up or down */
var LANKL = 0.0; /* x - rotate left foot up or down */
var RFOOT = 0.0; /* z - rotate right foot sideways */
var LFOOT = 0.0; /* z - rotate left foot sideways */

var RHIP = 105.0; /* z - rotate right leg sideways around */
var ROUT = 13.0; /* y - any axis */
var RTWIS = -86.0; /* z - rotate right leg in or out */
var RKNEE = -53.0; /* x - rotate right leg around the knee */
var RFRONT = 0.0; /* x - rotate right leg forward or backward */

var RHAND = 0.0; /* y - rotate right hand around wrist */
var LHAND = 0.0; /* y - rotate left hand around wrist */

var LHIP = 0.0; /* z */
var LOUT = 0.0; /* y */
var LTWIS = 0.0; /* z */
var LKNEE = 0.0; /* x */
var LFRONT = 0.0; /* x */

var LSID = -45.0; /* y - rotate left arm sideways */
var LSHOU = 0.0; /* x - rotate left arm forward or backward */
var LATWIS = -90.0; /* z - rotate left arm in or out */
var LELBO = 90.0; /* x - rotate left arm around the elbo */

var RSID = 112.0; /* y */
var RSHOU = 40.0; /* x */
var RATWIS = -102.0; /* z */
var RELBO = 85.0; /* x */

/**
 * Model data (blobby parts).
 * @type {Object<{vertices: Float32Array, normals: Float32Array, texCoords: Float32Array, indices: Uint16Array}>}
 */
var sphere;

/**
 * Floor.
 * @type {Object<{vertices: Float32Array, normals: Float32Array, texCoords: Float32Array, indices: Uint16Array}>}
 */
var planeModel;

/**
 * Handle to a vertex buffer on the GPU for the spheres.
 * @type {WebGLBuffer}
 */
var vertexBuffer;
var indexBuffer;
var vertexNormalBuffer;
var texCoordBuffer;

/**
 * Handle to a vertex buffer on the GPU for the plane.
 * @type {WebGLBuffer}
 */
var vertexBufferPlane;
var indexBufferPlane;
var vertexNormalBufferPlane;
var texCoordBufferPlane;

/**
 * Handle to the compiled {@link renderSphere lighting shader} program on the GPU.
 * @type {WebGLShader}
 */
var lightingShader;

/**
 * Handle to the compiled {@link GPlane texture shader} program on the GPU.
 * @type {WebGLShader}
 */
var texturedShader;

/**
 * Transformation matrix that is the root of the hierarchy of objects defining blobby man.
 * @type {Matrix4}
 */
var bodyMatrix = new Matrix4();

/**
 * View matrix.
 * @type {Matrix4}
 */
// prettier-ignore
var view = new Matrix4().setLookAt(
  0, 0, 0, // eye
  0, 0, 1, // at - looking at the origin
  0, -1, 0 // up vector - y axis
);

/**
 * <p>Projection matrix.</p>
 * Aspect ratio is 1 corresponding to a canvas size 512 x 512
 * @type {Matrix4}
 */
var projection = new Matrix4().setPerspective(FOV, 1.0, ZN, ZF);

/**
 * Translate keypress events to strings.
 * @param {KeyboardEvent} event key pressed.
 * @return {String} typed character.
 * @see  http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  let charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Apply a single movement and the sway to blobby.
 * @param {Number} t movement duration.
 * @param {Function} move1 movement.
 * @param {Function} move sway.
 * @param {Number} sign +1 or -1.
 * @return {Number} total time.
 */
function applyMoveAndSway(t, move1, move, sign) {
  for (var i = 0; i < 4; ++i) {
    callBackArray.push(
      setTimeout(function () {
        move1();
        move(sign);
      }, (t += delay))
    );
  }
  return t;
}

/**
 * Apply a single movement to blobby.
 * @param {Number} t movement duration.
 * @param {Function} move movement.
 * @return {Number} total time.
 */
function applyMove(t, move) {
  for (var i = 0; i < 8; ++i) {
    callBackArray.push(
      setTimeout(function () {
        move();
      }, (t += delay2))
    );
  }
  return t;
}

/**
 * What to do when the Sway button is clicked.
 */
function swayCallBack() {
  stopCallBack();
  var t = sway(true);
  // console.log ( "sway = " + t );
  document.getElementById("timeBoxDiv").innerHTML = t;
  paused = true;
}

/**
 * What to do when the Dance button is clicked.
 * @param {Boolean} loop whether to start an endless dancing loop.
 */
function danceCallBack(loop) {
  if (typeof loop === "undefined") loop = true;
  var dt;
  if (paused) {
    dt = 0;
    paused = false;
  } else dt = 7500;
  stopCallBack();
  sway(false, dt);
  var t = macarena(loop, dt);
  //console.log("macarena = " + t);
  document.getElementById("timeBoxDiv").innerHTML = t - dt;
  player.play();
}

/**
 * What to do when the Stop button is clicked.
 */
function stopCallBack() {
  document.getElementById("timeBoxDiv").innerHTML = 0;
  callBackArray.map(clearTimeout);
  callBackArray.length = 0;
  player.pause();
  paused = true;
}

/**
 * Handler for key press events adjusts object rotations.
 * @param {KeyboardEvent} event key pressed.
 */
function handleKeyPress(event) {
  var ch = getChar(event);
  switch (ch) {
    case "b":
      SPIN += 15;
      break;
    case "B":
      SPIN -= 15;
      break;
    case "t":
      ROT += 15;
      break;
    case "T":
      ROT -= 15;
      break;
    case "h":
      NECK += 15;
      break;
    case "H":
      NECK -= 15;
      break;
    case "s":
      LSHOU += 15;
      RSHOU += 15;
      break;
    case "S":
      LSHOU -= 15;
      RSHOU -= 15;
      break;
    case "d":
      LATWIS += 15;
      RATWIS += 15;
      break;
    case "D":
      LATWIS -= 15;
      RATWIS -= 15;
      break;
    case "a":
      LELBO += 15;
      RELBO += 15;
      break;
    case "A":
      LELBO -= 15;
      RELBO -= 15;
      break;
    case "l":
      LKNEE += 15;
      RKNEE += 15;
      break;
    case "L":
      LKNEE -= 15;
      RKNEE -= 15;
      break;
    case "f":
      LHAND += 15;
      RHAND += 15;
      break;
    case "F":
      LHAND -= 15;
      RHAND -= 15;
      break;
    case "M":
    case "m":
      danceCallBack(false);
      break;
    case "w":
      resetAngles();
      stopCallBack();
      var t = 0; // accumulated time counter
      t = applyMoveAndSway(t, raiseLeftArm, lsway, +1);
      t = applyMoveAndSway(t, raiseLeftArm, lsway, -1);
      break;
    case "W":
      resetAngles();
      stopCallBack();
      var t = 0; // accumulated time counter
      t = applyMoveAndSway(t, raiseRightArm, rsway, +1);
      t = applyMoveAndSway(t, raiseRightArm, rsway, -1);
      break;
    case "J":
    case "j":
      resetAngles();
      stopCallBack();
      var t = 0; // accumulated time counter
      t = applyMove(t, bendForJump);
      t = applyMove(t, stretchForJump);
      t = applyMove(t, jumpAndTurn);
      t = applyMove(t, landFromJump);
      t = applyMove(t, dampenJump);
      t = applyMove(t, finishJump);
      break;
    default:
      return;
  }
}

/**
 *  Helper function that renders the sphere based on the model transformation
 *  on top of the stack and the given local transformation.
 *  @param {Float32Array} color sphere color.
 */
function renderSphere(color) {
  if (typeof color === "undefined") color = glColor;
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

  var vTexCoord = 1; //gl.getAttribLocation( lightingShader, 'vTexCoord' );
  if (vTexCoord < 0) {
    console.log("Failed to get the storage location of vTexCoord");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  //gl.enableVertexAttribArray(vTexCoord);

  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  //gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  //gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );

  var loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "u_Color");
  gl.uniform4f(loc, color[0], color[1], color[2], 1.0);
  var loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 0.0, 5.0, -5.0, 1.0);

  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

  // transform using current model matrix on top of stack
  var current = new Matrix4(stk.top());
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, view)
  );

  gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);

  //https://www.khronos.org/registry/webgl/specs/1.0/#ATTRIBS_AND_RANGE_CHECKING (section 6.5)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);
}

function head() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.4);
  t.scale(0.2, 0.23, 0.3);
  renderSphere();
  stk.pop();

  // nose
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, -0.255, 0.42);
  t.scale(0.035, 0.075, 0.035);
  renderSphere();
  stk.pop();

  // neck
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.07);
  t.scale(0.065, 0.065, 0.14);
  renderSphere();
  stk.pop();

  // mouth
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, -0.162, 0.239);
  t.scale(0.0533, 0.0508, 0.0506);
  renderSphere(red);
  stk.pop();

  // left eye
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.1, -0.175, 0.5);
  t.scale(0.042, 0.046, 0.042);
  renderSphere(blue);
  stk.pop();

  // right eye
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(-0.1, -0.175, 0.5);
  t.scale(0.042, 0.046, 0.042);
  renderSphere(blue);
  stk.pop();
}

function uparm() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.275);
  t.scale(0.09, 0.09, 0.275);
  renderSphere();
  stk.pop();
}

function lowarm() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.25);
  t.scale(0.08, 0.08, 0.25);
  renderSphere();
  stk.pop();
}

function hand() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.116);
  t.scale(0.052, 0.091, 0.155);
  renderSphere();
  stk.pop();
}

function leftarm() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  uparm();
  t.translate(0.0, 0.0, -0.55);
  t.rotate(LELBO, XAXIS[0], XAXIS[1], XAXIS[2]);
  lowarm();
  t.translate(0.0, 0.0, -0.5);
  t.rotate(LHAND, YAXIS[0], YAXIS[1], YAXIS[2]);
  hand();
  stk.pop();
}

function rightarm() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  uparm();
  t.translate(0.0, 0.0, -0.55);
  t.rotate(RELBO, XAXIS[0], XAXIS[1], XAXIS[2]);
  lowarm();
  t.translate(0.0, 0.0, -0.5);
  t.rotate(RHAND, YAXIS[0], YAXIS[1], YAXIS[2]);
  hand();
  stk.pop();
}

function shoulder() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.45, 0.153, 0.12);
  renderSphere();
  stk.pop();

  glColor = skin;
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.153);
  t.rotate(NOD, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(NECK, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  head();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(-0.45, 0.0, 0.0);
  t.rotate(LSID, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(LSHOU, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(LATWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  leftarm();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.45, 0.0, 0.0);
  t.rotate(RSID, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(RSHOU, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(RATWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  rightarm();
  stk.pop();
}

function body() {
  glColor = white;
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.62);
  t.scale(0.306, 0.21, 0.5);
  renderSphere();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 1.0);
  t.rotate(
    EXTEN,
    XAXIS[0],
    XAXIS[1],
    XAXIS[2]
  ); /* the shoulder rotates twice */
  t.rotate(BTWIS, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(ROT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  shoulder();
  stk.pop();
}

function thigh() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.425);
  t.scale(0.141, 0.141, 0.425);
  renderSphere();
  stk.pop();
}

function calf() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.05, 0.05, 0.05);
  renderSphere();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.425);
  t.scale(0.1, 0.1, 0.425);
  renderSphere();
  stk.pop();
}

function foot() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.05, 0.04, 0.04);
  renderSphere();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.05, -0.05);
  t.scale(0.04, 0.04, 0.04);
  renderSphere();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, -0.15, -0.05);
  t.rotate(10.0, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.scale(0.08, 0.19, 0.05);
  renderSphere(skin);
  stk.pop();
}

function rightleg() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(RFRONT, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(RHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(ROUT, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(-RHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(RTWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  thigh();
  t.translate(0.0, 0.0, -0.85);
  t.rotate(RKNEE, XAXIS[0], XAXIS[1], XAXIS[2]);
  calf();
  t.translate(0.0, 0.0, -0.84);
  t.rotate(RANKL, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(RFOOT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  foot();
  stk.pop();
}

function leftleg() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(LFRONT, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(LHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(LOUT, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(-LHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(LTWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  thigh();
  t.translate(0.0, 0.0, -0.85);
  t.rotate(LKNEE, XAXIS[0], XAXIS[1], XAXIS[2]);
  calf();
  t.translate(0.0, 0.0, -0.84);
  t.rotate(LANKL, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(LFOOT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  foot();
  stk.pop();
}

function TORSO() {
  glColor = blue;
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(-0.178, 0.0, 0.0);
  leftleg();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.178, 0.0, 0.0);
  rightleg();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.08);
  t.scale(0.275, 0.152, 0.153);
  renderSphere();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(EXTEN, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(BTWIS, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(ROT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  body();
  stk.pop();
}

/**
 * Draw the floor plane.
 */
function GPlane() {
  // bind the shader
  gl.useProgram(texturedShader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(texturedShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var normalIndex = gl.getAttribLocation(texturedShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  var vTexCoord = gl.getAttribLocation(texturedShader, "vTexCoord");
  if (vTexCoord < 0) {
    console.log("Failed to get the storage location of vTexCoord");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  gl.enableVertexAttribArray(vTexCoord);

  // draw the plane
  // bind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane);
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);

  var loc = gl.getUniformLocation(texturedShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(texturedShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(texturedShader, "u_Color");
  gl.uniform4f(loc, flcolor[0], flcolor[1], flcolor[2], 1.0);
  var loc = gl.getUniformLocation(texturedShader, "lightPosition");
  gl.uniform4f(loc, 0.0, -10.0, 5.0, 1.0);

  var modelMatrixloc = gl.getUniformLocation(texturedShader, "model");
  var normalMatrixLoc = gl.getUniformLocation(texturedShader, "normalMatrix");

  // transform using current model matrix on top of stack
  var current = new Matrix4(stk.top());
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  //gl.uniformMatrix3fv(normalMatrixLoc, false, reverseDirection(makeNormalMatrixElements(current, view)));
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, view)
  );

  // draw
  gl.drawElements(
    gl.TRIANGLES,
    planeModel.indices.length,
    gl.UNSIGNED_SHORT,
    0
  );

  gl.useProgram(null);
}

/**
 * Add a new Blobby to the scene translated by (DX,DY).
 * @param {Number} DX horizontal translation.
 * @param {Number} DY vertical translation.
 */
function addBlobby(DX, DY) {
  bodyMatrix.setTranslate(XSCR, YSCR, ZSCR);
  bodyMatrix
    .rotate(BACK, XAXIS[0], XAXIS[1], XAXIS[2])
    .rotate(SPIN, ZAXIS[0], ZAXIS[1], ZAXIS[2])
    .rotate(TILT, XAXIS[0], XAXIS[1], XAXIS[2]);

  bodyMatrix.translate(XM + DX, YM + DY, ZM);

  // for jumping and spinning at the dance
  bodyMatrix.translate(0, 0, JUMP);
  bodyMatrix.rotate(TURN, ZAXIS[0], ZAXIS[1], ZAXIS[2]);

  stk.push(bodyMatrix);
  TORSO();
  stk.pop();
}

/**
 * Code to actually render our geometry.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  bodyMatrix.setTranslate(XSCR, YSCR, ZSCR);
  bodyMatrix
    .rotate(BACK, XAXIS[0], XAXIS[1], XAXIS[2])
    .rotate(SPIN, ZAXIS[0], ZAXIS[1], ZAXIS[2])
    .rotate(TILT, XAXIS[0], XAXIS[1], XAXIS[2]);

  stk.push(bodyMatrix);
  GPlane();
  stk.pop();

  addBlobby(-2, 0);
  addBlobby(0, 0);
  addBlobby(2, 0);

  if (!stk.isEmpty()) {
    console.log("Warning: pops do not match pushes");
  }
}

/**
 * <p>Entry point when page is loaded. </p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw} does things that have to be repeated each time the canvas is drawn.
 */
function mainEntrance() {
  /**
   * Screen events.
   */
  function handleWindowResize() {
    let h = window.innerHeight;
    let w = window.innerWidth;
    if (h > w) {
      h = w / aspect; // aspect < 1
    } else {
      w = h * aspect; // aspect > 1
    }
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    // projection = new Matrix4().setPerspective(FOV, aspect, ZN, ZF);
  }

  window.addEventListener("resize", handleWindowResize, false);

  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");
  // player = document.getElementsByTagName("audio")[0];
  player = document.getElementById("audio1");

  // key handler
  window.addEventListener("keydown", (event) => {
    handleKeyPress(event);
  });

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  let aspect = canvas.width / canvas.height;
  handleWindowResize();

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById(
    "vertexLightingShader"
  ).textContent;
  var fshaderSource = document.getElementById(
    "fragmentLightingShader"
  ).textContent;
  var vshaderTextured = document.getElementById(
    "vertexTexturedShader"
  ).textContent;
  var fshaderTextured = document.getElementById(
    "fragmentTexturedShader"
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  lightingShader = gl.program;

  if (!initShaders(gl, vshaderTextured, fshaderTextured)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  texturedShader = gl.program;
  gl.useProgram(null);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  indexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // basic sphere
  sphere = getModelData(new THREE.SphereGeometry(1, 48, 24));

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

  // buffer for tex coords
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log("Failed to create the texture buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW);

  // plane for "floor"
  planeModel = getModelData(new THREE.PlaneGeometry(6, 6));

  // buffer for vertex positions for triangles
  vertexBufferPlane = gl.createBuffer();
  indexBufferPlane = gl.createBuffer();
  if (!vertexBufferPlane) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
  gl.bufferData(gl.ARRAY_BUFFER, planeModel.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, planeModel.indices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBufferPlane = gl.createBuffer();
  if (!vertexNormalBufferPlane) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);

  // choose face normals, vertex normals, or wacky normals
  gl.bufferData(gl.ARRAY_BUFFER, planeModel.normals, gl.STATIC_DRAW);

  // buffer for tex coords
  texCoordBufferPlane = gl.createBuffer();
  if (!texCoordBufferPlane) {
    console.log("Failed to create the texture buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane);
  gl.bufferData(gl.ARRAY_BUFFER, planeModel.texCoords, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  // Initialize a texture
  //
  var image = document.getElementById("texImage");

  configureTexture(image);

  /**
   * A closure to render the application and display the fps.
   *
   * @return {loop} animation callback.
   * @function
   * @global
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   */
  var animate = (function () {
    // time in milliseconds
    let previousTimeStamp = Date.now();
    let numberOfFramesForFPS = 0;
    let fpsCounter = document.getElementById("fps");
    let currentTime;

    /**
     * Define an animation loop.
     * @callback loop
     * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     */
    return () => {
      currentTime = Date.now();
      if (Math.abs(currentTime - previousTimeStamp) >= 1000) {
        fpsCounter.innerHTML = numberOfFramesForFPS;
        numberOfFramesForFPS = 0;
        previousTimeStamp = currentTime;
      }
      numberOfFramesForFPS++;
      draw();
      requestAnimationFrame(animate);
    };
  })();

  // start drawing!
  animate();
}

/**
 * Put Blobby standing still with hands on his hip.
 */
function resetAngles() {
  callBackArray.length = 0; // clear callBackArray

  TURN = 0.0;
  JUMP = 0.0;
  ROT = 0.0; /* z - rotate torso around hip */
  EXTEN = 0.0; /* x - rotate torso forward or backward */
  BTWIS = 0.0; /* y - rotate torso sideways */

  NOD = 0.0; /* x - rotate head forward or backward */
  NECK = 0.0; /* z - rotate head sideways */

  RANKL = 0.0; /* x - rotate right foot up or down */
  LANKL = 0.0; /* x - rotate left foot up or down */
  RFOOT = 0.0; /* z - rotate right foot sideways */
  LFOOT = 0.0; /* z - rotate left foot sideways */

  RHIP = 0.0; /* z - rotate right leg sideways around */
  ROUT = 0.0; /* y - any axis */
  RTWIS = 0.0; /* z - rotate right leg in or out */
  RKNEE = 0.0; /* x - rotate right leg around the knee */
  RFRONT = 0.0; /* x - rotate right leg forward or backward */

  RHAND = 0.0; /* y - rotate right hand around wrist */
  LHAND = 0.0; /* y - rotate left hand around wrist */

  LHIP = 0.0; /* z */
  LOUT = 0.0; /* y */
  LTWIS = 0.0; /* z */
  LKNEE = 0.0; /* x */
  LFRONT = 0.0; /* x */

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 45.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

/** Sway to the left. */
function lsway(sign) {
  BTWIS += 1 * sign;
  LANKL -= 5 * sign;
  LFRONT += 5.5 * sign;
  LKNEE -= 8 * sign;
}

/** sway to the right. */
function rsway(sign) {
  BTWIS -= 1 * sign;
  RANKL -= 5 * sign;
  RFRONT += 5.5 * sign;
  RKNEE -= 8 * sign;
}

/** Raise the right arm half way. */
function raiseRightArm() {
  RELBO += 10;
  RATWIS -= 6.5;
  RSHOU += 9;
}

/** Raise the left arm half way. */
function raiseLeftArm() {
  LELBO -= 10;
  LATWIS += 6.5;
  LSHOU += 9;
}

/** Put right hand on the head. */
function rightHandOnHead() {
  RSHOU += 5;
  RATWIS -= 9;
  RHAND += 2.5;
}

/** Put left hand on the head. */
function leftHandOnHead() {
  LSHOU += 5;
  LATWIS += 9;
  LHAND += 2.5;
}

/** Go back to initial position. */
function rightGoBack() {
  RSHOU -= 14;
  RATWIS += 15.5;
  RHAND -= 2.5;
  RELBO += 2;
}

/** Go back to initial position. */
function leftGoBack() {
  LSHOU -= 14;
  LATWIS -= 15.5;
  LHAND -= 2.5;
  LELBO -= 2;
}

/** Bend the knees for the jump. */
function bendForJump() {
  JUMP -= 1.0 / 30;
  LFRONT += 4.5;
  RFRONT += 4.5;
  RANKL += 3;
  LANKL += 3;
  RKNEE -= 8;
  LKNEE -= 8;
  LELBO -= 5.5;
  RELBO += 5.5;
  LSID += 4;
  RSID -= 4;
  RSHOU -= 3;
  LSHOU -= 3;
  RATWIS -= 10;
  LATWIS += 10;
  EXTEN -= 2;
}

/** Stretch the legs for the jump. */
function stretchForJump() {
  JUMP += 1.0 / 30;
  LFRONT -= 4.5;
  RFRONT -= 4.5;
  RANKL -= 5;
  LANKL -= 5;
  RKNEE += 8;
  LKNEE += 8;
  EXTEN += 1;
  LELBO += 4;
  RELBO -= 4;
  RSHOU += 3;
  LSHOU += 3;
}

/** Execute the jump and turn to the left. */
function jumpAndTurn() {
  JUMP += 1.0 / 10;
  RANKL -= 5;
  LANKL -= 5;
  EXTEN += 1;
  TURN -= 5.625;
  NOD += 2;
}

/** Put the feet on the floor. */
function landFromJump() {
  JUMP -= 1.0 / 10;
  RANKL += 5;
  LANKL += 5;
  NOD -= 2;
  TURN -= 5.625;
}

/** Dampen the jump bending the knees. */
function dampenJump() {
  JUMP -= 1.0 / 50;
  LFRONT += 3;
  RFRONT += 3;
  RANKL += 5;
  LANKL += 5;
  RKNEE -= 6;
  LKNEE -= 6;
  EXTEN -= 1;
}

/** Go back to initial position. */
function finishJump() {
  JUMP += 1.0 / 50;
  LFRONT -= 3;
  RFRONT -= 3;
  RANKL -= 3;
  LANKL -= 3;
  RKNEE += 6;
  LKNEE += 6;
  LELBO += 1.5;
  RELBO -= 1.5;
  LSID -= 4;
  RSID += 4;
  RATWIS += 10;
  LATWIS -= 10;
  EXTEN += 1;
}

/**
 * Keep swaying.
 * @param {Boolean} loop whether to start an endless dancing loop.
 * @param {Number} duration time interval in milliseconds.
 * @return {Number} total time.
 */
function sway(loop, duration) {
  var cycle = 960;
  if (typeof duration === "undefined") duration = cycle;
  var t = 0;
  resetAngles();
  for (var i = 0; i < Math.trunc(duration / cycle); i++) {
    t = applyMoveAndSway(t, function () {}, lsway, +1);
    t = applyMoveAndSway(t, function () {}, lsway, -1);
    t = applyMoveAndSway(t, function () {}, rsway, +1);
    t = applyMoveAndSway(t, function () {}, rsway, -1);
  }
  if (loop) callBackArray.push(setTimeout(sway, t, loop));
  return t;
}

/**
 * Dance the "Los del Rio", Macarena song.
 * @param {Boolean} loop whether to start an endless dancing loop.
 * @param {Number} tinit time interval in milliseconds.
 * @return {Number} total time.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
 */
function macarena(loop, tinit) {
  if (typeof tinit === "undefined") tinit = 0;
  var t = tinit; // accumulated time counter
  resetAngles();
  for (var j = 0; j < 4; j++) {
    // stretch the arms: 60*4*4=960ms
    t = applyMoveAndSway(t, raiseRightArm, lsway, +1);
    t = applyMoveAndSway(t, raiseRightArm, lsway, -1);
    t = applyMoveAndSway(t, raiseLeftArm, rsway, +1);
    t = applyMoveAndSway(t, raiseLeftArm, rsway, -1);

    // hands facing up: 60*4*4=960ms
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS -= 22;
      },
      lsway,
      +1
    ); // 22*4=88
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS -= 22;
      },
      lsway,
      -1
    ); // 22*4=88 (176 degrees)
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS += 22;
      },
      rsway,
      +1
    );
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS += 22;
      },
      rsway,
      -1
    );

    // bend the arms (put hands on the chest): 60*4*4=960ms
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS += 22;
        RELBO -= 12;
      },
      lsway,
      +1
    ); // undo the rotation above
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS += 22;
        RELBO -= 12;
      },
      lsway,
      -1
    ); // and bend the arms
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS -= 22;
        LELBO += 12;
      },
      rsway,
      +1
    ); // at the same time
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS -= 22;
        LELBO += 12;
      },
      rsway,
      -1
    ); // hands facing down again

    // hands on the head: 60*4*4=960ms
    t = applyMoveAndSway(t, rightHandOnHead, lsway, +1);
    t = applyMoveAndSway(t, rightHandOnHead, lsway, -1);
    t = applyMoveAndSway(t, leftHandOnHead, rsway, +1);
    t = applyMoveAndSway(t, leftHandOnHead, rsway, -1);

    // go back to initial position: 60*4*4=960ms
    t = applyMoveAndSway(t, rightGoBack, lsway, +1);
    t = applyMoveAndSway(t, rightGoBack, lsway, -1);
    t = applyMoveAndSway(t, leftGoBack, rsway, +1);
    t = applyMoveAndSway(t, leftGoBack, rsway, -1);
    // total = 4800ms

    // start jumping: 10*8=80ms
    t = applyMove(t, bendForJump);
    // raise the body while stretching the legs,
    // opening the arms and raising the torso: 10*8=80ms
    t = applyMove(t, stretchForJump);
    // jump, turning: 10*8=80ms
    t = applyMove(t, jumpAndTurn);
    // land, folding the foots while spinning: 10*8=80ms
    t = applyMove(t, landFromJump);
    // dampen: 10*8=80ms
    t = applyMove(t, dampenJump);
    // raise the whole body, then go back to initial position: 10*8=80ms
    t = applyMove(t, finishJump);
    // total = 4800+80*6 = 5280ms
    // grand total = 5280 * 4 cycles = 21120ms or 21s
  }
  // schedule an endless loop of macarenas
  if (loop) callBackArray.push(setTimeout(macarena, t, loop));
  return t;
}