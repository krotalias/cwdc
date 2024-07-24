/**
 * @file
 *
 * Summary.
 *
 * <p>STL, OBJ and VTK Viewer.</p>
 * <ol>
 * <li>{@link https://en.wikipedia.org/wiki/STL_(file_format) STL}
 * is a file format commonly used for 3D printing and computer-aided design (CAD).
 * The name STL is an acronym that stands for stereolithography — a popular 3D printing technology.
 * You might also hear it referred to as Standard Triangle Language or Standard Tessellation Language.</li>
 *
 * <li>{@link https://en.wikipedia.org/wiki/Wavefront_.obj_file OBJ}
 * (or .OBJ) is a geometry definition file format first developed by Wavefront Technologies
 * for its Advanced Visualizer animation package.
 * The file format is open and has been adopted by other 3D graphics application vendors.</li>
 *
 * <li>{@link https://docs.vtk.org/en/latest/design_documents/VTKFileFormats.html VTK}
 * provides a number of source and writer objects to read and write popular data file formats.
 * The Visualization Toolkit also provides some of its own file formats.
 * The main reason for creating yet another data file format is to offer a consistent data representation scheme
 * for a variety of dataset types, and to provide a simple method to communicate data between software.</li>
 *
 * </ol>
 *
 * @author Paulo Roma Cavalcanti
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @see <a href="/cwdc/13-webgl/examples/three/content/stl.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/stl.js">source</a>
 * @see {@link https://www.adobe.com/creativecloud/file-types/image/vector/stl-file.html#what-is-an-stl-file STL files}
 * @see <iframe title="Cube in a Dodecahedron" src="/cwdc/13-webgl/examples/three/content/stl.html" style="transform: scale(0.85); width: 380px; height: 380px"></iframe>
 */

"use strict";

import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { VTKLoader } from "three/addons/loaders/VTKLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
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
  const canvas = document.getElementById("canvasid");

  const colorTable = {
    gold: 0xffd700,
    antiqueWhite: 0xfaebd7,
    white: 0xffffff,
    grey: 0xfcfcfc,
  };

  /**
   * Array holding model file names to create models from.
   * @type {Array<String>}
   */
  const models = [
    document.getElementById("models").querySelector("[selected]").text || "",
  ];

  /**
   * Selected model number.
   * @type {Number}
   */
  let modelCnt =
    +document.getElementById("models").querySelector("[selected]").value || 3;

  /**
   * Get model file names from an html &lt;select&gt; element
   * identified by "models".
   * @param {Array<String>} optionNames array of model file names.
   */
  function getModels(optionNames) {
    optionNames.length = 0;
    const selectElement = document.getElementById("models");
    [...selectElement.options].map((o) => optionNames.push(o.text));
  }

  /**
   * The WebGL renderer displays your beautifully crafted scenes using WebGL.
   * @class WebGLRenderer
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(colorTable.antiqueWhite, 1.0);

  /**
   * Camera that uses perspective projection.
   * @class PerspectiveCamera
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   */
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
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
  const controls = new TrackballControls(camera, canvas);
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

  // model material
  const material = new THREE.MeshLambertMaterial({
    color: colorTable.gold,
    side: THREE.DoubleSide,
  });

  // edge material
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  /**
   * The STL model format is widely used for rapid prototyping, 3D printing and computer-aided manufacturing.
   * @class STLLoader
   * @memberof external:THREE
   * @see {@link https://sbcode.net/threejs/loaders-stl/ STL Model Loader}
   * @see {@link https://blog.arashtad.com/blog/load-stl-3d-models-in-three-js/ How to load STL 3d models in Three JS}
   */
  const stl_loader = new STLLoader();

  /**
   * VTK data sets can contain several types of lattice data and/or geometric figures.
   * The content of VTK files can be in ASCII text format or a mixed binary/ASCII format
   * in which headers and parameters are in ASCII format but the data values are in binary format.
   * @class VTKLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/examples/webgl_loader_vtk.html VTK Model Loader}
   */
  const vtk_loader = new VTKLoader();

  /**
   * <p>A loader for loading a .obj resource.</p>
   * The OBJ file format is a simple data-format that represents 3D geometry in a
   * human readable format as the position of each vertex,
   * the UV position of each texture coordinate vertex, vertex normals,
   * and the faces that make each polygon defined as a list of vertices, and texture vertices.
   * @class OBJLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/OBJLoader obj_loader Model Loader}
   */
  const obj_loader = new OBJLoader();

  /**
   * <p>A loader for loading an .mtl resource, used internally by OBJLoader.</p>
   * The Material Template Library format (MTL) or .MTL File Format is a
   * companion file format to .OBJ that describes surface shading (material)
   * properties of objects within one or more .OBJ files.
   * @class MTLLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/MTLLoader mtl_loader Material Loader}
   */
  const mtl_loader = new MTLLoader();

  let diag = 0;
  let mesh = undefined;
  let line = undefined;
  // .obj file
  let lines = [];
  let object = undefined;

  /**
   * Callback to load a model from a file to the scene.
   * @param {external:THREE.BufferGeometry} geometry model.
   * @global
   */
  function loadModel(geometry) {
    // console.log(geometry);

    let vis = undefined;
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh = undefined;
    }
    if (line) {
      scene.remove(line);
      line.geometry.dispose();
      vis = line.visible;
      line = undefined;
    }
    if (lines.length > 0) {
      for (const line of lines) {
        scene.remove(line);
        line.geometry.dispose();
      }
      vis = lines[0].visible;
      lines = [];
    }
    if (object) {
      scene.remove(object);
      object = undefined;
    }
    if (geometry.isBufferGeometry) {
      geometry.center();
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geometry);
      line = new THREE.LineSegments(edges, edgeMaterial);
      scene.add(line);
      line.visible = vis ? vis : false;
      diag = geometry.boundingBox.max.distanceTo(geometry.boundingBox.min);
    } else {
      // OBJ file
      let bb = new THREE.Box3().setFromObject(geometry);
      diag = bb.max.distanceTo(bb.min);
      let center = new THREE.Vector3(0);
      bb.getCenter(center);
      geometry.position.set(-center.x, -center.y, -center.z);
      geometry.traverse(function (child) {
        if (child.isMesh) {
          //child.material = material;
          const edges = new THREE.EdgesGeometry(child.geometry);
          const line = new THREE.LineSegments(edges, edgeMaterial);
          line.position.set(-center.x, -center.y, -center.z);
          scene.add(line);
          lines.push(line);
          line.visible = vis ? vis : false;
        }
      });
      scene.add(geometry);
      object = geometry;
    }
    controls.reset();
    camera.position.set(0, 0, diag * 1.1);
  }

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

  getModels(models);

  stl_loader.load("models/stl/" + models[modelCnt], loadModel);

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
   * Selects the next/previous {@link models model},
   * or turns {@link external:THREE.Stats stats} and mesh visible/invisible,
   * when pressing keys ("n","N") or ("s","m") respectively.<br>
   * @function
   * @global
   * @return {key_event} callback for handling a keyboard event.
   */
  const handleKeyPress = (() => {
    const mod = (n, m) => ((n % m) + m) % m;
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
        case "k":
          let incr = ch == "n" ? 1 : -1;
          if (ch == "k") {
            modelCnt = +document.getElementById("models").value;
            incr = 0;
          }
          modelCnt = mod(modelCnt + incr, models.length);
          if (models[modelCnt].includes(".vtk")) {
            vtk_loader.load("models/vtk/" + models[modelCnt], loadModel);
          } else if (models[modelCnt].includes(".stl")) {
            stl_loader.load("models/stl/" + models[modelCnt], loadModel);
          } else {
            mtl_loader.setMaterialOptions({ side: THREE.DoubleSide });
            mtl_loader.load(
              "models/obj/" + models[modelCnt].replace(".obj", ".mtl"),
              (materials) => {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load("models/obj/" + models[modelCnt], loadModel);
              },
            );
          }
          break;
        case "s":
          visible = !visible;
          if (visible) stats.dom.style.display = "block";
          else stats.dom.style.display = "none";
          break;
        case "m":
          if (line) line.visible = !line.visible;
          if (lines.length > 0) {
            for (const line of lines) {
              line.visible = !line.visible;
            }
          }
          break;
        case "o":
          controls.reset();
          camera.position.set(0, 0, diag * 1.1);
          break;
      }
    };
  })();

  /**
   * Returns a new keyboard event
   * that can be passed to {@link handleKeyPress}.
   * @param {String} key char code.
   * @returns {KeyboardEvent} a keyboard event.
   */
  const createEvent = (key) => {
    let code = key.charCodeAt();
    return new KeyboardEvent("keydown", {
      key: key,
      which: code,
      charCode: code,
      keyCode: code,
    });
  };

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

  /**
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed when the models &lt;select&gt; is changed.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document
    .getElementById("models")
    .addEventListener("change", (event) => handleKeyPress(createEvent("k")));
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
