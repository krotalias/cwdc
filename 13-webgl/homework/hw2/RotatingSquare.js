/**
 * @file
 *
 * Summary.
 * <p>Understanding {@link https://users.math.msu.edu/users/hhu/848/lec_2.pdf fixed points} in linear transformations,
 * and it is similar to <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.js">GL_example3</a>.</p>
 *
 * <p>Initially, the square should rotate counterclockwise about its lower left corner, colored red,
 * at a rate of two degrees per frame.<p>
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
 *  <li>The square wraps around the window borders when it rotates about a vertex outiside the window.</li>
 *  <li>Uses the class {@link Matrix4} from the
 *  {@link https://www.rose-hulman.edu/class/csse/csse351/reference/0321902920_WebGL.pdf teal book}
 *  utilities to perform {@link https://www.cuemath.com/algebra/matrix-operations/ matrix operations}.</li>
 * </ul>
 *
 * <iframe title="canvas+cuon-matrix" style="position: relative; top: 20px; margin-bottom: -60px; width: 450px; height: 480px; transform-origin: 0px 20px; transform: scale(0.8);" src="/cwdc/13-webgl/homework/hw2/RotatingSquare.html"></iframe>
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
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2016-2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare.js">source</a>
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.html">GL_example3a</a>
 * @see <a href="../videos/RotatingSquare.mp4">video</a>
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
 * Window size.
 * @type {Number}
 */
const wsize = 5;

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
 * Model transformation matrix.
 * @type {Matrix4}
 */
const modelMatrix = new Matrix4();

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
 * Handler for keydown events that will update {@link modelMatrix}
 * based on key pressed.
 * @param {KeyboardEvent} event keyboard event.
 */
function handleKeyPress(event) {
  let ch = getChar(event);

  switch (ch) {
    case "m":
    case "M":
      printMatrix(modelMatrix);
      break;
    default:
      ch = ch.toLowerCase();
      if (ch in keys) {
        cindex = keys[ch];
        click = true;
        document.getElementById(ch).checked = true;
      }
      break;
  }
}

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
 * @summary Executed when the corner input radio is checked (but not when unchecked).
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the {@link handleKeyPress callback} that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeCorner
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
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
 * @see {@link https://stackoverflow.com/questions/1133770/how-to-convert-a-string-to-an-integer-in-javascript How to convert a string to an integer in JavaScript?}
 * @see {@link https://stackoverflow.com/questions/5971645/what-is-the-double-tilde-operator-in-javascript What is the "double tilde" (~~) operator in JavaScript?}
 * @see {@link https://www.geeksforgeeks.org/what-is-double-tilde-operator-in-javascript/ What is the "double tilde" (~~) operator in JavaScript ?}
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
 * @param {Number} tx translation from the transformed pivot vertex to its original position, in the x-axis.
 * @param {Number} ty translation from the transformed pivot vertex to its original position, in the y-axis.
 */
function rotateAboutCorner(ang, x, y, tx, ty) {
  modelMatrix.setTranslate(x, y, 0.0);
  modelMatrix.rotate(ang, 0.0, 0.0, 1.0);
  modelMatrix.translate(-x, -y, 0.0);
  modelMatrix.translate(tx, ty, 0.0);
}

/**
 * Maps a point in world coordinates to viewport coordinates:
 * <ul>
 *  <li>[-n,n] x [-n,n] → [-w,w] x [h,-h]</li>
 * </ul>
 * <p>Note that the y-axis points downwards.</p>
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} x point abscissa.
 * @param {Number} y point ordinate.
 * @param {Number} n window size.
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(ctx, x, y, n = wsize) {
  const vtx = modelMatrix.multiplyVector4(new Vector4([x, y, 0.0, 1.0]));
  return [
    ((vtx.elements[0] + n / 2) * ctx.canvas.clientWidth) / n,
    ((-vtx.elements[1] + n / 2) * ctx.canvas.clientHeight) / n,
  ];
}

/**
 * Code to actually render our geometry.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D CanvasRenderingContext2D}
 */
function drawOnCanvas(ctx) {
  ctx.fillStyle = "rgba(0, 204, 204, 1)";
  ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  ctx.fill();

  const [x1, y1] = mapToViewport(ctx, ...getVertex(cindex));
  const dindex = cindex == 2 ? 0 : cindex == 1 ? 5 : cindex + 2;
  const [x2, y2] = mapToViewport(ctx, ...getVertex(dindex));

  const grd = ctx.createLinearGradient(x1, y1, x2, y2);
  grd.addColorStop(0, getColor(cindex));
  grd.addColorStop(1, getColor(dindex));

  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    const [x, y] = mapToViewport(ctx, ...getVertex(i));
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
    const [x, y] = mapToViewport(ctx, ...getVertex(i));
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
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link drawOnCanvas} does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
  const ctx = document.querySelector("#theCanvas").getContext("2d");

  /**
   * @summary Fired when a key is pressed.
   * <p>Appends an event listener for events whose type attribute value is keydown.<br>
   * The callback argument sets the {@link handleKeyPress callback} that will be invoked when
   * the event is dispatched.</p>
   *
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.onkeydown = handleKeyPress;

  /**
   * A closure to set up an animation loop in which the
   * angle grows by "increment" each frame.
   * @return {loop} animation loop.
   * @global
   * @function
   */
  const runAnimation = (() => {
    // control the rotation angle
    let ang = 0.0;

    // click translation
    let tx = 0;
    let ty = 0;

    // angle increment
    const increment = 2.0;

    // current corner for rotation
    const corner = new Vector4([0, 0, 0, 1]);

    // this value is set when the function is loaded,
    // and do not change afterwards...
    const wlen = wsize / 2;

    let vx, vy, px, py;
    [px, py] = getVertex(cindex);

    /**
     * <p>Keep drawing frames.</p>
     * Request that the browser calls {@link runAnimation} again "as soon as it can".
     * @callback loop
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
     */
    return () => {
      ang += increment;
      ang = ang % 360;
      if (click) {
        [vx, vy] = getVertex(cindex);
        corner.elements[0] = vx;
        corner.elements[1] = vy;
        [px, py] = modelMatrix.multiplyVector4(corner).elements;

        // wrap-around
        if (px > wlen) px += -wsize;
        else if (px < -wlen) px += wsize;
        if (py > wlen) py += -wsize;
        else if (py < -wlen) py += wsize;

        tx = px - vx;
        ty = py - vy;
        click = false;
      }
      rotateAboutCorner(ang, px, py, tx, ty);

      drawOnCanvas(ctx);

      requestAnimationFrame(runAnimation);
    };
  })();

  // draw!
  runAnimation();
}
