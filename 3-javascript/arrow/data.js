/**
 * @file
 *
 * Summary.
 *
 * <p>Adjusting "this" when a method is assigned to a variable.</p>
 *
 * In JavaScript, there's always a global object defined.<br>
 * In a web browser, when scripts create global variables defined with the var keyword,<br>
 * they're created as members of the global object (Window).
 * <p>In Node.js this is not the case. The global object is called global.</p>
 *
 * @see <a href="/cwdc/3-javascript/arrow/data.js">source</a>
 * @see <a href="/cwdc/3-javascript/arrow/data.html">link</a>
 * @see https://desenvolvimentoparaweb.com/javascript/this-javascript-dominando/
 * @see https://modernweb.com/understanding-scope-and-context-in-javascript/
 */

/**
 * <p>A global data array.</p>
 * The global object in a web browser is the window object,
 * and in node, it is called global.
 *
 * <p>The {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis globalThis}
 * global property allows one to access the global object
 * regardless of the current environment.</p>
 * @type {Array<{name: String, age: Number}>}
 * @global
 */
globalThis.data = [
  { name: "Samantha", age: 12 },
  { name: "Alexis", age: 14 },
];

/**
 *
 * <p>Solution to set "this" when a method is assigned to a variable.</p>
 *
 * It is possible to solve the issue by setting "this" via the
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind bind} method.
 * @type {Object<{data: Array<{name: String, age: Number}>, showData: function}>}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
 */
var user = {
  // "data" is a property of "user" object
  data: [
    { name: "T. Woods", age: 37 },
    { name: "P. Mickelson", age: 43 },
  ],
  showData: function (event) {
    // Random number: 0 or 1
    let randomNum = ((Math.random() * 2) | 0) + 1 - 1;

    console.log(this.data);

    // print a random person from "data" array
    const { name, age } = this.data[randomNum];
    console.log(`${name} ${age}`);

    if (typeof document != "undefined") {
      let rdiv = document.querySelector("#result");
      rdiv.innerHTML += `${name} ${age}<br>`;
    }
  },
};

/**
 * <p>Displays a random user in the console and in the Browser,
 * if there is a Document object.</p>
 * <p>It should be noted that "this" is set to the object that called the function.</p>
 * However, when a function is assigned to a variable,
 * we need to bind the function. <br>
 * Otherwise, "this" is assigned to the global object.
 * @function
 */
var showGuserData = user.showData.bind(globalThis);
var showUserData = user.showData.bind(user);

/**
 * When "showGUserData" is executed,
 * the values shown are from "data" in the
 * global context, not the one from the array in "user".
 * <ul>
 *  <li>In strict mode it is undefined.</li>
 *  <li>node has no Document or Window.</li>
 * </ul>
 */
showGuserData(); // "Samantha 12"
showUserData(); // "T. Woods 37"
