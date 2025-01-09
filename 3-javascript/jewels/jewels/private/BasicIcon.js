/**  @file
 *
 *   Summary.
 *   <p>Basic implementation of the Icon interface.</p>
 *
 *   @author Paulo Roma
 *   @see <a href="/cwdc/3-javascript/jewels/BasicIcon.js">source</a>
 *   @since 10/03/2021
 */

import { Icon } from "./Icon.js";

/** Basic implementation of the Icon interface.
 *
 */
export class BasicIcon extends Icon {
  #type;

  /** Constructs an icon of the given type.
   *
   *  @param {Number} type
   *      type for this icon
   */
  constructor(type) {
    super();

    /**
     * Type of this icon.
     * @type {Number}
     */
    this.#type = type;
  }

  /** Returns the type of this icon.
   *
   *  @return {Number} type of this icon.
   */
  getType() {
    return this.#type;
  }

  /** Return whether two icons have the same type.
   *
   *  @param {Icon} obj object to compare to.
   *  @return {Boolean} true it the types are the same.
   */
  equal(obj) {
    if (obj == null || this.#type == null || typeof this != typeof obj) {
      return false;
    }

    return this.#type == obj.#type;
  }

  /** Return a string representaion of this icon.
   *
   *  @return {String} this icon representation.
   */
  repr() {
    return self.#type.toString();
  }
}
