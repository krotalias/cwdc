/**
 * @file
 *
 * Summary.
 * <p>Arrow functions.<p>
 *
 * @see <a href="/cwdc/3-javascript/arrow/bob.js">source</a>
 * @see https://stackoverflow.com/questions/33308121/can-you-bind-this-in-an-arrow-function
 */

/**
 * <p>Arrow Functions do not have "this".</p>
 *
 * You cannot rebind "this" in an arrow function.
 * It will always be defined as the context in which it was defined.
 *
 * <p>Here, instead of using "this", we call bind to pass an argument to printFriends.
 * This is an alternative way to get access to bob properties without using "this".</p>
 * @type {Object<{_name: String, _friends: Array<String>, printFriends: function}>}
 */
let bob = {
  _name: "Bob",
  _friends: ["stackoverflow"],
  printFriends: (x) => {
    console.log(x);
    x._friends.forEach((f) => {
      console.log(`${x._name} knows ${f}`);
    });
  },
};

bob.printFriends = bob.printFriends.bind(null, bob);
bob.printFriends();
