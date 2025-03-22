/**
 * @file
 *
 * Summary.
 * <p>Renders a Christmas scene - Merry (Early) Christmas.</p>
 *
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @author {@link https://www.artstation.com/flavulous Flavia Cavalcanti}
 * @copyright © 2022-2024 Paulo R Cavalcanti.
 * @since 10/02/2024
 *
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 *
 * @see <a href="/cwdc/13-webgl/homework/Christmas_tree_with_three.js_new_files/script.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/Christmas_tree_with_three.js_new.html">link</a>
 * @see <a href="/cwdc/13-webgl/homework/img">images</a>
 * @see <a href="/cwdc/13-webgl/homework/textures/cube">cube textures</a>
 * @see <a href="../../img/tree.png"><img src="../../img/tree.png" width="512"></a>
 * @see <a href="../../img/tree.shadow.png"><img src="../../img/tree.shadow.png" width="512"></a>
 */

"use strict";

import * as THREE from "three";
import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

/**
 * Three.js module.
 * @external three
 * @author Ricardo Cabello ({@link https://coopermrdoob.weebly.com/ Mr.doob})
 * @since 24/04/2010
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 * @see {@link https://github.com/mrdoob/three.js github}
 * @see {@link http://cindyhwang.github.io/interactive-design/Mrdoob/index.html An interview with Mr.doob}
 * @see {@link https://experiments.withgoogle.com/search?q=Mr.doob Experiments with Google}
 */

/**
 * <p>Main three.js namespace.</p>
 * Imported from {@link THREE three.module.js}
 *
 * @example
 * <!-- The recommended way of importing three.js is by using an importmap in the HTML file -->
 * <script type="importmap">
 *    {
 *      "imports": {
 *          "three": "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js",
 *          "three/addons/": "https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/"
 *      }
 *    }
 * </script>
 *
 * @example
 * // Then, in the javascript file:
 * import * as THREE from "three";
 * import { OrbitControls } from "three/addons/controls/OrbitControls.js";
 *
 * @example
 * // Or, if you do not want an importmap:
 * import * as THREE from "https://unpkg.com/three@latest/build/three.module.js?module";
 * import { OrbitControls } from "https://unpkg.com/three@latest/examples/jsm/controls/OrbitControls.js?module";
 *
 * @namespace THREE
 */

/**
 * <p>loader for loading a .obj resource.</p>
 * The OBJ file format is a simple data-format that represents 3D geometry in a human readable format
 * as the position of each vertex, the UV position of each texture coordinate vertex, vertex normals,
 * and the faces that make each polygon defined as a list of vertices, and texture vertices.
 *
 * @class OBJLoader
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#examples/en/loaders/OBJLoader OBJLoader}
 */

/**
 * This is the base class for most objects in three.js and
 * provides a set of properties and methods for manipulating objects in 3D space.
 *
 * @class Object3D
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/core/Object3D Object3D}
 */

/**
 * <p>This is almost identical to an Object3D.</p>
 * Its purpose is to make working with groups of objects syntactically clearer.
 *
 * @class Group
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/objects/Group Group}
 */

/**
 * Scenes allow you to set up what and where is to be rendered by three.js.
 * This is where you place objects, lights and cameras.
 *
 * @class Scene
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/scenes/Scene Scene}
 */

/**
 * <p>Camera that uses perspective projection.</p>
 *
 * This projection mode is designed to mimic the way the human eye sees.
 * It is the most common projection mode used for rendering a 3D scene.
 *
 * @class PerspectiveCamera
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera PerspectiveCamera}
 */

/**
 * <p>Class representing a color.</p>
 *
 * Iterating through a Color instance will yield its components (r, g, b)
 * in the corresponding order.
 *
 * @class Color
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/math/Color Color}
 */

/**
 * Abstract base class for materials.
 *
 * Materials describe the appearance of objects.
 * They are defined in a (mostly) renderer-independent way,
 * so you don't have to rewrite materials if you decide to use a different renderer.
 *
 * @class Material
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/materials/Material Material}
 * @see {@link https://threejs.org/docs/#api/en/materials/MeshBasicMaterial MeshBasicMaterial}
 * @see {@link https://threejs.org/docs/#api/en/materials/MeshLambertMaterial MeshLambertMaterial}
 * @see {@link https://threejs.org/docs/#api/en/materials/MeshPhongMaterial MeshPhongMaterial}
 * @see {@link https://threejs.org/docs/#api/en/materials/MeshStandardMaterial MeshStandardMaterial}
 * @see {@link https://threejs.org/docs/#api/en/materials/PointsMaterial PointsMaterial}
 */

/**
 * The WebGL renderer displays your beautifully crafted scenes using WebGL.
 *
 * @class WebGLRenderer
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer WebGLRenderer}
 */

/**
 * Three.js group.
 * @type {THREE.Group}
 */
let group;

/**
 * Three.js group.
 * @type {THREE.Group}
 */
let teaPotGroup;

/**
 * Three.js scene.
 * @type {THREE.Scene}
 */
let scene;

/**
 * Three.js camera.
 * @type {THREE.PerspectiveCamera}
 */
let camera;

/**
 * Three.js renderer.
 * @type {THREE.WebGLRenderer}
 */
let renderer;

/**
 * A container holding the greeting and the canvas.
 * @type {HTMLDivElement}
 */
let container;

/**
 * Rotation about the "Y" axis, applied by the renderer to the scene,
 * based on mouse displacement.
 * @type {Number}
 */
let targetRotation = 0;

/**
 * Target rotation when the mouse is clicked.
 * @type {Number}
 */
let targetRotationOnMouseDown = 0;

/**
 * An event (clientX - {@link windowHalfX}).
 * @type {Number}
 */
let mouseX = 0;

/**
 * An event (clientX - {@link windowHalfX}) when a movement starts.
 * @type {Number}
 */
let mouseXOnMouseDown = 0;

/**
 * Half of the window {@link https://developer.mozilla.org/en-US/docs/Web/API/window/innerWidth innerWidth} property.
 * @type {Number}
 */
let windowHalfX = window.innerWidth / 2;

/**
 * Half of the window {@link https://developer.mozilla.org/en-US/docs/Web/API/window/innerHeight innerHeight} property.
 * @type {Number}
 */
let windowHalfY = window.innerHeight / 2;

/**
 * Will pause the camera rotation.
 * @type {Boolean}
 */
let paused = false;

/**
 * Camera will move around the tree in and out.
 * @type {Boolean}
 */
let inAndOutCamera = true;

/**
 * Display help.
 * @type {Boolean}
 */
let help = false;

/**
 * Image directory.
 * @type {String}
 */
const path = "img/";

/**
 * Light helpers switch.
 * @type {Boolean}
 */
let showHelpers = false;

/**
 * Color table.
 * @type {Object<String,THREE.Color>}
 */
const colorTable = {
  white: new THREE.Color(0xffffff),
  red: new THREE.Color(0xff0000),
  green: new THREE.Color(0x008800),
  blue: new THREE.Color(0x0000ff),
  lightBlue: new THREE.Color(0x00ccff),
  veryLightBlue: new THREE.Color(0xd2ddef),
  black: new THREE.Color(0x222222),
  black2: new THREE.Color(0x111111),
  blackSRGB: new THREE.Color(0x333333),
  orange: new THREE.Color(0xffcc00),
  yellow: new THREE.Color(0xffff00),
  brown: new THREE.Color(0x995500),
  lightBrown: new THREE.Color(0xcc6600),
  darkBrown: new THREE.Color(0x584000),
  white2: new THREE.Color(0xfffff6),
  amber: new THREE.Color(0xffae00),
  purple: new THREE.Color(0x590fa3),
};

/**
 * Light helpers.
 * @property {Object} lightHelpers - container for helpers.
 * @property {THREE.DirectionalLightHelper} lightHelpers.dhelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/DirectionalLightHelper directional light} helper.
 * @property {THREE.SpotLightHelper} lightHelpers.shelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/SpotLightHelper spot light} helper.
 * @property {THREE.PointlLightHelper} lightHelpers.phelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/PointLightHelper point light} helper.
 * @property {THREE.CameraHelper} lightHelpers.chelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/CameraHelper camera} helper.
 */
const lightHelpers = {
  dhelper: null,
  shelper: null,
  phelper: null,
  chelper: null,
};

/**
 * Not the best for a skybox, but the effect is quite psychadelic.
 * @type {Object<Symbol, Array<String>>}
 */
const imageNames = {
  img1: [
    "wrappingPaper.jpg",
    "wrappingPaper.jpg",
    "wrappingPaper.jpg",
    "wrappingPaper.jpg",
    "wrappingPaper.jpg",
    "wrappingPaper.jpg",
  ],
  img2: [
    "wrappingPaper2.jpg",
    "wrappingPaper2.jpg",
    "wrappingPaper2.jpg",
    "wrappingPaper2.jpg",
    "wrappingPaper2.jpg",
    "wrappingPaper2.jpg",
  ],
  img3: ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
};

/**
 * <p>Resizes the scene according to the screen size.</p>
 *
 * {@link http://benchung.com/smooth-mouse-rotation-three-js/ Many thanks}.
 */
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
}

/**
 * The mousedown event is fired at an Element when a pointing device button
 * is pressed while the pointer is inside the element.
 *
 * <p>Add listeners for "mousemove", "mouseup", and "mouseout".
 * @param {MouseEvent} event mouse event.
 * @event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event Element: mousedown event}
 */
function onDocumentMouseDown(event) {
  event.preventDefault();

  renderer.domElement.addEventListener("mousemove", onDocumentMouseMove, false);
  renderer.domElement.addEventListener("mouseup", onDocumentMouseUp, false);
  renderer.domElement.addEventListener("mouseout", onDocumentMouseOut, false);

  mouseXOnMouseDown = event.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;
}

/**
 * The mousemove event is fired at an element when a pointing device
 * (usually a mouse) is moved while the cursor's hotspot is inside it.
 * @param {MouseEvent} event mouse event.
 * @event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event Element: mousemove event}
 */
function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  targetRotation =
    targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
}

/**
 * The mouseup event is fired at an Element when a button on a pointing device
 * (such as a mouse or trackpad) is released while the pointer is located inside it.
 *
 * <p>Remove listeners for "mousemove", "mouseup", and "mouseout".
 * @param {MouseEvent} event mouse event.
 * @event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event Element: mouseup event}
 */
function onDocumentMouseUp(event) {
  renderer.domElement.removeEventListener(
    "mousemove",
    onDocumentMouseMove,
    false,
  );
  renderer.domElement.removeEventListener("mouseup", onDocumentMouseUp, false);
  renderer.domElement.removeEventListener(
    "mouseout",
    onDocumentMouseOut,
    false,
  );
}

/**
 * The mouseout event is fired at an Element when a
 * pointing device (usually a mouse) is used to move the cursor
 * so that it is no longer contained within the element or one of its children.
 *
 * <p>Removes the listeners for "mousemove", "mouseup", and "mouseout".
 * @param {MouseEvent} event mouse event.
 * @event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseout_event Element: mouseout event}
 */
function onDocumentMouseOut(event) {
  renderer.domElement.removeEventListener(
    "mousemove",
    onDocumentMouseMove,
    false,
  );
  renderer.domElement.removeEventListener("mouseup", onDocumentMouseUp, false);
  renderer.domElement.removeEventListener(
    "mouseout",
    onDocumentMouseOut,
    false,
  );
}

/**
 * The touchstart event is fired when one or more touch points
 * are placed on the touch surface.
 * @param {TouchEvent} event touch event.
 * @event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/touchstart_event Element: touchstart event}
 */
function onDocumentTouchStart(event) {
  if (event.touches.length == 1) {
    event.preventDefault();

    mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
  }
}

/**
 * The touchmove event is fired when one or more touch points
 * are moved along the touch surface.
 * @param {TouchEvent} event touch event.
 * @event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/touchmove_event Element: touchmove event}
 */
function onDocumentTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    targetRotation =
      targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
  }
}

/**
 * Set the {@link camera} and add it to the given scene.
 *
 * @param {THREE.Scene} scene given scene.
 */
function makeCamera(scene) {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  );
  camera.position.set(0, 100, 500);
  scene.add(camera);
}

/**
 * Translate keydown events to strings.
 *
 * @param {KeyboardEvent} event keyboard event.
 * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * The camera control.
 * @param {THREE.Camera} c the given camera.
 * @param {String} ch a given character.
 */
function cameraControl(c, ch) {
  const distance = c.position.length();
  let q, q2;

  switch (ch) {
    // camera controls
    case "w":
      c.translateZ(-3);
      return true;
    case "a":
      c.translateX(-3);
      return true;
    case "s":
      c.translateZ(3);
      return true;
    case "d":
      c.translateX(3);
      return true;
    case "ArrowUp":
      c.translateY(3);
      return true;
    case "ArrowDown":
      c.translateY(-3);
      return true;
    case "j":
      // need to do extrinsic rotation about world y axis, so multiply camera's quaternion
      // on left
      q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (5 * Math.PI) / 180,
      );
      q2 = new THREE.Quaternion().copy(c.quaternion);
      c.quaternion.copy(q).multiply(q2);
      return true;
    case "l":
      q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (-5 * Math.PI) / 180,
      );
      q2 = new THREE.Quaternion().copy(c.quaternion);
      c.quaternion.copy(q).multiply(q2);
      return true;
    case "i":
      // intrinsic rotation about camera's x-axis
      c.rotateX((5 * Math.PI) / 180);
      return true;
    case "k":
      c.rotateX((-5 * Math.PI) / 180);
      return true;
    case "O":
      c.lookAt(new THREE.Vector3(0, 0, 0));
      return true;
    case "-":
      c.fov = Math.min(80, c.fov + 5);
      c.updateProjectionMatrix();
      return true;
    case "+":
      c.fov = Math.max(5, c.fov - 5);
      c.updateProjectionMatrix();
      return true;

    // alternates for arrow keys
    case "J":
      //this.orbitLeft(5, distance)
      c.translateZ(-distance);
      q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (5 * Math.PI) / 180,
      );
      q2 = new THREE.Quaternion().copy(c.quaternion);
      c.quaternion.copy(q).multiply(q2);
      c.translateZ(distance);
      return true;
    case "L":
      //this.orbitRight(5, distance)
      c.translateZ(-distance);
      q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (-5 * Math.PI) / 180,
      );
      q2 = new THREE.Quaternion().copy(c.quaternion);
      c.quaternion.copy(q).multiply(q2);
      c.translateZ(distance);
      return true;
    case "I":
      //this.orbitUp(5, distance)
      c.translateZ(-distance);
      c.rotateX((-5 * Math.PI) / 180);
      c.translateZ(distance);
      return true;
    case "K":
      //this.orbitDown(5, distance)
      c.translateZ(-distance);
      c.rotateX((5 * Math.PI) / 180);
      c.translateZ(distance);
      return true;
  }
  return false;
}

/**
 * Handler for key press events.
 * @param {KeyboardEvent} event keydown event.
 */
function handleKeyPress(event) {
  const ch = getChar(event);
  cameraControl(camera, ch);
  switch (ch) {
    case " ":
      paused = !paused;
      break;

    case "n":
      inAndOutCamera = !inAndOutCamera;
      break;

    case "h":
      help = !help;
      if (help) {
        document.getElementById("info").innerHTML = `DRAG TO SPIN <br><br>
        <b>Keyboard controls</b>:<br>
        <b>h - to hide</b><br>
        <b>l</b> - toggle light helpers<br>
        <b>w, s, a, d</b> - move forward, backward, left, right <br>
        <b>↑, ↓</b> - move up, down <br>
        <b>I, K, J, L</b> - orbit down, up, right, left <br>
        <b>+</b> - decrease fov <br>
        <b>-</b> - increase fov <br>
        <b>Space</b> - pause animation <br>
        <b>n</b> - camera will rotate around the tree,<br>
        while moving closer/farther away, or not.`;
      } else
        document.getElementById("info").innerHTML = `DRAG TO SPIN<br>
        Have your volume ON for the full experience <br>
        Press <b>h</b> for more information.`;
      break;
    case "l":
      displayHelpers();
      break;
    default:
      return;
  }
}

/**
 * Prepare materials and creates the {@link makeTree tree}.
 * @param {THREE.Group} group - the given group.
 */
function prepareMaterials(group) {
  // prettier-ignore
  const imgs = [  // materials []
    "pine.jpg",   // 0, 1, [2], 3
    "wood.jpg",   // [4]
    "red.jpg",    // [5]
    "blue.jpg",   // [6]
    "green.jpg",  // [7]
    "yellow.jpg", // [8]
    "moon.jpg",   // 9
  ];

  const shininess = 50;
  const specular = colorTable.blackSRGB;
  const bumpScale = 1;
  const shading = false;
  const mats = {};
  const tLoader = new THREE.TextureLoader();

  imgs.forEach((img, index) => {
    const texture = tLoader.load(path + img);
    texture.repeat.set(1, 1);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;

    const key = img.split(".")[0];

    if (index == 0) {
      mats[`${key}0`] = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: bumpScale,
        color: colorTable.red,
        flatShading: shading,
        specular: specular,
        shininess: shininess,
      });
      mats[`${key}1`] = new THREE.MeshPhongMaterial({
        map: texture,
        color: colorTable.green,
        flatShading: shading,
        specular: specular,
        shininess: shininess,
      });
      mats[`${key}3`] = new THREE.MeshPhongMaterial({
        map: texture,
        color: colorTable.red,
        flatShading: shading,
      });
    }

    // this is what is really used
    mats[key] = new THREE.MeshPhongMaterial({
      map: texture,
      color: colorTable.darkBrown,
      flatShading: shading,
    });
  });

  makeTree(group, mats);
}

/**
 * <p>I developed a certain dislike for skyboxes or at least for the clunky ones.
 * As such, the PRESENTS are going to be skyboxes.</p>
 *
 * Why not, am I right? No specification were given saying that the
 * skyboxes had to be used as the 'environment'.
 * @param {THREE.Group} group - the given group to add the presents to.
 * @param {Number} size - the size of the box -- will correspond to width, length, and height.
 * @param {Number} x - position x
 * @param {Number} y - position y
 * @param {Number} z - position z
 * @param {Array<String>} images - image array to use.
 * @param {String} imgpath - path to the image array.
 * @see {@link https://threejs.org/examples/?q=cube#webgpu_cubemap_adjustments Env. Adjustments example}
 * @see {@link https://threejs.org/docs/#api/en/materials/MeshStandardMaterial MeshStandardMaterial}
 */
function addPresent(group, size, x, y, z, images, imgpath = path) {
  // load the six images
  const textureMap = new THREE.CubeTextureLoader()
    .setPath(imgpath)
    .load(images);

  textureMap.colorSpace = THREE.SRGBColorSpace;
  textureMap.generateMipmaps = true;
  textureMap.minFilter = THREE.LinearMipmapLinearFilter;
  textureMap.magFilter = THREE.LinearFilter;

  const boxMaterial = new THREE.MeshLambertMaterial({
    envMap: textureMap,
    color: colorTable.white,
    side: THREE.FrontSide,
    reflectivity: 1,
    combine: THREE.MixOperation,
  });

  let cube;
  if (imgpath != path) {
    //scene.environment = textureMap;
    //scene.background = textureMap;
    const sphereMaterial = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 1,
      envMap: textureMap,
    });
    cube = new THREE.Mesh(
      new THREE.SphereGeometry(size, 32, 16),
      sphereMaterial,
    );
  } else {
    // Create a mesh for the object, using the cube shader as the material
    cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), boxMaterial);
  }

  cube.position.set(x, y, z);
  cube.castShadow = true;
  cube.name = "Present";

  // add it to the scene
  group.add(cube);

  if (typeof addPresent.counter == "undefined") {
    addPresent.counter = 0;
  }

  lightHelpers[`p${++addPresent.counter}helper`] = new VertexNormalsHelper(
    cube,
    5,
    colorTable.white,
  );
  lightHelpers[`p${addPresent.counter}helper`].name = "Present";
}

/**
 * <p>Add ground to scene.</p>
 *
 * The average user doesn't have a calibrated monitor and has never heard of gamma correction;
 * therefore, many visual materials are precorrected for them.
 * For example, by convention, all JPEG files are precorrected for a gamma of 2.2.
 * That's not exact for any monitor, but it's in the ballpark, so the image will probably
 * look acceptable on most monitors. This means that JPEG images
 * (including scans and photos taken with a digital camera) are not linear,
 * so they should not be used as texture maps by shaders that assume linear input.
 *
 * @param {THREE.Group} group - the given group to add the ground to.
 * @see {@link https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-24-importance-being-linear The Importance of Being Linear}
 */
function addGround(group) {
  const groundColor = colorTable.veryLightBlue;
  const groundTexture2 = new THREE.DataTexture(groundColor, 1, 1);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: colorTable.white,
    specular: colorTable.black2,
    map: groundTexture2,
    side: THREE.DoubleSide,
  });

  const groundTexture = new THREE.TextureLoader().load(
    path + "ground.jpg",
    function () {
      groundMaterial.map = groundTexture;
    },
  );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  groundTexture.anisotropy = 16;
  groundTexture.colorSpace = THREE.SRGBColorSpace;

  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000),
    groundMaterial,
  );
  groundMesh.position.y = -150;
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  groundMesh.name = "Ground";
  group.add(groundMesh);
}

/**
 * <p>Christmas needs frigging snowflakes.</p>
 * Except Christmas in Brazil, then it is just palm trees...
 * Based on a tutorial found on {@link https://script-tutorials.com/tag/webgl/ huzzah}
 * @param {THREE.Group} group - the given group to add the snowflakes to.
 */
function addSnowflakes(group) {
  const sfGeometry = new THREE.BufferGeometry();
  const sfMats = [];
  const tLoader = new THREE.TextureLoader();
  const sfTexture = tLoader.load(path + "snowflake.png");
  const sfTexture2 = tLoader.load(path + "snowflake2.png");
  sfTexture.colorSpace = THREE.SRGBColorSpace;
  sfTexture2.colorSpace = THREE.SRGBColorSpace;

  const vertices = [];
  for (let i = 0; i < 3700; i++) {
    const vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2000 - 1000;
    vertex.y = Math.random() * 2000 - 1000;
    vertex.z = Math.random() * 2000 - 1000;
    vertices.push(vertex.x, vertex.y, vertex.z);
  }

  sfGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );

  const states = [
    { color: [1.0, 0.2, 0.9], sprite: sfTexture, size: 10 },
    { color: [0.9, 0.1, 0.5], sprite: sfTexture, size: 8 },
    { color: [0.8, 0.05, 0.5], sprite: sfTexture, size: 5 },
    { color: [1.0, 0.2, 0.9], sprite: sfTexture2, size: 10 },
    { color: [0.9, 0.1, 0.5], sprite: sfTexture2, size: 8 },
    { color: [0.8, 0.05, 0.5], sprite: sfTexture2, size: 5 },
  ];

  states.forEach((state) => {
    const i = sfMats.push(
      new THREE.PointsMaterial({
        size: state.size,
        map: state.sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      }),
    );

    sfMats[i - 1] = new THREE.PointsMaterial({
      size: state.size,
      map: state.sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    sfMats[i - 1].color.setHSL(...state.color);

    const particles = new THREE.Points(sfGeometry, sfMats[i - 1]);

    particles.rotation.x = Math.random() * 15;
    particles.rotation.y = Math.random() * 10;
    particles.rotation.z = Math.random() * 17;

    particles.name = "Particles";
    group.add(particles);
  });
}

/**
 * Make the Christmas tree, which is just a bunch of stacked cones (cylinders).
 * @param {THREE.Object3D} group - the given group to add the tree to.
 * @param {Object<String,THREE.Material>} materials - the given material object.
 * @see {@link https://threejs.org/docs/#api/en/geometries/CylinderGeometry CylinderGeometry}
 */
function makeTree(group, materials) {
  // radius top, radius bottom, height, radial segments, height segments.
  const tree = [
    { geometry: [1, 30, 50, 30, 1], y: 130, material: materials.pine },
    { geometry: [1, 40, 70, 30, 1], y: 110, material: materials.pine },
    { geometry: [1, 50, 80, 30, 1], y: 85, material: materials.pine },
    { geometry: [1, 60, 90, 30, 1], y: 65, material: materials.pine },
    { geometry: [1, 70, 80, 30, 1], y: 30, material: materials.pine },
    { geometry: [1, 80, 90, 30, 1], y: 5, material: materials.pine },
    { geometry: [1, 95, 95, 30, 1], y: -20, material: materials.pine },
    { geometry: [2, 20, 300, 30, 1], y: 0, material: materials.wood },
  ];

  if (typeof makeTree.counter == "undefined") {
    makeTree.counter = 0;
  }

  tree.forEach((elem) => {
    const t = new THREE.Mesh(
      new THREE.CylinderGeometry(...elem.geometry, false),
      elem.material,
    );
    t.castShadow = true;
    t.position.set(0, elem.y, 0);
    t.name = "Tree";
    group.add(t);
    lightHelpers[`t${++makeTree.counter}helper`] = new VertexNormalsHelper(
      t,
      5,
      colorTable.white,
    );
    lightHelpers[`t${makeTree.counter}helper`].name = "Tree";
  });

  addBaubles(group, materials);
}

/**
 * <p>Add 28 baubles.</p>
 * <p>Yeah, kind of hardcoded... no, I'm not proud.</p>
 * But this was the most straightforward way to add trinkets
 * to the tree that actually looked like they were on the tree.
 * @param {THREE.Group} group - the given group to add the baubles to.
 * @param {Object<String,THREE.Material>} materials - the given material object.
 */
function addBaubles(group, materials) {
  const bauble = [
    { geometry: [5, 15, 5], position: [15, 135, 5], color: materials.red },
    { geometry: [5, 15, 5], position: [0, 135, 13], color: materials.yellow },
    { geometry: [5, 15, 5], position: [0, 135, -13], color: materials.red },
    { geometry: [5, 15, 5], position: [-15, 135, -5], color: materials.yellow },

    { geometry: [6, 15, 5], position: [35, 90, 5], color: materials.blue },
    { geometry: [5, 15, 5], position: [0, 90, 33], color: materials.red },
    { geometry: [6, 15, 5], position: [-35, 90, -5], color: materials.blue },
    { geometry: [5, 15, 5], position: [0, 90, -33], color: materials.red },

    { geometry: [7, 15, 5], position: [35, 60, 25], color: materials.green },
    { geometry: [5, 15, 5], position: [-30, 60, 33], color: materials.yellow },
    { geometry: [7, 15, 5], position: [-35, 60, -25], color: materials.green },
    { geometry: [5, 15, 5], position: [30, 60, -33], color: materials.yellow },

    { geometry: [8, 15, 5], position: [48, 35, 25], color: materials.red },
    { geometry: [5, 15, 5], position: [-42, 35, 33], color: materials.blue },
    { geometry: [8, 15, 5], position: [-48, 35, -25], color: materials.red },
    { geometry: [5, 15, 5], position: [42, 35, -33], color: materials.blue },

    { geometry: [6, 15, 5], position: [-52, 7, 25], color: materials.yellow },
    { geometry: [5, 15, 5], position: [50, 7, 33], color: materials.green },
    { geometry: [6, 15, 5], position: [52, 7, -25], color: materials.yellow },
    { geometry: [5, 15, 5], position: [-50, 7, -33], color: materials.green },

    { geometry: [7, 15, 5], position: [65, -25, 25], color: materials.blue },
    { geometry: [5, 15, 5], position: [-30, -25, 63], color: materials.red },
    { geometry: [7, 15, 5], position: [-65, -25, -25], color: materials.blue },
    { geometry: [5, 15, 5], position: [30, -25, -63], color: materials.red },

    { geometry: [8, 15, 5], position: [80, -50, 25], color: materials.red },
    { geometry: [6, 15, 5], position: [-40, -50, 73], color: materials.yellow },
    { geometry: [8, 15, 5], position: [-80, -50, -25], color: materials.red },
    { geometry: [6, 15, 5], position: [40, -50, -73], color: materials.yellow },
  ];

  bauble.forEach((e, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(...e.geometry), e.color);
    b.position.set(...e.position);
    b.name = `bauble${i}`;
    group.add(b);
  });
}

/**
 * <p>Loads an object to the scene.</p>
 * Used to add the teapot and the bunnies.
 * Frigging bunnies all around, everyone loves bunnies.
 * Teapot is our new Christmas tree star.
 *
 * @param {THREE.Group} group - the given group to add the object to.
 * @param {String} objectFile - the object file to be read.
 * @param {Number} x - position x
 * @param {Number} y - position y
 * @param {Number} z - position z
 * @param {Number} size - the object's size.
 * @param {Number} rotate - rotation amount.
 * @param {THREE.Color} color - the objects's color.
 */
function addObject(group, objectFile, x, y, z, size, rotate, color) {
  if (typeof addObject.counter == "undefined") {
    addObject.counter = 0;
  }

  /**
   * ObjectLoader object.
   * @var {THREE.OBJLoader}
   * @global
   */
  const oLoader = new OBJLoader();

  oLoader.load(objectFile, function (object) {
    const material2 = new THREE.MeshLambertMaterial({ color: color });

    object.position.set(x, y, z);
    object.scale.set(size, size, size);
    object.rotateY(rotate);

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        // apply custom material
        child.material = material2;

        // enable casting shadows
        child.castShadow = true;
        child.receiveShadow = true;

        const obj = `o${++addObject.counter}helper`;
        lightHelpers[obj] = new VertexNormalsHelper(child, 5, colorTable.white);
        lightHelpers[obj].update();
        lightHelpers[obj].name = objectFile;
        lightHelpers[obj].visible = false;
        group.add(lightHelpers[obj]);
      }
    });

    object.name = objectFile;
    group.add(object);
  });
}

/**
 * Add or remove light or normal {@link showHelpers helpers}.
 */
function displayHelpers() {
  showHelpers = !showHelpers;
  // because of strict mode, "this" is undefined
  const action = showHelpers ? group.add.bind(group) : group.remove.bind(group);
  const action2 = showHelpers
    ? scene.add.bind(scene)
    : scene.remove.bind(scene);

  Object.keys(lightHelpers).forEach((key) => {
    if (["teapot.obj", "bunny.obj"].includes(lightHelpers[key].name)) {
      // not working - only teapot untransformed??!!
      //lightHelpers[key].visible = showHelpers;
    } else if (
      ["PointLight", "SpotLight", "DirectionalLight", "CameraHelper"].includes(
        lightHelpers[key].name,
      )
    ) {
      action2(lightHelpers[key]);
    } else {
      action(lightHelpers[key]);
    }
  });

  return false;
}

/**
 * <p>Lights galore - includes {@link https://threejs.org/docs/#api/en/lights/PointLight point lights},
 * {@link https://threejs.org/docs/#api/en/lights/SpotLight spot lights},
 * and a {@link https://threejs.org/docs/#api/en/lights/DirectionalLight directional light}
 * because why not?</p>
 *
 * <p>We also created a
 * {@link https://threejs.org/docs/#api/en/helpers/CameraHelper camera helper}
 * for the spot light.</p>
 *
 * <p>Lighting and color has changed a lot since version
 * {@link https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733/23 155}.</p>
 *
 * It’s important to understand that using the new lighting mode is just one prerequisite for physically correct lighting.<br>
 * You also have to:
 * <ul>
 *  <li> apply a real-world scale to your scene (meaning 1 world unit = 1 meter).</li>
 *  <li>not change the default decay values of 2 for all spot and point lights in your scene.</li>
 * </ul>
 * <p>Only then you can actually consider SI units for point, spot and area lights.
 * Ambient and hemisphere lights (which are special kind of lights and
 * essentially simplified models of light probes), as well as directional lights, do not use SI units.</p>
 *
 * <img src="../../img/unit-of-light.jpg" width="256">
 *
 * <p>These updates enable a
 * {@link https://www.willgibbons.com/linear-workflow/ “linear workflow”}
 * by default, for better
 * {@link https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-24-importance-being-linear image quality}.</p>
 *
 * <p>To set “renderer.useLegacyLights = false;” in {@link init},
 * I had to increase the light intensities, <br>
 * and set decay to zero (my lights are too far away from the scene borders):</p>
 * <ul>
 *  <li>ambient light 0.2 → 2
 *  <li>point light 2 → 4</li>
 *  <li>spot light 1 → 2</li>
 *  <li>ambient light 2 → Math.PI * 2</li>
 *  <li>pointLight.decay = 0;</li>
 *  <li>spotLight.decay = 0;</li>
 * </ul>
 *
 * @param {THREE.Scene} scene - the given scene.
 * @see {@link https://discourse.threejs.org/t/shadow-and-color-problems-going-from-v64-to-v161/61640/3 Shadow and color problems going from v64 to v161}
 */
function addLight(scene) {
  scene.add(new THREE.AmbientLight(colorTable.black, 2));

  const pointLight = new THREE.PointLight(colorTable.lightBlue, 4, 1000);
  pointLight.position.set(200, 100, 0);
  pointLight.castShadow = false;
  pointLight.decay = 0;
  scene.add(pointLight);

  lightHelpers.phelper = new THREE.PointLightHelper(pointLight, 10);
  lightHelpers.phelper.name = "PointLight";

  const spotLight = new THREE.SpotLight(colorTable.white, 2);
  spotLight.position.set(200, 200, 200);
  spotLight.angle = Math.PI / 6;
  spotLight.decay = 0;
  spotLight.distance = 0;
  spotLight.penumbra = 0.2;

  spotLight.castShadow = true;

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 5000;
  spotLight.shadow.camera.fov = 60;
  spotLight.shadow.focus = 1;

  scene.add(spotLight);

  lightHelpers.chelper = new THREE.CameraHelper(spotLight.shadow.camera);
  lightHelpers.chelper.name = "CameraHelper";
  lightHelpers.shelper = new THREE.SpotLightHelper(spotLight);
  lightHelpers.shelper.name = "SpotLight";

  // colored directional light at double intensity shining from the top.
  const directionalLight = new THREE.DirectionalLight(
    colorTable.white,
    Math.PI * 2,
  );
  directionalLight.position.set(400, 1, 200);
  directionalLight.castShadow = false;
  scene.add(directionalLight);

  lightHelpers.dhelper = new THREE.DirectionalLightHelper(directionalLight, 15);
  lightHelpers.dhelper.name = "DirectionalLight";
}

/**
 * Display a greeting and information at the top of the page.
 */
function makeGreeting() {
  // prepare the container
  container = document.createElement("div");
  document.body.appendChild(container);
  // display Info
  const greeting = document.createElement("div");
  greeting.setAttribute("id", "greeting");
  greeting.innerHTML = "<b>MERRY CHRISTMAS!</b><br>";
  const info = document.createElement("div");
  info.setAttribute("id", "info");
  greeting.setAttribute("id", "greeting");
  greeting.style.position = "absolute";
  greeting.style.top = "30px";
  greeting.style.width = "100%";
  greeting.style.textAlign = "center";
  greeting.style.color = "white";
  info.innerHTML = `<details>
  <summary>DRAG TO SPIN</summary>
  Have your volume ON for the full experience<br>
  Press <em>h</em> for more information<br>
  For light helpers
  <a href='javascript:void(0)' onclick='javascript:displayHelpers();'>click me</a>
  </details>`;

  greeting.appendChild(info);
  container.appendChild(greeting);
}

/**
 * Initialize our scene's components.
 *
 * <p>Add listeners for {@link event:onDocumentMouseDown "mousedown"},
 * {@link event:onDocumentTouchStart "touchstart"}, and
 * {@link event:onDocumentTouchMove "touchmove"}.</p>
 *
 * The listeners are added to the canvas element
 * ({@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.domElement renderer.domElement}),
 * so to prevent
 * {@link https://usefulangle.com/post/278/html-disable-pull-to-refresh-with-css "the pull to refresh"}
 * on a swipe-down.
 */
function init() {
  makeGreeting();

  THREE.ColorManagement.enabled = true;

  // initialize the scene
  scene = new THREE.Scene();

  // add fog to scene
  scene.fog = new THREE.Fog(colorTable.purple, 500, 10000);

  makeCamera(scene);

  // create the empty scene groups
  group = new THREE.Group();
  group.name = "MainGroup";
  teaPotGroup = new THREE.Group();
  teaPotGroup.name = "TeaPot";

  scene.add(group);
  group.add(teaPotGroup);

  prepareMaterials(group);

  // add 4 skyboxes
  addPresent(group, 40, 20, -115, -130, imageNames.img3, "textures/cube/pisa/");
  addPresent(group, 50, 20, -125, 60, imageNames.img2);
  addPresent(group, 30, -20, -135, -60, imageNames.img1);
  addPresent(group, 20, -20, -140, 100, imageNames.img1);

  // add our star teapot
  addObject(teaPotGroup, "teapot.obj", 0, 155, 0, 0.3, 0, colorTable.yellow);

  // bunnies for days
  addObject(group, "bunny.obj", 80, -130, 0, 20, 0, colorTable.brown);
  addObject(group, "bunny.obj", -50, -140, 0, 10, -90, colorTable.lightBrown);
  addObject(group, "bunny.obj", 100, -135, 60, 15, 40, colorTable.white);
  addObject(group, "bunny.obj", 20, -143, -60, 8, -180, colorTable.amber);

  addGround(group);

  addSnowflakes(group);

  addLight(scene);

  // prepare the render object and render the scene
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(scene.fog.color);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // add events handlers -- thanks script tutorials
  renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
  renderer.domElement.addEventListener(
    "touchstart",
    onDocumentTouchStart,
    false,
  );
  renderer.domElement.addEventListener("touchmove", onDocumentTouchMove, false);

  /**
   * <p>Key handler.</p>
   * <p>Fired when a key is pressed.</p>
   * Calls {@link handleKeyPress} when pressing assigned keys:
   * <ul>
   *  <li>Space - pause</li>
   *  <li>h - help</li>
   *  <li>l - light helpers</li>
   *  <li>w, s, a, d - forward, backward, left, right</li>
   *  <li>I, K, J, L - orbit down, up, left, right</li>
   *  <li>+, - - field of view (zoom)</li>
   *  <li>↑, ↓- up, down</li>
   *  <li>n - move camera close/farther away wile rotating, or not</li>
   * </ul>
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  document.addEventListener("keydown", handleKeyPress, false);

  /**
   * <p>Appends an event listener for events whose type attribute value is resize.</p>
   * Fires when the document view (window) has been resized.
   * <p>The {@link onWindowResize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @param {Event} event the document view is resized.
   * @param {callback} function function to run when the event occurs.
   * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
   * @event resize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  window.addEventListener("resize", onWindowResize, false);

  window.displayHelpers = displayHelpers;

  /**
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop renderer.setAnimationLoop}
   * parameter is a {@link render callback,} which
   * will be called every available frame.<br>
   * If null is passed it will stop any already ongoing animation.
   * @param {function} loop callback.
   * @function
   * @name setAnimationLoop
   * @global
   */
  renderer.setAnimationLoop(() => {
    render();
  });
}

/**
 * A closure to render the application.
 * @return {animate} animation callback.
 * @function
 * @global
 * @see {@link https://threejs.org/docs/#api/en/core/Object3D.rotation Object3D.rotation}
 */
const render = (() => {
  let ang = 0;
  const increment = THREE.MathUtils.degToRad(0.5);
  const rotSpeed = 0.004;

  /**
   * Rotates the camera around the tree and
   * calls the {@link renderer renderer.render} method.
   * @callback animate
   */
  return () => {
    // mouse click and drag
    group.rotation.y += (targetRotation - group.rotation.y) * 0.01;

    // spinning teapot -- it is a nice star
    teaPotGroup.rotation.y += 0.03;

    if (!paused && inAndOutCamera) {
      ang += increment;
      ang %= 2 * Math.PI;
      camera.position.x = Math.cos(ang) * 1000; // [-1000,1000]
      camera.position.z = Math.sin(ang) * 500; // [-500,500]
    }

    if (!paused && !inAndOutCamera) {
      // rotate camera around tree
      camera.rotation.y = rotSpeed;
    }

    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };
})();

/**
 * <p>Load the applicarion.</p>
 * Fired when the whole page has loaded, including all dependent resources
 * such as stylesheets, scripts, iframes, and images, except those that are loaded lazily.
 * {@link init Initialize} and start {@link animate animation}.
 * @param {Event} event a generic Event.
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => {
  init();
});
