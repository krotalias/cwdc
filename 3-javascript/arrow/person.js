/**
 * @file
 *
 * Summary.
 *
 * <p>Adjusting "this" when a method is used as a callback.</p>
 *
 * @see <a href="/cwdc/3-javascript/arrow/person.js">source</a>
 * @see https://javascript.plainenglish.io/this-binding-in-es6-arrow-function-70d80e216238
 * @see https://blog.kevinchisholm.com/javascript/difference-between-scope-and-context/
 */

/**
 * <p>Here the Person function is a constructor function.
 * We are creating an object person1 by the "new" keyword.</p>
 *
 * When the code is executed the following output is generated:<br>
 *    • Name: undefined, Age: undefined
 *
 * <p>The reason for the undesired output is that in normal functions "this" keyword represents
 * the object that has called the function.
 * When our function getDetails is normally invoked, "this" keyword represents the global object
 * that is the window (or global in node) object in our case,
 * and there is no variable with the name personName or age
 * in the global object, due to which both of these are undefined.</p>
 *
 * <p>Therefore, by using the bind method, we can bind the Person to the callback function,
 * and then our problem will be solved.</p>
 * @param {String} personName person name.
 * @param {Number} age person age.
 * @class
 */
const Person = function (personName, age) {
  this.personName = personName;
  this.age = age;
  this.getDetails = function () {
    const callback = function () {
      console.log(`Name: ${this.personName}, Age: ${this.age}`);
    };
    setTimeout(callback.bind(this), 3000); // <------- bind HERE!!!
  };
};
let person1 = new Person("Chandler", 25);
person1.getDetails();

/**
 * Basically in the Arrow function, "this" always represents the object
 * in which the arrow function is defined.
 * Arrow syntax automatically binds "this" to the surrounding code’s context under the hood.
 * In the Arrow function, it is not dependent on how they are invoked,
 * but it closes on the surrounding context.
 * @param {String} personName person name.
 * @param {Number} age person age.
 * @class
 */
const Person2 = function (personName, age) {
  this.personName = personName;
  this.age = age;
  this.getDetails = function () {
    const callback = () => {
      console.log(`Name: ${this.personName}, Age: ${this.age}`);
    };
    setTimeout(callback, 3000);
  };
};
let person2 = new Person2("Monica", 23);
person2.getDetails();
