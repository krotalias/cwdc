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
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 *  @see https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys
 */
function interleave(arr1, arr2) {
  return arr1.reduce((accumulator, currentValue, currentIndex) => {
    return arr2[currentIndex] == undefined
      ? accumulator // arr2 is over.
      : accumulator.concat(
          `${currentValue.toString()} - ${arr2[currentIndex]}`
        );
  }, []);
}

/**
 *  Removes the element with a given id.
 *  @param {string} id element id.
 */
function del(id) {
  let elem = document.getElementById(id);
  if (elem != null) elem.remove();
}

/**
 *  Returns all descendants of a given node.
 *  Performs a shallow traverse.
 *
 *  @param {HTMLElement} element given node.
 *  @return {Object<Array<HTMLElement>,string>} object of elements.
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes
 *  @see https://developer.mozilla.org/en-US/docs/Web/API/Element/children
 *  @see https://www.oreilly.com/library/view/dom-enlightenment/9781449344498/ch01.html
 */
function getDescendants(element) {
  var text = [];
  var nodes = [];
  for (var i = 0, n = element.childNodes.length; i < n; i++) {
    var child = element.childNodes[i];
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
 * Creates some nodes using the DOM API.
 *
 * In JavaScript, functions are first-class objects,
 * because they can have properties and methods, just like any other object.
 * What distinguishes them from other objects is that functions can be called.
 * In brief, they are Function objects.
 *
 * @param {string} divp the ID of the parent element.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
 */
function createNodes(divp) {
  var indices = [...Array(10).keys()]; // spread operator

  var teams = new Array();

  teams[0] = "Fluminense";

  teams[1] = "Flamengo";

  if (typeof createNodes.counter == "undefined") {
    // No counter yet? ... perform the initialization
    createNodes.counter = 0;
  } else {
    ++createNodes.counter;
  }

  var x = teams.join(", ").toString();

  document.getElementById(
    "teams"
  ).innerHTML = `&lt;${divp}&gt;\n\nArray teams = [${x}]`;

  var tweets = [
    "Joe Biden got 306 delegates!",
    "Donald Trump got 232 delegates!",
  ];

  tweets.push("Game over and go back to work!");

  let i = createNodes.counter % tweets.length;

  // ["0 - Joe Biden got 306 delegates!", "1 - Donald Trump got 232 delegates!", "2 - Game over and go back to work!"]
  var result = interleave(indices, tweets);
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

  var para = document.createElement("p"); // Create a <p> element

  // Create a text node
  var textnode = document.createTextNode(
    `tweets.splice_${
      createNodes.counter
    } (${i},1,'Vice President!', 'Kamala Harris') =\n${result
      .join("\n")
      .toString()}`
  );

  para.appendChild(textnode); // Append node to <p>
  var element = document.getElementById(divp);
  element.appendChild(para); // Append <p> to <div id=divp>

  element.style.whiteSpace = "pre";
  element.style.background = "lightgray";
  element.style.border = "thick solid #0000FF";
  element.style.width = "400px";
  element.style.paddingLeft = "10px";

  // set a unique id
  let paraid = `para${createNodes.counter.toString()}`;
  para.setAttribute("id", paraid);

  para.style.border = "thick solid red";
  para.style.width = "370px";
  para.style.paddingLeft = "10px";
  para.style.fontFamily = "Times New Roman";
  para.style.background = "antiquewhite";

  // check that the new id has "been created
  console.assert(document.getElementById(paraid) === para);

  // hide the clicked paragraph
  para.onclick = function () {
    para.style.display = "none";
  };

  // delete the last paragraph
  element.ondblclick = function () {
    del(element.lastChild.id);
  };

  window.onkeydown = function (event) {
    if (event.ctrlKey && event.key === "Escape") {
      var div = document.getElementById(divp);
      // make all divp's paragraph children visible again.
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
  <br />to hold the spliced output."
);
