/**
 * @file
 *
 * <p>Draws an animated pinball table.
 *
 * <p>Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}
 * technique that we saw in {@link https://eloquentjavascript.net/Eloquent_JavaScript.pdf#page=250 Chapter 14}
 * and {@link https://eloquentjavascript.net/Eloquent_JavaScript.pdf#page=292 Chapter 16} to draw a box
 * with a bouncing ball in it.
 * The ball moves at a constant speed and bounces off the box’s sides when it hits them.</p>
 *
 * <p>A box is easy to draw with strokeRect.
 * Define a binding that holds its size or define two bindings if your box’s width and height differ.
 * To create a round ball, start a path and call
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc arc(x, y, radius, 0, 7)},
 * which creates an arc going from zero to more than a whole circle. Then fill the path.</p>
 *
 * <p>To model the ball’s position and speed, you can use the Vec class from
 * {@link https://eloquentjavascript.net/Eloquent_JavaScript.pdf#page=277 Chapter 16}.
 * Give it a starting speed, preferably one that is not purely vertical or horizontal,
 * and for every frame multiply that speed by the amount of time that elapsed.
 * When the ball gets too close to a vertical wall, invert the x component in its speed.
 * Likewise, invert the y component when it hits a horizontal wall.</p>
 *
 * To <a href="/compgraf1/downloads/apostila.pdf#page=161">reflect</a>
 * the velocity vector against the wall normal vector:
 * <ul>
 *  <li>vertical wall <br>
 *  r = v - 2 &#60;v.n&#62; n = (vx,vy) - 2 &#60;(vx,vy),(1,0)&#62; (1,0) = (vx,vy) - (2vx,0) = (-vx,vy)</li>
 *  <li>horizontal wall <br>
 *  r = v - 2 &#60;v.n&#62; n = (vx,vy) - 2 &#60;(vx,vy),(0,1)&#62; (0,1) = (vx,vy) - (0,2vy) = (vx,-vy)</li>
 * </ul>
 *
 * <p>After finding the ball’s new position and speed, use clearRect to delete the scene and redraw it
 * using the new position.</p>
 *
 * @author Paulo Roma
 * @since 11/08/2021
 * @see https://eloquentjavascript.net/17_canvas.html
 * @see <a href="/eloquentJavascript/game/ball.html">Pinball</a>
 * @see <a href="/eloquentJavascript/game/ball.js">source</a>
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
 * @see https://www.freecodecamp.org/news/how-to-understand-css-position-absolute-once-and-for-all-b71ca10cd3fd/
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position
 * @see <img src="../img/pinball.png">.
 */

"use strict";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const vx = urlParams.get("vx");
const vy = urlParams.get("vy");

/**
 * A long integer value, the request id, that uniquely identifies the entry in the callback list.
 * @type {GLint}
 */
let timer = 0;

/**
 * Ball horizontal speed component (px/s).
 * @type {Number}
 */
let speedX = vx || 100;

/**
 * Ball vertical speed component (px/s).
 * @type {Number}
 */
let speedY = vy || 60;

/**
 * <p>A closure to draw a single frame, by returning a function, which triggers the animation.</p>
 * <p>We use requestAnimationFrame that takes a callback as an argument
 * to be invoked before the repaint. <br>
 * The callback must call requestAnimationFrame() again,
 * if you want to animate another frame at the next repaint,<br>
 * that is, requestAnimationFrame() is 1 shot.</p>
 * @return {loop} a callback loop for drawing a single frame.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * @function
 */
const runAnimation = (() => {
  let lastTime = 0;
  let lastTimeStamp = 0;
  let numberOfFramesForFPS = 0;
  let fpsCounter = document.getElementById("fps");

  /**
   * <p>A callback function to draw a single frame.</p>
   * <p>Browsers automatically send in a high-precision timestamp
   * as an argument to the callback, into each requestAnimation callback loop,<br>
   * which indicates the current time (based on the number of milliseconds
   * since time origin). </p>
   * @callback loop
   * @param {DOMHighResTimeStamp} time timestamp.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
   */
  return (time = 0) => {
    updateAnimation(Math.min(100, time - lastTime) / 1000);

    if (Math.abs(time - lastTimeStamp) >= 1000) {
      // count number of frames per second
      fpsCounter.innerHTML = numberOfFramesForFPS.toFixed(0);
      numberOfFramesForFPS = 0;
      lastTimeStamp = time;
    }
    lastTime = time;
    numberOfFramesForFPS++;
    // request id, that uniquely identifies the entry in the callback list.
    timer = requestAnimationFrame(runAnimation);
  };
})();

/**
 * A closure for updating the ball animation.
 * @return {frame}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D

 * @function
 */
const updateAnimation = (() => {
  /**
   * A random number between min and max values.
   * @param {Number} min minimum value.
   * @param {Number} max maximum value.
   * @returns {Number} random number.
   * @function
   * @global
   */
  const random = (min, max) => {
    return min + Math.random() * (max - min);
  };

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
  const clamp = (num, min, max, tol = 1.0) =>
    Math.min(Math.max(num, tol * min), tol * max);

  let velocity = document.getElementById("vel");

  // canvas context.
  let ctx = document.querySelector("canvas").getContext("2d");

  // minimum ball speed.
  const speedMin = 300;

  // maximum ball speed.
  const speedMax = 1500;

  // ball radius.
  const radius = 10;

  // canvas width.
  let w = ctx.canvas.clientWidth;

  // canvas height.
  let h = ctx.canvas.clientHeight;

  // width of the pinball table.
  let recw = (9 / 10) * w;

  // height of the pinball table.
  let rech = (8 / 10) * h;

  // lower left corner abscissa of the pinball table.
  let ox = (w - recw) / 2;

  // lower left corner ordinate of the pinball table.
  let oy = (h - rech) / 2 - 30;

  // a random initial abscissa for the ball position.
  let x = random(0, recw) + ox;

  // a random initial ordinate for the ball position.
  let y = random(0, rech) + oy;

  /**
   * Center of the ball must be into this rectangle.
   * @type {Array<Number>}
   */
  const valRec = [
    ox + radius,
    ox + recw - radius,
    oy + radius,
    oy + rech - radius,
  ];

  /**
   * Throw a ball with a random speed, when pointing on the spring,
   * @param {PointerEvent} event a pointer event.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/pageX
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/pointerdown_event
   * @see https://caniuse.com/pointer
   * @function onpointerdown
   */
  window.onpointerdown = (event) => {
    if (
      event.button == 0 && // left button
      event.pageX <= w &&
      event.pageX > w - 25 &&
      event.pageY <= h &&
      event.pageY > h - 25
    ) {
      // a random initial ball velocity
      speedX = -random(speedMin, speedMax);
      speedY = -random(speedMin, speedMax);
      x = ox + recw;
      y = oy + rech;
    }
  };

  /**
   * Animate the ball with a speed of at least 10 pixels per second.
   * The ball position and velocity are updated at each time step.
   *
   * @param {Number} step time elapsed since last call (> 0.1s)
   * @see https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
   * @callback frame
   */
  return (step) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "lightgreen";
    ctx.lineWidth = 6;
    // define the walls (x,y,w,h)
    ctx.strokeRect(ox, oy, recw, rech);
    //ctx.fillRect(ox, oy, recw, rech);

    // position = time * velocity
    x += step * speedX;
    y += step * speedY;

    if (x < valRec[0] || x > valRec[1]) speedX = -speedX;
    if (y < valRec[2] || y > valRec[3]) speedY = -speedY;
    velocity.innerHTML = `(${(speedX <= 0 ? "" : "+") + (+speedX).toFixed(2)},
      ${(speedY <= 0 ? "" : "+") + (+speedY).toFixed(2)})`;
    ctx.fillStyle = "red";
    ctx.beginPath();
    x = clamp(x, valRec[0], valRec[1]);
    y = clamp(y, valRec[2], valRec[3]);
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  };
})();

/**
 * Control the animation when a key is pressed.
 * @param {KeyboardEvent} event a keyboard event.
 * @function keydown_event
 */
window.addEventListener("keydown", (event) => {
  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      event.code
    )
  ) {
    event.preventDefault();
  }

  let vincx = 10 * Math.sign(speedX);
  let vincy = 10 * Math.sign(speedY);

  switch (event.key) {
    case " ":
      if (timer) {
        cancelAnimationFrame(timer);
        timer = 0;
      } else {
        timer = requestAnimationFrame(runAnimation);
      }
      break;
    case "ArrowRight":
      speedX += vincx;
      speedX =
        speedX < 0
          ? Math.max(100 * vincx, speedX)
          : Math.min(100 * vincx, speedX);
      break;
    case "ArrowLeft":
      speedX -= vincx;
      if (speedX == 0) speedX = vincx;
      break;
    case "ArrowUp":
      speedY += vincy;
      speedY =
        speedY < 0
          ? Math.max(100 * vincy, speedY)
          : Math.min(100 * vincy, speedY);
      break;
    case "ArrowDown":
      speedY -= vincy;
      if (speedY == 0) speedY = vincy;
      break;
  }
});

addEventListener("load", (event) => runAnimation());
