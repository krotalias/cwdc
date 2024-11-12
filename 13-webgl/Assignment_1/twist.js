/**
 * @file
 *
 * Summary.
 *
 * <p>Draw a fractal known as
 * <a href="https://en.wikipedia.org/wiki/Sierpiński_triangle">Sierpińsk</a> Gasket
 * (with an optional {@link rotateAndTwist twist factor})
 * by {@link divideTriangle recursively dividing} in half
 * the edges of an {@link vertices initial triangle}.</p>
 *
 * The number of red triangles is 3<sup>n</sup>,
 * and the number of {@link https://nrich.maths.org/4757/solution white triangles}
 * is the sum of a {@link https://www.cuemath.com/algebra/sum-of-a-gp/ geometric progression}
 * of ratio 3 and first term 1:
 * <ul>
 *  <li>W(0) = 0</li>
 *  <li>W(n) = 3 * W(n-1) + 1</li>
 *  <li>W(n) = 1 + 3 + 3² + ... + 3<sup>n-1</sup> = (3<sup>n</sup>-1)/2, n &ge; 0.</li>
 * </ul>
 *
 * @author Paulo Roma Cavalcanti
 * @since 30/01/2023
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2023-2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/Assignment_1/twist.html">link</a>
 * @see <a href="/cwdc/13-webgl/Assignment_1/twist.js">source</a>
 * @see {@link http://paulbourke.net/fractals/polyhedral/ Sierpinski Gasket}
 * @see {@link https://larryriddle.agnesscott.org/ifs/siertri/siertri.htm Classic Iterated Function Systems}
 * @see {@link http://codepen.io/promac/pen/yNxMWz codepen}
 * @see <img src="../twist.png">
 * @see <img src="../sierpinski.gif">
 */

"use strict";

/**
 * 2 Dimensional Vector.
 * @type {glMatrix.vec2}
 * @see {@link https://glmatrix.net/docs/module-vec2.html glMatrix.vec2}
 */
const vec2 = glMatrix.vec2;
/**
 * 4x4 Matrix
 * @type {glMatrix.mat4}
 * @see {@link https://glmatrix.net/docs/module-mat4.html glMatrix.mat4}
 */
const mat4 = glMatrix.mat4;
/**
 * 2x2 Matrix
 * @type {glMatrix.mat2}
 * @see {@link https://glmatrix.net/docs/module-mat2.html glMatrix.mat2}
 */
const mat2 = glMatrix.mat2;

/**
 * WebGL canvas.
 * @type {HTMLCanvasElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API Canvas API}
 */
let canvas;

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext WebGLRenderingContext}
 */
let gl;

/**
 * Vertices for rendering.
 * @type {Array<vec2>}
 */
let points = [];

/**
 * Edges for rendering.
 * @type {Array<vec2>}
 */
let lines = [];

/**
 * Triangle buffer.
 * @type {WebGLBuffer}
 */
let bufferId;

/**
 * Edge buffer.
 * @type {WebGLBuffer}
 */
let bufferLineId;

/**
 * Number indicating the location of the variable vPosition if found.
 * @type {GLInt}
 */
let vPosition;

/**
 * Whether to draw the fourth triangle.
 * @type {Boolean}
 */
let fill = true;

/**
 * Controls the spin speed.
 * @type {Number}
 */
let delay = 100;

/**
 * Whether not using the gpu.
 * @type {Boolean}
 */
let cpu = false;

/**
 * Twist state.
 * @type {Boolean}
 */
let deform = true;

/**
 * <p>Rotation angle.</p>
 *
 * <p>Uniform variables are used to communicate with a vertex or fragment shader from "outside".<br>
 * In the shader, just use the uniform qualifier to declare the variable:</p>
 * <ul style="list-style-type:none">
 *     <li>uniform float myVariable;</li>
 * </ul>
 *
 * <p>Uniform variables are read-only and have the same value among all processed vertices.<br>
 * They can only be changed within a javascript/C++ program.</p>
 *
 * @type {WebGLUniformLocation}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getUniformLocation getUniformLocation() method}
 * @see {@link http://en.wikibooks.org/wiki/GLSL_Programming/Vector_and_Matrix_Operations GLSL Programming/Vector and Matrix Operations}
 */
let theta;

/**
 * Toggle twist on/off.
 * @type {WebGLUniformLocation}
 */
let twist;

/**
 * Toggle gpu on/off.
 * @type {WebGLUniformLocation}
 */
let gpu;

/**
 * Fixed point - centroid of the triangle.
 * @type {WebGLUniformLocation}
 */
let origin;

/**
 * Fragment color.
 * @type {WebGLUniformLocation}
 */
let fColor;

/**
 * Initial triangle centroid.
 * @type {vec2}
 */
let centroid;

/**
 * Display IP address and set button click action.
 */
function infoBtn() {
  const demo = document.querySelector("#demo");
  const url = {
    api: "http://ip-api.com/json/?fields=query", // no https
    ipify: "https://api.ipify.org?format=json",
    seeip: "https://api.seeip.org/jsonip?",
    myip: "https://api.myip.com", // cors (cross-origin resource sharing)
  };
  const size = Object.keys(url).length - 1;
  const randomKey = Object.keys(url)[~~(Math.random() * size)];
  fetch(url[randomKey])
    .then((response) => response.json())
    .then(
      (json) =>
        (demo.innerHTML += `Your IP address is (${randomKey}): ${
          json[Object.keys(json).at(0)]
        } <br />`),
    );

  const btn = document.querySelector("button");

  /**
   * <p>Fires after both the mousedown and
   * mouseup events have fired (in that order).</p>
   * "Date/Time" button must be pressed and released while the pointer is located inside it.
   * <p>The argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   * @summary Appends an event listener for events whose type attribute value is click.
   * @param {PointerEvent} event a pointer event.
   * @event click
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
   */
  btn.addEventListener("click", (event) => {
    demo.innerHTML += `${Date()}<br />${gl.getParameter(
      gl.SHADING_LANGUAGE_VERSION,
    )}<br />${gl.getParameter(gl.VERSION)}<br />`;
    btn.disabled = true;
    btn.style.display = "none";
    event.preventDefault();
    // avoid double tap for zoom, after the button is clicked
    btn.addEventListener("touchstart", (event) => event.preventDefault());
  });
}

/**
 * <p>Where to start execution when all code is loaded.</p>
 * Triggers the animation.
 */
function init() {
  // gets WebGL context from HTML file
  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL isn't available");
  }

  // Get the input field
  const input = document.getElementById("subdiv");

  /**
   * <p>Fired when a key is pressed.</p>
   * <p>The {@link clickCallBack callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * &lt;Enter&gt; key pressed in &lt;input&gt; subdiv.
   *
   * @summary Appends an event listener for events whose type attribute value is keydown.
   * @param {KeyboardEvent} event a UIEvent.
   * @param {callback} function function to run when the event occurs.
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  input.addEventListener("keydown", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("btnDiv").click();
    }
  });

  setUpShaders();
  handleWindowResize();
  clickCallBack();
  infoBtn();
  animation();
}

/**
 * Convert an hex color to RGB.
 * @param {String} hex a color in the format #RRGGBB
 * @returns {Object<{r: Number, g:Number, b:Number}>}
 * @see {@link https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb RGB to hex and hex to RGB}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt parseInt()}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  // ["#rrggbb", "rr", "gg", "bb"]
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Sets up shaders and buffers.
 */
function setUpShaders() {
  // Load shaders and initialize attribute buffers
  // Used to load, compile and link shaders to form a program object
  //
  // handle to the compiled shader program on the GPU
  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  // bind the shader
  gl.useProgram(program);

  // Load data onto GPU by creating a vertex buffer object on the GPU
  bufferId = gl.createBuffer();
  bufferLineId = gl.createBuffer();

  // Associate the shader variables with the data buffer

  // vPosition was defined in twist.html
  // Connect variable in program with variable in shader
  // get the index for the vPosition attribute defined in the vertex shader
  vPosition = gl.getAttribLocation(program, "vPosition");

  // associate the data in the currently bound buffer with the vPosition attribute
  // The '2' specifies there are 2 floats per vertex in the buffer.
  // Don't worry about the last three args just yet.
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // gets the value of the uniform variable fColor, defined in twist.html
  fColor = gl.getUniformLocation(program, "fColor");

  //
  //  Configure WebGL
  //
  // The portion of the view (projection) plane, intersected by the view frustrum,
  // will be mapped to the viewport
  gl.viewport(0, 0, canvas.width, canvas.height);

  let uColor = getComputedStyle(document.documentElement).getPropertyValue(
    "--bgcolor",
  );

  uColor = hexToRgb(uColor);

  // background color
  gl.clearColor(uColor.r / 255, uColor.g / 255, uColor.b / 255, 1);

  // enlarge the window, by setting a new orthographic projection matrix, defined in twist.html
  const projection = mat4.orthoNO([], -1.5, 1.5, -2.0, 1.0, -1, 1);
  // the projection matrix will be applied in the vertex shader, also defined in twist.html
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "Projection"),
    false,
    projection,
  );

  theta = gl.getUniformLocation(program, "theta");
  twist = gl.getUniformLocation(program, "twist");
  gpu = gl.getUniformLocation(program, "gpu");
  origin = gl.getUniformLocation(program, "origin");

  // Initialize event handlers

  /**
   * <p>Fired when a &lt;input type="range"&gt; is in the
   * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
   * (by clicking or using the keyboard).</p>
   *
   * The {@link clickCallBack callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * Executed when the slider is changed.
   *
   * @summary Appends an event listener for events whose type attribute value is change.
   *
   * @param {Event} event a generic event.
   * @event slider
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
   */
  document.getElementById("slider").onchange = function (event) {
    document.getElementById("subdiv").value = event.target.value.toString();
    clickCallBack();
  };
}

if (document.querySelector('input[type="checkbox"]')) {
  document.querySelectorAll("input[type=checkbox]").forEach((elem) => {
    /**
     * <p>Fired when a &lt;input type="checkbox"&gt; is checked or unchecked
     * (by clicking or using the keyboard).</p>
     * The {@link clickCallBack callback} argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     * @summary Appends an event listener for events whose type attribute value is change.
     * @param {Event} event a generic event.
     * @param {callback} function function to run when the event occurs.
     * @event chkBox
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
     */
    elem.addEventListener("change", () => clickCallBack());
  });
}

/**
 * <p>Fires when the document view (window) has been resized.</p>
 * Also resizes the canvas and viewport.
 * @callback handleWindowResize
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
 */
function handleWindowResize() {
  let h = window.innerHeight - 20;
  let w = window.innerWidth - 20;
  const r = document.querySelector(":root");
  const aspect = 1;
  if (h > w) {
    h = w / aspect; // aspect < 1
  } else {
    w = h * aspect; // aspect > 1
  }
  canvas.width = w;
  canvas.height = h;
  r.style.setProperty("--canvasw", `${w}px`);
  r.style.setProperty("--canvash", `${h}px`);
  gl.viewport(0, 0, w, h);
}

/**
 * <p>Fires when the document view (window) has been resized.</p>
 * <p>The {@link handleWindowResize callback} argument sets the callback
 * that will be invoked when the event is dispatched.</p>
 * @summary Appends an event listener for events whose type attribute value is resize.
 * @param {Event} event a generic event.
 * @param {callback} function function to run when the event occurs.
 * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
 * @event resize
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
 */
window.addEventListener("resize", handleWindowResize, false);

/**
 * <p>Draws the gasket.</p>
 * Each edge of an initial equilateral triangle is
 * recursively subdivided at its middle point.
 *
 *  @param {Number} ndiv number of subdivisions.
 *  @param {Boolean} doTwist toggle twist on/off.
 *  @param {Boolean} useGPU toggle gpu on/off.
 *  @param {Number} angle rotation angle.
 */
function drawTriangle(ndiv = 5, doTwist = true, useGPU = true, angle = 0) {
  // Set reasonable values...
  ndiv = Math.max(Math.min(parseInt(ndiv), 7), 0);
  angle = Math.max(Math.min(angle, 360), -360);
  gl.uniform1f(theta, angle);
  gl.uniform1i(twist, doTwist);
  gl.uniform1i(gpu, useGPU);
  cpu = !useGPU;

  //
  //  Initialize data for the Sierpinski Gasket
  //

  /**
   * Initialize the corners of the gasket with three points,
   * creating an equilateral triangle:
   * <ul>
   *  <li>height (√3) </li>
   *  <li>angles 60° </li>
   *  <li>side length 2 </li>
   * </ul>
   *
   * @see {@link https://en.wikipedia.org/wiki/Equilateral_triangle Equilateral triangle}
   * @type {Array<vec2>}
   * @global
   */
  const vertices = [
    vec2.fromValues(-1, -1),
    vec2.fromValues(0, Math.sqrt(3) - 1),
    vec2.fromValues(1, -1),
  ];

  points = [];
  lines = [];
  // console.log ( Number(ndiv), Number(angle) );

  // points is filled up here...
  divideTriangle(vertices[0], vertices[1], vertices[2], ndiv);
  // Load the data into the GPU

  centroid = vertices
    .reduce((previous, current) => vec2.add([], previous, current))
    .map((value) => value / vertices.length);
  gl.uniform2fv(origin, centroid);

  if (useGPU) {
    // load our data onto the GPU (uses the currently bound buffer)
    // bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flattenArray(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferLineId);
    gl.bufferData(gl.ARRAY_BUFFER, flattenArray(lines), gl.STATIC_DRAW);
  }
}

/**
 * Pushes three vertices to global array points.
 * @param {vec2} a first point.
 * @param {vec2} b second point.
 * @param {vec2} c third point.
 */
function triangle(a, b, c) {
  points.push(a, b, c);
  lines.push(a, b, b, c, c, a);
}

/**
 * Convert degrees to radians.
 * @param {Number} d degrees.
 * @returns {Number} radians.
 */
const radians = (d) => (d * Math.PI) / 180;

/**
 * Partitions triangle (a,b,c) into four new triangles,
 * by recursively subdividing each edge at its middle point.
 *
 * @param {vec2} a first vertex coordinate.
 * @param {vec2} b second vertex coordinate.
 * @param {vec2} c third vertex coordinate.
 * @param {Number} count number of subdivisions on each edge (depth of recursion).
 */
function divideTriangle(a, b, c, count) {
  // check for end of recursion
  if (count === 0) {
    triangle(a, b, c);
  } else {
    // bisect the sides

    const ab = vec2.lerp([], a, b, 0.5); // (a+b)/2
    const ac = vec2.lerp([], a, c, 0.5); // (a+c)/2
    const bc = vec2.lerp([], b, c, 0.5); // (b+c)/2

    --count;

    // three new triangles
    divideTriangle(a, ab, ac, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(b, bc, ab, count);

    // add the middle triangle
    if (fill) {
      divideTriangle(ac, bc, ab, count);
    }
  }
}

/**
 * Returns a new array with all vectors in (global) points,
 * and edges in (global) lines, rotated by an angle theta.
 * <p>This transformation is performed on the CPU.</p>
 *
 * @param {Number} theta rotation angle.
 * @param {vec2} center fixed point (center of rotation).
 * @param {Boolean} twist if true, then twist is applied.
 * @return {Object<Array<vec2>,Array<vec2>>} a new array with same size of points.
 */
function rotateAndTwist(theta, center, twist) {
  const triangles = [];
  const edges = [];
  const m = mat2.fromRotation([], theta);

  // triangle vertices: rotate about the center - T' R T
  const p1 = vec2.create();
  for (const p of points) {
    vec2.subtract(p1, p, center); // translate to (0,0)
    if (twist) mat2.fromRotation(m, theta + vec2.length(p1));
    const p2 = vec2.add([], vec2.transformMat2([], p1, m), center); // rotate and translate back
    triangles.push(p2);
  }

  // triangle borders (edges)
  for (const p of lines) {
    vec2.subtract(p1, p, center);
    if (twist) mat2.fromRotation(m, theta + vec2.length(p1));
    const p2 = vec2.add([], vec2.transformMat2([], p1, m), center);
    edges.push(p2);
  }

  return { triangles: triangles, edges: edges };
}

/**
 * <p>What to do when the left mouse button is clicked.</p>
 * This {@link drawTriangle callback} is fired whenever an &lt;input&gt; checkbox
 * is checked/unchecked, a button is clicked or the &lt;Enter&gt; key is pressed.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
function clickCallBack() {
  fill = document.getElementById("fill").checked;
  delay = document.getElementById("spin").checked ? 0 : 100;
  deform = document.getElementById("twist").checked;

  const label = document.getElementById("lblslider");
  const ndiv = document.getElementById("subdiv").value;
  const angStr = document.getElementById("ang").innerHTML;
  const ang = +angStr.slice(angStr.indexOf(":") + 1, angStr.indexOf("°"));
  document.getElementById("slider").value = ndiv;
  label.innerHTML = `Subdivisions: ${ndiv}`;
  drawTriangle(
    ndiv,
    document.getElementById("twist").checked,
    document.getElementById("gpu").checked,
    ang,
  );
  document.getElementById("red").innerHTML = 3 ** ndiv;
  document.getElementById("white").innerHTML = (3 ** ndiv - 1) / 2;
}

/**
 * A closure to compute the number of frames per second.
 * @return {fps} a callback for counting number of frames.
 * @function
 */
const fpsCounter = (() => {
  let lastCalledTime = Date.now();
  let thisfps = 60;
  let fcount = 0;
  let ftime = 0;
  /**
   * <p>Counts the number of frames per second.</p>
   * Basically, it is necessary to count how many times
   * this function is called in one second.
   * @return {Number} frames per second.
   * @callback fps
   */
  return () => {
    ftime += Date.now() - lastCalledTime;
    lastCalledTime = Date.now();
    if (++fcount > 30) {
      thisfps = (1000 * fcount) / ftime;
      fcount = 0;
      ftime = 0;
    }
    return thisfps;
  };
})();

/**
 * Array of points to Float32array.
 * @param {Array<vec2>} arr array of points.
 * @returns {Float32Array} a new linear array.
 */
function flattenArray(arr) {
  const n = arr[0].length;
  let pos = 0;
  const f32 = new Float32Array(n * arr.length);

  arr.forEach((elem) => {
    elem.forEach((e) => {
      f32[pos++] = e;
    });
  });
  return f32;
}

/**
 * <p>A closure for drawing frames.</p>
 * Keeps calling the render callback.
 * @function
 * @return {render}
 */
const animation = (function () {
  const black = new Float32Array([0.0, 0.0, 0.0, 1.0]);
  const red = new Float32Array([1.0, 0.0, 0.0, 1.0]);
  let ang = 0.0;

  /**
   * <p>Display function.</p>
   * Renders the graphics of this assignment.
   * @callback render
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout Window: setTimeout() method}
   * @see {@link https://developer.mozilla.org/pt-BR/docs/Web/API/Window/requestAnimationFrame window.requestAnimationFrame()}
   */
  return () => {
    setTimeout(function () {
      gl.clear(gl.COLOR_BUFFER_BIT);
      ang += 0.1;
      ang = ang % 360;
      const fps = fpsCounter();
      document.getElementById("fps").innerHTML = `FPS: ${fps
        .toFixed(0)
        .toString()}`;

      if (!cpu) {
        // pass the rotation angle to the GPU
        gl.uniform1f(theta, ang);
      } else {
        // this is brute force!
        const res = rotateAndTwist(radians(ang), centroid, deform);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          flattenArray(res.triangles),
          gl.STATIC_DRAW,
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferLineId);
        gl.bufferData(gl.ARRAY_BUFFER, flattenArray(res.edges), gl.STATIC_DRAW);
      }
      document.getElementById("ang").innerHTML = `Rotation Angle: ${ang
        .toFixed(1)
        .toString()
        .padStart(5, "0")}°`;

      // draw (fill) triangles in red
      gl.uniform4fv(fColor, red);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
      gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, points.length);

      // draw edges (triangle boundaries) in black
      gl.uniform4fv(fColor, black);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferLineId);
      gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, lines.length);
      /*
      // too slow on mobile
      for (let i = 0; i < points.length; i += 3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3);
      }
    */
      requestAnimationFrame(animation);
    }, delay);
  };
})();

/**
 * <p>Fired when the whole page has loaded, including all dependent resources
 * such as stylesheets, scripts, iframes, and images, except those that are loaded lazily.</p>
 * @summary Sets the {@link init entry point} of the application.
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 * @event load
 */
window.addEventListener("load", (event) => init());
