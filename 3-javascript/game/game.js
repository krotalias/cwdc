/**
 * @file
 *
 * Summary.
 * <p>A small platform game.</p>
 *
 * @author Paulo Roma
 * @since 02/08/2021
 *
 * @see https://techsparx.com/nodejs/esnext/dynamic-import-2.html
 * @see https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663
 * @see https://nodejs.org/api/modules.html#modules_module_exports
 */

const readlineSync = require("readline-sync");

const levels = require("./code/levels.js");

var ind,
  argv = process.argv;
if (argv.length > 2) {
  ind = Math.min(argv[2], global.GAME_LEVELS.length - 1);
} else {
  ind = readlineSync.question("Level index? ") || 1;
}

let plan = global.GAME_LEVELS[ind];

let rows = plan
  .trim()
  .split("\n")
  .map((l) => [...l]); // spread operator

console.log(plan.trim().split("\n"));

console.log(rows);
console.log(`height = ${rows.length}`);
console.log(`width = ${rows[0].length}`);

let Player = Object();
let Coin = Object();
let Lava = Object();

var levelChars = {
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
