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
 *  @author Paulo Roma
 *  @see <a href="/cwdc/3-javascript/jewels/BasicGenerator.js">source</a>
 *  @since 10/03/2021
 */

import { BasicIcon } from "./BasicIcon.js";
import { IGenerator } from "./IGenerator.js";

/**
 * Class for generating the game Bejeweled.
 * @implements {IGenerator}
 */
export class BasicGenerator extends IGenerator {
  #numtypes;

  /** Constructs a BasicGenerator that will create random icons with
   *  types 0 through numtypes - 1, by calling generate().
   *
   *  @param {Number} numtypes number of different gems (jewel types).
   *  @param {Number} seed initial seed to the random number generator.
   */
  constructor(numtypes, seed = null) {
    super();
    /**
     * Number of different jewel types.
     * @type {Number}
     */
    this.#numtypes = numtypes;
  }

  /** Return the number of jewel types.
   *
   *  @return {Number} number of different jewels.
   */
  getJewelTypes() {
    return this.#numtypes;
  }

  /** Returns a randow icon.
   *
   *  @return {Icon} random icon.
   */
  generate() {
    return new BasicIcon(Math.floor(Math.random() * this.#numtypes));
  }

  /** Initializes a given 2D array of Icons with new values.
   *  Any existing values in the array are overwritten.
   *  <br>
   *  The grid is filled with alternating icons of types
   *  0 to numtypes-1.
   *
   *  @param {Array<Array<Icon>>} grid matrix of icons.
   *  @param {Boolean} randIcons whether generate random icons or use a predefined pattern.
   */
  initialize(grid, randIcons = true) {
    let pattern = false;
    let icon1 = 0;
    let icon2 = 1;
    for (var i = 0; i < grid.length; i++) {
      pattern = !pattern;

      // this pattern locks the game!
      if (false) {
        icon1 += 1;
        let n = this.getJewelTypes();
        icon1 = icon1 % n;
        if (icon1 == icon2) icon1 = (icon2 + 1) % n;
        icon2 = (icon1 + 1) % n;
        if (icon1 == icon2) icon2 = (icon1 + 1) % n;
      }

      for (var j = 0; j < grid[0].length; j++) {
        if (!randIcons) {
          grid[i][j] = new BasicIcon(pattern ? icon1 : icon2);
        } else {
          grid[i][j] = this.generate();
        }
        pattern = !pattern;
      }
    }
  }
}
