/**
 * @file
 *
 * Summary.
 * <p>Applies a transformation using a matrix in the vertex shader.</p>
 * (The only modified code is in the {@link draw} function and in the vertex shader.)
 *
 * <p>Uses the type Matrix4 from the {@link https://uniguld.dk/wp-content/guld/DTU/webgrafik/0321902920_WebGL.pdf teal book}
 * utilities in cuon-matrix.js</p>
 *
 * <pre>
 * Usage example for {@link Matrix4}:
 *
 *   var m = new Matrix4();                          // identity matrix
 *   m.setTranslate(0.3, 0.0, 0.0);                  // make it into a translation matrix
 *   var m2 = new Matrix4().setRotate(90, 0, 0, 1);  // create and make rotation in one step
 *                                                   // (rotate 90 degrees in x-y plane)
 *   m.multiply(m2);                                 // multiply m on right by m2, i.e., m = m * m2;
 *   Float32Array theRealData = m.elements;          // get the underlying float array
 *                                                   // (this part is sent to shader)
 *
 *   Alternatively, can chain up the operations:
 *
 *   var m = new Matrix4().setTranslate(0.3, 0.0, 0.0).rotate(90, 0, 0, 1);
 * </pre>
 *
 * @author Paulo Roma
 * @date 11/10/2015
 * @see <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.html?rpc=2">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.js">source</a>
 * @see <a href="/cwdc/13-webgl/lib/teal_book/cuon-matrix.js">cuon-matrix</a>
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
var vertices = new Float32Array([
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
var numPoints = vertices.length / 2;

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
 */
var gl;

/**
 * Handle to a <a href="/cwdc/13-webgl/homework/hw3/enableVertexAttribPointer.png">buffer</a> on the GPU.
 * @type {WebGLBuffer}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createBuffer
 */
var vertexbuffer;

/**
 * <p>Position attribute in the vertex shader.</p>
 * This is a number indicating the location of the variable name if found,
 * or -1 otherwise.
 * @type {GLint}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation
 */
var positionIndex;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram
 */
var shader;

/**
 * Collor attribute in the fragment shader.
 * @type {GLint}
 */
var u_color;

/**
 * Complete revolutions about the center per cycle.
 * @type {Number}
 */
var rpc = 2;

/**
 * Html element where the angle is going to be displayed.
 * @type {HTMLElement}
 */
let angle = document.getElementById("ang");

/**
 * Returns a number fractional part and its number of digits.
 * @param {Number} n float number.
 * @returns {Object<fractional:String,ndigits:Number>} fractional part and number of digits.
 * @see https://en.wikipedia.org/wiki/Decimal#Decimal_fractions
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
 * @see https://en.wikipedia.org/wiki/Decimal_separator
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
 * @see http://uniguld.dk/wp-content/guld/DTU/webgrafik/0321902920_WebGL.pdf#page=103
 * @see http://uniguld.dk/wp-content/guld/DTU/webgrafik/0321902920_WebGL.pdf#page=108
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
  var deg2rad = (deg) => (Math.PI * deg) / 180.0;

  var angr = rpc == 0 ? 0 : deg2rad(ang / rpc);
  var angs = deg2rad(ang);
  var x = 0.65 * Math.cos(angr);
  var y = 0.65 * Math.sin(angr);
  var x2 = 0.35 * Math.cos(angs);
  var y2 = 0.35 * Math.sin(angs);

  // get the location of the uniform variable in the shader
  var u_transform = gl.getUniformLocation(shader, "u_transform");

  // draw vertical rectangle
  var modelMatrix = new Matrix4()
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
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that
 * only has to be done once,<br>
 * while draw() does things that have to be repeated
 * each time the canvas is redrawn.
 *
 * @param {Number} r revolutions per cycle.
 */
function mainEntrance(r) {
  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

  rpc = r;

  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById("vertexShader").textContent;
  var fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // retain a handle to the shader program.
  shader = gl.program;

  // get the location of the uniform variable in the shader
  var u_projection = gl.getUniformLocation(shader, "u_projection");

  // set a square window
  var projectionMatrix = new Matrix4().ortho(-1.1, 1.3, -1.2, 1.2, -1, 1);
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
   * A closure to set up an animation loop in which the
   * angle grows by "increment" in each frame.
   * @return {render}
   * @function
   * @global
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth
   * @see http://uniguld.dk/wp-content/guld/DTU/webgrafik/0321902920_WebGL.pdf#page=111
   */
  var runAnimation = (() => {
    var ang = 0.0;
    var increment = rpc > 1 ? 4 : 2;

    var cycles = 1;
    let { fractional, ndigits } = getFractionalPart(rpc);
    if (!Number.isInteger(rpc)) {
      const limit = 10 ** ndigits;
      for (cycles = 2; cycles < limit; ++cycles) {
        // if (Number.isInteger(rpc * cycles)) break;
        let n = (rpc * 360 * cycles) % 360;
        if (n < 1 || n > 359) break;
      }
    }

    // maximum angle - used to reset angle to zero
    var totalAng = rpc == 0 ? 360 : 360 * rpc * cycles;

    /**
     * Maximum number of points to close the curve.
     * @type {Number}
     */
    var npoints = {
      curve: Math.ceil(totalAng / increment),
      circle: Math.ceil((360 / increment) * rpc),
    };

    /**
     * Get the location of the transformation uniform variable in the shader.
     * @type {GLint}
     */
    var u_transform = gl.getUniformLocation(shader, "u_transform");

    /**
     * Array for holding points to draw the curve
     * generated by the center of the cross and the small square.
     * @type {Float32Array}
     */
    var points = {
      curve: new Float32Array(2 * (npoints.curve + 1)),
      circle: new Float32Array(2 * (npoints.circle + 1)),
    };

    /**
     * Number of points in the curve so far.
     * @type {Number}
     */
    var drawCount = {
      curve: 0,
      circle: 0,
    };

    var buffer = {
      curve: gl.createBuffer(),
      circle: gl.createBuffer(),
    };

    var index = {
      curve: 0,
      circle: 0,
    };

    var finished = {
      curve: false,
      circle: false,
    };

    var added = {
      curve: false,
      circle: false,
    };

    var modelMatrix = new Matrix4();

    var tAngle = document.getElementById("tang");

    // display the total angle.
    tAngle.innerHTML = `${Number(totalAng.toFixed(2))}° = ${Number(
      (rpc * cycles).toFixed(2)
    )} revolutions = ${cycles} cycles`;

    gl.lineWidth(3);

    /**
     * <p>Increments angle by "increment" in each frame
     * and render the scene.</p>
     * Note the swap of buffers for drawing the two curves.
     * @callback render
     * @see https://webglfundamentals.org/webgl/lessons/resources/fragment-shader-anim.html
     */
    return () => {
      var [x, y, x2, y2] = draw(ang);

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
            drawCount.curve
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
            drawCount.circle
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