/** @file
 *
 *  Summary.
 *  <p>Game implementation.</p>
 *
 *  Description.
 *  <p>Concrete implementation of the IGame interface.</p>
 *
 *  @author Paulo Roma
 *  @see <a href="/cwdc/3-javascript/jewels/GameImpl.js">source</a>
 *  @since 10/03/2021
 */

import { BasicGenerator } from "./BasicGenerator.js";
import { Cell } from "./Cell.js";

import { IGame } from "./IGame.js";

/**
 * Concrete implementation of the {@link IGame IGame} interface. This implementation
 * has the following behavior:
 * <ul>
 *    <li> Moves are allowed via the {@link GameImpl#select select()} method for pairs of adjacent cells
 *         only. The cells must have different types. The move must create
 *         at least one run.
 *    <li> A run is defined to be three or more adjacent cells of the same
 *         type, horizontally or vertically. A given cell may be part
 *         of a horizontal run or a vertical run at the same time.
 *    <li> Points are awarded for runs based on their length. A run of length
 *         3 is awarded {@link GameImpl#BASE_SCORE BASE_SCORE} points, and a run of length (3 + n)
 *         points gets BASE_SCORE &times 2<sup>n</sup>.
 * </ul>
 * @implements {IGame}
 */
export class GameImpl extends IGame {
  /**
   * Constructs a game with the given Number of columns and rows
   * that will use the given {@link IGenerator} instance
   * to create new icons.
   *
   * @param {Number} width Number of columns.
   * @param {Number} height Number of rows.
   * @param {BasicGenerator} generator generator for new icons.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from Array.from()}
   */
  constructor(width, height, generator) {
    super();

    // To avoid in Safari:
    // SyntaxError: Unexpected token '='. Expected an opening '(' before a method's parameter list.

    /**
     * Score awarded for a three-cell run.
     * @type {Number}
     */
    this.BASE_SCORE = 10;

    /**
     * Turn debugging on or off.
     * @type {Boolean}
     */
    this.DEBUG = false;

    /**
     * Number of columns.
     * @private
     * @type {Number}
     */
    this._width = width;

    /**
     * Number of rows.
     * @private
     * @type {Number}
     */
    this._height = height;

    /**
     * The grid of icons for this game.
     * @private
     * @type {Array<Number>}
     */
    this._grid = new Array(height);

    for (let i = 0; i < height; ++i) {
      this._grid[i] = Array.from({ length: width }, () => null);
    }

    /**
     * Icon generator.
     * @private
     * @type {BasicGenerator}
     */
    this._generator = generator;

    /** Initialize the grid. */
    generator.initialize(this._grid);

    /**
     * Current score of the game.
     * @private
     * @type {Number}
     */
    this._score = 0;

    while (this.findRuns(false).length > 0) {
      this.removeAllRuns();
    }

    // Reset score.
    this._score = 0;
  }

  /** Remove all runs from the grid. */
  removeAllRuns() {
    const c = [];
    const rem = this.findRuns(true);
    c.push(rem);
    if (rem.length > 0) {
      let a = [];
      let b = [];
      for (let i = 0; i < this.getWidth(); i++) {
        a = a.concat(this.collapseColumn(i));
        b = b.concat(this.fillColumn(i));
      }
      c.push(a);
      c.push(b);
    }
    if (this.getDebug()) {
      console.log(`Cells = ${this.toString(c)}`);
      console.log("Score = %d", this._score);
    }
    return c;
  }

  /** Get the debugging state.
   *  @return {Boolean} debugging state.
   */
  getDebug() {
    return this.DEBUG;
  }

  /** Set the debugging state.
   *  @param {Boolean} debugging state.
   */
  setDebug(deb) {
    this.DEBUG = deb;
  }

  /** Returns the Icon at the given location in the game grid.
   *
   *  @param {Number} row row in the grid.
   *  @param {Number} col column in the grid.
   *  @return {Icon} Icon at the given row and column
   */
  getIcon(row, col) {
    return this._grid[row][col];
  }

  /** Sets the Icon at the given location in the game grid.
   *
   *  @param {Number} row row in the grid.
   *  @param {Number} col column in the grid.
   *  @param {Icon} icon to be set in (row,col).
   */
  setIcon(row, col, icon) {
    return (this._grid[row][col] = icon);
  }

  /** Returns the Number of columns in the game grid.
   *
   *  @return {Number} the width of the grid.
   */
  getWidth() {
    return this._width;
  }

  /**
   * <p>Returns the Number of rows in the game grid.</p>
   *
   * @return {Number} the height of the grid.
   */
  getHeight() {
    return this._height;
  }

  /** Returns the current score.
   *
   * @return {Number} current score for the game.
   */
  getScore() {
    return this._score;
  }

  /** Swap the icons contained in two cells.
   *
   *  @param {Array<Cell>} cells array with two cells.
   *  @see swapIcons (i, j, k, l)
   */
  swapCells(cells) {
    this.swapIcons(
      cells[0].row(),
      cells[0].col(),
      cells[1].row(),
      cells[1].col(),
    );
  }

  /** Swap the positions of two icons.
   *
   *  @param {Number} (i,j) first icon.
   *  @param {Number} (k,l) second icon.
   */
  swapIcons(i, j, k, l) {
    [this._grid[i][j], this._grid[k][l]] = [this._grid[k][l], this._grid[i][j]];
  }

  /**
   * <p>In this implementation, the only possible move is a swap
   * of two adjacent cells.</p>
   *
   * In order for move to be made, the
   * following must be True:
   * <ul>
   *   <li>The given array has length 2
   *   <li>The two given cell positions must be adjacent
   *   <li>The two given cell positions must have different icon types
   *   <li>Swapping the two icons must result in at least one run.
   * </ul>
   * If the conditions above are satisfied, the icons for the two
   * positions are exchanged and the method returns True.<br>
   * Otherwise, the method returns False.
   * No other aspects of the game state are modified.
   *
   * @param {Array<Cell>} cells cells to select.
   * @return {Boolean} True if the selected cells were modified, False otherwise.
   */
  select(cells) {
    if (this.getDebug()) {
      console.log("select");
      console.log("Cell 0 = %s", cells[0].toString());
      console.log("Cell 1 = %s", cells[1].toString());
    }

    let validSelection =
      cells.length == 2 && // check if there are two cells in "cells"
      cells[0].isAdjacent(cells[1]) && // verify if they are adjacent
      !cells[0].getIcon().equal(cells[1].getIcon()) && // verify if the icons are different
      cells[0].inGrid(this.getWidth(), this.getHeight()) && // are the cells in the grid?
      cells[1].inGrid(this.getWidth(), this.getHeight());

    if (validSelection) {
      this.swapCells(cells); // change the location of the given cells
      if (this.findRuns(false).length == 0) {
        // verify if swapping them creates any run in the grid
        this.swapCells(cells); // swap them back
        validSelection = false;
      }
    }

    return validSelection;
  }

  /**
   * <p>Returns a list of all cells forming part of a vertical or horizontal run.</p>
   * The list is in no particular order and may contain duplicates.
   * If the argument is False, no modification is made to the game state;
   * if the argument is True, grid locations for all cells in the list are
   * nulled, and the score is updated.
   *
   * @param {Boolean} doMarkAndUpdateScore if False, game state is not modified.
   * @return {Array<Cell>} list of all cells forming runs, in the form:
   * [c_1, c_2, c_3,...], where c_i = Cell(row_i, col_i, iconType_i)
   */
  findRuns(doMarkAndUpdateScore) {
    const c = [];
    // Keeps runs by size, e.g., runs[4] holds the Number of runs of size 4.
    const runs = Array(Math.max(this.getWidth(), this.getHeight()) + 1).fill(0);

    // Get runs on a row or column.
    function getRuns(w, h, gIcon, nCell) {
      for (let i = 0; i < h; ++i) {
        let j = 0;
        while (j < w - 2) {
          if (
            gIcon(i, j).equal(gIcon(i, j + 1)) &&
            gIcon(i, j).equal(gIcon(i, j + 2))
          ) {
            let run_size = 0;
            while (j < w - 1 && gIcon(i, j).equal(gIcon(i, j + 1))) {
              c.push(nCell(i, j, gIcon(i, j)));
              j += 1;
              run_size += 1;
            }
            c.push(nCell(i, j, gIcon(i, j)));
            run_size += 1;
            runs[run_size] += 1;
          } else {
            j += 1;
          }
        }
      }
    }

    // Creates a new function that, when called, has its 'this' keyword set to the provided value.
    const gIcon = this.getIcon.bind(this);
    // find runs on a row
    getRuns(
      this.getWidth(),
      this.getHeight(),
      gIcon,
      (i, j, k) => new Cell(i, j, k),
    );
    // find runs on a column - transpose
    getRuns(
      this.getHeight(),
      this.getWidth(),
      (i, j) => gIcon(j, i),
      (i, j, k) => new Cell(j, i, k),
    );

    if (doMarkAndUpdateScore) {
      c.forEach((cell) => this.setIcon(cell.row(), cell.col(), null));

      //
      // Points are awarded for runs based on their length.
      // A run of length 3 is awarded BASE_SCORE points, and
      // a run of length (3 + n) points gets BASE_SCORE times 2 to the power n.
      //
      for (let i = 3; i < runs.length; ++i) {
        if (runs[i] > 0) {
          this._score += this.BASE_SCORE * Math.pow(2, i - 3) * runs[i];
        }
      }
    }

    if (this.getDebug() && c.length > 0) {
      console.log("\nfindRuns %s", doMarkAndUpdateScore);
      console.log("Cells = " + this.toString(c));
      console.log("Grid = \n%s", this.str());
      console.log("Score = %d", this._score);
      console.log("Runs = " + this.toString(runs));
    }

    return c;
  }

  /**
   * <p>Removes an element at index pos, in a given column col, from the grid.</p>
   * All elements above the given position are shifted down, and the first
   * cell of the column is set to null.
   *
   * @param {Number} pos the position at which the element should be removed.
   * @param {Number} col column of pos.
   */
  removeAndShiftUp(pos, col) {
    // for each row above the given position
    for (let i = pos; i > 0; i--) {
      this.setIcon(i, col, this.getIcon(i - 1, col));
    }
    this.setIcon(0, col, null);
  }

  /** Collapses the icons in the given column of the current game grid
   *  such that all null positions, if any, are at the top of the column
   *  and non-null icons are moved toward the bottom (i.e., as if by gravity).
   *  The returned list contains Cells representing icons that were moved
   *  (if any) in their new locations. Moreover, each Cell's previousRow property
   *  returns the original location of the icon. The list is in no particular order.
   *
   *  @param {Number} col column to be collapsed.
   *  @return {Array<Cell>} list of cells for moved icons, in the form:
   *  [c_1, c_2, c_3,...], where c_i = Cell(row_i, col_i, iconType_i)
   */
  collapseColumn(col) {
    const c = [];

    let n = 1;
    let i = 0;
    while (n > 0 && i < this.getHeight()) {
      n = 0; // Number of nulls (found) below each icon
      for (let row = i + 1; row < this.getHeight(); ++row) {
        if (this.getIcon(row, col) == null) {
          n += 1;
        }
      }
      if (n > 0 && this.getIcon(i, col) != null) {
        // the icon goes down the Number of nulls found below it
        const cell = new Cell(i + n, col, this.getIcon(i, col)); // new icon position
        cell.previousRow(i); // previous row
        c.push(cell);
      }
      i += 1;
    }

    i = 0;
    let removed = true;
    while (removed) {
      removed = false;
      for (let k = i; k < this.getHeight(); ++k) {
        if (this.getIcon(k, col) == null) {
          this.removeAndShiftUp(k, col);
          removed = true;
          break;
        }
      }
      i += 1;
    }

    if (this.getDebug() && c.length > 0) {
      console.log("\ncollapseColumn %s", col);
      console.log("Cells = " + this.toString(c));
      console.log("Grid = \n%s", this.str());
    }
    return c;
  }

  /** An alternative version.
   *
   *  @param {Number} col column to be collapsed.
   *  @return {Array<Cell>} list of cells for moved icons, in the form:
   *  [c_1, c_2, c_3,...], where c_i = Cell(row_i, col_i, iconType_i)
   */
  collapseColumn2(col) {
    // Array that contains all the changed cells.
    const c = [];

    // Get the last column index.
    let i = this.getHeight() - 1;

    // Holds how many cells were removed to shift down the cells above it.
    let j = 0;

    // Check i >= j, because every cell from 0 to j is null (the ones on the top).
    // As such, there is no need to proceed.
    while (i >= j) {
      // if the cell is not null
      if (this.getIcon(i, col) != null) {
        // create a changed cell, that was moved "j" rows
        const a = new Cell(i, col, this.getIcon(i, col));
        a.previousRow(i - j);
        // check if a was moved, if so, add it to "c"
        if (a.row() != a.getPreviousRow()) {
          c.push(a);
        }

        // move one position up in the column and continue
        i -= 1;
        continue;
      }
      // If it is not on the first row,
      // call "removeAndShiftUp", so the null cell goes to the top.
      if (i != 0) {
        this.removeAndShiftUp(i, col);
      }
      // Increase j, if the cell was null.
      const a = new Cell(j, col, null);
      c.push(a);
      j += 1;
    }
    return c;
  }

  /**
   * <p>Fills the null locations (if any) at the top of the given column in the current game grid.</p>
   * The returned list contains Cells representing new icons added to this column in their new locations.
   * The list is in no particular order
   *
   * @param {Number} col column to be filled.
   * @return {Array<Cell>} list of new cells for icons added to the column, in the form:
   * [c_1, c_2, c_3,...], where c_i = Cell(row_i, col_i, iconType_i)
   */
  fillColumn(col) {
    /** variable that contains all changed cells */
    const c = [];

    let n = 0;

    // for each row in column
    for (let i = this.getHeight() - 1; i >= 0; --i) {
      // check if the icon is null, if so, generate a new random icon to fill the position
      if (this.getIcon(i, col) == null) {
        let icon = this._generator.generate();
        this.setIcon(i, col, icon);
        const a = new Cell(i, col, icon);
        a.previousRow(--n);
        c.push(a);
      }
    }

    if (this.getDebug() && c.length > 0) {
      console.log("\nfillColumn %s", col);
      console.log("Cells = " + this.toString(c));
      console.log("Grid = \n%s", this.str());
    }

    return c;
  }

  /**
   * Returns a String representation of the grid for this game,
   * with rows delimited by newlines.
   * @return {String} string representation of the grid.
   */
  str() {
    let sb = "";
    for (let row = 0; row < this.getHeight(); row++) {
      for (let col = 0; col < this.getWidth(); col++) {
        const icon = this.getIcon(row, col);
        if (icon == null) {
          sb += "   *";
        } else {
          sb += "   " + icon.getType().toString();
        }
      }
      sb += "\n";
    }
    return sb;
  }

  /**
   * Return a string representation of the grid using symbols:
   *  -  0123456789
   *  - '!@+#$%*.&='
   * @return {String} string representaion of the grid.
   */
  repr() {
    let sb = "";
    const w = this.getWidth();
    const h = this.getHeight();
    function n(i) {
      const n = `${i.toString()} `;
      return i > 9 ? n : "0" + n;
    }
    for (let i = 0; i < w; ++i) {
      sb = sb.concat(w > 10 ? n(i) : i.toString() + " ");
    }
    sb += "   \n\n";
    const symbols = "!@+#$%*.&=";
    const separator = w > 10 ? "  " : " ";
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const icon = this.getIcon(row, col);
        if (icon)
          sb +=
            symbols[
              icon.getType() %
                Math.min(symbols.length, this._generator.getJewelTypes())
            ] + separator;
      }
      sb += "  " + row.toString() + "\n";
    }
    return sb;
  }

  /** Returns a String representation of a List of cells.
   *
   *  @param {Array<Cell>} lcells given list.
   *  @return {String} string with cells.
   */
  toString(lcells) {
    let s = "";
    lcells.forEach((c) => {
      s += c.toString() + " ";
    });

    if (lcells.length == 0) {
      s += "\n";
    }
    return s;
  }
}
