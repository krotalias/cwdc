/**
 * @file
 *
 * Summary.
 *
 * <p>Print DOM tree.</p>
 *
 * @author F. Permadi ({@link https://www.permadi.com/})
 * @author Paulo Roma (ES6 version)
 * @since 2005
 * @copyright 2005-2025
 * @see <a href="/cwdc/10-html5css3/DOM.js">source</a>
 * @see {@link https://www.permadi.com/tutorial/domTree/index.html Traversing & Printing The DOM TREE of an HTML Element}
 */
"use strict";

/** Line feed character. */
const linefeed = "<br>\n";

/** White space character. */
const space = "&nbsp;&nbsp;";

/** White space plus a vertical bar. */
const verticalbar = "&nbsp;&nbsp;&#124;";

/** Dash. */
const dash = "&#11153;";

/**
 * Get all attribute names of a given element.
 *
 * @global
 * @function
 * @param {HTMLNode} el element.
 * @return {String} all atributes concatenated in a string: name="value" ...
 */
const getAllAttributes = (el) =>
  el.getAttributeNames().reduce((str, name) => {
    str += ` ${name}=\"${el.getAttribute(name)}\"`;
    return str;
  }, "");

/**
 * <p>Traverses the DOM tree starting at an element and prints the tree.</p>
 * This function is called recursively until the tree is fully traversed.
 *
 * @param {Window} targetDocument where the tree will be printed to.
 * @param {HTMLNode} currentElement root element.
 * @param {Number} depth the depth of the current element.
 */
function traverseDOMTree(targetDocument, currentElement, depth = 1) {
  if (currentElement) {
    const tagName = currentElement.tagName;

    // Prints the node tagName, such as <A>, <IMG>, etc
    if (tagName) {
      targetDocument.write(
        `&lt;${tagName}${getAllAttributes(currentElement.toLowerCase())}&gt`,
      );
    } else {
      if (currentElement.nodeType === Node.TEXT_NODE)
        targetDocument.write(`"${currentElement.data}"`);
      else targetDocument.write("[unknown tag]");
    }

    // Traverse the tree
    let i = 0;
    const currentElementChild = currentElement.childNodes[i];

    while (currentElementChild) {
      // Formatting code (indent the tree so it looks nice on the screen)
      targetDocument.write(linefeed);
      for (let j = 0; j < depth; j++) {
        targetDocument.write(verticalbar);
      }
      targetDocument.writeln(linefeed);
      for (let j = 0; j < depth; j++) {
        targetDocument.write(verticalbar);
      }
      if (tagName) targetDocument.write(dash);

      // Recursively traverse the branches of the child node
      traverseDOMTree(targetDocument, currentElementChild, depth + 1);
      i++;
      currentElementChild = currentElement.childNodes[i];
    }
    // The remaining code is mostly for formatting the tree
    targetDocument.writeln(linefeed);
    for (let j = 0; j < depth - 1; j++) {
      targetDocument.write(verticalbar);
    }
    targetDocument.write(space);
    if (tagName && tagName != "BR")
      targetDocument.write(`&lt;/${tagName.toLowerCase()}&gt;`);
  }
}

/**
 * <p>Traverses the DOM tree starting at an element and returns the tree as a string.</p>
 * This function is called recursively until the tree is fully traversed.
 *
 * @param {HTMLNode} currentElement root element.
 * @param {Number} depth the depth of the current element.
 * @return {String} DOM tree as a string.
 */
function DOMTreeToString(currentElement, depth = 1) {
  if (currentElement) {
    const tagName = currentElement.tagName;
    const domStr = "";

    // Prints the node tagName, such as <A>, <IMG>, etc
    if (tagName) {
      domStr += `&lt;${tagName.toLowerCase()}${getAllAttributes(
        currentElement,
      )}&gt`;
    } else {
      if (currentElement.nodeType === Node.TEXT_NODE)
        domStr += `"${currentElement.data}"`;
      else domStr += "[unknown tag]";
    }

    // Traverse the tree
    let i = 0;
    const currentElementChild = currentElement.childNodes[i];

    while (currentElementChild) {
      // Formatting code (indent the tree so it looks nice on the screen)
      domStr += linefeed;
      for (let j = 0; j < depth; j++) {
        domStr += verticalbar;
      }
      domStr += linefeed;
      for (let j = 0; j < depth; j++) {
        domStr += verticalbar;
      }
      if (tagName) domStr += dash;

      // Recursively traverse the branches of the child node
      domStr += DOMTreeToString(currentElementChild, depth + 1);
      i++;
      currentElementChild = currentElement.childNodes[i];
    }
    // The remaining code is mostly for formatting the tree
    domStr += linefeed;
    for (let j = 0; j < depth - 1; j++) {
      domStr += verticalbar;
    }
    domStr += space;
    if (tagName && tagName != "BR")
      domStr += `&lt;/${tagName.toLowerCase()}&gt;`;
  }
  return domStr;
}

/**
 * Acepts a DOM element as parameter and prints
 * out the DOM tree structure rooted at the element.
 *
 * @param {HTMLNode} domElement root element.
 * @param {Window} destinationWindow if not specified, the tree is printed in a new window.
 */
function printDOMTree(domElement, destinationWindow) {
  // Use destination window to print the tree.
  const outputWindow = destinationWindow;

  if (!outputWindow)
    outputWindow = window.open(
      `${window.location.protocol}://${window.location.hostname}/`,
      "_blank",
    );

  // make a valid html page
  outputWindow.document.open("text/html", "replace");
  outputWindow.document.writeln(`<!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
      <title>DOM</title>
    </head>
    <body style="background-color:white;">
      <code>
        ${DOMTreeToString(domElement)}
      </code>
    </body>
  </html>
  `);

  // The document should be closed. Otherwise, Mozilla browsers might keep showing
  // "loading in progress".
  outputWindow.document.close();
}
