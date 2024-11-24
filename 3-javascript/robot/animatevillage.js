/** @module */

/**
 * @file
 *
 * Summary.
 * <p>Animation module for the robot.</p>
 *
 *  Description.
 *  <p>The class Animation aims at providing the methods for animating the robot movement
 *     during its task of delivering parcels.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit or
 *     - sudo npm install -g jsdoc
 *  - MacOS:
 *     - sudo port install npm9 (or npm10)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-village animatevillage.js
 *  </pre>
 *
 * @author {@link https://marijnhaverbeke.nl Marijn Haverbeke}
 * @author Paulo Roma (ES6 version)
 * @since 06/07/2021
 * @see <a href="../robot.html">Robot</a>
 * @see <a href="../animatevillage.js">source</a>
 * @see {@link https://eloquentjavascript.net/code/animatevillage.js source from the book}
 * @see {@link https://eloquentjavascript.net/07_robot.html Project: A Robot}
 */

/// <reference path="07a_robot.js" />

"use strict";

/**
 * Animation instance exposed to the window object as a property.
 * @type {Animation}
 */
let active = null;

/**
 * A dictionary for associating coordinates to the locations of the village.
 * @type {Object<{String:Object<{x:Number,y:Number}>}>}
 */
const places = {
  "Alice's House": { x: 279, y: 100 },
  "Bob's House": { x: 315, y: 203 },
  Cabin: { x: 372, y: 67 },
  "Daria's House": { x: 183, y: 285 },
  "Ernie's House": { x: 50, y: 283 },
  Farm: { x: 86, y: 118 },
  "Grete's House": { x: 35, y: 187 },
  Marketplace: { x: 162, y: 110 },
  "Post Office": { x: 205, y: 57 },
  Shop: { x: 137, y: 212 },
  "Town Hall": { x: 202, y: 213 },
};

/**
 * The places of the village.
 * @type {String}
 */
const placeKeys = Object.keys(places);

/**
 * Animation speed in fps.
 * @type {Number}
 */
const speed = 2;

/**
 * <p>Class for building the html elements necessary to depict
 * the village of Meadowfield, the parcels, and the robot.</p>
 * It also schedules the animation process.
 * @global
 */
class Animation {
  /**
   * @param {VillageState} worldState state of the village.
   * @param {robotCallback} robot a robot type (algorithm).
   * @param {Array<String>} robotState route to be followed (memory).
   * @param {Boolean} [start=true] whether the animation should begin immediately.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/transitionend_event Element: transitionend event}
   */
  constructor(worldState, robot, robotState, start = true) {
    /**
     * State of the village.
     * @member {VillageState}
     */
    this.worldState = worldState;

    /**
     * Robot type.
     * @member {robotCallback}
     */
    this.robot = robot;

    /**
     * Robot's route.
     * @type {Array<String>}
     */
    this.robotState = robotState;

    /**
     * Number of robot movements.
     * @type {Number}
     */
    this.turn = 0;

    /**
     * Array with a DOM node for each parcel in the world.
     * @type {Array<HTMLElement>}
     */
    this.parcels = [];

    const outer = window.__sandbox
        ? window.__sandbox.output.div
        : document.querySelector("#robotUI"),
      doc = outer.ownerDocument;

    /**
     * Node holding the image background, robot, parcels, and button.
     * @type {HTMLElement}
     */
    this.node = outer.appendChild(doc.createElement("div"));
    this.node.style.cssText =
      "position: relative; line-height: 0.1; margin-left: 0px";
    this.map = this.node.appendChild(doc.createElement("img"));
    this.map.src = "img/village2x.png";
    this.map.style.cssText =
      "vertical-align: -8px; border: 5px solid #555; margin-bottom: 1rem;";
    this.robotElt = this.node.appendChild(doc.createElement("div"));
    // CSS transitions allows you to change property values smoothly, over a given duration.
    this.robotElt.style.cssText = `position: absolute;
                transition: left ${0.8 / speed}s, top ${0.8 / speed}s;`;
    const robotPic = this.robotElt.appendChild(doc.createElement("img"));
    robotPic.src = "img/robot_moving2x.gif";

    this.node.appendChild(doc.createElement("div"));
    this.text = this.node.appendChild(doc.createElement("span"));
    this.button = this.node.appendChild(doc.createElement("button"));
    this.button.style.cssText = `color: white;
                                   background: #28b;
                                   border: none;
                                   border-radius: 2px;
                                   padding: 2px 5px;
                                   line-height: 1.1;
                                   font-family: sans-serif;
                                   font-size: 80%`;

    this.button.addEventListener("click", () => this.clicked());

    // should the game begin started or stopped?
    if (!start) {
      this.button.textContent = "Start";
    } else {
      this.button.textContent = "Stop";
      this.schedule();
    }

    this.updateView();
    this.updateParcels();
    // when the robot reaches its final position, then update its parcels.
    this.robotElt.addEventListener("transitionend", () => this.updateParcels());
  }

  /** Deletes all created elements. */
  deleteNode() {
    this.node.remove();
  }

  /** Updates the robot position in the village. */
  updateView() {
    const pos = places[this.worldState.place];
    this.robotElt.style.top = pos.y - 38 + "px";
    this.robotElt.style.left = pos.x - 16 + "px";

    this.text.textContent = `\u00A0➔ Turn ${this.turn} `;
  }

  /**
   * <p>Updates the parcels in the village. </p>
   * <ul>
   * <li> <a href="../img/parcel2x.png">parcel2x.png</a> is an image 16 x 176 (a pile of 11 letters of 16px height each).</li>
   * <li> <a href="../img/robot_idle2x.png">robot_idle2x.png</a> is an image 40 x 40 </li>
   * </ul>
   * <p>We need to stack a piece of the parcel2x image, for each parcel, as a background image.</p>
   * <ul>
   * <li>The background-position property in CSS allows you to move
   * a background image (or gradient) around within its container.</li>
   * <li>An element with position: absolute; is positioned relative to the nearest positioned ancestor (e.g., robot)<br>
   * (instead of positioned relative to the viewport, like fixed).</li>
   * </ul>
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position background-position}
   * @see {@link https://www.w3schools.com/css/css_positioning.asp CSS Layout - The position Property}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/remove Element: remove() method}
   */
  updateParcels() {
    while (this.parcels.length) this.parcels.pop().remove();
    const heights = {};
    for (const { place, address } of this.worldState.parcels) {
      const height = heights[place] || (heights[place] = 0);
      heights[place] += 14;
      const node = document.createElement("div");
      const offset = placeKeys.indexOf(address) * 16;
      node.style.cssText = `position: absolute;
                              height: 16px;
                              width: 16px;
                              background-image: url(img/parcel2x.png);
                              background-position: 0 -${offset}px`;
      if (place == this.worldState.place) {
        // parcel stays with the robot
        node.style.left = "25px"; // more or less at the middle of the robot width
        node.style.bottom = 20 + height + "px"; // bottom at the middle of the robot height
        this.robotElt.appendChild(node);
      } else {
        // parcel is put on a village place
        const pos = places[place];
        node.style.left = pos.x - 5 + "px";
        node.style.top = pos.y - 10 - height + "px";
        this.node.appendChild(node);
      }
      this.parcels.push(node);
    }
  }

  /** Draws a frame of the animation. */
  tick() {
    const { direction, memory } = this.robot(this.worldState, this.robotState);
    this.worldState = this.worldState.move(direction);
    this.robotState = memory;
    this.turn++;
    this.updateView();
    if (this.worldState.parcels.length == 0) {
      this.button.remove();
      this.text.textContent = `\u00A0➔ Finished after ${this.turn} turns`;
      this.robotElt.firstChild.src = "img/robot_idle2x.png";
    } else {
      this.schedule();
    }
  }

  /** Schedules one frame of the animation. */
  schedule() {
    this.timeout = setTimeout(() => this.tick(), 1000 / speed);
  }

  /** Start / Stop the animation. */
  clicked() {
    if (this.timeout == null) {
      this.schedule();
      this.button.textContent = "Stop";
      this.robotElt.firstChild.src = "img/robot_moving2x.gif";
    } else {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.button.textContent = "Start";
      this.robotElt.firstChild.src = "img/robot_idle2x.png";
    }
  }
}

/**
 * Function exported to
 * trigger the animation process.
 *
 * @param {VillageState} worldState state of the village.
 * @param {robotCallback} robot a robot type (algorithm).
 * @param {Array<String>} robotState route to be followed (memory).
 * @param {Boolean} start whether the animation should begin immediately.
 * @returns {Animation} animation object.
 */
export function runRobotAnimation(worldState, robot, robotState, start) {
  if (active && active.timeout != null) clearTimeout(active.timeout);
  active = new Animation(worldState, robot, robotState, start);
  return active;
}
