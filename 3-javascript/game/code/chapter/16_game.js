/** @module 16_game */

/**
 * @file
 *
 * Summary.
 * <p>A small platform game. </p>
 *
 *  Description.
 *  <p>The game consists of a static background, laid out like a grid, with the moving elements overlaid on that background.
 *  Each field on the grid is either empty, solid, or lava. The moving elements are the player, coins, and certain pieces of lava.
 *  The positions of these elements are not constrained to the grid — their coordinates may be fractional, allowing smooth motion.</p>
 *
 *  <p>The main data structure is a matrix of cells (each one is a 20x20 square), which make it easier to intersect the objects of the game,
 *  such as the player against lava, or detect collisions of the player against the walls.
 *  Each one of these cells can be empty (background), or be a convex object (union of cells), such as lava, coin, wall or the player.</p>
 *
 *  <p>The <a href="../test/table.html">matrix</a> of cells is created based on strings on a <a href="../code/levels.js">file</a> (defining the geometry of the levels of the game),
 *  where each character represents either an empty space (a dot) or an object.
 *  As the player moves, the background slides to the right or to the left,
 *  so the player is always in the middle third of the canvas. Therefore, there is a moving window to map
 *  a portion of the current level, to the canvas.</p>
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm9 (or npm10)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-game code/chapter/16_game.js code/levels.mjs canvas.js
 *  </pre>
 *
 *  @author Marijn Haverbeke ({@link https://marijnhaverbeke.nl})
 *  @author Paulo Roma (adapted to ES6)
 *  @since 06/07/2021
 *  @see <a href="/cwdc/3-javascript/game/game.html?driver=d">Game</a>
 *  @see <a href="/cwdc/3-javascript/game/code/chapter/16_game.js">source</a>
 *  @see <a href="/cwdc/3-javascript/game/code/levels.js">levels</a>
 *  @see {@link https://eloquentjavascript.net/16_game.html Project: A Platform Game}
 *  @see {@link https://flexiple.com/associative-array-javascript/ Associative array in JavaScript}
 *  @see {@link https://www.lessmilk.com/game/dark-blue/ Game: Dark Blue}
 *  @see <img src="../DOM.png" width="512">
 */

/** Simple level plan.
 * @type {String}
 * @see <a href="/cwdc/3-javascript/game/game2.html">Simple Level Plan</a>
 */
const simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

/**
 * <p>Stores a level object. Its argument should be the string that defines the level.</p>
 * So rows holds an array of arrays of characters, the rows of the plan.
 * We can derive the level’s width and height from these.
 * But we must still separate the moving elements from the background grid.
 * We’ll call moving elements actors. They’ll be stored in an array of objects.
 * The background will be an array of arrays of strings, holding field types such as "empty", "wall", or "lava".
 *
 * <p> {@link module:16_game~levelChars levelChars} </p>
 * {
 * <ul style="list-style-type:none">
 *   <li> ".": "empty", </li>
 *   <li> "#": "wall", </li>
 *   <li> "+": "lava", </li>
 *   <li> "@": Player, </li>
 *   <li> "o": Coin, </li>
 *   <li> "=": Lava, </li>
 *   <li> "|": Lava, </li>
 *   <li> "v": Lava </li>
 * </ul>
 * };
 *
 * <p> Going from an array of strings to an object: </p>
 *
 * <pre>
 *   {@link module:16_game~simpleLevelPlan simpleLevelPlan} [6]
 *    . . . . . . # + + + + + + + + + + + + # . . <br>
 *                       ⬇
 *
 *   {@link module:16_game~Level#rows Background Matrix} - Line 6: Array (22)
 *   [
 *    "empty", "empty", "empty", "empty", "empty", "empty",
 *    "wall",  "lava",  "lava",  "lava",  "lava",  "lava",  "lava",
 *    "lava",  "lava",  "lava",  "lava",  "lava",  "lava",  "wall",
 *    "empty", "empty"
 *   ]
 * </pre>
 *
 * <pre>
 *   {@link module:16_game~Level#startActors startActors}
 *   [
 * </pre>
 *    <ul style="list-style-type:none">
 *       <li> Lava {pos: Vec, speed: Vec, reset: undefined, size: Vec} </li>
 *       <li> Coin {pos: Vec, basePos: Vec, wobble: 5.677305209062806, size: Vec} </li>
 *       <li> Coin {pos: Vec, basePos: Vec, wobble: 1.7039202103083562, size: Vec} </li>
 *       <li> Player {pos: Vec, speed: Vec, size: Vec} </li>
 *    </ul>
 * <pre>
 *   ]
 * </pre>
 *
 * <p>An example with nodejs (note the usage of the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax|spread} operator):</p>
 *
 * <pre>
 *   roma: ~$ node
 *   Welcome to Node.js v16.6.1.
 *   Type ".help" for more information.
 *   > s=["abcd","efgh"]
 *   [ 'abcd', 'efgh' ]
 *   > rows = s.map(l=>[...l])
 *   [ [ 'a', 'b', 'c', 'd' ], [ 'e', 'f', 'g', 'h' ] ]
 *   > s
 *   [ 'abcd', 'efgh' ]
 *   >
 * </pre>
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim String.prototype.trim()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split String.prototype.split()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax Spread syntax (...)}
 * @see {@link https://dev.to/sagar/three-dots---in-javascript-26ci Three dots ( … ) in JavaScript}
 */
class Level {
  /**
   * @constructor
   * @param {String} plan level geometry.
   */
  constructor(plan) {
    const rows = plan
      .trim()
      .split("\n")
      .map((l) => [...l]); // spread operator
    /**
     * Matrix height.
     * @type {Number}
     */
    this.height = rows.length;
    /**
     * Matrix width.
     * @type {Number}
     */
    this.width = rows[0].length;
    /**
     * Array of actors (moving elements).
     * @type {Array<Player|Coin|Lava>}
     */
    this.startActors = [];

    /**
     * Background matrix.
     * @type {Array<Array<String>>}
     */
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        const type = levelChars[ch];
        if (typeof type == "string") return type; // "empty" | "wall" | "lava"
        this.startActors.push(type.create(new Vec(x, y), ch)); // Player | Coin | Lava
        return "empty";
      });
    });
  }

  /**
   * This method tells us whether a rectangle (specified by a position and a size)
   * touches a grid element of the given type.
   *
   * @param {Vec} pos rectangle position.
   * @param {Vec} size rectangle size.
   * @param {String} type grid element type.
   * @returns {Boolean} whether the element intersects the given rectangle.
   */
  touches(pos, size, type) {
    const xStart = Math.floor(pos.x);
    const xEnd = Math.ceil(pos.x + size.x);
    const yStart = Math.floor(pos.y);
    const yEnd = Math.ceil(pos.y + size.y);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
        const here = isOutside ? "wall" : this.rows[y][x];
        if (here == type) return true;
      }
    }
    return false;
  }
}

/**
 * As the game runs, actors will end up in different places or even disappear entirely (as coins do when collected).
 * <p>We’ll use a State class to track the state of a running game.</p>
 *
 * @param {Level} level game level.
 * @param {Array<Lava|Coin|Player>} actors actors in this level.
 * @param {"lost" | "won" | "playing"} status game situation.
 */
class State {
  constructor(level, actors, status) {
    /**
     * Game level.
     * @type {Level}
     */
    this.level = level;
    /**
     * Actors in this level.
     * @type {Array<Lava|Coin|Player>}
     */
    this.actors = actors;
    /**
     * Game situation.
     * @type {"lost" | "won" | "playing"}
     */
    this.status = status;
  }

  /**
   * Return the starting state of a given level of the game.
   * @param {Level} level a given level.
   * @returns {State} new state with status "playing".
   */
  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  /**
   * Getter: the first actor in {@link module:16_game~State#actors this.actors} that is a player.
   *
   * @type {Player}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get get}
   */
  get player() {
    return this.actors.find((a) => a.type == "player");
  }

  /**
   * Uses {@link module:16_game~Level#touches touches} to figure out whether the player is touching lava and
   * computes the set of grid squares that the body overlaps with by using Math.floor and Math.ceil on its coordinates.
   * Remember that grid squares are 1 by 1 units in size.
   * By rounding the sides of a box up and down, we get the range of background squares that the box touches.
   *
   * @param {Number} time time step.
   * @param {Object<key:Boolean>} keys object with key pressed.
   * @returns {State} a new state.
   */
  update(time, keys) {
    const actors = this.actors.map((actor) => actor.update(time, this, keys));
    let newState = new State(this.level, actors, this.status);

    if (newState.status != "playing") return newState;

    const player = newState.player;
    if (this.level.touches(player.pos, player.size, "lava")) {
      return new State(this.level, actors, "lost");
    }

    for (const actor of actors) {
      if (actor != player && overlap(actor, player)) {
        newState = actor.collide(newState);
      }
    }
    return newState;
  }
}

/**
 * Used for our two-dimensional values, such as the position and size of actors.
 *
 * @param {Number} x abscissa.
 * @param {Number} y ordinate.
 */
class Vec {
  constructor(x, y) {
    /**
     * Abscissa.
     * @type {Number}
     */
    this.x = x;
    /**
     * Ordinate.
     * @type {Number}
     */
    this.y = y;
  }
  /**
   * Translates a vector by another vector.
   * @param {Vec} other translation vector.
   * @returns {Vec} a new translated vector.
   */
  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  /**
   *  Scales a vector by a given amount.
   *  @param {Number} factor scale factor.
   *  @returns {Vec} a new scaled vector.
   */
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

/**
 * <p>The player class.</p>
 * Because a player is one-and-a-half squares high,
 * its initial position is set to be half a square
 * above the position where the @ character appeared.
 * This way, its bottom aligns with the bottom of the square it appeared in.
 *
 * @param {Vec} pos position.
 * @param {Vec} speed current velocity to simulate momentum and gravity.
 */
class Player {
  constructor(pos, speed) {
    /**
     * Player position.
     * @type {module:16_game~Vec}
     */
    this.pos = pos;
    /**
     * Player speed.
     * @type {module:16_game~Vec}
     */
    this.speed = speed;
  }

  /**
   * Getter: "player".
   *
   * @type {String}
   */
  get type() {
    return "player";
  }

  /**
   * An static Player translated by (0,-0.5).
   *
   * @param {Vec} pos position.
   * @returns {Player} a Player translated by -0.5 in y.
   */
  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0));
  }

  /**
   * <p>Actor objects’ update methods take as arguments the time step,
   * the state object, and a keys object. </p>
   *
   * E.g.: <br>
   * • keys: {ArrowRight: false, ArrowLeft: true, ArrowUp: false} <br>
   * • two keys can be pressed simoutaneously.
   *
   * <p> Actions performed:</p>
   * <ul>
   *  <li> Increases/decreases speed based on the key received. </li>
   *  <li> Gets new player position X: px = vx * t </li>
   *  <li> Gets new player position Y: py = vy + g*t </li>
   *  <li> Updates position x and/or y, if he does not touch any wall. </li>
   *  <li> Return a new player with new position and speed. </li>
   * </ul>
   *
   * @param {Number} time time step.
   * @param {State} state a given game state.
   * @param {Object<key:Boolean>} keys object with key pressed.
   * @returns {Player} new player object.
   */
  update(time, state, keys) {
    let xSpeed = 0;
    if (keys.ArrowLeft) xSpeed -= playerXSpeed;
    if (keys.ArrowRight) xSpeed += playerXSpeed;
    let pos = this.pos;
    const movedX = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, "wall")) {
      pos = movedX;
    }

    let ySpeed = this.speed.y + time * gravity;
    const movedY = pos.plus(new Vec(0, ySpeed * time));
    if (!state.level.touches(movedY, this.size, "wall")) {
      pos = movedY;
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -jumpSpeed;
    } else {
      ySpeed = 0;
    }
    return new Player(pos, new Vec(xSpeed, ySpeed));
  }
}

/**
 * <p>Size: 0.8 x 1.5 </p>
 * The size property is the same for all instances of Player,
 * so we store it on the prototype rather than on the instances themselves.
 * @type {Vec}
 */
Player.prototype.size = new Vec(0.8, 1.5);

/**
 * Lava actor, we need to initialize the object differently depending on the character it is based on.
 * Dynamic lava moves along at its current speed until it hits an obstacle.
 * At that point, if it has a reset property, it will jump back to its start position (dripping).
 * If it does not, it will invert its speed and continue in the other direction (bouncing).
 *
 * @param {Vec} pos position.
 * @param {Vec} speed lava velocity.
 * @param {Boolean} reset flag to indicate a jump back to its start position.
 */
class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  /**
   * Getter: "lava"
   *
   * @type {String}
   */
  get type() {
    return "lava";
  }

  /**
   * Lava with velocity: "=" → (2,0), "|" → (0,2), "v" → (0,3)
   *
   * @param {Vec} pos position.
   * @param {"=" | "|" | "v"} ch character representing lava.
   * @returns {Lava} lava object at the given position.
   */
  static create(pos, ch) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }

  /**
   * If any actor does overlap, its collide method gets a chance to update the state.
   * Touching a lava actor sets the game status to "lost".
   * Coins vanish when you touch them and set the status to "won" when they are the last coin of the level.
   *
   * @param {State} state a given game state.
   * @returns {State} new state with a "lost" status.
   */
  collide(state) {
    return new State(state.level, state.actors, "lost");
  }

  /**
   * Lava objects’ update method take as arguments the time step, and the state object.
   *
   * <p> Actions performed:</p>
   * <ul>
   *  <li> Gets new lava position X: px = vx * t </li>
   *  <li> Gets new lava position Y: py = vy * t </li>
   *  <li> Return a new lava object: </li>
   *  <ul>
   *  <li> If it does not touch any wall: new Lava(newPos, this.speed, this.reset); </li>
   *  <li> else if it touches, and this.reset: return new Lava(this.reset, this.speed, this.reset);
   *  <li> else return new Lava(this.pos: this.speed.times(-1));
   *  </ul>
   * </ul>
   *
   * @param {Number} time time step.
   * @param {State} state a given game state.
   * @returns {Lava} new lava object.
   */
  update(time, state) {
    const newPos = this.pos.plus(this.speed.times(time));
    if (!state.level.touches(newPos, this.size, "wall")) {
      return new Lava(newPos, this.speed, this.reset);
    } else if (this.reset) {
      return new Lava(this.reset, this.speed, this.reset);
    } else {
      return new Lava(this.pos, this.speed.times(-1));
    }
  }
}

/**
 * Size: 1 x 1
 * @type {Vec}
 */
Lava.prototype.size = new Vec(1, 1);

/**
 * Coin actors are relatively simple. They mostly just sit in their place.
 * But to liven up the game a little, they are given a “wobble”, a slight vertical back-and-forth motion.
 *
 * <p>To avoid a situation where all coins move up and down synchronously, the starting phase of each coin is randomized.
 * The period of Math.sin’s wave, the width of a wave it produces, is 2π.
 * We multiply the value returned by Math.random by that number to give the coin a random starting position on the wave.</p>
 *
 * To track this, a coin object stores a base position as well as a wobble property that tracks the phase of the bouncing motion.
 * Together, these determine the coin’s actual position (stored in the pos property).
 *
 * @param {Vec} pos coin position.
 * @param {Vec} basePos base position for the wooble movement.
 * @param {Number} wobble phase for an unsteady movement from side to side.
 */
class Coin {
  constructor(pos, basePos, wobble) {
    /**
     * Coin position.
     * @type {Vec}
     */
    this.pos = pos;
    /**
     * Base position for the wobble movement.
     * @type {Vec}
     */
    this.basePos = basePos;
    /**
     * Phase for an unsteady movement from side to side.
     * @type {Number}
     */
    this.wobble = wobble;
  }

  /**
   * Getter: "coin"
   *
   * @type {String}
   */
  get type() {
    return "coin";
  }

  /**
   * Coin translated by 0.2 x 0.1 and with a random wobble.
   *
   * @param {Vec} pos position.
   * @returns {Coin} a coin object.
   */
  static create(pos) {
    const basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }

  /**
   * Coin objects’ update method take as argument the time step
   * to wobble the coin position.
   *
   * @param {Number} time time step.
   * @returns {Coin} new coin object.
   */
  update(time) {
    const wobble = this.wobble + time * wobbleSpeed;
    const wobblePos = Math.sin(wobble) * wobbleDist;
    return new Coin(
      this.basePos.plus(new Vec(0, wobblePos)),
      this.basePos,
      wobble,
    );
  }

  /**
   * If any actor does overlap, its collide method gets a chance to update the state.
   * Touching a lava actor sets the game status to "lost".
   * Coins vanish when you touch them and set the status to "won" when they are the last coin of the level.
   *
   * @param {State} state a given game state.
   * @returns {State} new state (with status "won" if there is no more coins).
   */
  collide(state) {
    const filtered = state.actors.filter((a) => a != this);
    let status = state.status;
    if (!filtered.some((a) => a.type == "coin")) status = "won";
    return new State(state.level, filtered, status);
  }
}

/**
 * Size: 0.6 x 0.6
 * @type {Vec}
 */
Coin.prototype.size = new Vec(0.6, 0.6);

/**
 * Maps plan characters to either background grid types or actor classes.
 * @type {Object<String:String|Player|Lava|Coin>}
 */
const levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  o: Coin,
  "=": Lava,
  "|": Lava,
  v: Lava,
};

/**
 * Create a Level instance.
 * @type {Level}
 */
const simpleLevel = new Level(simpleLevelPlan);

/**
 * Helper function providing a succinct way to create an element and give it some attributes and child nodes.
 *
 * @param {String} name element name.
 * @param {Array<string>} attrs element attributes.
 * @param {Array<HTMLElement>} children element child nodes.
 * @returns {HTMLElement} created element.
 * @see <a href="../test/table.html">table</a>
 */
function elt(name, attrs, ...children) {
  const dom = document.createElement(name);
  for (const attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (const child of children) {
    dom.appendChild(child);
  }
  return dom;
}

/**
 * A display is created by giving it a parent element to which
 * it should append itself and a level object.
 * It uses DOM elements to show the level.
 */
export class DOMDisplay {
  /**
   * @constructor
   * @param {HTMLElement} parent parent element.
   * @param {Level} level geometry of the level to be drawn.
   */
  constructor(parent, level) {
    this.dom = elt("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  /**
   * Removes this dom game element.
   */
  clear() {
    this.dom.remove();
  }

  /**
   * The syncState method is used to make the display show a given state.
   * It first removes the old actor graphics,
   * if any, and then redraws the actors in their new positions.
   * It may be tempting to try to reuse the DOM elements for actors, but to make that work,
   * we would need a lot of additional bookkeeping to associate actors with
   * DOM elements and to make sure
   * we remove elements when their actors vanish.
   * Since there will typically be only a handful of actors in the game,
   * redrawing all of them is not expensive.
   *
   * @param {State} state game state to be shown.
   */
  syncState(state) {
    if (this.actorLayer) this.actorLayer.remove();
    this.actorLayer = drawActors(state.actors);
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollPlayerIntoView(state);
  }

  /**
   * Find the player’s position and update the wrapping element’s scroll position.
   * We change the scroll position by manipulating that element’s scrollLeft and
   * scrollTop properties when the player is too close to the edge.
   *
   * @param {State} state state of a running game.
   */
  scrollPlayerIntoView(state) {
    const width = this.dom.clientWidth;
    const height = this.dom.clientHeight;
    const margin = width / 3;

    // The viewport
    const left = this.dom.scrollLeft,
      right = left + width;
    const top = this.dom.scrollTop,
      bottom = top + height;

    const player = state.player;
    const center = player.pos.plus(player.size.times(0.5)).times(scale);

    if (center.x < left + margin) {
      this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
      this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
      this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
      this.dom.scrollTop = center.y + margin - height;
    }
  }
}

/**
 * The amount of pixels that a single unit takes up on the screen.
 * @type {Number}
 */
const scale = 20;
window.scale = scale;

/**
 * <p>The level’s background grid, which never changes, is drawn once.</p>
 * Actors are redrawn every time the display is updated with a given state.<br>
 * The actorLayer property will be used to track the element that holds the actors,<br>
 * so that they can be easily removed and replaced.
 *
 * @param {Level} level level to be drawn.
 * @see <a href="../test/table.html">table</a>
 */
function drawGrid(level) {
  return elt(
    "table",
    {
      class: "background",
      style: `width: ${level.width * scale}px`,
    },
    ...level.rows.map((row) =>
      elt(
        "tr",
        { style: `height: ${scale}px` },
        ...row.map((type) => elt("td", { class: type })),
      ),
    ),
  );
}

/**
 * We draw each actor by creating a DOM element for it and
 * setting that element’s position and size based on the actor’s properties.
 * <p>The values have to be multiplied by {@link module:16_game~scale scale} to go from game units to pixels.</p>
 *
 * <p>Each actor has a css class attribute, defining its position, width and height, and is basically a rectangle</p>
 *
 * @param {Array<Lava|Coin|Player>} actors list of actors.
 * @returns {HTMLElement} created actor element.
 * @see <a href="../test/table.html">table</a>
 */
function drawActors(actors) {
  return elt(
    "div",
    {},
    ...actors.map((actor) => {
      const rect = elt("div", { class: `actor ${actor.type}` });
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    }),
  );
}

/**
 * Takes two actor objects and returns true when they touch,<br>
 * which is the case when they overlap both along the x-axis and along the y-axis.
 *
 * @param {Lava|Coin|Player} actor1 first actor.
 * @param {Lava|Coin|Player} actor2 second actor.
 * @returns {Boolean} whether the actors touch each other.
 */
function overlap(actor1, actor2) {
  return (
    actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
  );
}

const wobbleSpeed = 8,
  wobbleDist = 0.07;

/** Player horizontal speed.
 * @type {Number}
 */
const playerXSpeed = 7;

/** Player gravity.
 * @type {Number}
 */
const gravity = 30;

/** Player jump speed.
 * @type {Number}
 */
const jumpSpeed = 17;

/**
 * <p>Given an array of key names, will return an object that tracks the current position of those keys.</p>
 * It registers event handlers for "keydown" and "keyup" events and,<br>
 * when the key code in the event is present in the set of codes that it is tracking, <br>
 * updates the object.
 *
 * @param {Array<String>} keys array of key names.
 * @returns {Array<{KeyboardEvent.key:Boolean}>} a value will be true, when a tracked key is pressed,
 *                                and eventually will be false, when it is released.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key KeyboardEvent: key property}
 */
function trackKeys(keys) {
  const down = Object.create(null);
  /**
   * Callback for tracking key pressed.
   * A closure that holds "keys" and "down" from trackKeys.
   * @param {KeyboardEvent} event key pressed.
   * @callback track
   */
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  /**
   * The keydown event is fired when a key is pressed.
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.addEventListener("keydown", track);
  /**
   * The keyup event is fired when a key is released.
   * @event keyup
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keyup_event Element: keyup event}
   */
  window.addEventListener("keyup", track);
  return down;
}

/**
 * Array of tracked keys.
 * @type {Array<{KeyboardEvent.key:Boolean}>}
 * @see {@link module:16_game~trackKeys trackKeys}
 */
const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

/**
 * <p>A closure to draw a single frame, by calling a function {@link module:16_game~frame frame}
 * that expects a time as an argument. </p>
 *
 * @param {function} frameFunc draws a single frame.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
 */
function runAnimation(frameFunc) {
  let lastTime = null;
  /**
   * To keep a frame rate of 60 frames per second (16.7 ms per frame),<br>
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame|requestAnimationFrame}
   * keep calling this function.<br>
   * When {@link module:16_game~frameFunct frameFunc} returns false, the animation stops.
   * @param {DOMHighResTimeStamp} time current time.
   * @returns {void}
   * @callback frame
   */
  function frame(time) {
    if (lastTime != null) {
      const timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/**
 * <p>A closure that takes a Level object and a display constructor and returns a promise.</p>
 * It displays the level (in document.body) and lets the user play through it.
 *
 * @param {Level} level a Level object.
 * @param {DOMDisplay|CanvasDisplay} Display a Display object.
 * @returns {Promise<Boolean>}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise}
 * @see {@link https://eloquentjavascript.net/11_async.html Asynchronous Programming}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises Using promises}
 */
function runLevel(level, Display) {
  const display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise((resolve) => {
    runAnimation(
      /**
       * When the level is finished (lost or won),
       * {@link module:16_game~runLevel runLevel} waits one more second
       * (to let the user see what happens) <br>
       * and then clears the display, stops the animation,
       * and resolves the promise to the game’s end status.
       * @param {DOMHighResTimeStamp} time current time.
       * @returns {Boolean}
       * @callback frameFunct
       */
      (time) => {
        state = state.update(time, arrowKeys);
        display.syncState(state);
        if (state.status == "playing") {
          return true; // keep runnning this code for each frame
        } else if (ending > 0) {
          ending -= time;
          return true; // lost or won -> run one more tine
        } else {
          display.clear();
          resolve(state.status);
          return false; // stop running rAF() in runAnimation()
        }
      },
    );
  });
}

/**
 * A game is a sequence of levels. Whenever the player dies,
 * the current level is restarted.<br>
 * When a level is completed, we move on to the next level.
 *
 * <p>Because we made runLevel return a promise, runGame can be written using an async function,
 * as shown in {@link https://eloquentjavascript.net/11_async.html|Chapter 11}.<br>
 * It returns another promise, which resolves when the player finishes the game.</p>
 *
 * <p>We also used a cookie to save the current level, so if the page is reloaded, the
 * user continues from where he left off.</p>
 *
 * Async functions can contain zero or more await expressions.<br>
 * Await expressions make promise-returning functions behave as though they're synchronous, <br>
 * by suspending execution until the returned promise is fulfilled or rejected.<br>
 * The resolved value of the promise is treated as the return value of the await expression.<br>
 * Use of async and await enables the use of ordinary try / catch blocks around asynchronous code.
 * @async
 * @param {Array<String>} plans array of Level plans (strings).
 * @param {DOMDisplay|CanvasDisplay} Display a Display constructor.
 * @returns {Promise<String>} a promise which resolves when the player finishes the game.
 * @see {@link https://eloquentjavascript.net/11_async.html Asynchronous Programming}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function async function}
 */
export async function runGame(plans, Display) {
  const cind = document.cookie.indexOf("level");
  // firefox and chrome do not add a ; after the last cookie value
  const semicolon = `${document.cookie};`.indexOf(";", cind);
  const clevel =
    cind != -1
      ? document.cookie.substring(cind + "level".length + 1, semicolon)
      : 0;
  for (let level = clevel; level < plans.length; ) {
    document.cookie = `level = ${level}; max-age=31536000; path=/;`;
    const status = await runLevel(new Level(plans[level]), Display);
    if (status == "won") level++;
  }
  return "You've won!";
}
