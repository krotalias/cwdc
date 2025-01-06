/**
 * @file
 *
 *  <p>Retrieves a user avatar from github,
 *  and draws it for 3 seconds.</p>
 *
 *  <p>The user is read from a user.json file in the current directory,
 *  using the {@link https://dmitripavlutin.com/fetch-with-json/ fetch} API. <br />
 *  All of the DOM nodes are created using javascript.</p>
 *
 *  @author Paulo Roma.
 *  @since 24/12/2021
 *  @see <a href="/cwdc/3-javascript/promises/promise2.html">link</a>
 *  @see <a href="/cwdc/3-javascript/promises/promise2.js">source</a>
 *  @see <a href="/nodejs/books/javascript-beginner-handbook.pdf#page=60">Book</a>
 *  @see {@link https://javascript.info/promise-basics Promise basics}
 *  @see {@link https://javascript.info/async-await Async/await}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise}
 *  @see {@link https://gomakethings.com/promises-in-javascript/ Promises in JavaScript}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await How to use promises}
 *  @see {@link https://eloquentjavascript.net/11_async.html Asynchronous Programming}
 *  @see {@link https://www.techiediaries.com/convert-promise-async-await-vscode/ Convert Promise-Based Chain to Async/Await with VS Code}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument DOMImplementation: createDocument() method}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/body Document: body property}
 *  @see {@link https://dev.to/kylejb/a-key-difference-between-then-and-async-await-in-javascript-53e9 A key difference between .then() and async-await in JavaScript}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 *
 */
"use strict";

/**
 * <p>Module creates a scope to avoid name collisions.</p>
 * Either expose your function to window object or use addEventListener to bind handler.
 * @function window_showAvatar
 * @global
 */
window.showAvatar = showAvatar;
window.setDOM = setDOM;

// body is empty?
if (document.body.children.length === 0) {
  document.body.setAttribute("id", "avaBody");
  // either way works fine
  if (typeof window.setDOM !== "undefined")
    document.body.setAttribute("onload", "setDOM()");
  else
    addEventListener("load", (event) => {
      setDOM();
    });
  console.log(document.getElementById("avaBody")); //
}

/**
 * <p>Sets up the DOM for this script.</p>
 * The head gets executed before the dom is loaded.
 * Therefore, nodes should be created in an onload function in the body tag,<br />
 * since it cannot find document.getElementsByTagName("body") when the Document isn't ready,
 * because it is simply not there yet.
 */
export function setDOM() {
  // Create the text node for anchor element.
  const a = document.createElement("a");
  const tnode = document.createTextNode("youtube");

  // Append the text node to anchor element.
  a.appendChild(tnode);

  // Set the title.
  a.title = "Chaining Fetch Requests";

  // Set the href property.
  a.href = "https://www.youtube.com/watch?v=4A1cUp2wK2c";

  document.body.appendChild(a);
  console.log(
    "anchor has been created:",
    document.getElementsByTagName("a")[0],
  );

  // create the div
  const div = document.createElement("div");
  div.setAttribute("id", "user");
  document.body.appendChild(div);
  console.log("div has been created:", document.getElementById("user"));

  // create a script to call showAvatar()
  const script = document.createElement("script");
  script.type = "text/javascript"; // "module";
  script.onload = function () {
    console.log("Script loaded and ready");
    console.log("script has been created:", document.getElementById("avatar"));
  };
  script.setAttribute("id", "avatar");

  const code = `showAvatar().then((githubUser) => {
    document.getElementById("user").innerHTML =
    \`<a href="https://github.com/\${githubUser.login}">\${githubUser.login}</a>\`;
    console.log(githubUser);
  });`;

  try {
    script.appendChild(document.createTextNode(code));
  } catch (e) {
    script.text = code;
  } finally {
    document.body.appendChild(script);
    if (typeof printDOMTree === "function") {
      printDOMTree(document.querySelector("body"));
    }
  }
}

/**
 * <p>When we run fetch with a web address, it returns a Promise object.
 * Promise is a basic Data Type in JavaScript. <br />
 * When you see a Promise being returned,
 * you can use the “await” operator in front of it to get to the actual return value.</p>
 *
 * <p>However, awaiting on fetch, we end up receiving a Response object,
 * which has a class member method called text().</p>
 *
 * <p>When we call text(), we receive yet another Promise.
 * No problem, let’s use another “await” on the whole thing. <br />
 * A string is then returned containing the JSON Data we care about.</p>
 *
 * <p>We can try to convert the JSON, in string form, into JSON objects (in this case an Array). <br />
 * This is usually done with the built-in JSON.parse() function.</p>
 *
 * <p>Nonetheless, it turns out that response has another convenience method called json(), <br />
 * which returns a Promise that resolves to a JavaScript object (an array, a string, a number, ...):</p>
 *
 *  <pre>
 *    fetch('http://example.com/movies.json')
 *        .then(response => response.json())
 *        .then(data => console.log(data));
 *  </pre>
 *
 * <p>First, we call fetch(‘http://example.com/movies.json') to get a Promise.
 * Next, we call .then() on the Promise object. This member function takes in a callback.</p>
 *
 * <p>Promise and the then() function takes a callback, and when it is ready to give you the result,
 * it will pass that as input into the callback.</p>
 *
 * Note: returning an Array in line (A) does not work, because the .then() callback
 * would receive an Array with a Promise and a normal value.<br />
 * Promise.all() uses Promise.resolve() to ensure that all Array elements are Promises
 * and fulfills its result with an Array of their fulfillment values (if none of the Promises is rejected).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/json
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/text
 * @see https://2ality.com/2017/08/promise-callback-data-flow.html
 * @see https://medium.com/teamzerolabs/start-here-zero-to-javascript-callback-fetching-data-working-with-json-4f68e48668ce
 */
export function showAvatar() {
  return fetch("./user.json") // read the JSON file
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("No user json file found.");
      }
    })
    .catch((error) => {
      alert(`${error}`);
      // don't return anything => execution goes the normal way
    })
    .then((user) => {
      // read github user
      return fetch(`https://api.github.com/users/${user.name}`);
    })
    .then((githubResponse) => {
      return githubResponse.json();
    })
    .then((githubUser) => {
      // show the avatar
      const img = document.createElement("img");
      img.src = githubUser.avatar_url;
      img.className = "promise-avatar-example";
      document.body.append(img);
      return { user: githubUser, avatar: img, sec: 10000 };
    })
    .then((data) => {
      // wait data.sec seconds
      const p = new Promise((resolve, reject) => {
        setTimeout(resolve, data.sec);
      });
      return Promise.all([p, data.user, data.avatar]); // (A)
    })
    .then(([result, user, img]) => {
      // remove the image
      img.remove();
      return user;
    });
}
