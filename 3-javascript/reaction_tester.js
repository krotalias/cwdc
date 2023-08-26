/**
 * @file
 *
 * Summary.
 * <p>Reaction tester measures the reaction time between clicks
 *    onto two different shapes (circles and squares), generated with random sizes and positions.
 * </p>
 *
 *  Description.
 *  <p>Math.random() is used to generated random data.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm5 (or npm6)
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

/** Mark the starting time.
 *  @type {DateTime}
 */
var start = new Date().getTime();

/**
 *   Generate a random color.
 *
 *   @return {string} a 6 hexadecimal digit color code preceded by character '#'.<br><br>
 *
 */
function getRandomColor() {
  var letters = "0123456789ABCDEF".split("");
  var color = "#";

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 *   Create a random shape and reset the starting time.
 */
function makeShapeAppear() {
  var top = Math.random() * 400;
  var left = Math.random() * 400;
  var width = Math.random() * 200 + 100;
  var shape = document.getElementById("shape");

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
 *  The window object allows execution of code at specified time intervals.<br>
 *
 * <ul>
 *  <li>The window.setTimeout() method can be written without the window prefix.</li>
 *  <li>The first parameter is a function to be executed.</li>
 *  <li>The second parameter indicates the number of milliseconds before execution.</li>
 * </ul>
 *
 *  @see https://www.w3schools.com/js/js_timing.asp
 */
function appearAfterDelay() {
  setTimeout(makeShapeAppear, Math.random() * 2000);
}

appearAfterDelay();

/**
 *  Callback function called when an element with id "shape" is clicked. <br>
 *  Change the display property to "none" to make the shape disappear and
 *  update the reaction time.
 */
document.getElementById("shape").onclick = function () {
  document.getElementById("shape").style.display = "none";

  var end = new Date().getTime();

  var timeTaken = (end - start) / 1000;

  document.getElementById("timeTaken").innerHTML = timeTaken + "s";

  appearAfterDelay();
};
