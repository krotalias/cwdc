/**
 * @file
 *
 * A function that references bindings from local scopes around it is called a closure.
 * <p>
 * Closure means that an inner function always has access to the vars and parameters of
 * its outer function, even after the outer function has returned.
 * </p><p>
 * The inner function can access the variables of the enclosing function due to closures
 * in JavaScript. In other words, the inner function preserves the scope chain of
 * the enclosing function at the time the enclosing function was executed,
 * and thus can access the enclosing function’s variables.
 * </p>
 * In other words, the function defined in the closure ‘remembers’ the environment
 * in which it was created:
 * <ul>
 *  <li> We must have a nested function (function inside a function).</li>
 *  <li> The nested function must refer to a value defined in the enclosing function.</li>
 *  <li> The enclosing function must return the nested function.</li>
 * </ul>
 *
 * <pre>
 * Usage:
 *    node closure.mjs
 * </pre>
 *
 * @author Paulo Roma
 * @since 07/05/2021
 * @see https://eloquentjavascript.net/Eloquent_JavaScript.pdf#page=59
 * @see <a href="/cwdc/3-javascript/closure/closure.html">link</a>
 * @see <a href="/cwdc/3-javascript/closure/closure.js">source</a>
 * @see <a href="../../../eloquentJavascript/game/doc-game/global.html#trackKeys">game keys</a>
 * @see <a href="../closure/closure.mjs">closure in node</a>
 */

/**
 * A closure that multiply by an arbitrary amount.
 * <p>
 * Creates an environment in which the factor parameter is bound to its value
 * when the function was defined.
 * </p>
 * @param {Number} factor amount to multiply by (multiplier).
 * @returns {mult} a callback for multiplying by factor.
 *
 */
function multiplier(factor) {
  /**
   * Multiplies a value by the multiplier in the scope.
   * @param {Number} value multiplicand.
   * @return {Number} factor * value.
   * @callback mult
   */
  return (value) => value * factor;
}

/**
 * <p>A closure for checking against a secret password.</p>
 * It gives the enclosed function guessPassword exclusive access to the password variable,
 * while making it impossible to access the password from the outside.
 * @return {guessObj}
 * @see https://www.freecodecamp.org/news/lets-learn-javascript-closures-66feb44f6a44/
 */
function secretPassword() {
  var password = "xh38sk";
  /**
   * <p>Object for checking passwords.</p>
   * @return {Object<guessPassword:guessPass>} object for checking whether the password was guessed.
   * @callback guessObj
   */
  return {
    guessPassword:
      /**
       * <p>Cheks a given string against the stored password.</p>
       * @param {String} guess a password.
       * @returns {Boolean} whether the password was guessed.
       * @callback guessPass
       */
      (guess) => guess === password,
  };
}

/**
 *  A closure which is an IIFE (immediately invoked function expression).
 *  @function
 *  @returns {inc} a callback for incrementing a counter.
 */
var incr = (function () {
  var i = 1;
  /**
   * Returns the counter and then increments it.
   * @return {Number}
   * @callback inc
   */
  return () => i++;
})();

/** Creates two multipliers, by 2 and 3, and a game password checker.
 *  @function
 *  @returns {String} a template literal that interpolates an html string,
 *         whose placeholders are replaced for: <br> "15, 10, false, true, 1, 2"
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 */
export var testClosure = () => {
  let twice = multiplier(2);
  let thrice = multiplier(3);
  let gamePassword = secretPassword().guessPassword;

  // 15, 10, false, true, 1, 2
  return `\
    <p><a href="../doc-closure/global.html#testClosure">Some</a> \
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures">closures:</a></p>

    let twice = <a href="../doc-closure/global.html#multiplier">multiplier(2)</a>; <br>
    let thrice = multiplier(3); <br>
    let gamePassword = <a href="../doc-closure/global.html#secretPassword">secretPassword()</a>.guessPassword; <br>

    <ul>
      <li>
        thrice(5) = ${thrice(5)}
      </li>
      <li>
        twice(5) = ${twice(5)}
      </li>
      <li>
        gamePassword("heyisthisit?"): ${gamePassword("heyisthisit?")}
      </li>
      <li>
        gamePassword("xh38sk"): ${gamePassword("xh38sk")}
      </li>
      <li>
        incr(): ${incr()}
      </li>
      <li>
        <a href="../doc-closure/global.html#incr">incr():</a> ${incr()}
      </li>
      <li>
        incr(): ${incr()}
      </li>
    </ul>`;
};
