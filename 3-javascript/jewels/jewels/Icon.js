/** @file
 *
 *  Summary.
 *  <p>Icon Interface.</p>
 *
 *  Description.
 *  <p>Interface representing an icon or block in a Bejeweled-like matching game. </p<
 *  <p> At a minimum, each icon encapsulates an integer, referred to as its "type". </p>
 *
 *  @author Paulo Roma
 *  @see <a href="/cwdc/3-javascript/jewels/Icon.js">source</a>
 *  @since 10/03/2021
 */

/**
 * Interface representing an icon or block in a Bejeweled-like matching game.<br>
 * At a minimum, each icon encapsulates an integer, referred to as its "type".
 * @interface
 */
export class Icon {
  constructor() {
    if (this.constructor === Icon) {
      throw new TypeError(
        'Abstract class "Icon" cannot be instantiated directly.'
      );
    }
  }

  /** Returns the type of this icon.
   *  @return {Number} type of this icon.
   */
  getType() {
    throw new Error("You have to implement the method getType!");
  }
}
