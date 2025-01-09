/** @file
 *
 *  Summary.
 *  <p>IGenerator Interface.</p>
 *
 *  Description.
 *  <p>Interface representing a utility for generating new icons in a Bejeweled-like video game.</p>
 *
 *  @author Paulo Roma
 *  @see <a href="/cwdc/3-javascript/jewels/IGenerator.js">source</a>
 *  @since 10/03/2021
 */

/**
 * Interface representing a utility for generating new icons
 * in a Bejeweled-like video game.
 * @interface
 */
export class IGenerator {
  constructor() {
    if (this.constructor === IGenerator) {
      throw new TypeError(
        'Abstract class "IGenerator" cannot be instantiated directly.'
      );
    }
  }

  /** Returns a new Icon.
   *  @return {Icon}
   *    a new Icon
   */
  generate() {
    throw new Error("You have to implement the method generate!");
  }

  /** Initializes a given 2D array of Icons with new values.
   *  Any existing values in the array are overwritten.
   *  @param {Array<Array<Icon>>} grid
   *    the 2D array to be initialized
   */
  initialize(grid) {
    throw new Error("You have to implement the method initialize!");
  }
}
