/** @file
 *
 *  Summary.
 *  <p>Cell representation.</p>
 *
 *  Description.
 *  <p>Class that represents a grid position with an icon.</p>
 *  <p>Optionally, it is possible to record a previous row for the icon.</p>
 *
 *  @author Paulo Roma
 *  @see <a href="/cwdc/3-javascript/jewels/cell.js">source</a>
 *  @since 10/03/2021
 */

import { Icon } from "./Icon.js";

/** Class that represents a grid position with an Icon.
 *  Optionally, it is possible to record a previous
 *  row for the icon.
 */
export class Cell {
  /** Constructs a Cell with the given row, column, and Icon.
   *  The previous row is the same as the given row.
   *
   *  @param {Number} row row for this Cell.
   *  @param {Number} col column for this Cell.
   *  @param {Icon} icon the Icon in this Cell.
   */
  constructor(row, col, icon) {
    /**
     * Row for this Cell.
     * @private
     * @type {Number}
     */
    this._row = row;

    /**
     * Column for this Cell.
     * @private
     * @type {Number}
     */
    this._col = col;

    /**
     * Icon in this Cell.
     * @private
     * @type {Icon}
     */
    this._icon = icon;

    /**
     * Previous row for this Cell, if applicable.
     * @private
     * @type {Number}
     */
    this._previousRow = row;
  }

  /**
   * Returns the previous row for this Cell.
   * @return {Number} previous row for this Cell
   */
  getPreviousRow() {
    return this._previousRow;
  }

  /**
   * Sets the previous row for this Cell.
   * @param {Number} row previous row for this Cell
   */
  previousRow(row) {
    this._previousRow = row;
  }

  /**
   * Returns the Icon in this Cell.
   * @return {Number} the Icon in this Cell.
   */
  getIcon() {
    return this._icon;
  }

  /**
   * Returns the row of this Cell
   * @return {Number} row of this Cell.
   */
  row() {
    return this._row;
  }

  /**
   * Returns the column of this Cell
   * @return {Number} column of this Cell.
   */
  col() {
    return this._col;
  }

  /**
   * Determines whether this Cell has the same position
   * as a given Cell.
   * @param {Cell} other the Cell to compare with this one
   * @return {Boolean}
   *    True if the given Cell has the same row and column
   *    as this one
   */
  samePosition(other) {
    return this._row == other._row && this._col == other._col;
  }

  /**
   * Determines whether this Cell is adjacent by row or column
   * to a given Cell.
   * @param {Cell} other the Cell to test with this one.
   * @return {Boolean}
   *   True if the given Cell is adjacent to this one.
   */
  isAdjacent(other) {
    return (
      (this.col() == other.col() && Math.abs(this.row() - other.row()) == 1) ||
      (this.row() == other.row() && Math.abs(this.col() - other.col()) == 1)
    );
  }

  /** Cell in grid testing.
   *
   *  @param {Number} w right limit.
   *  @param {Number} h bottom limit.
   *  @return {Boolean} true if Cell is in grid.
   */
  inGrid(w, h) {
    return (
      this.row() >= 0 && this.row() < h && this.col() >= 0 && this.col() < w
    );
  }

  /** Return whether two Cells have the same content.
   *
   *  @param {Cell} other Cell to test with this one.
   *  @return {Boolean} True if this Cell is at the same position
   *          and has the same icon type of other.
   */
  equal(other) {
    return this.samePosition(other) && this.getIcon().equal(other.getIcon());
  }

  /** Returns a String representation of this Cell in the form:
   * <pre>
   * [(row, column) icon]
   * </pre>
   * if row is the same as the previous row, or
   * <pre>
   * [(row, column) icon (previous row)]
   * </pre>
   * otherwise.
   * @return {String} this Cell representation.
   */
  toString() {
    const icon =
      this.getIcon() == null ? "*" : this.getIcon().getType().toString();
    let stx = "(" + this.row() + "," + this.col() + ") " + icon;
    if (this.row() != this.getPreviousRow()) {
      stx += "(" + this.getPreviousRow() + ")";
    }
    return "[" + stx + "]";
  }
}
