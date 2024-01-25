/**
 * @file
 *
 * Summary.
 *
 * <p>In the same vein as shown in the <a href="/cwdc/10-html5css3/rectangles.html?w=640&h=480">
 * Fill Rectangle</a>, we want to rotate and scale a set of squares,
 * about one of its vertices. However, here we used SVG instead of a Canvas.</p>
 *
 * The idea is to parametrize the rotation (about a horizontal line), and the size of the squares, by a number, called ratio ∈ [0,1].
 * The corresponding angle ∈ [0,90°] and scale factor ∈ [1,√2].
 * <p>
 * To each square it is applied a rotation followed by a scale (and a translation to change the fixed point and center it on the screen).
 * The size increases until ratio reaches 0.5. Then it decreases back to its original value, when ratio is 1.0.</p>
 *
 * <p>Note that the easiest approach is <a href="../squares/svg.png">nesting</a> the transformations,
 * which are always the same:</p>
 * <ul>
 * <li>a rotation, followed by a scale, followed by a translation,</li>
 * <pre>
 *  &lt;g transform="translate(80,0) scale(1.3588230201170424) rotate(42.61405596961119)"&gt;
 *     &lt;rect fill="yellow" x="0" y="0" width="80" height="80" opacity="0.7"&gt;
 *     &lt;/rect&gt;
 * </pre>
 * <li>and of course, an initial translation for taking the graphics to the center of the window.</li>
 * <pre>
 *  &lt;g transform="translate(400, 300)"&gt;
 * </pre>
 * </ul>
 *
 * The transformations are post-multiplied to the current transformation matrix, and therefore, are applied backwards,
 * that is, the translation to the center of the window is the last transformation applied.
 *
 * <p>Be sure you fully understand the order of the transformations, and that initially vertex 0 is at the origin (the only case there is no translation).</p>
 *
 * @author Paulo Roma
 * @since 19/04/2022
 *
 * @see <a href="/cwdc/10-html5css3/squares/squares.html?w=800&h=600">link</a>
 * @see <a href="/cwdc/10-html5css3/squares/squares.js">source</a>
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
 * @see https://observablehq.com/d/8c801de807b9d484
 * @see https://www.sitepoint.com/canvas-vs-svg/
 * @see https://d3js.org
 */
"use strict";

/**
 * Update the slider label.
 *
 * @param {HTMLElement} slider a slider.
 */
function updateSliderLabel(slider) {
  let label = slider.labels[0];
  let lblstr = label.htmlFor;
  let lblvalue = slider.value;
  let extra = "";

  if (lblstr == "ratio") {
    extra = `(${rad2deg(toAngle(lblvalue))
      .toFixed(1)
      .padStart(4, "0")}° ⟺ ${toLength(lblvalue).toFixed(2)})`;
    lblvalue = (+lblvalue).toFixed(2);
  } else {
    lblvalue = lblvalue.padStart(2, "0");
    extra = "&#9634;";
  }

  label.innerHTML = `${lblstr} = ${lblvalue} ${extra}`;
}

/**
 * Convert degrees to radians.
 *
 * @function
 * @global
 * @param {Number} deg an angle in degrees.
 * @return {Number} an angle in radians.
 */
const deg2rad = (deg) => deg * (Math.PI / 180.0);

/**
 * Convert radians to degrees.
 *
 * @function
 * @global
 * @param {Number} rad an angle in radians.
 * @return {Number} an angle in degrees.
 */
const rad2deg = (rad) => rad * (180.0 / Math.PI);

/**
 * Maps a ratio to an angle.
 *
 * @function
 * @global
 * @param {Number} ratio given ratio.
 * @returns {Number} angle in degrees.
 *
 */
const toAngle = (ratio) =>
  ratio > 0.5
    ? Math.PI / 2 - Math.atan2((1 - ratio) * 2, 1)
    : Math.atan2(ratio * 2, 1);

/**
 * Maps a ratio to a scale factor.
 *
 * @function
 * @global
 * @param {Number} ratio given ratio.
 * @returns {Number} square scale factor.
 *
 */
const toLength = (ratio) =>
  ratio > 0.5 ? Math.hypot((1 - ratio) * 2, 1) : Math.hypot(ratio * 2, 1);

/**
 * Set the callback when the slider is moved.
 *
 * @param {function} gCookie get the slider initial value from a cookie.
 * @param {function} sCookie save the slider value to a cookie.
 * @param {String} selector a string containing a valid CSS selector for the svg element.
 */
function setSlider(gCookie, sCookie, selector = "body") {
  let cookies = gCookie("squares_cookies") || JSON.stringify(["0", "4", "0"]);
  let [val, val2, val3] = JSON.parse(cookies);
  let slider = document.querySelector("#ratio");
  let slider2 = document.querySelector("#nsqr");
  let variation = document.querySelectorAll('input[name="variation"]');

  // read the SVG viewport from the url.
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const w = urlParams.get("w") || "800";
  const h = urlParams.get("h") || "600";

  let r = document.querySelector(":root");
  r.style.setProperty("--wsvg", `${w}px`);

  const svg = d3
    .select(selector)
    .append("svg")
    .lower()
    .attr("style", "border: 3px solid gray")
    .attr("width", w)
    .attr("height", h);

  slider.value = val;
  slider2.value = val2;
  variation[val3].checked = true;
  var vari = val3;

  // Callback for each radio button.
  variation.forEach((elem) => {
    elem.addEventListener("click", function (event) {
      vari = event.target.value;
      let p = [slider.value, slider2.value, vari];
      drawSqrs(svg, ...p);
      // save ratio, number of squares and variation as a cookie
      sCookie("squares_cookies", JSON.stringify(p), 365);
    });
  });

  // Callback for the ratio slider.
  slider.addEventListener("input", () => {
    let p = [slider.value, slider2.value, vari];
    updateSliderLabel(slider);
    drawSqrs(svg, ...p);
    // save ratio, number of squares and variation as a cookie
    sCookie("squares_cookies", JSON.stringify(p), 365);
  });

  // Callback for the nsqr slider.
  slider2.addEventListener("input", () => {
    let p = [slider.value, slider2.value, vari];
    updateSliderLabel(slider2);
    drawSqrs(svg, ...p);
    // save ratio, number of squares and variation as a cookie
    sCookie("squares_cookies", JSON.stringify(p), 365);
  });

  updateSliderLabel(slider);
  updateSliderLabel(slider2);
  drawSqrs(svg, val, val2, vari);
}

/**
 * Draw n squares with the same ratio.
 *
 * @param {SVGElement} svg SVG graphics element.
 * @param {Number} ratio defines the rotation angle among the squares,
 *                 and their side scale factor (triangle hypotenuse length).
 * @param {Number} n number of squares.
 * @param {Number} variation fixed point.
 */
function drawSqrs(svg, ratio, n, variation) {
  const [width, height] = [svg.attr("width"), svg.attr("height")];
  let ang = toAngle(ratio);
  let len = toLength(ratio);

  let p = [width / 2, height / 2];
  let side = width / 10;
  let trans;
  switch (+variation) {
    case 0:
      trans = "";
      break;
    case 1:
      trans = `translate(${side},0)`;
      break;
    case 2:
      trans = `translate(${side},${side})`;
      break;
    case 3:
      trans = `translate(0,${side})`;
      break;
  }

  const colors = ["red", "yellow", "blue", "green", "magenta"];

  // delete the previous svg nodes - clean the screen.
  svg.selectAll("g").remove();

  // translate to the center of the viewport.
  let g = svg.append("g").attr("transform", `translate(${p[0]}, ${p[1]})`);

  for (let i = 0; i < n; i++) {
    g.append("rect")
      .attr("fill", colors[i % colors.length])
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", side)
      .attr("height", side)
      .attr("opacity", 0.7);
    g = g
      .append("g")
      .attr("transform", `${trans} scale(${len}) rotate(${rad2deg(ang)})`);
  }
}
