#!/usr/bin/env node
/**
 * @file
 *
 * Summary.
 * <p>Factorize UI main function for testing.</p>
 *
 * <p>Calculates the {@link module:gcd.LCM Least Common Multiple} up to the current
 * MIN ≤ <mark>value</mark> ≤ MAX and displays its prime factors.</p>
 *
 * Output:
 * <pre>
 *
 *                   [Z] ← → [X]  FIX: [SPACE]
 * |-------------------------------------O---------------------------------------------------------------| 37 = <b style="color:green;">53 bits</b>
 *   LCM(37) = 2⁵ × 3³ × 5² × 7 × 11 × 13 × 17 × 19 × 23 × 29 × 31 × 37
 * A value the user requested: 37
 * </pre>
 *
 * <pre>
 * Usage:
 *  - npm init
 *  - npm install readline-sync
 *  - node factorize-ui.mjs
 * </pre>
 *
 * <p>To use ES6 modules in nodejs (version ≥ 13):</p>
 * <ol>
 *  <li> file extension should be ".mjs" </li>
 *  <li> Add {"type": "module",} to package.json (located in current or parent directory</li>
 *  <li> should be used ES6 module syntax: import and export </li>
 * </ol>
 *
 * @author Paulo Roma
 * @since 30/12/2021
 * @see <a href="/cwdc/3-javascript/bigint/factorize-ui.mjs">source</a>
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/time console: time() static method}
 * @see {@link https://dmitripavlutin.com/javascript-defined-variable-checking/ 3 Ways to Check if a Variable is Defined in JavaScript}
 * @see {@link https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797 ANSI Escape Sequences}
 * @see {@link https://www.npmjs.com/package/readline-sync readline-sync}
 */

import * as readlineSync from "readline-sync";
import { factorization, bitLength } from "./factorize.js";
import { LCM } from "./gcd.js";

/**
 * Maximum integer value.
 * @type {Number}
 */
const MAX = 100;

/**
 * Minimum integer value.
 * @type {Number}
 */
const MIN = 1;

/**
 * Current value.
 * @type {Number}
 */
let value = 40;

/**
 * Key pressed on keyboard.
 * @type {String}
 */
let key;

/**
 * <ul>
 *      {@link https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797 ANSI Escape Sequences}
 * <li>up: "Esc[#A" - moves cursor up # lines</li>
 * <li>down: "ESC[#B"	- moves cursor down # lines</li>
 * <li>erase: "Esc[K" - erase in line (same as ESC[0K)</li>
 * <li>go: "ESC[#G"	- moves cursor to column #</li>
 * <li>reset: "ESC[H" - moves cursor to home position (0, 0)</li>
 * <li>blink: "ESC[5m" - set blinking mode</li>
 * <li>unblink: "ESC[25m" - unset blinking mode</li>
 * <li>red: "ESC[31m" - red</li>
 * <li>green: "ESC[32m" - green</li>
 * <li>blue: "ESC[34m" - blue</li>
 * </ul>
 * @type {String}
 */
const up = "\x1B[1A";
const erase = "\x1B[K";
const go = "\x1B[2G";
const reset = "\x1B[0m";
const red = "\x1B[1;31m";
const green = "\x1B[1;32m";
const blink = "\x1B[5m";
const unblink = "\x1B[25m";

console.log(`\n\n${new Array(20).join(" ")}[Z] ← → [X]  FIX: [SPACE]\n`);
while (true) {
  const factors = LCM(value);
  const bits = bitLength(factors);
  const color = factors > Number.MAX_SAFE_INTEGER ? red : green;
  const highlight = factors > Number.MAX_SAFE_INTEGER ? blink : unblink;

  console.log(
    `${up}${erase}${reset}|${new Array(value + 1).join("-")}O${new Array(
      MAX - value + 1,
    ).join("-")}| ${value} = ${color}${bits} bits`,
  );

  console.log(
    `${go}${erase}${reset} LCM(${highlight}${value}${reset}) = ${factorization(
      factors,
    )} ${up}`,
  );

  key = readlineSync.keyIn("", {
    hideEchoBack: true,
    mask: "",
    limit: "zx ",
  });
  if (key === "z") {
    if (value > MIN) {
      value--;
    }
  } else if (key === "x") {
    if (value < MAX) {
      value++;
    }
  } else {
    break;
  }
}
console.log(`\n${reset}A value the user requested: ${value}`);
