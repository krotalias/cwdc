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
