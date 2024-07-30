/**
 * @file
 *
 * Summary.
 * <p>Similar to <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.js">GL_example3a</a>,
 * but applies the transformation using a matrix in the vertex shader.</p>
 *
 * Initially, the square should rotate counterclockwise about its lower left corner, colored red,
 * at a rate of two degrees per frame.<br>
 * When a key is pressed, the square should, starting in its current position,
 * begin rotating about a different corner, depending on the key pressed:
 * <ul>
 *  <li>'g' for the green corner, </li>
 *  <li>'b' for the blue corner, </li>
 *  <li>'w' for the white corner, or </li>
 *  <li>'r' for the red corner.</li>
 * </ul>
 *
 * See the {@link runAnimation animation loop} for various kinds of rotations:
 *
 * <ul>
 *  <li>The square bunces back into the window when any of their vertices touch
 *  an edge of the window.</li>
 *  <li>Uses the class {@link Matrix4} from the
 *  {@link https://www.rose-hulman.edu/class/csse/csse351/reference/0321902920_WebGL.pdf teal book}
 *  utilities to perform {@link https://www.cuemath.com/algebra/matrix-operations/ matrix operations}.</li>
 * </ul>
 *
 * <iframe title="WebGL" style="position: relative; top: 20px; margin-bottom: -100px; width: 450px; height: 680px; transform-origin: 0px 20px; transform: scale(0.8);" src="/cwdc/13-webgl/homework/hw2/RotatingSquare2.html"></iframe>
 *
 * <p>Usage example of a Matrix4:</p>
 * <pre>
 *   const m = new Matrix4();        // identity {@link Matrix4 matrix}
 *   m.setTranslate(0.3, 0.0, 0.0);  // make it into a {@link Matrix4#setTranslate translation} matrix
 *   const m2 = new Matrix4().       // create and make {@link Matrix4#setRotate rotation} in one step
 *     setRotate(90, 0, 0, 1);       // (rotate 90 degrees in x-y plane)
 *   m.multiply(m2);                 // {@link Matrix4#multiply multiply} m on right by m2, i.e., m = m * m2;
 *   const theRealData = m.elements; // get the {@link Matrix4#elements underlying} Float32Array
 *                                   // (this part is sent to shader)
 *
 * Alternatively, one can chain up the operations:
 *
 *   const m = new Matrix4().setTranslate(0.3, 0.0, 0.0).rotate(90, 0, 0, 1);
 * </pre>
 *
 * @author Paulo Roma
 * @since 27/09/2016
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2016-2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare2.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare2.js">source</a>
 * @see <a href="../videos/RotatingSquare2.mp4">video</a>
 */

"use strict";

/**
 * <p>Raw data for some point positions - this will be a square, consisting
 * of two triangles. </p>
 * We provide two values per vertex for the x and y coordinates
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
  -0.5, 0.5
]);

/**
 * Maps triangle opposite vertices to square vertices.
 * @type {Object<Number, Number>}
 */
const square = {
  0: 2,
  1: 5,
  2: 0,
  3: 2,
  4: 0,
  5: 1,
};

/**
 * Toggle animation.
 * @type {Boolean}
 */
let paused = document.getElementById("pause").checked;

/**
 * Number of vertices.
 * @type {Number}
 */
const numPoints = vertices.length / 2;

/**
 * Keys to corners.
 * @type {Object<String,Number>}
 */
const keys = {
  r: 0,
  g: 1,
  b: 2,
  w: 5,
};

/**
 * Index of current corner relative to vertices.
 * @type {Number}
 */
let cindex = 0;

/**
 * Whether a key has been clicked.
 * @type {Boolean}
 */
let click = false;

/**
 * A color value for each vertex.
 * @type {Float32Array}
 */
// prettier-ignore
const colors = new Float32Array([
  1.0, 0.0, 0.0, 1.0,  // red
  0.0, 1.0, 0.0, 1.0,  // green
  0.0, 0.0, 1.0, 1.0,  // blue
  1.0, 0.0, 0.0, 1.0,  // red
  0.0, 0.0, 1.0, 1.0,  // blue
  1.0, 1.0, 1.0, 1.0,  // white
]);

/**
 * Model scale.
 * @type {Number}
 */
let mscale = 1;

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 */
let gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexbuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let colorbuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let shader;

/**
 * An identity model transformation matrix.
 * @type {Matrix4}
 */
const modelMatrix = new Matrix4();

/**
 * Canvas object.
 * @type {Object}
 * @property {HTMLElement} canvas.elem first canvas element.
 * @property {Number} canvas.w width.
 * @property {Number} canvas.h height.
 * @property {Number} canvas.aspect aspect ratio.
 */
const canvas = {
  elem: document.querySelector("canvas"),
  get w() {
    return this.elem.width;
  },
  get h() {
    return this.elem.height;
  },
  get aspect() {
    return this.w / this.h;
  },
};

/**
 * World coordinates defined by a rectangle centered at the origin,
 * with the same aspect ratio of the canvas.
 * @type {Object}
 * @property {Number} world.size height length.
 * @property {Number} world.w width.
 * @property {Number} world.h height.
 * @property {Array<Number>} world.bounds lower left and upper right corners.
 * @property {Array<Number>} world.upperBounds upper right corner.
 */
const world = {
  _size: 8,
  get h() {
    return this._size;
  },
  get w() {
    return this._size * canvas.aspect;
  },
  get upperBounds() {
    return [this.w / 2, this.h / 2];
  },
  get bounds() {
    return [-this.w / 2, this.w / 2, -this.h / 2, this.h / 2];
  },
  set size(value) {
    this._size = Math.abs(value);
  },
};

/**
 * Projection matrix.
 * @type {Matrix4}
 */
const projectionMatrix = new Matrix4().setOrtho(...world.bounds, 0, 1);

/**
 * Translate keydown events to strings
 * @param {KeyboardEvent} event keyboard event.
 * @see  http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Sets {@link modelMatrix} to rotate by an angle ang,
 * about point (x,y).
 * @param {Number} ang rotation angle.
 * @param {Number} x transformed x coordinate of the pivot vertex.
 * @param {Number} y transformed y coordinate of the pivot vertex.
 * @param {Number} tx translation from the transformed pivot vertex to its original position, in the x axis.
 * @param {Number} ty translation from the transformed pivot vertex to its original position, in the y axis.
 */
function rotateAboutCorner(ang, x, y, tx, ty) {
  modelMatrix.setTranslate(x, y, 0.0);
  modelMatrix.rotate(ang, 0.0, 0.0, 1.0);
  modelMatrix.scale(mscale, mscale, 1);
  modelMatrix.translate(-x, -y, 0.0);
  // unless clicked this is (0,0)
  modelMatrix.translate(tx, ty, 0.0);
}

/**
 * <p>Closure for keydown events.</p>
 * Handle keydown events that will update {@link modelMatrix}
 * based on key pressed.
 * @param {KeyboardEvent} event keyboard event.
 * @return {key_event}
 * @function
 */
const handleKeyPress = ((event) => {
  const zoomfactor = 0.7;
  const pause = document.getElementById("pause");
  const key = (ind) => Object.keys(keys).find((k) => keys[k] === ind);

  /**
   * <p>Handler for keydown events.</p>
   * @param {KeyboardEvent} event keyboard event.
   * @callback key_event callback to handle a key pressed.
   */
  return (event) => {
    let ch = getChar(event);

    switch (ch) {
      case " ":
        paused = !paused;
        pause.checked = paused;
        if (!paused) document.getElementById(key(cindex)).checked = true;
        runAnimation();
        break;
      case "m":
        printMatrix(modelMatrix);
        break;
      case "ArrowUp":
        // zoom out
        mscale *= zoomfactor;
        mscale = Math.max(0.2, mscale);
        break;
      case "ArrowDown":
        // zoom in - lets scale so the diagonal of the square
        // almost touches the border of the window
        const [v1x, v1y, p1x, p1y] = mapCornerToWorld(cindex);
        const [v2x, v2y, p2x, p2y] = mapCornerToWorld(square[cindex]);
        const d = Math.min.apply(null, [
          world.w / 2 - p1x,
          world.w / 2 + p1x,
          world.h / 2 - p1y,
          world.h / 2 + p1y,
        ]);
        const diag = Math.hypot(p2x - p1x, p2y - p1y);

        mscale /= zoomfactor;
        mscale = Math.min((d / diag / Math.sqrt(2)) * 0.98 * mscale, 3);
        click = true;
        break;
      default:
        ch = ch.toLowerCase();
        if (ch in keys) {
          cindex = keys[ch];
          click = true;
          document.getElementById(ch).checked = true;
          paused = false;
          runAnimation();
          console.log(ch);
        }
        break;
    }
  };
})();

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @function
 */
const createEvent = (key) => {
  const code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * Increase zoom level.
 */
function zoomIn() {
  handleKeyPress(createEvent("ArrowDown"));
}

/**
 * Decrease zoom level.
 */
function zoomOut() {
  handleKeyPress(createEvent("ArrowUp"));
}

/**
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event change - executed when the corner input radio is checked (but not when unchecked).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
 */
if (document.querySelector('input[name="corner"]')) {
  document.querySelectorAll('input[name="corner"]').forEach((elem) => {
    elem.addEventListener("change", function (event) {
      const item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

/**
 * <p>Loads the {@link mainEntrance application}.</p>
 * @event load - fired when the whole page has loaded.
 * @param {Event} event event load event.
 */
window.addEventListener("load", (event) => mainEntrance());

/**
 * Returns the coordinates of the {@link vertices vertex} at index i.
 * @param {Number} i vertex index.
 * @returns {Array<Number>} vertex coordinates.
 */
function getVertex(i) {
  const j = (i % numPoints) * 2;
  return [vertices[j], vertices[j + 1]];
}

/**
 * Code to actually render our geometry.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // bind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(shader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.  Don't worry about
  // the last three args just yet.)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // we can unbind the buffer now (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // bind the buffer with the color data
  gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);

  // get the index for the a_Color attribute defined in the vertex shader
  const colorIndex = gl.getAttribLocation(shader, "a_Color");
  if (colorIndex < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  // "enable" the a_Color attribute
  gl.enableVertexAttribArray(colorIndex);

  // Associate the data in the currently bound buffer with the a_Color attribute
  // The '4' specifies there are 4 floats per vertex in the buffer
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

  // set the value of the uniform variable in the shader and draw
  const transformLoc = gl.getUniformLocation(shader, "transform");
  const transform = new Matrix4(projectionMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  gl.drawArrays(gl.POINTS, cindex, 1);

  // we can unbind the buffer now
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * Print matrix on the console, in column major order.
 * @param {Matrix4} matrix 4x4 matrix.
 */
function printMatrix(matrix) {
  const m = matrix.elements;
  console.log([m[0], m[4], m[8], m[12]]);
  console.log([m[1], m[5], m[9], m[13]]);
  console.log([m[2], m[6], m[10], m[14]]);
  console.log([m[3], m[7], m[11], m[15]]);
}

/**
 * Maps a square corner to the world coordinate system.
 * @param {Number} ind vertex index.
 * @returns {Array<Number>} corner coordinates in model and world space.
 */
function mapCornerToWorld(ind) {
  const [vx, vy] = ind !== undefined ? getVertex(ind) : [0, 0];
  const corner = new Vector4([vx, vy, 0, 1]);
  const [px, py] = modelMatrix.multiplyVector4(corner).elements;
  return [vx, vy, px, py];
}

/**
 * Entry point when page is loaded.
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw} does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event keydown - fired when a key is pressed.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event}
   */
  window.addEventListener("keydown", (event) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
        event.code,
      )
    ) {
      event.preventDefault();
    }
    handleKeyPress(event);
  });

  // get the rendering context for WebGL
  gl = canvas.elem.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById("vertexShader").textContent;
  const fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  /**
   * Retain a handle to the shader program, then unbind it.
   * This looks odd, but the way initShaders works is that it "binds" the shader
   * and stores the handle in an extra property of the gl object.
   * That's ok, but will really mess things up when we have more than one shader pair.
   */
  shader = gl.program;
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

  // buffer for the color data
  colorbuffer = gl.createBuffer();
  if (!colorbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  // now that the buffer is set up, we can unbind the buffer
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // draw!
  runAnimation();
}

/**
 * A closure to set up an animation loop in which the
 * angle grows by "increment" each frame.
 * @return {loop} animation loop.
 * @function
 */
const runAnimation = (() => {
  // control the rotation angle
  let ang = 0.0;

  // translation
  let tx = 0;
  let ty = 0;

  // angle increment
  let increment = 2.0;

  // these values are set when the function is loaded,
  // and do not change afterwards...
  const [wlen, hlen] = world.upperBounds;

  let requestId = 0;
  let vx, vy, px, py;
  [px, py] = getVertex(cindex);

  /**
   * <p>Keep drawing frames.</p>
   * Request that the browser calls {@link runAnimation} again "as soon as it can".
   * @callback loop
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   */
  return () => {
    if (requestId) {
      cancelAnimationFrame(requestId);
      requestId = 0;
    }

    if (paused) return;

    ang += increment;
    ang = ang % 360;
    if (click) {
      [vx, vy, px, py] = mapCornerToWorld(cindex);
      tx = px - vx;
      ty = py - vy;
      click = false;
    }

    // collision detection
    for (const k in keys) {
      [vx, vy, vx, vy] = mapCornerToWorld(keys[k]);
      if (vx < -wlen || vx > wlen || vy < -hlen || vy > hlen) {
        increment = -increment;
        // send the vertex back into the window
        ang += 2 * increment;
        break;
      }
    }

    rotateAboutCorner(ang, px, py, tx, ty);

    draw();

    requestId = requestAnimationFrame(runAnimation);
  };
})();
