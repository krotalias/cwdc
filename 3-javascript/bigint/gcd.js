/** @module gcd */

/**
 * @file
 *
 * Summary.
 * <p>Package for calculating the <a href="/cwdc/downloads/python/laboratorios.html#gcd">Greatest Common Divisor</a> and
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
 *     - sudo port install npm9 (or npm10)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-gcd gcd.js
 *  - jsdoc -c jsdoc.conf -d doc-factorize bigint/gcd.js bigint/factorize.js bigint/bitset.js bigint/factors.js cookies/cookies.mjs
 *  - jsdoc -c jsdoc.conf -d doc-factorize-node bigint/factorize.mjs
 *  - jsdoc -c jsdoc.conf -d doc-factorize-ui-node bigint/factorize-ui.mjs bigint/gcd.js
 *  </pre>
 *
 * @author Paulo Roma Cavalcanti
 * @since 26/04/2021
 * @see <a href="/cwdc/11-python/functions/functions.py?15+5">Python</a>
 * @see <a href="/cwdc/3-javascript/bigint/gcd.html">link</a>
 * @see <a href="/cwdc/3-javascript/bigint/gcd.js">source</a>
 * @see <img src="../bigint/bigint.png" width="512">
 */

/**
 * {@link https://en.wikipedia.org/wiki/Greatest_common_divisor Greatest Common Divisor},
 * which returns the highest
 * number that divides both x and y exactly.
 * @param {Number|BigInt} x first integer.
 * @param {Number|BigInt} y second integer.
 * @return {Number|BigInt} |x * y| / {@link module:gcd.lcm lcm}(x, y)
 * @see {@link https://dmitripavlutin.com/swap-variables-javascript/ 4 Ways to Swap Variables in JavaScript}
 * @see {@link https://www.mathsisfun.com/greatest-common-factor.html Greatest Common Factor}
 */
export function gcd(x, y) {
  while (x) {
    [x, y] = [y % x, x];
  }

  return y < 0 ? -y : y;
}

/**
 * Greatest Common Divisor of a set of numbers.
 * @function
 * @param {Array<Number|BigInt>} arr array of numbers.
 * @return {Number|BigInt}arr.{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce reduce} ({@link module:gcd.gcd gcd})
 */
export const GCD = (arr) => arr.reduce(gcd);

/**
 * {@link https://en.wikipedia.org/wiki/Least_common_multiple Least Common Multiple},
 * which returns the smallest (positive)
 * number that can be divided by x and y without any remainder.
 * @function
 * @param {Number|BigInt} x first integer.
 * @param {Number|BigInt} y second integer.
 * @return {Number|BigInt} |x * y| / {@link module:gcd.gcd gcd}(x, y)
 * @see {@link https://www.cuemath.com/numbers/lcm-least-common-multiple/ Least common multiple}
 * @see {@link https://www.w3resource.com/python-exercises/challenges/1/python-challenges-1-exercise-37.php Find the smallest positive number that is evenly divisible by all of the numbers from 1 to 30}
 */
export const lcm = (x, y) => (x * y) / gcd(x, y);

/**
 * <p>The smallest integer number with all factors from 1 to n
 * is their Least Common Multiple.</p>
 * Created an array arr=[1,2,..n] of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt BigInt}
 * to avoid the 64-bit limit.
 * <ul>
 *   <li>LCM(10) = 2³ × 3² × 5 × 7 = 2520</li>
 *   <li>2520/2=1260</li>
 *   <li>2520/3=840</li>
 *   <li>2520/4=630</li>
 *   <li>2520/5=504</li>
 *   <li>2520/6=420</li>
 *   <li>2520/7=360</li>
 *   <li>2520/8=315</li>
 *   <li>2520/9=280</li>
 *   <li>2520/10=252</li>
 * </ul>
 * @param {Number} n limit.
 * @return {BigInt} arr.{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce reduce} ({@link module:gcd.lcm lcm})
 * @see {@link https://en.wikipedia.org/wiki/2520_(number) 2520 (number)}
 * @see {@link https://www.techiedelight.com/create-array-from-1-n-javascript/ Create an array sequence from 1 to N in a single line in JavaScript}
 * @see {@link https://betterprogramming.pub/using-javascript-bigint-to-represent-large-numbers-d1ad9f6e0079 Using JavaScript BigInt to Represent Large Numbers}
 */
export function LCM(n) {
  const arr = Array.from(Array(n), (_, index) => BigInt(index + 1));
  return arr.reduce(lcm);
}
