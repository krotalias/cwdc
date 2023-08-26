/**
 * @file
 *
 * Summary.
 * <p>Arrow functions.<p>
 *
 * @see <a href="/cwdc/3-javascript/arrow/article2.js">source</a>
 * @see https://imasters.com.br/javascript/descomplicando-call-apply-e-bind-em-javascript
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
 * @see https://www.javascripttutorial.net/es6/when-you-should-not-use-arrow-functions/
 */

/**
 * <p>Arrow Functions do not have "this".</p>
 *
 * They can use "this" from the external context.
 * A class constructor can execute an arrow function.
 * @see https://javascript.info/arrow-functions
 */
class Article {
  constructor() {
    this.title = "Only the penitent man will pass...";

    this.arrowFunction();
  }

  arrowFunction = () => {
    console.log("Arrow function: ", this.title);
  };
}

let a = new Article(); // Only the penitent man will pass
a.arrowFunction();
