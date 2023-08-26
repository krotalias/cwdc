/**
 *  @file
 *
 * <p>A Promise is a {@link https://en.wikipedia.org/wiki/Proxy_server proxy}
 * for a value not necessarily known when the promise is created.</p>
 * It allows you to associate handlers with an asynchronous action's eventual success value or failure reason.
 * <p>This lets asynchronous methods return values like synchronous methods, that is, <br>
 * instead of immediately returning the final value, the asynchronous method <br>
 * returns a promise to supply the value at some point in the future.</p>
 *
 *  @author Paulo Roma.
 *  @since 18/08/2021
 *  @see <a href="/cwdc/3-javascript/promises/promise.html">link</a>
 *  @see <a href="/cwdc/3-javascript/promises/promise.js">source</a>
 *  @see <a href="/nodejs/books/javascript-beginner-handbook.pdf#page=60">Book</a>
 *  @see https://javascript.info/promise-basics
 *  @see https://javascript.info/async-await
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 *  @see https://gomakethings.com/promises-in-javascript/
 *  @see https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
 *  @see https://eloquentjavascript.net/11_async.html
 *  @see https://www.techiediaries.com/convert-promise-async-await-vscode/
 *  @see https://dev.to/masteringjs/using-then-vs-async-await-in-javascript-2pma
 */

"use strict";

/**
 * <p>When you create a Promise, you pass in a callback function as an argument.</p>
 *
 * <p>Inside the function, you pass in two arguments: resolve and reject.<br>
 * When the Promise’s should be considered completed, run the resolve() method.</p>
 *
 * The Promise.resolve() method "resolves" a given value to a Promise:
 * <ul>
 *  <li>If the value is a promise, that promise is returned; </li>
 *  <li>if the value is a thenable, Promise.resolve() will call the then() method
 *      with two callbacks it prepared;</li>
 *  <li>otherwise the returned promise will be fulfilled with the value.</li>
 * </ul>
 *
 * The function passed to new Promise is called the executor.<br>
 * When new Promise is created, the executor runs automatically.<br>
 * It contains the producing code which should eventually produce the result.
 *
 * @returns {Promise<String>} a promise for returning a string after at most 12 seconds.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject
 */
const getData = () => {
  return new Promise((resolve, reject) => {
    let delay = Math.floor(12000 * Math.random());
    if (delay < 11000)
      setTimeout(() => resolve(`some data (after ${delay / 1000}s)`), delay);
    else reject(`took too long (${delay / 1000}s)`);
  });
};

/**
 * <p>Calls getData()</p>
 * <p>To actually consume the value returned when the promise fulfills,
 * since it is returning a promise, we could use a .then() block.</p>
 * If the promise gets rejected, it will jump to the catch( ) method
 * and this time we will see a different message on the console.
 * @see https://www.freecodecamp.org/news/javascript-es6-promises-for-beginners-resolve-reject-and-chaining-explained/
 * @function call_1_getData
 * @global
 */
getData()
  .then((data) => {
    console.log(`getData resolved with ${data}`);
  })
  .catch((message) => {
    console.log(message);
  });

/**
 * An async function can wait for a promise to be resolved.
 *
 * @returns {Promise<Number>} returned value 3 wrapped as a promise.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
 */
const doSomething = async () => {
  try {
    const data = await getData();
    console.log(data);
  } catch (e) {
    console.error(e);
  }

  return 3; // async ensures that the function returns a promise, and wraps non-promises in it.
};

/**
 * <p>Calls doSomething()</p>
 * Making asynchronous programming easier with async and await.
 *
 * <pre>
 *  Usage with two possible outcomes, depending on which one resolves first,
 *  getData() or do something():
 *
 *  roma: ~/html/cwdc/3-javascript/promises$ node promise.js
 *
 *  getData resolved with <strong>some data</strong> (after 5.868s)
 *  <strong>some data</strong> (after 10.869s)
 *  doSomething resolved with value <strong>3</strong>
 *
 *  or
 *
 *  <strong>some data</strong> (after 6.588s)
 *  doSomething resolved with value <strong>3</strong>
 *  getData resolved with <strong>some data</strong> (after 10.494s)
 *
 *  rejected
 *
 *  took too long (11.309s)
 *  doSomething resolved with value 3
 *  getData resolved with some data (after 4.477s)
 * </pre>
 * @function call_2_doSomething
 * @global
 */
doSomething().then((value) => {
  console.log(`doSomething resolved with value ${value}`);
});

/**
 *  <p>Retrieves a user avatar from github,
 *  and draws it for 3 seconds.</p>
 *
 *  <p>The user is read from a user.json file in the current directory,
 *  using the fetch API:</p>
 *
 *  <pre>
 *    fetch('http://example.com/movies.json')
 *        .then(response => response.json())
 *        .then(data => console.log(data));
 *  </pre>
 *
 *  <pre>
 *    user.json file contents:
 *
 *    {
 *      "name": "jimblin",
 *      "isAdmin": true
 *    }
 *  </pre>
 *
 *  All the processing is asynchronous.
 *
 *  @return {Object} a github user.
 *
 *  <pre>
 *    {
 *      login: "Jimblin",
 *      id: 75284734,
 *      node_id: "MDQ6VXNlcjc1Mjg0NzM0",
 *      avatar_url: "https://avatars.githubusercontent.com/u/75284734?v=4",
 *      gravatar_id: "",
 *      …
 *    }
 *  </pre>
 *
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Response/json
 *  @see https://api.github.com/users/jimblin
 */
export async function showAvatar() {
  // read the JSON file
  let response = await fetch("./user.json");
  let user = await response.json();

  // read github user
  let githubResponse = await fetch(`https://api.github.com/users/${user.name}`);
  let githubUser = await githubResponse.json();

  // show the avatar
  let img = document.createElement("img");
  img.src = githubUser.avatar_url;
  img.className = "promise-avatar-example";
  document.body.append(img);

  // wait 3 seconds
  await new Promise((resolve, reject) => setTimeout(resolve, 3000));

  img.remove();

  return githubUser;
}
