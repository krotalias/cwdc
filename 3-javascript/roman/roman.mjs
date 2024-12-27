/**
 * @file
 *
 * Summary.
 * <p>Converting decimal numbers to roman numerals and vice versa.</p>
 *
 * <p>argv:</p>
 * <ol>
 *   <li>argv[0]: node path.</li>
 *   <li>argv[1]: script path.</li>
 *   <li>argv[2]: integer or roman to be converted.</li>
 * </ol>
 *
 * <pre>
 * Usage:
 *  - npm init
 *  - npm install readline-sync
 *  - node roman.mjs 345
 * </pre>
 *
 * @author Paulo Roma
 * @since 25/07/2021
 * @see <a href="/cwdc/3-javascript/roman/roman.mjs">source</a>
 * @see {@link https://techsparx.com/nodejs/esnext/dynamic-import-2.html Using Dynamic import in Node.js}
 * @see {@link https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663 Announcing core Node.js support for ECMAScript modules}
 */

import * as readlineSync from "readline-sync";

import * as romano from "./roman.js";

(function main(argv) {
  // argv is (not defined) OR (defined AND uninitialized)
  if (typeof argv === "undefined") argv = process.argv;

  var n, a, roman;
  if (argv.length > 2) {
    a = argv[2];
    argv = [];
  } else {
    a = readlineSync.question("Enter value: ");
  }
  if (!isNaN(parseInt(a, 10))) {
    n = parseInt(a);
    roman = romano.int2romanFast(n);
  } else {
    roman = a;
    let s = romano.validateRoman(roman);
    let t = romano.reRoman(roman);
    console.log(`Roman ${roman} is ${t ? "" : "in"}valid`);
    if (s) roman = `Exception ${s} : Invalid roman "${roman}"`;
    n = s.length == 0 ? romano.roman2int(roman) : 0;
  }

  console.log(`Decimal = ${n}`);
  console.log(`Roman = ${roman}`);

  // keep asking for values to convert
  main(argv);
})();
