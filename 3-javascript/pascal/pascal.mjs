/**
 * @file
 *
 * Summary.
 * <p>A Pascal triangle generator using yield.</p>
 *
 * <p>To use ES6 modules in nodejs (version ≥ 13):</p>
 * <ol>
 *  <li> file extension should be ".mjs" </li>
 *  <li> add {"type": "module",} to package.json (located in current or parent directory)</li>
 *  <li> should be used ES6 module syntax: import and export </li>
 * </ol>
 *
 * @author Paulo Roma
 * @since 25/07/2021
 *
 * @see https://techsparx.com/nodejs/esnext/dynamic-import-2.html
 * @see https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663
 */

import * as readlineSync from "readline-sync";

import * as pascal from "./pascal.js";

let argv = process.argv;
(function main() {
    let level;
    if (argv.length > 2) {
        level = argv[2] || 20;
        argv = [];
    } else {
        level = readlineSync.question("Enter level: ") || 20;
    }

    if (level > 0) pascal.display(level);

    // keeping asking for values to convert
    main();
})();
