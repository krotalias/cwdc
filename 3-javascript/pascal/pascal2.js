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

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const level = urlParams.get("level");

// display the triangle
let mrow = display(parseInt(level) || 10);
const testTri = document.querySelector("#testTri");
testTri.innerHTML = mrow.slice(-1).join(" ");

// the toString() method returns a string representing the source code of the function.
const testCode = document.querySelector("#testCode");
let code = displayCode.toString();
testCode.innerHTML = code.split("\n")[2]; // longest line of code

// calculate the size of the boxes for the code and triangle.
let wTri = testTri.clientWidth + 1 + "px";
let wCode = testCode.clientWidth + 1 + "px";
document.documentElement.style.setProperty("--wTri", wTri);
document.documentElement.style.setProperty("--wCode", wCode);

// display the code
// we need to remove the wrapping function at the first line
const lines = code.split("\n");
lines.splice(0, 2); // first two lines
lines.splice(1, 1); // remove fourth line
lines.splice(-1, 1); // remove last line
document.getElementById("code").innerHTML = lines.join("\n");
