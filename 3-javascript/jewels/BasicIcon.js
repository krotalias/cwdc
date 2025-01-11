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

/**
 * Basic implementation of the {@link Icon} interface.
 * @implements {Icon}
 */
export class BasicIcon extends Icon {
  /** Constructs an icon of the given type.
   *
   *  @param {Number} type
   *      type for this icon
   */
  constructor(type) {
    super();

    /**
     * Type of this icon.
     * @private
     * @type {Number}
     */
    this._type = type;
  }

  /**
   * Returns the type of this icon.
   * @return {Number} type of this icon.
   */
  getType() {
    return this._type;
  }

  /** Return whether two icons have the same type.
   *
   *  @param {Icon} obj object to compare to.
   *  @return {Boolean} true it the types are the same.
   */
  equal(obj) {
    if (obj == null || this._type == null || typeof this != typeof obj) {
      return false;
    }

    return this._type == obj._type;
  }

  /** Return a string representaion of this icon.
   *
   *  @return {String} this icon representation.
   */
  repr() {
    return this._type.toString();
  }
}
