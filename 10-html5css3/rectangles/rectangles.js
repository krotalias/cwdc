/**
 * @file
 *
 * Summary.
 *
 * <p>In the same vein as shown in the Canvas primer II, we want to fill a rectangle,
 * as uniformly as possible, with a number of circles.</p>
 *
 * The idea is to lay out the circles from top to bottom and from left to right, organizing them in rows,
 * where the last row may be incomplete. <br>
 * It is perhaps best to first consider that the canvas is a square
 * rather than a rectangle, and then try to figure out how to adapt the code for a non-square rectangle.
 *
 * <p>Incidentally, a perfect solution to this problem is not straightforward!<br>
 * There's an old discussion on
 * <a href="https://stackoverflow.com/questions/12627449/pack-squares-into-a-rectangle">StackOverflow</a>
 * about it, but I found both answers not completely satisfactory.</p>
 *
 * @author Paulo Roma
 * @since 21/01/2021
 * @see <a href="/cwdc/10-html5css3/rectangles/rectangles.html?w=640&h=480">link</a>
 * @see <a href="/cwdc/10-html5css3/rectangles/rectangles.js">source</a>
 * @see {@link https://observablehq.com/@esperanc/canvas-primer-ii Canvas primer II}
 * @see <img src="../rectangles/rectangles.png" width="512">
 */

/**
 * Update the slider label.
 *
 * @param {Object<Number,Number>} {nrow,ncol} number of rows and columns.
 * @param {String} val number of circles.
 */
function updateSliderLabel({ nrow, ncol }, val) {
  document.getElementById("value").innerHTML = `${val} • ≤
                            (${nrow + 1}×${ncol + 1})`;
}

/**
 * Set the callback when the slider is moved and
 * save its value (number of circles) in a cookie "sval".
 *
 * @param {function} gCookie get the slider initial value from a cookie.
 * @param {function} sCookie save the slider value to a cookie.
 */
function setSlider(gCookie, sCookie) {
  const val = gCookie("pack_rect_slider") || "1";
  const slider = document.querySelector("#ncircles");
  slider.value = val;
  /**
   * <p>Fired when a &lt;input type="range"&gt; is in the
   * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
   * (by clicking or using the keyboard).</p>
   *
   * The callback argument sets the {@link updateSliderLabel callback} that will be invoked when
   * the event is dispatched.</p>
   *
   * The input event is fired every time the value of the element changes.
   *
   * @summary Appends an event listener for events whose type attribute value is input.
   *
   * @param {Event} event a generic event.
   * @event input
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event HTMLElement: input event}
   */
  slider.addEventListener("input", (event) => {
    const sval = slider.value;
    updateSliderLabel(drawRects(sval, canvas), sval);
    // save number of circles as a cookie
    sCookie("pack_rect_slider", sval, 365);
  });
  updateSliderLabel(drawRects(val, canvas), val);
}

/**
 * Callback invoked when the number of circles has changed (slider is moved).
 *
 * @param {String} val number of circles.
 * @param {HTMLElement} cnv canvas for drawing.
 * @return {Object<Number,Number>} number of rows and columns.
 * @see <a href="/cwdc/10-html5css3/rectangles.html?w=100&h=500">rectangles</a>
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes Drawing shapes with canvas}
 * @see {@link https://observablehq.com/d/739e346d3d918358 Circles in a rectangle solution}
 * @see {@link https://stackoverflow.com/questions/12627449/pack-squares-into-a-rectangle Pack squares into a rectangle}
 */
function drawRects(val, cnv) {
  const w = cnv.width;
  const h = cnv.height;

  const ncircles = +val;

  /**
   * Try to fit squares in columns.
   * - a square grid is √n x √n
   * - a rectangular grid is √(n*ratio) x √(n/ratio)
   *
   * @param {Number} n number of circles.
   * @param {Number} ratio aspect ratio.
   * @param {Number} height canvas height.
   * @return {Number} square side length.
   */
  function fillh(n, ratio, height) {
    let r = Math.ceil(Math.sqrt(n / ratio));
    let side = height / r;
    const width = height * ratio;
    while (width / side < Math.ceil(n / r)) {
      side = height / ++r;
    }

    return side;
  }

  // Best fit: by columns or rows.
  const squareSide = Math.max(
    fillh(ncircles, w / h, h),
    fillh(ncircles, h / w, w),
  );

  const ctx = cnv.getContext("2d");

  ctx.fillStyle = "antiquewhite";
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 10;

  // clear canvas.
  ctx.fillRect(0, 0, w, h);
  // draw canvas border.
  ctx.strokeRect(0, 0, w, h);

  ctx.strokeStyle = "gray";
  ctx.fillStyle = "black";
  ctx.lineWidth = 1;

  const circleRadius = squareSide / 4;
  const d = squareSide / 2;
  let row = 0,
    col = 0,
    tcol = 0,
    trow = 0,
    dist = squareSide;

  // draw a square with a circle in it at each grid position.
  for (let i = 0; i < ncircles; i++) {
    const x = squareSide * col;
    const y = squareSide * row;

    ctx.beginPath();
    ctx.arc(x + d, y + d, circleRadius, 0, Math.PI * 2);
    // fill() closes any open shapes.
    ctx.fill();

    ctx.strokeRect(x, y, squareSide, squareSide);

    dist += squareSide;

    if (w > h) {
      // draw by rows
      trow = row;
      if (dist > w + 1) {
        ++row;
        tcol = col;
        col = 0;
        dist = squareSide;
      } else {
        ++col;
      }
    } else {
      // draw by columns
      tcol = col;
      if (dist > h + 1) {
        ++col;
        trow = row;
        row = 0;
        dist = squareSide;
      } else {
        ++row;
      }
    }
  }
  return { nrow: trow, ncol: tcol };
}
