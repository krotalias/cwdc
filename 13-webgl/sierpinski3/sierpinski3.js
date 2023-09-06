/**
 * @file
 *
 * In this script, you can render a 3d IFS
 * (<a href="https://en.wikipedia.org/wiki/Iterated_function_system">Iterated Function System</a>)
 * that was modeled with the Three.js editor, and exported as a scene JSON. <br>
 * One such example is included in <a href="../sierpinski3/models/sierpinski3.json">sierpinski3.json</a> file.
 *
 * <p>The <a href="../sierpinski3/mat.html">transformations</a> corresponding to the
 * <a href="https://larryriddle.agnesscott.org/ifs/siertri/siertri.htm">IFS</a>
 * correspond to those objects that have a name starting with "copy". <br>
 * In the example included, there are 4 of these, named "copy1" ... "copy4".</p>
 *
 * <p>Selecting a "Max Level" bigger than 0 in the interface will create recursive
 * copies of these objects, up to the given level, <br>
 * whereas the other objects are rendered unchanged.</p>
 *
 * @author Claudio Esperança and Paulo Roma
 * @since 23/06/2022
 * @see <a href="/cwdc/13-webgl/sierpinski3/sierpinski3.html?file=crystal.json">link</a>
 * @see <a href="/cwdc/13-webgl/sierpinski3/sierpinski3.js">source</a>
 * @see https://observablehq.com/@esperanc/iterated-function-systems?collection=@esperanc/computacao-grafica
 * @see https://observablehq.com/d/1e035729ed562001
 * @see https://threejs.org/editor
 * @see https://stackoverflow.com/questions/68528251/three-js-error-during-additional-components-importing
 * @see https://dplatz.de/blog/2019/es6-bare-imports.html
 */

import * as THREE from "https://unpkg.com/three@0.148.0/build/three.module.js?module";
import { OrbitControls } from "https://unpkg.com/three@0.148.0/examples/jsm/controls/OrbitControls.js?module";

//import * as THREE from "three";
//import { OrbitControls } from "OrbitControls";

/**
 * Creates a Sierpiński gasket given a json object with
 * four <a href="https://www.qfbox.info/4d/tetrahedron">tetrahedra</a>.
 *
 * <p>The gasket will have 4<sup>mlevel+1</sup> tetrahedra.</p>
 *
 * <ul>
 *  <li>4**0 copy1 4**0 copy2 4**0 copy3 4**0 copy4 ... 16 blocks (color level 0)</li>
 *  <li>4**1 copy1 4**1 copy2 4**1 copy3 4**1 copy4 ... 08 blocks (color level 1)</li>
 *  <li>4**2 copy1 4**2 copy2 4**2 copy3 4**2 copy4 ... 04 blocks (color level 2)</li>
 *  <li>4**3 copy1 4**3 copy2 4**3 copy3 4**3 copy4 ... 02 blocks (color level 3)</li>
 * </ul>
 *
 * @param {THREE.Object3D} loadedScene json object.
 * @param {Number} maxLevel maximum recursion level.
 * @param {Number} colorLevel all objects of level colorLevel will have the same color.
 * @returns {THREE.Object3D} a new scene with a gasket of the given level.
 * @see https://en.wikipedia.org/wiki/Sierpiński_triangle
 * @see https://threejs.org/docs/#api/en/core/Object3D
 * @see https://www.codingem.com/javascript-clone-object/
 */
var fractalScene = (loadedScene, maxLevel = 0, colorLevel = 0) => {
  let scene = loadedScene.clone();

  // create an array with the four initial copies
  let copies = scene.children.filter(
    (child) => child.name.slice(0, 4) == "copy"
  );
  // remove all four copies from the scene
  scene.remove(...copies);

  // initial level with only four copies
  let currentLevel = copies.map((copy) => {
    let obj = copy.clone();
    obj.matrixAutoUpdate = false;
    return obj;
  });

  for (let level = 1; level <= maxLevel; level++) {
    let nextLevel = [];
    // create a next level with 4 * currentLevel.length tets
    for (let copy of copies) {
      // for each obj in this level generate four more
      // using either its matrix or its original's copy matrix
      // for coloring objs
      nextLevel = nextLevel.concat(
        currentLevel.map((obj) => {
          let newObj;
          if (level == colorLevel) {
            // last color level -> copy color (4**(colorLevel) tets)
            newObj = copy.clone();
            // obj.matrix * newObj.matrix
            newObj.matrix.premultiply(obj.matrix);
          } else {
            // level != color level -> color of the obj
            newObj = obj.clone();
            // newObj.matrix * copy.matrix
            newObj.matrix.multiply(copy.matrix);
          }
          newObj.castShadow = copy.castShadow;
          newObj.receiveShadow = copy.receiveShadow;
          newObj.matrixAutoUpdate = false;
          newObj.matrixWorldNeedsUpdate = true;
          return newObj;
        })
      );
    }
    currentLevel = nextLevel;
  }
  scene.add(...currentLevel);
  return scene;
};

/**
 * Self invoked asynchronous anonymous function for reading a json file,
 * created by the Three.js editor, and rendering a 3D Sierpinski gasket.
 *
 * @function {@link anonymous_async_function}
 * @see https://threejs.org/docs/#examples/en/controls/OrbitControls
 * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
 * @see https://en.threejs-university.com
 */
(async function () {
  const canvas = document.querySelector("#theCanvas");

  /**
   * <p>Promise for returning an array with all file names in directory './models'.</p>
   *
   * <p>Calls a php script via ajax, since Javascript doesn't have access to the filesystem.</p>
   * Please, note that php runs on the server, and javascript on the browser.
   * @type {Promise<Array<String>>}
   * @see <a href="/cwdc/6-php/readFiles.php">files</a>
   * @see https://stackoverflow.com/questions/31274329/get-list-of-filenames-in-folder-with-javascript
   * @see https://api.jquery.com/jquery.ajax/
   */
  var readFileNames = new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "/cwdc/6-php/readFiles_.php",
      data: {
        dir: "/cwdc/13-webgl/sierpinski3/models",
      },
    })
      .done(function (fileNames) {
        resolve(JSON.parse(fileNames));
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(
          `[jqResponse: ${JSON.stringify(
            jqXHR,
            null,
            4
          )}], \n[status: ${textStatus}], \n[error: ${errorThrown}]`
        );
        console.log("Could not get data");
        reject("Could not get data");
      });
  });

  const loader = new THREE.ObjectLoader();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let jfile = urlParams.get("file") || "sierpinski3.json";

  /**
   * Array holding model file names to create scenes.
   * @type {Array<String>}
   */
  let modelFileName = await readFileNames
    .then((arr) => {
      return arr.length > 0 ? arr : ["sierpinski3.json"];
    })
    .catch((error) => {
      alert(`${error}`);
      // don't need to return anything => execution goes the normal way
      return [
        "crystal.json",
        "Pentagonal_de_Durer.json",
        "sierpinski3.json",
        "tree.json",
      ];
    });

  let response = await fetch(`./models/${jfile}`);
  let model = await response.json();

  var loadedScene = loader.parse(model);

  var aspect = canvas.clientWidth / canvas.clientHeight;

  // The WebGL renderer displays your beautifully crafted scenes using WebGL.
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.shadowMap.enabled = true;

  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
  handleWindowResize();

  /**
   * Current texture index.
   * @type {Number}
   */
  var sceneCnt = 0;

  /**
   * Select next scene.
   */
  async function nextScene() {
    sceneCnt = (sceneCnt + 1) % modelFileName.length;
    let jfile = modelFileName[sceneCnt];
    let response = await fetch(`./models/${jfile}`);
    let model = await response.json();
    loadedScene = loader.parse(model);
    renderScene();
  }
  window.nextScene = nextScene;

  /**
   * Select previous scene.
   */
  async function previousScene() {
    --sceneCnt;
    if (sceneCnt < 0) sceneCnt = modelFileName.length - 1;
    let jfile = modelFileName[sceneCnt];
    let response = await fetch(`./models/${jfile}`);
    let model = await response.json();
    loadedScene = loader.parse(model);
    renderScene();
  }
  window.previousScene = previousScene;

  /**
   * Screen events.
   */
  function handleWindowResize() {
    let h = window.innerHeight;
    let w = window.innerWidth;
    if (h > w) {
      h = w / aspect;
    } else {
      w = h * aspect;
    }
    renderer.setSize(w, h);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", handleWindowResize, false);

  /**
   * <p>Create radio buttons for nbtn color levels.</p>
   *
   * The number of buttons may be smaller than the current selected button.
   * In this case, the returned selected button will be the number of buttons.
   *
   * e.g.:
   * @example
   * nbtn = 3, sbtn = 2, offset = 9, name="clevel", title = "Color Level"
   *
   * <p>Color Level</p>
   * <label for="v9">0</label>
   * <input type="radio" id="v9" name="clevel" value="0">
   * <label for="v10">1</label>
   * <input type="radio" id="v10" name="clevel" value="1">
   * <label for="v11>2</label>
   * <input type="radio" id="v11" name="clevel" value="2" checked>
   *
   * @global
   * @param {Object} radio - Radio button set.
   * @param {String} radio.id id of the element to add the buttons to.
   * @param {Number} radio.nbtn number of buttons.
   * @param {Number} radio.sbtn selected button.
   * @param {Number} radio.offset starting value offset.
   * @param {function} radio.cbfunc callback function when a button is clicked.
   * @param {String} radio.name input name.
   * @param {String} radio.title input title.
   * @return {Number} a valid selected button.
   * @see https://www.javascripttutorial.net/es6/javascript-default-parameters/
   * @see https://simonsmith.io/destructuring-objects-as-function-parameters-in-es6
   */
  function createRadioBtns({
    id = "#radiobtn2",
    nbtn = 5,
    sbtn = 0,
    offset = 9,
    cbfunc = null,
    name = "clevel",
    title = "Color Level",
  }) {
    $(id).empty();
    $(id).append(`<p>${title}</p>`);
    sbtn = Math.min(sbtn, nbtn);
    for (let value = 0; value < nbtn + 1; ++value) {
      let checked = value == sbtn ? "checked" : "";
      let vid = `v${value + offset}`;
      $(id)
        .append(`<label for=${vid}>${value}</label>`)
        .append(
          `<input type="radio"
            id=${vid}
            name=${name}
            value=${value}
            ${checked}>`
        );
    }

    // listen to events on every checkbox of the radio buttons
    matches = document.querySelectorAll(`input[name=${name}]`);
    matches.forEach((elem) => {
      elem.addEventListener("click", (event) => {
        // global variable to receive the clicked button
        clevel = +event.target.value;
        if (cbfunc) {
          cbfunc();
        }
      });
    });

    return sbtn;
  }

  /**
   * Recreates the current scene from the loadedScene,
   * with the current mlevel and clevel,
   * and renders it using the current camera.
   *
   * <p>Displays the number of children (mesh objects) in the scene.</p>
   *
   * @global
   * @function
   */
  var renderScene = () => {
    // global variables and arguments
    scene = fractalScene(loadedScene, mlevel, clevel);
    renderer.render(scene, camera);
    $("#animate").html(`Animate (${scene.children.length - 4})`);
  };

  /**
   * Maximum level using JQuery to get it from the interface.
   *
   * @global
   * @var
   */
  var mlevel = +$("input[type='radio'][name='mlevel']:checked").val();

  /**
   * Color level being used, which has the same range as the selected maximum level.
   *
   * @global
   * @var
   */
  var clevel = createRadioBtns({ nbtn: mlevel, cbfunc: renderScene });

  /**
   * Current scene with the Sierpinski gasket at the current maximum level.
   *
   * @global
   * @var
   */
  var scene = fractalScene(loadedScene, mlevel, clevel);

  $("#animate").html(`Animate (${scene.children.length - 4})`);

  // listen to events on every checkbox of the radio buttons
  var matches = document.querySelectorAll('input[name="mlevel"]');
  matches.forEach((elem) => {
    elem.addEventListener("click", (event) => {
      mlevel = +event.target.value;
      clevel = createRadioBtns({
        nbtn: mlevel,
        sbtn: clevel,
        cbfunc: renderScene,
      });
      renderScene();
    });
  });

  // listen to events on every checkbox of the radio buttons
  matches = document.querySelectorAll('input[name="animate"]');
  matches.forEach((elem) => {
    elem.addEventListener("click", (event) => {
      controls.autoRotate = !!+event.target.value;
    });
  });

  // Orbit controls allow the camera to orbit around a target.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.autoRotate = !!+$(
    "input[type='radio'][name='animate']:checked"
  ).val();
  controls.autoRotateSpeed = 15.0;
  controls.minPolarAngle = 0; // radians
  // don't let go below the ground
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableDamping = false;
  controls.enablePan = true;
  controls.minDistance = 2.0;
  controls.maxDistance = 15.0;
  controls.listenToKeyEvents(window);
  controls.addEventListener("change", () => {
    // Fires when the camera has been transformed by the controls.
    if (!controls.autoRotate) renderer.render(scene, camera);
  });

  // controls.update() must be called after any manual changes to the camera's transform
  camera.position.set(2, 2, 5);
  controls.update();

  /**
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop renderer.setAnimationLoop}
   * parameter is a callback, which
   * will be called every available frame.<br>
   * If null is passed it will stop any already ongoing animation.
   * @param {function} loop callback.
   * @function
   * @name setAnimationLoop
   * @global
   */
  renderer.setAnimationLoop(() => {
    if (controls.autoRotate) {
      // required if controls.enableDamping or controls.autoRotate are set to true
      controls.update();
      renderer.render(scene, camera);
    }
  });
})();
