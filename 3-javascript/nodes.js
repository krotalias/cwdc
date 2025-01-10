/**
 *  @file
 *
 *  <p>Creates some arrays and and some nodes using the DOM API.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm6 (or npm7)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-nodes nodes.js
 *
 *  Usage:
 *  - npm init
 *  - npm install readline-sync
 *  - node nodes.mjs [number|string]
 *  </pre>
 *
 *  @author Paulo Roma
 *  @since 08/12/2021
 *  @see <a href="/cwdc/3-javascript/3.9.html">link</a>
 *  @see <a href="/cwdc/3-javascript/nodes.js">source</a>
 */
"use strict";

/** Interleaves two arrays.
 *
 *  @param {Array<number>} arr1 an array of integers.
 *  @param {Array<string>} arr2 an array of strings.
 *  @returns {Array<string>} a new array.
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce Array.prototype.reduce()}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/white-space white-space}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax Spread syntax (...)}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from Array.from()}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys Array.prototype.keys()}
 */
function interleave(arr1, arr2) {
  return arr1.reduce((accumulator, currentValue, currentIndex) => {
    return arr2[currentIndex] == undefined
      ? accumulator // arr2 is over.
      : accumulator.concat(
          `${currentValue.toString()} - ${arr2[currentIndex]}`,
        );
  }, []);
}

/**
 *  Removes the element with a given id.
 *  @param {string} id element id.
 */
function del(id) {
  const elem = document.getElementById(id);
  if (elem != null) elem.remove();
}

/**
 *  <p>Returns all descendants of a given node.</p>
 *  Performs a shallow traverse.
 *
 *  @param {HTMLElement} element given node.
 *  @return {Object<Array<HTMLElement>,string>} object of elements.
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType Node: nodeType property}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes Node: childNodes property}
 *  @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/children Element: children property}
 *  @see {@link https://www.oreilly.com/library/view/dom-enlightenment/9781449344498/ch01.html DOM Enlightenment}
 */
function getDescendants(element) {
  const text = [];
  const nodes = [];
  for (let i = 0, n = element.childNodes.length; i < n; i++) {
    const child = element.childNodes[i];
    if (
      // An Element node like <p> or <div> - 1.
      child.nodeType === Node.ELEMENT_NODE &&
      child.tagName.toLowerCase() !== "script"
    )
      nodes.push(child);
    else if (child.nodeType === Node.TEXT_NODE) {
      // The actual Text inside an Element or Attr,
      // including empty lines - 3.
      text.push(child.data);
    }
  }
  return { "element node": nodes, "text node": text.join("") };
}

/**
 * <p>Creates some nodes using the DOM API.</p>
 *
 * In JavaScript, functions are first-class objects,
 * because they can have properties and methods, just like any other object.
 * What distinguishes them from other objects is that functions can be called.
 * In brief, they are Function objects.
 *
 * @param {string} divp the ID of the parent element.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions Functions}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model Document Object Model (DOM)}
 */
function createNodes(divp) {
  const indices = [...Array(10).keys()]; // spread operator

  const teams = new Array();

  teams[0] = "Fluminense";

  teams[1] = "Flamengo";

  if (typeof createNodes.counter == "undefined") {
    // No counter yet? ... perform the initialization
    createNodes.counter = 0;
  } else {
    ++createNodes.counter;
  }

  const x = teams.join(", ").toString();

  document.getElementById("teams").innerHTML =
    `&lt;${divp}&gt;\n\nArray teams = [${x}]`;

  const tweets = [
    "Joe Biden got 306 delegates!",
    "Donald Trump got 232 delegates!",
  ];

  tweets.push("Game over and go back to work!");

  const i = createNodes.counter % tweets.length;

  // ["0 - Joe Biden got 306 delegates!", "1 - Donald Trump got 232 delegates!", "2 - Game over and go back to work!"]
  let result = interleave(indices, tweets);
  result[i] = `<mark>${result[i]}</mark>`;

  // "Array tweets = <br><mark>0 - Joe Biden got 306 delegates!</mark><br>1 - Donald Trump got 232 delegates!<br>2 - Game over and go back to work!"
  document.getElementById("tweets").innerHTML = `Array tweets = <br>${result
    .join("<br>")
    .toString()}`;

  // replace 1 element starting at i
  tweets.splice(i, 1, "Vice President!", "Kamala Harris");

  console.log(tweets);

  result = interleave(indices, tweets);

  // ----- create paragraph nodes with javascript -----

  const para = document.createElement("p"); // Create a <p> element

  // Create a text node
  const textnode = document.createTextNode(
    `tweets.splice_${
      createNodes.counter
    } (${i},1,'Vice President!', 'Kamala Harris') =\n${result
      .join("\n")
      .toString()}`,
  );

  para.appendChild(textnode); // Append node to <p>
  const element = document.getElementById(divp);
  element.appendChild(para); // Append <p> to <div id=divp>

  element.style.whiteSpace = "pre";
  element.style.background = "lightgray";
  element.style.border = "thick solid #0000FF";
  element.style.width = "400px";
  element.style.paddingLeft = "10px";

  // set a unique id
  const paraid = `para${createNodes.counter.toString()}`;
  para.setAttribute("id", paraid);

  para.style.border = "thick solid red";
  para.style.width = "370px";
  para.style.paddingLeft = "10px";
  para.style.fontFamily = "Times New Roman";
  para.style.background = "antiquewhite";

  // check that the new id has "been created
  console.assert(document.getElementById(paraid) === para);

  /**
   * @summary Hide the clicked paragraph.
   * <p>Callback function {@link createNodes invoked} when the "Try it" button is clicked. </p>
   * <p>The click event is fired when a point-device button is pressed, a touch gesture is performed or
   * a user interaction that is equivalent to a click is performed by pressing a key (Enter or Space).</p>
   * Change the display property to "none" to make the shape disappear and
   * update the reaction time.</p>
   * @event click
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onclick GlobalEventHandlers: onclick}
   */
  para.onclick = function () {
    para.style.display = "none";
  };

  /**
   * @summary Delete the last paragraph.
   * <p>Callback function {@link del invoked} when a paragraph element is double clicked. </p>
   * <p>The dblclick event fires when a pointing device button
   * (such as a mouse's primary button) is double-clicked;
   * that is, when it's rapidly clicked twice on a single element
   * within a very short span of time.</p>
   * @event dblclick
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event GlobalEventHandlers: dblclick}
   */
  element.ondblclick = function () {
    del(element.lastChild.id);
  };

  /**
   * @summary Make all &lt;divp&gt; paragraph {@link getDescendants children}
   * visible again when CTRL+ESC is pressed.
   * <p>The keydown event is fired when a key is pressed.</p
   * @event keydown
   * @param {KeyboardEvent} event keyboard event
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.onkeydown = function (event) {
    if (event.ctrlKey && event.key === "Escape") {
      const div = document.getElementById(divp);
      getDescendants(div)["element node"].forEach((elem) => {
        if (elem.tagName.toLowerCase() === "p") {
          if (elem.style.display == "none") {
            elem.style.borderStyle = "dashed";
            elem.style.display = "block";
          }
        }
      });
    }
  };
}

document.writeln(
  "<br />A new <span style='color: red'>Node</span> will be created... \
  <br />each time the button is clicked, \
  <br />to hold the spliced output.",
);
