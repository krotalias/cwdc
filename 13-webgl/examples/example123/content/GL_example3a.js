/**
 * @file
 *
 * Summary.
 *
 * <p>This version just uses the {@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API Canvas API}
 * from {@link https://www.html5canvastutorials.com HTML5}.</p>
 *
 * <p>Vertices are scaled by an amount that varies by
 * frame, and this value is passed to the draw function.</p>
 *
 * @author Paulo Roma
 * @since 17/08/2022
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/example123/content/GL_example3a.js">source</a>
 */

"use strict";

/**
 * Raw data for some point positions -
 * this will be a square, consisting of two triangles.
 * <p>We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).</p>
 * @type {Float32Array}
 */
var vertices = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/**
 * Number of points (vertices).
 * @type {Number}
 */
var numPoints = vertices.length / 2;

/**
 * Canvas dimensions.
 * @type {Object<{w: Number, h:Number}>}
 */
var canvas = {
  w: 256,
  h: 256,
};

/**
 * Maps a point in world coordinates to viewport coordinates.<br>
 * - [-n,n] x [-n,n] → [-w,w] x [h,-h]
 * <p>Note that the Y axix points downwards.</p>
 * @param {Number} x point abscissa.
 * @param {Number} y point ordinate.
 * @param {Number} n window size.
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(x, y, n = 5) {
  return [((x + n / 2) * canvas.w) / n, ((-y + n / 2) * canvas.h) / n];
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
 * Code to actually render our geometry.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} scale scale factor.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function draw(ctx, scale) {
  ctx.fillStyle = "rgba(0, 204, 204, 1)";
  ctx.rect(0, 0, canvas.w, canvas.h);
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    let [x, y] = mapToViewport(...getVertex(i).map((x) => x * scale));
    if (i == 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // the fill color
  ctx.fillStyle = "red";
  ctx.fill();
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
  // retrieve <canvas> element
  var canvasElement = document.querySelector("#theCanvas");
  var ctx = canvasElement.getContext("2d");

  canvas.w = canvasElement.width;
  canvas.h = canvasElement.height;

  /**
   * A closure to set up an animation loop in which the
   * scale grows by "increment" each frame.
   * @return {loop} animation loop.
   * @global
   * @function
   */
  var runanimation = (() => {
    var scale = 1.0;
    var increment = 0.05;

    /**
     * <p>Keep drawing frames.</p>
     * Request that the browser calls {@link runanimation} again "as soon as it can".
     * @callback loop
     * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     */
    return () => {
      draw(ctx, scale);
      scale += increment;
      if (scale >= 1.5 || scale <= 0.5) increment = -increment;

      requestAnimationFrame(runanimation);
    };
  })();

  // draw!
  runanimation();
}
