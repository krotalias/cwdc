/**
 *  @file
 *
 *  Summary.
 *  <p>Bejeweled - A damn cool and awesome game.</p>
 *
 *  Description.
 *  <p> Bejeweled is a tile-matching puzzle video game by PopCap Games,
 *  developed for browsers in 2001. </p>
 *
 *  <p>The goal is to clear gems of the same color, potentially causing a chain reaction. </p>
 *
 *  <p>The game sold over 10 million copies and has been downloaded more than 150 million times. </p>
 *
 *  <pre>
 *  Usage:
 *  - npm init
 *  - npm install readline-sync
 *  - node cmd-game.mjs [nrow] [ncol] [nico] [debug]
 *  </pre>
 *
 *  @author Paulo Roma
 *  @since 10/03/2021
 *
 *  @see <a href="/cwdc/3-javascript/jewels/cmd.html?height=7&width=10&debug">link</a>
 *  @see <a href="/cwdc/3-javascript/jewels/cmd-game.js">source</a>
 *  @see <a href="../jewels/cmd-game.mjs">cmd-game in node</a>
 *  @see <img src="../jewels/cmd-game.png" width="512">
 */
import { GameImpl } from "./GameImpl.js";
import { BasicGenerator } from "./BasicGenerator.js";
import { Cell } from "./Cell.js";

/** Display the board and the score.
 *
 *  @param {GameImpl} game the object to work with.
 */
function displayBoard(game) {
  if (typeof document === "undefined") {
    console.log("Score = " + game.getScore());
    console.log(game.repr().replace(/\n/g, "\n"));
  } else {
    document.getElementById("score").innerHTML = "Score = " + game.getScore();
    document.getElementById("board").innerHTML = game
      .repr()
      .replace(/\n/g, "<br />");
  }
}

/** Display a message to the user.
 *
 *  @param {String} message feedback string.
 */
function message(message) {
  if (typeof document === "undefined") {
    console.log(message);
  } else {
    document.getElementById("message").innerHTML = message;
  }
}

/** Keep processing movements.
 *
 *  @param {GameImpl} game the object to work with.
 *  @param {number} row row index.
 *  @param {number} col column index.
 *  @param {boolean} move movement.
 */
export function gameLoop(game, i, j, pos) {
  const w = game.getWidth();
  const h = game.getHeight();

  displayBoard(game);

  if (typeof document !== "undefined") {
    i = document.getElementById("y").value; // row
    j = document.getElementById("x").value; // column
    pos = document.getElementById("move").value;
  }
  let k = 0;
  let l = 0;

  i = Math.min(Math.max(0, i), h - 1);
  j = Math.min(Math.max(0, j), w - 1);
  if (pos == "left" && j > 0) {
    l = j - 1;
    k = i;
  } else if (pos == "up" && i > 0) {
    k = i - 1;
    l = j;
  } else if (pos == "down" && i < h - 1) {
    k = i + 1;
    l = j;
  } else if (pos == "right" && j < w - 1) {
    l = j + 1;
    k = i;
  } else {
    message("Invalid Direction");
  }

  if (
    game.select(
      new Array(
        new Cell(i, j, game.getIcon(i, j)),
        new Cell(k, l, game.getIcon(k, l)),
      ),
    )
  ) {
    do {
      game.removeAllRuns();
    } while (game.findRuns(false).length > 0);

    message("Movement Executed");
  } else {
    message("Invalid Movement");
  }

  displayBoard(game);
}

/** Main function for triggering the game in text mode.
 *  <br>
 *  Creates an object BasicGenerator and an object game.
 *  Also prints the initial board.
 *
 *  @param {Number} nrows number of rows.
 *  @param {Number} ncols number of columns.
 *  @param {Number} nicons number of icons.
 *  @param {Boolean} debug debugging state.
 *  @return {GameImpl} the object game.
 */
export function mainGame(nrows, ncols, nicons, debug) {
  const gen = new BasicGenerator(nicons); // nicons different types
  const game = new GameImpl(ncols, nrows, gen);
  game.setDebug(debug);
  displayBoard(game);
  return game;
}
