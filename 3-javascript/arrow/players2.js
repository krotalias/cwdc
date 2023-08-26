/**
 * @file
 *
 * Summary.
 *
 * <p>Adjusting "this" in a closure.</p>
 *
 * In JavaScript, "this" can only be accessed by the external function,
 * not by an internal function.
 *
 * @see <a href="/cwdc/3-javascript/arrow/players2.js">source</a>
 * @see https://desenvolvimentoparaweb.com/javascript/this-javascript-dominando/
 * see https://stackoverflow.com/questions/9644044/javascript-this-pointer-within-nested-function
 * see https://blog.kevinchisholm.com/javascript/the-javascript-this-keyword-deep-dive-nested-functions/
 * see https://www.freecodecamp.org/news/javascript-projects-for-beginners/#how-to-create-a-restaurant-menu-page
 */

/**
 * To be able to access "this" of the external function,
 * a variable is assigned to the value of "this".
 * Alternatively, an arrow function could have been used.
 * @type {Object<{tournament: String, data: Array<{name: String, age: Number}>, clickHandler: function}>}
 */
const players2 = {
  tournament: "The Masters",
  data: [
    { name: "T. Woods", age: 37 },
    { name: "P. Mickelson", age: 43 },
  ],
  /**
   * <p>In the outer function, the use of this.data is valid,
   * because "this" is bound to the object "players2"
   * and "data" is a property of it.<br>
   * However, this.tournament is undefined in the inner anonymous function.</p>
   *
   * To solve this issue, it is common in JavaScript,
   * to set a variable to the value "this", outside the forEach operator.<br>
   * In this case, "theUserObj" (some prefer "that" or "self") is in the closure.
   * @function
   * @global
   */
  clickHandler: function () {
    let theUserObj = this;
    this.data.forEach(function (person) {
      console.log(
        `Function: ${person.name} is playing in ${theUserObj.tournament}`
      );
    });
  },
  /**
   * Arrow functions also come in handy to solve the same issue,
   * in a very simple way, by capturing "this" from the lexical context.
   * @function
   * @global
   */
  clickArrow: function () {
    this.data.forEach((person) => {
      console.log(`Arrow: ${person.name} is playing in ${this.tournament}`);
    });
  },
};

players2.clickHandler();
players2.clickArrow();
// "T. Woods is playing in The Masters​"
// "P. Mickelson is playing in The Masters"
