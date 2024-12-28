/** @module factorize */

/**
 * @file
 *
 * Summary.
 * <p>A faster factorization algorithm.</p>
 *
 * <p>The fundamental theorem of arithmetic states that every positive integer
 * (except the number 1) can be represented in exactly one way, apart from
 * rearrangement, as a product of one or more primes
 * <a href="https://blngcc.files.wordpress.com/2008/11/hardy-wright-theory_of_numbers.pdf#page=18">
 * (Hardy and Wright 1979, pp 2-3)</a>.</p>
 *
 * <p>This is a "fast" algorithm, which can factorize large numbers in a
 * reasonably small time.</p>
 *
 * @author Paulo Roma
 * @since 27/12/2021
 * @see <a href="/cwdc/3-javascript/bigint/gcd.html">link</a>
 * @see <a href="/cwdc/3-javascript/bigint/factorize.js">source</a>
 * @see {@link https://mathworld.wolfram.com/PrimeFactorizationAlgorithms.html Prime Factorization Algorithms}
 * @see {@link https://academickids.com/encyclopedia/index.php/Prime_factorization_algorithm Prime factorization algorithm}
 * @see {@link https://en.wikipedia.org/wiki/Integer_factorization Integer factorization}
 * @see {@link https://javascript.info/modules-dynamic-imports Dynamic imports}
 * @see {@link https://www.scriptol.com/javascript/include.php Loading a JavaScript file into another with Node.js}
 * @see <a href="../doc-factorize-node">factorize in node</a>
 * @see <a href="../doc-factorize-ui-node">factorize UI in node</a>
 * @see <iframe title="bigint" src="/cwdc/3-javascript/bigint/gcd.html" style="position: relative; right: 40px; margin-bottom: 0px; transform: scale(0.85); width: 650px; height: 850px"></iframe>
 */

"use strict";

/**
 * <p>Fired when the whole page has loaded, including all dependent resources
 * such as stylesheets, scripts, iframes, and images, except those that are loaded lazily.</p>
 * <p>The callback argument sets the {@link loadScript callback}
 * that will be invoked when the event is dispatched.</p>
 * @summary Load bitset.js for node.
 * @event load
 * @param {Event} event a generic event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 * @see <a href="/cwdc/3-javascript/doc-factorize/global.html#loadScript">loadScript</a>
 */
if (typeof window === "undefined") {
  await loadScript("bitset.js");
} else {
  window.addEventListener("load", async () => await loadScript("bitset.js"));
}

/**
 * A cache array with the first 15 primes to speed up factorization.
 * @type {Array<Number>}
 */
const cachedPrimes = sieve(47);

/**
 * <p>Load a script for running nodejs.</p>
 *
 * Export and import statements are static.
 * <ul>
 * <li>The import(module) expression loads the module and returns a promise<br>
 * that resolves into a module object, which contains all its exports.</li>
 * <li>It can be called from any place in the code.</li>
 * </ul>
 *
 * <p>We can use it dynamically in any place of the code, for instance, to load
 * bitset.js when using nodejs:</p>
 * <ul>
 *   <li>vm.runInThisContext() compiles code, runs it within the context of the current
 *   global and returns the result.</li>
 *   <li>Running code does not have access to local scope, but does have access to
 *   the current global object.</li>
 * </ul>
 * @async
 * @param {String} jscript script file name.
 * @return {Promise<void>}
 * @see {@link https://javascript.info/modules-dynamic-imports Dynamic imports}
 * @see {@link https://nodejs.org/api/vm.html#vmruninthiscontextcode-options vm.runInThisContext(code[, options])}
 */
export async function loadScript(jscript) {
  if (typeof window === "undefined") {
    const fs = await import("fs");
    const vm = await import("vm");
    try {
      vm.runInThisContext(fs.readFileSync(jscript));
    } catch (err) {
      if (err) {
        if (err.code !== "ENOENT") throw err;

        console.log(`Script not found: ${jscript}`);
        process.exit(1);
      }
    }
  }
}

/**
 * A closure to map a decimal digit to its utf8 subscript or superscript equivalent.
 * @function
 *
 * @returns {map_typography} callback for mapping subscript and superscript digits.
 * @see {@link https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts Unicode subscripts and superscripts}
 */
export const translate = (function () {
  const superscript = [];
  const subscript = [];

  const zip = (a, b) => a.map((k, i) => [k, b[i]]);

  for (const t of zip("0123456789".split(""), "⁰¹²³⁴⁵⁶⁷⁸⁹".split(""))) {
    superscript[t[0]] = t[1];
  }

  for (const t of zip("0123456789".split(""), "₀₁₂₃₄₅₆₇₈₉".split(""))) {
    subscript[t[0]] = t[1];
  }

  /**
   * Map a decimal digit to its utf8 subscript or superscript equivalent.
   * @param {String} c digit.
   * @returns {Object<{sub:String, sup:String}>} subscript and superscript digits.
   * @callback map_typography
   * @see {@link https://en.wikipedia.org/wiki/Subscript_and_superscript Subscript and superscript}
   */
  return (c) => {
    return {
      sub: subscript[c],
      sup: superscript[c],
    };
  };
})();

/**
 * <p>JavaScript is a prototype based language.
 * Therefore, whenever we create a function,
 * JavaScript engine adds a prototype property inside that function.</p>
 *
 * <p>The prototype property is basically an object (also known as Prototype object),
 * where methods and properties can be attached,
 * thus enabling all of the other derived objects to inherit them.</p>
 *
 * However, it is not advisable to change the prototype of an object
 * that we do not control, such as:
 * <ul>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean">Boolean</a>,</li>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a>,</li>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt">BigInt</a>,</li>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">String</a>,</li>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol">Symbol</a>,</li>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a>,</li>
 *  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array">Array</a>.</li>
 * </ul>
 *
 * Nonetheless, here, the temptation was stronger...
 * <hr />
 * <p>Add a new method to BigInt's prototype to calculate
 * the integer part of its square root.</p>
 *
 * <p>It is applied the Newton method for solving: x² - this = 0,
 * using only integer divisions.</p>
 *
 * Although sqrt(n) is irrational for many n, the sequence
 * {x<sub>k</sub>} contains only rational terms when x<sub>0</sub> is rational.
 *
 * <p>Thus, with this method it is unnecessary to exit the field of rational numbers,
 * in order to calculate isqrt(n), a fact which has some theoretical advantages.</p>
 *
 * <ul>
 * <li>r<sub>new</sub> = r - f(r)/f'(r) = r - (r² - this)/2r ≊ ⌊(r + ⌊this/r⌋)/2⌋ = ⌊(r + this/r)/2⌋, r<sub>0</sub> > 0, r<sub>0</sub> ∈ ℤ.</li>
 * <li>initial estimate should be greater than the real root, such as the number itself or
 * the smallest power of 2 that exceed its isqrt:</li>
 *  <ul>
 *    <li>r<sub>0</sub> = this or</li>
 *    <li>r<sub>0</sub> = 1n << (BigInt(bitLength(this) + 1) >> 1n)</li>
 *  </ul>
 * </ul>
 *
 * @function
 * @global
 * @return {BigInt} int(sqrt(this)).
 * @see {@link https://www.freecodecamp.org/news/all-you-need-to-know-to-understand-javascripts-prototype-a2bff2d28f03/ All you need to know to understand JavaScript’s Prototype}
 * @see {@link https://en.wikipedia.org/wiki/Newton's_method Newton's method}
 * @see {@link http://en.wikipedia.org/wiki/Integer_square_root Integer square root}
 * @see {@link https://stackoverflow.com/questions/15390807/integer-square-root-in-python Integer square root in python}
 * @see {@link https://stackoverflow.com/questions/15390807/integer-square-root-in-python/31224469#31224469 Here's a very straightforward implementation}
 * @see {@link https://www.mathsisfun.com/algebra/quadratic-equation-graph.html Explore the Quadratic Equation}
 * @see <a href="/cwdc/downloads/python/labs/doc/html/namespace__04b__intsqrt.html">intsqrt</a>
 */
BigInt.prototype.isqrt = function () {
  if (this < 0) return NaN;
  else if (this < 2) return this;
  // smallest power of 2 that exceed the square root
  let r = 1n << (BigInt(bitLength(this) + 1) >> 1n);
  while (true) {
    const rnew = (r + this / r) >> 1n; // integer division
    if (rnew >= r) return r;
    r = rnew;
  }
};

/**
 * <p>Add a new method to Number's prototype to calculate
 * the integer part of its square root.</p>
 *
 * <p>It is applied the Newton method for solving: x² - this = 0</p>
 *
 * <ul>
 * <li>r<sub>new</sub> = r - f(r)/f'(r) = r - (r² - this)/2r ≊ ⌊(r + ⌊this/r⌋)/2⌋ = ⌊(r + this/r)/2⌋, r<sub>0</sub> > 0, r<sub>0</sub> ∈ ℤ.</li>
 * <li>initial estimate should be greater than the real root, such as:</li>
 *  <ul>
 *    <li>r<sub>0</sub> = this or</li>
 *    <li>r<sub>0</sub> = 2 ** Math.floor((bitLength(this) + 1) / 2)</li>
 *  </ul>
 * </ul>
 *
 * @function
 * @global
 * @return {Number} int(sqrt(this)).
 * @see {@link https://www.freecodecamp.org/news/all-you-need-to-know-to-understand-javascripts-prototype-a2bff2d28f03/ All you need to know to understand JavaScript’s Prototype}
 * @see {@link https://en.wikipedia.org/wiki/Newton's_method Newton's method}
 * @see {@link http://en.wikipedia.org/wiki/Integer_square_root Integer square root}
 * @see {@link https://stackoverflow.com/questions/15390807/integer-square-root-in-python Integer square root in python}
 * @see {@link https://www.mathsisfun.com/algebra/quadratic-equation-graph.html Explore the Quadratic Equation}
 * @see <a href="/python/labs/doc/html/namespace__04b__intsqrt.html">intsqrt</a>
 */
Number.prototype.isqrt = function () {
  if (this < 0) return NaN;
  else if (this < 2) return this;
  // all bitwise operations are performed on 32 bits binary numbers.
  // two to the power of the number of bits of its isqrt.
  let r = 2 ** Math.floor((bitLength(this) + 1) / 2);
  while (true) {
    let rnew = (r + this / r) / 2;
    rnew = Math.trunc(rnew); // integer division
    if (rnew >= r) return r;
    r = rnew;
  }
};

/**
 * Type casts a variable to the type of another variable.
 *
 * @param {Number | BigInt} x given variable.
 * @param {Number | BigInt} n the other variable.
 * @returns {Number | BigInt} cast variable.
 */
export function typeCast(x, n) {
  return typeof n == "bigint" ? BigInt(x) : x;
}

/**
 * Return the amount of bits of a whole number.
 *
 * @param {Number | BigInt} x given number.
 * @returns {Number} amount of bits.
 * @see {@link https://en.wikipedia.org/wiki/Bit-length Bit-length}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString Object.prototype.toString()}
 */
export function bitLength(x) {
  return typeof x == "bigint"
    ? x.toString(2).length
    : Math.ceil(Math.log2(Math.abs(x) + 1));
}

/**
 * Return the amount of decimal digits of a whole number.
 *
 * @param {Number | BigInt} x given number.
 * @returns {Number} amount of digits.
 * @see {@link https://en.wikipedia.org/wiki/Bit-length Bit-length}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString Object.prototype.toString()}
 */
export function decLength(x) {
  return typeof x == "bigint"
    ? x.toString(10).length
    : Math.ceil(Math.log10(Math.abs(x) + 1));
}

/**
 * Returns whether a given string represents a numerical value.
 *
 * @param {String} d given string.
 * @returns {Boolean} true if d can be converted to a number, and false otherwise.
 * @see {@link https://stackoverflow.com/questions/8935632/check-if-character-is-number Check if character is number?}
 */
export function isDigit(d) {
  return +d == d;
}

/**
 * <p>Stringify a condensed array of factors of a given whole number.<p>
 *
 * <p>Each factor is separated by an '×' symbol:</p>
 *
 * 345
 * <ul>
 *   <li>3 × 5 × 23</li>
 * </ul>
 *
 * 173248246132375748867198458668657948626531982421875
 * <ul>
 *   <li>3²⁴ × 5¹⁴ × 7³³ × 13</li>
 * </ul>
 *
 * @param {Number | BigInt} n a given whole number.
 * @returns {String} string of factors of n.
 */
export function factorization(n) {
  return condense(factorize(n)).join(" × ");
}

/**
 * <p>Returns an array with all primes up to n.</p>
 * <p>We're iterating through n numbers. Whenever we reach a prime p,
 * we start iterating through the multiples of p up to n.</p>
 *
 * <p>For each prime, this takes n/p operations.</p>
 *
 * n ∑<sub>p<sub>prime</sub> ≤ n</sub> 1/p = n (ln(ln(n)) + M)
 *
 * <p>So we end up with the prime harmonic series up to n, which actually evaluates out to log(log(n)).
 * The total complexity is then: O(n log(log(n)).</p>
 *
 * @param {Number | BigInt} n a given positive whole number.
 * @return {Array<Number>} array holding the primes up to n.
 * @see {@link https://en.wikipedia.org/wiki/Divergence_of_the_sum_of_the_reciprocals_of_the_primes Divergence of the sum of the reciprocals of the primes}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from Array.from()}
 * @see <a href="/cwdc/downloads/python/laboratorios.html#sieve">sieve</a>
 */
export function sieve(n) {
  if (n < 2 || n > 4294967295) return [];
  if (n > 1000) return sieve2(n, n <= 1000);
  n = Number(n);

  // For an Array the maximum length is 4GB-1 (2^32-1 = 4294967295).
  // This is a waste of space, because we need just n bits.
  const l = Array.from({ length: n + 1 }, (_, index) => index);
  l[0] = l[1] = null;
  for (const i of l) // in fact, this loop ends when i == int(sqrt(n)) - see below
    if (i != null) {
      // it's enough to eliminate multiples starting at
      // the square of the number, because all factors
      // until (i-1) have been already tested.
      let j = i * i;
      if (j > n) break; // or i > sqrt(n)
      while (j <= n) {
        l[j] = null;
        j += i;
      }
    }
  return l.filter((value) => value != null);
}

/**
 * <p>Memory efficient version using bitset.</p>
 *
 * I do not know the real limit of this function in node:
 * <ul>
 * <li>FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory</li>
 * <ul>
 * <li>node -e 'console.log(v8.getHeapStatistics().heap_size_limit/(1024*1024))'</li>
 * <li>export NODE_OPTIONS="--max-old-space-size=8192"</li>
 * </ul>
 * </ul>
 *
 * @param {Number | BigInt} n a given positive whole number.
 * @param {Boolean} arr whether to return an array with primes or just the bitset.
 * @return {Array<Number> | BitSet} array of primes, or a bitarray indicating the primes up to n.
 *
 * @see {@link https://www.xarg.org/2014/03/javascript-bit-array/ JavaScript Bit Array}
 * @see <a href="/python/labs/doc/html/__04d__sieve_8py.html">sieve</a>
 */
export function sieve2(n, arr = false) {
  if (n < 2 || n > Number.MAX_SAFE_INTEGER) return [];
  n = Number(n);

  const bs = new BitSet();
  // set size to n and all bits ∈ [2,n] to 1
  // "111111111111111111111111111111100"
  bs.flip(2, n);

  let j,
    i = 2;
  while ((j = i * i) <= n) {
    // in fact, this loop ends when i > n.isqrt() - see below
    if (bs.get(i)) {
      // it's enough to eliminate multiples starting at
      // the square of the number, because all factors
      // until (i-1) have been already tested.
      while (j <= n) {
        bs.clear(j);
        j += i;
      }
    }
    i += i < 3 ? 1 : 2;
  }
  // maximum array size is 2**32-1
  // "10100000100010100010100010101100"
  // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
  return arr ? bs.toArray() : bs;
}

/**
 * <p>Checks if a given whole number is prime.</p>
 *
 * <p>A prime number (or a prime) is a natural number
 * which has exactly two distinct natural number divisors:
 * 1 and itself.</p>
 *
 * Only divisors up to ⌊√n⌋ (where ⌊x⌋ is the floor function) need to be tested.
 * This is true since if all integers less than this had been tried, then
 * n / (⌊√n⌋+1) < √n.
 * In other words, all possible factors have had their cofactors already tested.
 * Given a factor a of a number n=ab, the cofactor of a is b=n/a.
 *
 * <p>Trial division, used here, is hopeless for finding any but small prime numbers.
 * Mathematica versions 2.2 and later have implemented the multiple
 * Rabin-Miller test combined with a Lucas pseudoprime test.</p>
 *
 * @param {Number | BigInt} n given whole number.
 * @returns {Boolean} true if n is a prime, and false otherwise.
 * @see <a href="/cwdc/downloads/python/laboratorios.html#prime">prime</a>
 * @see {@link https://literateprograms.org/miller-rabin_primality_test__python_.html Miller-Rabin primality test (Python)}
 *
 */
export function isPrime(n) {
  if (n <= 1) return false;
  const high = n.isqrt();
  for (const x of cachedPrimes) {
    if (x > high) {
      return true;
    }
    if (n % typeCast(x, n) == 0) {
      return false;
    }
  }
  // the last prime in the cachedPrimes
  const maxprimeinlist = cachedPrimes[cachedPrimes.length - 1];
  let bigX = typeCast(maxprimeinlist + 2, n);
  const two = typeCast(2, n);
  while (bigX <= high) {
    if (n % bigX == 0) return false;
    bigX += two;
  }
  return true;
}

/**
 * <p>Factorizes a whole number.</p>
 *
 * In number theory, integer factorization is the decomposition of a composite number
 * into a product of smaller integers.<br />
 * If these factors are further restricted to prime numbers,
 * the process is called prime factorization.
 *
 * <p>Essentially, to factor a negative number, find all of its positive factors,
 * then duplicate them and write a negative sign in front of the duplicates.</p>
 *
 * <p>Prime factorization or integer factorization of a number is breaking a number
 * down into the set of prime numbers, which multiply together to result in the original number.
 * This is also known as prime decomposition.</p>
 *
 * <p>If we know that one of the prime factors of x is p,
 * then all the prime factors of x are p plus the decomposition of x/p.</p>
 *
 * <p>Number x cannot have more than log x prime factors, because every prime factor is ≥ 2.
 * Factorization by the above method works in O(log x) time complexity.</p>
 *
 * Note that consecutive factors will be presented in non-decreasing order.
 * The amount of memory needed for large numbers is prohibitive.
 *
 * <pre>
 *  For x = 20,         F[20] = 2 → [2]
 *      x = 20/2 = 10,  F[10] = 2 → [2,2]
 *      x = 10/2 = 5,   F[5]  = 0 → [2,2,5]
 * </pre>
 *
 * E.g.:
 * <ul>
 *  <li>factorize(12) → [2, 2, 3]</li>
 *  <li>factorize(-12) → [2, 2, 3, -1]</li>
 * </ul>
 *
 * @param {Number | BigInt} n given whole number.
 * @returns {Array<Number|BigInt>} an array with the prime factors of n.
 * @see {@link https://sciencing.com/factor-negative-numbers-8170436.html How To Factor Negative Numbers}
 * @see {@link https://en.wikipedia.org/wiki/Integer_factorization Integer factorization}
 * @see {@link https://betterprogramming.pub/the-downsides-of-bigints-in-javascript-6350fd807d The Downsides of BigInts in JavaScript}
 */
export function factorize(n) {
  let primes = [];
  let index = 0;
  let candidate = cachedPrimes[index];
  const neg = n < 0;

  if (n == 0 || n == 1) return [n];

  // BigInt operations are carried out in software (slower than Number)
  if (n <= Number.MAX_SAFE_INTEGER) n = Number(n);

  if (neg) n = -n;

  const high = n.isqrt();

  if (isPrime(n)) {
    primes = [n];
    if (neg) primes.push(-1);
    return primes;
  }

  while (candidate <= high) {
    const bigCandidate = typeCast(candidate, n);
    if (n % bigCandidate == 0) {
      // All factors of "n", lesser than "candidate", have been found before.
      // Therefore, "candidate" cannot be composite.
      n /= bigCandidate;
      primes.push(candidate);
      primes = primes.concat(factorize(n)); // recursive call
      break;
    }
    index++;
    if (index < cachedPrimes.length) {
      candidate = cachedPrimes[index];
    } else {
      candidate += 2;
    }
  }
  if (neg) {
    // primes = primes.concat(primes.map((p) => -p));
    primes.push(-1);
  }
  return primes;
}

/**
 * Return a superscript in unicode (e.g.: 12 → ¹²), or an HTML &lt;sup&gt;12&lt;/sup&gt;,
 * for the given digits.
 *
 * <p>If type is false, and no translate function is available, it is returned '^12'</p>
 *
 * @param {String} val a sequence of decimal digits.
 * @param {Boolean} type select the superscript method.
 * @returns {String} superscript digits.
 */
function exponent(val, type = false) {
  if (type) {
    return `<sup>${val}</sup>`;
  } else if (typeof translate !== "undefined") {
    return val
      .split("")
      .map((c) => {
        return translate(c).sup;
      })
      .join("");
  } else {
    return `^${val}`;
  }
}

/**
 * <p>Condenses the array of prime factors of a whole number,
 * so that each factor appears just once,
 * in the format prime<sup>nth<sub>power</sub></sup>.</p>
 *
 * e.g., node factorize.mjs 173248246132375748867198458668657948626531982421875
 * <ul>
 *   <li>['3²⁴', '5¹⁴', '7³³', '13'] (unicode translation table)</li>
 *   <li>['3<sup>24</sup>', '5<sup>14</sup>', '7<sup>33</sup>', '13'] (html)</li>
 *   <li>['3^24', '5^14', '7^33', '13'] (None)</li>
 * </ul>
 *
 * @param {Array<Number|BigInt>} lst an array with the prime factors of a whole number.
 * @returns {String[]} a condensed array.
 */
function condense(lst) {
  let prime = null;
  let count = 0;
  const list = [];
  let neg = false;

  for (const x of lst) {
    if (x < 0) {
      // skip negative factors
      neg = true;
      continue;
    }
    if (x == prime) {
      count += 1;
    } else {
      if (prime) {
        list.push(prime.toString());
        if (count > 1) {
          list[list.length - 1] += exponent(count.toString());
        }
      }
      prime = x;
      count = 1;
    }
  }
  if (count) list.push(prime.toString());
  if (count > 1) {
    list[list.length - 1] += exponent(count.toString());
  }
  if (neg) list.unshift(-1);
  return list;
}

/**
 * Print on the console the returned value of some functions.
 */
export function test() {
  console.log(
    `BigInt(2305843009213693951).isqrt() = ${BigInt(
      2305843009213693951,
    ).isqrt()}`,
  );
  console.log(
    `factorization(BigInt(2305843009213693951)) = ${factorization(
      BigInt(2305843009213693951),
    )}`,
  );
  console.log(`sieve(BigInt(256)) = ${sieve(BigInt(256))}`);
}
