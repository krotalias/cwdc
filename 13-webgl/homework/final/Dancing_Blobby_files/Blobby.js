/**
 * @file
 *
 * Summary.
 * <p>Blobby Man.</p>
 *
 * Description.
 * <p>
 * Based upon Jim Blim's Corner:
 * {@link https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4057037 Nested Transformations and The Blobby Man}<br>
 * IEEE Computer Graphics & Applications, No. 10, October 1987
 * </p>
 * <p>There is only one graphical primitive corresponding to a
 * {@link https://threejs.org/docs/#api/en/geometries/SphereGeometry sphere},<br>
 * which is scaled, rotated and translated for each joint in the
 * <a href="/cwdc/13-webgl/Assignment_3/5.hierarchy.pdf">hierarchy</a>.</p>
 *
 * @author Flavia Cavalcanti
 * @since December 2015
 * @license LGPL.
 *
 * @see <a href="/cwdc/13-webgl/homework/final/Dancing_Blobby.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/final/Dancing_Blobby_files/Blobby.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/presentation.pdf">tutorial</a>
 * @see <img src="../blobby.png" width="512">
 */

"use strict";

/**
 * Three.js module.
 * @external THREE
 * @see https://threejs.org/docs/#manual/en/introduction/Installation
 */

/**
 * <p>A representation of mesh, line, or point geometry.</p>
 * Includes vertex positions, face indices, normals, colors, UVs,
 * and custom attributes within buffers, reducing the cost of
 * passing all this data to the GPU.
 * @class BufferGeometry
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/core/BufferGeometry
 */

/**
 * @typedef {Object} bufferGeometry
 * @property {Float32Array} vertices vertex coordinates.
 * @property {Float32Array} normals vertex normals.
 * @property {Float32Array} texCoords texture coordinates.
 * @property {Uint16Array} indices index array.
 */

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
 * {@link external:THREE.BufferGeometry THREE.BufferGeometry},
 * returns a {@link bufferGeometry} object containing raw data for:
 * <ul>
 *  <li>vertices, </li>
 *  <li>indices, </li>
 *  <li>texture coordinates, </li>
 *  <li>and normal vectors. </li>
 * </ul>
 *
 * @param {external:THREE.BufferGeometry} geom {@link https://threejs.org/docs/#api/en/geometries/SphereGeometry THREE.SphereGeometry}, <br>
 *                                             {@link https://threejs.org/docs/#api/en/geometries/PlaneGeometry THREE.PlaneGeometry}.
 * @return {bufferGeometry}
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
    gl.NEAREST_MIPMAP_LINEAR,
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

/**
 * Returns the magnitude (length) of a vector.
 * @param {Array<Number>} v n-D vector.
 * @returns {Number} vector length.
 * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 */
var vecLen = (v) =>
  Math.sqrt(v.reduce((accumulator, value) => accumulator + value * value, 0));

// A few global variables...
var audio = document.getElementById("audio");
var audioGhost = document.getElementById("audioGhost");
var audioHey = document.getElementById("audioHey");
var audioWhistle = document.getElementById("audioWhistle");

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
var gl;

var doubleBlobby = false;
var selSkin = 0; //random skin selector 1
var selSkin2 = 0; //random skin selector 1

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

var XAXIS = new Float32Array([-2.5, 0.0, 0.0]);
var YAXIS = new Float32Array([0.0, -2.5, 0.0]);
var ZAXIS = new Float32Array([0.0, 0.0, -2.5]);

var dancing = false; //needed for the "Shut the hell up macarena" button
var vampire = false;
var disco = false;
var alternating = false; //alternate skins between jumps

// Color gallery
var red = new Float32Array([1.0, 0.0, 0.0, 1.0]);
var black = new Float32Array([0.0, 0.0, 0.0, 1.0]);
var blue = new Float32Array([0.0, 0.0, 0.6, 1.0]);
var white = new Float32Array([1.0, 1.0, 1.0, 1.0]);

// default skin
var dMouth = new Float32Array([0.55, 0.2, 0.3, 1.0]); //default mouth
var dSkin = new Float32Array([0.65, 0.55, 0.55, 1.0]); //default skin tone
var dEyes = new Float32Array([0.3, 0.75, 0.45, 1.0]); //default eyes
var dTorso = black;
var dPants = black;
var dArms = dSkin;
var dHands = black;
var dBody = new Float32Array([0.7, 0.85, 0.7, 1.0]);
var dHands = black;

// vampire skin
var vMouth = new Float32Array([0.75, 0.2, 0.2, 1.0]);
var vEyes = new Float32Array([0.8, 0.2, 0.2, 1.0]);
var vSkin = new Float32Array([0.65, 0.6, 0.6, 1.0]);
var vTorso = black;
var vPants = black;
var vBody = black;
var vHands = vSkin;
var vArms = black;

// disco skin
var discoMouth = dMouth;
var discoEyes = dEyes;
var discoSkin = new Float32Array([0.53, 0.43, 0.43, 1.0]);
var discoTorso = new Float32Array([0.75, 0.2, 0.2, 1.0]);
var discoPants = new Float32Array([0.5, 0.8, 0.0, 1.0]);
var discoBody = new Float32Array([0.7, 0.55, 0, 1.0]);
var discoHands = discoSkin;
var discoArms = new Float32Array([0.7, 0, 0.4, 1.0]);

// to be used color variables
var skin = dSkin;
var mouth = dMouth;
var eyes = dEyes;
var torsoColor = red;
var pants = black;
var hands = dHands;
var bodyColor = dBody;
var arms = dArms;

var bgcolor = new Float32Array([0.7, 0.7, 0.7, 1.0]); // backgound color
var flcolor = new Float32Array([1.0, 1.0, 1.0, 1.0]); // floor color
var glColor = white;

var FOV = 45.0,
  ZN = 1.17,
  ZF = 20.7;
var XSCR = 0,
  YSCR = 1.6,
  ZSCR = 0;
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

var RHAND = 0.0; /* y - rotate right hand arount wrist */
var LHAND = 0.0; /* y - rotate left hand arount wrist */

var LHIP = 0.0; /* z - angular direction that the leg is kicked*/
var LOUT = 0.0; /* y - angular distance that the leg is kicked*/
var LTWIS = 0.0; /* z - angle the leg is twisted about its length*/
var LKNEE = 0.0; /* x - knee beng*/
var LFRONT = 0.0; /* x */

var LSID = -45.0; /* y - rotate left arm sideways */
var LSHOU = 0.0; /* x - rotate left arm forward or backward */
var LATWIS = -90.0; /* z - rotate left arm in or out */
var LELBO = 90.0; /* x - rotate left arm around the elbo */

var RSID = 112.0; /* y */
var RSHOU = 40.0; /* x */
var RATWIS = -102.0; /* z - arm rotation about its own length*/
var RELBO = 85.0; /* x */

/**
 * Model data (blobby parts).
 * @type {bufferGeometry}
 */
var sphere;

/**
 * Floor.
 * @type {bufferGeometry}
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
 * Camera position.
 * @type {Array<Number>}
 */
const eye = [0.1, -1.6, -7.5];

/**
 * View matrix.
 * @type {Matrix4}
 */
// prettier-ignore
var view = new Matrix4().setLookAt(
  ...eye,   // eye
  0.1, -1.6, -6.5,  // at - looking at the origin
  0, -1, 0, // up vector - y axis
);

/**
 * View distance.
 * @type {Number}
 */
var viewDistance = vecLen(eye);

/**
 * <p>Projection matrix.</p>
 * Aspect ratio is 1 corresponding to a canvas size 1100 x 900
 * @type {Matrix4}
 */
var projection = new Matrix4().setPerspective(FOV, 1.2, ZN, ZF);

/**
 * <p>Object to enable rotation by mouse dragging (arcball).</p>
 * For using the rotator, I had to:
 * <ul>
 *  <li>set XSCR = ZSCR = 0 (was XSCR = -0.1, ZSCR = 7.9),</li>
 *  <li>set the eye to [0.1, -1.6, -7.5] (was at the origin),</li>
 *  <li>looking at [0.1, -1.6, -6.5] (was [0,0,1]).</li>
 * </ul>
 * @type {SimpleRotator}
 */
var rotator;

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
 * Keep track of all available skins.
 * @type {Array<Function>}
 */
var arrayOfSkins = [skinDefault, skinDisco, skinVampire];

/**
 * Current skin.
 * @type {Function}
 */
var currentSkin = skinDefault;

var numberOfJumps = arrayOfSkins.indexOf(currentSkin);
var shutUp = false;

/**
 * Set default {@link currentSkin skin}.
 */
function skinDefault() {
  vampire = false;
  disco = false;
  skin = dSkin;
  eyes = dEyes;
  mouth = dMouth;
  pants = dPants;
  hands = dHands;
  arms = dArms;
  bodyColor = dBody;
  currentSkin = skinDefault;
}

/**
 * Set vampire {@link currentSkin skin}.
 */
function skinVampire() {
  vampire = true;
  disco = false;
  skin = vSkin;
  mouth = vMouth;
  eyes = vEyes;
  torsoColor = vTorso;
  pants = vPants;
  bodyColor = vBody;
  arms = vArms;
  hands = vHands;
  currentSkin = skinVampire;
}

/**
 * Set disco {@link currentSkin skin}.
 */
function skinDisco() {
  disco = true;
  vampire = false;
  skin = discoSkin;
  mouth = discoMouth;
  eyes = discoEyes;
  torsoColor = discoTorso;
  pants = discoPants;
  bodyColor = discoBody;
  arms = discoArms;
  hands = discoHands;
  currentSkin = skinDisco;
}

/**
 * <p>Keeps tracks of the number of jumps performed by Blobby.</p>
 * Needed in order to alternate skins in the middle of the dance.
 * @param {Number} t
 */
function incrementJumps(t) {
  callBackArray.push(
    setTimeout(
      function () {
        numberOfJumps++;
      },
      (t += 1),
    ),
  );
  return t;
}

/**
 * Specifies that Blobby should change skins after every jump.
 */
function alternateSkins() {
  if (!doubleBlobby) {
    alternating = !alternating;
    if (!alternating)
      document.getElementById("skinButton").style.backgroundColor = "#FF6223";
    else
      document.getElementById("skinButton").style.backgroundColor = "#e64200";
  }
}

/**
 * Overdose overdose overdose of macarena.
 */
function shutUpThatSong() {
  shutUp = !shutUp;
  if (!shutUp) {
    document.getElementById("shutUpButton").style.backgroundColor = "#FF6223";
    if (dancing) audio.play();
  } else {
    audio.pause();
    document.getElementById("shutUpButton").style.backgroundColor = "#e64200";
  }
}

/**
 * Will stop the macarena song if Blobby is only dancing one round.
 */
function stopSongAfterDance(t) {
  callBackArray.push(
    setTimeout(
      function () {
        audio.pause();
        audio.currentTime -= 30.0;
      },
      (t += 1),
    ),
  );
  return t;
}

/**
 * Double trouble for macarena.
 */
function doubleDancers() {
  doubleBlobby = true;
  alternating = false;
  selSkin = Math.floor(Math.random() * 3);
  selSkin2 = Math.floor(Math.random() * 3);
  document.getElementById("doubleButton").style.backgroundColor = "#e64200";
  document.getElementById("singleButton").style.backgroundColor = "#FF6223";
  document.getElementById("skinButton").style.backgroundColor = "#FF6223";
}

/**
 * Only one blobby is good enough for me - said no one ever, but whatevs.
 */
function singleDancer() {
  doubleBlobby = false;
  document.getElementById("doubleButton").style.backgroundColor = "#FF6223";
  document.getElementById("singleButton").style.backgroundColor = "#e64200";
}

/**
 * Apply a single movement and the sway to blobby.
 */
function applyMoveAndSway(t, move1, move, sign) {
  for (var i = 0; i < 4; ++i) {
    callBackArray.push(
      setTimeout(
        function () {
          move1();
          move(sign);
        },
        (t += delay),
      ),
    );
  }
  return t;
}

/**
 * <p>Apply a single movement to blobby.</p>
 * As this function may not be directly linked to the macarena dance,
 * a different time delay amount may be passed in.
 */
function applyMove(t, move, timeDelay, sign) {
  for (var i = 0; i < 8; ++i) {
    callBackArray.push(
      setTimeout(
        function () {
          move(sign); //sign may or may not be given
        },
        (t += timeDelay),
      ),
    );
  }
  return t;
}

/**
 * What to do when the Sway button is clicked.
 */
function swayCallBack() {
  stopCallBack();
  var t = sway();
  // console.log ( "sway = " + t );
  // document.getElementById("div").value = t;
}

/**
 * What to do when the Dance button is clicked.
 */
function danceCallBack(loop) {
  if (typeof loop === "undefined") loop = true;
  if (loop) {
    document.getElementById("danceButton").style.backgroundColor = "#e64200";
  }

  stopCallBack();
  if (!shutUp) {
    audio.currentTime -= 30.0; //it started to really annoy me when the music started playing in the middle -- let's rewind
    audio.play();
    if (loop) {
      audio.addEventListener(
        "ended",
        function () {
          this.currentTime = 0;
          this.play();
        },
        false,
      );
    }
  }
  var t = macarena(loop, true);
  // console.log("macarena = " + t);
  // document.getElementById("div").value = t;
}

/**
 * What to do when the Stop button is clicked.
 * Clears out the event array
 * @param {Boolean} stopButton - true if function was called from clicking on the stopButton
 */
function stopCallBack(stopButton) {
  audio.pause();
  // document.getElementById("div").value = 0;
  if (typeof stopButton === "undefined") stopButton = false;
  dancing = false;
  if (stopButton)
    document.getElementById("danceButton").style.backgroundColor = "#FF6223";

  callBackArray.map(clearTimeout);
  callBackArray.length = 0;
}

/**
 * Handler for key press events adjusts object rotations.
 * @param {KeyboardEvent} event key pressed.
 */
function handleKeyPress(event) {
  var ch = getChar(event);
  switch (ch) {
    case "r":
      SPIN += 15;
      break;

    case "R":
      SPIN -= 15;
      break;

    case "t":
      ROT += 15;
      break;

    case "T":
      ROT -= 15;
      break;

    case "s":
      LSHOU += 15;
      RSHOU += 15;
      break;

    case "S":
      LSHOU -= 15;
      RSHOU -= 15;
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

    case "m":
      danceCallBack(false);
      break;

    case "e":
      var t = 0;
      stopCallBack();
      audioGhost.play();
      audio.pause();
      scaryPose();
      for (var i = 0; i < 9; i++) {
        t = applyMove(t, spinHead, 5);
        t = applyMove(t, spinShoulder, 20, -1);
        t = applyMove(t, spinShoulder, 20, 1);
      }
      break;

    case "w":
      var t = 0; // accumulated time counter
      audioHey.play();
      audio.pause();
      stopCallBack();
      prepareForWave();
      for (var i = 0; i < 2; i++) {
        t = applyMove(t, wave, delay2, 1);
        t = applyMove(t, wave, delay2, -1);
      }
      break;

    case "b":
      var t = 0; // accumulated time counter
      audioWhistle.play();
      audio.pause();
      stopCallBack();
      bowPose();
      t = applyMove(t, bowDown, delay, 1);
      t = applyMove(t, bowDown, delay, -1);
      //        t = applyMove(t, retBow, delay);
      break;

    case "W":
      resetAngles();
      stopCallBack();
      var t = 0; // accumulated time counter
      t = applyMoveAndSway(t, raiseLeftArm, rsway, 1);
      t = applyMoveAndSway(t, raiseLeftArm, rsway, -1);
      break;

    case "j":
      resetAngles();
      stopCallBack();
      var t = 0; // accumulated time counter
      t = applyMove(t, bendForJump, delay2);
      t = applyMove(t, stretchForJump, delay2);
      t = applyMove(t, jumpAndTurn, delay2);
      t = applyMove(t, landFromJump, delay2);
      t = applyMove(t, dampenJump, delay2);
      t = applyMove(t, finishJump, delay2);
      break;

    case "u":
      stopCallBack();
      whatsUp();
      break;

    case "i":
      stopCallBack();
      prepareForWave();
      break;

    case "o":
      stopCallBack();
      handsOnHips();
      break;

    case "p":
      stopCallBack();
      bowPose();
      break;

    case "d":
      skinDefault();
      break;

    case "v":
      skinVampire();
      break;

    case "c":
      skinDisco();
      break;

    default:
      return;
  }
}

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @event KeyboardEvent
 */
const createEvent = (key) => {
  let code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

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

  var vTexCoord = 1; // gl.getAttribLocation( lightingShader, 'vTexCoord' ); // if using a mac
  if (vTexCoord < 0) {
    console.log("Failed to get the storage location of vTexCoord");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  // gl.enableVertexAttribArray(vTexCoord); //uncomment if using mac

  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  // gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer); //uncomment if using mac
  // gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 ); //uncomment if using mac

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
    makeNormalMatrixElements(current, view),
  );

  gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);
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
  gl.enableVertexAttribArray(vTexCoord); //gimme the tex

  // draw the plane
  // bind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane); //gimme the tex
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0); //gimme the tex

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
    makeNormalMatrixElements(current, view),
  );

  // draw
  gl.drawElements(
    gl.TRIANGLES,
    planeModel.indices.length,
    gl.UNSIGNED_SHORT,
    0,
  );

  gl.useProgram(null);
}

/**
 * Add a new Blobby to the scene translated by (DX,DY)
 * and "dressed for success" with the given {@link torso skin}.
 * @param {Number} DX horizontal translation.
 * @param {Number} DY vertical translation.
 * @param {Function} skin function for drawing the skin.
 */
function addBlobby(DX, DY, skin) {
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
  new torso(skin);
  stk.pop();
}

/**
 * Code to actually render our geometry.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  view.elements = rotator.getViewMatrix();

  bodyMatrix.setTranslate(XSCR, YSCR, ZSCR);
  bodyMatrix
    .rotate(BACK, XAXIS[0], XAXIS[1], XAXIS[2])
    .rotate(SPIN, ZAXIS[0], ZAXIS[1], ZAXIS[2])
    .rotate(TILT, XAXIS[0], XAXIS[1], XAXIS[2]);

  stk.push(bodyMatrix);
  GPlane();
  stk.pop();

  if (doubleBlobby) addBlobby(-1, 0, arrayOfSkins[selSkin]);
  else addBlobby(0, 0);

  if (doubleBlobby) {
    // we need to make the second matrix independent from the first
    addBlobby(1, 0, arrayOfSkins[selSkin2]);
  }

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
   * <p>Fires when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @callback handleWindowResize
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
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

  /**
   * <p>Appends an event listener for events whose type attribute value is resize.</p>
   * <p>The {@link handleWindowResize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @param {Event} event the document view is resized.
   * @param {callback} function function to run when the event occurs.
   * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
   * @event resize - executed when the window is resized.
   */
  window.addEventListener("resize", handleWindowResize, false);
  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.</p>
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.
   *
   * @event keydown
   */
  window.addEventListener("keydown", (event) => {
    handleKeyPress(event);
  });

  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  let aspect = canvas.width / canvas.height;
  handleWindowResize();

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById(
    "vertexLightingShader",
  ).textContent;
  var fshaderSource = document.getElementById(
    "fragmentLightingShader",
  ).textContent;
  var vshaderTextured = document.getElementById(
    "vertexTexturedShader",
  ).textContent;
  var fshaderTextured = document.getElementById(
    "fragmentTexturedShader",
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  lightingShader = gl.program;

  if (!initShaders(gl, vshaderTextured, fshaderTextured)) {
    console.log("Failed to intialize shaders.");
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

  // Initialize a texture
  var image = document.getElementById("texImage");

  configureTexture(image);

  // create new rotator object
  rotator = new SimpleRotator(canvas, draw);
  rotator.setViewMatrix(view.elements);
  rotator.setViewDistance(viewDistance);

  window.exorcist = () => {
    handleKeyPress(createEvent("e"));
  };

  window.bdown = () => {
    handleKeyPress(createEvent("b"));
  };

  window.bwave = () => {
    handleKeyPress(createEvent("w"));
  };

  window.blarmup = () => {
    handleKeyPress(createEvent("W"));
  };

  window.bljump = () => {
    handleKeyPress(createEvent("j"));
  };

  /**
   * A closure to render the application and display the fps.
   *
   * @return {loop} animation callback.
   * @function
   * @global
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   */
  const animate = (() => {
    // time in milliseconds
    let previousTimeStamp = Date.now();
    let numberOfFramesForFPS = 0;
    let fpsCounter = document.getElementById("fps");
    let currentTime;
    /**
     * <p>Define an animation loop, by calling {@link draw} for each frame.</p>
     * @callback loop
     * @global
     * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     */
    return () => {
      currentTime = Date.now();
      if (Math.abs(currentTime - previousTimeStamp) >= 1000) {
        fpsCounter.innerHTML = `(${numberOfFramesForFPS} fps)`;
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

// ======== BUILDING BLOBBY ===============

function head() {
  var t = new Matrix4(stk.top()); //head
  stk.push(t);
  t.translate(0.0, 0.0, 0.4);
  t.scale(0.2, 0.23, 0.3);
  renderSphere(skin);
  stk.pop();

  if (!disco) {
    t = new Matrix4(stk.top()); //hat
    stk.push(t);
    t.translate(0.0, 0.0, 0.64);
    t.scale(0.3, 0.3, 0.15);
    renderSphere(black);
    stk.pop();

    t = new Matrix4(stk.top()); //stupid dinky red sphere on hat
    stk.push(t);
    t.translate(0.0, 0.0, 0.8);
    t.scale(0.04, 0.04, 0.04);
    renderSphere(red);
    stk.pop();
  }

  if (disco) {
    //black power
    t = new Matrix4(stk.top()); //hat
    stk.push(t);
    t.translate(0.0, 0.07, 0.74);
    t.scale(0.33, 0.33, 0.27);
    renderSphere(black);
    stk.pop();
  }

  t = new Matrix4(stk.top()); //eye right
  stk.push(t);
  t.translate(-0.07, -0.205, 0.5);
  t.scale(0.03, 0.02, 0.03);
  renderSphere(eyes);
  stk.pop();

  t = new Matrix4(stk.top()); //eye left
  stk.push(t);
  t.translate(0.07, -0.205, 0.5);
  t.scale(0.03, 0.02, 0.03);
  renderSphere(eyes);
  stk.pop();

  t = new Matrix4(stk.top()); //eye right
  stk.push(t);
  t.translate(-0.07, -0.205, 0.5);
  t.scale(0.03, 0.02, 0.03);
  renderSphere(eyes);
  stk.pop();

  if (vampire) {
    t = new Matrix4(stk.top()); //fang right
    stk.push(t);
    t.translate(0.04, -0.2, 0.18);
    t.scale(0.01, 0.005, 0.05);
    renderSphere(white);
    stk.pop();

    t = new Matrix4(stk.top()); //fang left
    stk.push(t);
    t.translate(-0.04, -0.2, 0.18);
    t.scale(0.01, 0.005, 0.05);
    renderSphere(white);
    stk.pop();
  }

  t = new Matrix4(stk.top()); //nose
  stk.push(t);
  t.translate(0.0, -0.255, 0.42);
  t.scale(0.035, 0.075, 0.035);
  renderSphere(skin);
  stk.pop();

  t = new Matrix4(stk.top()); //neck
  stk.push(t);
  t.translate(0.0, 0.0, 0.07);
  t.scale(0.065, 0.065, 0.14);
  renderSphere(skin);
  stk.pop();

  t = new Matrix4(stk.top()); //mouth
  stk.push(t);
  t.translate(0.0, -0.162, 0.239);
  t.scale(0.0633, 0.0508, 0.0506);
  renderSphere(mouth);
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
  renderSphere(hands);
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
  hand();
  stk.pop();
}

function shoulder() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.45, 0.153, 0.12);
  renderSphere();
  stk.pop();

  glColor = arms;
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
  glColor = bodyColor;

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
    XAXIS[2],
  ); /* the shoulder glRotates twice */
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
  renderSphere(pants);
  stk.pop();
}

function calf() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.05, 0.05, 0.05);
  renderSphere(pants);
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.425);
  t.scale(0.1, 0.1, 0.425);
  renderSphere(pants);
  stk.pop();
}

function foot() {
  var t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.05, 0.04, 0.04);
  renderSphere(pants);
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.05, -0.05);
  t.scale(0.04, 0.04, 0.04);
  renderSphere(pants);
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, -0.15, -0.05);
  t.rotate(10.0, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.scale(0.08, 0.19, 0.05);
  renderSphere(black);
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

/**
 * Draws Blobby's torso using the given function
 * to set its skin.
 * @param {Function} func skin.
 */
function torso(func) {
  if (typeof func === "undefined") func = skinDefault;

  if (doubleBlobby) func();
  glColor = torsoColor;
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
  renderSphere(pants);
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(EXTEN, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(BTWIS, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(ROT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  body();
  stk.pop();
}

// =========== POSES =============================

/**
 * Default position, Blobby's legs are straight facing the origin.
 */
function stiffPosition() {
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
  RFRONT = 0.0;

  RHAND = 0.0; /* y - rotate right hand arount wrist */
  LHAND = 0.0; /* y - rotate left hand arount wrist */

  LHIP = 0.0; /* z */
  LOUT = 0.0; /* y */
  LTWIS = 0.0; /* z */
  LKNEE = 0.0; /* x */
  LFRONT = 0.0;
}

/**
 * Put Blobby standing still with hands on his hip.
 */
function resetAngles() {
  callBackArray.length = 0; // clear callBackArray

  stiffPosition();

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 45.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

/**
 * Relaxed Blobby - waving with left hand.
 */
function whatsUp() {
  stiffPosition();

  NOD = -20.0; /* x - rotate head forward or backward */
  NECK = 30.0; /* z - rotate head sideways */

  LHIP = 0;
  LOUT = 0;
  LKNEE = 0;
  LTWIS = 0;

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 112.0; /* y */
  RSHOU = 40.0; /* x */
  RATWIS = -102.0; /* z */
  RELBO = 85.0; /* x */

  RHIP = 105;
  RKNEE = -53.0;
  RTWIS = -102;
}

/**
 * Scared Blobby.
 */
function scaryPose() {
  stiffPosition();

  NOD = -20.0; /* x - rotate head forward or backward */
  NECK = 30.0; /* z - rotate head sideways */

  LSID = 0.0; /* y - rotate left arm sideways */
  LSHOU = 90.0; /* x - rotate left arm forward or backward */
  LATWIS = 90.0; /* z - rotate left arm in or out */
  LELBO = 0.0; /* x - rotate left arm around te elbo */

  RSID = 0.0; /* y */
  RSHOU = 90.0; /* x */
  RATWIS = 90.0; /* z */
  RELBO = 0.0; /* x */
}

/**
 * Setting Blobby up for a wave.
 */
function prepareForWave() {
  stiffPosition();

  NOD = -20.0; /* x - rotate head forward or backward */
  NECK = 30.0; /* z - rotate head sideways */

  LSID = -115.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = 90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 115.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = 90.0; /* x */
}

/**
 * Set Blobby to bow down.
 */
function bowPose() {
  stiffPosition();

  LSID = -5.0; /* y - rotate left arm sideways */
  LSHOU = 40.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 120.0; /* x - rotate left arm around te elbo */

  RSID = 15.0; /* y */
  RSHOU = -30.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

/**
 * Put Blobby standing still with hands on his hip.
 */
function handsOnHips() {
  stiffPosition();

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 45.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

// =========== MOVEMENTS =======================

function wave(sign) {
  console.log(5 * sign);
  RELBO += 5 * sign;
  LELBO += 5 * sign;
}

function bow() {
  var t = 0; // accumulated time counter
  bowPose();
  t = applyMove(t, bowDown, delay, 1);
  t = applyMove(t, bowDown, delay, -1);
  return t;
}

// exorcist
function spinHead() {
  NECK += 5;
}

function spinShoulder(sign) {
  LSHOU += sign * 3;
  RSHOU += -1 * sign * 3;
}

/**
 * Lower back to bow.
 */
function bowDown(sign) {
  console.log("bow");
  console.log(sign);
  EXTEN -= 7 * sign;
  NOD += 3 * sign;
  LSHOU += 7 * sign;
  RSHOU += 7 * sign;
}

/**
 * Sway to the left.
 */
function lsway(sign) {
  BTWIS += 1 * sign;
  LANKL -= 5 * sign;
  LFRONT += 5.5 * sign;
  LKNEE -= 8 * sign;
}

/**
 * Sway to the right.
 */
function rsway(sign) {
  BTWIS -= 1 * sign;
  RANKL -= 5 * sign;
  RFRONT += 5.5 * sign;
  RKNEE -= 8 * sign;
}

/**
 * Raise the right arm half way.
 */
function raiseRightArm() {
  RELBO += 10;
  RATWIS -= 6.5;
  RSHOU += 9;
}

/**
 * Raise the left arm half way.
 */
function raiseLeftArm() {
  LELBO -= 10;
  LATWIS += 6.5;
  LSHOU += 9;
}

/**
 * Put right hand on the head.
 */
function rightHandOnHead() {
  RSHOU += 5;
  RATWIS -= 9;
  RHAND += 2.5;
}

/**
 * Put left hand on the head.
 */
function leftHandOnHead() {
  LSHOU += 5;
  LATWIS += 9;
  LHAND += 2.5;
}

/**
 * Go back to initial position.
 */
function rightGoBack() {
  RSHOU -= 14;
  RATWIS += 15.5;
  RHAND -= 2.5;
  RELBO += 2;
}

/**
 * Go back to initial position.
 */
function leftGoBack() {
  LSHOU -= 14;
  LATWIS -= 15.5;
  LHAND -= 2.5;
  LELBO -= 2;
}

/**
 * Bend the knees for the jump.
 */
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

/**
 * Stretch the legs for the jump.
 */
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

/**
 * Excute the jump and turn to the left.
 */
function jumpAndTurn() {
  JUMP += 1.0 / 10;
  RANKL -= 5;
  LANKL -= 5;
  EXTEN += 1;
  TURN -= 5.625;
  NOD += 2;
}

/**
 * Put the feet on the floor.
 */
function landFromJump() {
  JUMP -= 1.0 / 10;
  RANKL += 5;
  LANKL += 5;
  NOD -= 2;
  TURN -= 5.625;
  if (alternating) {
    arrayOfSkins[numberOfJumps % arrayOfSkins.length]();
  }
}

/**
 * Dampen the jump bending the knees.
 */
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

/**
 * Go back to initial position.
 */
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
 */
function sway() {
  var t = 0;
  resetAngles();
  t = applyMoveAndSway(t, function () {}, lsway, +1);
  t = applyMoveAndSway(t, function () {}, lsway, -1);
  t = applyMoveAndSway(t, function () {}, rsway, +1);
  t = applyMoveAndSway(t, function () {}, rsway, -1);
  callBackArray.push(setTimeout(sway, t));
  return t;
}

function returnHandsToHips() {
  LSID -= 2.55; /* y - rotate left arm sideways */
  LSHOU -= 2.45; /* x - rotate left arm forward or backward */
  LELBO -= 1.85; /* x - rotate left arm around te elbo */

  RSID += 1.85; /* y */
  RSHOU += 1.9; /* x */

  //    console.log("LSID: " + LSID);
  //    console.log("LSHOU: " +LSHOU);
  //    console.log("LELBO: " + LELBO);
  //    console.log("RSID: " + RSID);
  //    console.log("RSHOU: " + RSHOU);
}

// ============================================

/**
 * Dance the "Los del Rio", Macarena song.
 * @param {Boolean} loop whether to start an endless dancing loop.
 * @param {Number} tinit time interval in milliseconds.
 * @return {Number} total time.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
 */
function macarena(loop, firstLoop) {
  dancing = true; //needed for the shut up button

  var t = 0; // accumulated time counter
  //t = bow();

  var firstTime = false; //denotes that its not the first time this loop is called

  resetAngles();

  if (firstLoop == true) {
    //only bow once
    bowPose();
    t = applyMove(t, bowDown, delay, 1);
    t = applyMove(t, bowDown, delay, -1);
    t = applyMoveAndSway(t, returnHandsToHips, lsway, +1);
    t = applyMoveAndSway(t, returnHandsToHips, lsway, -1);
    t = applyMoveAndSway(t, returnHandsToHips, rsway, +1);
    t = applyMoveAndSway(t, returnHandsToHips, rsway, -1);
  }

  for (var j = 0; j < 5; j++) {
    //sway a bit
    t = applyMoveAndSway(t, function () {}, lsway, +1);
    t = applyMoveAndSway(t, function () {}, lsway, -1);
    t = applyMoveAndSway(t, function () {}, rsway, +1);
    t = applyMoveAndSway(t, function () {}, rsway, -1);
  }

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
      +1,
    ); // 22*4=88
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS -= 22;
      },
      lsway,
      -1,
    ); // 22*4=88 (176 degrees)
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS += 22;
      },
      rsway,
      +1,
    );
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS += 22;
      },
      rsway,
      -1,
    );

    // bend the arms (put hands on the chest): 60*4*4=960ms
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS += 22;
        RELBO -= 12;
      },
      lsway,
      +1,
    ); // undo the rotation above
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS += 22;
        RELBO -= 12;
      },
      lsway,
      -1,
    ); // and bend the arms
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS -= 22;
        LELBO += 12;
      },
      rsway,
      +1,
    ); // at the same time
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS -= 22;
        LELBO += 12;
      },
      rsway,
      -1,
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
    t = applyMove(t, bendForJump, delay2);
    // raise the body while stretching the legs,
    // opening the arms and raising the torso: 10*8=80ms
    t = applyMove(t, stretchForJump, delay2);
    // jump, turning: 10*8=80ms
    t = applyMove(t, jumpAndTurn, delay2);
    t = incrementJumps(t);
    // land, folding the foots while spinning: 10*8=80ms
    t = applyMove(t, landFromJump, delay2);
    // dampen: 10*8=80ms
    t = applyMove(t, dampenJump, delay2);
    // raise the whole body, then go back to inital position: 10*8=80ms
    t = applyMove(t, finishJump, delay2);
    // total = 4800+80*6 = 5280ms
    // grand total = 5280 * 4 cycles = 21120ms or 21s
  }

  if (!loop) {
    stopSongAfterDance(t); //will stop song if Blobby is dancing only one round
  }

  // schedule an endless loop of macarenas
  if (loop) {
    callBackArray.push(setTimeout(macarena, t, loop, firstTime));
  }

  return t;
}

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