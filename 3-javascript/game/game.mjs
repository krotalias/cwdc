/**
 * @file
 *
 * Summary.
 * <p>A small platform game.</p>
 *
 * @author Paulo Roma
 * @since 02/08/2021
 *
 * @see {@link https://techsparx.com/nodejs/esnext/dynamic-import-2.html Using Dynamic import in Node.js}
 * @see {@link https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663 Announcing core Node.js support for ECMAScript modules}
 * @see {@link https://nodejs.org/api/modules.html#modules_module_exports module.exports}
 */

import * as readlineSync from "readline-sync";

import GAME_LEVELS from "./code/levels.mjs";

let ind,
    argv = process.argv;
if (argv.length > 2) {
    ind = Math.min(argv[2], GAME_LEVELS.length - 1);
} else {
    ind = readlineSync.question("Level index? ") || 1;
}

let plan = GAME_LEVELS[ind];

let rows = plan
    .trim()
    .split("\n")
    .map((l) => [...l]); // spread operator

console.log(plan.trim().split("\n"));

console.log(rows);
console.log(`height = ${rows.length}`);
console.log(`width = ${rows[0].length}`);

const Player = Object();
const Coin = Object();
const Lava = Object();

const levelChars = {
    ".": "empty",
    "#": "wall",
    "+": "lava",
    "@": Player,
    o: Coin,
    "=": Lava,
    "|": Lava,
    v: "Lava",
};

/** Background matrix. */
rows = rows.map((row, y) => {
    return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type == "string") return type; // "empty" | "wall" | "lava"
        //this.startActors.push(type.create(new Vec(x, y), ch));  // Player | Coin | Lava
        return "empty";
    });
});

console.log(rows);
