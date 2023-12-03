/**
 * @file
 *
 * In this script, you can render a 3D IFS
 * (<a href="https://en.wikipedia.org/wiki/Iterated_function_system">Iterated Function System</a>)
 * that was modeled with the Three.js editor, and exported as a scene JSON. <br>
 * One such example is included in <a href="../sierpinski3/models/sierpinski3.json">sierpinski3.json</a> file.
 *
 * <p>The <a href="../sierpinski3/mat.html">transformations</a> corresponding to the
 * <a href="https://larryriddle.agnesscott.org/ifs/siertri/siertri.htm">IFS</a>
 * correspond to those objects that have a name starting with "copy". <br>
 * In the 3D {@link https://en.wikipedia.org/wiki/Sierpiński_triangle Sierpiński Gasket}
 * example (included), there are 4 of these, named "copy1" ... "copy4".</p>
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

/**
 * Three.js module.
 * @external THREE
 * @see https://threejs.org/docs/#manual/en/introduction/Installation
 */
let THREE;

/**
 * OrbitControls module.
 * @external OrbitControls
 * @see https://threejs.org/docs/#examples/en/controls/OrbitControls
 */
let OrbitControls;

/**
 * Creates an IFS (Iterated Function System) fractal given a json object with
 * n objects (called copy1 ... copyn).
 *
 * <p>The fractal will have n<sup>mlevel+1</sup>objects.</p>
 *
 * E.g., for a Sierpiński gastket, the objects are just
 * <a href="https://www.qfbox.info/4d/tetrahedron">tetrahedra</a>.
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
 * @returns {THREE.Object3D} a new scene with a fractal at the given level.
 * @see https://en.wikipedia.org/wiki/Sierpiński_triangle
 * @see https://threejs.org/docs/#api/en/core/Object3D
 * @see https://www.codingem.com/javascript-clone-object/
 */
const fractalScene = (loadedScene, maxLevel = 0, colorLevel = 0) => {
  let scene = loadedScene.clone();

  // create an array with the n initial copies
  let copies = scene.children.filter(
    (child) => child.name.slice(0, 4) == "copy"
  );
  // remove all n copies from the scene
  scene.remove(...copies);

  // initial level with only n copies
  let currentLevel = copies.map((copy) => {
    let obj = copy.clone();
    obj.matrixAutoUpdate = false;
    return obj;
  });

  for (let level = 1; level <= maxLevel; level++) {
    let nextLevel = [];
    // create a next level with n * currentLevel.length objects
    for (let copy of copies) {
      // for each obj in this level generate n more,
      // using either its matrix or its original's copy matrix
      // for coloring objs
      nextLevel = nextLevel.concat(
        currentLevel.map((obj) => {
          let newObj;
          if (level == colorLevel) {
            // last color level -> copy color (n**(colorLevel) objects)
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
 * Function for reading a json file,
 * created by the Three.js editor, and rendering a 3D IFS fractal.
 *
 * @async
 * @see https://threejs.org/docs/#examples/en/controls/OrbitControls
 * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
 * @see https://en.threejs-university.com
 */
async function mainEntrance() {
  const canvas = document.querySelector("#theCanvas");

  /**
   * <p>Promise for returning an array with all file names in directory './models' on the server.</p>
   *
   * <p>Calls a php script via ajax, since Javascript doesn't have access to the filesystem.</p>
   * Please, note that php runs on the server, and javascript on the browser.
   * @return {Promise<Array<String>>}
   * @global
   * @function
   * @see <a href="/cwdc/6-php/readFiles.php">files</a>
   * @see https://stackoverflow.com/questions/31274329/get-list-of-filenames-in-folder-with-javascript
   * @see https://api.jquery.com/jquery.ajax/
   */
  let readFileNames = new Promise((resolve, reject) => {
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

  /**
   * A loader for loading a JSON resource in the JSON Object/Scene format.
   * @class ObjectLoader
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/loaders/ObjectLoader
   */

  /**
   * ObjectLoader object.
   * @var {external:THREE.ObjectLoader}
   * @global
   */
  const loader = new THREE.ObjectLoader();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let jfile = urlParams.get("file") || "sierpinski3.json";

  /**
   * Array holding model file names to create scenes.
   * @var {Array<String>} modelFileName
   * @global
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

  /**
   * Javascript object holding the current loaded model ready to be parsed.
   * @var {Object}
   * @global
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Response/json
   */
  let model = await response.json();

  /**
   * Current loaded model parsed from a json file.
   * @var {Object3D}
   * @global
   * @see https://threejs.org/docs/#api/en/loaders/ObjectLoader.parse
   */
  let loadedScene = loader.parse(model);

  /**
   * Canvas aspect ratio.
   * @var {Number}
   * @global
   */
  let aspect = canvas.clientWidth / canvas.clientHeight;

  /**
   * The WebGL renderer displays your beautifully crafted scenes using WebGL.
   * @class WebGLRenderer
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
   */

  /**
   * WebGLRenderer object.
   * @var {external:THREE.WebGLRenderer}
   * @global
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.shadowMap.enabled = true;

  /**
   * Camera that uses perspective projection.
   * @class PerspectiveCamera
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   */

  /**
   * PerspectiveCamera object.
   * @var {external:THREE.PerspectiveCamera}
   * @global
   */
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
  handleWindowResize();

  /**
   * Current scene index.
   * @var {Number}
   * @global
   */
  let sceneCnt = 0;

  /**
   * Select next scene.
   * @async
   * @global
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
   * @async
   * @global
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
   * <p>Fires when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @callback handleWindowResize
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
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
    let matches = document.querySelectorAll(`input[name=${name}]`);
    matches.forEach((elem) => {
      /**
       * <p>Appends an event listener for events whose type attribute value is change.
       * The callback argument sets the callback that will be invoked when
       * the event is dispatched.</p>
       *
       * @event change - executed when any
       * {@link renderScene clevel} &lt;input radio&gt;'s checkbox is checked (but not when unchecked).
       * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
       */
      elem.addEventListener("change", (event) => {
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
  const renderScene = () => {
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
  let mlevel = +$("input[type='radio'][name='mlevel']:checked").val();

  /**
   * Color level being used, which has the same range as the selected maximum level.
   *
   * @global
   * @var
   */
  let clevel = createRadioBtns({ nbtn: mlevel, cbfunc: renderScene });

  /**
   * Current scene with the fractal at the current maximum level.
   *
   * @global
   * @var
   */
  let scene = fractalScene(loadedScene, mlevel, clevel);

  $("#animate").html(`Animate (${scene.children.length - 4})`);

  // listen to events on every checkbox of the radio buttons
  let matches = document.querySelectorAll('input[name="mlevel"]');
  matches.forEach((elem) => {
    /**
     * <p>Appends an event listener for events whose type attribute value is change.
     * The callback argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event change - executed when any
     * {@link renderScene mlevel} &lt;input radio&gt;'s checkbox is checked (but not when unchecked).
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
     */
    elem.addEventListener("change", (event) => {
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
    /**
     * <p>Appends an event listener for events whose type attribute value is change.
     * The callback argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event change - executed when any
     * {@link https://threejs.org/docs/#examples/en/controls/OrbitControls.autoRotate animate}
     * &lt;input radio&gt;'s checkbox is checked (but not when unchecked).
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
     */
    elem.addEventListener("change", (event) => {
      controls.autoRotate = !!+event.target.value;
    });
  });

  /**
   * Orbit controls allow the camera to orbit around a target.
   * @class OrbitControls
   * @memberof external:OrbitControls
   * @see https://threejs.org/docs/#examples/en/controls/OrbitControls
   */

  /**
   * OrbitControls object.
   * @var {external:OrbitControls.OrbitControls}
   * @global
   */
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
  /**
   * <p>Appends an event listener for events whose type attribute value is change.
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - fires when the camera has been transformed by the controls.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  controls.addEventListener("change", () => {
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
}

/**
 * <p>Loads the theejs module and the {@link mainEntrance application}.</p>
 * Unfortunately, importmap is only supported by Safari version 16.4 and later.<br>
 * Since I still use macOS Catalina, my Safari version is 15.6.1, which obliges me
 * to conditionally and dynamically load the threejs module.
 *
 * <p>userAgent for Safari, Firefox, Chrome and Opera:</p>
 * <ul>
 * <li>"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15" </li>
 * <li>"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0"</li>
 * <li>"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"</li>
 * <li>"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0"</li>
 * </ul>
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgent
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 */
window.addEventListener("load", (event) => {
  const { userAgent } = navigator;
  let oldSafari = false;
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    let version = userAgent.split("Version/")[1];
    version = version.split("Safari")[0];
    console.log(`Safari v${version}`);
    if (version < "16.4") {
      oldSafari = true;
      import(
        "https://unpkg.com/three@0.148.0/build/three.module.js?module"
      ).then((module) => {
        THREE = module;
        import(
          "https://unpkg.com/three@0.148.0/examples/jsm/controls/OrbitControls.js?module"
        ).then((module) => {
          ({ OrbitControls } = module);
          mainEntrance();
          return;
        });
      });
    }
  }

  // any other case use importmap
  if (!oldSafari) {
    import("three").then((module) => {
      THREE = module;
      import("OrbitControls").then((module) => {
        ({ OrbitControls } = module);
        mainEntrance();
      });
    });
  }
});
