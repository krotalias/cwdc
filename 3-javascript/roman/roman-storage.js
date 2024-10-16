/** @module */

/**
 *  @file
 *
 *  <p>Remember the values of the last conversion saving them to localStorage:</p>
 *  <ul>
 *    <li>roman_converter	{"decimal_value":"2024","roman_value":"MMXXIV"}</li>
 *  </ul>
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
 * @see <a href="../roman/roman.html">link</a>
 * @see <a href="../roman/roman-storage.js">source</a>
 * @see <iframe width="400" height="300" src="/cwdc/3-javascript/roman/roman.html"></iframe>
 */

import { int2roman, int2romanFast, roman2int, validateRoman } from "./roman.js";

/**
 * Accesses the current domain's local Storage object and reads a data item
 * from it using {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem Storage.getItem()}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
function restoreValues() {
  const { decimal_value, roman_value } =
    JSON.parse(localStorage.getItem("roman_converter")) || {};
  decimal.value = decimal_value;
  roman.value = roman_value;
}

/**
 * Accesses the current domain's local Storage object and adds a data item
 * to it using {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem Storage.setItem()}.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 */
function storeValues() {
  if (typeof Storage !== "undefined") {
    const value = {
      decimal_value: decimal.value,
      roman_value: roman.value,
    };
    localStorage.setItem("roman_converter", JSON.stringify(value));
  }
}

/**
 * Convert from {@link module:roman.int2romanFast integer to roman}
 * and save the values to {@link module:roman-storage~storeValues localStorage}.
 * @param {MouseEvent} e button click event.
 * @event onclick - when roman button is clicked.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
 */
roman_button.onclick = (e) => {
  e.preventDefault(); // there is no server - nothing to submit
  roman.value = int2romanFast(decimal.value);
  storeValues();
};

/**
 * Convert from {@link module:roman.int2romanFast integer to roman}.
 * @param {InputEvent} e an input event via keyboard.
 * @event on - change or keyup when typing in decimal input.
 * @see https://api.jquery.com/keyup/#on1
 */
$('[name="decimal"]').on("change keyup", function (e) {
  let value = $(this).val();
  $('[name="roman"]').val(int2romanFast(value));
});

/**
 * <p>Convert from {@link module:roman.roman2int roman to integer}.</p>
 * The input is also {@link module:roman.validateRoman validated}.
 * @param {InputEvent} e an input event via keyboard.
 * @event oninput - when typing in roman input.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event
 */
roman.oninput = (e) => {
  decimal.value =
    validateRoman(roman.value).length == 0 ? roman2int(roman.value) : 0;
};

/**
 * <p>Convert from {@link module:roman.roman2int roman to integer}
 * and save the values to {@link module:roman-storage~storeValues localStorage}.</p>
 * The input is also {@link module:roman.validateRoman validated}.
 * @param {MouseEvent} e button click event.
 * @event onclick - when decimal button is clicked.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
 */
decimal_button.onclick = (e) => {
  e.preventDefault(); // there is no server - nothing to submit
  var val = validateRoman(roman.value);
  decimal.value = val.length == 0 ? roman2int(roman.value) : 0;
  if (decimal.value == 0) {
    alert(`Exception ${val} : Invalid roman "${roman.value}"`);
  } else {
    storeValues();
  }
};

/**
 * Triggers the {@link module:roman-storage~restoreValues restore} from local storage</a>
 *
 * @event load - restore values.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", (event) => restoreValues());
