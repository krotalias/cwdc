#!/usr/bin/env node --max-old-space-size=4096
/**
 * @file
 *
 * Summary.
 * <p>Factorize main function for testing.</p>
 *
 * <p>argv:</p>
 * <ol>
 *   <li>argv[0]: node path.</li>
 *   <li>argv[1]: script path.</li>
 *   <li>argv[2]: integer to be factorized.</li>
 * </ol>
 *
 * <pre>
 * Usage:
 *  - npm init
 *  - npm install readline-sync
 *  - node factorize.mjs 345 debug
 *  - node factorize.mjs 2305843009213693951  // 2**61 - 1
 *    2305843009213693951 is bigint
 *    bitLength(2305843009213693951) is 61
 *    factorization(2305843009213693951): 2305843009213693951
 *    factorization: 1:55.438 (m:ss.mmm)
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
 * @since 29/12/2021
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/console/time
 * @see https://dmitripavlutin.com/javascript-defined-variable-checking/
 * @see <a href="/cwdc/3-javascript/bigint/factorize.mjs">source</a>
 */

import * as readlineSync from "readline-sync";

import {
    factorization,
    factorize,
    sieve,
    bitLength,
    decLength,
    isPrime,
    test,
} from "./factorize.js";

(function main(argv) {
    // argv is (not defined) OR (defined AND uninitialized)
    if (typeof argv === "undefined") argv = process.argv;

    test();

    var n,
        debug = false;
    if (argv.length < 3 || argv[2] === "") {
        n = readlineSync.question("An integer argument is needed: ") || 256;
        argv[2] = n;
    } else if (argv.length > 3) {
        debug = argv[3].toLowerCase() == "debug";
    }

    try {
        n = BigInt(argv[2]);
        if (n <= Number.MAX_SAFE_INTEGER) n = Number(argv[2]);
        console.log(`${n} is ${typeof n}`);
        console.log(`bitLength(${n}) is ${bitLength(n)}`);
        console.log(`decLength(${n}) is ${decLength(n)}`);
    } catch (e) {
        console.log("A positive integer is expected.");
        return 1;
    }

    if (debug) {
        console.log(`isPrime(${n}): ${isPrime(n)}`);
        if (typeof n == "number") console.log(`sqrt(${n}): ${Math.sqrt(n)}`);
        console.log(`isqrt(${n}): ${n.isqrt()}`);
        console.log(`bitLength(${n.isqrt()}): ${bitLength(n.isqrt())}`);
        console.log(
            `2**${Math.floor((bitLength(n) + 1) / 2)}: ${
                2 ** Math.floor((bitLength(n) + 1) / 2)
            }`
        );
        console.log(`sieve(${n}): ${sieve(n)}`);
        console.log(`factorize(${n}): ${factorize(n)}`);
    }
    console.time("factorization");
    console.log(`factorization(${n}): ${factorization(n)}`);
    console.timeEnd("factorization");

    argv[2] = readlineSync.question("\nEnter next number to be factorized: ");
    main();

    return 0;
})();
