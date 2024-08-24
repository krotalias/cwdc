/**
 * @file
 *
 * Summary.
 *
 * <p>STL, OBJ, VTK and GLTF Viewer.</p>
 *
 * <p><b>For educational purposes only.</b></p>
 *
 * Uses {@link external:THREE Three.js} to load, display, and manipulate a model read from a
 * {@link https://threejs.org/examples/ file}.
 * The center of the model {@link https://threejs.org/docs/#api/en/math/Box3 bounding box}
 * is translated to the origin so a trackball can rotate the model.
 * <p>Four file formats are currently supported:</p>
 * <ol>
 * <li>{@link https://en.wikipedia.org/wiki/STL_(file_format) STL}
 * is a file format commonly used for 3D printing and computer-aided design (CAD).
 * The name STL is an acronym that stands for stereolithography — a popular 3D printing technology.
 * You might also hear it referred to as Standard Triangle Language or Standard Tessellation Language.</li>
 *
 * <p>STL does not support an indexed geometry. That is why it has multiple
 * duplicate vertices on all triangles ({@link https://www.geeksforgeeks.org/polygon-mesh-in-computer-graphics/ explicit representation}),
 * and each vertex borrows its normal from the triangle it belongs to.
 * As a consequence, at the same position,
 * there are multiple normal vectors. This leads to a non-smooth surface
 * when using the normal attribute for lighting calculation.
 * Therefore, some {@link loadModel magical} code is necessary to
 * <a href="/cwdc/13-webgl/examples/three/content/stl.html?file=Skull.stl">smooth</a>
 * the model by
 * applying {@link https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils.mergeVertices mergeVertices}
 * to its {@link https://threejs.org/docs/#api/en/core/BufferGeometry BufferGeometry}
 * followed by a
 * {@link https://threejs.org/docs/#api/en/core/BufferGeometry.computeVertexNormals recalculation}
 * of their normals.<p>
 *
 * <li>{@link https://en.wikipedia.org/wiki/Wavefront_.obj_file OBJ}
 * (or .OBJ) is a geometry definition file format first developed by Wavefront Technologies
 * for its Advanced Visualizer animation package.
 * The file format is open and has been adopted by other 3D graphics application vendors.
 * <p>{@link external:THREE.MTLLoader MTL file}, short for Material Template Library, is companion file format used in 3D computer graphics and modeling.
 * It is often associated with Wavefront OBJ file format,
 * which is common format for storing 3D models and their associated materials and textures.</p>
 * </li>
 *
 * <li>{@link https://docs.vtk.org/en/latest/design_documents/VTKFileFormats.html VTK}
 * provides a number of source and writer objects to read and write popular data file formats.
 * The Visualization Toolkit also provides some of its own file formats.
 * <p>The main reason for creating yet another data file format is to offer a consistent data representation scheme
 * for a variety of dataset types, and to provide a simple method to communicate data between software.</p>
 * </li>
 *
 * <li>{@link https://en.wikipedia.org/wiki/GlTF GLTF}
 * glTF (Graphics Library Transmission Format or GL Transmission Format and formerly known as WebGL Transmissions Format or WebGL TF)
 * is a standard file format for three-dimensional scenes and models.
 * A glTF file uses one of two possible file extensions: .gltf (JSON/ASCII) or .glb (binary).
 * Both .gltf and .glb files may reference external binary and texture resources.</li>
 *
 * </ol>
 *
 * @author Paulo Roma Cavalcanti
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @see <a href="/cwdc/13-webgl/examples/three/content/stl.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/stl.js">source</a>
 * @see {@link https://www.adobe.com/creativecloud/file-types/image/vector/stl-file.html#what-is-an-stl-file STL files}
 * @see {@link https://docs.fileformat.com/3d/mtl/ What is an MTL file?}
 * @see {@link https://www.donmccurdy.com/ Contact}
 * @see {@link https://free3d.com Free3D}
 * @see {@link https://sketchfab.com/feed Sketchfab}
 * @see {@link https://www.body3d.eu/3D/Navigation/ body3d}
 * @see <iframe title="Soldier" src="/cwdc/13-webgl/examples/three/content/stl.html?file=Soldier.glb" style="transform: scale(0.85); width: 380px; height: 380px"></iframe>
 */

"use strict";

import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { VTKLoader } from "three/addons/loaders/VTKLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { MeshEdgesGeometry } from "./MeshEdgesGeometry.js";

const drpath = "https://unpkg.com/three@latest/examples/jsm/libs/draco/gltf/";
const ktpath = "https://unpkg.com/three@latest/examples/jsm/libs/basis/";

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
 * Loads the viewer and starts the {@link runAnimation animation}.
 */
function init() {
  const canvas = document.getElementById("canvasid");

  /**
   * Color names mapping.
   * @type {Object<String:hexadecimal>}
   * @global
   */
  const colorTable = {
    gold: 0xffd700,
    antiqueWhite: 0xfaebd7,
    white: 0xffffff,
    grey: 0xfcfcfc,
  };

  // default model
  const defModel = document
    .getElementById("models")
    .querySelector("[selected]");

  /**
   * Array holding model file names to create models from.
   * @type {Array<String>}
   * @global
   */
  const models = [defModel ? defModel.text : ""];

  /**
   * Selected model number.
   * @type {Number}
   * @global
   */
  let modelCnt = defModel ? +defModel.value : 0;

  /**
   * Loaded model name.
   * @type {String}
   * @global
   */
  let loadedModelName = "";

  /**
   * The AnimationMixer is a player for animations on a particular object in the scene.
   * When multiple objects in the scene are animated independently,
   * one AnimationMixer may be used for each object.
   * @class AnimationMixer
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/animation/AnimationMixer Animation Mixer}
   */
  let mixer;

  /**
   * Object for keeping track of time. This uses performance.now if it is available,
   * otherwise it reverts to the less accurate Date.now.
   * @class Clock
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/core/Clock Clock}
   */
  const clock = new THREE.Clock();

  /**
   * Get model file names from an html &lt;select&gt; element
   * identified by "models".
   * @param {Array<String>} optionNames array of model file names.
   * @global
   */
  function getModels(optionNames) {
    optionNames.length = 0;
    const selectElement = document.getElementById("models");
    [...selectElement.options].map((o) => optionNames.push(o.text));
  }

  /**
   * Set model file names of an html &lt;select&gt; element identified by "models".
   * @param {Array<String>} optionNames array of model file names.
   * @global
   */
  function setModels(optionNames) {
    const sel = document.getElementById("models");

    let options_str = "";

    optionNames.forEach((img, index) => {
      options_str += `<option value="${index}">${img}</option>`;
    });

    sel.innerHTML = options_str;
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

  /**
   * Canvas aspect ratio.
   * @type {Number}
   * @global
   */
  const aspect = canvas.clientWidth / canvas.clientHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  // to avoid aliasing
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /**
   * Camera that uses perspective projection.
   * @class PerspectiveCamera
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   */
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 1000);
  handleWindowResize();

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
  controls.maxDistance = 3000;
  controls.minDistance = 0;
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
  const ambLight = new THREE.AmbientLight(colorTable.white, 3);

  const dirLight = new THREE.DirectionalLight(colorTable.white, 1.5);
  dirLight.position.set(200, 200, 1000);
  camera.add(dirLight.target);

  const mat = {};

  /**
   * <p>A material for non-shiny surfaces, without specular highlights.</p>
   *
   * The material uses a non-physically based Lambertian model for calculating reflectance.
   * This can simulate some surfaces (such as untreated wood or stone) well,
   * but cannot simulate shiny surfaces with specular highlights (such as varnished wood).
   *
   * <p>MeshLambertMaterial uses per-fragment shading.</p>
   *
   * @class MeshLambertMaterial
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/materials/MeshLambertMaterial MeshLambertMaterial}
   */
  mat["d"] = new THREE.MeshLambertMaterial({
    color: colorTable.gold,
    reflectivity: 2,
    side: THREE.DoubleSide,
  });

  /**
   * <p>A material for shiny surfaces with specular highlights.</p>
   *
   * The material uses a non-physically based Blinn-Phong model for calculating reflectance.
   * Unlike the Lambertian model used in the MeshLambertMaterial this can simulate
   * shiny surfaces with specular highlights (such as varnished wood).
   *
   * <p>MeshPhongMaterial uses per-fragment shading.</p>
   *
   * @class MeshPhongMaterial
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/materials/MeshPhongMaterial MeshPhongMaterial}
   */
  mat["p"] = new THREE.MeshPhongMaterial({
    color: colorTable.gold,
    shininess: 120,
    specular: colorTable.white,
    side: THREE.DoubleSide,
  });

  /**
   * <p>A standard physically based material, using Metallic-Roughness workflow.<p>
   *
   * <p>Physically based rendering (PBR) has recently become the standard in many 3D applications.
   * This approach differs from older approaches in that instead of using approximations
   * The idea is that, instead of tweaking materials to look good under specific lighting,
   * material can be created that will react 'correctly' under all lighting scenarios.</p>
   *
   * In practice this gives a more accurate and realistic looking result
   * than the MeshLambertMaterial at the cost of being somewhat more computationally expensive.
   *
   * <p>MeshStandardMaterial uses per-fragment shading.</p>
   * @class MeshStandardMaterial
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/materials/MeshStandardMaterial MeshStandardMaterial}
   */
  mat["g"] = new THREE.MeshStandardMaterial({
    color: colorTable.gold,
    roughness: 0.3,
    metalness: 0.8,
    side: THREE.DoubleSide,
  });

  /**
   * An extension of the MeshStandardMaterial, providing more advanced
   * physically-based rendering properties:
   * <ul>
   * <li>Anisotropy: Ability to represent the anisotropic property of materials as observable
   * with brushed metals.</li>
   * <li>Clearcoat: Some materials — like car paints, carbon fiber, and wet surfaces -
   *    require a clear, reflective layer on top of another layer that may be irregular or rough.
   *    Clearcoat approximates this effect, without the need for a separate transparent surface.</li>
   * <li>Iridescence: Allows to render the effect where hue varies depending on
   *   the viewing angle and illumination angle.
   *   This can be seen on soap bubbles, oil films, or on the wings of many insects.</li>
   * <li>Physically-based transparency: One limitation of .opacity is that
   *   highly transparent materials are less reflective. </li>
   * <li>Physically-based .transmission provides a more realistic option for thin,
   *   transparent surfaces like glass.</li>
   * <li>Advanced reflectivity: More flexible reflectivity for non-metallic materials.</li>
   * <li>Sheen: Can be used for representing cloth and fabric materials.</li>
   * </ul>
   *
   * <p>MeshPhysicalMaterial uses per-fragment shading.</p>
   * @class MeshPhysicalMaterial
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial MeshPhysicaldMaterial}
   * @see {@link https://www.youtube.com/watch?v=q63VhC3vYI0 Glass Objects with Physical Material}
   */
  mat["P"] = new THREE.MeshPhysicalMaterial({
    color: colorTable.white,
    transmission: 1.0,
    roughness: 0.0,
    ior: 1.7,
    thickness: 0.5,
    specularIntensity: 1.0,
    clearcoat: 1.0,
    side: THREE.DoubleSide,
  });

  /**
   * <p>A material for drawing wireframe-style geometries.<p>
   * @class LineBasicMaterial
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/materials/LineBasicMaterial LineBasicMaterial}
   */
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: colorTable.white,
    linewidth: 1,
  });

  /**
   * <p>Materials describe the appearance of objects.</p>
   * They are defined in a (mostly) renderer-independent way,
   * so you don't have to rewrite materials if you decide to use a different renderer.
   * @class external:THREE.Material
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/materials/Material Material}
   */

  /**
   * <p>Current material for STL or VTK files.</p>
   * @type {external:THREE.Material}
   * @global
   */
  let material =
    mat[document.querySelector('input[name="material"]:checked').value];

  /**
   * <p>Handles and keeps track of loaded and pending data.</p>
   * A default global instance of this class is created and used by loaders
   * if not supplied {@link https://threejs.org/docs/#api/en/loaders/managers/DefaultLoadingManager manually}.
   * <p>The main reason for using this class is to be able to implement a
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress progress bar}
   * as feedback to the user. Unfortunately, the manager reports the total number of files
   * loaded since its creation and not the number of files per model loaded.
   * Furthermore, this information passed along to
   * {@link https://threejs.org/docs/#api/en/loaders/managers/LoadingManager.onProgress onProress}
   * is not even trustworthy.
   * The best we can do is shadow the old image while the new one is being loaded.</p>
   * @class LoadingManager
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/loaders/managers/LoadingManager Loading Manager}
   * @see <img src="../Nefertiti.png" width="256">
   */
  const manager = new THREE.LoadingManager();
  const progressBar = document.getElementById("progress-bar");
  const progressBarLabel = document.getElementById("barLabel");
  const progressBarContainer = document.querySelector(
    ".progress-bar-container",
  );
  const percentage = (n, total) => Math.min(Math.round((n / total) * 100), 100);

  manager.onStart = (url, itemsLoaded, itemsTotal) => {
    progressBarContainer.style.display = "block";
    progressBar.value = percentage(itemsLoaded, itemsTotal);
    progressBarLabel.innerHTML = `Start loading ${itemsLoaded} in ${itemsTotal} ...`;
    console.log(
      `Started loading file: ${url} \nLoaded ${itemsLoaded} of ${itemsTotal} files.`,
    );
  };

  manager.onLoad = () => {
    progressBarContainer.style.display = "none";
    console.log("Loading Complete!");
  };

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressBar.value = percentage(itemsLoaded, itemsTotal);
    progressBarLabel.innerHTML = `Loading ${itemsLoaded} in ${itemsTotal} ...`;
    console.log(
      `Loading file: ${url} \nLoaded ${itemsLoaded} of ${itemsTotal} files.`,
    );
  };

  manager.onError = (url) => {
    console.log(`There was an error loading ${url}`);
  };

  /**
   * The STL model format is widely used for rapid prototyping, 3D printing and computer-aided manufacturing.
   * @class STLLoader
   * @memberof external:THREE
   * @see {@link https://sbcode.net/threejs/loaders-stl/ STL Model Loader}
   * @see {@link https://blog.arashtad.com/blog/load-stl-3d-models-in-three-js/ How to load STL 3d models in Three JS}
   * @see {@link https://stl-viewer.dualbox.com/ Free STL Viewer}
   * @see {@link https://www.dualbox.com/apps/myminifactory-ranger/production miniature configurators}
   * @see {@link https://www.dualbox.com DualBox}
   */
  const stl_loader = new STLLoader(manager);

  /**
   * VTK data sets can contain several types of lattice data and/or geometric figures.
   * The content of VTK files can be in ASCII text format or a mixed binary/ASCII format
   * in which headers and parameters are in ASCII format but the data values are in binary format.
   * @class VTKLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/examples/webgl_loader_vtk.html VTK Model Loader}
   */
  const vtk_loader = new VTKLoader(manager);

  /**
   * <p>A loader for loading a .obj resource.</p>
   * The OBJ file format is a simple data-format that represents 3D geometry in a
   * human readable format as the position of each vertex,
   * the UV position of each texture coordinate vertex, vertex normals,
   * and the faces that make each polygon defined as a list of vertices, and texture vertices.
   * @class OBJLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/OBJLoader obj_loader Model Loader}
   * @see {@link https://imagetostl.com/convert/file/glb/to/obj Convert Your 3D Mesh/Model GLB Files to OBJ}
   */
  const obj_loader = new OBJLoader(manager);

  /**
   * <p>A loader for loading an .mtl resource, used internally by OBJLoader.</p>
   * The Material Template Library format (MTL) or .MTL File Format is a
   * companion file format to .OBJ that describes surface shading (material)
   * properties of objects within one or more .OBJ files.
   * @class MTLLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/MTLLoader mtl_loader Material Loader}
   * @see {@link https://paulbourke.net/dataformats/mtl/ MTL material format (Lightwave, OBJ)}
   */
  const mtl_loader = new MTLLoader(manager);

  /**
   * <p>A loader for geometry compressed with the Draco library.</p>
   * Draco is an open source library for compressing and decompressing 3D meshes and point clouds.
   * Compressed geometry can be significantly smaller, at the cost of additional decoding time on the client device.
   * @class DRACOLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/DRACOLoader DRACO Loader}
   * @see {@link https://opensource.googleblog.com/2017/01/introducing-draco-compression-for-3d.html Google Open Source Blog}
   * @see {@link https://github.com/google/draco github}
   */
  const draco_loader = new DRACOLoader();
  draco_loader.setDecoderPath(drpath);

  /**
   * <p>Loader for KTX 2.0 GPU Texture containers.</p>
   * KTX 2.0 is a container format for various GPU texture formats.
   * The loader supports Basis Universal GPU textures, which can be quickly
   * transcoded to a wide variety of GPU texture compression formats.
   * While KTX 2.0 also allows other hardware-specific formats,
   * this loader does not yet parse them.
   * <p>This loader parses the KTX 2.0 container and transcodes to a
   * supported GPU compressed texture format.
   * The required WASM transcoder and JS wrapper are available from
   * the examples/jsm/libs/basis directory.</p>
   * @class KTX2Loader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/KTX2Loader KTX2 Loader}
   * @see {@link https://gdal.org/drivers/raster/ktx2.html GDAL KTX2}
   * @see {@link https://github.com/BinomialLLC/basis_universal github}
   * @see {@link https://threejs.org/examples/?q=gltf#webgl_loader_gltf_compressed GLTFLoader}
   */
  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath(ktpath)
    .detectSupport(renderer);

  /**
   * <p>A loader for glTF 2.0 resources.</p>
   glTF (GL Transmission Format) is an open format specification for efficient delivery and loading of 3D content.
   Assets may be provided either in JSON (.gltf) or binary (.glb) format. External files store textures (.jpg, .png)
   and additional binary data (.bin). A glTF asset may deliver one or more scenes,
   including meshes, materials, textures, skins, skeletons, morph targets, animations, lights, and/or cameras.
   * @class GLTFLoader
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#examples/en/loaders/GLTFLoader GLTF Loader}
   * @see {@link https://gltf-viewer.donmccurdy.com glTF Viewer}
   * @see {@link https://gltf.report gltf Report}
   */
  const gltfl_loader = new GLTFLoader(manager);
  gltfl_loader.setDRACOLoader(draco_loader);
  gltfl_loader.setKTX2Loader(ktx2Loader);
  gltfl_loader.setMeshoptDecoder(MeshoptDecoder);

  /**
   * This class generates a Prefiltered, Mipmapped Radiance Environment Map (PMREM)
   * from a cubeMap environment texture.
   * This allows different levels of blur to be quickly accessed based on material roughness.
   * Unlike a traditional mipmap chain, it only goes down to the LOD_MIN level (above),
   * and then creates extra even more filtered 'mips' at the same LOD_MIN resolution,
   * associated with higher roughness levels.
   * In this way we maintain resolution to smoothly interpolate diffuse lighting while
   * limiting sampling computation.
   * @class PMREMGenerator
   * @memberof external:THREE
   * @see {@link https://threejs.org/docs/#api/en/extras/PMREMGenerator PMREMGenerator}
   */
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.background = new THREE.Color(colorTable.antiqueWhite);
  scene.environment = pmremGenerator.fromScene(
    /**
     * This is an easy way of lighting a scene
     * by creating six light sources with different intensities using an "area light material".
     * @class RoomEnvironment
     * @extends {external:THREE.Scene}
     * @memberof external:THREE
     * @see {@link https://github.com/mrdoob/three.js/blob/master/examples/jsm/environments/RoomEnvironment.js RoomEnvironment}
     * @see {@link https://threejs.org/docs/#api/en/extras/PMREMGenerator.fromScene PMREMGenerator}
     * @see {@link https://threejs.org/examples/#misc_exporter_usdz USDZ exporter}
     */
    new RoomEnvironment(renderer),
    0.04,
  ).texture;

  let diag = 0;
  let mesh = undefined;
  let line = undefined;
  // .obj file
  let lines = [];
  let object = undefined;

  /**
   * <p>Callback to load a model from a file to the scene.<p>
   * The previous model loaded is
   * {@link https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects disposed}
   * of; that is, we try to release its geometry and material objects since they are no longer used.
   * {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderTarget Render Targets}
   * allocate some resources needed by the shaders and should also be released.
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
      object.traverse(function (child) {
        if (child.isMesh) {
          child.geometry.dispose();
        }
      });
      object = undefined;
      scene.remove(ambLight);
    }
    camera.remove(dirLight);
    if (geometry.isBufferGeometry) {
      // stl, vtk
      if (
        !geometry.index &&
        ["Utah_teapot_(solid).stl", "Skull.stl"].some(
          (str) => str == loadedModelName,
        )
      ) {
        geometry.deleteAttribute("normal");
        geometry = BufferGeometryUtils.mergeVertices(geometry, 1e-4);
      }
      if (!geometry.getAttribute("normal")) {
        geometry.computeVertexNormals();
      }
      geometry.center();
      geometry.computeBoundingBox();
      diag = geometry.boundingBox.max.distanceTo(geometry.boundingBox.min);

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);

      scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geometry);
      line = new THREE.LineSegments(edges, edgeMaterial);
      scene.add(line);
      camera.add(dirLight);
      line.visible = vis ? vis : false;
    } else if (geometry.scene) {
      // gltf file
      const model = geometry.scene;
      const bb = new THREE.Box3().setFromObject(model);
      diag = bb.max.distanceTo(bb.min);
      const center = new THREE.Vector3();
      bb.getCenter(center);
      // Nerfertiti.glb - what a hack!!
      if (geometry.asset.generator.includes("MOPS CLI")) {
        model.traverse(function (child) {
          if (child.isMesh) {
            child.material.normalMapType = THREE.ObjectSpaceNormalMap;
            child.geometry.deleteAttribute("normal");
            child.material.side = THREE.DoubleSide;
            console.log(child.name);
          }
        });
      }
      model.position.set(...center.negate());
      try {
        line = new THREE.LineSegments(
          new MeshEdgesGeometry(model),
          edgeMaterial,
        );
      } catch (error) {
        console.error(error);
        return;
      }
      line.visible = vis ? vis : false;
      scene.add(line);
      scene.add(model);
      if (
        !(
          geometry.asset.extras !== undefined &&
          geometry.asset.extras.title !== undefined &&
          ["Supermarine Spitfire", "Battle Damaged Sci-fi Helmet"].some(
            (str) => str === geometry.asset.extras.title,
          )
        ) &&
        !["model.gltf", "Brain", "Lungs", "Uro"].some((str) =>
          loadedModelName.includes(str),
        )
      ) {
        scene.add(ambLight);
      }
      object = model;
      if (geometry.animations[0]) {
        mixer = new THREE.AnimationMixer(model);

        if (geometry.animations[3]) {
          // Soldier.glb
          mixer
            .clipAction(geometry.animations[0])
            .setEffectiveWeight(0.0)
            .play();
          mixer
            .clipAction(geometry.animations[3])
            .setEffectiveWeight(1.0)
            .play();
          mixer
            .clipAction(geometry.animations[1])
            .setEffectiveWeight(0.0)
            .play();
        } else {
          mixer.clipAction(geometry.animations[0]).play();
        }
      }
    } else {
      // OBJ file
      const bb = new THREE.Box3().setFromObject(geometry);
      diag = bb.max.distanceTo(bb.min);
      const center = new THREE.Vector3();
      bb.getCenter(center);

      geometry.position.set(...center.negate());
      try {
        line = new THREE.LineSegments(
          new MeshEdgesGeometry(geometry),
          edgeMaterial,
        );
      } catch (error) {
        console.error(error);
        return;
      }
      line.visible = vis ? vis : false;
      scene.add(line);
      scene.add(geometry);
      if (
        ["male02.mtl", "littlesttokyo.mtl"].some(
          (str) => str === geometry.materialLibraries[0],
        )
      ) {
        scene.add(ambLight);
      }
      camera.add(dirLight);
      object = geometry;
    }
    handleKeyPress(createEvent("o"));
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
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
    stats.update();
  }

  /**
   * <p>Closure for keydown events.</p>
   * @function
   * @global
   * @return {key_event} callback for handling a keyboard event.
   */
  const handleKeyPress = (() => {
    const mod = (n, m) => ((n % m) + m) % m;
    let visible = false;
    const modelPath = "models";

    /**
     * <p>Handler for keydown events.</p>
     * Selects the next/previous {@link models model}
     * or turns {@link external:THREE.Stats stats} and mesh visible/invisible
     * when pressing keys ("n","N") or ("s","m"), respectively.<br>
     * @param {KeyboardEvent} event keyboard event.
     * @callback key_event callback to handle a key pressed.
     */
    return (event) => {
      const ch = event.key;
      switch (ch) {
        case "n":
        case "N":
        case "k":
          if (ch == "k") {
            modelCnt = +document.getElementById("models").value;
          } else {
            const incr = ch == "n" ? 1 : -1;
            modelCnt = mod(modelCnt + incr, models.length);
            document.getElementById("models").value = modelCnt;
          }
          const model = models[modelCnt];
          loadedModelName = model;
          if (model.includes(".vtk")) {
            vtk_loader.load(`${modelPath}/vtk/${model}`, loadModel);
          } else if (model.includes(".stl")) {
            stl_loader.load(`${modelPath}/stl/${model}`, loadModel);
          } else if (model.includes(".glb") || model.includes(".gltf")) {
            gltfl_loader.load(`${modelPath}/glb/${model}`, loadModel);
          } else {
            if (model === "LittlestTokyo/LittlestTokyo.obj") {
              mtl_loader.setMaterialOptions({ side: THREE.FrontSide });
            } else {
              mtl_loader.setMaterialOptions({ side: THREE.DoubleSide });
            }
            mtl_loader.load(
              `${modelPath}/obj/${model}`.replace(".obj", ".mtl"),
              (materials) => {
                materials.preload();
                obj_loader.setMaterials(materials);
                obj_loader.load(`${modelPath}/obj/${model}`, loadModel);
              },
            );
          }
          break;
        case "s":
          visible = !visible;
          if (visible) stats.dom.style.display = "block";
          else stats.dom.style.display = "none";
          document.getElementById("stats").checked = visible;
          break;
        case "m":
          if (line) line.visible = !line.visible;
          if (lines.length > 0) {
            for (const line of lines) {
              line.visible = !line.visible;
            }
          }
          document.getElementById("mesh").checked = line.visible;
          break;
        case "o":
          controls.reset();
          // 1.6 is enough, but dont't forget the zoom out
          camera.far = diag * 5;
          camera.near = diag * 0.05;
          camera.position.set(0, 0, diag * 1.1);
          controls.maxDistance = camera.far;
          camera.updateProjectionMatrix();
          break;
        case "d":
        case "g":
        case "p":
        case "P":
          material = mat[ch];
          document.getElementById(ch).checked = true;
          if (mesh) {
            mesh.material = material;
          }
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
    const code = key.charCodeAt();
    return new KeyboardEvent("keydown", {
      key: key,
      which: code,
      charCode: code,
      keyCode: code,
    });
  };

  /**
   * <p>Fires when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @callback handleWindowResize
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
   */
  function handleWindowResize() {
    let h = window.innerHeight - 20;
    let w = window.innerWidth - 20;
    const r = document.querySelector(":root");
    if (h > w) {
      h = w / aspect;
    } else {
      w = h * aspect;
    }
    renderer.setSize(w, h);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    r.style.setProperty("--canvasw", `${w}px`);
    r.style.setProperty("--canvash", `${h}px`);
  }

  /**
   * <p>Appends an event listener for events whose type attribute value is resize.</p>
   * <p>The {@link handleWindowResize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @param {Event} event the document view is resized.
   * @param {callback} function function to run when the event occurs.
   * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
   * @event resize - executed when the window is resized.
   */
  window.addEventListener("resize", handleWindowResize, false);

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

  /**
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed when the mesh checkbox is is checked or unchecked.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document
    .getElementById("mesh")
    .addEventListener("change", (event) => handleKeyPress(createEvent("m")));

  if (document.querySelector('input[name="material"]')) {
    document.querySelectorAll('input[name="material"]').forEach((elem) => {
      /**
       * <p>Appends an event listener for events whose type attribute value is change.<br>
       * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
       * the event is dispatched.</p>
       *
       * @event change - executed when the material input radio is checked (but not when unchecked).
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
       */
      elem.addEventListener("change", function (event) {
        const item = event.target.value;
        handleKeyPress(createEvent(item));
      });
    });
  }

  /**
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed when the stats checkbox is is checked or unchecked.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document
    .getElementById("stats")
    .addEventListener("change", (event) => handleKeyPress(createEvent("s")));

  /** <p>Appends an event listener for events whose type attribute value is click.<br>
   * The {@link handleKeyPress callback} argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event click - reset button: fires after both the mousedown and mouseup events have fired (in that order).
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
   */
  document
    .getElementById("reset")
    .addEventListener("click", (event) => handleKeyPress(createEvent("o")));

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let dfile = urlParams.get("file");

  const initialModel = models[0];
  getModels(models);
  models.sort();
  setModels(models);
  modelCnt = models.indexOf(dfile ? dfile : initialModel);
  document.getElementById("models").value = modelCnt;
  handleKeyPress(createEvent("k"));
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
