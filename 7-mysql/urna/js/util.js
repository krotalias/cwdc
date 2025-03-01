/**
 * @file
 *
 * Summary.
 * <p>Communication with the server.</p>
 *
 * Description.
 * <p>The back end runs on the server, while the front end (JavaScript) on the client.<br>
 * The communication between the client and the server is either done via
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form Forms} or
 * {@link https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX Ajax} (asynchronously).</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -r -c ./conf.json -d jsdoc urna/js
 *  </pre>
 *
 * @see <a href="/cwdc/7-mysql/urna/urna.html">link</a>
 * @see <a href="/cwdc/7-mysql/urna/js/util.js">source</a>
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/AJAX
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * @author Bonieky Lacerda e modificado por Paulo Roma Cavalcanti
 * @since 01/08/2022
 */

"use strict";

/**
 * Asynchronous Communication with the PHP server via ajax.
 *
 * @param {String} url string representing the URL to send the request to (script to execute on the server).
 * @param {HTTP_request_method} method GET or POST.
 * @param {function} callback function to call when the response is ready.
 * @param {String} data what to send to the server.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
 * @see https://code.tutsplus.com/tutorials/how-to-use-ajax-in-php-and-jquery--cms-32494
 */
function ajax(url, method, callback, data = null) {
  let request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  // initializes a newly-created request
  request.open(method, url, true);
  request.onreadystatechange = () => {
    if (request.readyState === 4) {
      if (request.status === 200) {
        // the response is ready
        callback(request.responseText);
      } else {
        console.log("Error Code: " + request.status);
        console.log("Error Message: " + request.statusText);
      }
    }
  };
  // Sends the request.
  // If the request is asynchronous (which is the default),
  // this method returns as soon as the request is sent.
  request.send(data);
}
