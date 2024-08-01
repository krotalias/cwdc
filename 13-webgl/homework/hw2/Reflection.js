/**
 * @file
 *
 * Summary.
 * <p>Demo of {@link https://en.wikipedia.org/wiki/Transformation_matrix transformation matrices}</p>
 *
 * <ul>
 * <li>Matrix multiplication is used to apply transformations to geometry
 * and transformations can be composed easily by multiplying their matrices.</li>
 * <li>An output area in the HTML page
 * shows the matrices that were multiplied together to get the
 * current transformation being applied to a triangle.</li>
 *
 * <li>The {@link draw drawing} and shader code are the same as in
 * <a href="/cwdc/13-webgl/examples/transformations/content/Transformations.js">Transformations.js</a><br>
 * What's been added are the HTML controls for selecting the
 * transformation and the corresponding event handling code
 * to update the transformation matrix.</li>
 *
 * <li>Instead of explicitly listing 16 numbers to represent a matrix as a
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array/Float32Array Float32Array},
 * we use the types {@link Matrix4} and {@link Vector4} from
 * the {@link https://uniguld.dk/wp-content/guld/DTU/webgrafik/0321902920_WebGL.pdf teal book}
 * utilities to perform {@link https://www.cuemath.com/algebra/matrix-operations/ matrix operations}.
 * </li>
 * <li>The matrix stack has been removed from {@link https://en.wikipedia.org/wiki/OpenGL OpenGL} version 3 and beyond.</li>
 * <li>Nonetheless, there are at least three packages available for matrix manipulation:
 *    <ol>
 *      <li>{@link https://glmatrix.net glMatrix} (available via {@link https://www.jsdelivr.com/package/npm/gl-matrix CDN})</li>
 *      <li><a href="http://rodger.global-linguist.com/webgl/examples.zip">cuon-matrix</a> (examples/lib - unmaintained)</li>
 *      <li><a href="https://github.com/johnpaulwelsh/ComputerGraphics/blob/master/Lab_3/Common/MV.js">MV</a> (poorly documented)</li>
 *    </ol>
 *    Of course, the choice is up to you...
 * </li>
 * <li>This code is very old, and the use of <mark>var</mark> in Javascript has been <em>"deprecated"</em> meanwhile.
 * Therefore, one {@link https://www.freecodecamp.org/news/understanding-let-const-and-var-keywords/ should use}
 * <mark>const</mark>, and where not possible, <mark>let</mark>.</li>
 * <li>Do not spare {@link https://javascript.info/object objects} in Javascript.
 * They come for free and are very helpful, in general.</li>
 * <li>Understand the <a href="/cwdc/3-javascript/arrow/doc-arrow/index.html">difference</a>
 * between functions and
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions arrow functions}.</li>
 * </ul>
 * Usage example of a {@link Matrix4}:
 * <pre>
 *   var m = new Matrix4();           // identity {@link Matrix4 matrix}
 *   m.setTranslate(0.3, 0.0, 0.0);   // make it into a {@link Matrix4#setTranslate translation} matrix
 *   var m2 = new Matrix4().          // create and make {@link Matrix4#setRotate rotation} in one step
 *     setRotate(90, 0, 0, 1);        // (rotate 90 degrees in xy-plane)
 *   m.multiply(m2);                  // {@link Matrix4#multiply multiply} m on right by m2: m = m * m2
 *   var theRealData = m.elements;    // get the {@link Matrix4#elements underlying} Float32Array
 *   var projection = new Matrix4().
 *     ortho(-1, 1, -1, 1, -1, 1);    // default {@link Matrix4#ortho projection}
 * </pre>
 * @author {@link https://www.cs.iastate.edu/smkautz Steve Kautz}
 * @author Paulo Roma
 * @since 27/09/2016
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2016-2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/hw2/Reflection.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/Reflection.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/hw2b.pdf">doc</a>
 * @see <a href="https://www.mauriciopoppe.com/notes/computer-graphics/transformation-matrices/rotation/euler-angles/">Euler Angles</a>
 * @see <a href="https://www.alamo.edu/contentassets/ab5b70d70f264cec9097745e8f30ca0a/graphing/math0303-equations-of-a-line.pdf">Slope-Intercept</a>
 * @see {@link https://www.youtube.com/watch?v=rUczpTPATyU Is WebGL left handed?}
 * @see {@link https://www.learnopengles.com/tag/left-handed-coordinate-system/ Well, only NDC is.}
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

  // set translation part (last column) of matrix
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
 * Handler for keydown events will update {@link modelMatrix} based
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
 * Code to actually render our geometry (scene).
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

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.</p>
   * <p>The callback argument sets the {@link handleKeyPress callback}
   * that will be invoked when the event is dispatched.</p>
   *
   * @event keydown
   */
  window.addEventListener("keydown", (event) => handleKeyPress());

  /**
   * Attach a mouse click handler to define the reflection line.
   * @param {MouseEvent} event mouse event.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
   * @event click
   */
  canvas.addEventListener(
    "click",
    (event) => {
      // call canvas.getBoundingClientRect each time here,
      // to account for scrolling
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX;
      var y = event.clientY;

      // y-axis is upside down
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
    false,
  );

  /**
   * Attach a mouse double click handler to display the mouse position.
   * @param {MouseEvent} event mouse event.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
   * @event dblclick
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

/**
 * <p>Entry point when page is {@link mainEntrance loaded}.</p>
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", () => mainEntrance());
