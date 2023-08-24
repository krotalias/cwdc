/**
 * @file
 *
 * Summary.
 * <p>Codeplayer is a sandbox for writing HTML/CSS/JAVASCRIPT code.</p>
 *
 *  Description.
 *  <p>There are three panels (textarea) to input the code
 *     and a fourth output panel (iframe) to display the result.</p>
 * <ul>
 *  <li> HTML panel</li>
 *  <li> CSS panel. </li>
 *  <li> Javascript panel.</li>
 *  <li> Output panel.</li>
 * </ul>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm8 (or npm9)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-codeplayer codeplayer.js
 *  </pre>
 *
 *  @see <a href="/cwdc/4-jquery/4.15.html">link</a>
 *  @see <a href="/cwdc/4-jquery/codeplayer.js">source</a>
 *  @author Paulo Roma Cavalcanti
 *  @since 20/01/2021
 */

/** Create a page with the html and css from the first two panels and run it on the iframe panel. <br>
 *  Then, inject javascript code from the javascript panel (to modify the html from the htmlPanel)
 *  into the iframe.
 *
 *  <p>The eval() function evaluates JavaScript code represented as a string (dangerous!).</p>
 *  <ul>
 *      <li>$("#javascriptPanel").val() -> "document.getElementById(\"paragraph\").innerHTML = \"Hello World!\";"
 *      <li>eval() -> "Hello My World!"
 *  </ul>
 *
 *  @see https://api.jquery.com/contents/
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
 */
function updateOutput() {
  $("iframe")
    .contents()
    .find("html")
    .html(
      "<html><head><style type='text/css'>" +
        $("#cssPanel").val() + // get the code in cssPanel
        "</style></head><body>" +
        $("#htmlPanel").val() + // get the code in htmlPanel
        "</body></html>"
    );

  // Inject javascript code.
  document
    .getElementById("outputPanel")
    .contentWindow.eval($("#javascriptPanel").val());
}

/**  @name hover
 *   @function
 *
 *   @description
 *   Bind one or two handlers to the matched elements, to be executed
 *   when the mouse pointer enters and leaves the elements.
 *
 *   @see https://api.jquery.com/hover/
 */
$(".toggleButton").hover(
  function () {
    $(this).addClass("highlightedButton");
  },
  function () {
    $(this).removeClass("highlightedButton");
  }
);

/** @name anonymous function
 *  @function
 *
 *  @description
 *  Define the callbacks for the events of page load and page resize,
 *  so the size of the browser viewport is continuously displayed on screen.
 */
(function () {
  window.onresize = displayWindowSize;
  window.onload = displayWindowSize;

  /** @name displayWindowSize
   *  @function
   *
   *  @description
   *  Display the size of the browser window.
   *
   *  <p>The innerWidth is width (in pixels) of the browser window viewport including,
   *  if rendered, the vertical scrollbar.</p>
   *
   *  <p>The outerWidth property returns the outer width of the browser window
   *  (width of the client window),
   *  including all interface elements (like toolbars/scrollbars).</p>
   *
   *  Therefore outerWidth can be less than innerWidth when your page is just
   *  zoomed in, or page view is scaled up.
   *
   *  <p>Uses an ID "screen" to display the values.</p>
   *  <ul>
   *      <li> document.getElementById("screen").innerHTML = "(" + iWidth + " &times; " + iHeight + ")";
   *  </ul>
   */
  function displayWindowSize() {
    let iWidth = window.innerWidth;
    let iHeight = window.innerHeight;
    let oWidth = window.outerWidth;
    let oHeight = window.outerHeight;
    $("#screen").html(
      `(${iWidth} &times; ${iHeight}) - (${oWidth} &times; ${oHeight})`
    );
  }
})();

/** Textarea background color. */
var txtbgcolor = "antiquewhite";

var previousId = "html";
/** A global CSS variable holding the textarea color.
 * The variable can be accessed using DOM:
 * <ul>
 *    <li>getComputedStyle(document.querySelector(':root')).getPropertyValue('--txtcolor');
 * </ul>
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 */
var txtcolor = $(":root").css("--txtcolor");

/** Associate a button id to its corresponding panel #id selector.
 */
var panels = [];
panels["html"] = "#htmlPanel";
panels["css"] = "#cssPanel";
panels["javascript"] = "#javascriptPanel";
panels["output"] = "#outputPanel";

/** @name click
 *  @function
 *
 *  @description
 *  Callback for a button click event.
 *
 *  <p>If the output button is clicked, the initial iframe contents is reloaded.</p>
 *
 *  Going back to the inital page after following an external link,
 *  generates a cross-origin error.<br>
 *  It is necessary to load a blank page to reset the iframe element, which
 *  can be accomplished this way:
 *  <ul>
 *     <li> document.getElementById("outputPanel").src = "about:blank";
 *  </ul>
 *
 *  @see https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
 *  @see https://api.jquery.com/toggleclass/
 */
$(".toggleButton").click(function () {
  // change the color of the clicked button.
  $(this).toggleClass("active");
  // remove highlight of the clicked button.
  $(this).removeClass("highlightedButton");
  // Button id: html, css, javascript or output
  var panelId = $(this).attr("id");
  // hide or show the clicked panel.
  $(panels[panelId]).toggleClass("hidden");

  if (panelId != "output") {
    $(panels[previousId]).css("background-color", txtcolor);

    if ($(panels[panelId]).hasClass("hidden")) {
      for (var key in panels) {
        // look for the first visible panel
        if (!$(panels[key]).hasClass("hidden")) {
          $(panels[key]).css("background-color", txtbgcolor);
          $(panels[key]).select();
          $(panels[key]).focus();
          previousId = key;
          break;
        }
      }
    } else {
      $(panels[panelId]).css("background-color", txtbgcolor);
      $(panels[panelId]).select();
      $(panels[panelId]).focus();
      previousId = panelId;
    }
  } else {
    if (!$(panels[panelId]).hasClass("hidden")) updateOutput();
    else $("iframe").attr("src", "about:blank");
  }
  // visible panels = number of panels less the number of hidden panels.
  var numberOfActivePanels = 4 - $(".hidden").length;

  // set the width of the remaining panels.
  $(".panel").width($(window).width() / numberOfActivePanels - 10);
});

$(".panel").height($(window).height() - $("#header").height() - 15);

// initially, there are only two panels
$(".panel").width($(window).width() / 2 - 10);

// select the first panel.
$(panels["html"]).css("background-color", txtbgcolor);

updateOutput();

// If text is changed, or pasted something, into any textarea.
$("textarea").on("change keyup paste", function () {
  updateOutput();
});
