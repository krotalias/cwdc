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
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-game code/chapter/17_canvas.js
 *  </pre>
 *
 *  @author Marijn Haverbeke ({@link https://marijnhaverbeke.nl}), adapted to ES6 by Paulo Roma
 *  @since 06/07/2021
 *  @see <a href="/eloquentJavascript/game/game.html?driver=c">Game</a>
 *  @see <a href="/eloquentJavascript/game/code/chapter/17_canvas.js">source canvas</a>
 *  @see <a href="/eloquentJavascript/game/code/chapter/16_game.js">source game</a>
 *  @see <a href="/eloquentJavascript/game/code/levels.js">levels</a>
 *  @see https://eloquentjavascript.net/17_canvas.html
 *  @see <img src="../game.png" width="512">
 */

/**
 * The results binding contains an array of objects that represent the survey responses.
 * @type {Array<Object<name:String, count:Number, color:String>>}
 */
var results = [
  { name: "Satisfied", count: 1043, color: "lightblue" },
  { name: "Neutral", count: 563, color: "lightgreen" },
  { name: "Unsatisfied", count: 510, color: "pink" },
  { name: "No comment", count: 175, color: "silver" },
];

/**
 * Object with the sprites for the wall, lava, coin, player
 * and the amount of pixels overlapping in the x direction.
 * @type {Object<other:HTMLImageElement,player:HTMLImageElement,xOverlap:Number>}
 */
var sprites = {
  other: document.createElement("img"),
  player: document.createElement("img"),
  xOverlap: 4,
};

/**
 * Flip a picture around the vertical line at a given x position.
 *
 * @param {CanvasRenderingContext2D} context 2d graphical context.
 * @param {Number} around a vertical line abscissa.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

/**
 * This object keeps a little more information than DOMDisplay.
 * Rather than using the scroll position of its DOM element, it tracks its own viewport,
 * which tells us what part of the level we are currently looking at.
 * Finally, it keeps a flipPlayer property so that even when the player is standing still,
 * it keeps facing the direction it last moved in.
 *
 * @param {HTMLElement} parent parent element.
 * @param {Level} level geometry of the current level of the game.
 */
var CanvasDisplay = class CanvasDisplay {
  constructor(parent, level) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Math.min(600, level.width * scale);
    this.canvas.height = Math.min(450, level.height * scale);
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");

    this.flipPlayer = false;

    sprites.other.src = "img/sprites.png";
    sprites.player.src = "img/player.png";

    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / scale,
      height: this.canvas.height / scale,
    };
  }

  /**
   * Deletes this canvas.
   */
  clear() {
    this.canvas.remove();
  }
};

/**
 * The syncState method first computes a new viewport and then draws the game scene at the appropriate position.
 *
 * @param {State} state state of a running game.
 */
CanvasDisplay.prototype.syncState = function (state) {
  this.updateViewport(state);
  this.clearDisplay(state.status);
  this.drawBackground(state.level);
  this.drawActors(state.actors);
};

/**
 * <p>The updateViewport method is similar to DOMDisplay’s scrollPlayerIntoView method.
 * It checks whether the player is too close to the edge of the screen and moves the viewport when this is the case.</p>
 *
 * The canvas is divided into three parts, and a margin is defined as 1/3 of its width.
 * Whenever the player enters the third third, the viewport is translated
 * to the right, so the difference between the player position, and the right edge of the viewport,
 * is the margin (of course speed matters).
 *
 * <p>If the player turns back, whenever the player enters the first third, the viewport is translated
 * to the left, so the difference between the player position and the left edge of the viewport, is the margin.</p>
 *
 * @param {State} state state of a running game.
 */
CanvasDisplay.prototype.updateViewport = function (state) {
  let view = this.viewport,
    margin = view.width / 3;
  let player = state.player;
  let center = player.pos.plus(player.size.times(0.5)); // position of the middle of the player

  if (center.x < view.left + margin) {
    // before first third
    view.left = Math.max(center.x - margin, 0); // keep the distance from the player to the left border = 1/3
  } else if (center.x > view.left + view.width - margin) {
    // beyond third third
    view.left = Math.min(
      center.x + margin - view.width, // keep the distance from the player to the left border = 2/3
      state.level.width - view.width
    );
  }
  if (center.y < view.top + margin) {
    view.top = Math.max(center.y - margin, 0);
  } else if (center.y > view.top + view.height - margin) {
    view.top = Math.min(
      center.y + margin - view.height,
      state.level.height - view.height
    );
  }
};

/**
 * When clearing the display, we’ll use a slightly different color depending on
 * whether the game is won (brighter) or lost (darker).
 *
 * @param {"won" | "lost" | "playing"} status current condition of the game.
 */
CanvasDisplay.prototype.clearDisplay = function (status) {
  if (status == "won") {
    this.cx.fillStyle = "rgb(68, 191, 255)";
  } else if (status == "lost") {
    this.cx.fillStyle = "rgb(44, 136, 214)";
  } else {
    this.cx.fillStyle = "rgb(52, 166, 251)";
  }
  this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * To draw the background, we run through the tiles that are visible in the current viewport,
 * using the same trick used in the touches method from the previous chapter.
 *
 * <ul> <li>map: [left,right] → [0,this.canvas.width] or screenX = (x - left) / (right-left) * this.canvas.width </li>
 * <li> map: [top,bottom] → [0,this.canvas.height]    or screenY = (y - top)  / (top-bottom) * this.canvas.height </li>
 * <li> scale = this.canvas.width/width = this.canvas.height/height = 20</li></ul>
 *
 * @param {Level} level geometry of the current level of the game.
 */
CanvasDisplay.prototype.drawBackground = function (level) {
  let { left, top, width, height } = this.viewport;
  let xStart = Math.floor(left);
  let xEnd = Math.ceil(left + width);
  let yStart = Math.floor(top);
  let yEnd = Math.ceil(top + height);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let tile = level.rows[y][x];
      if (tile == "empty") continue;
      let screenX = (x - left) * scale; // map: [left,right] -> [0,this.canvas.width]
      let screenY = (y - top) * scale; // map: [top,bottom] -> [0,this.canvas.height]
      let tileX = tile == "lava" ? scale : 0; // wall is the first sprite (offset 0)
      this.cx.drawImage(
        sprites.other,
        tileX,
        0,
        scale,
        scale,
        screenX,
        screenY,
        scale,
        scale
      );
    }
  }
  // roma: draw one and two third lines
  this.cx.beginPath();
  this.cx.moveTo((width / 3) * scale, 0);
  this.cx.lineTo((width / 3) * scale, height * scale);
  this.cx.stroke();
  this.cx.beginPath();
  this.cx.setLineDash([3, 7]);
  this.cx.moveTo(((2 * width) / 3) * scale, 0);
  this.cx.lineTo(((2 * width) / 3) * scale, height * scale);
  this.cx.strokeStyle = "lightblue";
  this.cx.fillStyle = "lightblue";
  this.cx.fillText(" (2/3)", ((2 * width) / 3) * scale, scale);
  this.cx.fillText(" (1/3)", (width / 3) * scale, scale);
  this.cx.stroke();
  // console.log(this.canvas.width/width); // 20 (scale)
};

/**
 * <p>Tiles that are not empty are drawn with drawImage.
 * The otherSprites image contains the pictures used for elements other than the player.
 * It contains, from left to right, the wall tile, the lava tile, and the sprite for a coin.</p>

 * <p>Sprites for our game
 * Background tiles are 20 by 20 pixels, since we will use the same scale (20) that we used in DOMDisplay.
 * Thus, the offset for lava tiles is 20 (the value of the scale binding), and the offset for walls is 0. </p>
 *
 * <p>We don’t bother waiting for the sprite image to load.
 * Calling drawImage with an image that hasn’t been loaded yet will simply do nothing.
 * Thus, we might fail to draw the game properly for the first few frames, while the image is still loading,
 * but that is not a serious problem.
 * Since we keep updating the screen, the correct scene will appear as soon as the loading finishes. </p>
 *
 * <p>The walking character shown earlier will be used to represent the player.
 * The code that draws it needs to pick the right sprite and direction based on the player’s current motion.
 * The first eight sprites contain a walking animation. When the player is moving along a floor,
 * we cycle through them based on the current time.
 * We want to switch frames every 16.7 milliseconds (60 fps), so the time is divided by 60 first.
 * When the player is standing still, we draw the ninth sprite.
 * During jumps, which are recognized by the fact that the vertical speed is not zero, we use the tenth, rightmost sprite.</p>
 *
 * <p>Because the sprites are slightly wider than the player object,
 * 24 instead of 16 pixels to allow some space for feet and arms,
 * the method has to adjust the x-coordinate and width by a given amount (sprites.xOverlap).</p>
 *
 * @param {Player} player player object.
 * @param {Number} x abscissa coordinate.
 * @param {Number} y ordinate coordinate.
 * @param {Number} width actor width times scale.
 * @param {Number} height actor height times scale.
 */
CanvasDisplay.prototype.drawPlayer = function (player, x, y, width, height) {
  width += sprites.xOverlap * 2;
  x -= sprites.xOverlap;
  if (player.speed.x != 0) {
    this.flipPlayer = player.speed.x < 0;
  }

  let tile = 8;
  if (player.speed.y != 0) {
    tile = 9;
  } else if (player.speed.x != 0) {
    tile = Math.floor(Date.now() / 60) % 8;
  }

  this.cx.save();
  if (this.flipPlayer) {
    flipHorizontally(this.cx, x + width / 2);
  }
  let tileX = tile * width;
  this.cx.drawImage(
    sprites.player,
    tileX,
    0,
    width,
    height,
    x,
    y,
    width,
    height
  );
  this.cx.restore();
};

/**
 * <p>The drawPlayer method is called by drawActors, which is responsible for drawing all the actors in the game.</p>
 *
 * When drawing something that is not the player, we look at its type to find the offset of the correct sprite. <br>
 * The lava tile is found at offset 20, and the coin sprite is found at 40 (two times scale). <br>
 *
 * <p>We have to subtract the viewport’s position when computing the actor’s position,
 * since (0,0) on our canvas corresponds to the top left of the viewport, <br>
 * not the top left of the level. We could also have used translate for this. Either way works.</p>
 *
 * @param {Array<Lava|Coin|Player>} actors actors of the game.
 */
CanvasDisplay.prototype.drawActors = function (actors) {
  for (let actor of actors) {
    let width = actor.size.x * scale;
    let height = actor.size.y * scale;
    let x = (actor.pos.x - this.viewport.left) * scale;
    let y = (actor.pos.y - this.viewport.top) * scale;
    if (actor.type == "player") {
      this.drawPlayer(actor, x, y, width, height);
    } else {
      let tileX = (actor.type == "coin" ? 2 : 1) * scale;
      this.cx.drawImage(
        sprites.other,
        tileX,
        0,
        width,
        height,
        x,
        y,
        width,
        height
      );
    }
  }
};