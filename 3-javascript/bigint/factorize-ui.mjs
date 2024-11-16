#!/usr/bin/env node
/**
 * @file
 *
 * Summary.
 * <p>Factorize UI main function for testing.</p>
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
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/console/time console: time() static method}
 * @see {@link https://dmitripavlutin.com/javascript-defined-variable-checking/ 3 Ways to Check if a Variable is Defined in JavaScript}
 * @see {@link https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797 ANSI Escape Sequences}
 * @see {@link https://www.npmjs.com/package/readline-sync readline-sync}
 * @see <a href="/cwdc/3-javascript/bigint/factorize-ui.mjs">source</a>
 */

import * as readlineSync from "readline-sync";
import { factorization, bitLength } from "./factorize.js";
import { LCM } from "./gcd.js";

var MAX = 100,
  MIN = 1,
  value = 40,
  key;

/*
 *      ANSI Escape Sequences
 * "Esc[#A" - moves cursor up # lines
 * "ESC[#B"	- moves cursor down # lines
 * "Esc[K"  - erase in line (same as ESC[0K)
 * "ESC[#G"	- moves cursor to column #
 * "ESC[H"  - moves cursor to home position (0, 0)
 */

let up = "\x1B[1A";
let erase = "\x1B[K";
let go = "\x1B[2G";
let reset = "\x1B[0m";
let red = "\x1B[1;31m";
let green = "\x1B[1;32m";
let blink = "\x1B[5m";
let unblink = "\x1B[25m";

console.log(`\n\n${new Array(20).join(" ")}[Z] ← → [X]  FIX: [SPACE]\n`);
while (true) {
  let factors = LCM(value);
  let bits = bitLength(factors);
  let color = factors > Number.MAX_SAFE_INTEGER ? red : green;
  let highlight = factors > Number.MAX_SAFE_INTEGER ? blink : unblink;

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
