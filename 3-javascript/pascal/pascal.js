/** @module */

/**
 *  @file
 *
 * Summary.
 * <p>A <a href="/cwdc/downloads/python/laboratorios.html#pascal">Pascal triangle</a>
 * generator using yield.</p>
 *
 * Description.
 * <p>When you call a {@link https://en.wikipedia.org/wiki/Generator_(computer_science) generator},
 * it returns an {@link https://en.wikipedia.org/wiki/Iterator iterator}, and <br>
 * writing iterators is often much easier when you use generator functions.</p>
 * Initially, when you call {@link module:pascal~pascal pascal}, the function is frozen at its start.<br>
 * Every time you call next on the iterator, the function runs until it hits a
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield yield expression},<br>
 * which pauses it and causes the yielded value to become the next value produced by the iterator.<br>
 * When the function returns (sometimes it never does), the iterator is done.
 *
 * <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm9 (or npm10)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-pascal pascal/pascal.js pascal/pascal2.js pascal/pascal3.js
 *
 *  Usage:
 *  - npm init
 *  - npm install readline-sync
 *  - node pascal.mjs [level]
 * </pre>
 *
 *  @author Paulo Roma
 *  @since 18/06/2021
 *  @see <a href="/cwdc/3-javascript/pascal/pascal.html?level=20">link</a>
 *  @see <a href="/cwdc/3-javascript/pascal/pascal.js">source</a>
 *  @see {@link https://eloquentjavascript.net/11_async.html Asynchronous Programming}
 *  @see <a href="/cwdc/downloads/python/labs/doc/html/__03d__pascal__zip_8py.html">pascal</a>
 *  @see <a href="../pascal/pascal3.js">js code</a>
 *  @see <a href="../pascal/pascal.mjs">pascal in node</a>
 *  @see <img src="../pascal/pascal.png" width="512">
 */

/** Interleaves two arrays of the same size.
 *
 *  @param {Array<number>} a first array.
 *  @param {Array<number>} b second array.
 *  @return {Array<Array<number>>} an array of arrays: [ [a0,b0], [a1,b1], [a2,b2], ... ].
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map Array.prototype.map()}
 */
const zip = (a, b) => a.map((k, i) => [k, b[i]]);

/**
 * Center a string in a given length.
 *
 * @param {string} str string.
 * @param {number} len length.
 * @return {string} a string padded with spaces to fit in the given length.
 */
const center = (str, len) =>
  str
    .padStart(str.length + Math.floor((len - str.length) / 2), " ")
    .padEnd(len, " ");

/**
 * Pascal triangle generator.
 *
 * @param {number} nrows number of rows.
 * @param {Array<number>} row current row.
 * @yields {Array<Number>} the next row of the Pascal triangle.
 */
function* pascal(nrows, row = [1]) {
  yield row;
  for (let i = 0; i < nrows - 1; ++i) {
    row = zip([0].concat(row), row.concat(0)).map((a) => a[0] + a[1]);
    yield row;
  }
}

/**
 * Display the pascal triangle in an HTML element identified by "#tri".
 *
 * @param {number} level last row index.
 * @returns {Array<Array<number>>} pascal triangle.
 */
export function display(level = 20) {
  const pascalTri = [...pascal(level)];
  const mrow = pascalTri[level - 1].map(String);
  // length of the last row
  const mlen = mrow.join(" ").length;

  let triElement = null;
  if (typeof document != "undefined") {
    triElement = document.getElementById("tri");
    triElement.innerHTML = "";
  }

  pascalTri.forEach((p) => {
    if (triElement) {
      triElement.innerHTML += center(p.map(String).join(" "), mlen) + "<br>";
    } else console.log(center(p.map(String).join(" "), mlen));
  });
  return pascalTri;
}
