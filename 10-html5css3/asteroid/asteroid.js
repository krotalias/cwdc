/**
 * @module
 * @local fps
 */

/**
 * @file
 *
 * Summary.
 * <p>A shooter arcade game.</p>
 *
 * Description.
 * <p>The player controls a single shooting cannon while being attacked by enemies.<br>
 * The objective of the game is to shoot and destroy the enemies, while not colliding with them.<br>
 * The game becomes harder as the number of enemies increases.
 * </p>
 *
 * <ul>
 * <li>At each time step, some enemies disappear, either because they have been hit, or have collided with
 * the cannon.</li>
 * <li>The same happens to bullets, because some get out of the screen and some hit an enemy.</li>
 * <li>The four symbols used in the game are the playing card suits: hearts, spades, diamonds and clubs, while
 * the cannon is represented by an arrow.</li>
 * <li>It is possible to display a circle to help aiming the target. This option should be passed in the URL.</li>
 * <li>It is also displayed the number of frames per second (FPS) and the distance to the closest enemy.</li>
 * <li>The game works in full screen mode in any device, even mobiles, because it sets the viewport and mouse appropriately.
 * </ul>
 *
 * @author Ahmad Faisal Jawed and Paulo Roma
 * @since 04/09/2022
 * @see https://codepen.io/faisal-jawed/pen/xxKBgBo
 * @see https://www.java2s.com/Tutorials/Javascript/Canvas_How_to/Shape/Draw_Spade_Heart_Club_Diamond.htm
 * @see https://en.wikipedia.org/wiki/Asteroids_(video_game)
 * @see <a href="/cwdc/10-html5css3/asteroid/asteroid.html?aim=0">link</a>
 * @see <a href="/cwdc/10-html5css3/asteroid/asteroid.js">source</a>
 * @see <a href="/cwdc/10-html5css3/asteroid/cards.html">cards</a>
 * @see <img src="../asteroid/asteroid.png" width="512">
 * @see <img src="../asteroid/cards.png" width="512">
 */

"use strict";

/**
 * World coordinates.
 * @type {Object<w:Number, h:Number, aspect:Number>}
 */
var stage = {
  w: 1280,
  h: 720,
  aspect: 1280 / 720,
};

/**
 * Viewport: Canvas element.
 * @type {HTMLCanvasElement}
 */
var _pexcanvas = document.getElementById("canvas");

/**
 * Canvas context.
 * @type {CanvasRenderingContext2D}
 */
var ctx = _pexcanvas.getContext("2d");

/**
 * Cannon muzzle position.
 * @type {Object<x:Number, y:Number>}
 */
var pointer = {
  x: stage.w / 2,
  y: stage.h / 2,
};

/**
 * Viewport properties: scale, orientation, left and top offsets.
 * @type {Object<scale:Number, portrait:Boolean, loffset:Number, toffset:Number>}
 */
var viewport = {
  scale: 1,
  portrait: true,
  loffset: 0,
  toffset: 0,
};

/**
 * Mouse position relative to viewport.
 * @type {Object<xpos:Number, ypos:Number>}
 */
var mouse = {
  xpos: 0,
  ypos: 0,
};

/**
 * Cannon properties:
 * <ul>
 * <li>Angle</li>
 * <li>Length</li>
 * <li>x, y</li>
 * <li>Closest enemy (distance and enemy index).</li>
 * </ul>
 */
var cannon = {
  angle: 0,
  length: 75,
  x: stage.w / 2,
  y: stage.h,
  turn: null,
};

/**
 * <p>Artificial Intelligence: the arrow cannon shoots by itself.</p>
 * Keeps track of last time the mouse was moved.
 * @type {Object<on:Boolean, delay:Number, t:Date>}
 */
var ai = {
  on: true,
  delay: 3000,
  t: 0,
};

/**
 * Bullet properties:
 * <ul>
 * <li>Hit square distance (to an enemy).</li>
 * <li>Counter.</li>
 * <li>Time frequency (6 bullets per second).</li>
 * </ul>
 * @type {Object<EnemyCollisionSqr:Number, counter:Number, freq:Number>}
 */
var btm = {
  EnemyCollisionSqr: 400,
  counter: 0,
  freq: 9,
};

/**
 * Display options: fps display, circle for aiming,
 * arrow on top of enemies and distance travelled in each time step.
 * @type {Object<FPS:Boolean, Aim:Boolean, Arrow:Boolean, speed:Number>}
 */
var display = {
  FPS: true,
  Aim: false,
  Arrow: false,
  speed: 3,
};

/**
 * Symbols used for representing graphics objects and events.
 * @type {Object<String,Function>}
 */
var symbol = {
  shaken: drawClubs,
  hit: drawHearts,
  bullet: drawDiamonds,
  enemy: drawSpades,
  back: drawClubs,
};

/**
 * <p>Holds three images for creating the two types of explosions and the background.</p>
 * The contents of the canvas with 'total' symbols is extracted to an image,<br>
 * which is used to produce the effect of an explosion when the cannon
 * or an enemy is hit.
 * <p>The image scale and transparency are manipulated.</p>
 * @type {Object<enemy:HTMLImageElement, cannon:HTMLImageElement, back:HTMLImageElement, total:Number>}
 */
var explode = {
  enemy: null,
  cannon: null,
  back: null,
  total: 200,
};

/**
 * <p>Convert from polar coordinates to cartesian coordinates.</p>
 * In fact, the polar system is rotated by -90°,
 * and the angles are measured from the y axis (y → x, x → -y).
 * <p>Note that:</p>
 * <ul>
 * <li>sin(x) = -sin(-x) and cos(x) = cos(-x)</li>
 * <li>sin(90) = 1, sin(0) = 0, cos(90) = 0, cos(0) = 1</li>
 * <li>cos(A − B) = cos A cos B + sin A sin B</li>
 * <li>cos(A - 90) = sin(A)</li>
 * <li>sin(A − B) = sin A cos B − cos A sin B</li>
 * <li>sin(A - 90) = -cos(A)</li>
 * <li>R(90) = (-y, x)</li>
 * <li>R(-90) = (y, -x)</li>
 * <li>Equivalent to: polarToCartesian(r, a - Math.PI / 2, dx, dy)</li>
 * </ul>
 * @param {Number} r polar distance.
 * @param {Number} a polar angle.
 * @param {Number} dx horizontal translation.
 * @param {Number} dy vertical translation.
 * @return {Array<Number,Number>} point in cartesian coordinates: [r * Math.sin(a) + dx, -r * Math.cos(a) + dy]
 * @see https://en.wikipedia.org/wiki/Polar_coordinate_system
 * @see https://www.liverpool.ac.uk/~maryrees/homepagemath191/trigid.pdf
 * @see https://www.khanacademy.org/math/geometry/hs-geo-transformations/hs-geo-rotations/a/rotating-shapes
 * @see https://www.youtube.com/watch?v=7HD5vE0LGWQ
 */
export function polar2Cartesian(r, a, dx = 0, dy = 0) {
  return [r * Math.sin(a) + dx, -r * Math.cos(a) + dy];
  // return polarToCartesian(r, a - Math.PI / 2, dx, dy);
}

/**
 * <p>Convert from polar coordinates to cartesian coordinates.</p>
 * Equivalent to: polar2Cartesian(r, a + Math.PI / 2, dy, -dx)
 * @param {Number} r polar distance.
 * @param {Number} a polar angle.
 * @param {Number} dx horizontal translation.
 * @param {Number} dy vertical translation.
 * @return {Array<Number,Number>} point in cartesian coordinates: [r * Math.cos(a) + dx, r * Math.sin(a) + dy]
 * @see https://en.wikipedia.org/wiki/Polar_coordinate_system
 */
export function polarToCartesian(r, a, dx = 0, dy = 0) {
  return [r * Math.cos(a) + dx, r * Math.sin(a) + dy];
  // return polar2Cartesian(r, a + Math.PI / 2, dy, -dx);
}

/**
 * Convert an angle in radians to degrees.
 * @param {Number} rad angle in radians.
 * @return {Number} angle in degrees.
 */
export var rad2Deg = (rad) => (rad * 180) / Math.PI;

/**
 * <p>Returns a random number between the specified values.</p>
 * The returned value is no lower than (and may possibly equal) min,
 * and is less than (and not equal) max.
 * @param {Number} min lower value.
 * @param {Number} max higher value.
 * @returns {Number} ramdom value.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * <p>Returns a random integer between the specified values.</p>
 * The value is no lower than min
 * (or the next integer greater than min if min isn't an integer),
 * and is less than (but not equal to) max.
 * @param {Number} min lower value.
 * @param {Number} max higher value.
 * @returns {Number}
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Draw an arrow.
 * @param {CanvasRenderingContext2D} ctx context.
 * @param {Number} fromx arrow origin abscissa.
 * @param {Number} fromy arrow origin ordinate.
 * @param {Number} tox arrow end abscissa.
 * @param {Number} toy arrow end ordinate.
 * @param {Number} lw line (arrow) width.
 * @param {Number} hlen header length.
 * @param {String} color arrow color.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
 */
export function drawArrow(ctx, fromx, fromy, tox, toy, lw, hlen, color) {
  var x = tox - fromx;
  var y = toy - fromy;

  ctx.save();
  var angle = Math.atan2(y, x);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tox, toy);

  // header of the arrow
  if (false) {
    [x, y] = polarToCartesian(hlen, angle - Math.PI / 6);
    ctx.lineTo(tox - x, toy - y);
    [x, y] = polarToCartesian(hlen / 2, angle);
    ctx.lineTo(tox - x, toy - y);
    [x, y] = polarToCartesian(hlen, angle + Math.PI / 6);
    ctx.lineTo(tox - x, toy - y);
  } else {
    [y, x] = polar2Cartesian(hlen, angle - Math.PI / 6);
    ctx.lineTo(tox + x, toy - y);
    [y, x] = polar2Cartesian(hlen / 2, angle);
    ctx.lineTo(tox + x, toy - y);
    [y, x] = polar2Cartesian(hlen, angle + Math.PI / 6);
    ctx.lineTo(tox + x, toy - y);
  }

  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a Hearts (suit).
 * @param {CanvasRenderingContext2D} ctx context.
 * @param {Number} x hearts position abscissa.
 * @param {Number} y hearts position ordinate.
 * @param {Number} tox hearts look at abscissa.
 * @param {Number} toy hearts look at ordinate.
 * @param {Number} width hearts width.
 * @param {Number} height hearts height.
 * @param {String} color hearts color.
 * @see https://en.wikipedia.org/wiki/Hearts_(suit)
 */
export function drawHearts(ctx, x, y, tox, toy, width, height, color) {
  width *= 2.2;
  height *= 3;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(toy - y, tox - x) - Math.PI / 2);
  ctx.translate(-x, -y);

  ctx.beginPath();
  var topCurveHeight = height * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);

  // bottom left curve
  ctx.bezierCurveTo(
    x - width / 2,
    y + (height + topCurveHeight) / 2,
    x,
    y + (height + topCurveHeight) / 2,
    x,
    y + height
  );

  // bottom right curve
  ctx.bezierCurveTo(
    x,
    y + (height + topCurveHeight) / 2,
    x + width / 2,
    y + (height + topCurveHeight) / 2,
    x + width / 2,
    y + topCurveHeight
  );

  // top right curve
  ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a three-leafed clover leaf or a Clubs (suit).
 * @param {CanvasRenderingContext2D} ctx context.
 * @param {Number} x clubs position abscissa.
 * @param {Number} y clubs position ordinate.
 * @param {Number} tox clubs look at abscissa.
 * @param {Number} toy clubs look at ordinate.
 * @param {Number} width clubs width.
 * @param {Number} height clubs height.
 * @param {String} color clubs color.
 * @see https://en.wikipedia.org/wiki/Clubs_(suit)
 */
export function drawClubs(ctx, x, y, tox, toy, width, height, color) {
  width *= 2.5;
  height *= 3;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(toy - y, tox - x) - Math.PI / 2);
  ctx.translate(-x, -y);

  var circleRadius = width * 0.3;
  var bottomWidth = width * 0.5;
  var bottomHeight = height * 0.35;
  ctx.fillStyle = color;

  // top circle
  ctx.beginPath();
  ctx.arc(
    x,
    y + circleRadius + height * 0.05,
    circleRadius,
    0,
    2 * Math.PI,
    false
  );
  ctx.fill();

  // bottom right circle
  ctx.beginPath();
  ctx.arc(
    x + circleRadius,
    y + height * 0.6,
    circleRadius,
    0,
    2 * Math.PI,
    false
  );
  ctx.fill();

  // bottom left circle
  ctx.beginPath();
  ctx.arc(
    x - circleRadius,
    y + height * 0.6,
    circleRadius,
    0,
    2 * Math.PI,
    false
  );
  ctx.fill();

  // center filler circle
  ctx.beginPath();
  ctx.arc(x, y + height * 0.5, circleRadius / 2, 0, 2 * Math.PI, false);
  ctx.fill();

  // bottom of club
  ctx.moveTo(x, y + height * 0.6);
  ctx.quadraticCurveTo(x, y + height, x - bottomWidth / 2, y + height);
  ctx.lineTo(x + bottomWidth / 2, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a Diamonds (suit).
 * @param {CanvasRenderingContext2D} ctx context.
 * @param {Number} x diamonds position abscissa.
 * @param {Number} y diamonds position ordinate.
 * @param {Number} tox diamonds look at abscissa.
 * @param {Number} toy diamonds look at ordinate.
 * @param {Number} width diamonds width.
 * @param {Number} height diamonds height.
 * @param {String} color diamonds color.
 * @see https://en.wikipedia.org/wiki/Diamonds_(suit)
 */
export function drawDiamonds(ctx, x, y, tox, toy, width, height, color) {
  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(Math.atan2(toy - y, tox - x) - Math.PI / 2);
  ctx.translate(-x, -y);

  ctx.beginPath();
  ctx.moveTo(x, y);

  // top left edge
  ctx.lineTo(x - width / 2, y + height / 2);

  // bottom left edge
  ctx.lineTo(x, y + height);

  // bottom right edge
  ctx.lineTo(x + width / 2, y + height / 2);

  // closing the path automatically creates
  // the top right edge
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a Spades (suit).
 * @param {CanvasRenderingContext2D} ctx context.
 * @param {Number} x spades position abscissa.
 * @param {Number} y spades position ordinate.
 * @param {Number} tox spades look at abscissa.
 * @param {Number} toy spades look at ordinate.
 * @param {Number} width spades width.
 * @param {Number} height spades height.
 * @param {String} color spades color.
 * @see https://en.wikipedia.org/wiki/Spades_(suit)
 */
export function drawSpades(ctx, x, y, tox, toy, width, height, color) {
  width *= 3;
  height *= 3;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(toy - y, tox - x) - Math.PI / 2);
  ctx.translate(-x, -y);

  var bottomWidth = width * 0.7;
  var topHeight = height * 0.7;
  var bottomHeight = height * 0.3;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);

  // top left of spade
  ctx.bezierCurveTo(
    x,
    y + topHeight / 2, // control point 1
    x - width / 2,
    y + topHeight / 2, // control point 2
    x - width / 2,
    y + topHeight // end point
  );

  // bottom left of spade
  ctx.bezierCurveTo(
    x - width / 2,
    y + topHeight * 1.3, // control point 1
    x,
    y + topHeight * 1.3, // control point 2
    x,
    y + topHeight // end point
  );

  // bottom right of spade
  ctx.bezierCurveTo(
    x,
    y + topHeight * 1.3, // control point 1
    x + width / 2,
    y + topHeight * 1.3, // control point 2
    x + width / 2,
    y + topHeight // end point
  );

  // top right of spade
  ctx.bezierCurveTo(
    x + width / 2,
    y + topHeight / 2, // control point 1
    x,
    y + topHeight / 2, // control point 2
    x,
    y // end point
  );

  ctx.closePath();
  ctx.fill();

  // bottom of spade
  ctx.beginPath();
  ctx.moveTo(x, y + topHeight);
  ctx.quadraticCurveTo(
    x,
    y + topHeight + bottomHeight, // control point
    x - bottomWidth / 2,
    y + topHeight + bottomHeight // end point
  );
  ctx.lineTo(x + bottomWidth / 2, y + topHeight + bottomHeight);
  ctx.quadraticCurveTo(
    x,
    y + topHeight + bottomHeight, // control point
    x,
    y + topHeight // end point
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Array of colors for creating the background image.
 * @type {Array<String>}
 */
var colors = [
  "#1abc9c",
  "#1abc9c",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#2c3e50",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#95a5a6",
  "#f39c12",
  "#d35400",
  "#c0392b",
  "#bdc3c7",
  "#7f8c8d",
];

/**
 * Create images used as background and explosion effects.
 */
function createImages() {
  ctx.clearRect(0, 0, stage.w, stage.h);
  for (var i = 0; i < explode.total; i++) {
    var angle = getRandomArbitrary(0, 2 * Math.PI);
    var length = getRandomArbitrary(50, 300);
    var [myx, myy] = polar2Cartesian(length, angle, 360, 360);
    let [tox, toy] = polar2Cartesian(length / 6, angle);
    symbol.hit(
      ctx,
      myx,
      myy,
      myx + tox,
      myy + toy,
      length / 30,
      length / 30,
      "#c0392b"
    );
  }

  explode.enemy = new Image();
  explode.enemy.src = canvas.toDataURL("image/png");

  ctx.clearRect(0, 0, stage.w, stage.h);
  for (var i = 0; i < explode.total; i++) {
    var angle = getRandomArbitrary(-Math.PI / 2, Math.PI / 2);
    var length = getRandomArbitrary(50, 530);
    var [myx, myy] = polar2Cartesian(length, angle, cannon.x, cannon.y);
    let [tox, toy] = polar2Cartesian(length / 6, angle);
    symbol.shaken(
      ctx,
      myx,
      myy,
      myx + tox,
      myy + toy,
      length / 30,
      length / 30,
      "#2c3e50"
    );
  }

  explode.cannon = new Image();
  explode.cannon.src = canvas.toDataURL("image/png");

  ctx.clearRect(0, 0, stage.w, stage.h);
  ctx.fillStyle = "rgba(236,240,241,1)";
  ctx.fillRect(0, 0, stage.w, stage.h);
  for (var i = 0; i < explode.total; i++) {
    var angle = getRandomArbitrary(0, Math.PI);
    var length = getRandomArbitrary(50, 300);
    var myx = getRandomArbitrary(0, stage.w);
    var myy = getRandomArbitrary(0, stage.h);
    let [tox, toy] = polar2Cartesian(length / 6, angle);
    symbol.back(
      ctx,
      myx,
      myy,
      myx + tox,
      myy + toy,
      length / 30,
      length / 30,
      colors[getRandomInt(0, colors.length)]
    );
  }

  ctx.fillStyle = "rgba(236,240,241,0.9)";
  ctx.fillRect(0, 0, stage.w, stage.h);

  explode.back = new Image();
  explode.back.src = canvas.toDataURL("image/png");
}

/**
 * Array of bullets.
 * @type {Array<Bullet>}
 */
var bullets = [];

class Bullet {
  /**
   * Creates a bullet with the cannon polar angle and getting out
   * through the muzzle of the cannon (head of the arrow).
   */
  constructor() {
    let [x, y] = polar2Cartesian(
      cannon.length,
      cannon.angle,
      cannon.x,
      cannon.y
    );

    /**
     * Bullet abscissa.
     */
    this.x = x;

    /**
     * Bullet ordinate.
     */
    this.y = y;

    /**
     * Bullet polar angle.
     */
    this.theta = cannon.angle;
  }
}

/**
 * Array of enemies.
 * @type {Array<Enemy>}
 */
var enemies = [];

class Enemy {
  /**
   * Creates an enemy with a random polar angle and distance.
   */
  constructor() {
    /**
     * <p>A random polar angle in the range [-72°,72°].</p>
     * Since the polar system is rotated by -90°, this will produce
     * angles in the range [-162°, -18°] in the x axis.
     * <p>However, since the y axis grows downwards,
     * everything is <a href="../cards.html">reflected</a> along the x axis (y' = stage.h - y).</p>
     */
    this.theta = getRandomArbitrary(-Math.PI, Math.PI) / 2.5;

    /**
     * A random distance in the range [720, 2000].
     */
    this.dis = getRandomArbitrary(stage.h, stage.w + stage.h);

    let [x, y] = polar2Cartesian(this.dis, this.theta, cannon.x, cannon.y);

    /**
     * Cartesian coordinate: abscissa.
     */
    this.x = x;

    /**
     * Cartesian coordinate: ordinate.
     */
    this.y = y;
  }
}

/**
 * Create a set of enemies.
 * @param {Number} n number of enemies.
 */
function createEnemies(n = 10) {
  for (var i = 0; i < n; i++) {
    enemies.push(new Enemy());
    let [dx, dy] = polar2Cartesian(300, enemies[i].theta);
    enemies[i].x -= dx;
    enemies[i].y -= dy;
  }
}

/**
 * Array of explosions.
 * @type {Array<Explosion>}
 */
var explosions = [];

/**
 * <p>Class for representing an explosion object.</p>
 * There are two images used when an <a href="../explode.png">enemy</a>
 * or the <a href="../explodeb.png">cannon</a> is hit:
 * <ul>
 * <li>These images are drawn with an increasing size and a decreasing transparency in each time step.</li>
 * <li>The explosion ends when its height is greater than the canvas height.</li>
 * </ul>
 */
class Explosion {
  /**
   * Creates an explosion object.
   * @param {Number} x explosion abscissa.
   * @param {Number} y explosion ordinate.
   * @param {Number} ty type: enemy (1) or cannon (2).
   */
  constructor(x, y, ty) {
    /** Abscissa. */
    this.x = x;
    /** Ordinate. */
    this.y = y;
    /**
     * Explosion (image) height.
     * @type {Number}
     */
    this.t = 30;
    /**
     * Explosion type: an enemy (1) or the cannon (2).
     * @type {Number}
     */
    this.ty = ty;
  }
}

/**
 * <p>Executes one step of the animation.
 * If the mouse was not moved in 3s, turns on the ai.</p>
 *
 * <p>Keeps an array, which positions contain the distance
 * from an enemy to the cannon <br>
 * and its index into the enemy array,
 * for getting the closest enemy (after being sorted).</p>
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan
 */
function engineStep() {
  ctx.drawImage(explode.back, 0, 0);
  if (!ai.on && ai.t < Date.now() - ai.delay) {
    ai.on = true;
  }

  // a new bullet each 10 frames: 6 bullets per second
  if (++btm.counter > btm.freq) {
    btm.counter = 0;
    bullets.push(new Bullet());
  }

  for (var i = 0; i < bullets.length; i++) {
    let [dx, dy] = polar2Cartesian(20, bullets[i].theta);
    bullets[i].x += dx;
    bullets[i].y += dy;
    symbol.bullet(
      ctx,
      bullets[i].x - 2.5 * dx,
      bullets[i].y - 2.5 * dy,
      bullets[i].x,
      bullets[i].y,
      8,
      8,
      "#2980b9"
    );
    // delete bullets out of the screen
    if (bullets[i].x < -100 || bullets[i].x > stage.w + 100) {
      bullets.splice(i, 1);
    }
    if (bullets[i].y < -100 || bullets[i].y > stage.h + 100) {
      bullets.splice(i, 1);
    }
  }

  for (var i = 0; i < enemies.length; i++) {
    let [dx, dy] = polar2Cartesian(1, enemies[i].theta);
    enemies[i].x -= display.speed * dx;
    enemies[i].y -= display.speed * dy;
    symbol.enemy(
      ctx,
      enemies[i].x + dx * 100,
      enemies[i].y + dy * 100,
      enemies[i].x,
      enemies[i].y,
      15,
      15,
      cannon.turn && i == cannon.turn.pos ? "#8B0000" : "#c0392b"
    );

    if (display.Arrow) {
      let [x, y] = polar2Cartesian(
        100,
        enemies[i].theta,
        enemies[i].x,
        enemies[i].y
      );
      drawArrow(ctx, x, y, enemies[i].x, enemies[i].y, 15, 15, "#c0392b");
    }

    // an enemy hit the ground, so shake it
    if (enemies[i].y > stage.h) {
      enemies[i] = new Enemy();
      explosions.push(new Explosion(cannon.x, cannon.y, 2));
      shake.on = true;
      shake.counter = 0;
    }

    // check whether the enemy is hit by a bullet.
    for (var b = 0; b < bullets.length; b++) {
      let dx = enemies[i].x - bullets[b].x;
      let dy = enemies[i].y - bullets[b].y;
      let dis = dx * dx + dy * dy;
      if (dis < btm.EnemyCollisionSqr) {
        // explode the enemy, replace it by a new one, and delete the bullet.
        explosions.push(new Explosion(enemies[i].x, enemies[i].y, 1));
        enemies[i] = new Enemy();
        bullets.splice(b, 1);
      }
    }
  }

  if (ai.on) {
    var cold = [];

    for (const [i, e] of enemies.entries()) {
      var dx = e.x - cannon.x;
      var dy = e.y - cannon.y;
      var dis = Math.floor(Math.hypot(dx, dy));
      cold.push({ d: dis, pos: i });
    }

    // turn the cannon to shoot the closest enemy
    cold.sort((a, b) => a.d - b.d);
    cannon.turn = cold[0];

    if (cannon.turn.d < stage.h) {
      cannon.angle += (enemies[cannon.turn.pos].theta - cannon.angle) / 8;
    }
  } else {
    var dx = pointer.x - cannon.x;
    var dy = pointer.y - cannon.y;
    cannon.angle = -Math.atan(dx / dy);
    cannon.turn = null;
  }

  // big arrow cannon
  let [tox, toy] = polar2Cartesian(
    cannon.length,
    cannon.angle,
    cannon.x,
    cannon.y
  );
  drawArrow(
    ctx,
    cannon.x,
    cannon.y,
    tox,
    toy,
    cannon.length / 5,
    cannon.length / 7.5,
    "#2c3e50"
  );

  for (var e = 0; e < explosions.length; e++) {
    if (explosions[e].ty == 1) {
      var myimg = explode.enemy;
      ctx.globalAlpha = 1 - explosions[e].t / stage.h;
      ctx.drawImage(
        myimg,
        explosions[e].x - explosions[e].t / 2,
        explosions[e].y - explosions[e].t / 2,
        explosions[e].t * stage.aspect,
        explosions[e].t
      );
      ctx.globalAlpha = 1;
    } else {
      var myimg = explode.cannon;
      ctx.globalAlpha = 1 - explosions[e].t / stage.h;
      ctx.drawImage(
        myimg,
        explosions[e].x - (explosions[e].t * stage.aspect) / 2,
        stage.h - explosions[e].t,
        explosions[e].t * stage.aspect,
        explosions[e].t
      );
      ctx.globalAlpha = 1;
    }
  }

  // increase the explosion height, and delete it when it is higher than the stage.
  for (const e of explosions) {
    e.t += 20;
    if (e.t > stage.h) {
      explosions.splice(e, 1);
    }
  }
}

/**
 * Toggle the game full screen mode.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen
 */
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen =
    docEl.requestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen ||
    docEl.msRequestFullscreen;
  var cancelFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen;

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}

function motchstart(e) {
  mouse.xpos = (e.pageX - viewport.loffset) * viewport.scale;
  mouse.ypos = (e.pageY - viewport.toffset) * viewport.scale;
}

function motchmove(e) {
  mouse.xpos = (e.pageX - viewport.loffset) * viewport.scale;
  mouse.ypos = (e.pageY - viewport.toffset) * viewport.scale;
  pointer.x = mouse.xpos;
  pointer.y = mouse.ypos;
  ai.on = false;
  ai.t = Date.now();
}

function motchend(e) {}

/**
 * Set event listeners.
 */
function setListeners() {
  window.addEventListener(
    "mousedown",
    function (e) {
      motchstart(e);
    },
    false
  );
  window.addEventListener(
    "mousemove",
    function (e) {
      motchmove(e);
    },
    false
  );
  window.addEventListener(
    "mouseup",
    function (e) {
      motchend(e);
    },
    false
  );
  window.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
      motchstart(e.touches[0]);
    },
    false
  );
  window.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      motchmove(e.touches[0]);
    },
    false
  );
  window.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      motchend(e.touches[0]);
    },
    false
  );

  // deprecated
  window.requestAnimFrame = (() => {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();
}

/**
 * Callback function corresponding to window.onresize event.
 * @param {UIEvent} event not used.
 */
export function resize(event) {
  var cw = window.innerWidth;
  var ch = window.innerHeight;
  let aspect = stage.aspect;
  if (cw <= ch * aspect) {
    viewport.portrait = true;
    viewport.scale = stage.w / cw;
    viewport.loffset = 0;
    viewport.toffset = Math.floor(ch - cw / aspect) / 2;
    _pexcanvas.style.width = cw + "px";
    _pexcanvas.style.height = Math.floor(cw / aspect) + "px";
    _pexcanvas.style.marginLeft = viewport.loffset + "px";
    _pexcanvas.style.marginTop = viewport.toffset + "px";
  } else {
    viewport.scale = stage.h / ch;
    viewport.portrait = false;
    viewport.loffset = Math.floor(cw - ch * aspect) / 2;
    viewport.toffset = 0;
    _pexcanvas.style.height = ch + "px";
    _pexcanvas.style.width = Math.floor(ch * aspect) + "px";
    _pexcanvas.style.marginLeft = viewport.loffset + "px";
    _pexcanvas.style.marginTop = viewport.toffset + "px";
  }
}

/**
 * Callback function corresponding to window.onload event.
 * @param {UIEvent} event not used.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 */
export function load(event) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const aim = urlParams.get("aim");

  _pexcanvas.width = stage.w;
  _pexcanvas.height = stage.h;

  display.Aim = aim == 1;
  display.Arrow = aim == 1;

  const ev = new Event("resize");
  window.dispatchEvent(ev);
  //toggleFullScreen();
  createImages();
  setListeners();
  createEnemies();
  animate();
}

/**
 * A closure to compute the number of frames per second.
 * @return {fps} a callback for counting number of frames.
 * @function
 */
export var fpsCounter = (() => {
  var lastCalledTime = Date.now();
  var thisfps = 60;
  var fcount = 0;
  var ftime = 0;
  /**
   * <p>Counts the number of frames per second.</p>
   * Basically, it is necessary to count how many times
   * this function is called in one second.
   * @return {Number} frames per second.
   * @callback fps
   */
  return () => {
    ftime += Date.now() - lastCalledTime;
    lastCalledTime = Date.now();
    if (++fcount > 30) {
      thisfps = (1000 * fcount) / ftime;
      fcount = 0;
      ftime = 0;
    }
    return thisfps;
  };
})();

/**
 * <p>Controls the application of a random translation
 * ∈ [-t,t], in x and y, when the cannon is hit.</p>
 * The screen is shaken for nf frames or nf/60 s.
 * @type {Object<on:Boolean, counter:Number, t:Number, nf:Number>}
 */
var shake = {
  on: false,
  counter: 0,
  t: 30,
  nf: 20,
};

/**
 * Run the animation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
function animate() {
  requestAnimationFrame(animate);
  if (shake.on) {
    var trax = getRandomArbitrary(-shake.t, shake.t);
    var tray = getRandomArbitrary(-shake.t, shake.t);
    ctx.translate(trax, tray);
  }

  engineStep();

  if (display.FPS) {
    let fps = fpsCounter();
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.font = "24px Courier New, monospace";
    ctx.textAlign = "left";
    ctx.fillText(` ${fps.toFixed(1)}  fps`, 20, stage.h - 80);
    let n =
      (cannon.angle > 0 ? "+" : "-") +
      String(Math.abs(rad2Deg(cannon.angle)).toFixed(1)).padStart(4, "0");
    ctx.fillText(`${n}° can`, 20, stage.h - 50);
    // distance to the closest enemy
    if (cannon.turn) ctx.fillText(` ${cannon.turn.d}   dis`, 20, stage.h - 20);
  }

  // draw a circle to help aiming the shoots
  if (display.Aim && !ai.on) {
    ctx.fillStyle = "#8e44ad";
    ctx.strokeStyle = "#8e44ad";
    ctx.lineWidth = 2;

    let radius = cannon.length / 5;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, radius, Math.PI * 2, false);
    ctx.moveTo(pointer.x, pointer.y - radius);
    ctx.lineTo(pointer.x, pointer.y + radius);
    ctx.moveTo(pointer.x - radius, pointer.y);
    ctx.lineTo(pointer.x + radius, pointer.y);
    ctx.closePath();
    ctx.stroke();
  }

  if (shake.on) {
    ctx.translate(-trax, -tray);
    if (++shake.counter > shake.nf) {
      shake.counter = 0;
      shake.on = false;
    }
  }
}