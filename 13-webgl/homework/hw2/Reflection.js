/**
 * @file
 *
 * Summary.
 * <p>Demo of matrix transformations.</p>
 *
 * <p>An output area in the html page
 * shows the matrices that were multiplied together to get the
 * current transformation being applied to the triangle.</p>
 *
 * The drawing and shader code is the same as
 * <a href="/cwdc/13-webgl/examples/transformations/content/Transformations.js">Transformations.js</a><br>
 * What's been added are the html controls for selecting the
 * transformation and the corresponding event handling code
 * to update the transformation matrix.
 *
 * <p>Note also that instead of explicitly listing 16 numbers to represent a matrix,
 * this uses the type {@link Matrix4} (and {@link Vector4}) from
 * the {@link https://uniguld.dk/wp-content/guld/DTU/webgrafik/0321902920_WebGL.pdf teal book}
 * utilities in cuon-matrix.js, for example:</p>
 * <pre>
 *   var m = new Matrix4();                   // identity matrix
 *   m.setTranslate(0.3, 0.0, 0.0);           // make it into a translation matrix
 *   var m2 = new Matrix4();
 *   m2.setRotate(90, 0, 0, 1);               // rotate 90 degrees in x-y plane
 *   m.multiply(m2);                          // multiply m on right by m2, i.e., m = m * m2;
 *   var theRealData = m.elements;            // get the underlying Float32Array
 *   var projection = new Matrix4().ortho(-1, 1, -1, 1, -1, 1); // default projection
 * </pre>
 * @author Steve Kautz
 * @since 27/09/2016
 * @see <a href="/cwdc/13-webgl/homework/hw2/Reflection.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/Reflection.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/hw2b.pdf">doc</a>
 * @see <a href="https://www.mauriciopoppe.com/notes/computer-graphics/transformation-matrices/rotation/euler-angles/">Euler Angles</a>
 * @see <a href="https://www.alamo.edu/contentassets/ab5b70d70f264cec9097745e8f30ca0a/graphing/math0303-equations-of-a-line.pdf">Slope-Intercept</a>
 * @see <img src="../clip_space_graph.svg" width="512">
 */

"use strict";

/**
 * Raw data for some point positions.
 * @type {Float32Array}
 */
// prettier-ignore
var vertices = new Float32Array([
  0.0, 0.0,
  0.3, 0.0,
  0.3, 0.2,
]);

/**
 * Number of vertices.
 * @type {Number}
 */
var numPoints = vertices.length / 2;

/**
 * Raw data for the axis positions.
 * @type {Float32Array}
 */
// prettier-ignore
var axisVertices = new Float32Array([
  -0.9, 0.0,
  0.9, 0.0,
  0.0, -0.9,
  0.0, 0.9
]);

/**
 * Number of axis vertices.
 * @type {Number}
 */
var numAxisPoints = axisVertices.length / 2;

// A few global variables...

/**
 * The WebGL context.
 * @type {WebGL2RenderingContext}
 */
var gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexbuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var axisbuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 */
var shader;

/**
 * Model transformation matrix.
 * @type {Matrix4}
 */
var modelMatrix = new Matrix4();

/**
 * Previous model transformation matrix.
 * @type {Matrix4}
 */
var previousModelMatrix = new Matrix4();

/**
 * A string showing the transformations.
 * @type {String}
 */
var transformations = "";

/**
 * Create a matrix that translates to the figure's centroid (geometric center).
 */
function getTranslationToCentroid() {
  // get the three vertices and multiply by the current transformation matrix
  // to see where they are now
  var v1 = new Vector4([vertices[0], vertices[1], 0.0, 1.0]);
  v1 = modelMatrix.multiplyVector4(v1);
  var v2 = new Vector4([vertices[2], vertices[3], 0.0, 1.0]);
  v2 = modelMatrix.multiplyVector4(v2);
  var v3 = new Vector4([vertices[4], vertices[5], 0.0, 1.0]);
  v3 = modelMatrix.multiplyVector4(v3);

  // find centroid of given vertices (average of x's, average of y's)
  var cx = (v1.elements[0] + v2.elements[0] + v3.elements[0]) / 3;
  var cy = (v1.elements[1] + v2.elements[1] + v3.elements[1]) / 3;

  // set translational part (last column) of matrix
  var ret = new Matrix4();
  ret.elements[12] = cx;
  ret.elements[13] = cy;
  ret.elements[14] = cy;

  return ret;
}

/**
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String} key pressed.
 * @see http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  let charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Handler for keydown events will update modelMatrix based
 * on key press and radio button state.
 * @param {KeyboardEvent} event keyboard event.
 */
function handleKeyPress(event) {
  var ch = getChar(event);

  // create a new matrix and a text string that represents it
  var m = new Matrix4();
  var text = "I";
  switch (ch) {
    case "r":
      m.setRotate(30, 0, 0, 1);
      text = "R";
      break;
    case "R":
      m.setRotate(-30, 0, 0, 1);
      text = "R'";
      break;
    case "t":
      m.setTranslate(0.3, 0.0, 0.0);
      text = "T";
      break;
    case "T":
      m.setTranslate(-0.3, 0.0, 0.0);
      text = "T'";
      break;
    case "s":
      m.setScale(1, 2, 1);
      text = "S";
      break;
    case "S":
      m.setScale(1, 1 / 2, 1);
      text = "S'";
      break;
    case "x":
      console.log("TODO: PART (a)");
      m.setScale(1, -1, 1);
      text = "X";
      break;
    case "l":
      console.log("TODO: PART (b)");
      var slope = parseFloat(document.getElementById("slopeBox").value);
      var intercept = parseFloat(document.getElementById("interceptBox").value);
      var ang = (Math.atan(slope) * 180) / Math.PI;
      m.translate(0.0, intercept, 0.0);
      m.rotate(ang, 0.0, 0.0, 1.0); // ang in degrees
      m.scale(1, -1, 1);
      m.rotate(-ang, 0.0, 0.0, 1.0);
      m.translate(0.0, -intercept, 0.0);
      text = "L";
      break;

    case "o":
      // reset global transformation matrix
      modelMatrix = m; // the identity, in this case
      text = "I";
      break;
    default:
      // invalid key
      return;
  }

  // TODO - PART (b) - DONE
  if (text === "L") {
    text = "BXB'";
  }

  // if we're doing a rotate or scale with respect to the centroid,
  // replace m with A * m * A-inverse, where A is translation to centroid
  if (
    document.getElementById("checkCentroid").checked &&
    text !== "I" &&
    text !== "T" &&
    text !== "T'" &&
    text !== "X" &&
    text !== "BXB'"
  ) {
    var a = getTranslationToCentroid();
    var aInverse = new Matrix4();
    aInverse.elements[12] = -a.elements[12];
    aInverse.elements[13] = -a.elements[13];
    aInverse.elements[14] = -a.elements[14];
    m = a.multiply(m).multiply(aInverse);
    text = `A${text}A'`;
  }

  // update text string to display
  if (text === "I" || transformations === "I") {
    transformations = text;
  } else {
    if (document.getElementById("checkIntrinsic").checked) {
      // add current text to end of string
      transformations += text;
      console.log("Intrinsic");
    } else {
      // add to beginning of string
      transformations = text + transformations;
      console.log("Extrinsic");
    }
  }

  // update output window using transformation string
  var outputWindow = document.getElementById("displayMatrices");
  outputWindow.innerHTML = transformations;
  console.log(transformations);

  // update current matrix, save previous one
  previousModelMatrix = modelMatrix;
  if (document.getElementById("checkIntrinsic").checked) {
    // multiply on the right by m
    modelMatrix.multiply(m);
  } else {
    // multiply on the left by m
    modelMatrix = m.multiply(modelMatrix);
  }
  draw();
}

/**
 * Code to actually render our geometry.
 */
function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader and get the indices we need
  gl.useProgram(shader);
  var positionIndex = gl.getAttribLocation(shader, "a_Position");
  var colorLoc = gl.getUniformLocation(shader, "color");
  var transformLoc = gl.getUniformLocation(shader, "transform");

  // draw line segments for axes, colored black using identity transform
  gl.bindBuffer(gl.ARRAY_BUFFER, axisbuffer);
  gl.enableVertexAttribArray(positionIndex);
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(colorLoc, 0.0, 0.0, 0.0, 1.0); // black
  gl.uniformMatrix4fv(transformLoc, false, new Matrix4().elements); // identity
  gl.drawArrays(gl.LINES, 0, numAxisPoints);

  // maybe draw line for reflection
  if (document.getElementById("checkDrawLine").checked) {
    var slope = parseFloat(document.getElementById("slopeBox").value);
    var intercept = parseFloat(document.getElementById("interceptBox").value);
    var angle = (Math.atan(slope) * 180) / Math.PI;

    let y = intercept;
    let x = slope != 0 ? -y / slope : 50;
    let t = Math.abs(x) > Math.abs(y) ? [0, y, 0] : [x, 0, 0];

    // we'll just re-draw the x-axis, extended and transformed to match slope and intercept
    var b = new Matrix4()
      .setTranslate(...t)
      .rotate(angle, 0, 0, 1)
      .scale(2, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, axisbuffer);
    gl.enableVertexAttribArray(positionIndex);
    gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLoc, 0.0, 1.0, 0.0, 1.0); // green
    gl.uniformMatrix4fv(transformLoc, false, b.elements); // transform with matrix b
    gl.drawArrays(gl.LINES, 0, 2);
  }

  // draw a grey triangle using previous modelMatrix
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(colorLoc, 0.8, 0.8, 0.8, 1.0); // grey
  gl.uniformMatrix4fv(transformLoc, false, previousModelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // draw the triangle red, using current modelMatrix
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0); // red
  gl.uniformMatrix4fv(transformLoc, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * Entry point when page is loaded.
 */
function mainEntrance() {
  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

  var slopeBox = document.getElementById("slopeBox");
  var interceptBox = document.getElementById("interceptBox");

  var oldx = 3,
    oldy = 3;

  // attach key handler
  window.addEventListener("keydown", (event) => handleKeyPress());

  /**
   * Attach a mouse click handler to define the reflection line.
   * @param {MouseEvent} event mouse event.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
   * @function click
   * @global
   */
  canvas.addEventListener(
    "click",
    (event) => {
      // call canvas.getBoundingClientRect each time here,
      // to account for scrolling
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX;
      var y = event.clientY;

      // y axis is upside down
      let wx = 2 * ((x - rect.left) / rect.width) - 1;
      let wy = -2 * ((y - rect.top) / rect.height) + 1;

      // window: [-1,1] x [-1,1]
      if (Math.abs(oldx) <= 1 && wx != oldx && event.detail == 1) {
        let a = (wy - oldy) / (wx - oldx);
        let b = wy - a * wx;

        slopeBox.value = a.toFixed(2);
        interceptBox.value = b.toFixed(2);
        oldx = oldy = 3;
        draw();
      } else {
        oldx = wx;
        oldy = wy;
      }
    },
    false
  );

  /**
   * Attach a mouse double click handler to display the mouse position.
   * @param {MouseEvent} event mouse event.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   * @function dblclick
   * @global
   */
  canvas.addEventListener("dblclick", (event) => {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX;
    var y = event.clientY;
    let wx = 2 * ((x - rect.left) / rect.width) - 1;
    let wy = -2 * ((y - rect.top) / rect.height) + 1;
    alert(`(${x}, ${y}) ↔ (${wx.toFixed(3)}, ${wy.toFixed(3)})`);
  });

  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById("vertexShader").textContent;
  var fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  shader = gl.program;
  gl.useProgram(null);

  // buffer for triangle
  vertexbuffer = gl.createBuffer();
  if (!vertexbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // another buffer for the axes
  axisbuffer = gl.createBuffer();
  if (!axisbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // define an animation loop
  var animate = () => {
    draw();
    //requestAnimationFrame(animate);
  };

  // start drawing!
  animate();
}

window.addEventListener("load", () => mainEntrance());