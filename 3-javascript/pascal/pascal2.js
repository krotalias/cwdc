/**
 *  @file
 *
 * Summary.
 * <p>Calculates the size of the code and triangle boxes
 * and diplays the Pascal triangle.</p>
 *
 * Description.
 * <p>To display the source code in 12 lines, we use the
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString toString()} method
 * to send a preformatted string (function code) to the HTML element identified by "#testCode".</p>
 *
 * <p>The toString() method of Function instances returns a string representing the source code of the
 * {@link displayCode function}.</p>
 *
 * @author Paulo Roma
 * @since 18/06/2021
 *
 * @see <a href="/cwdc/3-javascript/pascal/pascal2.js">source</a>
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf String.prototype.indexOf()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice String.prototype.slice()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split String.prototype.split()}
 */

import { display } from "./pascal.js";

/**
 * Element used to calculate the code width.
 * @type {HTMLElement}
 */
let codeElement;

/**
 * Element used to calculate the triangle width.
 * @type {HTMLElement}
 */
let triElement;

/**
 * <p>Display the code in 12 lines.</p>
 * <p>We need to remove the wrapping function at the first line, and the comments.</p>
 * The {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString toString()}
 * method returns a string representing the source code of the function.
 */
function showCode() {
  const code = displayCode.toString();
  codeElement.innerHTML = code.split("\n")[2]; // longest line of code

  const lines = code.split("\n");
  lines.splice(0, 2); // first two lines
  lines.splice(1, 1); // remove fourth line
  lines.splice(-1, 1); // remove last line
  document.getElementById("code").innerHTML = lines.join("\n");
}

/**
 * Display the Pascal triangle.
 * @param {Number} level pascal triangle level.
 */
function displayPascal(level) {
  // display the triangle
  const mrow = display(level);
  triElement.innerHTML = mrow.slice(-1)[0].join(" ");

  // calculate the size of the boxes for the code and triangle.
  const wTri = `${triElement.clientWidth + 1}px`;
  const wCode = `${codeElement.clientWidth + 1}px`;
  document.documentElement.style.setProperty("--wTri", wTri);
  document.documentElement.style.setProperty("--wCode", wCode);
  document.querySelector("#range").innerHTML = level;
  document.querySelector("#slider").value = level;
}

/**
 * <p>Fired when a &lt;input type="range"&gt; is in the
 * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
 * (by clicking or using the keyboard).</p>
 *
 * The {@link displayPascal callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * Executed when the slider is changed.
 *
 * @summary Appends an event listener for events whose type attribute value is change.
 *
 * @param {Event} event a generic event.
 * @event slider
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
document.getElementById("slider").onchange = function (event) {
  const level = event.target.value.toString();
  displayPascal(+level, codeElement);
};

/**
 * <p>Loads the application.</p>
 * <p>The load event is fired when the whole page has loaded,
 * including all dependent resources such as stylesheets,
 * scripts, iframes, and images, except those that are loaded lazily.</p>
 *
 * <p>The callback argument sets the {@link displayPascal callback}
 * that will be invoked when the event is dispatched.</p>
 * @event load
 * @param {event} event a generic event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const level = urlParams.get("level");

  codeElement = document.querySelector("#testCode");
  triElement = document.querySelector("#testTri");

  showCode();
  displayPascal(parseInt(level) || 10);
});
