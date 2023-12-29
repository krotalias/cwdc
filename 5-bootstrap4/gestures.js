/**
 * @file
 *
 * Captures mouse/touchpad gestures to transform an html element.
 * The code works fine for Safari on macOS.
 *
 * @author Kenneth Auchenberg
 * @since 25/06/2021
 *
 * @see https://stackblitz.com/edit/multi-touch-trackpad-gesture
 */

var node;
var rotation = 0;
var gestureStartRotation = 0;
var gestureStartScale = 0;
var scale = 1;
var posX = 0;
var posY = 0;
var startX;
var startY;

/**
 *   Returns the first Element within the document that matches the specified selector, or group of selectors.
 *   If no matches are found, null is returned.
 *
 *   Here, the frame class/selector just defines a blue rectangle.
 */
var node = document.querySelector(".frame");

var render = () => {
  /**
   *   Tells the browser that you wish to perform an animation and requests that the browser calls
   *   a specified function to update an animation before the next repaint.
   *   The method takes a callback as an argument to be invoked before the repaint.
   *
   *   @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   */
  window.requestAnimationFrame(() => {
    var val = `translate3D(${posX}px, ${posY}px, 0px) rotate(${rotation}deg) scale(${scale})`;
    node.style.transform = val;
  });
};

/**
 *   Use two fingers on touchpad to translate
 *   or scale, if ctrl key is also pressed.
 */
window.addEventListener("wheel", (e) => {
  e.preventDefault();

  if (e.ctrlKey) {
    scale -= e.deltaY * 0.01;
  } else {
    posX -= e.deltaX * 2;
    posY -= e.deltaY * 2;
  }

  render();
});

/**
 *   Use two fingers making circular movements for rotation,
 *   or pinch for zooming.
 */
window.addEventListener("gesturestart", function (e) {
  e.preventDefault();
  startX = e.pageX - posX;
  startY = e.pageY - posY;
  gestureStartRotation = rotation;
  gestureStartScale = scale;
});

/**
 *   Use two fingers making circular movements for rotation,
 *   or pinch for zooming.
 */
window.addEventListener("gesturechange", function (e) {
  e.preventDefault();

  rotation = gestureStartRotation + e.rotation;
  scale = gestureStartScale * e.scale;

  posX = e.pageX - startX;
  posY = e.pageY - startY;

  render();
});

window.addEventListener("gestureend", function (e) {
  e.preventDefault();
});
