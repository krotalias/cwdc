/**
 * @file
 *
 * Summary.
 *
 * <p>Adjusting "this" in a closure.</p>
 *
 * <p>In {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#nested_functions_and_closures nested functions and closures},
 * "this" can only be accessed by the external function, not by an internal function.</p>
 *
 * <ul>
 *  <li>"this" is not part of the closure scope.<br>
 *  It can be thought of as an additional parameter to the function
 *  that is bound at the
 *  {@link https://dev.to/kenystev/understanding-how-this-works-in-javascript---the-call-site-3hj3 call site}.</li>
 *
 *  <li>If the method is not called as a method, then the global object is passed as "this".<br>
 *  In the browser (not in sctrict mode), the global object is identical to window.</li>
 *
 *  <li>In Javascript "this" is bound to an object and it depends on, not where the function is declared,
 *  but <b>where</b> the function is <b>called</b>.</li>
 * </ul>
 *
 * <pre>
 * For example, consider the following function:
 *
 *    function someFunction() {
 *    }
 *
 * and the following object,
 *
 *    var obj = { someFunction: someFunction };
 *
 * If you call the function using method syntax, such as
 *
 *    obj.someFunction();
 *
 * then "this" is bound to obj.
 *
 * If you call someFunction() directly, such as,
 *
 *    someFunction();
 *
 * then "this" is bound to the global object, that is window.
 * </pre>
 *
 * @see <a href="/cwdc/3-javascript/arrow/players.js">source</a>
 * @see <a href="/cwdc/3-javascript/arrow/data.html">link</a>
 * @see https://desenvolvimentoparaweb.com/javascript/this-javascript-dominando/
 * @see <a href="https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/ch2.md">Call-site</a> READ IT!!
 * @see {@link https://medium.com/@anjalisharma0626/what-is-call-site-of-a-function-8e5d9881c49e Learn ‘this’}
 */

"use strict";

/**
 * A closure for printing all players in the tournament.
 * It is necessary to bind "this", so the internal anonymous function
 * can be executed.
 * @type {Object<{tournament: String, data: Array<{name: String, age: Number}>, clickHandler: function}>}
 */
var players = {
  tournament: "The Masters",
  data: [
    { name: "T. Woods", age: 37 },
    { name: "P. Mickelson", age: 43 },
  ],

  /**
   * <p>In the outer function, the use of this.data is valid,
   * because "this" is bound to the object "players"
   * and "data" is a property of it.</p>
   *
   * In the inner anonymous function, "this" is unbound,
   * because the inner function can not access "this" from the external function.<br>
   * (Without bind, "this" -> [object Window], or undefined)
   * <pre>
   *  stack
   *  <a href="../stack.png"><img src="../stack.png" width="256"></a>
   *    anonymous    defaul binding (undefined) call site is forEach
   *    forEach      implicit binding ("this" is data) call site is clickHandler
   *    clickHandler implicit binding ("this" is players) call site is global
   * </pre>
   * @function
   * @global
   * @see {@link https://medium.com/@anjalisharma0626/what-is-call-site-of-a-function-8e5d9881c49e Call site}
   * @see {@link https://medium.com/@anjalisharma0626/so-what-is-a-constructor-in-js-4db53fa11b2f What is a constructor}
   * @see {@link https://medium.com/@anjalisharma0626/javascript-using-call-and-apply-in-this-binding-8d49a10bcc8c Explicit binding}
   * @see {@link https://medium.com/@anjalisharma0626/javascript-oh-so-this-is-this-a44d9842bee5 4 Rules that determine ‘this’ binding in JS}
   */
  clickHandler: function () {
    this.data.forEach(
      function (person) {
        try {
          console.log(
            `clickHandler: ${person.name} is playing in ${this.tournament}`
          );
          console.log(
            `What "this" is bound to? ${this}: {${Object.keys(this)}}`
          );
          if (typeof document != "undefined") {
            let rdiv = document.querySelector("#result");
            rdiv.innerHTML += `clickHandler: ${person.name} is playing in ${this.tournament}<br>`;
          }
        } catch (err) {
          console.log(err.name + ": " + err.message);
          console.log(`What "this" is bound to? ${this}}`);
          if (typeof document != "undefined") {
            let rdiv = document.querySelector("#result");
            rdiv.innerHTML += `${err.name}: ${err.message}<br>`;
            rdiv.innerHTML += `clickHandler: What "this" is bound to? ${this}<br>`;
          }
        }
      }.bind(this) // <---------------- FIX (explicity binding)
    );
  },

  /**
   * <p>In the outer function, the use of this.data is valid,
   * because "this" is bound to the object "players"
   * and "data" is a property of it.<br>
   * However, this.tournament is undefined in the inner anonymous function.</p>
   *
   * To solve this issue, it is common in JavaScript,
   * to set a variable to the value "this", outside the
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach forEach}
   * method.<br>
   * In this case, "theUserObj" (some prefer "that" or "self") is in the closure.
   * @function
   * @global
   */
  clickHandler2: function () {
    let theUserObj = this; // <---------------- FIX (save "this")
    this.data.forEach(function (person) {
      console.log(
        `clickHandler2: ${person.name} is playing in ${theUserObj.tournament}`
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
      console.log(
        `clickArrow: ${person.name} is playing in ${this.tournament}`
      );
    });
  },
};

// What "this" is bound to? [object Object]
players.clickHandler();
players.clickHandler2();
players.clickArrow();
// "T. Woods is playing in The Masters​"
// "P. Mickelson is playing in The Masters"
