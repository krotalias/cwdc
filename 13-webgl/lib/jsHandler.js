/*
 * This function is defined in a file jsHandler.js and it is included
 * in all our pages at the top. Once this file is included
 * you can use
 *    include("abc.js");
 * any where you want.
 *
 * @since 18/01/2016
 * @see https://forums.digitalpoint.com/threads/how-do-i-include-a-javascript-file-in-a-javascript-file.146094/
 */

function include(filename) {
    var head = document.getElementsByTagName("head")[0];

    script = document.createElement("script");
    script.src = filename;
    script.type = "text/javascript";

    head.appendChild(script);
}
