/** @module */

/**
 * @file
 *
 * Summary.
 * <p>Package for calculating the Greatest Common Divisor and
 * Least Common Multiple of whole numbers.</p>
 *
 *  Description.
 *  <p>LCM returns the smallest whole number with all factors (divisible by all numbers) from 1 to a given limit.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-gcd gcd.js
 *  </pre>
 *
 *  @author Paulo Roma Cavalcanti
 *  @since 26/04/2021
 *  @see <a href="/cwdc/11-python/functions.py?15+5">Python</a>
 *  @see <a href="/cwdc/3-javascript/bigint/gcd.html">link</a>
 *  @see <a href="/cwdc/3-javascript/bigint/gcd.js">source</a>
 */

/**
 * Greatest Common Divisor, which returns the highest
 * number that divides into two other numbers exactly.
 * @param {Number} x first integer.
 * @param {Number} y second integer.
 * @return {Number} GCD.
 * @see https://dmitripavlutin.com/swap-variables-javascript/
 * @see https://www.mathsisfun.com/greatest-common-factor.html
 */
export function gcd(x, y) {
  while (x) {
    [x, y] = [y % x, x];
  }

  return y;
}

/**
 * Greatest Common Divisor of an array of numbers.
 * @function
 * @param {Array<Number>} arr array of numbers.
 * @return {Number} GCD.
 */
export var GCD = (arr) => arr.reduce(gcd);

/**
 * Least Common Multiple, which returns the smallest
 * number that can be divided by x and y without any remainder.
 * @function
 * @param {Number} x first integer.
 * @param {Number} y second integer.
 * @return {Number} LCM.
 * @see https://en.wikipedia.org/wiki/Least_common_multiple
 * @see https://www.w3resource.com/python-exercises/challenges/1/python-challenges-1-exercise-37.php
 */
export var lcm = (x, y) => (x * y) / gcd(x, y);

/**
 * The smallest integer number with all factors from 1 to n
 * is their Least Common Multiple.
 * Using javascript BigInt to avoid the 64-bit limit.
 * @param {Number} n limit.
 * @return {BigInt} smallest integer.
 * @see https://en.wikipedia.org/wiki/2520_(number)
 * @see https://www.techiedelight.com/create-array-from-1-n-javascript/
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 * @see https://betterprogramming.pub/using-javascript-bigint-to-represent-large-numbers-d1ad9f6e0079
 */
export function LCM(n) {
  const arr = Array.from(Array(n), (_, index) => BigInt(index + 1));
  return arr.reduce(lcm);
}
