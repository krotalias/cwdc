/**
 * @file
 *
 * Summary.
 * <p>Packing circles is a method for filling a rectangle with
 *  non-intersecting circles of different sizes. </p>
 *
 *  Description.
 *  <p>A simple method consists in generating random points into the
 *  rectangle and computing the distance d to the closest circle.</p>
 * <ul>
 *  <li> The distance between two points (x<sub>1</sub>, y<sub>1</sub>) and (x<sub>2</sub>, y<sub>2</sub>) is:<br>
 *    d = &radic;{(x<sub>1</sub>-x<sub>2</sub>)<sup>2</sup> + (y<sub>1</sub>-y<sub>2</sub>)<sup>2</sup>}. </li>
 *  <li> If the point is inside any circle created before, it is ignored. <br>
 *  <li> Otherwise, it is created a circle at that position with a radius smaller than d.
 * </ul>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-pack pack_circles.js
 *  </pre>
 *
 *  @author Paulo Roma Cavalcanti
 *  @since 22/12/2020
 *  @see <a href="/cwdc/3-javascript/pack_circles.html">link</a>
 *  @see <a href="/cwdc/3-javascript/pack_circles.js">source</a>
 *  @see <img src="../pack_circles.png" width="512">
 */

"use strict";

/**
 * A 2D point.
 * @typedef {Object} point
 * @property {number} x - coordinate.
 * @property {number} y - coordinate.
 */

/**
 * A 2D circle.
 * @typedef {Object} circle
 * @property {point} c - center.
 * @property {number} r - radius.
 */

/** Document body style.
 *  @type {HTMLElement}
 */
var style = getComputedStyle(document.body);
/** Canvas width.
 *  @type {number}
 */
var wsize = parseInt(style.getPropertyValue("--wsize").replace("px", ""));
/** Canvas height.
 *  @type {number}
 */
var hsize = parseInt(style.getPropertyValue("--hsize").replace("px", ""));

/** Canvas color.
 *  @type {number}
 */
var color = style.getPropertyValue("--color");

/** Canvas shadow color.
 *  @type {number}
 */
var swcolor = style.getPropertyValue("--swcolor");

/** List of circles given as arrays [x,y,r].
 *  @type {circle[]}
 */
var circles = [];

/** Timer for calling a function, to execute a task,
 *  after a certain time interval.
 *
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 *  @see https://flaviocopes.com/requestanimationframe/
 */
class Timer {
  /** Constructor.
   *  @param {function} callback for running a task.
   *  @param {number} delay in ms.
   */
  constructor(callback, delay = 0) {
    this.callback = callback;
    this.delay = Math.max(delay, 1000 / 60); // 16.67 ms per frame
    this.task = null;
    // With an arrow function this represents the owner of the function.
    // Note this Timer object is not constructed yet.
    this.timeoutFunc = () => {
      this.task = window.requestAnimationFrame(this.timeoutFunc);
      this.callback();
    };
    this.useAnimationFrame = true;
  }

  /** Run the task every delay ms. */
  run() {
    this.task = this.useAnimationFrame
      ? window.requestAnimationFrame(this.timeoutFunc)
      : setInterval(this.callback, this.delay);
  }

  /** Stop the task. */
  stop() {
    if (this.task) {
      if (this.useAnimationFrame) {
        window.cancelAnimationFrame(this.task);
      } else {
        clearInterval(this.task);
      }
      this.task = null;
    }
  }

  /** Restart the task. */
  restart() {
    this.stop();
    this.run();
  }
}

/** Timer for keep packing (drawing) circles. */
var poll = new Timer(draw);

/** An arrow function, with a more flexible syntax, to create a lambda function.
 *
 *  @param {number} id circle number.
 *  @return {string} DOM #id of the circle.
 */
var getId = (id) => "c_" + parseInt(id);

/** Return an array (x,y) representing a random point,
 *  such as 0 <= x <= xmax and 0 <= y <= ymax.
 *
 *  @param {number} xmax x coordinate range: [0, xmax].
 *  @param {number} ymax y coordinate range: [0, ymax].
 *  @return {point} random point.
 */
function randomPoint(xmax, ymax) {
  return [Math.random() * xmax, Math.random() * ymax];
}

/** Return a random radius in the range [rmin, rmax],
 *  so a circle centered at (x,y) is contained into the
 *  rectangle given by 0 <= x <= xmax and 0 <= y <= ymax.
 *
 *  @param {point} (x,y) circle center.
 *  @param {number} xmax x coordinate range: [0, xmax].
 *  @param {number} ymax y coordinate range: [0, ymax].
 *  @param {number} rmin minimum radius.
 *  @param {number} rmax maximum radius.
 *  @return {number} a random radius.
 */
function randomRadius(x, y, xmax, ymax, rmin, rmax) {
  let r = rmax * Math.random();
  return Math.max(Math.min(r, x, y, xmax - x, ymax - y), rmin);
}

/** Interleaves two arrays of the same size.
 *
 *  @param {point} a first array.
 *  @param {circle} b second array.
 *  @return {Array<Array<number>>} an array of arrays: [ [a0,b0], [a1,b1], [a2,b2], ... ].
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
 */
const zip = (a, b) => a.map((k, i) => [k, b[i]]);

/** Return the distance between a point p given as a tuple
 *   (x,y), and the closest circle among all circles kept in
 *   the list l. Each circle in l is represented as a tuple
 *   (x,y,r), where x,y are the coordinates of its center
 *   and r is the radius.
 *
 *   If p is inside a circle of radius r, this function
 *   returns the circle, if inTest is true, or 0 otherwise.
 *
 *   If l is empty, it returns a big number.
 *
 *   @param {point} p a given point in the canvas.
 *   @param {circle[]} l circle list.
 *   @param {boolean} inTest whether to search for the circle containing point p,
 *          or returning the distance from p to the closest circle.
 *   @return {number | circle} distance to closest circle.
 *
 *   @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 *   @see https://medium.com/poka-techblog/simplify-your-javascript-use-map-reduce-and-filter-bd02c593cc2d
 *   @see https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
 *   @see https://medium.com/front-end-weekly/3-things-you-didnt-know-about-the-foreach-loop-in-js-ff02cec465b1
 */
function distance2Circles(p, l, inTest = false) {
  let dist = 5 * wsize;

  // is l empty?
  if (!l) return dist;

  for (var i = 0; i < l.length; i++) {
    let c = l[i];
    if (c == undefined) continue;

    // distance from p to the center of the circle.
    // works for any dimension: R2, R3, ...
    // Math.sqrt((c[0]-p[0])**2 + (c[1]-p[1])**2);
    let d = Math.sqrt(
      zip(p, c)
        .map((a) => (a[0] - a[1]) ** 2)
        .reduce((a, b) => a + b),
    );

    let r = c[2];
    if (d <= r) {
      // point p is inside circle c
      return inTest ? c : 0;
    }
    dist = Math.min(dist, d - r);
  }
  return dist;
}

/** Draw a circle.
 *
 *  @param {point} (x,y) the coordinates of the circle upper left corner bbox.
 *  @param {number} r the circle diameter.
 *  @param {string} fcolor the filling color.
 */
function drawCircle(x, y, r, fcolor) {
  let div = document.createElement("div");
  div.id = getId(circles.length - 1);
  div.style.position = "absolute";
  div.style.width = r.toString() + "px";
  div.style.height = r.toString() + "px";
  div.style.top = y.toString() + "px";
  div.style.left = x.toString() + "px";
  div.style.background = fcolor;
  div.style.border = "2px solid black";
  div.style.borderRadius = "50%";
  document.getElementById("canvas").insertAdjacentElement("afterbegin", div);
}

/** Create a random circle and draw it,
 *  if its radius is greater than 2.
 */
function draw() {
  let p = randomPoint(wsize, hsize);
  let d = distance2Circles(p, circles);
  if (d > 2) {
    let x = p[0],
      y = p[1];
    let r = randomRadius(x, y, wsize, hsize, 2, d);

    circles.push([x, y, r]);
    drawCircle(x - r, y - r, 2 * r, getRandomColor());
    // console.log(circles.length);
    document.getElementById("counter").innerHTML = parseInt(circles.length);
  }
}

/** Returns a random color code.
 *
 *  @return {string} a 6 hexadecimal digit color code preceded by character '#'.<br><br>
 */
function getRandomColor() {
  var letters = "0123456789ABCDEF".split("");

  var color = "#";

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/** Reset the application and erase all circles. */
function reset() {
  animation.running = false;
  poll.stop();
  document.getElementById("btn").innerHTML = "Start";
  circles.splice(0, circles.length);
  document.getElementById("counter").innerHTML = parseInt(circles.length);
  document.getElementById("canvas").innerHTML = "";
}

/** Get the clicked coordinates into the canvas.
 *
 *  @param {MouseEvent} event descriptor.
 *  @return {point} mouse coordinates.
 *  @see https://www.javascripttutorial.net/javascript-dom/javascript-width-height/
 */
function getCanvasCoords(event) {
  let canvas = document.getElementById("canvas");
  let btn = document.getElementById("btn");

  let box = document.querySelector("#btn");
  let hed = document.querySelector("header");
  let style = getComputedStyle(box);

  let marginLeft = parseInt(style.marginLeft);
  let marginRight = parseInt(style.marginRight);
  let marginTop = parseInt(style.marginTop);
  let marginBottom = parseInt(style.marginBottom);

  var headerh = hed.offsetHeight;
  var btnh = box.offsetHeight + marginTop + marginBottom; // btn (height+margin)

  // Local coordinates relative to canvas.
  var x =
    event.clientX - canvas.offsetLeft + document.documentElement.scrollLeft;
  var y = event.clientY - canvas.offsetTop + document.documentElement.scrollTop;

  if (false) {
    console.log(canvas.offsetTop == headerh + btnh);
    console.log("canvas.offsetTop: " + canvas.offsetTop);
    console.log("headerh + btnh: " + (headerh + btnh).toString());
  }

  var coords = `Screen Position: (${x}, ${y})`;
  document.getElementById("counter").innerHTML = coords;
  return [x, y];
}

/** Gets the properties of the clicked circle,
 *  and shows its center and radius in the counter div.
 *
 *  @param {MouseEvent} event descriptor.
 */
function getCircleAttr(event) {
  let p = getCanvasCoords(event);
  let c = distance2Circles(p, circles, true);
  if (c[0] != undefined) {
    let picked_circle = circles.indexOf(c);
    let id = getId(picked_circle);
    var attr = `Circle: ${id} => x<sub>c</sub>: ${c[0].toFixed(2)},
                                 y<sub>c</sub>: ${c[1].toFixed(2)},
                                 radius: ${c[2].toFixed(2)}`;
    document.getElementById("counter").innerHTML = attr;
  }
}

/** Deletes the clicked circle,
 *
 *  @param {MouseEvent} event descriptor.
 *
 *  @see https://www.w3schools.com/jsref/obj_mouseevent.asp
 */
function deleteCircle(event) {
  let p = getCanvasCoords(event);
  let c = distance2Circles(p, circles, true);
  if (c[0] != undefined) {
    let picked_circle = circles.indexOf(c);
    let id = getId(picked_circle);
    document.getElementById(id).remove();
    // The array becomes sparse, which is a fancy way of saying the
    // deleted item is not removed, but becomes undefined.
    // If I used circles.splice(picked_circle,1) I would loose the
    // position in the array, and the id would not be the index anymore.
    delete circles[picked_circle];
  }
}

/** Toggle animation state.
 *
 *  @param {Timer} p a timer.
 *  @property {boolean} running - static property for holding the animation state.
 */
function animation(p) {
  if (animation.running) {
    animation.running = false;
    document.getElementById("btn").innerHTML = "Start";
    p.stop();
  } else {
    animation.running = true;
    document.getElementById("btn").innerHTML = "Stop";
    p.run();
  }
}

animation.running = false;

/** Toggle color theme.
 *
 *  @property {boolean} mode - static property for holding the color mode.
 *  @see http://www.html-color-names.com/antiquewhite.php
 *  @see https://css-tricks.com/dark-modes-with-css/
 */
function mode() {
  if (mode.dark) {
    mode.dark = false;
    document.getElementById("mode").innerHTML = "Dark";
    document.body.style.backgroundColor = "lightgrey";
    document.getElementById("canvas").style.backgroundColor = "#fdf2cd";
  } else {
    mode.dark = true;
    document.getElementById("mode").innerHTML = "Light";
    document.body.style.backgroundColor = "darkgrey";
    document.getElementById("canvas").style.backgroundColor = color;
  }
}

mode.dark = false;

/** Toggle layout scheme.
 *
 *  @property {boolean} layout - static property for holding the layout scheme.
 */
function layout() {
  if (layout.landscape) {
    layout.landscape = false;
    document.getElementById("layout").innerHTML = "Landscape";
    wsize /= 2;
  } else {
    layout.landscape = true;
    document.getElementById("layout").innerHTML = "Portrait";
    wsize *= 2;
  }
  document.documentElement.style.setProperty(
    "--wsize",
    wsize.toString() + "px",
  );
  reset();
}

layout.landscape = true;

/** Creates a canvas with all of the circles, and
 *  downloads its contents as a png image.
 *
 *  @see https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command-
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX
 */
function downloadImage() {
  // Create a canvas element - without drawing it.
  const canvas = document.createElement("canvas");
  canvas.width = wsize;
  canvas.height = hsize;

  // Get the drawing context
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.strokeStyle = swcolor;
  ctx.shadowColor = swcolor;
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  // cancel shadowing by making the shadowColor transparent
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.shadowBlur = 0;

  for (let i = 0; i < circles.length; ++i) {
    let c = circles[i];
    if (c != undefined) {
      // get circle color.
      let cid = document.getElementById(getId(i));
      ctx.fillStyle = window.getComputedStyle(cid).backgroundColor;

      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.arc(c[0], c[1], c[2], 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }

  let image = canvas.toDataURL();

  // The image will be downloaded.
  const aLink = document.createElement("a");
  const evt = new Event("click", { bubbles: true, cancelable: false });
  aLink.download = "pack_circles.png";
  aLink.href = image;
  aLink.dispatchEvent(evt);
}
