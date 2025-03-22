/**
 * @file
 *
 * Summary.
 *
 * <p>WebGL - {@link THREE.ArcballControls arcball controls} demo.</p>
 *
 * <p><b>For educational purposes only.</b></p>
 *
 * @since 17/09/2024
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2025 Paulo R Cavalcanti.
 * @author {@link https://x.com/_artisaverb?lang=en Andrew Maximov}
 * @author modified by {@link https://krotalias.github.io Paulo Roma}
 *
 * @see <a href="/cwdc/13-webgl/examples/three/content/misc_controls_arcball.html?gui=1">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/misc_controls_arcball.js">source</a>
 * @see {@link https://threejs.org/examples/misc_controls_arcball.html link threejs}
 * @see {@link https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_arcball.html#L184 source threejs}
 * @see {@link https://finalfantasy.fandom.com/wiki/Cerberus_(weapon) Cerberus} (weapon)
 * @see {@link https://en.wikipedia.org/wiki/Cerberus Cerberus} (underworld guardian)
 * @see {@link https://discourse.threejs.org/t/arcballcontrol-problems-on-mobile/70160/3 ArcballControls problems on mobile}
 * @see <img src="/cwdc/13-webgl/examples/three/content/Cerberus.jpg" alt="ArcballControls" width="256">
 */

"use strict";

import * as THREE from "three";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

/**
 * Array of camera types.
 * @type {String[]}
 */
const cameras = ["Orthographic", "Perspective"];

/**
 * Object with the current camera type.
 * @type {Object<{type: String}>}
 */
const cameraType = { type: "Perspective" };

/**
 * Perspective camera distance.
 * @type {Number}
 */
const perspectiveDistance = 5;

/**
 * Orthographic camera distance.
 * @type {Number}
 */
const orthographicDistance = 120;

let camera, controls, scene, renderer;
let folderOptions, folderAnimations;

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
 * <a href="/cwdc/13-webgl/examples/three/content/doc-example/index.html">Imported</a> from {@link external:three three.module.js}
 *
 * @namespace THREE
 */

/**
 * <p>lil-gui module.</p>
 *
 * <p>lil-gui gives you an interface for changing the properties of any JavaScript object at runtime.
 * It's intended as a drop-in replacement for dat.gui,
 * implemented with more modern web standards and some new quality of life features.</p>
 * @external GUI
 * @see {@link https://lil-gui.georgealways.com lil-gui}
 */

/**
 * Global {@link GUI.GUI GUI}.
 * @type {GUI}
 */
let gui;

/**
 * <p>ArcballGui is a class that contains the properties and methods for the user interface.</p>
 * @class ArcballGui
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object MDN Object}
 */
const ArcballGui = {
  /**
   * Show gizmo if set to true
   * @type {Boolean}
   */
  gizmoVisible: true,

  /**
   * Enable GUI if set to true.
   * @type {Boolean}
   */
  useGUI: false,

  /**
   * Create an Arcballcontrols object and activate its gizmo.
   */
  setArcballControls: function () {
    /**
     * Arcball controls allow the camera to be controlled by a virtual trackball
     * with full touch support and advanced navigation functionality.
     * Cursor/finger positions and movements are mapped over a virtual trackball surface
     * represented by a gizmo and mapped in intuitive and consistent camera movements.
     * Dragging cursor/fingers will cause camera to orbit around the center of the trackball
     * in a conservative way (returning to the starting point will make the camera
     * to return to its starting orientation).
     * @class ArcballControls
     * @memberof THREE
     * @see {@link https://threejs.org/docs/#examples/en/controls/ArcballControls ArcballControls}
     */
    controls = new ArcballControls(camera, renderer.domElement, scene);
    controls.addEventListener("change", render);
    this.gizmoVisible = true;
    if (ArcballGui.useGUI) this.populateGui();
  },

  /**
   * Populate GUI
   */
  populateGui: function () {
    folderOptions.add(controls, "enabled").name("Enable controls");
    folderOptions.add(controls, "enableGrid").name("Enable Grid");
    folderOptions.add(controls, "enableRotate").name("Enable rotate");
    folderOptions.add(controls, "enablePan").name("Enable pan");
    folderOptions.add(controls, "enableZoom").name("Enable zoom");
    folderOptions.add(controls, "cursorZoom").name("Cursor zoom");
    folderOptions.add(controls, "adjustNearFar").name("adjust near/far");
    folderOptions
      .add(controls, "scaleFactor", 1.1, 10, 0.1)
      .name("Scale factor");
    folderOptions.add(controls, "minDistance", 0, 50, 0.5).name("Min distance");
    folderOptions.add(controls, "maxDistance", 0, 50, 0.5).name("Max distance");
    folderOptions.add(controls, "minZoom", 0, 50, 0.5).name("Min zoom");
    folderOptions.add(controls, "maxZoom", 0, 50, 0.5).name("Max zoom");
    folderOptions
      .add(ArcballGui, "gizmoVisible")
      .name("Show gizmos")
      .onChange(function () {
        controls.setGizmosVisible(ArcballGui.gizmoVisible);
      });
    folderOptions.add(controls, "copyState").name("Copy state(ctrl+c)");
    folderOptions.add(controls, "pasteState").name("Paste state(ctrl+v)");
    folderOptions.add(controls, "reset").name("Reset");
    folderAnimations.add(controls, "enableAnimations").name("Enable anim.");
    folderAnimations.add(controls, "dampingFactor", 0, 100, 1).name("Damping");
    folderAnimations.add(controls, "wMax", 0, 100, 1).name("Angular spd");
  },
};

/**
 * <p>Initializes the scene, camera, renderer, and the arcball controls.</p>
 * @summary Loads the viewer and starts the {@link runAnimation animation}.
 */
function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  /**
   * The WebGL renderer displays your beautifully crafted scenes using WebGL.
   * @class WebGLRenderer
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer WebGLRenderer}
   */
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  renderer.domElement.style.background =
    "linear-gradient( 180deg, rgba( 0,0,0,1 ) 0%, rgba( 128,128,255,1 ) 100% )";
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  /**
   * Camera that uses perspective projection.
   * @class PerspectiveCamera
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera PerspectiveCamera}
   */
  camera = makePerspectiveCamera();
  camera.position.set(0, 0, perspectiveDistance); ///// <---------------------

  const material = new THREE.MeshStandardMaterial();

  const rgbeLoader = new RGBELoader().setPath("textures/equirectangular/");
  (async () => {
    const hdrEquirect = await rgbeLoader.loadAsync("venice_sunset_1k.hdr");
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrEquirect;
  })();

  /**
   * <p>A loader for loading a .obj resource.</p>
   * The OBJ file format is a simple data-format that represents 3D geometry in a
   * human readable format as the position of each vertex,
   * the UV position of each texture coordinate vertex, vertex normals,
   * and the faces that make each polygon defined as a list of vertices, and texture vertices.
   * @class OBJLoader
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/OBJLoader obj_loader Model Loader}
   * @see {@link https://imagetostl.com/convert/file/glb/to/obj Convert Your 3D Mesh/Model GLB Files to OBJ}
   */
  const objLoader = new OBJLoader().setPath("models/obj/cerberus/");
  objLoader.loadAsync("Cerberus.obj").then((group) => {
    const textureLoader = new THREE.TextureLoader().setPath(
      "models/obj/cerberus/",
    );

    material.roughness = 1;
    material.metalness = 1;

    const diffuseMap = textureLoader.load("Cerberus_A.jpg", render);
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    material.map = diffuseMap;

    material.metalnessMap = material.roughnessMap = textureLoader.load(
      "Cerberus_RM.jpg",
      render,
    );
    material.normalMap = textureLoader.load("Cerberus_N.jpg", render);

    material.map.wrapS = THREE.RepeatWrapping;
    material.roughnessMap.wrapS = THREE.RepeatWrapping;
    material.metalnessMap.wrapS = THREE.RepeatWrapping;
    material.normalMap.wrapS = THREE.RepeatWrapping;

    group.traverse(function (child) {
      if (child.isMesh) {
        child.material = material;
      }
    });

    group.rotation.y = Math.PI / 2;
    group.position.x += 0.25;
    scene.add(group);

    if (ArcballGui.useGUI) {
      /**
       * @summary Makes a floating panel for controllers on the web.
       * Works as a drop-in replacement for dat.gui in most projects.
       * @class GUI
       * @memberof GUI
       */
      gui = new GUI();

      gui
        .add(cameraType, "type", cameras)
        .name("Choose Camera")
        .onChange(function () {
          setCamera(cameraType.type);
        });

      folderOptions = gui.addFolder("Arcball parameters");
      folderAnimations = folderOptions.addFolder("Animations");
    }

    /**
     * There is a problem when the camera position is set after the ArcballControls is created
     * using a mobile device. The model vanishes as soon as a Pan or Zoom is started.
     * One just need to move camera.position.set() after ArcballGui.setArcballControls() to trigger it.
     */
    ArcballGui.setArcballControls();
    // camera.position.set(0, 0, perspectiveDistance); //// <------
    // controls.update(); //// <----------

    /**
     * <p>Fired when a key is pressed.</p>
     *
     * <p>The {@link onKeyDown callback}
     * argument sets the callback that will be invoked when the event is dispatched.</p>
     *
     * @summary Appends an event listener for events whose type attribute value is keydown.
     * @param {KeyboardEvent} event a UIEvent.
     * @param {callback} function function to run when the event occurs.
     * @event keydown
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
     */
    window.addEventListener("keydown", onKeyDown);

    /**
     * <p>Fires when the document view (window) has been resized.</p>
     * <p>The {@link onWindowResize callback} argument sets the callback
     * that will be invoked when the event is dispatched.</p>
     * @summary Appends an event listener for events whose type attribute value is resize.
     * @param {Event} event a generic event.
     * @param {callback} function function to run when the event occurs.
     * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
     * @event resize
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
     */
    window.addEventListener("resize", onWindowResize);
  });
}

/**
 * Creates an orthographic camera.
 * @returns {THREE.OrthographicCamera} newCamera
 */
function makeOrthographicCamera() {
  const halfFovV = THREE.MathUtils.DEG2RAD * 45 * 0.5;
  const aspect = window.innerWidth / window.innerHeight;
  const halfFovH = Math.atan(aspect * Math.tan(halfFovV));

  const halfW = perspectiveDistance * Math.tan(halfFovH);
  const halfH = perspectiveDistance * Math.tan(halfFovV);
  const near = 0.01;
  const far = 2000;
  /**
   * Camera that uses othographic projection.
   * @class OrthographicCamera
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/cameras/OrthographicCamera OrthographicCamera}
   */
  const newCamera = new THREE.OrthographicCamera(
    -halfW,
    halfW,
    halfH,
    -halfH,
    near,
    far,
  );
  return newCamera;
}

/**
 * Creates a perspective camera.
 * @returns {THREE.PerspectiveCamera} newCamera
 */
function makePerspectiveCamera() {
  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.01;
  const far = 2000;
  const newCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return newCamera;
}

/**
 * <p>Fires when the document view (window) has been resized.</p>
 * Also resizes the canvas and viewport.
 * @callback onWindowResize
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
 */
function onWindowResize() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const aspect = w / h;
  if (camera.type == "OrthographicCamera") {
    const halfFovV = THREE.MathUtils.DEG2RAD * 45 * 0.5;
    const halfFovH = Math.atan(aspect * Math.tan(halfFovV));

    const halfW = perspectiveDistance * Math.tan(halfFovH);
    const halfH = perspectiveDistance * Math.tan(halfFovV);
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
  } else if (camera.type == "PerspectiveCamera") {
    camera.aspect = aspect;
  }

  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  render();
}

/**
 * Render a scene or another type of object using a camera.
 * @see {@link THREE.WebGLRenderer}
 */
function render() {
  renderer.render(scene, camera);
}

/**
 * <p>Copy the current state to clipboard (as a readable JSON text) when the "ctrl-c" key is pressed or <br>
 * set the controls state from the clipboard, assumming that the clipboard holds a JSON text file <br>
 * previously saved from .copyState when the "ctrl-v" key is pressed.</p>
 *
 * @param {KeyboardEvent} event a UIEvent.
 */
function onKeyDown(event) {
  if (event.key === "c") {
    if (event.ctrlKey || event.metaKey) {
      controls.copyState();
    }
  } else if (event.key === "v") {
    if (event.ctrlKey || event.metaKey) {
      controls.pasteState();
    }
  }
}

/**
 * Sets the camera type to either "Orthographic" or "Perspective".
 * @param {String} type camera type: "Orthographic" or "Perspective".
 */
function setCamera(type) {
  if (type == "Orthographic") {
    camera = makeOrthographicCamera();
    camera.position.set(0, 0, orthographicDistance);
  } else if (type == "Perspective") {
    camera = makePerspectiveCamera();
    camera.position.set(0, 0, perspectiveDistance);
  }
  controls.setCamera(camera);
  render();
}

/**
 * <p>Fires after both the mousedown and
 * mouseup events have fired (in that order).</p>
 * Reset button must be pressed and released while the pointer is located inside it.
 * <p>The {@link https://threejs.org/docs/#examples/en/controls/ArcballControls.reset callback}
 *   argument sets the callback that will be invoked when the event is dispatched.</p>
 * @summary Appends an event listener for events whose type attribute value is click.
 * @event clickReset
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
document.querySelector(".buttonToLink").addEventListener("click", () => {
  controls.reset();
});

/**
 * <p>Fired when the whole page has loaded, including all dependent resources
 * such as stylesheets, scripts, iframes, and images, except those that are loaded lazily.</p>
 * @summary Sets the {@link init entry point} of the application.
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 * @event load
 */
window.addEventListener("load", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  ArcballGui.useGUI = urlParams.get("gui");
  init();
});
