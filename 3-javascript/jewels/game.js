/** @file
 *
 * Javascript API for animating a Bejeweled game.
 *
 * @author Daniel Vieira
 * @since 10/03/2021
 *
 * @see https://thebayerl.github.io/DesWeb/trab4/game.html
 * @see <a href="/cwdc/3-javascript/jewels/game.html?height=10&width=10&debug">link</a>
 * @see <a href="/cwdc/3-javascript/jewels/game.js">source</a>
 * @see <img src="../jewels/jewels.png" width="512">
 */

import { GameImpl } from "./GameImpl.js";
import { cell } from "./Cell.js";
import { BasicGenerator } from "./BasicGenerator.js";

/**
 * Colors of the gems.
 * @type {Array<String>}
 */
var colors = [
  "rgb(255,0,0)",
  "rgb(0,255,0)",
  "rgb(0,0,255)",
  "rgb(255,255,255)",
  "rgb(120,120,120)",
  "rgb(0,0,0)",
];
/**
 * Images for the jewels (gems).
 * @type {Array<String>}
 */
var img = [
  "url(gemas/red.png)",
  "url(gemas/blue.png)",
  "url(gemas/green.png)",
  "url(gemas/yellow.png)",
  "url(gemas/purple.png)",
];

/**
 * The matrix of icons.
 * @type {Array<Array<cell>>}
 */
var grid = [];

/**
 * Number of columns.
 * @type {Number}
 */

var width = 10;
/**
 * Number of rows.
 * @type {Number}
 */

var height = 10;
/**
 * Number of icons.
 * @type {Number}
 */
var nico = 5;

/**
 * Icon generator.
 * @type {BasicGenerator}
 */
var gen = null;

/**
 * The game.
 * @type {GameImpl}
 */
var game = null;

/**
 * When clicked cells should swap positions.
 * @type {Boolean}
 */
var clicked = false;

/**
 * List of cells for keeping track of icon movements.
 * @type {Array<cell>}
 */
var cells = [];

/**
 * The board element that includes all cells.
 * @type {HTMLElement}
 */
var bd = document.getElementById("bd");
bd.style.cssText = "width:" + 1300 + "px; height:" + 470 + "px;";

/** Create an Icon on the screen.
 *  @param {Number} i row.
 *  @param {Number} j column.
 *  @return {Icon} the new icon created at position (i,j).
 */
function createSquare(i, j) {
  var color;
  var image = "";

  // get the color
  color = colors[game.getIcon(i, j).getType() % colors.length];
  image = img[game.getIcon(i, j).getType() % img.length];

  // create the cell in this position
  grid[i][j] = new cell(i, j, game.getIcon(i, j));

  /** create the element to represent the icon and apply some styles */
  var symbol = document.createElement("div");
  symbol.onclick = function () {
    var col = this.style.left;
    col = parseInt(col.substring(0, col.length - 2));
    col = col / 50;
    var row = this.style.top;
    row = parseInt(row.substring(0, row.length - 2));
    row = row / 50;

    if (!clicked) {
      var _cell = new cell(i, col, game.getIcon(row, col));
      cells = [_cell];
      clicked = true;
    } else {
      var _cell = new cell(i, col, game.getIcon(row, col));
      swap(cells[0], _cell);
      cells = [];
      clicked = false;
    }
  };
  symbol.classList.add("shape");
  symbol.style.cssText = `width:${50}px;
    height:${50}px;
    top:${i * 50}px;
    left:${j * 50}px;
    background-color:;
    display: block;
    background-image: ${image};`;
  return symbol;
}

/** Moves one element to another position.
 *  @param {HTMLElement} element an html node holding an icon.
 *  @param {Number} dest new top position.
 */
function move(element, dest) {
  // get the current position and remove the "px" in the end
  var pos = element.style.top;
  pos = parseInt(pos.substring(0, pos.length - 2));
  var id = setInterval(frame, 0.5);

  // move the element to the position
  function frame() {
    if (pos >= dest) {
      clearInterval(id);
    } else {
      pos++;
      element.style.top = pos + "px";
    }
  }
}

/** Swap positions of two elements.
 *  @param {HTMLElement} element1 first element.
 *  @param {HTMLElement} element2 second element.
 */
function move_swp(element1, element2) {
  // get the current position of elements
  var pos1 = element.style.left;
  pos1 = parseInt(pos1.substring(0, pos1.length - 2));
  var pos2 = element.style.left;
  pos2 = parseInt(pos2.substring(0, pos2.length - 2));

  // move both elements together
  var id = setInterval(frame, 1);
  function frame() {
    if (pos >= dest) {
      clearInterval(id);
    } else {
      pos1++;
      pos2--;
      element1.style.left = pos1 + "px";
      element2.style.left = pos2 + "px";
    }
  }
}

/** Returns the position of a given cell.
 *  @param {cell} cell given cell.
 *  @return {Number} position in pixels.
 */
function cellPos(cell) {
  return cell.row() * width + cell.col();
}

/** Clear cells in a given list.
 *  @param {Array<cell>} list array of cells.
 */
async function destroy(changed) {
  var c = bg.childNodes;
  // just set the display to none
  for (let i = 0; i < changed.length; i++) {
    var cell = changed[i];
    // disappear(c[cellPos(cell)]);
    c[cellPos(cell)].style.display = "none";
  }
  if (game.getDebug()) console.log("finish destroy");
}

/** Drop a list of cells.
 *  @param {Array<cell>} changed list of cells.
 */
function drop(changed) {
  var c = bg.childNodes;

  // set the position to the start of movement and calls the move function
  for (let i = 0; i < changed.length; i++) {
    var cell = changed[i];
    if (cell.row() != cell.getPreviousRow()) {
      var cell = changed[i];
      var elem = c[cellPos(cell)];
      elem.style.backgroundImage = img[cell.getIcon().getType()];
      elem.style.top = cell.getPreviousRow() * 50 + "px";
      elem.style.display = "block";
      move(elem, cell.row() * 50);
    } else {
      c[cellPos(cell)].style.display = "none";
    }
  }
  if (game.getDebug()) console.log("finish drop");
}

/** Fill the grid based on a given list of cells.
 *  @param {Array<cell>} changed list of cells.
 */
async function fill(changed) {
  var c = bg.childNodes;

  // set the start position and calls move function
  for (let i = 0; i < changed.length; i++) {
    var cell = changed[i];
    var elem = c[cellPos(cell)];
    elem.style.backgroundImage = img[cell.getIcon().getType()];
    elem.style.top = cell.getPreviousRow() * 50 + "px";
    elem.style.display = "block";
    elem.style.zIndex = -2;
    move(elem, cell.row() * 50);
  }
  if (game.getDebug()) console.log("finish fill");
}

/**
 * Sleep is used to wait a certain time interval before resuming a task.
 * @param {Number} ms time interval in milliseconds.
 * @return {Promise<Number>} promise to be resolved after ms milliseconds.
 * @see https://www.geeksforgeeks.org/how-to-wrap-settimeout-method-in-a-promise/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Swap two icons.
 *  @param {Number} (i,j) first icon.
 *  @param {Number} (k,l) second icon.
 *  @param {Boolean} uns whether to set a background image for the icons.
 */
function swap_pos(i, j, k, l, uns) {
  var c = bg.childNodes;
  var iconA = game.getIcon(i, j);
  var iconB = game.getIcon(k, l);
  var A = c[i * width + j];
  var B = c[k * width + l];

  A.style.backgroundImage = img[game.getIcon(i, j).getType()];
  B.style.backgroundImage = img[game.getIcon(k, l).getType()];

  if (uns) {
    A.style.backgroundImage = img[game.getIcon(k, l).getType()];
    B.style.backgroundImage = img[game.getIcon(i, j).getType()];
  }

  if (i == k) {
    var a = 1;
    var b = -1;
    A.style.left = l * 50 + "px";
    B.style.left = j * 50 + "px";
    if (j < l) {
      a = -1;
      b = 1;
    }
    var posA = A.style.left;
    posA = parseInt(posA.substring(0, posA.length - 2));
    var posB = B.style.left;
    posB = parseInt(posB.substring(0, posB.length - 2));

    var id = setInterval(frame, 1);
    function frame() {
      if (posA == j * 50) {
        clearInterval(id);
      } else {
        posA += a;
        posB += b;
        A.style.left = posA + "px";
        B.style.left = posB + "px";
      }
    }
  } else {
    var a = 1;
    var b = -1;
    A.style.top = k * 50 + "px";
    B.style.top = i * 50 + "px";

    if (i < k) {
      a = -1;
      b = 1;
    }

    var posA = A.style.top;
    posA = parseInt(posA.substring(0, posA.length - 2));
    var posB = B.style.top;
    posB = parseInt(posB.substring(0, posB.length - 2));

    var id = setInterval(frame, 1);
    function frame() {
      if (posA == i * 50) {
        clearInterval(id);
      } else {
        posA += a;
        posB += b;
        A.style.top = posA + "px";
        B.style.top = posB + "px";
      }
    }
  }
}

/**
 * Swap two cells.
 * @param {cell} cellA first cell.
 * @param {cell} cellB second cell.
 * @return {Number} 0 if the cells are not adjacent.
 */
async function swap(cellA, cellB) {
  // get the cell coords
  var i = cellA.row();
  var j = cellA.col();
  var k = cellB.row();
  var l = cellB.col();

  // get the changed cells
  var changed = [];

  // do not try the change if they are not adjacent
  if (!cellA.isAdjacent(cellB)) {
    return 0;
  }

  // use only the icons that appear on the grid, and the player do not swap other icons during the animations
  bg.style.zIndex = "-1";

  // change the cells location
  swap_pos(i, j, k, l, true);

  // check if this move creates any run
  var cond = game.select([grid[i][j], grid[k][l]]);

  await sleep(500);

  if (cond) {
    // if true, destroy, drop and fill the icons based on changed returned from remove all runs
    while (game.findRuns(false).length > 0) {
      changed = game.removeAllRuns();
      if (game.getDebug()) console.log(game.toString(changed));
      destroy(changed[0]);
      await sleep(1000);
      drop(changed[1]);
      // await sleep(500);
      fill(changed[2]);
      await sleep(1000);
      refresh();
    }
  } else {
    // swap back positions if no run was created
    swap_pos(i, j, k, l, false);
    await sleep(500);
  }
  refresh();
  // reset index to let the player click and swap the next icons
  bg.style.zIndex = "0";
}

/** Refresh the screen based on the grid of the game. */
function refresh() {
  //clear all the icons
  document.getElementById("bg").innerHTML = "";
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      //create new icons based on the game grid
      document.getElementById("bg").appendChild(createSquare(i, j));
    }
  }
  // refresh the score board
  document.getElementById("score").innerHTML = game.getScore();
}

/** Restart the game.
 *  Create a new generator and game.
 */
function reset() {
  gen = new BasicGenerator(nico);
  game = new GameImpl(width, height, gen);
  refresh();
}

/** Get URL Parameters using jQuery.
 *
 *  <p>Parses a list of parameters of the form: </p>
 *  - url?param1=val1&#38;param2=val2&#38;param3=val3 ...
 *
 *  @param {String} sParam parameter name.
 *  @return {String} parameter value associated to parameter name, or false, if no parameter with the given name was found.
 *
 *  @see https://www.learningjquery.com/2012/06/get-url-parameters-using-jquery
 */
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return typeof sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
};

/** Game panel interface. */
export function gamePanel() {
  /** Reset button */
  var resetbt = document.getElementById("resetbt");
  resetbt.addEventListener("click", reset);

  // start a new game

  let w = getUrlParameter("width");
  let h = getUrlParameter("height");
  let d = getUrlParameter("debug");

  if (w && h) {
    document.documentElement.style.setProperty("--nrow", h);
    document.documentElement.style.setProperty("--ncol", w);
  }

  height = getComputedStyle(document.documentElement).getPropertyValue(
    "--nrow"
  );
  width = getComputedStyle(document.documentElement).getPropertyValue("--ncol");
  nico = getComputedStyle(document.documentElement).getPropertyValue("--nico");

  // grid to simulate the game
  for (var i = 0; i < height; i++) {
    grid[i] = [];
    for (var j = 0; j < width; j++) {
      grid[i][j] = null;
    }
  }

  reset();
  game.setDebug(d);
}
gamePanel();
