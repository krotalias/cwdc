/**
 * @file
 *
 * Summary.
 * <p>Renders a christmas scene - Merry (Early) Christmas.</p>
 *
 * @author Flavia Cavalcanti
 * @since 24/11/2015
 *
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 *
 * @see <a href="/cwdc/13-webgl/homework/Christmas_tree_with_three.js_files/script.js">source</a>
 * @see <a href="/cwdc/13-webgl/homework/Christmas_tree_with_three.js.html">link</a>
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
 * A container holding the geeting and the canvas.
 * @type {HTMLDivElement}
 */
var container;

/**
 * Rotation about the "Y" axis, applied by the renderer to the scene,
 * based on mouse displacement.
 * @type {Number}
 */
var targetRotation = 0;

/**
 * Target rotation when the mouse is clicked.
 * @type {Number}
 */
var targetRotationOnMouseDown = 0;

/**
 * An event (clientX - windowHalfX).
 * @type {Number}
 */
var mouseX = 0;

/**
 * An event (clientX - windowHalfX) when a movement starts.
 * @type {Number}
 */
var mouseXOnMouseDown = 0;

/**
 * Half of the window {@link https://developer.mozilla.org/en-US/docs/Web/API/window/innerWidth innerWidth} property.
 * @type {Number}
 */
var windowHalfX = window.innerWidth / 2;

/**
 * Half of the window {@link https://developer.mozilla.org/en-US/docs/Web/API/window/innerHeight innerHeight} property.
 * @type {Number}
 */
var windowHalfY = window.innerHeight / 2;

/**
 * Will pause the camera rotation.
 * @type {Boolean}
 */
var paused = false;

/**
 * Camera will move around the tree in and out.
 * @type {Boolean}
 */
var inAndOutCamera = true;

/**
 * Display help.
 * @type {Boolean}
 */
var help = false;

/**
 * Image directory.
 * @type {String}
 */
var path = "img/";

/**
 * Not the best for a skybox, but the effect is quite psychadelic.
 * @type {Array<String>}
 */
var imageNames = [
  path + "wrappingPaper.jpg",
  path + "wrappingPaper.jpg",
  path + "wrappingPaper.jpg",
  path + "wrappingPaper.jpg",
  path + "wrappingPaper.jpg",
  path + "wrappingPaper.jpg",
];

/**
 * Not the best for a skybox, but the effect is quite psychadelic.
 * @type {Array<String>}
 */
var imageNames2 = [
  path + "wrappingPaper2.jpg",
  path + "wrappingPaper2.jpg",
  path + "wrappingPaper2.jpg",
  path + "wrappingPaper2.jpg",
  path + "wrappingPaper2.jpg",
  path + "wrappingPaper2.jpg",
];

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

  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("mouseup", onDocumentMouseUp, false);
  document.addEventListener("mouseout", onDocumentMouseOut, false);

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
  document.removeEventListener("mousemove", onDocumentMouseMove, false);
  document.removeEventListener("mouseup", onDocumentMouseUp, false);
  document.removeEventListener("mouseout", onDocumentMouseOut, false);
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
  document.removeEventListener("mousemove", onDocumentMouseMove, false);
  document.removeEventListener("mouseup", onDocumentMouseUp, false);
  document.removeEventListener("mouseout", onDocumentMouseOut, false);
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
  var distance = c.position.length();
  var q, q2;

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
  var ch = getChar(event);
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
    default:
      return;
  }
}

/**
 * Prepare materials and add it to the given group scene.
 * @param {external:THREE.Object3D} group the given group.
 */
function prepareMaterials(group) {
  var leafTexture = THREE.ImageUtils.loadTexture("img/pine.jpg");
  leafTexture.repeat.set(1, 1);
  leafTexture.wrapS = leafTexture.wrapT = THREE.RepeatWrapping;
  leafTexture.anisotropy = 16;
  leafTexture.needsUpdate = true;

  var woodTexture = THREE.ImageUtils.loadTexture("img/wood2.jpg");
  woodTexture.repeat.set(1, 1);
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.anisotropy = 16;
  woodTexture.needsUpdate = true;

  var redBauble = THREE.ImageUtils.loadTexture("img/red.jpg");
  redBauble.repeat.set(1, 1);
  redBauble.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  redBauble.anisotropy = 16;
  redBauble.needsUpdate = true;

  var blueBauble = THREE.ImageUtils.loadTexture("img/blue.jpg");
  blueBauble.repeat.set(1, 1);
  blueBauble.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  blueBauble.anisotropy = 16;
  blueBauble.needsUpdate = true;

  var greenBauble = THREE.ImageUtils.loadTexture("img/green.jpg");
  greenBauble.repeat.set(1, 1);
  greenBauble.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  greenBauble.anisotropy = 16;
  greenBauble.needsUpdate = true;

  var yellowBauble = THREE.ImageUtils.loadTexture("img/yellow.jpg");
  yellowBauble.repeat.set(1, 1);
  yellowBauble.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  yellowBauble.anisotropy = 16;
  yellowBauble.needsUpdate = true;

  var fur = THREE.ImageUtils.loadTexture("img/fur.jpg");
  fur.repeat.set(1, 1);
  fur.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  fur.anisotropy = 16;
  fur.needsUpdate = true;

  var fur2 = THREE.ImageUtils.loadTexture("img/fur2.jpg");
  fur2.repeat.set(1, 1);
  fur2.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  fur2.anisotropy = 16;
  fur2.needsUpdate = true;

  var moon = THREE.ImageUtils.loadTexture("img/moon.jpg");
  moon.repeat.set(1, 1);
  moon.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  moon.anisotropy = 16;
  moon.needsUpdate = true;

  var shininess = 50,
    specular = 0x333333,
    bumpScale = 1,
    shading = THREE.SmoothShading;

  var materials = [];
  materials.push(
    new THREE.MeshPhongMaterial({
      map: leafTexture,
      bumpMap: leafTexture,
      bumpScale: bumpScale,
      color: 0xff0000,
      ambient: 0xffffff,
      specular: specular,
      shininess: shininess,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: leafTexture,
      color: 0x008800,
      ambient: 0xffffff,
      specular: specular,
      shininess: shininess,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: leafTexture,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: leafTexture,
      color: 0xff0000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: woodTexture,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: redBauble,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: blueBauble,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: greenBauble,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: yellowBauble,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: fur,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: fur2,
      color: 0x584000,
      ambient: 0xffffff,
      shading: shading,
    }),
  );

  makeTree(materials, group);
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
  var ourCubeMap = new THREE.ImageUtils.loadTextureCube(images);

  // Use a built-in Three.js shader for cube maps
  var cubeMapShader = THREE.ShaderLib["cube"];

  // point it to our texture
  cubeMapShader.uniforms["tCube"].value = ourCubeMap;

  // make a ShaderMaterial using this shader's properties
  var material = new THREE.ShaderMaterial({
    fragmentShader: cubeMapShader.fragmentShader,
    vertexShader: cubeMapShader.vertexShader,
    uniforms: cubeMapShader.uniforms,
    side: THREE.DoubleSide, // make sure we can see it from outside or inside
  });

  // Create a mesh for the object, using the cube shader as the material
  var cube = new THREE.Mesh(new THREE.CubeGeometry(size, size, size), material);
  // add it to the scene
  group.add(cube);
  cube.position.set(x, y, z);
}

/**
 * Add ground to scene.
 * @param {external:THREE.Object3D} group the given group to add the ground to.
 */
function addGround(group) {
  var groundColor = new THREE.Color(0xd2ddef);
  var groundTexture = THREE.ImageUtils.generateDataTexture(1, 1, groundColor);
  var groundMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x111111,
    map: groundTexture,
  });

  var groundTexture = THREE.ImageUtils.loadTexture(
    "img/ground.jpg",
    undefined,
    function () {
      groundMaterial.map = groundTexture;
    },
  );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  groundTexture.anisotropy = 16;

  var groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000),
    groundMaterial,
  );
  groundMesh.position.y = -150;
  groundMesh.rotation.x = -Math.PI / 2;
  group.add(groundMesh);
}

/**
 * <p>Christmas needs frigging snowflakes.</p>
 * Except christmas in Brazil, then its just palm trees...
 * Based on a tutorial found on {@link ScriptsTutorial.com huzzah}
 * @param {external:THREE.Object3D} group - the given group to add the snowflakes to.
 */
function addSnowflakes(group) {
  var sfGeometry = new THREE.Geometry();
  var sfMats = [];
  var sfTexture = THREE.ImageUtils.loadTexture("img/snowflake.png");
  var sfTexture2 = THREE.ImageUtils.loadTexture("img/snowflake2.png");
  var textToUse = sfTexture;

  for (let i = 0; i < 3700; i++) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2000 - 1000;
    vertex.y = Math.random() * 2000 - 1000;
    vertex.z = Math.random() * 2000 - 1000;

    sfGeometry.vertices.push(vertex);
  }

  var states = [
    [[1.0, 0.2, 0.9], sfTexture, 10],
    [[0.9, 0.1, 0.5], sfTexture, 8],
    [[0.8, 0.05, 0.5], sfTexture, 5],
    [[1.0, 0.2, 0.9], sfTexture2, 10],
    [[0.9, 0.1, 0.5], sfTexture2, 8],
    [[0.8, 0.05, 0.5], sfTexture2, 5],
  ];

  let color, sprite, size;

  for (let i = 0; i < states.length; i++) {
    //vary between snowflake textures -- white/blue
    if (i % 2 == 0) {
      color = states[i][0];
      sprite = states[i][1];
      size = states[i][2];
    } else {
      color = states[i][0];
      sprite = states[i][1];
      size = states[i][2];
    }

    sfMats[i] = new THREE.ParticleSystemMaterial({
      size: size,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });
    sfMats[i].color.setHSL(color[0], color[1], color[2]);

    const particles = new THREE.ParticleSystem(sfGeometry, sfMats[i]);

    particles.rotation.x = Math.random() * 15;
    particles.rotation.y = Math.random() * 10;
    particles.rotation.z = Math.random() * 17;

    group.add(particles);
  }
}

/**
 * Make the christmas tree.
 * @param {Array<external:THREE.Material>} materials the given materials array.
 * @param {external:THREE.Object3D} group the given group to add the tree to.
 */
function makeTree(materials, group) {
  var treeTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 30, 50, 30, 1, false),
    materials[2],
  );
  var treeTop1 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 40, 70, 30, 1, false),
    materials[2],
  );
  var treeTop2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 50, 80, 30, 1, false),
    materials[2],
  );
  var treeMid = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 60, 90, 30, 1, false),
    materials[2],
  );
  var treeMid2 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 70, 80, 30, 1, false),
    materials[2],
  );
  var treeMid3 = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 80, 90, 30, 1, false),
    materials[2],
  );
  var treeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 95, 95, 30, 1, false),
    materials[2],
  );

  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 20, 300, 30, 1, false),
    materials[4],
  );

  treeTop.position.set(0, 130, 0);
  treeTop1.position.set(0, 110, 0);
  treeTop2.position.set(0, 85, 0);
  treeMid.position.set(0, 65, 0);
  treeMid2.position.set(0, 30, 0);
  treeMid3.position.set(0, 5, 0);
  treeBase.position.set(0, -20, 0);

  group.add(trunk);
  group.add(treeTop);
  group.add(treeTop1);
  group.add(treeTop2);
  group.add(treeMid);
  group.add(treeMid2);
  group.add(treeMid3);
  group.add(treeBase);

  addBaubles(group, materials);
}

/**
 * <p>Yeah hardcoded... no I'm not proud</p>
 * But this was the most straightforward way to add trinkets
 * to the tree that actually looked like they were on the tree.
 * @param {Array<external:THREE.Material>} materials - the given materials array.
 * @param {external:THREE.Object3D} group - the given group to add the baubles to.
 */
function addBaubles(group, materials) {
  var bauble = new THREE.Mesh(new THREE.SphereGeometry(5, 15, 5), materials[5]);
  var bauble1 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[8],
  );
  var bauble2 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[8],
  );
  var bauble3 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[5],
  );

  bauble.position.set(15, 135, 5);
  bauble1.position.set(0, 135, 13);
  bauble2.position.set(0, 135, -13);
  bauble3.position.set(-15, 135, -5);

  group.add(bauble);
  group.add(bauble1);
  group.add(bauble2);
  group.add(bauble3);

  var bauble4 = new THREE.Mesh(
    new THREE.SphereGeometry(6, 15, 5),
    materials[6],
  );
  var bauble5 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[5],
  );
  var bauble6 = new THREE.Mesh(
    new THREE.SphereGeometry(6, 15, 5),
    materials[6],
  );
  var bauble7 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[5],
  );

  bauble4.position.set(35, 90, 5);
  bauble5.position.set(0, 90, 33);
  bauble6.position.set(-35, 90, -5);
  bauble7.position.set(0, 90, -33);

  group.add(bauble4);
  group.add(bauble5);
  group.add(bauble6);
  group.add(bauble7);

  var bauble8 = new THREE.Mesh(
    new THREE.SphereGeometry(7, 15, 5),
    materials[7],
  );
  var bauble9 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[8],
  );
  var bauble10 = new THREE.Mesh(
    new THREE.SphereGeometry(7, 15, 5),
    materials[7],
  );
  var bauble11 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[8],
  );

  bauble8.position.set(35, 60, 25);
  bauble9.position.set(-30, 60, 33);
  bauble10.position.set(-35, 60, -25);
  bauble11.position.set(30, 60, -33);

  group.add(bauble8);
  group.add(bauble9);
  group.add(bauble10);
  group.add(bauble11);

  var bauble12 = new THREE.Mesh(
    new THREE.SphereGeometry(8, 15, 5),
    materials[5],
  );
  var bauble13 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[6],
  );
  var bauble14 = new THREE.Mesh(
    new THREE.SphereGeometry(8, 15, 5),
    materials[5],
  );
  var bauble15 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[6],
  );

  bauble12.position.set(48, 35, 25);
  bauble13.position.set(-42, 35, 33);
  bauble14.position.set(-48, 35, -25);
  bauble15.position.set(42, 35, -33);

  group.add(bauble12);
  group.add(bauble13);
  group.add(bauble14);
  group.add(bauble15);

  var bauble16 = new THREE.Mesh(
    new THREE.SphereGeometry(6, 15, 5),
    materials[8],
  );
  var bauble17 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[7],
  );
  var bauble18 = new THREE.Mesh(
    new THREE.SphereGeometry(6, 15, 5),
    materials[8],
  );
  var bauble19 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[7],
  );

  bauble16.position.set(-52, 7, 25);
  bauble17.position.set(50, 7, 33);
  bauble18.position.set(52, 7, -25);
  bauble19.position.set(-50, 7, -33);

  group.add(bauble16);
  group.add(bauble17);
  group.add(bauble18);
  group.add(bauble19);

  var bauble20 = new THREE.Mesh(
    new THREE.SphereGeometry(7, 15, 5),
    materials[6],
  );
  var bauble21 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[5],
  );
  var bauble22 = new THREE.Mesh(
    new THREE.SphereGeometry(7, 15, 5),
    materials[6],
  );
  var bauble23 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 15, 5),
    materials[5],
  );

  bauble20.position.set(65, -25, 25);
  bauble21.position.set(-30, -25, 63);
  bauble22.position.set(-65, -25, -25);
  bauble23.position.set(30, -25, -63);

  group.add(bauble20);
  group.add(bauble21);
  group.add(bauble22);
  group.add(bauble23);

  var bauble24 = new THREE.Mesh(
    new THREE.SphereGeometry(8, 15, 5),
    materials[5],
  );
  var bauble25 = new THREE.Mesh(
    new THREE.SphereGeometry(6, 15, 5),
    materials[8],
  );
  var bauble26 = new THREE.Mesh(
    new THREE.SphereGeometry(8, 15, 5),
    materials[5],
  );
  var bauble27 = new THREE.Mesh(
    new THREE.SphereGeometry(6, 15, 5),
    materials[8],
  );

  bauble24.position.set(80, -50, 25);
  bauble25.position.set(-40, -50, 73);
  bauble26.position.set(-80, -50, -25);
  bauble27.position.set(40, -50, -73);

  group.add(bauble24);
  group.add(bauble25);
  group.add(bauble26);
  group.add(bauble27);
}

/**
 * <p>Loads an object to the scene.</p>
 * Used to add the tea pot and the bunnies.
 * Frigging bunnies all around, everyone loves bunnies.
 * Tea pot is our new christmas tree star.
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
   * ObjectLoader object.
   * @var {OBJLoader}
   * @global
   */
  var oLoader = new THREE.OBJLoader();
  oLoader.load(objectFile, function (object, materials) {
    var material2 = new THREE.MeshLambertMaterial({ color: color });

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        // apply custom material
        child.material = material2;

        // enable casting shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    object.position.x = x;
    object.position.y = y;
    object.position.z = z;
    object.scale.set(size, size, size);
    object.rotateY(rotate);
    group.add(object);
  });
}

/**
 * Lights galore - includes point lights, spot lights,
 * and a directional light because why not?
 * @param {external:THREE.Scene} scene - the given scene.
 */
function addLight(scene) {
  scene.add(new THREE.AmbientLight(0x222222));

  const pointLight = new THREE.PointLight(0x00ccff, -1.3, 1000);
  group.add(pointLight);
  pointLight.position.set(15, -1, 1).normalize();

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(200, 200, 200).normalize;

  spotLight.castShadow = true;

  spotLight.shadowMapWidth = 1024;
  spotLight.shadowMapHeight = 1024;

  spotLight.shadowCameraNear = 500;
  spotLight.shadowCameraFar = 1000;
  spotLight.shadowCameraFov = 10;

  scene.add(spotLight);

  // add directional light
  var directionalLight = new THREE.DirectionalLight(0x000099, 2);
  directionalLight.position.set(15, 1, 1).normalize();
  scene.add(directionalLight);
}

/**
 * Display a greeting and information at the top of the page.
 */
function makeGreeting() {
  // prepare the container
  container = document.createElement("div");
  document.body.appendChild(container);
  // display Info
  var greeting = document.createElement("div");
  greeting.setAttribute("id", "greeting");
  greeting.innerHTML = "<b>MERRY CHRISTMAS!</b><br>";
  var info = document.createElement("div");
  info.setAttribute("id", "info");
  greeting.setAttribute("id", "greeting");
  greeting.style.position = "absolute";
  greeting.style.top = "50px";
  greeting.style.width = "100%";
  greeting.style.textAlign = "center";
  greeting.style.color = "white";
  info.innerHTML = `DRAG TO SPIN<br>
  Have your volume ON for the full experience<br>
  Press <b>h</b> for more information`;

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
  scene.fog = new THREE.Fog(0x590fa3, 500, 10000);

  makeCamera(scene);

  // create the empty scene groups
  group = new THREE.Object3D();
  teaPotGroup = new THREE.Object3D();

  scene.add(group);
  group.add(teaPotGroup);

  prepareMaterials(group);

  //add 3 skyboxes
  addPresent(group, 50, 20, -125, 60, imageNames2);
  addPresent(group, 30, -20, -135, -60, imageNames);
  addPresent(group, 20, -20, -140, 100, imageNames);

  //add our star tea pot
  addObject(teaPotGroup, "teapot.obj", 0, 155, 0, 0.3, 0, 0xffff00);

  //bunnies for days
  addObject(group, "bunny.obj", 80, -130, 0, 20, 0, 0x995500);
  addObject(group, "bunny.obj", -50, -140, 0, 10, -90, 0xcc6600);
  addObject(group, "bunny.obj", 100, -135, 60, 15, 40, 0xfffff6);
  addObject(group, "bunny.obj", 20, -143, -60, 8, -180, 0xffae00);

  addGround(group);

  addSnowflakes(group);

  addLight(scene);

  // prepare the render object and render the scene
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(scene.fog.color);

  renderer.setSize(window.innerWidth, window.innerHeight);
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
}

/**
 * Triggers the animation by calling {@link render} and binds
 * the {@link event:keydown} event.
 */
function animate() {
  /**
   * <p>Key handler.</p>
   * Calls {@link handleKeyPress} when pressing assigned keys:
   * <ul>
   *  <li>Space - pause</li>
   *  <li>h - help</li>
   *  <li>w, s, a, d - forward, backward, left, right</li>
   *  <li>I, K, J, L - orbit down, up, left, right</li>
   *  <li>+, - - field of view (zoom)</li>
   *  <li>↑, ↓- up, down</li>
   *  <li>n - move camera close/farther away wile rotating, or not</li>
   * </ul>
   * @event keydown
   */
  document.addEventListener("keydown", handleKeyPress, false);

  requestAnimationFrame(animate);

  render();
}

/**
 * Rotates the camera around the tree and
 * calls the {@link renderer renderer.render} method.
 */
function render() {
  var timer = Date.now() * 0.00035;
  var x = camera.position.x,
    y = camera.position.y,
    z = camera.position.z;
  var rotSpeed = 0.004;

  group.rotation.y += (targetRotation - group.rotation.y) * 0.01; //mouse click and drag

  teaPotGroup.rotation.y += 0.03; //spinning tea pot -- its a nice star

  if (!paused && inAndOutCamera) {
    camera.position.x = Math.cos(timer) * 1000;
    camera.position.z = Math.sin(timer) * 500;
  }

  if (!paused && !inAndOutCamera) {
    //rotate camera around tree
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