/**
 * @file
 *
 * <p>Draws an animated character, called Jack Walker, running on a mostly sunny day.
 *
 * <p>When {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage drawImage}
 * is given nine arguments, it can be used to draw only a fragment of an image.
 * The second through fifth arguments indicate the rectangle (x, y, width, and height) in the source image that should be copied,
 * and the sixth to ninth arguments give the rectangle (on the canvas) into which it should be copied.</p>
 *
 * <p>We know that each {@link sprite}, each sub-picture, is 48 pixels wide and 60 pixels high.
 * The code in {@link animation} draws a single image sprite for each frame, which is then called
 * continuously by {@link runAnimation}.</p>
 *
 * <p>The cycle binding in {@link pose} tracks our position in the animation. For each frame,
 * it is incremented and then clipped back to the 0 to 7 range, by using the
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder remainder} operator.
 * This binding is then used to compute, for the current pose, the x-coordinate that the sprite has in the picture.</p>
 *
 * <p>We have used two canvases (two layers): one for the foreground (Jack) and the other for the background.
 * The two canvases are stacked and have different z-indexes (Jack's z-index is higher). For being able to keep
 * the two canvases on top of each other, we have put them in a container with
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/position relative position},
 * and the canvas use {@link https://www.freecodecamp.org/news/css-positioning-position-absolute-and-relative/ absolute position}.</p>
 *
 * <p>The implementation made use of a lot of
 * {@link https://www.freecodecamp.org/news/here-are-some-practical-javascript-objects-that-have-encapsulation-fc4c1a79c655/ closures},
 * instead of classes, and
 * {@link https://www.freecodecamp.org/news/learn-es6-the-dope-way-part-ii-arrow-functions-and-the-this-keyword-381ac7a32881/ arrow functions}.
 * The goal was just to show how closures can be useful.
 * A closure is an example of encapsulation: it encapsulates the body of code together
 * with the {@link https://www.techtarget.com/whatis/definition/lexical-scoping-static-scoping lexical scope}.</p>
 * The only means of access into the capsule is through the function:
 * <ul>
 *  <li>the function is like a "method", </li>
 *  <li>and the elements of the captured lexical environment are like "slots" in an object.</li>
 * </ul>
 * Lexical scoping defines how variable names are resolved in nested functions:
 * <ul>
 *  <li>inner functions contain the scope of parent functions even if the parent function <b>has returned</b>.</li>
 *  <li>functions are executed using the scope chain that was in effect when they were defined.</li>
 * </ul>
 *
 * @author Paulo Roma
 * @since 11/08/2021
 * @see <a href="/eloquentJavascript/game/jack.html">Jack</a>
 * @see <a href="/eloquentJavascript/game/jack.js">source</a>
 * @see <a href="https://eloquentjavascript.net/17_canvas.html">Drawing on canvas</a>
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
 * @see https://www.freecodecamp.org/news/how-to-understand-css-position-absolute-once-and-for-all-b71ca10cd3fd/
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/position
 * @see <img src="../img/player_big.png">
 * @see <img src="../img/jack.png" title="Two Canvases">
 * @see <img src="../img/jack4.png" title="Two Canvases">
 */

"use strict";

/**
 * A long integer value, the request id, that uniquely identifies
 * the entry in the callback list.
 * @type {GLint}
 */
let timer = 0;

/**
 * Canvas object.
 * @type {Object}
 * @property {HTMLElement} canvas.elem second canvas element.
 * @property {Number} canvas.theight text height.
 * @property {Number} canvas.w width.
 * @property {Number} canvas.h height.
 * @property {Number} canvas.aspect aspect ratio.
 * @property {Number} canvas.topLine Jack's head line.
 */
const canvas = {
  elem: document.querySelector("canvas:nth-child(2)"),
  theight: 18,
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
 * Jack player_big.png version, with
 * 10 sprites (sub-images).
 * @type {Object}
 * @property {HTMLImageElement} sprite.img HTML image element.
 * @property {Number} sprite.w width.
 * @property {Number} sprite.h height.
 * @property {Number} sprite.n number of sub-images.
 */
const sprite = {
  img: document.getElementById("jack"),
  n: 8,

  get w() {
    return this.img.width / 10;
  },

  get h() {
    return this.img.height;
  },
};

/**
 * Speed object.
 * @type {Object}
 * @property {Number} speed.frameDelay one frame duration.
 * @property {Number} speed.x horizontal speed in pixels/ms.
 * @property {Number} speed.y vertical speed: either 0 or 1.
 * @property {Array<Number>} speed.xy horizontal and vertical speed.
 */
const speed = {
  frameDelay: 1000 / 60,
  _y: 0,
  _x: 60 / 1000,

  get y() {
    return this._y;
  },

  set y(value) {
    this._y = value;
  },

  get x() {
    return this._x;
  },

  set x(value) {
    this._x = value;
  },

  get xy() {
    return [this.x, this.y];
  },
};

/**
 *
 * kinematics object.
 * @type {Object}
 * @property {Number} kinematics.gravity number of pixels to fall, in each frame, when jumping.
 * @property {Number} kinematics.jump a number ∈ [0, topLine) to be multiplied by gravity,<br>
 * to get the vertical (Jack's head) position.
 * @property {Number} kinematics.ginc gravity increment.
 * @property {Number} kinematics.vinc velocity increment.
 */
const kinematics = {
  gravity: 7,
  jump: 0,
  ginc: 1,
  vinc: speed.x,
};

/**
 * Entry point when page is loaded.
 */
function mainEntrance() {
  /**
   * Canvas context for the background.
   * @type {CanvasRenderingContext2D}
   */
  let cx = canvas.elem.getContext("2d");

  /**
   * <p>A fancy font to draw labels.</p>
   *
   * The font is downloaded asynchronously and added before being used.
   * @type {FontFace}
   *
   * @see https://tipsfordev.com/drawing-text-to-canvas-with-font-face-does-not-work-at-the-first-time
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
   */
  const fancyFont = new FontFace(
    "Tangerina",
    "url(https://fonts.gstatic.com/s/tangerine/v15/IurY6Y5j_oScZZow4VOxCZZMprNA4A.woff2)"
  );
  fancyFont.load().then((font) => {
    document.fonts.add(font);
    console.log("Font loaded");
    cx.font = `lighter ${canvas.theight}px Tangerina`;
    let text = cx.measureText("DCC / UFRJ  ");
    let t = cx.getTransform();
    cx.setTransform();
    cx.fillStyle = "#FF7F50";
    cx.fillText(
      "DCC / UFRJ",
      cx.canvas.width - text.width,
      cx.canvas.height - canvas.theight
    );
    cx.fillText("   Jack Walker", 0, cx.canvas.height - canvas.theight);
    text = cx.measureText("topLine  ");
    cx.fillText("topLine  ", cx.canvas.width - text.width, canvas.topLine - 2);
    cx.setTransform(t);
  });

  // Jack's head line.
  canvas.topLine = (cx.canvas.height * 3) / 5;

  /**
   * Jack's floor.
   * @type {Number}
   */
  let baseLine = canvas.topLine + sprite.h;

  // draw canvas border.
  cx.strokeRect(0, 0, cx.canvas.width, cx.canvas.height);
  cx.strokeStyle = "grey";
  cx.fillStyle = "#70483c";

  // draw earth rectangle
  cx.fillRect(0, baseLine + 1, cx.canvas.width, cx.canvas.height - baseLine);

  // draw the floor (baseLine)
  cx.beginPath();
  cx.moveTo(0, baseLine + 1);
  cx.lineTo(cx.canvas.width, baseLine + 1);
  cx.lineWidth = 1.5;
  cx.strokeStyle = "#FF7F50";
  cx.setLineDash([]);
  cx.stroke();

  // draw the head line (topLine)
  cx.beginPath();
  cx.moveTo(0, canvas.topLine);
  cx.lineTo(cx.canvas.width, canvas.topLine);
  cx.setLineDash([5, 2]);
  cx.lineWidth = 1;
  cx.strokeStyle = "lightblue";
  cx.stroke();

  // start animation
  runAnimation();
}

/**
 * Flip a picture around the vertical line at a given x position.
 *
 * @param {CanvasRenderingContext2D} context 2d graphical context.
 * @param {Number} around a vertical line abscissa.
 */
function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

/**
 * <p>A closure that returns a function to get the pose index into the gif image.</p>
 * <p>By default, a complete cycle of the sprites takes 640 ms, that is, <br>
 * 80ms per sprite for getting a smooth animation. </p>
 * This way, each sprite will hold for 4.8 frames (80/(1000/60)):<br>
 * <ul>
 *  <li>duration = framesPerSprite * speed.frameDelay * sprite.n</li>
 * </ul>
 * @returns {pose_index} callback for getting the pose index.
 * @function
 */
const pose = (() => {
  // time to complete a whole sprite cycle: 80ms * 8 = 640
  // controls the speed of the animation
  const framesPerSprite = 4.8;
  const duration = framesPerSprite * speed.frameDelay * sprite.n;
  let cycle = 0;

  /**
   * Return the pose index (cycle number) into the gif image.
   * @param {Number} t elapsed time in ms.
   * @returns {Number} index ∈[0,7] (cycle++ % 8).
   * @callback pose_index
   */
  return (t) => {
    cycle = (cycle + t) % duration;
    return Math.floor((cycle * (sprite.n - 1)) / duration);
  };
})();

/**
 * Closure to draw a single frame.
 *
 * @return {frame} callback for drawing a frame.
 * @function
 */
const animation = (() => {
  // initial horizontal position.
  let x = sprite.w;

  // initial vertical position.
  let y = 0;

  // number of flips.
  let flip = 0;

  // lap timestamp.
  let lapTimeStamp = 0;

  // distance to be walked before flipping.
  // this is set when the function is loaded.
  let runningTrack = canvas.w - 2 * sprite.w;

  // flip coordinate.
  let flipLimit = runningTrack + sprite.w;

  /**
   * Draws a single frame.
   *
   * @param {Number} timestep elapsed time in ms since last call.
   * @param {CanvasRenderingContext2D} ctx canvas context.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect
   * @callback frame
   */
  return (timestep, ctx) => {
    // erase Jack's image by setting its pixels to transparent black (rgba(0,0,0,0)).
    ctx.clearRect(Math.floor(x), y, sprite.w, sprite.h);

    // px = vx * t
    let dx = speed.x * timestep;
    x += dx; // px/frame

    // jump control
    y = speed.y > 0 ? kinematics.gravity * kinematics.jump : canvas.topLine;
    kinematics.jump = (kinematics.jump + 1) % canvas.topLine;
    if (y >= canvas.topLine - 1) {
      y = canvas.topLine;
      speed.y = 0;
      kinematics.jump = 0;
    }

    x = Math.min(Math.max(0, x), flipLimit);
    let tnow = performance.now();

    // hit wall control
    if (x >= flipLimit) {
      let dt = (tnow - lapTimeStamp) / 1000;
      document.getElementById("time").innerHTML = `${dt.toFixed(1)}s or
      ${(runningTrack / dt).toFixed()} px/s`;
      lapTimeStamp = tnow;

      flip++;
      flipHorizontally(ctx, x);
      flipLimit += runningTrack;
    }

    // if Jack is stand still (running on the same place), he'll never reach the wall.
    if (speed.x <= 0)
      document.getElementById("time").innerHTML = `∞ s or 0 px/s`;

    // if jumping, use the last sprite, otherwise keep cycling the sprites in the gif.
    let tile = speed.y > 0 ? 9 : pose(timestep);
    ctx.drawImage(
      sprite.img,
      // source rectangle
      tile * sprite.w,
      0,
      sprite.w,
      sprite.h,
      // destination rectangle
      Math.floor(x),
      y,
      sprite.w,
      sprite.h
    );

    // print the statistics
    document.getElementById("px").innerHTML = x.toFixed(0);
    document.getElementById("speed").innerHTML = `${dx.toFixed(0)} px/frame (${(
      speed.x * 1000
    ).toFixed(0)} px/s)`;
    document.getElementById("turn").innerHTML = flip.toString();
    document.getElementById("gravity").innerHTML = `${
      kinematics.gravity
    } px/frame (${kinematics.gravity * 60} px/s)`;
  };
})();

/**
 * <p>A closure to draw a single frame, by returning a function, which triggers the animation.</p>
 *
 * There are three ways of animating a scene, by calling:
 * <ul>
 *  <li> <a href="https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout">setTimeout</a> </li>
 *  <li> <a href="https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval">setInterval</a> </li>
 *  <li> <a href="https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame">requestAnimationFrame</a>
 *       (hints towards the browser that the update ticks intend to perform animated rendering continuously).</li>
 * </ul>
 *
 * <p>Therefore, from the perspective of the browsers, requestAnimationFrame() is superior (when implementing animation)
 * compared to setTimeout(), for three reasons: </p>
 * <ol>
 *   <li> rAF() firing rate can match display's refresh rate (30Hz/60Hz/90Hz/120Hz/144Hz are all possible),
 *   depending on what kind of gaming display one is running on, though last I checked, only Firefox implemented these rates,
 *   and Chrome was using fixed 60fps, even if desktop was set to 120Hz.
 *   With setTimeout() one cannot know the display refresh rate, and has to guess/choose fixed 60Hz.</li>
 *
 *   <li> rAF() calls are also synced to display's vsync interval, giving smoother animation,
 *   since there is a smaller chance that vsync intervals would be missed.
 *   setTimeout() is used on the web for arbitrary/general timers,
 *   and browser cannot deduce that those would need to be vsync locked.</li>
 *
 *   <li> rAF() calls hint to the browser that the callbacks are about rendering animation, so when the tab is not visible,
 *   browsers can optimize power usage, e.g., by stopping rAF() callbacks until tab comes back to foreground.
 *   In general, rAF()s do not run when page is on the background or browser is minimized. </li>
 * </ol>
 *
 * @return {loop} a callback loop for drawing a single frame.
 * @see https://developer.mozilla.org/en-US/docs/Tools/Performance/Scenarios/Intensive_JavaScript
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
 * @function
 */
const runAnimation = (() => {
  // timestamp.
  let lastTimeStamp = 0;
  // last time frame has been called.
  let lastTime = lastTimeStamp;
  // frame counter.
  let fcounter = 0;

  let JackCtx = document.querySelector("#JackCanvas").getContext("2d");

  let fpsCounter = document.querySelector("#fpsCounter");

  /**
   * <p>A callback function to draw a single frame.</p>
   * The maximum frame step is 100 milliseconds (one-tenth of a second).
   * When the browser tab or window with our page is hidden,
   * {@link https://eloquentjavascript.net/Eloquent_JavaScript.pdf#page=250 requestAnimationFrame} calls
   * will be suspended until the tab or window is shown again.
   * <p>In this case, the difference between lastTime and time will be the entire time in which the page was hidden.
   * Advancing the Jack by that much in a single step would look silly,
   * and might cause weird side effects, such as he being in a very different position.</p>
   *
   * <p>Browsers automatically send in a high-precision timestamp
   * as an argument to the callback, into each requestAnimation callback loop,<br>
   * which indicates the current time (based on the number of milliseconds
   * since time origin). </p>
   * @callback loop
   * @param {DOMHighResTimeStamp} time timestamp.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
   */
  return (time = 0) => {
    let timestep = Math.min(time - lastTime, 100);
    if (time - lastTimeStamp >= 1000) {
      // more than 1s has elapsed?
      // Count the number of frames per second (1000/frameDelay).
      fpsCounter.innerHTML = fcounter;
      lastTimeStamp = time;
      fcounter = 0;
    }
    fcounter++;
    lastTime = time;
    animation(timestep, JackCtx);
    timer = requestAnimationFrame(runAnimation);
  };
})();

/**
 * Handle keydown events that will update the kinematics
 * based on key pressed.
 * @param {KeyboardEvent} event keyboard event.
 * @return {key_event}
 * @function
 */
const handleKeyPress = (event) => {
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
      speed.x += kinematics.vinc;
      speed.x = Math.min(10 * kinematics.vinc, speed.x);
      break;
    case "ArrowLeft":
      speed.x -= kinematics.vinc;
      speed.x = Math.max(0, speed.x);
      break;
    case "ArrowUp":
      if (speed.y <= 0) {
        // jump is over?
        speed.y = 1;
        kinematics.jump = 0;
      }
      break;
    case "ArrowDown":
      if (speed.y <= 0) {
        speed.y = 0;
      }
      break;
    case "g":
      if (speed.y <= 0) {
        kinematics.gravity -= kinematics.ginc;
        kinematics.gravity = Math.max(kinematics.gravity, 1);
      }
      break;
    case "G":
      if (speed.y <= 0) {
        kinematics.gravity += kinematics.ginc;
        kinematics.gravity = Math.min(kinematics.gravity, 7 * kinematics.ginc);
      }
      break;
    case "c":
      canvas.elem.style.left = `${canvas.w}px`;
      break;
    case "C":
      canvas.elem.style.left = "0px";
      break;
  }
};

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @function
 */
const createEvent = (key) => {
  let code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * Increase speed.
 */
function speedUp() {
  handleKeyPress(createEvent("ArrowRight"));
}

/**
 * Decrease speed.
 */
function speedDown() {
  handleKeyPress(createEvent("ArrowLeft"));
}

/**
 * Increase gravity.
 */
function gUp() {
  handleKeyPress(createEvent("G"));
}

/**
 * Decrease gravity
 */
function gDown() {
  handleKeyPress(createEvent("g"));
}

/**
 * Jump.
 */
function jump() {
  handleKeyPress(createEvent("ArrowUp"));
}

/**
 * Halt Jack.
 */
function stop() {
  handleKeyPress(createEvent(" "));
}

/**
 * Control the animation when a key is pressed.
 *
 * <ul>
 * <li>space: pause / resume animation.
 * <li> → : increase speed.
 * <li> ← : decrease speed.
 * <li>↑ : jump.
 * <li>g: decrease gravity.
 * <li>G: increase gravity.
 * <li>c: send background canvas to the right.
 * <li>C: bring background canvas back.
 * </ul>
 * @function key_event
 * @global
 * @param {KeyboardEvent} event keyboard event.
 */
window.addEventListener("keydown", (event) => {
  if (
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
      event.code
    )
  ) {
    event.preventDefault();
  }
  handleKeyPress(event);
});

addEventListener("load", (event) => mainEntrance());
