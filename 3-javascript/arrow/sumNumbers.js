/**
 * @file
 *
 * Summary.
 *
 * <p>{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind Bind}
 * is different from methods
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call call}
 * and {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply apply},
 * in the sense that it returns a new function, instead of executing a function.</p>
 *
 * The first parameter still is the value assigned to "this",
 * plus a given sequence of arguments preceding any provided,
 * when the new function is called.
 *
 * @see <a href="/cwdc/3-javascript/arrow/sumNumbers.js">source</a>
 * @see https://imasters.com.br/javascript/descomplicando-call-apply-e-bind-em-javascript
 */

/**
 * <p>The call bind(5), in the penultimate line, creates a
 * new function (bindResultFunction) that, when called,
 * has its "this" keyword set to 5.</p>
 *
 * Then, calling bindResultFunction(5), we set the value of sumNumbers first parameter.
 * Since the secondNumber parameter is zero-initialized, the final result is 10.
 *
 * @param {Number} firstNumber first addend.
 * @param {Number} secondNumber second addend.
 * @return {Number} sum: this + firstNumber + secondNumber
 */
function sumNumbers(firstNumber, secondNumber = 0) {
  const sum = this + firstNumber + secondNumber;

  console.log("this: ", this);
  console.log("firstNumber: ", firstNumber);
  console.log("secondNumber: ", secondNumber);
  console.log("sum: ", sum);
}

const bindResultFunction = sumNumbers.bind(5);

bindResultFunction(5); // 10
