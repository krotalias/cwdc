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
 * @returns {Number} device pixel ratio.
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
   * @see {@link https://www.calculatorsoup.com/calculators/technology/ppi-calculator.php ppi calculator}
   * @see {@link https://pcmonitors.info/dell/dell-u2515h-with-25-inch-2560-x-1440-panel/ Dell U2515H pixel density}
   * @see {@link https://blisk.io/devices/details/macbook-air MacBook Air 2017 pixel density}
   * @see <a href="https://dl.dell.com/manuals/all-products/esuprt_laptop/esuprt_inspiron_laptop/inspiron-15-5548-laptop_reference guide_en-us.pdf">Inspiron 5848 pixel density</a>
   * @global
   */
  function displayWindowSize() {
    /**
     * This is css pixels.
     * @type {Number}
     */
    const iWidth = window.innerWidth;
    const iHeight = window.innerHeight;
    /**
     * Menu bar height is 22 px in MacOS
     * (oHeight = sHeight - 22).
     * @type {Number}
     */
    const oWidth = window.outerWidth;
    const oHeight = window.outerHeight;
    let sWidth = screen.width;
    let sHeight = screen.height;

    /**
     * In Firefox, screen.width * window.devicePixelRatio
     * always gives the number of physical device pixels.
     * @type {String}
     */
    const ua = navigator.userAgent.toLowerCase();
    if (~ua.indexOf("firefox")) {
      sWidth *= window.devicePixelRatio;
      sHeight *= window.devicePixelRatio;
      sWidth = sWidth.toFixed(0);
      sHeight = sHeight.toFixed(0);
    }

    if (didZoom) {
      scale = window.visualViewport.scale.toFixed(2);
      zoom = (getDevicePixelRatio() * 100).toFixed(0);
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
                        zoom: (${zoom}%) <br> scale: (${scale})`);
  }
})();
