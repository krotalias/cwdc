/**
 * @file
 *
 * Summary.
 * <p>This file is the entry point for the game.</p>
 *
 * <ul>
 * <li>It imports the <a href="/cwdc/3-javascript/game/doc-level/index.html">levels</a>,
 * the game, and the display drivers and runs the game with
 * the {@link module:17_canvas.CanvasDisplay CanvasDisplay} or
 * {@link module:16_game.DOMDisplay DOMDisplay} class.</li>
 *
 * <li>It also uses a cookie "level" to remember the level of the game
 * and allow the user to cheat by advancing/retreating levels by pressing a button.</li>
 *
 * <li>Differently from the original version of the game, we use ES6 modules, which is the
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules standard way}
 * of loading modules in Javascript.</li>
 * </ul>
 *
 * @author Paulo Roma
 * @since 03/01/2025
 *
 * @see <a href="/cwdc/3-javascript/game/canvas.js">source</a>
 * @see <a href="/cwdc/3-javascript/game/game.html?driver=c">link</a>
 * @see {@link https://eloquentjavascript.net/16_game.html Project: A Platform Game}
 * @see {@link https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm What the heck are CJS, AMD, UMD, and ESM in Javascript?}
 */
// import "./code/levels.js";
import GAME_LEVELS from "./code/levels.mjs";
import { runGame, DOMDisplay } from "./code/chapter/16_game.js";
import { CanvasDisplay } from "./code/chapter/17_canvas.js";
import { getCookie, setCookie } from "/cwdc/3-javascript/cookies/cookies.mjs";
/**
 * Maps driver characters to either {@link module:16_game.DOMDisplay DOMDisplay}
 * or {@link module:17_canvas.CanvasDisplay CanvasDisplay} classes.
 * @type {Object<string:DOMDisplay|CanvasDisplay>}
 */
const displayDriver = {
  d: DOMDisplay,
  c: CanvasDisplay,
};

/**
 * <p>A modulo function that returns a positive value.</p>
 * @function
 * @global
 * @returns {Number} this Number mod n.
 * @see {@link https://en.wikipedia.org/wiki/Modulo_operation Modulo}
 * @see {@link https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers JavaScript % (modulo) gives a negative result for negative numbers}
 * @see {@link https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm The JavaScript Modulo Bug}
 */
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

/**
 * Increments the level of the game by the given value
 * and saves a cookie "level" with the new value.
 * @param {Number} val increment value: +
 */
function incLevel(val) {
  let level = getCookie("level");
  if (level != "") {
    level = (+level + val).mod(GAME_LEVELS.length);
    setCookie("level", String(level), 365);
    location.reload();
  }
}
window.incLevel = incLevel;

/**
 * <p>Loads the application.</p>
 * The load event is fired when the whole page has loaded,
 * including all dependent resources such as
 * stylesheets, scripts, iframes, and images, except those that are loaded lazily.
 *
 * The callback argument sets the {@link module:16_game.runGame callback}
 * that will be invoked when the event is dispatched.
 * @event load
 */
window.addEventListener("load", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const driver = urlParams.get("driver");
  runGame(GAME_LEVELS, displayDriver[driver]).then((value) => {
    console.log(value);
    document.getElementById("level").innerHTML = value;
  });
});
