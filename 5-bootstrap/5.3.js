/**
 * @file
 *
 * Summary.
 * <p>Display information about physical x CSS pixels.</p>
 *
 * @author {@link https://krotalias.github.io Paulo R. Cavalcanti}
 * @license Licensed under the {@link https://www.gnu.org/licenses/lgpl-3.0.en.html LGPLv3}.
 * @copyright © 2024-2026 Paulo R Cavalcanti.
 * @since 26/06/2026
 * @see <a href="/cwdc/5-bootstrap/5.3.html">link</a>
 * @see <a href="/cwdc/5-bootstrap4/5.3.html">link4</a>
 * @see <a href="/cwdc/5-bootstrap/5.3.js">source</a>
 */

"use strict";

const containerElement = document.getElementById("my-container");
const btn = document.getElementById("btn");
const row = document.getElementById("article-row");

/**
 * Test if running in IOS.
 * @type {Boolean}
 */
const isIOS =
  // test for standard iPhone, iPod, and legacy iPad User Agents
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  // test for modern iPads running iPadOS
  // (which mimic macOS but have touch capabilities)
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * Test if running in Safari.
 * @type {Boolean}
 */
const isSafari =
  navigator.vendor &&
  navigator.vendor.indexOf("Apple") > -1 &&
  navigator.userAgent &&
  navigator.userAgent.indexOf("CriOS") == -1 &&
  navigator.userAgent.indexOf("FxiOS") == -1;

function toggleContainer() {
  const newClass =
    containerElement.className == "container" ? "container-fluid" : "container";
  $("#btn").html(containerElement.className);
  containerElement.className = newClass;
}

function verticalAlignment() {
  if (document.getElementById("inlineRadio1").checked) {
    row.className = "row align-items-start mt-5";
  } else if (document.getElementById("inlineRadio2").checked) {
    row.className = "row align-items-center mt-5";
  } else {
    row.className = "row align-items-end mt-5";
  }
}

/**
 * Returns the ratio of the resolution in physical pixels to
 * the resolution in CSS pixels for the current display device.
 * @returns {Number} device pixel ratio (DPR).
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio Window: devicePixelRatio property}
 */
function getDevicePixelRatio() {
  let ratio = 1;
  const ua = navigator.userAgent.toLowerCase();
  // To account for zoom, change to use deviceXDPI instead of systemXDPI
  if (
    window.screen.systemXDPI !== undefined &&
    window.screen.logicalXDPI !== undefined &&
    window.screen.systemXDPI > window.screen.logicalXDPI
  ) {
    // older IE
    // Only allow for values > 1
    ratio = window.screen.systemXDPI / window.screen.logicalXDPI; // IE, ios
  } else if (isIOS) {
    // IOS
    ratio = window.devicePixelRatio;
  } // ~-1 = 0 same as != -1
  else if (~ua.indexOf("safari")) {
    // safari
    ratio = window.outerWidth / window.innerWidth;
  } else if (window.devicePixelRatio !== undefined) {
    // firefox, chrome
    ratio = window.devicePixelRatio; // firefox, chrome
  }
  return ratio;
}

let zoom = (getDevicePixelRatio() * 100).toFixed(0);
let scale = window.visualViewport.scale.toFixed(2);
let DPR = getDevicePixelRatio().toFixed(2);
let didZoom = false;

/**
 * Anonymous Immediately Invoked Function Expression (IIFE)
 * to run the application.
 * @function anonymousIIFE
 */
(function () {
  /**
   * The resize event fires after the window has been resized.
   * @event onresize
   */
  window.onresize = displayWindowSize;

  /**
   * The load event fires when a given resource has loaded.
   * @event onload
   */
  window.onload = displayWindowSize;

  /**
   * Keeping track of zoom in and zoom out.
   * @event onkeydown
   */
  window.onkeydown = function (event) {
    const meta =
      window.navigator.platform.indexOf("Mac") !== -1
        ? event.metaKey
        : event.ctrlKey;
    if (meta && (event.key === "=" || event.key === "-")) {
      didZoom = true;
      //alert("Zoom");
    }
  };

  /**
   * In Firefox (even in macOS), Opera and Chrome,
   * 'meta key + scroll mousewheel' also zooms in and out
   * @event wheel
   */
  window.addEventListener("wheel", function (event) {
    const meta =
      window.navigator.platform.indexOf("Mac") !== -1
        ? event.metaKey
        : event.ctrlKey;
    if (meta) {
      didZoom = true;
    }
  });

  /**
   * The {@link displayWindowSize callback} is not being called,
   * and if called here, the actual resize did not occur yet!
   * @event gesturestart
   */
  window.addEventListener("gesturestart", function (event) {
    didZoom = true;
    displayWindowSize();
    // console.log("didZoom: start");
  });

  /**
   * @event gesturechange
   */
  window.addEventListener("gesturechange", function (event) {
    didZoom = true;
    displayWindowSize();
    // console.log("didZoom: change");
  });

  /**
   * @event gestureend
   */
  window.addEventListener("gestureend", function (event) {
    didZoom = true;
    displayWindowSize();
    // console.log("didZoom: change");
  });

  /**
   * <p>The resize event of the VisualViewport interface is fired when the
   * visual viewport is resized. This allows you to position elements relative
   * to the visual viewport as it is zoomed,
   * which would normally be anchored to the layout viewport.</p>
   * <p>The {@link displayWindowSize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @event viewportResize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport VisualViewport}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport/resize_event VisualViewport: resize event}
   */
  window.visualViewport.addEventListener("resize", () => {
    didZoom = true;
    displayWindowSize();
    // console.log("didZoom: change");
  });

  const viewp = document.getElementById("viewp");

  /**
   * <p>Display the Window inner, outer and screen dimensions in pixels,
   * the device pixel ratio (DPR) or zoom, and the viewport scale
   * in the "screen" element.</p>
   * The standard css pixel length is 1/96 of an inch.
   *
   * @see <a href="../widths.gif"><img src="../widths.gif" height="256"></a>
   * @global
   */
  function displayWindowSize() {
    /**
     * Scales a rectangle.
     * @param {Number} w width.
     * @param {Number} h height.
     * @param {Number} s scale factor.
     * @returns {Array<Number>} scaled rectangle.
     * @global
     */
    function scaleRec(w, h, s) {
      return [(w * s).toFixed(0), (h * s).toFixed(0)];
    }

    /**
     * <p>The read-only Window property innerWidth returns the interior width
     * of the window in css pixels (that is, the width of the window's layout viewport).
     * That includes the width of the vertical scroll bar, if one is present.</p>
     * If you need to obtain the width of the window minus the scrollbar and borders,
     * use the root <html> element's clientWidth property instead.
     * @type {Number}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth Window: innerWidth property}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts Viewport concepts}
     * @global
     */
    let iWidth = window.innerWidth;
    let iHeight = window.innerHeight;

    /**
     * <p>The Window.outerWidth is the width of the outside of the browser window.</p>
     * It represents the width of the whole browser window including
     * sidebar (if expanded), window chrome and window resizing borders/handles.
     * <p>The menu bar on older macOS versions and standard display settings
     * use 22 to 24 pixels. If the meu bar is not hidden, oHeight = sHeight - 22.</p>
     * @type {Number}
     * @global
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/outerWidth Window: outerWidth property}
     * @see {@link https://support.apple.com/guide/mac-help/whats-in-the-menu-bar-mchlp1446/mac What’s in the menu bar on Mac?}
     */
    let oWidth = window.outerWidth;
    let oHeight = window.outerHeight;

    /**
     * <p>The Screen.width read-only property returns the width of the screen
     * in CSS pixels.</p>
     * @type {Number}
     * @global
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Screen/width Screen: width property}
     */
    let sWidth = screen.width;
    let sHeight = screen.height;

    if (isIOS) {
      // we need the real width
      // firefox and chrome divides screen.width by dpr
      const dpr = getDevicePixelRatio();
      [sWidth, sHeight] = scaleRec(sWidth, sHeight, dpr);
      [oWidth, oHeight] = scaleRec(oWidth, oHeight, dpr);
    } else if (!isSafari) {
      const vps = 1 / window.visualViewport.scale;
      [iWidth, iHeight] = scaleRec(iWidth, iHeight, vps);
    }

    if (didZoom) {
      scale = window.visualViewport.scale.toFixed(2);
      DPR = getDevicePixelRatio();
      zoom = (DPR * 100).toFixed(0);
      DPR = DPR.toFixed(2);
      didZoom = false;
    }
    if (iWidth >= 1200) {
      // .col-xl-
      viewp.className = "col-md-3 bg-warning";
      $("#screen").css("color", "red"); // text color
    } else if (iWidth >= 992) {
      viewp.className = "col-md-3 bg-primary"; // .col-lg-
      $("#screen").css("color", "white");
    } else if (iWidth >= 768) {
      viewp.className = "col-md-3 bg-secondary"; // .col-md-
      $("#screen").css("color", "white");
    } else if (iWidth >= 576) {
      viewp.className = "col-md-3 bg-danger"; // .col-sm-
      $("#screen").css("color", "white");
    } else {
      viewp.className = "col-md-3 bg-light"; // .col-
      $("#screen").css("color", "red");
    }
    $("#screen").html(`inner: (${iWidth} &times; ${iHeight}) css px<br>
                        outer: (${oWidth} &times; ${oHeight}) px<br>
                        screen: (${sWidth} &times; ${sHeight}) px<br>
                        zoom: (${zoom}%) <br>
                        DPR: ${DPR} <br> scale: (${scale})`);
  }
})();
