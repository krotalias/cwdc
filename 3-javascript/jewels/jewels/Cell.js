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
export class cell {
  /** Constructs a Cell with the given row, column, and Icon.
   *  The previous row is the same as the given row.
   *
   *  @param {Number} row row for this cell.
   *  @param {Number} col column for this cell.
   *  @param {Icon} icon the Icon in this cell.
   */
  constructor(row, col, icon) {
    /**
     * Row for this cell.
     * @type {Number}
     */
    this.__row = row;

    /**
     * Column for this cell.
     * @type {Number}
     */
    this.__col = col;

    /**
     * Icon in this cell.
     * @type {Icon}
     */
    this.__icon = icon;

    /**
     * Previous row for this cell, if applicable.
     * @type {Number}
     */
    this.__previousRow = row;
  }

  /** Returns the previous row for this cell.
   *  @return {Number}
   *    previous row for this cell
   */
  getPreviousRow() {
    return this.__previousRow;
  }

  /** Sets the previous row for this cell.
   *  @param {Number} row
   *    previous row for this cell
   */
  previousRow(row) {
    this.__previousRow = row;
  }

  /** Returns the Icon in this cell.
   *  @return {Number}
   *    the Icon in this cell
   */
  getIcon() {
    return this.__icon;
  }

  /** Returns the row of this cell
   *  @return {Number}
   *    row of this cell
   */
  row() {
    return this.__row;
  }

  /** Returns the column of this cell
   *  @return {Number}
   *    column of this cell
   */
  col() {
    return this.__col;
  }

  /** Determines whether this cell has the same position
   *  as a given cell.
   *  @param {cell} other
   *    the cell to compare with this one
   *  @return {Boolean}
   *    True if the given cell has the same row and column
   *    as this one
   */
  samePosition(other) {
    return this.__row == other.__row && this.__col == other.__col;
  }

  /** Determines whether this cell is adjacent by row or column
   * to a given cell.
   * @param {cell} other
   *   the cell to test with this one.
   * @return {Boolean}
   *   True if the given cell is adjacent to this one.
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
   *  @return {Boolean} true if cell is in grid.
   */
  inGrid(w, h) {
    return (
      this.row() >= 0 && this.row() < h && this.col() >= 0 && this.col() < w
    );
  }

  /** Return whether two cells have the same content.
   *
   *  @param {cell} other cell to test with this one.
   *  @return {Boolean} True if this cell is at the same position
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
   * @return {String} this cell representation.
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
