/**
 * @file
 *
 * Summary.
 * <p>Calculates the elapsed number of years since a given date.</p>
 * @author Paulo Roma Cavalcanti
 * @since 26/08/2023
 * @see <a href="/cwdc/10-html5css3/clock/date.js">source</a>
 */

"use strict";

/**
 * Returns the number of years since a given date.
 *
 * @param {String} past a date in the past.
 * @returns {Date} elapsed number of years since past.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 */
function elapsedYears(past) {
  let date = new Date();
  return date.getFullYear() - new Date(past).getFullYear();
}
