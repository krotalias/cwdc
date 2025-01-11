/**
 * @file
 *
 * Summary.
 * <p>Bejeweled - A damn cool and awesome game.</p>
 *
 * @author Paulo Roma
 * @since 25/07/2021
 *
 * @see https://techsparx.com/nodejs/esnext/dynamic-import-2.html
 * @see https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663
 * @see <a href="../jewels/cmd-game.mjs">source</a>
 * @see <img src="../jewels/cmd-game2.png" width="512">
 */

import * as readlineSync from "readline-sync";

import * as jewel from "./cmd-game.js";

let nrow, ncol, nico, d;
const argv = process.argv;
if (argv.length > 2) {
  nrow = argv[2] || 8;
  ncol = argv[3] || 8;
  nico = argv[4] || 7;
  d = argv[5] || false;
} else {
  nrow = readlineSync.question("Board height? ") || 8;
  ncol = readlineSync.question("Board length? ") || 8;
  nico = readlineSync.question("Number of icons? ") || 7;
  d = readlineSync.question("Debug? ") || false;
}

console.log(`Board height: ${nrow}`);
console.log(`Board length: ${ncol}`);
console.log(`Number of Icons: ${nico}`);
console.log(`Debugging: ${d}`);

const game = jewel.mainGame(nrow, ncol, nico, d);
while (true) {
  let i = readlineSync.question("row: "); // row
  let j = readlineSync.question("col: "); // column
  const pos = readlineSync.question("move (up, down, right, left): "); // movement
  i = Math.min(Math.max(0, parseInt(i)), nrow - 1);
  j = Math.min(Math.max(0, parseInt(j)), ncol - 1);
  console.log(i, j, pos);
  jewel.gameLoop(game, i, j, pos);
}
