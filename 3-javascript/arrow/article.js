/**
 * @file
 *
 * Summary.
 * <p>Arrow functions.<p>
 *
 * @see <a href="/cwdc/3-javascript/arrow/article.js">source</a>
 * @see <a href="/cwdc/3-javascript/arrow/data.html">link</a>
 * @see https://imasters.com.br/javascript/descomplicando-call-apply-e-bind-em-javascript
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 * @see https://www.javascripttutorial.net/es6/when-you-should-not-use-arrow-functions/
 */

/**
 * <p>Arrow Functions do not have "this".</p>
 *
 * You cannot rebind "this" in an arrow function.
 * It will always be defined as the context in which it was defined.
 * If you require "this" to be meaningful you should use a normal function.
 * @type {Object<{title: String, regularFunction: function,  arrowFunction: function}>}
 */
const article = {
  title: "Only the penitent man will pass...",
  // In normal functions, "this" keyword represents the object that has called the function.
  regularFunction: function () {
    console.log("Normal function: ", this.title);
    if (typeof document != "undefined") {
      let rdiv = document.querySelector("#result");
      rdiv.innerHTML += `Normal function: ${this.title}<br>`;
    }
  },
  // Arrow syntax automatically binds "this" to the surrounding code’s context.
  arrowFunction: () => {
    try {
      console.log("Arrow function: ", this.title);
      if (typeof document != "undefined") {
        let rdiv = document.querySelector("#result");
        rdiv.innerHTML += `Arrow function: ${this.title}. Penitent man is humble, kneels before God. Kneel!<br>`;
      }
    } catch (err) {
      console.log(
        "Arrow function: Nope. Penitent man is humble, kneels before God. Kneel!"
      );
      console.log(err.name + ": " + err.message);
    }
  },
};

article.regularFunction(); // "Only the penitent man will pass"

article.arrowFunction(); // undefined (context is window or global, in this case)
