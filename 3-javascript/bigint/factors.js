/**
 * @file
 *
 * Summary.
 * <p>Manages the HTML elements of the interface to display all factors.</p>
 *
 * @author Paulo Roma
 * @since 28/12/2024
 */
import { factorization, bitLength, decLength } from "./factorize.js";
import { LCM } from "./gcd.js";
import { setCookie, getCookie } from "../cookies/cookies.mjs";

/**
 * <p>Uses {@link https://jquery.com jQuery} to display:
 * <ul>
 *  <li>the {@link module:gcd.LCM LCM} of the slider value in a &lt;span&gt; identified by "#prod".</li>
 *  <li>all of the {@link module:factorize.factorization factors}
 *  up to the value of the slider identified by "#n"
 *  on a textArea element identified by "#factors".</li>
 * </ul>
 * The value of the slider is saved as a cookie "slider".
 */
function getFactors() {
  // mobiles
  if (screen.width <= 800) {
    const r = document.querySelector(":root");
    const w = window.innerWidth - 96;
    r.style.setProperty("--length", `${w}px`);
    r.style.setProperty("--fsize", "150%");
  }

  const n = $("#n")[0];
  const m = $("mark");
  if (n) {
    // using javascript BigInt code to avoid the 53-bit limit
    const lcmValue = LCM(n.valueAsNumber);
    const mcolor = lcmValue > Number.MAX_SAFE_INTEGER ? "red" : "green";
    const bits = bitLength(lcmValue);
    const decs = decLength(lcmValue);
    $("#range").html(`(${bits.toString()} bits or ${decs.toString()} digits)`);
    for (const i of m) {
      i.style.color = mcolor;
    }
    $("#prod").html(`${lcmValue}`);
    $("textArea#factors").html(`${factorization(lcmValue)}`);

    $("#i1").html((n.valueAsNumber + 1).toString());
    $("#i").html(n.valueAsNumber.toString());
  }
  setCookie("slider", String(n.value), 365);
}

/**
 * <p>Fired when a &lt;input type="range"&gt; is in the
 * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
 * (by clicking or using the keyboard).</p>
 *
 * The callback  argument sets the {@link getFactors callback}  that will be invoked when
 * the event is dispatched.</p>
 *
 * The input event is fired every time the value of the element changes.
 *
 * @summary Appends an event listener for events whose type attribute value is input.
 *
 * @param {Event} event a generic event.
 * @event input
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
window.addEventListener("input", () => getFactors());

/**
 * <p>Loads the application and restores the slider value from the cookie "slider".</p>
 * <p>The load event is fired when the whole page has loaded,
 * including all dependent resources such as stylesheets,
 * scripts, iframes, and images, except those that are loaded lazily.</p>
 *
 * <p>The callback argument sets the {@link getFactors callback}
 * that will be invoked when the event is dispatched.</p>
 * @event load
 * @param {event} event a generic event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", () => {
  $("#n")[0].value = getCookie("slider");
  getFactors();
});
