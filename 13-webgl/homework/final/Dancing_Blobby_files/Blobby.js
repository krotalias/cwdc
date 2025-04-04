/**
 * @file
 *
 * Summary.
 * <p>Blobby Man - dancing at a disco club.</p>
 *
 * Description.
 * <p>
 * Based upon {@link https://www.jimblinn.com/ Jim Blinn's Corner}:
 * {@link https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=4057037 Nested Transformations and The Blobby Man}<br>
 * IEEE Computer Graphics & Applications, No. 10, October 1987
 * </p>
 * <p>There is only one graphical primitive corresponding to a
 * {@link https://threejs.org/docs/#api/en/geometries/SphereGeometry sphere},<br>
 * which is scaled, rotated and translated for each joint in the
 * <a href="/cwdc/13-webgl/Assignment_3/5.hierarchy.pdf">hierarchy</a>.</p>
 *
 * "Dancing Blobby" runs very nice on mobile devices, and one can
 * {@link https://support.apple.com/guide/iphone/learn-basic-gestures-iph75e97af9b/ios swipe}
 * the image on the screen to rotate the scene.
 *
 *
 * @author {@link https://www.artstation.com/flavulous Flavia Cavalcanti}
 * @since December 2015
 * @license {@link https://www.gnu.org/licenses/lgpl-3.0.en.html LGPLv3}.
 * @copyright © 2015-2024 Flavia R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/homework/final/Dancing_Blobby.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/final/Dancing_Blobby_files/Blobby.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/presentation.pdf">Animations in WebGL</a>
 * @see <a href="https://www.youtube.com/watch?v=AiwR1PKxMsY">Jim Blinn's Keynote Speech at SIGGRAPH (2018)</a>
 * @see <a href="https://www.youtube.com/watch?v=80uQ81BWJkQ">Jim Blinn's Chronicles SIGGRAPH (2023)</a>
 * @see <a href="https://www.youtube.com/watch?v=Kj1--TLridQ">Jim Blinn's Metaverse Podcast (2023)</a>
 * @see <a href="/cwdc/13-webgl/videos/Macarena.mp4"><img src="../blobby2.png" title="Javascript version, WebGL2" width="512"></a>
 * @see <a href="../../macarena-new.c"><img src="../../blobby2.png" title="C version, OpenGL 1.1"></a>
 */

"use strict";

/**
 * Three.js module.
 * @author Ricardo Cabello ({@link https://coopermrdoob.weebly.com/ Mr.doob})
 * @since 24/04/2010
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}
 * @external three
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 * @see {@link https://en.threejs-university.com Three.js University}
 * @see {@link https://github.com/mrdoob/three.js github}
 * @see {@link http://cindyhwang.github.io/interactive-design/Mrdoob/index.html An interview with Mr.doob}
 * @see {@link https://experiments.withgoogle.com/search?q=Mr.doob Experiments with Google}
 */

/**
 * <p>Main three.js namespace.</p>
 * {@link event:load Imported} from {@link external:three three.module.js}
 * @namespace THREE
 * @see {@link https://stackoverflow.com/questions/68528251/three-js-error-during-additional-components-importing Three.js ERROR during additional components importing}
 * @see {@link https://dplatz.de/blog/2019/es6-bare-imports.html How to handle ES6 bare module imports for local Development}
 */

/**
 * <p>A representation of mesh, line, or point geometry.</p>
 * Includes vertex positions, face indices, normals, colors, UVs,
 * and custom attributes within buffers, reducing the cost of
 * passing all this data to the GPU.
 * @class BufferGeometry
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/core/BufferGeometry BufferGeometry}
 */

/**
 * @typedef {Object} bufferGeometry
 * @property {Float32Array} vertices vertex coordinates.
 * @property {Float32Array} normals vertex normals.
 * @property {Float32Array} texCoords texture coordinates.
 * @property {Uint16Array} indices index array.
 */

/**
 * @class
 * <p>A very basic stack class for traversing a hierarchical transformation tree.</p>
 * This class maintains a {@link Matrix4 matrix} stack,
 * whose top is the current transformation matrix.<br>
 * Each transformation function applied to {@link torso Blobby} manipulates the current matrix.
 * <p>If a transformation needs to be reused,
 * it can be copied and pushed onto the top of the stack, by using the command: </p>
 *  • {@link Stack#push push}(); // “remember where you are”
 * <p>The top of the matrix stack can also be removed, by using the command:</p>
 *  • {@link Stack#pop pop}(); // “go back to where you were”
 */
class Stack {
  constructor() {
    /**
     * Transformation array.
     * @type {Array<Matrix4>}
     */
    this.elements = [];

    /**
     * Index of the stack top.
     * @type {Number}
     */
    this.t = 0;
  }

  /**
   * Push a transformation onto the stack.
   * @param {Matrix4} m a transformation matrix.
   */
  push(m) {
    this.elements[this.t++] = m;
  }

  /**
   * Return transformation on top of the stack.
   * @return {Matrix4} matrix on top.
   */
  top() {
    if (this.t <= 0) {
      console.log("top = ", this.t);
      console.log("Warning: stack underflow");
    } else {
      return this.elements[this.t - 1];
    }
  }

  /**
   * Pop transformation on top of the stack.
   * @return {Matrix4} the matrix on top of the stack.
   */
  pop() {
    if (this.t <= 0) {
      console.log("Warning: stack underflow");
    } else {
      this.t--;
      const temp = this.elements[this.t];
      this.elements[this.t] = undefined;
      return temp;
    }
  }

  /**
   * Return whether the stack is empty.
   * @return {boolean} true if the stack is empty.
   */
  isEmpty() {
    return this.t <= 0;
  }
}

/**
 * Given an instance of
 * {@link THREE.BufferGeometry THREE.BufferGeometry},
 * returns a {@link bufferGeometry} object containing raw data for:
 * <ul>
 *  <li>vertices, </li>
 *  <li>indices, </li>
 *  <li>texture coordinates, </li>
 *  <li>and normal vectors. </li>
 * </ul>
 *
 * @param {THREE.BufferGeometry} geom
 *        {@link https://threejs.org/docs/#api/en/geometries/SphereGeometry THREE.SphereGeometry}, <br>
 *        {@link https://threejs.org/docs/#api/en/geometries/PlaneGeometry THREE.PlaneGeometry}.
 * @return {bufferGeometry}
 */
function getModelData(geom) {
  return {
    vertices: geom.getAttribute("position").array,
    normals: geom.getAttribute("normal").array,
    texCoords: geom.getAttribute("uv").array,
    indices: geom.index.array,
  };
}

/**
 * Configure texture.
 * @param {HTMLImageElement} image texture image.
 */
function configureTexture(image) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // bind the shader
  gl.useProgram(texturedShader);
  gl.uniform1i(gl.getUniformLocation(texturedShader, "texture"), 0);
}

/**
 * Invert vector directions.
 * @param {Vector4} v vector.
 * @return {Vector4} inverted vector.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map Array.prototype.map()}
 */
function reverseDirection(v) {
  return v.map(function (item) {
    return -item;
  });
}

/**
 * Returns elements of the transpose of the inverse of the modelview matrix.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @return {Float32Array} modelview matrix transposed inverse.
 */
function makeNormalMatrixElements(model, view) {
  let n = new Matrix4(view).multiply(model);
  n.invert();
  n.transpose();

  // take just the upper-left 3x3 submatrix
  n = n.elements;
  // prettier-ignore
  return new Float32Array([
    n[0], n[1], n[2],
    n[4], n[5], n[6],
    n[8], n[9], n[10],
  ]);
}

/**
 * Returns the magnitude (length) of a vector.
 * @param {Array<Number>} v n-D vector.
 * @returns {Number} vector length.
 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce Array.prototype.reduce()}
 */
const vecLen = (v) =>
  Math.sqrt(v.reduce((accumulator, value) => accumulator + value * value, 0));

/**
 * Returns the height of the projection plane at a given distance from the eye.
 * @param {Number} fov field of view angle in degrees.
 * @param {Number} d view distance.
 * @returns {Number} window height.
 * @see {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix.html The Perspective and Orthographic Projection Matrix}
 */
const wheight = (fov, d) => Math.tan((fov * Math.PI) / 360) * d;

/**
 * Audio player.
 * @type {HTMLAudioElement}
 */
const audio = document.getElementById("audio");
const audioGhost = document.getElementById("audioGhost");
const audioHey = document.getElementById("audioHey");
const audioWhistle = document.getElementById("audioWhistle");

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
let gl;

/**
 * Two blobbies on/off.
 * @type {Boolean}
 */
let doubleBlobby = false;

/**
 * First random skin selector.
 * @type {Number}
 */
let selSkin = 0;

/**
 * Second random skin selector.
 * @type {Number}
 */
let selSkin2 = 0;

/**
 * Delay for the steps in the macarena animation.
 * @type {Number}
 */
const delay = 60;

/**
 * Delay for the jump in the macarena animation.
 * @type {Number}
 */
const delay2 = 10;

/**
 * Holds all setTimeout callback ids. Used for canceling all callbacks.
 * @type {Array<timeoutID>}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout setTimeout()}
 */
const callBackArray = [];

/**
 * Global stack.
 * @type {Stack}
 */
const stk = new Stack();

/**
 * Intrinsic Blobby coordinate X axis.
 * @type {Float32Array}
 * @see {@link https://dominicplein.medium.com/extrinsic-intrinsic-rotation-do-i-multiply-from-right-or-left-357c38c1abfd Extrinsic & intrinsic rotation}
 * @see {@link https://math.stackexchange.com/questions/1137745/proof-of-the-extrinsic-to-intrinsic-rotation-transform Proof of Extrinsic to Intrinsic Transform}
 * @see {@link https://pages.github.berkeley.edu/EECS-106/fa21-site/assets/discussions/D1_Rotations_soln.pdf Frame Representations}
 */
const XAXIS = new Float32Array([-2.5, 0.0, 0.0]);

/**
 * Intrinsic Blobby coordinate Y axis.
 * @type {Float32Array}
 */
const YAXIS = new Float32Array([0.0, -2.5, 0.0]);

/**
 * Intrinsic Blobby coordinate Z axis.
 * @type {Float32Array}
 */
const ZAXIS = new Float32Array([0.0, 0.0, -2.5]);

/**
 * <p>Dance on/off.</p>
 * Needed for the "Shut the hell up macarena" {@link shutUpThatSong button}.
 * @type {Boolean}
 */
let dancing = false;

/**
 * <p>Alternate skin on/off.</p>
 * {@link alternateSkins Alternate skins} between jumps.
 * @type {Boolean}
 */
let alternating = false;

/**
 * Color table - {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_shaders_to_apply_color_in_WebGL rgba} representation.
 * @type {Object<String:Array<Number>>}
 * @see {@link https://www.color-name.com Find The Color you Love}
 * @see {@link https://doc.instantreality.org/tools/color_calculator/ Color calculator}
 */
const colorTable = {
  red: [1.0, 0.0, 0.0, 1.0], // #ff0000
  duke_blue: [0.0, 0.0, 0.6, 1.0], // #000099
  black: [0.0, 0.0, 0.0, 1.0], // #000000
  white: [1.0, 1.0, 1.0, 1.0], // #ffffff
  grullo: [0.65, 0.55, 0.55, 1.0], // #a68c8c
  emerald: [0.3, 0.75, 0.45, 1.0], // #4dbf73
  solid_pink: [0.55, 0.2, 0.3, 1.0], // #8c334d
  light_moss_green: [0.7, 0.85, 0.7, 1.0], // #b3d9b3
  international_orange: [0.75, 0.2, 0.2, 1.0], // #bf3333
  persian_red: [0.8, 0.2, 0.2, 1.0], // #cc3333
  spanish_gray: [0.65, 0.6, 0.6, 1.0], // #a69999
  mauve_taupe: [0.53, 0.43, 0.43, 1.0], // #876e6e
  sheen_green: [0.5, 0.8, 0.0, 1.0], // #80cc00
  light_gold: [0.7, 0.55, 0, 1.0], // #b38c00
  flirt: [0.7, 0, 0.4, 1.0], // #b30066
  tangelo: { rgb: [0.901, 0.258, 0.0, 1.0], hex: "#e64200" },
  orange_red: { rgb: [1.0, 0.384, 0.137, 1.0], hex: "#FF6223" },
  blue_suede: [0.407, 0.482, 0.572, 1.0], // #687b92
  beige: [0.96, 0.96, 0.862, 1.0], // #f5f5dc
  army_green: [0.27, 0.294, 0.105, 1.0], // #454b1b
  philippine_silver: [0.7, 0.7, 0.7, 1.0], // #b3b3b3
};

/**
 * <p>Default skin.</p>
 * Define colors for default Blobby parts:
 * <ul>
 *  <li>mouth</li>
 *  <li>skin tone</li>
 *  <li>eyes</li>
 *  <li>torso</li>
 *  <li>pants</li>
 *  <li>body</li>
 *  <li>arms</li>
 *  <li>hands</li>
 *  <li>feet</li>
 *  <li>hat</li>
 *  <li>dinkyBall on hat</li>
 * </ul>
 * @type {Object<String,Array<Number>>}
 */
const defaultSkin = {
  mouth: colorTable.solid_pink,
  skin: colorTable.grullo, // default skin tone
  eyes: colorTable.emerald,
  torso: colorTable.black,
  pants: colorTable.army_green,
  body: colorTable.light_moss_green,
  arms: colorTable.grullo,
  hands: colorTable.black,
  feet: colorTable.blue_suede,
  hat: colorTable.army_green,
  dinkyBall: colorTable.red,
};

/**
 * <p>Vampire skin.</p>
 * Define colors for vampire Blobby parts:
 * <ul>
 *  <li>mouth</li>
 *  <li>skin tone</li>
 *  <li>eyes</li>
 *  <li>torso</li>
 *  <li>pants</li>
 *  <li>body</li>
 *  <li>arms</li>
 *  <li>hands</li>
 *  <li>feet</li>
 *  <li>hat</li>
 *  <li>dinkyBall on hat</li>
 *  <li>fang</li>
 * </ul>
 * @type {Object<String,Array<Number>>}
 */
const vampireSkin = {
  mouth: colorTable.international_orange,
  skin: colorTable.spanish_gray,
  eyes: colorTable.persian_red,
  torso: colorTable.black,
  pants: colorTable.black,
  body: colorTable.black,
  arms: colorTable.black,
  hands: colorTable.spanish_gray,
  feet: colorTable.black,
  hat: colorTable.black,
  dinkyBall: colorTable.red,
  fang: colorTable.white,
};

/**
 * <p>Disco skin.</p>
 * Define colors for disco Blobby parts:
 * <ul>
 *  <li>mouth</li>
 *  <li>skin tone</li>
 *  <li>eyes</li>
 *  <li>torso</li>
 *  <li>pants</li>
 *  <li>body</li>
 *  <li>arms</li>
 *  <li>hands</li>
 *  <li>feet</li>
 *  <li>hat</li>
 * </ul>
 * @type {Object<String,Array<Number>>}
 */
const discoSkin = {
  mouth: colorTable.solid_pink,
  eyes: colorTable.emerald,
  skin: colorTable.mauve_taupe,
  torso: colorTable.international_orange,
  pants: colorTable.sheen_green,
  body: colorTable.light_gold,
  arms: colorTable.flirt,
  hands: colorTable.mauve_taupe,
  feet: colorTable.beige,
  hat: colorTable.black,
};

/**
 * Color to be used when going up/down the transformation hierarchy.
 * @type {Array<Number>}
 */
let glColor = colorTable.white;

/**
 * Background color.
 * @type {Array<Number>}
 */
const bgColor = colorTable.philippine_silver;

/**
 * Floor color.
 * @type {Array<Number>}
 */
const flColor = colorTable.white;

/**
 * Button selected color.
 * @type {Array<Number>}
 */
const selected = colorTable.tangelo.hex;

/**
 * Button unselected color.
 * @type {Array<Number>}
 */
const unselected = colorTable.orange_red.hex;

/**
 * <p>Field of view, aspect ratio, znear, zfar.</p>
 * Aspect ratio is 1.2 corresponding to a canvas size 1100 x 900
 * @type {Array<Number>}
 */
const camera = [45.0, 1.2, 1.17, 20.7];

/**
 * Single Blobby belly position.
 * @type {Array<Number>}
 */
const single = [0.0, 0.0, 1.75];

/**
 * Jump translation in "z".
 * @type {Number}
 */
let JUMP = 0.0;

/**
 * <p>Dance rotation about "z" axis, after a jump.</p>
 * Macarena dance proceeds in four perpendicular directions.
 * @type {Number}
 */
let TURN = 0.0;

/**
 * <p>First world X rotation applied to {@link bodyMatrix}.</p>
 * We are using proper Euler angles x-z-x and
 * the center of rotation is at Blobby's belly.
 * @type {Number}
 * @see <a href="/cwdc/13-webgl/extras/doc/Nested_Transformations_and_Blobby_Man.pdf#page=5">Jim Blinn's Blobby Man</a>
 * @see {@link https://en.wikipedia.org/wiki/Euler_angles Euler angles}
 */
let BACK = -90.0;

/**
 * <p>Second world Z rotation applied to {@link bodyMatrix}.</p>
 * We are using proper Euler angles x-z-x
 * @type {Number}
 */
let SPIN = -30.0;

/**
 * <p>Third world X rotation applied to {@link bodyMatrix}.</p>
 * We are using proper Euler angles x-z-x
 * @type {Number}
 */
let TILT = 0.0;

// joint angles
let ROT = 0.0; /* z - rotate torso around hip */
let EXTEN = 0.0; /* x - rotate torso forward or backward */
let BTWIS = 0.0; /* y - rotate torso sideways */

let NOD = -25.0; /* x - rotate head forward or backward */
let NECK = 28.0; /* z - rotate head sideways */

let RANKL = 0.0; /* x - rotate right foot up or down */
let LANKL = 0.0; /* x - rotate left foot up or down */
let RFOOT = 0.0; /* z - rotate right foot sideways */
let LFOOT = 0.0; /* z - rotate left foot sideways */

let RHIP = 105.0; /* z - rotate right leg sideways around */
let ROUT = 13.0; /* y - any axis */
let RTWIS = -86.0; /* z - rotate right leg in or out */
let RKNEE = -53.0; /* x - rotate right leg around the knee */
let RFRONT = 0.0; /* x - rotate right leg forward or backward */

let RHAND = 0.0; /* y - rotate right hand around wrist */
let LHAND = 0.0; /* y - rotate left hand around wrist */

let LHIP = 0.0; /* z - angular direction that the leg is kicked */
let LOUT = 0.0; /* y - angular distance that the leg is kicked */
let LTWIS = 0.0; /* z - angle the leg is twisted about its length */
let LKNEE = 0.0; /* x - knee bend */
let LFRONT = 0.0; /* x */

let LSID = -45.0; /* y - rotate left arm sideways */
let LSHOU = 0.0; /* x - rotate left arm forward or backward */
let LATWIS = -90.0; /* z - rotate left arm in or out */
let LELBO = 90.0; /* x - rotate left arm around the elbo */

let RSID = 112.0; /* y */
let RSHOU = 40.0; /* x */
let RATWIS = -102.0; /* z - arm rotation about its own length */
let RELBO = 85.0; /* x */

/**
 * Model data (blobby parts).
 * @type {bufferGeometry}
 */
let sphere;

/**
 * Floor.
 * @type {bufferGeometry}
 */
let planeModel;

/**
 * Handle to a vertex buffer on the GPU for the spheres.
 * @type {WebGLBuffer}
 */
let vertexBuffer;
let indexBuffer;
let vertexNormalBuffer;
let texCoordBuffer;

/**
 * Handle to a vertex buffer on the GPU for the plane.
 * @type {WebGLBuffer}
 */
let vertexBufferPlane;
let indexBufferPlane;
let vertexNormalBufferPlane;
let texCoordBufferPlane;

/**
 * Handle to the {@link mainEntrance compiled} lighting shader program on the GPU,
 * used for drawing {@link renderSphere spheres}.
 * @type {WebGLShader}
 */
let lightingShader;

/**
 * Handle to the {@link mainEntrance compiled} texture shader program on the GPU,
 * used for drawing {@link GPlane the floor}.
 * @type {WebGLShader}
 */
let texturedShader;

/**
 * Transformation matrix that is the root of the hierarchy of objects defining blobby man.
 * @type {Matrix4}
 */
const bodyMatrix = new Matrix4();

/**
 * Camera position.
 * @type {Array<Number>}
 */
const eye = [0.1, -1.6, -7.5];

/**
 * View distance.
 * @type {Number}
 */
const viewDistance = vecLen(eye);

/**
 * <p>Blobby's belly screen position, after application of BACK rotation,
 * which aligned Blobby height with the Y axis.</p>
 * We want the eye at the same level of the {@link torso torso} (Blobby's belly).
 *
 * @type {Array<Number>}
 * @see <a href="/cwdc/13-webgl/extras/doc/Nested_Transformations_and_Blobby_Man.pdf#page=5">Jim Blinn's Blobby Man</a>
 */
const SCR = [0, -eye[1], 0];

/**
 * Blobby's auto rotation on/off.
 * @type {Boolean}
 */
let autoRotate = true;

/**
 * <p>View matrix, defining a projection plane normal (n = {@link eye} - at): [0, 0, -1, 0].</p>
 * Blinn uses a left-handed system in his paper, and sets BACK to -90, which makes Z goes down.<br>
 * Therefore, we have to to set the up vector to (0, -1, 0), so the image is not rendered upside down.
 * Another possibility is:
 * <ul>
 *  <li>up = [0, 1, 0], </li>
 *  <li>SCR = [0. -1.6, 0], </li>
 *  <li>BACK = 90.0; SPIN = 150.0, </li>
 *  <li>GPlane light = [0.0, 10.0, 5.0, 1.0]</li>
 * </ul>
 * <pre>
 *     u   v   n
 *    |1   0   0  -eye[0]|  (-u.eye)
 *    |0  -1   0   eye[1]|  (-v.eye)
 *    |0   0  -1   eye[2]|  (-n.eye)
 *    |0   0   0   1  |
 * </pre>
 * @type {Matrix4}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection WebGL model view projection}
 * @see {@link https://webglfundamentals.org/webgl/lessons/webgl-3d-camera.html WebGL 3D - Cameras}
 * @see <a href="/cwdc/downloads/apostila.pdf#page=109">Apostila</a>
 */
// prettier-ignore
const view = new Matrix4().setLookAt(
  ...eye,                    // eye
  eye[0], eye[1], eye[2]+1,  // at - looking at this point
  0, -1, 0,                  // up vector - y axis
);

/**
 * <p>Projection matrix.</p>
 * @type {Matrix4}
 */
let projection = new Matrix4().setPerspective(...camera);

/**
 * <p>Object to enable rotation by mouse dragging (arcball).</p>
 * For using the rotator, I had to:
 * <ul>
 *  <li>set SCR to [0, 1.6, 0] (was [-0.1, 1.6, 7.9]),</li>
 *  <li>set the eye to [0.1, -1.6, -7.5] (was at the origin),</li>
 *  <li>looking at [0.1, -1.6, -6.5] (was [0,0,1]).</li>
 * </ul>
 * because the camera's rotation fixed point is at the origin.
 * <p>Therefore, Blobby, eye and at were translated, so SCR is on plane XZ.</p>
 * This way, the rotation is going to be around the Y axis, which
 * is aligned to Blobby's height.
 * @type {SimpleRotator}
 */
let rotator;

/**
 * Translate keypress events to strings.
 * @param {KeyboardEvent} event key pressed.
 * @return {String} typed character.
 * @see  http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Keep track of all available skins.
 * @type {Array<Function>}
 */
const arrayOfSkins = [skinDefault, skinDisco, skinVampire];

/**
 * Current skin.
 * @type {Function}
 */
let currentSkin = defaultSkin;

/**
 * Number of jumps.
 * @type {Number}
 */
let numberOfJumps = 0;

/**
 * Sound on/off.
 * @type {Boolean}
 */
let shutUp = false;

/**
 * Set default {@link currentSkin skin}.
 */
function skinDefault() {
  currentSkin = defaultSkin;
}

/**
 * Set vampire {@link currentSkin skin}.
 */
function skinVampire() {
  currentSkin = vampireSkin;
}

/**
 * Set disco {@link currentSkin skin}.
 */
function skinDisco() {
  currentSkin = discoSkin;
}

/**
 * <p>Keeps track of the number of jumps performed by Blobby.</p>
 * Needed in order to alternate skins in the middle of the dance.
 * @param {Number} t
 */
function incrementJumps(t) {
  callBackArray.push(
    setTimeout(
      function () {
        numberOfJumps++;
      },
      (t += 1),
    ),
  );
  return t;
}

/**
 * Specifies that Blobby should change skins after every jump.
 */
function alternateSkins() {
  if (!doubleBlobby) {
    alternating = !alternating;
    if (!alternating)
      document.getElementById("skinButton").style.backgroundColor = unselected;
    else document.getElementById("skinButton").style.backgroundColor = selected;
  }
}

/**
 * Turn auto rotation on/off.
 */
function autoRotation() {
  autoRotate = !autoRotate;
  if (!autoRotate)
    document.getElementById("autoRotateButton").style.backgroundColor =
      selected;
  else
    document.getElementById("autoRotateButton").style.backgroundColor =
      unselected;
}

/**
 * Overdose, overdose, overdose of macarena.
 */
function shutUpThatSong() {
  shutUp = !shutUp;
  if (!shutUp) {
    document.getElementById("shutUpButton").style.backgroundColor = unselected;
    if (dancing) audio.play();
  } else {
    audio.pause();
    document.getElementById("shutUpButton").style.backgroundColor = selected;
  }
}

/**
 * Stops the Macarena song if Blobby is only dancing one round.
 */
function stopSongAfterDance(t) {
  callBackArray.push(
    setTimeout(
      function () {
        audio.pause();
        audio.currentTime -= 30.0;
      },
      (t += 1),
    ),
  );
  return t;
}

/**
 * Double trouble for macarena.
 */
function doubleDancers() {
  doubleBlobby = true;
  alternating = false;
  selSkin = Math.floor(Math.random() * arrayOfSkins.length);
  selSkin2 = Math.floor(Math.random() * arrayOfSkins.length);
  document.getElementById("doubleButton").style.backgroundColor = selected;
  document.getElementById("singleButton").style.backgroundColor = unselected;
  document.getElementById("skinButton").style.backgroundColor = unselected;
}

/**
 * Only one blobby is good enough for me - said no one ever, but whatever.
 */
function singleDancer() {
  doubleBlobby = false;
  document.getElementById("doubleButton").style.backgroundColor = unselected;
  document.getElementById("singleButton").style.backgroundColor = selected;
}

/**
 * Apply a single movement and the sway to Blobby.
 */
function applyMoveAndSway(t, move1, move, sign) {
  for (let i = 0; i < 4; ++i) {
    callBackArray.push(
      setTimeout(
        function () {
          move1();
          move(sign);
        },
        (t += delay),
      ),
    );
  }
  return t;
}

/**
 * <p>Apply a single movement to Blobby.</p>
 * As this function may not be directly linked to the macarena dance,
 * a different time delay amount may be passed in.
 */
function applyMove(t, move, timeDelay, sign) {
  for (let i = 0; i < 8; ++i) {
    callBackArray.push(
      setTimeout(
        function () {
          move(sign); //sign may or may not be given
        },
        (t += timeDelay),
      ),
    );
  }
  return t;
}

/**
 * <p>What to do when the Sway button is clicked.</p>
 * Stops the {@link stopCallBack dance} and calls {@link sway}.
 */
function swayCallBack() {
  stopCallBack();
  const t = sway();
  // console.log ( "sway = " + t );
  // document.getElementById("div").value = t;
}

/**
 * <p>What to do when the Dance button is clicked.</p>
 * First, the {@link stopCallBack dance} is stopped.
 * Then, the {@link macarena} is executed.
 * <p>Also, it started to really annoy me when the music started playing in the middle.
 * Therefore, when the song is not {@link shutUp}, let's rewind it.</p>
 */
function danceCallBack(loop = true) {
  if (loop) {
    document.getElementById("danceButton").style.backgroundColor = selected;
  }

  stopCallBack();
  if (!shutUp) {
    audio.currentTime -= 30.0;
    audio.play();
  }
  const t = macarena(loop, true);
  // console.log("macarena = " + t);
}

/**
 * <p>What to do when the Stop button is clicked.</p>
 * Pauses the audio, sets {@link dancing} to false and clears out the {@link callBackArray event array}.
 * @param {Boolean} stopButton true if function was called by clicking on the stopButton, and false otherwise.
 */
function stopCallBack(stopButton = false) {
  document.getElementById("timeBoxDiv").innerHTML = "0 ms/cycle";
  audio.pause();
  dancing = false;
  if (stopButton)
    document.getElementById("danceButton").style.backgroundColor = unselected;

  callBackArray.map(clearTimeout);
  callBackArray.length = 0;
}

/**
 * Handler for key press events
 * to adjusts joint angles.
 * @param {KeyboardEvent} event key pressed.
 */
function handleKeyPress(event) {
  const ch = getChar(event);
  let t;
  switch (ch) {
    case "r":
      SPIN += 15;
      break;

    case "R":
      SPIN -= 15;
      break;

    case "t":
      ROT += 15;
      break;

    case "T":
      ROT -= 15;
      break;

    case "s":
      LSHOU += 15;
      RSHOU += 15;
      break;

    case "S":
      LSHOU -= 15;
      RSHOU -= 15;
      break;

    case "a":
      LELBO += 15;
      RELBO += 15;
      break;

    case "A":
      LELBO -= 15;
      RELBO -= 15;
      break;

    case "l":
      LKNEE += 15;
      RKNEE += 15;
      break;

    case "L":
      LKNEE -= 15;
      RKNEE -= 15;
      break;

    case "m":
      danceCallBack(false);
      break;

    case "e":
      t = 0;
      stopCallBack();
      audioGhost.play();
      audio.pause();
      scaryPose();
      for (let i = 0; i < 9; i++) {
        t = applyMove(t, spinHead, 5);
        t = applyMove(t, spinShoulder, 20, -1);
        t = applyMove(t, spinShoulder, 20, 1);
      }
      break;

    case "w":
      t = 0; // accumulated time counter
      audioHey.play();
      audio.pause();
      stopCallBack();
      prepareForWave();
      for (let i = 0; i < 2; i++) {
        t = applyMove(t, wave, delay2, 1);
        t = applyMove(t, wave, delay2, -1);
      }
      break;

    case "b":
      t = 0; // accumulated time counter
      audioWhistle.play();
      audio.pause();
      stopCallBack();
      bowPose();
      t = applyMove(t, bowDown, delay, 1);
      t = applyMove(t, bowDown, delay, -1);
      //        t = applyMove(t, retBow, delay);
      break;

    case "W":
      resetAngles();
      stopCallBack();
      t = 0; // accumulated time counter
      t = applyMoveAndSway(t, raiseLeftArm, rsway, 1);
      t = applyMoveAndSway(t, raiseLeftArm, rsway, -1);
      break;

    case "j":
      resetAngles();
      stopCallBack();
      t = 0; // accumulated time counter
      t = applyMove(t, bendForJump, delay2);
      t = applyMove(t, stretchForJump, delay2);
      t = applyMove(t, jumpAndTurn, delay2);
      t = applyMove(t, landFromJump, delay2);
      t = applyMove(t, dampenJump, delay2);
      t = applyMove(t, finishJump, delay2);
      break;

    case "u":
      stopCallBack();
      whatsUp();
      break;

    case "i":
      stopCallBack();
      prepareForWave();
      break;

    case "o":
      stopCallBack();
      handsOnHips();
      break;

    case "p":
      stopCallBack();
      bowPose();
      break;

    case "d":
      skinDefault();
      break;

    case "v":
      skinVampire();
      break;

    case "c":
      skinDisco();
      break;

    case "q":
    case "Q":
      autoRotation();
      break;

    default:
      return;
  }
}

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @event KeyboardEvent
 */
const createEvent = (key) => {
  const code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * Renders a sphere, based on the model transformation
 * on top of the stack,
 * by using the {@link lightingShader}.</p>
 * There is a single light source at position [0.0, 5.0, -5.0, 1.0].
 * @param {Array<Number>} color sphere color.
 */
function renderSphere(color = glColor) {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);

  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);

  let loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "u_Color");
  gl.uniform4f(loc, ...color);
  loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 0.0, 5.0, -5.0, 1.0);

  const modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
  const normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

  // transform using current model matrix on top of stack
  const current = new Matrix4(stk.top());
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, view),
  );

  gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);
}

/**
 * <p>Draw the floor plane (in fact, a {@link https://threejs.org/docs/#api/en/geometries/PlaneGeometry rectangle}),
 * by using the {@link texturedShader}.</p>
 * The {@link planeModel plane} normal is (0,0,1) and its pointset is given
 * by the cartesian product of intervals [-3,3] x [-3,3], on plane XY.
 * <p>The single Blobby feet is at {@link draw position} (0,0,0).</p>
 * <p>There is a single light source at position [0.0, -10.0, 5.0, 1.0].</p>
 */
function GPlane() {
  // bind the shader
  gl.useProgram(texturedShader);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(texturedShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const normalIndex = gl.getAttribLocation(texturedShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  const vTexCoord = gl.getAttribLocation(texturedShader, "vTexCoord");
  if (vTexCoord < 0) {
    console.log("Failed to get the storage location of vTexCoord");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  gl.enableVertexAttribArray(vTexCoord); //gimme the tex

  // draw the plane
  // bind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane); //gimme the tex
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0); //gimme the tex

  let loc = gl.getUniformLocation(texturedShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(texturedShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(texturedShader, "u_Color");
  gl.uniform4f(loc, ...flColor);
  loc = gl.getUniformLocation(texturedShader, "lightPosition");
  gl.uniform4f(loc, 0.0, -10.0, 5.0, 1.0);

  const modelMatrixloc = gl.getUniformLocation(texturedShader, "model");
  const normalMatrixLoc = gl.getUniformLocation(texturedShader, "normalMatrix");

  // transform using current model matrix on top of stack
  const current = new Matrix4(stk.top());
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  //gl.uniformMatrix3fv(normalMatrixLoc, false, reverseDirection(makeNormalMatrixElements(current, view)));
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, view),
  );

  // draw
  gl.drawElements(
    gl.TRIANGLES,
    planeModel.indices.length,
    gl.UNSIGNED_SHORT,
    0,
  );

  gl.useProgram(null);
}

/**
 * Add a new Blobby to the scene translated by (DX,DY)
 * and "dressed for success" with the given {@link torso skin}.
 * @param {Number} DX horizontal translation.
 * @param {Number} DY vertical translation.
 * @param {Function} skin function for drawing the skin.
 */
function addBlobby(DX, DY, skin) {
  bodyMatrix.setTranslate(...SCR);
  bodyMatrix
    .rotate(BACK, XAXIS[0], XAXIS[1], XAXIS[2])
    .rotate(SPIN, ZAXIS[0], ZAXIS[1], ZAXIS[2])
    .rotate(TILT, XAXIS[0], XAXIS[1], XAXIS[2]);

  bodyMatrix.translate(single[0] + DX, single[1] + DY, single[2]);

  // for jumping and spinning at the dance
  bodyMatrix.translate(0, 0, JUMP);
  bodyMatrix.rotate(TURN, ZAXIS[0], ZAXIS[1], ZAXIS[2]);

  stk.push(bodyMatrix);
  new torso(skin);
  stk.pop();
}

/**
 * Code to actually render our scene geometry,
 * by drawing the {@link GPlane floor} and one or two {@link addBlobby Blobbies}.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  view.elements = rotator.getViewMatrix();

  bodyMatrix.setTranslate(...SCR);
  bodyMatrix
    .rotate(BACK, XAXIS[0], XAXIS[1], XAXIS[2])
    .rotate(SPIN, ZAXIS[0], ZAXIS[1], ZAXIS[2])
    .rotate(TILT, XAXIS[0], XAXIS[1], XAXIS[2]);

  stk.push(bodyMatrix);
  GPlane();
  stk.pop();

  if (doubleBlobby) addBlobby(-1, 0, arrayOfSkins[selSkin]);
  else addBlobby(0, 0);

  if (doubleBlobby) {
    // we need to make the second matrix independent from the first
    addBlobby(1, 0, arrayOfSkins[selSkin2]);
  }

  if (!stk.isEmpty()) {
    console.log("Warning: pops do not match pushes");
  }
}

/**
 * <p>Entry point when page is loaded. </p>
 *
 *  <p>Triggers the {@link animate animation}.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw} does things that have to be repeated each time the canvas is drawn.
 */
function mainEntrance() {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  const aspect = canvas.width / canvas.height;

  /**
   * <p>Fires when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @callback handleWindowResize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  function handleWindowResize() {
    let h = window.innerHeight - 16;
    let w = window.innerWidth - 16;
    if (h > w) {
      h = w / aspect; // aspect < 1
    } else {
      w = h * aspect; // aspect > 1
    }
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    // projection = new Matrix4().setPerspective(...camera);
  }

  // mobile devices
  if (screen.width <= 800) {
    /**
     * @summary Executed when the window is resized.
     * <p>Appends an event listener for events whose type attribute value is resize.</p>
     * <p>The {@link handleWindowResize callback} argument sets the callback
     * that will be invoked when the event is dispatched.</p>
     * @param {Event} event the document view is resized.
     * @param {callback} function function to run when the event occurs.
     * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
     * @event resize
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
     */
    window.addEventListener("resize", handleWindowResize, false);
    handleWindowResize();
  }

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.</p>
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.
   *
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.addEventListener("keydown", (event) => {
    handleKeyPress(event);
  });

  /**
   * <p>Appends an event listener for events whose type attribute value is ended.</p>
   * The ended event is fired when playback or streaming has stopped,
   * because the end of the media was reached or because no further data is available.
   *
   * <p>Here, the song macarena is restarted.</p>
   *
   * @event ended
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event HTMLMediaElement ended event}
   */
  audio.addEventListener(
    "ended",
    function () {
      this.currentTime = 0;
      this.play();
    },
    false,
  );

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById(
    "vertexLightingShader",
  ).textContent;
  const fshaderSource = document.getElementById(
    "fragmentLightingShader",
  ).textContent;
  const vshaderTextured = document.getElementById(
    "vertexTexturedShader",
  ).textContent;
  const fshaderTextured = document.getElementById(
    "fragmentTexturedShader",
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  lightingShader = gl.program;

  if (!initShaders(gl, vshaderTextured, fshaderTextured)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  texturedShader = gl.program;
  gl.useProgram(null);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  indexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // basic sphere
  sphere = getModelData(new THREE.SphereGeometry(1, 48, 24));

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

  // buffer for tex coords
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log("Failed to create the texture buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW);

  // plane for "floor"
  planeModel = getModelData(new THREE.PlaneGeometry(6, 6));

  // buffer for vertex positions for triangles
  vertexBufferPlane = gl.createBuffer();
  indexBufferPlane = gl.createBuffer();
  if (!vertexBufferPlane) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferPlane);
  gl.bufferData(gl.ARRAY_BUFFER, planeModel.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, planeModel.indices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBufferPlane = gl.createBuffer();
  if (!vertexNormalBufferPlane) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);

  // choose face normals, vertex normals, or wacky normals
  gl.bufferData(gl.ARRAY_BUFFER, planeModel.normals, gl.STATIC_DRAW);

  // buffer for tex coords
  texCoordBufferPlane = gl.createBuffer();
  if (!texCoordBufferPlane) {
    console.log("Failed to create the texture buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferPlane);
  gl.bufferData(gl.ARRAY_BUFFER, planeModel.texCoords, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(...bgColor);

  gl.enable(gl.DEPTH_TEST);

  // Initialize a texture
  const image = document.getElementById("texImage");

  configureTexture(image);

  // create new rotator object
  rotator = new SimpleRotator(canvas, draw);
  rotator.setViewMatrix(view.elements);
  rotator.setViewDistance(viewDistance);

  window.exorcist = () => {
    handleKeyPress(createEvent("e"));
  };

  window.bdown = () => {
    handleKeyPress(createEvent("b"));
  };

  window.bwave = () => {
    handleKeyPress(createEvent("w"));
  };

  window.blarmup = () => {
    handleKeyPress(createEvent("W"));
  };

  window.bljump = () => {
    handleKeyPress(createEvent("j"));
  };

  /**
   * A closure to render the application and display the fps.
   *
   * @return {loop} animation callback.
   * @function
   * @global
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
   */
  const animate = (() => {
    // time in milliseconds
    let previousTimeStamp = Date.now();
    let numberOfFramesForFPS = 0;
    const fpsCounter = document.getElementById("fps");
    let currentTime;

    // increase the rotation by some amount, depending on the axis chosen
    const increment = 0.5;
    const axis = "y";
    const rotMatrix = {
      x: new Matrix4().setRotate(increment, 1, 0, 0),
      y: new Matrix4().setRotate(increment, 0, 1, 0),
      z: new Matrix4().setRotate(increment, 0, 0, 1),
    };

    /**
     * <p>Define an animation loop, by calling {@link draw} for each frame.</p>
     * @callback loop
     * @global
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame Window: requestAnimationFrame() method}
     */
    return () => {
      currentTime = Date.now();
      if (Math.abs(currentTime - previousTimeStamp) >= 1000) {
        fpsCounter.innerHTML = `(${numberOfFramesForFPS} fps)`;
        numberOfFramesForFPS = 0;
        previousTimeStamp = currentTime;
      }
      numberOfFramesForFPS++;
      // intrinsic rotation - multiply on the right
      if (autoRotate) {
        view.multiply(rotMatrix[axis]);
        rotator.setViewMatrix(view.elements);
      }
      draw();
      requestAnimationFrame(animate);
    };
  })();

  // start drawing!
  animate();
}

// ======== BUILDING BLOBBY ===============

function head() {
  let t = new Matrix4(stk.top()); // head
  stk.push(t);
  t.translate(0.0, 0.0, 0.4);
  t.scale(0.2, 0.23, 0.3);
  renderSphere(currentSkin.skin);
  stk.pop();

  const disco = !("dinkyBall" in currentSkin);
  const vampire = "fang" in currentSkin;

  if (disco) {
    // black power
    t = new Matrix4(stk.top()); // hat
    stk.push(t);
    t.translate(0.0, 0.07, 0.74);
    t.scale(0.33, 0.33, 0.27);
    renderSphere(currentSkin.hat);
    stk.pop();
  } else {
    // hat for vampire or default
    t = new Matrix4(stk.top()); // hat
    stk.push(t);
    t.translate(0.0, 0.0, 0.64);
    t.scale(0.3, 0.3, 0.15);
    renderSphere(currentSkin.hat);
    stk.pop();

    t = new Matrix4(stk.top()); // dinky ball on hat
    stk.push(t);
    t.translate(0.0, 0.0, 0.8);
    t.scale(0.04, 0.04, 0.04);
    renderSphere(currentSkin.dinkyBall);
    stk.pop();
  }

  t = new Matrix4(stk.top()); // eye right
  stk.push(t);
  t.translate(-0.07, -0.205, 0.5);
  t.scale(0.03, 0.02, 0.03);
  renderSphere(currentSkin.eyes);
  stk.pop();

  t = new Matrix4(stk.top()); // eye left
  stk.push(t);
  t.translate(0.07, -0.205, 0.5);
  t.scale(0.03, 0.02, 0.03);
  renderSphere(currentSkin.eyes);
  stk.pop();

  t = new Matrix4(stk.top()); // eye right
  stk.push(t);
  t.translate(-0.07, -0.205, 0.5);
  t.scale(0.03, 0.02, 0.03);
  renderSphere(currentSkin.eyes);
  stk.pop();

  if (vampire) {
    t = new Matrix4(stk.top()); // fang right
    stk.push(t);
    t.translate(0.04, -0.2, 0.18);
    t.scale(0.01, 0.005, 0.05);
    renderSphere(currentSkin.fang);
    stk.pop();

    t = new Matrix4(stk.top()); // fang left
    stk.push(t);
    t.translate(-0.04, -0.2, 0.18);
    t.scale(0.01, 0.005, 0.05);
    renderSphere(currentSkin.fang);
    stk.pop();
  }

  t = new Matrix4(stk.top()); // nose
  stk.push(t);
  t.translate(0.0, -0.255, 0.42);
  t.scale(0.035, 0.075, 0.035);
  renderSphere(currentSkin.skin);
  stk.pop();

  t = new Matrix4(stk.top()); // neck
  stk.push(t);
  t.translate(0.0, 0.0, 0.07);
  t.scale(0.065, 0.065, 0.14);
  renderSphere(currentSkin.skin);
  stk.pop();

  t = new Matrix4(stk.top()); // mouth
  stk.push(t);
  t.translate(0.0, -0.162, 0.239);
  t.scale(0.0633, 0.0508, 0.0506);
  renderSphere(currentSkin.mouth);
  stk.pop();
}

function uparm() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.275);
  t.scale(0.09, 0.09, 0.275);
  renderSphere();
  stk.pop();
}

function lowarm() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.25);
  t.scale(0.08, 0.08, 0.25);
  renderSphere();
  stk.pop();
}

function hand() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.116);
  t.scale(0.052, 0.091, 0.155);
  renderSphere(currentSkin.hands);
  stk.pop();
}

function leftarm() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  uparm();
  t.translate(0.0, 0.0, -0.55);
  t.rotate(LELBO, XAXIS[0], XAXIS[1], XAXIS[2]);
  lowarm();
  t.translate(0.0, 0.0, -0.5);
  hand();
  stk.pop();
}

function rightarm() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  uparm();
  t.translate(0.0, 0.0, -0.55);
  t.rotate(RELBO, XAXIS[0], XAXIS[1], XAXIS[2]);
  lowarm();
  t.translate(0.0, 0.0, -0.5);
  hand();
  stk.pop();
}

function shoulder() {
  let t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.45, 0.153, 0.12);
  renderSphere();
  stk.pop();

  glColor = currentSkin.arms;
  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.153);
  t.rotate(NOD, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(NECK, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  head();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(-0.45, 0.0, 0.0);
  t.rotate(LSID, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(LSHOU, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(LATWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  leftarm();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.45, 0.0, 0.0);
  t.rotate(RSID, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(RSHOU, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(RATWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  rightarm();
  stk.pop();
}

function body() {
  glColor = currentSkin.body;

  let t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.62);
  t.scale(0.306, 0.21, 0.5);
  renderSphere();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 1.0);
  t.rotate(
    EXTEN,
    XAXIS[0],
    XAXIS[1],
    XAXIS[2],
  ); /* the shoulder glRotates twice */
  t.rotate(BTWIS, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(ROT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  shoulder();
  stk.pop();
}

function thigh() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.425);
  t.scale(0.141, 0.141, 0.425);
  renderSphere(currentSkin.pants);
  stk.pop();
}

function calf() {
  let t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.05, 0.05, 0.05);
  renderSphere(currentSkin.pants);
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, -0.425);
  t.scale(0.1, 0.1, 0.425);
  renderSphere(currentSkin.pants);
  stk.pop();
}

function foot() {
  let t = new Matrix4(stk.top());
  stk.push(t);
  t.scale(0.05, 0.04, 0.04);
  renderSphere(currentSkin.pants); // ankle
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.05, -0.05);
  t.scale(0.04, 0.04, 0.04);
  renderSphere(currentSkin.feet); // heel
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, -0.15, -0.05);
  t.rotate(10.0, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.scale(0.08, 0.19, 0.05);
  renderSphere(currentSkin.feet); // foot
  stk.pop();
}

function leftleg() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(LFRONT, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(LHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(LOUT, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(-LHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(LTWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  thigh();
  t.translate(0.0, 0.0, -0.85);
  t.rotate(LKNEE, XAXIS[0], XAXIS[1], XAXIS[2]);
  calf();
  t.translate(0.0, 0.0, -0.84);
  t.rotate(LANKL, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(LFOOT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  foot();
  stk.pop();
}

function rightleg() {
  const t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(RFRONT, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(RHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(ROUT, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(-RHIP, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  t.rotate(RTWIS, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  thigh();
  t.translate(0.0, 0.0, -0.85);
  t.rotate(RKNEE, XAXIS[0], XAXIS[1], XAXIS[2]);
  calf();
  t.translate(0.0, 0.0, -0.84);
  t.rotate(RANKL, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(RFOOT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  foot();
  stk.pop();
}

/**
 * Draws Blobby's torso using the given function
 * to set its skin.
 * @param {Function} func skin.
 */
function torso(func = skinDefault) {
  if (doubleBlobby) func();
  glColor = currentSkin.torso;
  let t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(-0.178, 0.0, 0.0);
  leftleg();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.178, 0.0, 0.0);
  rightleg();
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.translate(0.0, 0.0, 0.08);
  t.scale(0.275, 0.152, 0.153);
  renderSphere(currentSkin.pants);
  stk.pop();

  t = new Matrix4(stk.top());
  stk.push(t);
  t.rotate(EXTEN, XAXIS[0], XAXIS[1], XAXIS[2]);
  t.rotate(BTWIS, YAXIS[0], YAXIS[1], YAXIS[2]);
  t.rotate(ROT, ZAXIS[0], ZAXIS[1], ZAXIS[2]);
  body();
  stk.pop();
}

// =========== POSES =============================

/**
 * Default position, Blobby's legs are straight facing the origin.
 */
function stiffPosition() {
  TURN = 0.0;
  JUMP = 0.0;
  ROT = 0.0; /* z - rotate torso around hip */
  EXTEN = 0.0; /* x - rotate torso forward or backward */
  BTWIS = 0.0; /* y - rotate torso sideways */

  NOD = 0.0; /* x - rotate head forward or backward */
  NECK = 0.0; /* z - rotate head sideways */

  RANKL = 0.0; /* x - rotate right foot up or down */
  LANKL = 0.0; /* x - rotate left foot up or down */
  RFOOT = 0.0; /* z - rotate right foot sideways */
  LFOOT = 0.0; /* z - rotate left foot sideways */

  RHIP = 0.0; /* z - rotate right leg sideways around */
  ROUT = 0.0; /* y - any axis */
  RTWIS = 0.0; /* z - rotate right leg in or out */
  RKNEE = 0.0; /* x - rotate right leg around the knee */
  RFRONT = 0.0;

  RHAND = 0.0; /* y - rotate right hand around wrist */
  LHAND = 0.0; /* y - rotate left hand around wrist */

  LHIP = 0.0; /* z */
  LOUT = 0.0; /* y */
  LTWIS = 0.0; /* z */
  LKNEE = 0.0; /* x */
  LFRONT = 0.0;
}

/**
 * Put Blobby standing still with hands on his hip.
 */
function resetAngles() {
  callBackArray.length = 0; // clear callBackArray

  stiffPosition();

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 45.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

/**
 * Relaxed Blobby - waving with left hand.
 */
function whatsUp() {
  stiffPosition();

  NOD = -20.0; /* x - rotate head forward or backward */
  NECK = 30.0; /* z - rotate head sideways */

  LHIP = 0;
  LOUT = 0;
  LKNEE = 0;
  LTWIS = 0;

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 112.0; /* y */
  RSHOU = 40.0; /* x */
  RATWIS = -102.0; /* z */
  RELBO = 85.0; /* x */

  RHIP = 105;
  RKNEE = -53.0;
  RTWIS = -102;
}

/**
 * Scared Blobby.
 */
function scaryPose() {
  stiffPosition();

  NOD = -20.0; /* x - rotate head forward or backward */
  NECK = 30.0; /* z - rotate head sideways */

  LSID = 0.0; /* y - rotate left arm sideways */
  LSHOU = 90.0; /* x - rotate left arm forward or backward */
  LATWIS = 90.0; /* z - rotate left arm in or out */
  LELBO = 0.0; /* x - rotate left arm around te elbo */

  RSID = 0.0; /* y */
  RSHOU = 90.0; /* x */
  RATWIS = 90.0; /* z */
  RELBO = 0.0; /* x */
}

/**
 * Setting Blobby up for a wave.
 */
function prepareForWave() {
  stiffPosition();

  NOD = -20.0; /* x - rotate head forward or backward */
  NECK = 30.0; /* z - rotate head sideways */

  LSID = -115.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = 90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 115.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = 90.0; /* x */
}

/**
 * Set Blobby to bow down.
 */
function bowPose() {
  stiffPosition();

  LSID = -5.0; /* y - rotate left arm sideways */
  LSHOU = 40.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 120.0; /* x - rotate left arm around te elbo */

  RSID = 15.0; /* y */
  RSHOU = -30.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

/**
 * Put Blobby standing still with hands on his hip.
 */
function handsOnHips() {
  stiffPosition();

  LSID = -45.0; /* y - rotate left arm sideways */
  LSHOU = 0.0; /* x - rotate left arm forward or backward */
  LATWIS = -90.0; /* z - rotate left arm in or out */
  LELBO = 90.0; /* x - rotate left arm around te elbo */

  RSID = 45.0; /* y */
  RSHOU = 0.0; /* x */
  RATWIS = -90.0; /* z */
  RELBO = -90.0; /* x */
}

// =========== MOVEMENTS =======================

function wave(sign) {
  console.log(5 * sign);
  RELBO += 5 * sign;
  LELBO += 5 * sign;
}

function bow() {
  let t = 0; // accumulated time counter
  bowPose();
  t = applyMove(t, bowDown, delay, 1);
  t = applyMove(t, bowDown, delay, -1);
  return t;
}

// exorcist
function spinHead() {
  NECK += 5;
}

function spinShoulder(sign) {
  LSHOU += sign * 3;
  RSHOU += -1 * sign * 3;
}

/**
 * Lower back to bow.
 */
function bowDown(sign) {
  console.log("bow");
  console.log(sign);
  EXTEN -= 7 * sign;
  NOD += 3 * sign;
  LSHOU += 7 * sign;
  RSHOU += 7 * sign;
}

/**
 * Sway to the left.
 */
function lsway(sign) {
  BTWIS += 1 * sign;
  LANKL -= 5 * sign;
  LFRONT += 5.5 * sign;
  LKNEE -= 8 * sign;
}

/**
 * Sway to the right.
 */
function rsway(sign) {
  BTWIS -= 1 * sign;
  RANKL -= 5 * sign;
  RFRONT += 5.5 * sign;
  RKNEE -= 8 * sign;
}

/**
 * Raise the right arm half way.
 */
function raiseRightArm() {
  RELBO += 10;
  RATWIS -= 6.5;
  RSHOU += 9;
}

/**
 * Raise the left arm half way.
 */
function raiseLeftArm() {
  LELBO -= 10;
  LATWIS += 6.5;
  LSHOU += 9;
}

/**
 * Put right hand on the head.
 */
function rightHandOnHead() {
  RSHOU += 5;
  RATWIS -= 9;
  RHAND += 2.5;
}

/**
 * Put left hand on the head.
 */
function leftHandOnHead() {
  LSHOU += 5;
  LATWIS += 9;
  LHAND += 2.5;
}

/**
 * Go back to initial position.
 */
function rightGoBack() {
  RSHOU -= 14;
  RATWIS += 15.5;
  RHAND -= 2.5;
  RELBO += 2;
}

/**
 * Go back to initial position.
 */
function leftGoBack() {
  LSHOU -= 14;
  LATWIS -= 15.5;
  LHAND -= 2.5;
  LELBO -= 2;
}

/**
 * Bend the knees for the jump.
 */
function bendForJump() {
  JUMP -= 1.0 / 30;
  LFRONT += 4.5;
  RFRONT += 4.5;
  RANKL += 3;
  LANKL += 3;
  RKNEE -= 8;
  LKNEE -= 8;
  LELBO -= 5.5;
  RELBO += 5.5;
  LSID += 4;
  RSID -= 4;
  RSHOU -= 3;
  LSHOU -= 3;
  RATWIS -= 10;
  LATWIS += 10;
  EXTEN -= 2;
}

/**
 * Stretch the legs for the jump.
 */
function stretchForJump() {
  JUMP += 1.0 / 30;
  LFRONT -= 4.5;
  RFRONT -= 4.5;
  RANKL -= 5;
  LANKL -= 5;
  RKNEE += 8;
  LKNEE += 8;
  EXTEN += 1;
  LELBO += 4;
  RELBO -= 4;
  RSHOU += 3;
  LSHOU += 3;
}

/**
 * Excute the jump and turn to the left.
 */
function jumpAndTurn() {
  JUMP += 1.0 / 10;
  RANKL -= 5;
  LANKL -= 5;
  EXTEN += 1;
  TURN -= 5.625;
  NOD += 2;
}

/**
 * Put the feet on the floor.
 */
function landFromJump() {
  JUMP -= 1.0 / 10;
  RANKL += 5;
  LANKL += 5;
  NOD -= 2;
  TURN -= 5.625;
  if (alternating) {
    arrayOfSkins[numberOfJumps % arrayOfSkins.length]();
  }
}

/**
 * Dampen the jump bending the knees.
 */
function dampenJump() {
  JUMP -= 1.0 / 50;
  LFRONT += 3;
  RFRONT += 3;
  RANKL += 5;
  LANKL += 5;
  RKNEE -= 6;
  LKNEE -= 6;
  EXTEN -= 1;
}

/**
 * Go back to initial position.
 */
function finishJump() {
  JUMP += 1.0 / 50;
  LFRONT -= 3;
  RFRONT -= 3;
  RANKL -= 3;
  LANKL -= 3;
  RKNEE += 6;
  LKNEE += 6;
  LELBO += 1.5;
  RELBO -= 1.5;
  LSID -= 4;
  RSID += 4;
  RATWIS += 10;
  LATWIS -= 10;
  EXTEN += 1;
}

/**
 * Keep swaying, that is, leaning the torso from left to right around the
 * {@link https://en.wikipedia.org/wiki/Hip hip}.</p>
 */
function sway() {
  let t = 0;
  resetAngles();
  t = applyMoveAndSway(t, function () {}, lsway, +1);
  t = applyMoveAndSway(t, function () {}, lsway, -1);
  t = applyMoveAndSway(t, function () {}, rsway, +1);
  t = applyMoveAndSway(t, function () {}, rsway, -1);
  callBackArray.push(setTimeout(sway, t));
  return t;
}

function returnHandsToHips() {
  LSID -= 2.55; /* y - rotate left arm sideways */
  LSHOU -= 2.45; /* x - rotate left arm forward or backward */
  LELBO -= 1.85; /* x - rotate left arm around te elbo */

  RSID += 1.85; /* y */
  RSHOU += 1.9; /* x */

  //    console.log("LSID: " + LSID);
  //    console.log("LSHOU: " +LSHOU);
  //    console.log("LELBO: " + LELBO);
  //    console.log("RSID: " + RSID);
  //    console.log("RSHOU: " + RSHOU);
}

// ============================================

/**
 * <p>Dance the "Los del Rio", {@link https://en.wikipedia.org/wiki/Macarena Macarena song}.</p>
 * An optional pre-movement
 * (e.g., {@link bowDown bow}+{@link sway}) can be appended before the dance.
 * @param {Boolean} loop whether to start an endless dancing loop.
 * @param {Boolean} firstloop whether the pre-movement should be appended.
 * @return {Number} total time.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout Window: setTimeout() method}
 */
function macarena(loop, firstLoop) {
  dancing = true; // needed for the shut up button

  let t = 0; // accumulated time counter

  let firstTime = false; // denotes that its not the first time this loop is called

  resetAngles();

  if (firstLoop == true) {
    // only bow once: 60*8*2 + 60*4*4 = 1920ms
    bowPose();
    t = applyMove(t, bowDown, delay, 1);
    t = applyMove(t, bowDown, delay, -1);
    t = applyMoveAndSway(t, returnHandsToHips, lsway, +1);
    t = applyMoveAndSway(t, returnHandsToHips, lsway, -1);
    t = applyMoveAndSway(t, returnHandsToHips, rsway, +1);
    t = applyMoveAndSway(t, returnHandsToHips, rsway, -1);

    for (let j = 0; j < 5; j++) {
      // sway a bit: 60*4*4*5 = 4800ms
      t = applyMoveAndSway(t, function () {}, lsway, +1);
      t = applyMoveAndSway(t, function () {}, lsway, -1);
      t = applyMoveAndSway(t, function () {}, rsway, +1);
      t = applyMoveAndSway(t, function () {}, rsway, -1);
    }
    t += 780; // fix the pace to match the beat
    // pre-movement total: 1920 + 4800 + 780 = 75000ms
  }

  for (let j = 0; j < 4; j++) {
    // stretch the arms: 60*4*4=960ms
    t = applyMoveAndSway(t, raiseRightArm, lsway, +1);
    t = applyMoveAndSway(t, raiseRightArm, lsway, -1);
    t = applyMoveAndSway(t, raiseLeftArm, rsway, +1);
    t = applyMoveAndSway(t, raiseLeftArm, rsway, -1);

    // hands facing up: 60*4*4=960ms
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS -= 22;
      },
      lsway,
      +1,
    ); // 22*4=88
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS -= 22;
      },
      lsway,
      -1,
    ); // 22*4=88 (176 degrees)
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS += 22;
      },
      rsway,
      +1,
    );
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS += 22;
      },
      rsway,
      -1,
    );

    // bend the arms (put hands on the chest): 60*4*4=960ms
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS += 22;
        RELBO -= 12;
      },
      lsway,
      +1,
    ); // undo the rotation above
    t = applyMoveAndSway(
      t,
      function () {
        RATWIS += 22;
        RELBO -= 12;
      },
      lsway,
      -1,
    ); // and bend the arms
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS -= 22;
        LELBO += 12;
      },
      rsway,
      +1,
    ); // at the same time
    t = applyMoveAndSway(
      t,
      function () {
        LATWIS -= 22;
        LELBO += 12;
      },
      rsway,
      -1,
    ); // hands facing down again

    // hands on the head: 60*4*4=960ms
    t = applyMoveAndSway(t, rightHandOnHead, lsway, +1);
    t = applyMoveAndSway(t, rightHandOnHead, lsway, -1);
    t = applyMoveAndSway(t, leftHandOnHead, rsway, +1);
    t = applyMoveAndSway(t, leftHandOnHead, rsway, -1);

    // go back to initial position: 60*4*4=960ms
    t = applyMoveAndSway(t, rightGoBack, lsway, +1);
    t = applyMoveAndSway(t, rightGoBack, lsway, -1);
    t = applyMoveAndSway(t, leftGoBack, rsway, +1);
    t = applyMoveAndSway(t, leftGoBack, rsway, -1);
    // total = 4800ms

    // start jumping: 10*8=80ms
    t = applyMove(t, bendForJump, delay2);
    // raise the body while stretching the legs,
    // opening the arms and raising the torso: 10*8=80ms
    t = applyMove(t, stretchForJump, delay2);
    // jump, turning: 10*8=80ms
    t = applyMove(t, jumpAndTurn, delay2);
    // increment number of jumps: 1ms
    t = incrementJumps(t);
    // land, folding the foots while spinning: 10*8=80ms
    t = applyMove(t, landFromJump, delay2);
    // dampen: 10*8=80ms
    t = applyMove(t, dampenJump, delay2);
    // raise the whole body, then go back to inital position: 10*8=80ms
    t = applyMove(t, finishJump, delay2);
    // total = 4800+80*6+1 = 5281ms
    // grand total = 5281 * 4 cycles = 21124ms or 21s
    // pre-movement + grand total = 21124 + 7500 = 28624ms
  }

  if (!loop) {
    stopSongAfterDance(t); // stop song if Blobby is dancing only one round
  }

  // schedule an endless loop of macarenas
  if (loop) {
    callBackArray.push(setTimeout(macarena, t, loop, firstTime));
  }

  document.getElementById("timeBoxDiv").innerHTML = `${t} ms/cycle`;

  return t;
}

/**
 * <p>Loads the {@link mainEntrance application}.</p>
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
addEventListener("load", (event) => {
  mainEntrance();
});
