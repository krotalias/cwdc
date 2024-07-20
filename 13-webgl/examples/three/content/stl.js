/**
 * @file
 *
 * Summary.
 *
 * <p>STL Viewer.</p>
 * STL is a file format commonly used for 3D printing and computer-aided design (CAD).
 * The name STL is an acronym that stands for stereolithography — a popular 3D printing technology.
 * You might also hear it referred to as Standard Triangle Language or Standard Tessellation Language.
 *
 * @author Paulo Roma Cavalcanti
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @see <a href="/cwdc/13-webgl/examples/three/content/stl.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/stl.js">source</a>
 * @see {@link https://www.adobe.com/creativecloud/file-types/image/vector/stl-file.html#what-is-an-stl-file STL files}
 * @see {@link https://en.wikipedia.org/wiki/STL_(file_format) STL (file format)}
 * @see <iframe title="Cube in a Dodecahedron" src="/cwdc/13-webgl/examples/three/content/stl.html" style="transform: scale(0.85); width: 380px; height: 380px"></iframe>
 */

"use strict";

import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";

/**
 * Three.js module.
 * @external THREE
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 */

/**
 * <p>A representation of mesh, line, or point geometry.</p>
 * Includes vertex positions, face indices, normals, colors, UVs,
 * and custom attributes within buffers, reducing the cost of
 * passing all this data to the GPU.
 * @class BufferGeometry
 * @memberof external:THREE
 * @see https://threejs.org/docs/#api/en/core/BufferGeometry
 */

/**
 * Loads the viewer and starts the animation.
 */
function init() {
  const obj = document.getElementById("canvasid");

  const colorTable = {
    gold: 0xffd700,
    antiqueWhite: 0xfaebd7,
    white: 0xffffff,
    grey: 0xfcfcfc,
  };

  /**
   * Array of model names.
   * @type {Array<String>}
   * @global
   */
  const models = [
    "Dodecahedron_Cube_A.stl",
    "Dodecahedron_Cube_B.stl",
    "Dodecahedron_Cube_C.stl",
    "Dodecahedron_Cube_D.stl",
    "Dodecahedron_Cube_E.stl",
    "Utah_teapot_(solid).stl",
  ];

  /**
   * The WebGL renderer displays your beautifully crafted scenes using WebGL.
   * @class WebGLRenderer
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: obj,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(colorTable.antiqueWhite, 1.0);
  renderer.setSize(obj.clientWidth, obj.clientHeight);

  /**
   * Camera that uses perspective projection.
   * @class PerspectiveCamera
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   */
  const camera = new THREE.PerspectiveCamera(
    45,
    obj.clientWidth / obj.clientHeight,
    0.01,
    1000,
  );

  /**
   * <p>TrackballControls is similar to OrbitControls.</p>
   * However, it does not maintain a constant camera up vector.
   * That means if the camera orbits over the “north” and “south” poles,
   * it does not flip to stay "right side up".
   * @class TrackballControls
   * @memberof external:THREE
   * @see https://threejs.org/docs/#examples/en/controls/TrackballControls
   */
  const controls = new TrackballControls(camera, obj);
  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 5;
  controls.panSpeed = 2;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.handleResize();

  /**
   * <p>Scenes allow you to set up what and where is to be rendered by three.js.</p>
   * This is where you place objects, lights and cameras.
   * @class Scene
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/scenes/Scene
   */
  const scene = new THREE.Scene();
  scene.add(camera);

  // light
  const dirLight = new THREE.DirectionalLight(colorTable.white);
  dirLight.position.set(200, 200, 1000).normalize();
  camera.add(dirLight);
  camera.add(dirLight.target);

  // load model material
  const material = new THREE.MeshLambertMaterial({
    color: colorTable.gold,
    side: THREE.DoubleSide,
  });

  /**
   * The STL model format is widely used for rapid prototyping, 3D printing and computer-aided manufacturing.
   * @class STLLoader
   * @memberof external:THREE
   * @see {@link https://sbcode.net/threejs/loaders-stl/ STL Model Loader}
   * @see {@link https://blog.arashtad.com/blog/load-stl-3d-models-in-three-js/ How to load STL 3d models in Three JS}
   */
  const loader = new STLLoader();
  let mesh = undefined;

  /**
   * Loads a model to the scene.
   * @param {external:THREE.BufferGeometry} geometry model.
   * @global
   */
  function loadModel(geometry) {
    // console.log(geometry);
    geometry.center();
    geometry.computeVertexNormals();

    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
    }
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    const diag = geometry.boundingBox.max.distanceTo(geometry.boundingBox.min);
    camera.position.set(0, 0, diag * 1.1);
  }

  loader.load("models/stl/" + models[3], loadModel);

  /**
   * <p>When developing a Three.js application,
   * it is useful to understand how the performance changes as the code is developed.</p>
   * To achieve this purpose, a statistics panel can be added to the HTML document that outlines several properties,
   * such as the frames per second and how long a section of code takes to execute.
   * @class Stats
   * @memberof external:THREE
   * @see {@link https://sbcode.net/threejs/stats-panel/ Stats Panel}
   * @see {@link https://www.tutorialspoint.com/threejs/threejs_stats.htm Three.js - Stats}
   */
  const stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "10px";
  stats.domElement.style.top = "10px";
  document.body.appendChild(stats.dom);
  stats.dom.style.display = "none";

  /**
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop renderer.setAnimationLoop}
   * parameter is a {@link runAnimation callback}, which
   * will be called every available frame.<br>
   * If null is passed, it will stop any already ongoing animation.
   * @param {function} loop callback.
   * @function
   * @name setAnimationLoop
   * @global
   */
  renderer.setAnimationLoop(() => {
    runAnimation();
  });

  /**
   * <p>Animation loop.</p>
   * Updates {@link external:THREE.TrackballControls controls},
   * renders the {@link external:THREE.Scene scene} and updates {@link external:THREE.Stats statistics}.
   * @global
   */
  function runAnimation() {
    controls.update();
    renderer.render(scene, camera);
    stats.update();
  }

  /**
   * <p>Closure for keydown events.</p>
   * Selects the next/previous {@link models model}
   * or turns {@link external:THREE.Stats stats} visible/invisible,
   * when pressing keys ("n","N") or ("s") respectively.<br>
   * @param {KeyboardEvent} event keyboard event.
   * @function
   * @global
   * @return {key_event} callback for handling a keyboard event.
   */
  const handleKeyPress = ((event) => {
    const mod = (n, m) => ((n % m) + m) % m;
    let modelCnt = 3;
    let visible = false;

    /**
     * <p>Handler for keydown events.</p>
     * @param {KeyboardEvent} event keyboard event.
     * @callback key_event callback to handle a key pressed.
     */
    return (event) => {
      const ch = event.key;
      switch (ch) {
        case "n":
        case "N":
          let incr = ch == "n" ? 1 : -1;
          modelCnt = mod(modelCnt + incr, models.length);
          loader.load("models/stl/" + models[modelCnt], loadModel);
          break;
        case "s":
          visible = !visible;
          if (visible) stats.dom.style.display = "block";
          else stats.dom.style.display = "none";
          break;
      }
    };
  })();

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event keydown
   */
  window.addEventListener("keydown", (event) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        event.code,
      ) > -1
    ) {
      event.preventDefault();
    }
    handleKeyPress(event);
  });
}

/**
 * <p>Sets the {@link init load callback function}.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event load event}
 * @event load
 */
window.addEventListener("load", (event) => {
  init();
});
