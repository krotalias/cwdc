/**
 * @file
 *
 * Summary.
 * <p>Similar to <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.js">GL_example3</a>.</p>
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
 * See the {@link runAnimation animation loop} for various kinds of rotations.
 *
 * <p>Uses the type {@link Matrix4} from the teal book utilities
 * in <a href="/cwdc/13-webgl/lib/teal_book/cuon-matrix.js">cuon-matrix.js</a>.</p>
 *
 * <p>Usage example for Matrix4:</p>
 * <pre>
 *   var m = new Matrix4();                           // identity matrix
 *   m.setTranslate(0.3, 0.0, 0.0);                   // make it into a translation matrix
 *   var m2 = new Matrix4().setRotate(90, 0, 0, 1);   // create and make rotation in one step
 *                                                    // (rotate 90 degrees in x-y plane)
 *   m.multiply(m2);                                  // multiply m on right by m2, i.e., m = m * m2;
 *   var theRealData = m.elements;                    // get the underlying Float32Array
 *                                                       (this part is sent to shader)
 *
 *   Alternatively, can chain up the operations:
 *
 *   var m = new Matrix4().setTranslate(0.3, 0.0, 0.0).rotate(90, 0, 0, 1);
 * </pre>
 * @author Paulo Roma
 * @since 27/09/2016
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
var vertices = new Float32Array([
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
var keys = {
  r: 0,
  g: 1,
  b: 2,
  w: 5,
};

/**
 * Number of points (vertices).
 * @type {Number}
 */
var numPoints = vertices.length / 2;

/**
 * Index of current corner relative to vertices.
 * @type {Number}
 */
var cindex = 0;

/**
 * Window size.
 * @type {Number}
 */
var wsize = 5;

/**
 * Whether a key has been clicked.
 * @type {Boolean}
 */
var click = false;

/**
 * A color value for each vertex.
 * @type {Float32Array}
 */
// prettier-ignore
var colors = new Float32Array([
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
var modelMatrix = new Matrix4();

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
  var ch = getChar(event);

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
var createEvent = (key) => {
  let code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

if (document.querySelector('input[name="corner"]')) {
  document.querySelectorAll('input[name="corner"]').forEach((elem) => {
    elem.addEventListener("change", function (event) {
      var item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

window.addEventListener("load", (event) => mainEntrance());

/**
 * Given a color index return the corresponding {@link colors RGB} color,
 * where each component is in the range [0,255].
 * @param {Number} i color index.
 * @returns {String} a RGB color.
 * @see <a href="../number-conversions.png">number conversions</a>
 * @see https://stackoverflow.com/questions/1133770/how-to-convert-a-string-to-an-integer-in-javascript
 * @see https://stackoverflow.com/questions/5971645/what-is-the-double-tilde-operator-in-javascript
 * @see https://www.geeksforgeeks.org/what-is-double-tilde-operator-in-javascript/
 */
function getColor(i) {
  let j = (i % numPoints) * 4;
  let c = colors.slice(j, j + 3).map((x) => ~~(x * 255));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/**
 * Returns the coordinates of the {@link vertices vertex} at index i.
 * @param {Number} i vertex index.
 * @returns {Array<Number>} vertex coordinates.
 */
function getVertex(i) {
  let j = (i % numPoints) * 2;
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
  modelMatrix.translate(-x, -y, 0.0);
  modelMatrix.translate(tx, ty, 0.0);
}

/**
 * Maps a point in world coordinates to viewport coordinates.<br>
 * - [-n,n] x [-n,n] → [-w,w] x [h,-h]
 * <p>Note that the Y axis points downwards.</p>
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} x point abscissa.
 * @param {Number} y point ordinate.
 * @param {Number} n window size.
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(ctx, x, y, n = wsize) {
  let vtx = new Vector4([x, y, 0.0, 1.0]);
  vtx = modelMatrix.multiplyVector4(vtx);
  return [
    ((vtx.elements[0] + n / 2) * ctx.canvas.clientWidth) / n,
    ((-vtx.elements[1] + n / 2) * ctx.canvas.clientHeight) / n,
  ];
}

/**
 * Code to actually render our geometry.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function drawOnCanvas(ctx) {
  ctx.fillStyle = "rgba(0, 204, 204, 1)";
  ctx.rect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  ctx.fill();

  let [x1, y1] = mapToViewport(ctx, ...getVertex(cindex));
  let dindex = cindex == 2 ? 0 : cindex == 1 ? 5 : cindex + 2;
  let [x2, y2] = mapToViewport(ctx, ...getVertex(dindex));

  var grd = ctx.createLinearGradient(x1, y1, x2, y2);
  grd.addColorStop(0, getColor(cindex));
  grd.addColorStop(1, getColor(dindex));

  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    let [x, y] = mapToViewport(ctx, ...getVertex(i));
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

  let msize = 4;
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    ctx.fillStyle = getColor(i);
    ctx.beginPath();
    let [x, y] = mapToViewport(ctx, ...getVertex(i));
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
  var m = new Matrix4(matrix).transpose().elements;
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
  var ctx = document.querySelector("#theCanvas").getContext("2d");

  // key handler
  window.onkeydown = handleKeyPress;

  /**
   * A closure to set up an animation loop in which the
   * angle grows by "increment" each frame.
   * @return {loop} animation loop.
   * @global
   * @function
   */
  var runAnimation = (() => {
    // control the rotation angle
    var ang = 0.0;

    // click translation
    var tx = 0;
    var ty = 0;

    // angle increment
    var increment = 2.0;

    // current corner for rotation
    var corner = new Vector4([0, 0, 0, 1]);

    // this value is set when the function is loaded,
    // and do not change afterwards...
    let wlen = wsize / 2;

    var vx, vy, px, py;
    [px, py] = getVertex(cindex);

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
