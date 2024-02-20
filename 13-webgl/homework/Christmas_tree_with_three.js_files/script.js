/**
 * @file
 *
 * Summary.
 * <p>Renders a Christmas scene - Merry (Early) Christmas.</p>
 *
 * @author Flavia Cavalcanti
 * @since 24/11/2015
 *
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 *
 * @see <a href="/cwdc/13-webgl/homework/Christmas_tree_with_three.js_files/script.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/Christmas_tree_with_three.js.html">link</a>
 * @see <a href="../../img/tree.shadow64.png"><img src="../../img/tree.shadow64.png" width="512"></a>
 * @see <a href="../../img/tree.shadow64.helper.png"><img src="../../img/tree.shadow64.helper.png" width="512"></a>
 */

"use strict";

/**
 * Three.js module.
 * @external THREE
 * @see https://threejs.org/docs/#manual/en/introduction/Installation
 */

/**
 * This is the base class for most objects in three.js and
 * provides a set of properties and methods for manipulating objects in 3D space.
 *
 * @class Object3D
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/core/Object3D
 */

/**
 * Scenes allow you to set up what and where is to be rendered by three.js.
 * This is where you place objects, lights and cameras.
 *
 * @class Scene
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/scenes/Scene
 */

/**
 * Abstract base class for cameras.
 * This class should always be inherited when you build a new camera.
 *
 * @class Camera
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/cameras/Camera
 */

/**
 * Abstract base class for materials.
 *
 * Materials describe the appearance of objects.
 * They are defined in a (mostly) renderer-independent way,
 * so you don't have to rewrite materials if you decide to use a different renderer.
 *
 * @class Material
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/materials/Material
 */

/**
 * The WebGL renderer displays your beautifully crafted scenes using WebGL.
 *
 * @class WebGLRenderer
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
 */

/**
 * Three.js group.
 * @type {external:THREE.Object3D}
 */
let group;

/**
 * Three.js group.
 * @type {external:THREE.Object3D}
 */
let teaPotGroup;

/**
 * Three.js scene.
 * @type {external:THREE.Scene}
 */
let scene;

/**
 * Three.js camera.
 * @type {external:THREE.Camera}
 */
let camera;

/**
 * Three.js renderer.
 * @type {external:THREE.WebGLRenderer}
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
 * An event (clientX - windowHalfX).
 * @type {Number}
 */
let mouseX = 0;

/**
 * An event (clientX - windowHalfX) when a movement starts.
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
 * @type {Object<String,external:THREE.Color>}
 */
let colorTable = {
  white: new THREE.Color(0xffffff),
  red: new THREE.Color(0xff0000),
  green: new THREE.Color(0x008800),
  blue: new THREE.Color(0x000099),
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
 * @property {Object} lightHelpers - container for light helpers.
 * @property {external:THREE.DirectionalLightHelper} lightHelpers.dhelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/DirectionalLightHelper directional light} helper.
 * @property {external:THREE.SpotLightHelper} lightHelpers.shelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/SpotLightHelper spot light} helper.
 * @property {external:THREE.PointlLightHelper} lightHelpers.phelper -
 *    {@link https://threejs.org/docs/#api/en/helpers/PointLightHelper point light} helper.
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseout_event
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/touchstart_event
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/touchmove_event
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
 * @param {external:THREE.Scene} scene given scene.
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
 * @see http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  let charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * The camera control.
 * @param {external:THREE.Camera} c the given camera.
 * @param {String} ch a given character.
 */
function cameraControl(c, ch) {
  let distance = c.position.length();
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
      // need to do extrinsic rotation about world y axis,
      // so multiply camera's quaternion on the left
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
      // this.orbitRight(5, distance)
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
      // this.orbitUp(5, distance)
      c.translateZ(-distance);
      c.rotateX((-5 * Math.PI) / 180);
      c.translateZ(distance);
      return true;
    case "K":
      // this.orbitDown(5, distance)
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
  let ch = getChar(event);
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
        <b>w, s, a, d</b> - move forward, backward, left, right<br>
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
 * @param {external:THREE.Object3D} group the given group.
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
  const shading = THREE.SmoothShading;
  const mats = {};

  imgs.forEach((img, index) => {
    let texture = THREE.ImageUtils.loadTexture(path + img);
    texture.repeat.set(1, 1);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.needsUpdate = true;

    let key = img.split(".")[0];

    if (index == 0) {
      mats[`${key}0`] = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: bumpScale,
        color: colorTable.red,
        ambient: colorTable.white,
        specular: specular,
        shininess: shininess,
        shading: shading,
      });
      mats[`${key}1`] = new THREE.MeshPhongMaterial({
        map: texture,
        color: colorTable.green,
        ambient: colorTable.white,
        specular: specular,
        shininess: shininess,
        shading: shading,
      });
      mats[`${key}3`] = new THREE.MeshPhongMaterial({
        map: texture,
        color: colorTable.red,
        ambient: colorTable.white,
        shading: shading,
      });
    }

    // this is what is really used
    mats[key] = new THREE.MeshPhongMaterial({
      map: texture,
      color: colorTable.darkBrown,
      ambient: colorTable.white,
      shading: shading,
    });
  });

  makeTree(group, mats);
}

/**
 * <p>I developed a certain dislike for skyboxes or at least for the clunky ones,
 * as such the PRESENTS are going to be skyboxes.</p>
 *
 * Why not, am I right? No specification were given saying that the
 * skyboxes had to be used as the 'environment'.
 * @param {external:THREE.Object3D} group - the given group to add the presents to.
 * @param {Number} size - the size of the cube -- will correspond to width, length, and height.
 * @param {Number} x - position x
 * @param {Number} y - position y
 * @param {Number} z - position z
 * @param {Array<String>} images - image array to use.
 */
function addPresent(group, size, x, y, z, images) {
  // load the six images
  const ourCubeMap = new THREE.ImageUtils.loadTextureCube(images);

  // Use a built-in Three.js shader for cube maps
  const cubeMapShader = THREE.ShaderLib["cube"];

  // point it to our texture
  cubeMapShader.uniforms["tCube"].value = ourCubeMap;

  // make a ShaderMaterial using this shader's properties
  const material = new THREE.ShaderMaterial({
    fragmentShader: cubeMapShader.fragmentShader,
    vertexShader: cubeMapShader.vertexShader,
    uniforms: cubeMapShader.uniforms,
    side: THREE.DoubleSide, // make sure we can see it from outside or inside
  });

  // Create a mesh for the object, using the cube shader as the material
  const cube = new THREE.Mesh(
    new THREE.CubeGeometry(size, size, size),
    material,
  );
  cube.position.set(x, y, z);
  cube.castShadow = true;
  cube.name = "Present";

  // add it to the scene
  group.add(cube);
}

/**
 * Add ground to scene.
 * @param {external:THREE.Object3D} group - the given group to add the ground to.
 */
function addGround(group) {
  const groundColor = new THREE.Color(colorTable.veryLightBlue);
  const groundTexture2 = THREE.ImageUtils.generateDataTexture(
    1,
    1,
    groundColor,
  );
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: colorTable.white,
    specular: colorTable.black2,
    map: groundTexture2,
  });

  const groundTexture = THREE.ImageUtils.loadTexture(
    path + "ground.jpg",
    undefined,
    function () {
      groundMaterial.map = groundTexture;
    },
  );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  groundTexture.anisotropy = 16;

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
 * Based on a tutorial found on {@link ScriptsTutorial.com huzzah}
 * @param {external:THREE.Object3D} group - the given group to add the snowflakes to.
 */
function addSnowflakes(group) {
  const sfGeometry = new THREE.Geometry();
  const sfMats = [];
  const sfTexture = THREE.ImageUtils.loadTexture(path + "snowflake.png");
  const sfTexture2 = THREE.ImageUtils.loadTexture(path + "snowflake2.png");

  for (let i = 0; i < 3700; i++) {
    let vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2000 - 1000;
    vertex.y = Math.random() * 2000 - 1000;
    vertex.z = Math.random() * 2000 - 1000;

    sfGeometry.vertices.push(vertex);
  }

  const states = [
    { color: [1.0, 0.2, 0.9], sprite: sfTexture, size: 10 },
    { color: [0.9, 0.1, 0.5], sprite: sfTexture, size: 8 },
    { color: [0.8, 0.05, 0.5], sprite: sfTexture, size: 5 },
    { color: [1.0, 0.2, 0.9], sprite: sfTexture2, size: 10 },
    { color: [0.9, 0.1, 0.5], sprite: sfTexture2, size: 8 },
    { color: [0.8, 0.05, 0.5], sprite: sfTexture2, size: 5 },
  ];

  states.forEach((state) => {
    let i = sfMats.push(
      new THREE.ParticleSystemMaterial({
        size: state.size,
        map: state.sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      }),
    );

    sfMats[i - 1].color.setHSL(...state.color);

    const particles = new THREE.ParticleSystem(sfGeometry, sfMats[i - 1]);

    particles.rotation.x = Math.random() * 15;
    particles.rotation.y = Math.random() * 10;
    particles.rotation.z = Math.random() * 17;

    particles.name = "Particles";
    group.add(particles);
  });
}

/**
 * Make the Christmas tree, which is just a bunch of stacked cones (cylinders).
 * @param {external:THREE.Object3D} group - the given group to add the tree to.
 * @param {Object<String,external:THREE.Material>} materials - the given material object.
 * @see https://threejs.org/docs/#api/en/geometries/CylinderGeometry
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

  tree.forEach((elem) => {
    const t = new THREE.Mesh(
      new THREE.CylinderGeometry(...elem.geometry, false),
      elem.material,
    );
    t.castShadow = true;
    t.position.set(0, elem.y, 0);
    t.name = "Tree";
    group.add(t);
  });

  addBaubles(group, materials);
}

/**
 * <p>Yeah hardcoded... no I'm not proud</p>
 * But this was the most straightforward way to add trinkets
 * to the tree that actually looked like they were on the tree.
 * @param {Object<String,external:THREE.Material>} materials - the given material object.
 * @param {external:THREE.Object3D} group - the given group to add the baubles to.
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
 * @param {external:THREE.Object3D} group - the given group to add the object to.
 * @param {String} objectFile - the object file to be read.
 * @param {Number} x - position x
 * @param {Number} y - position y
 * @param {Number} z - position z
 * @param {Number} size - the object's size.
 * @param {Number} rotate - rotation amount.
 * @param {String|Number} color - the objects's color.
 */
function addObject(group, objectFile, x, y, z, size, rotate, color) {
  /**
   * OBJLoader object.
   * @var {OBJLoader}
   * @global
   */
  const oLoader = new THREE.OBJLoader();
  oLoader.load(objectFile, function (object) {
    const material2 = new THREE.MeshLambertMaterial({ color: color });

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        // apply custom material
        child.material = material2;

        // enable casting shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    object.position.set(x, y, z);
    object.scale.set(size, size, size);
    object.rotateY(rotate);

    object.name = objectFile;
    group.add(object);
  });
}

/**
 * Add or remove light {@link showHelpers helpers}.
 */
function displayHelpers() {
  showHelpers = !showHelpers;
  // because of strict mode, "this" is undefined
  let action = showHelpers ? scene.add.bind(scene) : scene.remove.bind(scene);

  Object.keys(lightHelpers).forEach((key) => {
    action(lightHelpers[key]);
  });
  return false;
}

/**
 * <p>Lights galore - includes {@link https://threejs.org/docs/#api/en/lights/PointLight point lights},
 * {@link https://threejs.org/docs/#api/en/lights/SpotLight spot lights},
 * and a {@link https://threejs.org/docs/#api/en/lights/DirectionalLight directional light}
 * because why not?</p>
 *
 * We also created a
 * {@link https://threejs.org/docs/#api/en/helpers/CameraHelper camera helper}
 * for the spot light.
 *
 * @param {external:THREE.Scene} scene - the given scene.
 */
function addLight(scene) {
  scene.add(new THREE.AmbientLight(colorTable.black, 0.2));

  const pointLight = new THREE.PointLight(colorTable.lightBlue, 1.3, 1000);
  pointLight.position.set(200, 100, 0);
  pointLight.castShadow = false;
  scene.add(pointLight);

  lightHelpers.phelper = new THREE.PointLightHelper(pointLight, 10);
  lightHelpers.phelper.name = "PointLight";

  const spotLight = new THREE.SpotLight(colorTable.white, 1);
  spotLight.position.set(200, 200, 200);
  spotLight.angle = Math.PI / 6;
  spotLight.decay = 2;

  spotLight.castShadow = true;

  spotLight.shadowMapWidth = 1024;
  spotLight.shadowMapHeight = 1024;

  spotLight.shadowCameraNear = 0.5;
  spotLight.shadowCameraFar = 5000;
  spotLight.shadowCameraFov = 60;

  scene.add(spotLight);

  spotLight.shadowCamera = new THREE.PerspectiveCamera(60, 1, 0.5, 5000);
  lightHelpers.chelper = new THREE.CameraHelper(spotLight.shadowCamera);
  lightHelpers.chelper.name = "CameraHelper";
  lightHelpers.shelper = new THREE.SpotLightHelper(spotLight);
  lightHelpers.shelper.name = "SpotLight";

  // add directional light
  const directionalLight = new THREE.DirectionalLight(colorTable.blue, 2);
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

  // initialize the scene
  scene = new THREE.Scene();

  // add fog to scene
  scene.fog = new THREE.Fog(colorTable.purple, 500, 10000);

  makeCamera(scene);

  // create the empty scene groups
  group = new THREE.Object3D();
  teaPotGroup = new THREE.Object3D();

  scene.add(group);
  group.add(teaPotGroup);

  prepareMaterials(group);

  // add 3 skyboxes
  imageNames.img2 = imageNames.img2.map((img) => path + img);
  imageNames.img1 = imageNames.img1.map((img) => path + img);
  addPresent(group, 50, 20, -125, 60, imageNames.img2);
  addPresent(group, 30, -20, -135, -60, imageNames.img1);
  addPresent(group, 20, -20, -140, 100, imageNames.img1);

  // add our star teapot
  addObject(teaPotGroup, "teapot.obj", 0, 155, 0, 0.3, 0, colorTable.yellow);

  // bunnies for days
  addObject(group, "bunny.obj", 80, -130, 0, 20, 0, colorTable.brown);
  addObject(group, "bunny.obj", -50, -140, 0, 10, -90, colorTable.lightBrown);
  addObject(group, "bunny.obj", 100, -135, 60, 15, 40, colorTable.white2);
  addObject(group, "bunny.obj", 20, -143, -60, 8, -180, colorTable.amber);

  addGround(group);

  addSnowflakes(group);

  addLight(scene);

  // prepare the render object and render the scene
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(scene.fog.color);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.PCFSoftShadowmap = true;
  container.appendChild(renderer.domElement);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.physicallyBasedShading = true;

  // add events handlers -- thanks script tutorials
  renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
  renderer.domElement.addEventListener(
    "touchstart",
    onDocumentTouchStart,
    false,
  );
  renderer.domElement.addEventListener("touchmove", onDocumentTouchMove, false);

  /**
   * <p>Appends an event listener for events whose type attribute value is resize.</p>
   * <p>The {@link onWindowResize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @param {Event} event the document view is resized.
   * @param {callback} function function to run when the event occurs.
   * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
   * @event resize - executed when the window is resized.
   */
  window.addEventListener("resize", onWindowResize, false);

  /**
   * <p>Key handler.</p>
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
   */
  document.addEventListener("keydown", handleKeyPress, false);
}

/**
 * Triggers the animation loop by calling {@link render}.
 */
function animate() {
  requestAnimationFrame(animate);

  render();
}

/**
 * Rotates the camera around the tree and
 * calls the {@link renderer renderer.render} method.
 */
function render() {
  let timer = Date.now() * 0.00035;
  let { x, y, z } = camera.position;
  const rotSpeed = 0.004;

  // mouse click and drag
  group.rotation.y += (targetRotation - group.rotation.y) * 0.01;

  // spinning teapot -- it is a nice star
  teaPotGroup.rotation.y += 0.03;

  if (!paused && inAndOutCamera) {
    camera.position.x = Math.cos(timer) * 1000;
    camera.position.z = Math.sin(timer) * 500;
  }

  if (!paused && !inAndOutCamera) {
    // rotate camera around tree
    camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
    camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
  }

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

/**
 * <p>Load the applicarion.</p>
 * {@link init Initialize} and start {@link animate animation}.
 * @param {Event} event an object has loaded.
 * @event load
 */
window.addEventListener("load", (event) => {
  init();
  animate();
});
