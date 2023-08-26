/** @file
 *
 *  Summary.
 *  <p>IGame Interface.</p>
 *
 *  Description.
 *  <p>Interface specifying the API for the logic of a Bejeweled-like matching game.</p>
 *
 *  @author Paulo Roma
 *  @see <a href="/cwdc/3-javascript/jewels/IGame.js">source</a>
 *  @since 10/03/2021
 */

/**
 * Interface specifying the API for the logic of a Bejeweled-like matching game.
 * @interface
 */
export class IGame {
  constructor() {
    if (this.constructor === IGame) {
      throw new TypeError(
        'Abstract class "IGame" cannot be instantiated directly.'
      );
    }
  }

  /** Returns the Icon at the given location in the game grid.
   *  @param {Number} row
   *   row in the grid
   *  @param {Number} col
   *   column in the grid
   *  @return {Icon}
   *   Icon at the given row and column
   */
  getIcon(row, col) {
    throw new Error("You have to implement the method getIcon!");
  }

  /** Sets the Icon at the given location in the game grid.
   * (Note: this method is intended for testing and is not
   * normally used for game play.)
   * @param {Number} row
   *   row in the grid
   * @param {Number} col
   *   column in the grid
   * @param {Icon} icon
   *   icon to be used.
   */
  setIcon(row, col, icon) {
    throw new Error("You have to implement the method setIcon!");
  }

  /** Returns the number of columns in the game grid.
   *  @return {Number} the width of the grid.
   */
  getWidth() {
    throw new Error("You have to implement the method getWidth!");
  }

  /** Returns the number of rows in the game grid.
   *  @return {Number} the height of the grid.
   */
  getHeight() {
    throw new Error("You have to implement the method getHeight!");
  }

  /** Returns the current score.
   *  @return {Number}
   *    current score for the game
   */
  getScore() {
    throw new Error("You have to implement the method getScore!");
  }

  /** Selects a group of cells for a move (such as a swapping two cells).
   *  If the move can be made, no modification is made to the game state
   *  other than to update the selected cells. If the move cannot be made,
   *  the game state is not modified.
   *  @param {Array<cell>} cells
   *    cells to select
   *  @return {Boolean}
   *    true if the selected cells were modified, false otherwise
   */
  select(cells) {
    throw new Error("You have to implement the method select!");
  }

  /** Returns a list of all cells forming part of a vertical or horizontal
   *  run.  The list is in no particular order and may contain duplicates.
   *  If the argument is false, no modification is made to the game
   *  state if the argument is true, grid locations for all cells in the
   *  list are nulled and the score is updated.
   *  @param {Boolean} doMarkAndUpdateScore
   *    if false, game state is not modified
   *  @return {Array<cell>}
   *    list of all cells forming runs
   */
  findRuns(doMarkAndUpdateScore) {
    throw new Error("You have to implement the method findRuns!");
  }

  /** Collapses the icons in the given column of the current game grid such
   *  that all null positions, if any, are at the top of the column
   *  and non-null icons are moved toward the bottom (i.e., as if by gravity).
   *  The returned list contains Cells representing icons that were moved (if any)
   *  in their new locations. Moreover, each Cell's previousRow
   *  property returns the original location of the icon.  The list is
   *  in no particular order.
   *  @param {Number} col
   *    column to be collapsed
   *  @return {Array<cell>}
   *    list of cells for moved icons
   */
  collapseColumn(col) {
    throw new Error("You have to implement the method collapseColumn!");
  }

  /** Fills the null locations (if any) at the top of the given column in the
   *  current game grid.  The returned list contains Cells representing new
   *  icons added to this column in their new locations.  The list is
   *  in no particular order.
   *
   *  @param {Number} col
   *    column to be filled
   *  @return {Array<cell>}
   *    list of new cells for icons added to the column
   */
  fillColumn(col) {
    throw new Error("You have to implement the method fillColumn!");
  }
}
