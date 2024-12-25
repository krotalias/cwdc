/**
 * @file
 *
 * Summary.
 * <p>Reaction tester measures the reaction time between clicks
 *    onto two different shapes (circles and squares), generated with random sizes and positions.
 * </p>
 *
 * Description.
 * <p>{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random Math.random()}
 * is used to generated random data.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm9 (or npm10)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-reaction reaction_tester.js
 *  </pre>
 *
 *  @see <a href="/cwdc/3-javascript/3.16.html">link</a>
 *  @see <a href="/cwdc/3-javascript/reaction_tester.js">source</a>
 *  @author Paulo Roma Cavalcanti
 *  @since 24/12/2020
 */
"use strict";

/**
 * Mark the starting {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime time}.
 * @type {DateTime}
 */
let start = new Date().getTime();

/**
 * Generate a random color.
 *
 * @return {string} a 6 hexadecimal digit color code preceded by character '#'.<br><br>
 *
 */
function getRandomColor() {
  const letters = "0123456789ABCDEF".split("");
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Create a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random random}
 * shape and reset the starting time.
 */
function makeShapeAppear() {
  const top = Math.random() * 400;
  const left = Math.random() * 400;
  const width = Math.random() * 200 + 100;
  const shape = document.getElementById("shape");

  if (Math.random() > 0.5) {
    shape.style.borderRadius = "50%";
  } else {
    shape.style.borderRadius = "0";
  }

  shape.style.backgroundColor = getRandomColor();
  shape.style.width = width + "px";
  shape.style.height = width + "px";
  shape.style.top = top + "px";
  shape.style.left = left + "px";
  shape.style.display = "block";

  start = new Date().getTime();
}

/**
 * The window object allows execution of code at specified time intervals.<br>
 *
 * <ul>
 *  <li>The window.setTimeout() method can be written without the window prefix.</li>
 *  <li>The first parameter is a function to be executed.</li>
 *  <li>The second parameter indicates the number of milliseconds before execution.</li>
 * </ul>
 *
 *  @see {@link https://www.w3schools.com/js/js_timing.asp JavaScript Timing Events}
 */
function appearAfterDelay() {
  setTimeout(makeShapeAppear, Math.random() * 2000);
}

/**
 * <p>Callback function {@link appearAfterDelay invoked} when an element with id "shape" is clicked. </p>
 * <p>The click event is fired when a point-device button is pressed, a touch gesture is performed or
 * a user interaction that is equivalent to a click is performed by pressing a key (Enter or Space).</p>
 * Change the display property to "none" to make the shape disappear and
 * update the reaction time.
 * @event click
 */
document.getElementById("shape").onclick = function () {
  document.getElementById("shape").style.display = "none";

  const end = new Date().getTime();

  const timeTaken = (end - start) / 1000;

  document.getElementById("timeTaken").innerHTML = timeTaken + "s";

  appearAfterDelay();
};

/**
 * <p>Loads the application.</p>
 * <p>The load event is fired when the whole page has loaded,
 * including all dependent resources such as stylesheets,
 * scripts, iframes, and images, except those that are loaded lazily.</p>
 *
 * <p>The callback argument sets the {@link appearAfterDelay callback}
 * that will be invoked when the event is dispatched.</p>
 * @event load
 * @param {event} event a generic event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
addEventListener("load", (event) => appearAfterDelay());
