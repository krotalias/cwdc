/** @module */

/**
 *
 *
 * @file
 *
 * Summary.
 * <p>Run the robot code on the browser.</p>
 *
 * This version differs from the original code of the {@link https://eloquentjavascript.net/code/ book},
 * mainly because it uses ES6 modules and cookies for saving the state of
 * the application.
 *
 * <pre>
 *  Documentation:
 *  - jsdoc -d doc-robot 07a_robot.js animatevillage.js runrobot.js
 * </pre>
 *
 * @author Paulo Roma
 * @since 22/11/2024
 * @see <a href="../robot.html">Robot</a>
 * @see <a href="../runrobot.js">source</a>
 * @see {@link https://eloquentjavascript.net/07_robot.html Project: A Robot}
 * @see <iframe title="Robot" style="width: 580px; height: 450px; transform-origin: 0px 20px; transform: scale(0.8);" src="/cwdc/3-javascript/robot/robot.html"></iframe>
 */
import {
  roadGraph,
  VillageState,
  randomRobot,
  routeRobot,
  goalOrientedRobot,
  lazyRobot,
  runRobot,
} from "./07a_robot.js";

import { runRobotAnimation } from "./animatevillage.js";

console.log(roadGraph);

/**
 * The village state: robot place and parcels.
 * @type {VillageState}
 */
let task;

/**
 * Animation object.
 * @type {Animation}
 */
let anim = null;

/**
 * Array of robot strategies.
 * @type {Array<function>}
 */
const rtypes = [randomRobot, routeRobot, goalOrientedRobot, lazyRobot];

/**
 * <p>Creates a new task with a random {@link VillageState village state}
 * with the selected number of parcels and run the {@link module:animatevillage.runRobotAnimation animation}.</p>
 * If a &lt;select&gt; element is given, its selectedIndex is saved in the cookie "nparcels".<br>
 * Otherwise, the number of parcels and robot type are read from the cookies "nparcels" and "robots":<br>
 *
 * <pre>
 *      document.cookie → "nparcels=0; robots=1;"
 * <code>
 *      Name        Value     Domain                  Path    Expires     Size
 *      nparcels    0         krotalias.github.io     /       Session     9 B
 *      robot       1         krotalias.github.io     /       Session     7 B
 * </code>
 * </pre>
 * @param {HTMLSelectElement} selectedOption select element.
 */
function newTask(selectedOption) {
  // save the current selection in a cookie
  if (selectedOption) {
    document.cookie = `nparcels = ${selectedOption.selectedIndex}; path=/;`;
  } else {
    ["nparcels", "robots"].forEach((elmt) => {
      const cind = document.cookie.indexOf(elmt);
      if (cind != -1) {
        const semicolon = `${document.cookie};`.indexOf(";", cind);
        document.getElementById(elmt).selectedIndex = document.cookie.substring(
          cind + elmt.length + 1,
          semicolon,
        );
      }
    });
  }
  const nparcels = document.getElementById("nparcels").value;
  task = VillageState.random(nparcels);
  if (anim == null) {
    const type = document.getElementById("robots").value;
    anim = runRobotAnimation(task, rtypes[type], [], false);
  }
}

/**
 * Run the {@link module:animatevillage.runRobotAnimation animation} for the
 * {@link module:runrobot~task task} selected.
 */
function RobotCode() {
  const type = document.getElementById("robots").value;
  if (anim) anim.deleteNode();
  anim = runRobotAnimation(task, rtypes[type], []);
}

/**
 * Run the code with a {@link module:07a_robot.runRobot textual output} for the
 * {@link module:runrobot~task task} selected.
 */
function runRobotCode() {
  const type = document.getElementById("robots").value;
  const nparcels = document.getElementById("nparcels").value;
  document.write(`Robot Type: ${rtypes[type].prototype.constructor.name} <br>`);
  document.write(`Number of Parcels: ${nparcels} <br>`);
  runRobot(task, rtypes[type], []);
}

/**
 * <p>Executed when the "Animate Robot" button is clicked.</p>
 *
 * <p>The click event is fired when a point-device button is pressed, a touch gesture is performed or
 * a user interaction that is equivalent to a click is performed by pressing a key (Enter or Space).</p>
 *
 * <p>The callback argument sets the {@link module:runrobot~RobotCode callback}
 * that will be invoked when the event is dispatched.</p>
 *
 * @event click-oriented
 * @param {PointerEvent} event a mouse or touch event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
document
  .querySelector("#oriented")
  .addEventListener("click", (event) => RobotCode());

/**
 * <p>Executed when the "Run Robot" button is clicked.</p>
 *
 * <p>The click event is fired when a point-device button is pressed, a touch gesture is performed or
 * a user interaction that is equivalent to a click is performed by pressing a key (Enter or Space).</p>
 *
 * <p>The callback argument sets the {@link module:runrobot~runRobotCode callback}
 * that will be invoked when the event is dispatched.</p>
 *
 * @event click-run
 * @param {PointerEvent} event a mouse or touch event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
document
  .querySelector("#run")
  .addEventListener("click", (event) => runRobotCode());

/**
 * <p>Executed when the "New Task" button is clicked.</p>
 *
 * <p>The click event is fired when a point-device button is pressed, a touch gesture is performed or
 * a user interaction that is equivalent to a click is performed by pressing a key (Enter or Space).</p>
 *
 * <p>The callback argument sets the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Location/reload callback}
 * that will be invoked when the event is dispatched.</p>
 *
 * @event click-task
 * @param {PointerEvent} event a mouse or touch event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
document
  .querySelector("#task")
  .addEventListener("click", (event) => location.reload());

/**
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The callback argument sets the {@link module:runrobot~newTask callback} that will be invoked when
 * the event is dispatched.</p>
 * @summary Executed when the nparcels &lt;select&gt; is changed.
 *
 * @event change-nparcels
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
document
  .querySelector("#nparcels")
  .addEventListener("change", (event) => newTask(event.target));

/**
 * <p>Appends an event listener for events whose type attribute value is change.<br>
 * The argument sets the
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie callback}
 * that will be invoked when
 * the event is dispatched.</p>
 * @summary Executed when the robots &lt;select&gt; is changed.
 *
 * @event change-robots
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
document.querySelector("#robots").addEventListener("change", (event) => {
  document.cookie = `robots = ${event.target.selectedIndex}; path=/;`;
});

/**
 * <p>Loads the application.</p>
 * <p>The load event is fired when the whole page has loaded,
 * including all dependent resources such as stylesheets,
 * scripts, iframes, and images, except those that are loaded lazily.</p>
 *
 * <p>The callback argument sets the {@link module:runrobot~newTask callback}
 * that will be invoked when the event is dispatched.</p>
 * @event load
 * @param {event} event a generic event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
addEventListener("load", (event) => newTask());
