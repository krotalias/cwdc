/**
 *  @file
 *
 * Summary.
 * <p>Calculates the size of the code and triangle boxes
 * and diplays the Pascal triangle.</p>
 *
 * @author Paulo Roma
 * @since 18/06/2021
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
document.getElementById("code").innerHTML = code.slice(code.indexOf("\n"), -1);
