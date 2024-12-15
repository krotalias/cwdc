/**
 * @file
 *
 * Summary.
 *
 * <p>Tracing Closed Curves with Epicycles.</p>
 *
 * <p>This application traces the path of the combined motion of the center
 * of a small square orbit ({@link https://www.ufrgs.br/amlef/glossario/orbita-deferente/ deferent})
 * around the center of a circle
 * and within the orbit itself
 * ({@link https://www.creativescala.org/creative-scala/cycles/epicycles.html epicycle}).</p>
 *
 * <ul>
 * <li>An {@link https://en.wikipedia.org/wiki/Deferent_and_epicycle epicycle}
 * means a circle moving on another circle.</li>
 *
 * <li>The number (rpc) of revolutions of the square (epicycles)
 * per orbit cycle (deferent) is passed
 * as a {@link https://ahrefs.com/blog/url-parameters/ URL parameter} (query string).</li>
 *
 * <li>The total angle for completing a deferent cycle is rpc * 360°. The
 * challenge is when rpc is not an integer. In this case, multiplying rpc
 * by the {@link toNaturalFactor smallest integer}
 * (cycles) that turns it into a natural number results in an integer
 * multiple of revolutions, closing the curve. E.g.:</li>
 *
 * <ul>
 * <li>rpc = 2.14, cycles = 50, then 2.14 * 360 * 50 / 360 = 107 revolutions.</li>
 * <li>rpc = 2.114, cycles = 500, then 2.114 * 360 * 500 / 360 = 1057 revolutions.</li>
 * <li>rpc = 0.114, cycles = 500, then 0.114 * 360 * 500 / 360 = 57 revolutions.</li>
 * </ul>
 *
 * <li>Applies a transformation by passing a {@link modelMatrix matrix} to the vertex shader.</li>
 *
 * <li>Uses the class {@link Matrix4} from the
 * {@link https://www.rose-hulman.edu/class/csse/csse351/reference/0321902920_WebGL.pdf teal book}
 * utilities to perform {@link https://www.cuemath.com/algebra/matrix-operations/ matrix operations}.</li>
 * </ul>
 *
 * <img src="/cwdc/13-webgl/homework/hw3/Epicycle.png" width="256">
 *
 * <pre>
 * Usage example of a {@link Matrix4}:
 *
 *   const m = new Matrix4();        // identity {@link Matrix4 matrix}
 *   m.setTranslate(0.3, 0.0, 0.0);  // make it into a {@link Matrix4#setTranslate translation} matrix
 *   const m2 = new Matrix4().       // create and make {@link Matrix4#setRotate rotation} in one step
 *     setRotate(90, 0, 0, 1);       // (rotate 90 degrees in xy-plane)
 *   m.multiply(m2);                 // {@link Matrix4#multiply multiply} m on right by m2, i.e., m = m * m2;
 *   Float32Array theRealData = m.elements;  // get the {@link Matrix4#elements underlying} float array
 *                                           // (this part is sent to shader)
 *
 * Alternatively, one can chain up the operations:
 *
 *   const m = new Matrix4().setTranslate(0.3, 0.0, 0.0).rotate(90, 0, 0, 1);
 * </pre>
 *
 * @author Paulo Roma
 * @since 11/10/2015
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.html?rpc=2">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.js">source</a>
 * @see {@link https://sciencedemonstrations.fas.harvard.edu/presentations/ptolemaic-epicycle-machine Ptolemaic Epicycle Machine}
 * @see {@link https://study.com/learn/lesson/epicycle-ptolemy-astronomy-diagrams.html Epicycle in Astronomy & Meaning of Ptolemy}
 * @see <img src="/cwdc/13-webgl/homework/hw3/cross.png" width="256"> <img src="/cwdc/13-webgl/homework/hw3/cross166.png" width="256">
 */

"use strict";

/**
 * Raw data for some point positions - this will be a square, consisting
 * of two triangles.  We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).
 * @type {Float32Array}
 */
// prettier-ignore
const vertices = new Float32Array([
  -0.5, -0.5,
  0.5, -0.5,
  0.5, 0.5,
  -0.5, -0.5,
  0.5, 0.5,
  -0.5, 0.5,
]);

/**
 * Number of vertices.
 * @type {Number}
 */
const numPoints = vertices.length / 2;

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext WebGLRenderingContext}
 */
let gl;

/**
 * Handle to a <a href="/cwdc/13-webgl/homework/hw3/enableVertexAttribPointer.png">buffer</a> on the GPU.
 * @type {WebGLBuffer}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createBuffer WebGLRenderingContext: createBuffer() method}
 */
let vertexbuffer;

/**
 * <p>Position attribute in the vertex shader.</p>
 * This is a number indicating the location of the variable name if found,
 * or -1 otherwise.
 * @type {GLint}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation WebGLRenderingContext: getAttribLocation() method}
 */
let positionIndex;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram WebGLProgram}
 */
let shader;

/**
 * Collor attribute in the fragment shader.
 * @type {GLint}
 */
let u_color;

/**
 * Complete revolutions about the center per cycle.
 * @type {Number}
 */
let rpc = 2;

/**
 * Html element where the angle is going to be displayed.
 * @type {HTMLElement}
 */
const angle = document.getElementById("ang");

/**
 * Returns a number fractional part and its number of digits.
 * @param {Number} n float number.
 * @returns {Object<fractional:String,ndigits:Number>} fractional part and number of digits.
 * @see {@link https://en.wikipedia.org/wiki/Decimal#Decimal_fractions Decimal fractions}
 */
function getFractionalPart(n) {
  if (Number.isInteger(+n)) return { fractional: "0", ndigits: 0 };
  const decimalStr = n.toString().split(".")[1];
  return { fractional: decimalStr, ndigits: +decimalStr.length };
}

/**
 * Returns a number with a fixed amount of decimal places.
 * @param {Number} n float number.
 * @param {Number} dig number of digits.
 * @returns {Number} n with dig decimal places.
 * @see {@link https://en.wikipedia.org/wiki/Decimal_separator Decimal separator}
 */
function roundNumber(n, dig) {
  const limit = 10 ** dig;
  return Math.round(n * limit) / limit;
}

/**
 * <p>Code to actually <a href="/cwdc/13-webgl/homework/hw3/vertex-shader-anim.gif">render</a> our model, which
 * is made up of two rectangles forming a cross and
 * a disconnected square.</p>
 *
 * There is a rotation about the centre of the rectangles,
 * and a translation to an external circle around the model.
 *
 * @param {Number} ang rotation angle in degrees.
 * @return {Array<Number,Number,Number,Number>} position of the center of the cross and the small square.
 * @see {@link https://www.informit.com/articles/article.aspx?p=2111395 Figure 3.8}
 * @see {@link https://www.informit.com/articles/article.aspx?p=2111395 Figure 3.9}
 * @see <a href="/cwdc/13-webgl/homework/hw3/drawArrays.png">drawArrays</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/shapes.png">WebGL shapes</a>
 *
 */
function draw(ang) {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // bind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  positionIndex = gl.getAttribLocation(shader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // get location of the uniform color variable in the fragment shader
  u_color = gl.getUniformLocation(shader, "u_color");

  // set rectangle's color to red
  gl.uniform4f(u_color, 1.0, 0.0, 0.0, 1.0);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.
  // Don't worry about the last three args just yet.)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // degrees to radians
  const deg2rad = (deg) => (Math.PI * deg) / 180.0;

  const angr = rpc == 0 ? 0 : deg2rad(ang / rpc);
  const angs = deg2rad(ang);
  const x = 0.65 * Math.cos(angr);
  const y = 0.65 * Math.sin(angr);
  const x2 = 0.35 * Math.cos(angs);
  const y2 = 0.35 * Math.sin(angs);

  // get the location of the uniform variable in the shader
  const u_transform = gl.getUniformLocation(shader, "u_transform");

  /**
   * Transformation matrix for drawing the vertical rectangle,
   * @type {Matrix4}
   * @global
   */
  let modelMatrix = new Matrix4()
    .translate(x, y, 0.0)
    .rotate(ang, 0.0, 0.0, 1.0)
    .scale(0.15, 0.4, 1.0);
  gl.uniformMatrix4fv(u_transform, false, modelMatrix.elements);

  // gl.drawArrays(mode, first, count)
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // draw horizontal rectangle
  modelMatrix = new Matrix4()
    .translate(x, y, 0.0)
    .rotate(ang, 0.0, 0.0, 1.0)
    .scale(0.4, 0.15, 1.0);
  gl.uniformMatrix4fv(u_transform, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // draw square
  modelMatrix = new Matrix4()
    .translate(x + x2, y + y2, 0.0)
    .rotate(ang, 0.0, 0.0, 1.0)
    .scale(0.15, 0.15, 1.0);
  gl.uniformMatrix4fv(u_transform, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // we can unbind the buffer now
  // (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);

  // display the current angle.
  angle.innerHTML = `${ang.toFixed(0)}°`;

  return [x, y, x2, y2];
}

/**
 * Greatest Common Divisor, which returns the highest
 * number that divides into two other numbers exactly.
 * @param {Number} x first integer.
 * @param {Number} y second integer.
 * @return {Number} GCD.
 * @see {@link https://dmitripavlutin.com/swap-variables-javascript/ 4 Ways to Swap Variables in JavaScript}
 * @see {@link https://www.mathsisfun.com/greatest-common-factor.html Greatest Common Factor}
 */
function gcd(x, y) {
  while (x) {
    [x, y] = [y % x, x];
  }
  return y;
}

/**
 * <p>Given a rational number f = n/d (float), returns the
 * smallest integer k such that k * f becomes a natural number.</p>
 * <p>Write f in fraction form,
 * then divide denominator by {@link gcd}(numerator, denominator).</p>
 * <ul>
 * <li>E.g., for 30.25 = 3025/100, gcd is 25</li>
 * <li>Then return 100/25 = 4, that is,</li>
 * <li>30.25 = 3025/25 / 100/25 = 121/4 ⇒ 30.25 * 4 = 121.</li>
 * </ul>
 * @param {Number} f float number.
 * @return {Number} integer multiplier.
 */
function toNaturalFactor(f) {
  const { ndigits } = getFractionalPart(f);
  if (!Number.isInteger(f)) {
    const denominator = 10 ** ndigits;
    const numerator = Math.trunc(f * denominator);
    return denominator / gcd(numerator, denominator);
  }
  return 1;
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that
 * only has to be done once,<br>
 * while {@link draw draw()} does things that have to be repeated
 * each time the canvas is redrawn.
 *
 * @param {Number} r revolutions per cycle.
 */
function mainEntrance(r) {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  rpc = r;

  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById("vertexShader").textContent;
  const fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // retain a handle to the shader program.
  shader = gl.program;

  // get the location of the uniform variable in the shader
  const u_projection = gl.getUniformLocation(shader, "u_projection");

  // set a square window
  const projectionMatrix = new Matrix4().ortho(-1.1, 1.3, -1.2, 1.2, -1, 1);
  gl.uniformMatrix4fv(u_projection, false, projectionMatrix.elements);

  // Unbind the shader.
  // This looks odd, but the way initShaders works is that it "binds" the shader and
  // stores the handle in an extra property of the gl object.
  // That's ok, but will really mess things up when we have more than one shader pair.
  gl.useProgram(null);

  // request a handle for a chunk of GPU memory
  vertexbuffer = gl.createBuffer();
  if (!vertexbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

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

  handleWindowResize();

  /**
   * A closure to set up an animation loop in which the
   * angle grows by "increment" in each frame.
   * @return {render}
   * @function
   * @global
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth WebGLRenderingContext: lineWidth() method}
   * @see {@link https://www.informit.com/articles/article.aspx?p=2111395 Figure 3.11}
   */
  const runAnimation = (() => {
    let ang = 0.0;
    const increment = rpc > 1 ? 4 : 2;

    const cycles = toNaturalFactor(rpc);

    // maximum angle - used to reset angle to zero
    const totalAng = rpc == 0 ? 360 : 360 * rpc * cycles;

    /**
     * Maximum number of points to close the curve.
     * @type {Object<curve:Number, circle:Number>}
     */
    const npoints = {
      curve: Math.ceil(totalAng / increment),
      circle: Math.ceil((360 / increment) * rpc),
    };

    /**
     * Get the location of the transformation uniform variable in the shader.
     * @type {GLint}
     */
    const u_transform = gl.getUniformLocation(shader, "u_transform");

    /**
     * Object for holding points to draw the curve
     * generated by the center of the cross and the small square.
     * @type {Object<curve:Float32Array, circle:Float32Array>}
     */
    const points = {
      curve: new Float32Array(2 * (npoints.curve + 1)),
      circle: new Float32Array(2 * (npoints.circle + 1)),
    };

    /**
     * Number of points in the curve so far.
     * @type {Obecjec<curve:Number, circle:Number>}
     */
    const drawCount = {
      curve: 0,
      circle: 0,
    };

    const buffer = {
      curve: gl.createBuffer(),
      circle: gl.createBuffer(),
    };

    const index = {
      curve: 0,
      circle: 0,
    };

    const finished = {
      curve: false,
      circle: false,
    };

    const added = {
      curve: false,
      circle: false,
    };

    const modelMatrix = new Matrix4();

    const tAngle = document.getElementById("tang");

    // display the total angle.
    tAngle.innerHTML = `${Number(totalAng.toFixed(2))}° = ${Number(
      (rpc * cycles).toFixed(2),
    )} revolutions = ${cycles} cycles <br \>Speed = ${increment.toFixed(2)} (${(totalAng / (60 * increment)).toFixed(2)}s/cycle)`;

    gl.lineWidth(3);

    /**
     * <p>Increments angle by "increment" in each frame
     * and {@link draw render} the scene.</p>
     * Note the swap of buffers for drawing the two curves.
     * @callback render
     * @see {@link https://webglfundamentals.org/webgl/lessons/resources/fragment-shader-anim.html Fragment Shader Anim}
     */
    return () => {
      const [x, y, x2, y2] = draw(ang);

      if (index.curve < 2 * npoints.curve) {
        points.curve[index.curve++] = x + x2;
        points.curve[index.curve++] = y + y2;
        ++drawCount.curve;
      } else if (!finished.curve) {
        finished.curve = true;
        // close the curve
        points.curve[index.curve++] = points.curve[0];
        points.curve[index.curve++] = points.curve[1];
        ++drawCount.curve;
      }

      if (index.circle < 2 * npoints.circle) {
        points.circle[index.circle++] = x;
        points.circle[index.circle++] = y;
        ++drawCount.circle;
      } else if (!finished.circle) {
        finished.circle = true;
        // close the circle
        points.circle[index.circle++] = points.circle[0];
        points.circle[index.circle++] = points.circle[1];
        ++drawCount.circle;
      }

      if (drawCount.curve > 2) {
        gl.useProgram(shader);

        // "bind" the buffer as the current array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.curve);

        if (!added.curve)
          // load our data onto the GPU (uses the currently bound buffer)
          gl.bufferData(
            gl.ARRAY_BUFFER,
            points.curve,
            gl.DYNAMIC_DRAW,
            0,
            drawCount.curve,
          );

        // "enable" the a_position attribute
        gl.enableVertexAttribArray(positionIndex);

        gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(u_transform, false, modelMatrix.elements);

        if (!finished.curve) {
          // set color to orange in the fragment shader
          gl.uniform4f(u_color, 1.0, 0.5, 0.0, 1.0);
        } else {
          // set color to yellow in the fragment shader
          gl.uniform4f(u_color, 1.0, 1.0, 0.0, 1.0);
          added.curve = true;
        }

        gl.drawArrays(gl.LINE_STRIP, 0, drawCount.curve);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(positionIndex);
        gl.useProgram(null);
      }

      if (drawCount.circle > 2) {
        gl.useProgram(shader);

        // "bind" the buffer as the current array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.circle);

        if (!added.circle)
          // load our data onto the GPU (uses the currently bound buffer)
          gl.bufferData(
            gl.ARRAY_BUFFER,
            points.circle,
            gl.DYNAMIC_DRAW,
            0,
            drawCount.circle,
          );

        // "enable" the a_position attribute
        gl.enableVertexAttribArray(positionIndex);

        gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(u_transform, false, modelMatrix.elements);

        added.circle = finished.circle;

        // set color to aqua in the fragment shader
        gl.uniform4f(u_color, 0.0, 1.0, 1.0, 1.0);

        gl.drawArrays(gl.LINE_STRIP, 0, drawCount.circle);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(positionIndex);
        gl.useProgram(null);
      }

      ang += increment;
      ang %= totalAng;

      // request that the browser calls animate() again "as soon as it can"
      requestAnimationFrame(runAnimation);
    };
  })();

  // draw!
  runAnimation();
}

/**
 * Loads the {@link mainEntrance application}.</p>
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
addEventListener("load", (event) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // complete revolutions about the center per cycle
  let rpc = urlParams.get("rpc") || "2";

  let ndigits = getFractionalPart(rpc).ndigits;
  const negative = rpc < 0;
  rpc = rpc >= 0 ? +rpc : -1 / rpc;
  if (negative && ndigits == 0) ndigits = 2;
  if (ndigits > 0) {
    // maximum of 3 digits, to avoid overdraw
    rpc = roundNumber(rpc, Math.min(3, ndigits));
  }
  document.getElementById("rpc").innerHTML = rpc == 0 ? "∞" : rpc;
  mainEntrance(rpc);
});
