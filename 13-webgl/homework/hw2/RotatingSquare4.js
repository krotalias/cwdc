/**
 * @file
 *
 * Summary.
 * <p>Similar to <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.js">GL_example3a</a>.</p>
 *
 * Initially, the square should rotate counterclockwise about its lower left corner, colored red,
 * at a rate of two degrees per frame.</p>
 * <p>When a key is pressed, the square should, starting in its current position,
 * begin rotating about a different corner, depending on the key pressed:</p>
 * <ul>
 *  <li>'g' for the green corner, </li>
 *  <li>'b' for the blue corner, </li>
 *  <li>'w' for the white corner, or </li>
 *  <li>'r' for the red corner.</li>
 * </ul>
 *
 * See the {@link runAnimation animation loop} for various kinds of rotations.
 * The square wraps around the window borders when it rotates about a vertex outiside
 * the window.
 *
 * <p>Uses the type {@link DOMMatrix} from {@link https://en.wikipedia.org/wiki/HTML5 HTML5}.</p>
 * @author Paulo Roma
 * @since 23/08/2022
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2022 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare4.html">canvas+DOMMatrix</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/showCode.php?f=RotatingSquare4">html</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/doc-square4/index.html">doc</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare.html">canvas+cuon-matrix</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/showCode.php?f=RotatingSquare">html</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/doc-square/index.html">doc</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare2.html">WebGL</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/showCode.php?f=RotatingSquare2">html</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/doc-square2/index.html">doc</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare3.html">WebGL+canvas</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/showCode.php?f=RotatingSquare3">html</a> -
 * <a href="/cwdc/13-webgl/homework/hw2/doc-square3/index.html">doc</a>
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.html">GL_example3a</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/hw2b.pdf">hw2b PDF</a>
 * @see <a href="/cwdc/13-webgl/homework/hw2/RotatingSquare4.js">source</a>
 * @see <a href="../videos/RotatingSquare.mp4">video</a>
 * @see <img src="/cwdc/13-webgl/homework/hw2/Rect.png" width="512">
 */

"use strict";

/**
 * <p>DOMMatrix Class.</p>
 * The {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix DOMMatrix}
 * interface represents 4×4 matrices,
 * suitable for 2D and 3D operations including rotation and translation.
 * It is a mutable version of the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrixReadOnly DOMMatrixReadOnly} interface.
 * @typedef {Class} DOMMatrix
 * @see {@link https://www.javascripture.com/DOMMatrix DOMMatrix}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix/DOMMatrix DOMMatrix() constructor}
 */

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
 * <p>Model transformation matrix.</p>
 *
 * Values must have either 6 or 16 elements in it.<br>
 * If 6 elements are specified (a, b, ..., f), <br>
 * the matrix will be a 2D matrix constructed like:
 * <pre>
 *  a	c	e
 *  b	d	f
 *  0	0	1
 * </pre>
 * @type {DOMMatrix}
 */
let modelMatrix = new DOMMatrix();

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
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String | null}
 * @see https://javascript.info/tutorial/keyboard-events
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
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
      printMatrix(modelMatrix);
      break;
    case "M":
      printMatrix(modelMatrix, true);
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
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
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
 * Loads the {@link mainEntrance application}.</p>
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load - fired when the whole page has loaded.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", (event) => mainEntrance());

/**
 * Given a color index return the corresponding {@link colors RGB} color,
 * where each component is in the range [0,255].
 * @param {Number} i color index.
 * @returns {String} a RGB color.
 * @see <a href="../number-conversions.png">number conversions</a>
 * @see {@link https://medium.com/@nikjohn/cast-to-number-in-javascript-using-the-unary-operator-f4ca67c792ce Cast to Number in Javascript using the Unary (+) Operator}
 * @see {@link https://stackoverflow.com/questions/5971645/what-is-the-double-tilde-operator-in-javascript What is the "double tilde" (~~) operator in JavaScript?}
 * @see {@link https://www.geeksforgeeks.org/what-is-double-tilde-operator-in-javascript/ What is (~~) “double tilde” operator in JavaScript?}
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
 * about point (x,y).
 * @param {Number} ang rotation angle.
 * @param {Number} x transformed x coordinate of the pivot vertex.
 * @param {Number} y transformed y coordinate of the pivot vertex.
 * @param {Number} tx translation from the transformed pivot vertex to its original position, in the x axis.
 * @param {Number} ty translation from the transformed pivot vertex to its original position, in the y axis.
 */
function updateModelMatrix(ang, x, y, tx, ty) {
  modelMatrix = new DOMMatrix([1, 0, 0, 1, x, y]);
  modelMatrix.rotateSelf(-ang);
  modelMatrix.translateSelf(-x, -y);
  modelMatrix.translateSelf(tx, ty);
}

/**
 * Sets ctx transformation to rotate by an angle ang,
 * about point (x,y) and maps to viewport.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} ang rotation angle.
 * @param {Number} x transformed x coordinate of the pivot vertex.
 * @param {Number} y transformed y coordinate of the pivot vertex.
 * @param {Number} tx translation from the transformed pivot vertex to its original position, in the x axis.
 * @param {Number} ty translation from the transformed pivot vertex to its original position, in the y axis.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
 */
function rotateAboutCorner(ctx, ang, x, y, tx, ty) {
  const [w, h] = [ctx.canvas.clientWidth, ctx.canvas.clientHeight];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(w / 2, h / 2);
  ctx.scale(w / wsize, h / wsize);
  ctx.translate(x, y);
  // the rotation angle, clockwise in radians.
  ctx.rotate((-Math.PI * ang) / 180);
  ctx.translate(-x, -y);
  // unless clicked this is (0,0)
  ctx.translate(tx, ty);
}

/**
 * Code to actually render our geometry.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function drawOnCanvas(ctx) {
  ctx.fillStyle = "rgba(0, 204, 204, 1)";
  ctx.rect(-wsize, -wsize, 2 * wsize, 2 * wsize);
  ctx.fill();

  const [x1, y1] = getVertex(cindex);
  const dindex = cindex == 2 ? 0 : cindex == 1 ? 5 : cindex + 2;
  const [x2, y2] = getVertex(dindex);

  const grd = ctx.createLinearGradient(x1, y1, x2, y2);
  grd.addColorStop(0, getColor(cindex));
  grd.addColorStop(1, getColor(dindex));

  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    const [x, y] = getVertex(i);
    if (i == 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // every size is in respect to the window size.
  const msize = wsize * 0.01;

  // the outline
  ctx.lineWidth = 4 * msize;
  ctx.strokeStyle = "#666666";
  ctx.stroke();

  // the fill color
  ctx.fillStyle = grd; // "#FFCC00";
  ctx.fill();

  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    ctx.fillStyle = getColor(i);
    ctx.beginPath();
    const [x, y] = getVertex(i);
    if (i == cindex) {
      ctx.fillRect(x - msize, y - msize, 2 * msize, 2 * msize);
    } else {
      ctx.arc(x, y, msize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

/**
 * Print matrix.
 * @param {DOMMatrix} matrix transformation matrix.
 * @param {Boolean} full if true, prints the 4x4 matrix.
 * Otherwise, prints the 2x3 matrix. </br>
 * If omitted, use its current dimension.
 */
function printMatrix(matrix, full = !matrix.is2D) {
  const [ini, row, col] = full ? [6, 4, 4] : [0, 2, 3];
  const m = matrix.toJSON();
  for (let i = 0, j = ini; i < row; ++i, j += col) {
    console.log(`${i}: [${Object.values(m).slice(j, j + col)}]`);
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
   * <p>Appends an event listener for events whose type attribute value is keydown.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event keydown - fired when a key is pressed.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event}
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
    let p = new DOMPoint(...getVertex(cindex));

    // this value is set when the function is loaded,
    // and do not change afterwards...
    const wlen = wsize / 2;

    /**
     * <p>Keep drawing frames.</p>
     * Request that the browser calls {@link runAnimation} again "as soon as it can".
     * @callback loop
     * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     */
    return () => {
      ang += increment;
      ang = ang % 360;
      if (click) {
        const [vx, vy] = getVertex(cindex);

        p = new DOMPoint(vx, vy);
        p = modelMatrix.transformPoint(p);

        // wrap-around
        if (p.x > wlen) p.x += -wsize;
        else if (p.x < -wlen) p.x += wsize;
        if (p.y > wlen) p.y += -wsize;
        else if (p.y < -wlen) p.y += wsize;

        tx = p.x - vx;
        ty = p.y - vy;

        click = false;
      }

      updateModelMatrix(ang, p.x, p.y, tx, ty);
      rotateAboutCorner(ctx, ang, p.x, p.y, tx, ty);

      drawOnCanvas(ctx);

      requestAnimationFrame(runAnimation);
    };
  })();

  // draw!
  runAnimation();
}
