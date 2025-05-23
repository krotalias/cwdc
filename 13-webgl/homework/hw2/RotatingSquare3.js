/**
 * @file
 *
 * Summary.
 * <p><p>Understanding {@link https://users.math.msu.edu/users/hhu/848/lec_2.pdf fixed points} in linear transformations,
 * and it is similar to <a href="/cwdc/13-webgl/examples/example123/content/GL_example3.js">GL_example3</a>,
 * but applies the transformation using a matrix in the vertex shader.</p>
 *
 * <p>Initially, the square should rotate counterclockwise about its lower left corner, colored red,
 * at a rate of two degrees per frame.</p>
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
 * <li>The square crawls the window borders when any of their vertices touch
 * an edge of the window.</li>
 *
 * <li>Line width is not implemented in {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth WebGL}.
 * The solution used here is through texture coordinates in the
 * <a href="/cwdc/13-webgl/homework/hw2/showCode.php?f=RotatingSquare3">fragment shader</a> to obtain it.</li>
 *
 * <li>Uses the class {@link Matrix4} from the
 * {@link https://www.rose-hulman.edu/class/csse/csse351/reference/0321902920_WebGL.pdf teal book}
 * utilities to perform {@link https://www.cuemath.com/algebra/matrix-operations/ matrix operations}.</li>
 * </ul>
 *
 * <iframe title="WebGL+Canvas" style="position: relative; top: 20px; margin-bottom: -300px; width: 950px; height: 980px; transform-origin: 0px 20px; transform: scale(0.6);" src="/cwdc/13-webgl/homework/hw2/RotatingSquare3.html"></iframe>
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
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2016-2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare3.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare3.js">source</a>
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3.html">GL_example3</a>
 * @see <a href="../videos/RotatingSquare3.mp4">video</a>
 */

"use strict";

/**
 * Raw data for some point positions -
 * this will be a square, consisting of two triangles.
 * <p>We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).</p>
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
 * Toggle animation.
 * @type {Boolean}
 */
let paused = document.getElementById("pause").checked;

/**
 * Number of points (vertices).
 * @type {Number}
 */
const numPoints = vertices.length / 2;

/**
 * Index of current corner relative to vertices.
 * @type {Number}
 */
let cindex = 0;

/**
 * Whether a key has been pressed.
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
 * A texture value for each vertex.
 * @type {Float32Array}
 */
// prettier-ignore
const textureCoords = new Float32Array([
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  1.0, 0.0,
  0.0, 1.0,
  0.0, 0.0,
]);

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
 * Model scale.
 * @type {Number}
 */
let mscale = 1;

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
let gl;

/**
 * The canvas context.
 * @type {CanvasRenderingContext2D}
 */
let ctx;

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
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let textbuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let shader;

/**
 * Model transformation matrix.
 * @type {Matrix4}
 */
let modelMatrix = new Matrix4();

/**
 * Projection matrix.
 * @type {Matrix4}
 */
const projectionMatrix = new Matrix4().setOrtho(...world.bounds, 0, 1);

/**
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String | null}
 * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent KeyboardEvent}
 */
function getChar(event) {
  return event.key
    ? event.key
    : event.key == null
      ? String.fromCharCode(event.code) // IE
      : null; // special key
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
  const pause = document.getElementById("pause");
  const key = (ind) => Object.keys(keys).find((k) => keys[k] === ind);
  const zoomfactor = 0.7;

  /**
   * <p>Handler for keydown events.</p>
   * @param {KeyboardEvent} event keyboard event.
   * @callback key_event callback to handle a key pressed.
   */
  return (event) => {
    const ch = getChar(event);

    switch (ch) {
      case "m":
        printMatrix(modelMatrix);
        break;
      case " ":
        paused = !paused;
        pause.checked = paused;
        if (!paused) document.getElementById(key(cindex)).checked = true;
        runAnimation();
        break;
      case "ArrowUp":
        mscale *= zoomfactor;
        mscale = Math.max(0.2, mscale);
        break;
      case "ArrowDown":
        mscale /= zoomfactor;
        mscale = Math.min(3, mscale);
        break;
      default:
        if (ch in keys) {
          cindex = keys[ch];
          document.getElementById(ch).checked = true;
          click = true;
          paused = false;
          runAnimation();
        }
        break;
    }
  };
})();

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @event KeyboardEvent
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

if (document.querySelector('input[name="corner"]')) {
  document.querySelectorAll('input[name="corner"]').forEach((elem) => {
    /**
     * @summery Executed when the corner input radio is checked (but not when unchecked).
     * <p>Appends an event listener for events whose type attribute value is change.
     * The callback argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event changeCorner
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
     */
    elem.addEventListener("change", function (event) {
      const item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

/**
 * @summary Fired when the whole page has loaded.
 * <p>Loads the {@link mainEntrance application}.</p>
 * @event load
 * @param {Event} event event load event.
 */
window.addEventListener("load", (event) => mainEntrance());

/**
 * Given a color index return the corresponding {@link colors RGB} color,
 * where each component is in the range [0,255].
 * @param {Number} i color index.
 * @returns {String} a RGB color.
 * @see <a href="../number-conversions.png">number conversions</a>
 * @see {@link https://stackoverflow.com/questions/5971645/what-is-the-double-tilde-operator-in-javascript What is the "double tilde" (~~) operator in JavaScript? }
 * @see {@link https://www.geeksforgeeks.org/what-is-double-tilde-operator-in-javascript/ What is (~~) “double tilde” operator in JavaScript ?}
 */
function getColor(i) {
  const j = (i % numPoints) * 4;
  const c = colors.slice(j, j + 3).map((x) => ~~(x * 255));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

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
 * Sets {@link modelMatrix} to rotate by an angle ang,
 * about point (x,y)
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
  modelMatrix.translate(tx, ty, 0.0);
}

/**
 * Code to actually render our geometry.
 * This is the WebGL version.
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

  gl.bindBuffer(gl.ARRAY_BUFFER, textbuffer);

  // get the index for the a_TexCoord attribute defined in the vertex shader
  const textureCoordinates = gl.getAttribLocation(shader, "a_TexCoord");
  if (textureCoordinates < 0) {
    console.log("Failed to get the storage location of a_TexCoord");
    return;
  }

  // "enable" the a_TexCoord attribute
  gl.enableVertexAttribArray(textureCoordinates);

  // Associate the data in the currently bound buffer with the a_TexCoord attribute
  // The '2' specifies there are 2 floats per vertex in the buffer
  gl.vertexAttribPointer(textureCoordinates, 2, gl.FLOAT, false, 0, 0);

  // set border width
  const border_width = gl.getUniformLocation(shader, "border_width");
  gl.uniform1f(border_width, 0.08);

  // set border corlor
  const border_color = gl.getUniformLocation(shader, "border_color");
  gl.uniform4fv(border_color, [0.4, 0.4, 0.4, 1.0]);

  // set the value of the uniform transformation matrix in the shader and draw
  const transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, modelMatrix.elements);

  const projectionLoc = gl.getUniformLocation(shader, "projection");
  gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, numPoints);

  // draw points on the four corner vertices
  for (const index of Object.values(keys)) {
    const pindex = index * 4;
    gl.uniform4fv(border_color, colors.slice(pindex, pindex + 4));
    gl.drawArrays(gl.POINTS, index, 1);
  }

  // we can unbind the buffer now
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * Maps a point in world coordinates to viewport coordinates.<br>
 * - [-n,n] x [-n,n] → [-w,w] x [h,-h]
 * <p>Note that the Y axis points downwards.</p>
 * @param {Number} x point abscissa.
 * @param {Number} y point ordinate.
 * @param {world} w world object.
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(x, y, w = world) {
  const vtx = modelMatrix.multiplyVector4(new Vector4([x, y, 0.0, 1.0]));
  return [
    ((vtx.elements[0] + w.w / 2) * ctx.canvas.clientWidth) / w.w,
    ((-vtx.elements[1] + w.h / 2) * ctx.canvas.clientHeight) / w.h,
  ];
}

/**
 * Code to actually render our geometry.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D CanvasRenderingContext2D}
 */
function drawOnCanvas() {
  ctx.fillStyle = "rgba(0, 204, 204, 1)";
  ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  ctx.fill();

  const [x1, y1] = mapToViewport(...getVertex(cindex), world);
  const dindex = cindex == 2 ? 0 : cindex == 1 ? 5 : cindex + 2;
  const [x2, y2] = mapToViewport(...getVertex(dindex), world);

  const grd = ctx.createLinearGradient(x1, y1, x2, y2);
  grd.addColorStop(0, getColor(cindex));
  grd.addColorStop(1, getColor(dindex));

  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    const [x, y] = mapToViewport(...getVertex(i), world);
    if (i == 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // the outline
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#666666";
  ctx.stroke();

  // the fill color
  ctx.fillStyle = grd; // "#FFCC00";
  ctx.fill();

  const msize = 4;
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    ctx.fillStyle = getColor(i);
    ctx.beginPath();
    const [x, y] = mapToViewport(...getVertex(i), world);
    if (i == cindex) {
      ctx.fillRect(x - msize, y - msize, 2 * msize, 2 * msize);
    } else {
      ctx.arc(x, y, msize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

/**
 * Print matrix in column major order.
 * @param {Matrix4} matrix transformation matrix.
 */
function printMatrix(matrix) {
  const m = new Matrix4(matrix).transpose().elements;
  for (let i = 0, j = 0; i < 4; ++i, j += 4) {
    console.log(`${i}: [${m.slice(j, j + 4).toString()}]`);
  }
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
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw} does things that have to be repeated each time the canvas is
 * redrawn.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes Array.prototype.includes()}
 */
function mainEntrance() {
  // get the second canvas element
  ctx = document.querySelector("canvas:nth-child(2)").getContext("2d");

  // get the rendering context for WebGL
  gl = canvas.elem.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
    return;
  }

  /**
   * @summary Fired when a key is pressed.
   * <p>Appends an event listener for events whose type attribute value is keydown.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
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

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById("vertexShader").textContent;
  const fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  // retain a handle to the shader program, then unbind it
  // (This looks odd, but the way initShaders works is that it "binds" the shader and
  // stores the handle in an extra property of the gl object.  That's ok, but will really
  // mess things up when we have more than one shader pair.)
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

  // buffer for the texture data
  textbuffer = gl.createBuffer();
  if (!textbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, textbuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, textureCoords, gl.STATIC_DRAW);

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
 */
const runAnimation = (() => {
  // control the rotation angle
  let ang = 0.0;

  // click translation
  let tx = 0;
  let ty = 0;

  // angle increment
  const increment = 2.0;

  // these values are set when the function is loaded,
  // and do not change afterwards...
  const [wlen, hlen] = world.upperBounds;

  let requestId = 0;
  let vx, vy, px, py;
  [px, py] = getVertex(cindex);

  /**
   * Clamp number between two values.
   * @param {Number} num number.
   * @param {Number} min minimum value.
   * @param {Number} max maximum value.
   * @param {Number} tol tolerance.
   * @return {Number} tol*min ≤ num ≤ tol*max.
   * @function
   * @global
   */
  const clamp = (num, min, max, tol = 0.98) =>
    Math.min(Math.max(num, tol * min), tol * max);

  /**
   * <p>Keep drawing frames.</p>
   * Request that the browser calls {@link runAnimation} again "as soon as it can".
   * @callback loop
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
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
      px = clamp(px, -wlen, wlen);
      py = clamp(py, -hlen, hlen);
      tx = px - vx;
      ty = py - vy;
      click = false;
    }

    // collision detection - rotate (CCW) around the hit vertex
    for (const k in keys) {
      [vx, vy, vx, vy] = mapCornerToWorld(keys[k]);
      if (vx < -wlen || vx > wlen || vy < -hlen || vy > hlen) {
        cindex = keys[k];
        click = true;
        document.getElementById(k).checked = true;
        // send the vertex back into the window
        ang -= 2 * increment;
        break;
      }
    }

    rotateAboutCorner(ang, px, py, tx, ty);

    draw();
    drawOnCanvas();

    requestId = requestAnimationFrame(runAnimation);
  };
})();
