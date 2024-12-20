/**
 *  @file
 *
 * Summary.
 * <p>A Pascal triangle generator using yield.</p>
 *
 * Description.
 * <p>When you call a generator, it returns an iterator, and <br>
 * writing iterators is often much easier when you use generator functions.</p>
 * Initially, when you call {@link pascal}, the function is frozen at its start.<br>
 * Every time you call next on the iterator, the function runs until it hits a yield expression,<br>
 * which pauses it and causes the yielded value to become the next value produced by the iterator.<br>
 * When the function returns (sometimes it never does), the iterator is done.
 *
 * <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-pascal pascal.js
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
 *  @see https://en.wikipedia.org/wiki/Generator_(computer_science)
 *  @see https://eloquentjavascript.net/11_async.html
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
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
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
 * Display the pascal triangle.
 *
 * @param {number} level last row index.
 * @returns {Array<Array<number>>} pascal triangle.
 */
export function display(level = 20) {
  let pascalTri = [...pascal(level)];
  let mrow = pascalTri[level - 1].map(String);
  // length of the last row
  let mlen = mrow.join(" ").length;

  pascalTri.forEach((p) => {
    if (typeof document != "undefined") {
      document.getElementById("tri").innerHTML +=
        center(p.map(String).join(" "), mlen) + "<br>";
    } else console.log(center(p.map(String).join(" "), mlen));
  });
  return pascalTri;
}
