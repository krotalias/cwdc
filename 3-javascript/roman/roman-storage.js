/** @module */

/**
 *  @file
 *
 *  <p>Remember the values of the last conversion.</p>
 *
 *  <p>After submitting the form, all of the local javascript data is gone, and
 *  the page is reloaded, which may cause some flicker.</p>
 *
 *  <p>Therefore, the data has to be to stored some way, with either PHP, Local Storage, or Cookies.
 *  The advantages of using forms are their properties, such as error handling.</p>
 *
 *  <p>localStorage is similar to sessionStorage, except that while localStorage data has no expiration time,
 *  sessionStorage data gets cleared when the page session ends — that is, when the page is closed.</p>
 *
 *  <p>localStorage data for a document loaded in a "private browsing" or "incognito" session
 *  is cleared when the last "private" tab is closed.</p>
 *
 *  <p>If there IS a submit button, it will be clicked when one presses Enter in a text field.</p>
 *
 *  <p>Since there is no server here, there is nothing to submit,
 *  and of course, there would be no need of a local storage, other than remembering the
 *  state for the next execution.</p>
 *
 *  <p>In this case, we could either have used:</p>
 *  <pre>
 *      document.getElementById("roman_button").addEventListener("click", function(event){
 *          event.preventDefault();
 *          ...
 *       });
 *
 *      or (one of the two buttons could have type="button", in this case).
 *      document.getElementById("romanform").onsubmit=function(e) {
 *          e.preventDefault();
 *          ...
 *      }
 *  </pre>
 * @see https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer
 * @see https://stackoverflow.com/questions/8634058/where-the-sessionstorage-and-localstorage-stored
 * @see <a href="../roman/roman-storage.js">source</a>
 */

import { int2roman, int2romanFast, roman2int, validateRoman } from "./roman.js";

// Module creates a scope to avoid name collisions.
// Either expose your function to window object or use addEventListener to bind handler.
window.restoreValues = restoreValues;
window.storeValues = storeValues;

/** Accesses the current domain's local Storage object and reads a data item from it using Storage.getItem().
 *
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
function restoreValues() {
  if (localStorage.getItem("decimal-value") !== null)
    decimal.value = localStorage.getItem("decimal-value");
  if (localStorage.getItem("roman-value") !== null)
    roman.value = localStorage.getItem("roman-value");
}

/** Accesses the current domain's local Storage object and adds a data item to it using Storage.setItem().
 *
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 */
function storeValues() {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("decimal-value", decimal.value);
    localStorage.setItem("roman-value", roman.value);
  }
}

/**
 * Convert from integer to roman.
 * @param {MouseEvent} e button click event.
 * @function decimal button click
 * @global
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
 * @see <a href="/cwdc/3-javascript/doc-roman/module-roman.html#int2romanFast">int2romanFast</a>
 */
roman_button.onclick = function (e) {
  e.preventDefault(); // there is no server - nothing to submit
  roman.value = int2romanFast(decimal.value);
  storeValues();
};

/**
 * Convert from integer to roman.
 * @param {InputEvent} e oninput event.
 * @function decimal string typed
 * @global
 * @see <a href="/cwdc/3-javascript/doc-roman/module-roman.html#int2romanFast">int2romanFast</a>
 */
$('[name="decimal"]').on("change keyup", function () {
  let value = $(this).val();
  $('[name="roman"]').val(int2romanFast(value));
});

/**
 * Convert from roman to integer.
 * @param {InputEvent} e oninput event.
 * @function roman string typed
 * @global
 * @see <a href="/cwdc/3-javascript/doc-roman/module-roman.html#roman2int">roman2int</a>
 */
roman.oninput = function () {
  decimal.value =
    validateRoman(roman.value).length == 0 ? roman2int(roman.value) : 0;
};

/**
 * Convert from roman to integer.
 * @param {MouseEvent} e button click event.
 * @function roman button click
 * @global
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
 * @see <a href="/cwdc/3-javascript/doc-roman/module-roman.html#roman2int">roman2int</a>
 */
decimal_button.onclick = function (e) {
  e.preventDefault(); // there is no server - nothing to submit
  var val = validateRoman(roman.value);
  decimal.value = val.length == 0 ? roman2int(roman.value) : 0;
  if (decimal.value == 0) {
    alert(`Exception ${val} : Invalid roman "${roman.value}"`);
  } else {
    storeValues();
  }
};