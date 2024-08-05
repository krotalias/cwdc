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
 * are those objects that have a name starting with "copy". <br>
 * In the 3D {@link https://en.wikipedia.org/wiki/Sierpiński_triangle Sierpiński Gasket}
 * example (included), there are 4 of these, named "copy1" ... "copy4".</p>
 *
 * <p>Selecting a "Max Level" bigger than 0 in the interface will create recursive
 * copies of these objects, up to the given level, <br>
 * whereas the other objects are rendered unchanged.</p>
 *
 * @author Claudio Esperança
 * @author Paulo Roma
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2022-2024 Paulo R Cavalcanti.
 * @since 23/06/2022
 * @see <a href="/cwdc/13-webgl/sierpinski3/sierpinski3.html?file=crystal.json">link</a>
 * @see <a href="/cwdc/13-webgl/sierpinski3/sierpinski3.js">source</a>
 * @see {@link https://observablehq.com/@esperanc/iterated-function-systems?collection=@esperanc/computacao-grafica Iterated Function Systems}
 * @see {@link https://observablehq.com/d/1e035729ed562001 3D IFS with three.js}
 * @see {@link https://threejs.org/editor three.js Editor}
 * @see {@link https://stackoverflow.com/questions/68528251/three-js-error-during-additional-components-importing Three.js ERROR during additional components importing}
 * @see {@link https://dplatz.de/blog/2019/es6-bare-imports.html How to handle ES6 bare module imports for local Development}
 * @see <iframe title="Sierpinks 3D" style="width: 800px; height: 600px; transform-origin: 0px 100px; transform: scale(0.8);"  src="/cwdc/13-webgl/sierpinski3/sierpinski3.html"></iframe>
 */

/**
 * Three.js module.
 * @external THREE
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 * @see {@link https://en.threejs-university.com Three.js University}
 */
let THREE;

/**
 * Orbit controls allow the camera to orbit around a target.
 * @memberof external:THREE
 * @class OrbitControls
 * @see {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
 * @see {@link https://raw.githubusercontent.com/mrdoob/three.js/master/examples/jsm/controls/OrbitControls.js github}
 */
let OrbitControls;

/**
 * This is the base class for most objects in three.js and provides
 * a set of properties and methods for manipulating objects in 3D space.
 * @memberof external:THREE
 * @class Object3D
 * @see {@link https://threejs.org/docs/#api/en/core/Object3D Object3D}
 */

/**
 * Creates an IFS (Iterated Function System) fractal given a json object with
 * n objects (called copy1 ... copyn).
 *
 * <p>The fractal will have n<sup>mlevel+1</sup>objects.</p>
 *
 * @example
 * // For a Sierpiński gastket, the objects are just {@link https://www.qfbox.info/4d/tetrahedron tetrahedra}.
 *
 *    4**0 copy1 4**0 copy2 4**0 copy3 4**0 copy4 ... 16 blocks (color level 0)
 *    4**1 copy1 4**1 copy2 4**1 copy3 4**1 copy4 ... 08 blocks (color level 1)
 *    4**2 copy1 4**2 copy2 4**2 copy3 4**2 copy4 ... 04 blocks (color level 2)
 *    4**3 copy1 4**3 copy2 4**3 copy3 4**3 copy4 ... 02 blocks (color level 3)
 *
 * @param {external:THREE.Object3D} loadedScene json object.
 * @param {Number} maxLevel maximum recursion level.
 * @param {Number} colorLevel all objects of level colorLevel will have the same color.
 * @returns {external:THREE.Object3D} a new scene with a fractal at the given level.
 * @see {@link https://en.wikipedia.org/wiki/Sierpiński_triangle Sierpiński triangle}
 * @see {@link https://www.codingem.com/javascript-clone-object/ 4 Ways to Clone an Object in JavaScript}
 */
const fractalScene = (loadedScene, maxLevel = 0, colorLevel = 0) => {
  const scene = loadedScene.clone();
  const NIGHTHAWK = new THREE.Color(0x605252);

  // create an array with the n initial copies
  const copies = scene.children.filter(
    (child) => child.name.slice(0, 4) == "copy",
  );
  // remove all n copies from the scene
  scene.remove(...copies);

  // initial level with only n copies
  let currentLevel = copies.map((copy) => {
    const obj = copy.clone();
    obj.matrixAutoUpdate = false;
    return obj;
  });

  for (let level = 1; level <= maxLevel; level++) {
    let nextLevel = [];
    // create a next level with n * currentLevel.length objects
    for (const copy of copies) {
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
        }),
      );
    }
    currentLevel = nextLevel;
  }
  scene.add(...currentLevel);
  if (!scene.background) {
    scene.background = NIGHTHAWK;
  }
  return scene;
};

/**
 * Function for reading a json file,
 * created by the Three.js editor, and rendering a 3D IFS fractal.
 *
 * @async
 * @see {@link external:THREE.OrbitControls}
 * @see {@link external:THREE.WebGLRenderer}
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
   * @see <a href="/cwdc/6-php/readFiles_.php">files</a>
   * @see {@link https://stackoverflow.com/questions/31274329/get-list-of-filenames-in-folder-with-javascript Get list of filenames in folder with Javascript}
   * @see {@link https://api.jquery.com/jquery.ajax/ jQuery.ajax()}
   */
  const readFileNames = new Promise((resolve, reject) => {
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
            4,
          )}], \n[status: ${textStatus}], \n[error: ${errorThrown}]`,
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
   * @type {external:THREE.ObjectLoader}
   * @global
   */
  const loader = new THREE.ObjectLoader();

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let jfile = urlParams.get("file");

  // default scene
  const defScene = document
    .getElementById("scenes")
    .querySelector("[selected]");

  /**
   * Array holding model file names to create scenes from.
   * @type {Array<String>}
   */
  const sceneFilename = [
    jfile ? jfile : defScene ? defScene.text : "sierpinski3.json",
  ];

  jfile = sceneFilename[0];

  /**
   * Current scene index.
   * @type {Number}
   * @global
   */
  let sceneCnt = defScene ? +defScene.value : 0;

  /**
   * Get model file names from an HTML &lt;select&gt; element
   * identified by "models".
   * @param {Array<String>} optionNames array of model file names.
   * @global
   */
  function getModels(optionNames) {
    optionNames.length = 0;
    const selectElement = document.getElementById("scenes");
    [...selectElement.options].map((o) => optionNames.push(o.text));
  }

  /**
   * Set model file names of an HTML &lt;select&gt; element identified by "scenes".
   * @param {Array<String>} optionNames array of model file names.
   * @global
   */
  function setModels(optionNames) {
    const sel = document.getElementById("scenes");

    let options_str = "";

    optionNames.forEach((img, index) => {
      options_str += `<option value="${index}">${img}</option>`;
    });

    sel.innerHTML = options_str;
  }

  /**
   * <p>Array holding model file names to create scenes from.</p>
   * If the Apache server runs PHP, then all file names in directory './models'
   * are considered. Otherwise, only the {@link getModels file names}
   * in the HTML &lt;select&gt; element.
   * @type  {Array<String>}
   * @global
   */
  const modelFileName = await readFileNames
    .then((arr) => {
      const initialScene = sceneFilename[0];
      if (arr.length > 0) arr = arr.sort();
      setModels(arr);
      sceneCnt = arr.indexOf(initialScene);
      document.getElementById("scenes").value = sceneCnt;
      return arr;
    })
    .catch((error) => {
      console.log(`${error}`);
      // don't need to return anything => execution goes the normal way
      getModels(sceneFilename);
      return sceneFilename;
    });

  /**
   * Current loaded model parsed from a json file.
   * @type {external:THREE.Object3D}
   * @global
   * @see {@link https://threejs.org/docs/#api/en/loaders/ObjectLoader.load ObjectLoader.load}
   */
  let loadedScene;
  loader.load(`./models/${jfile}`, (geometry) => {
    loadedScene = geometry;
    renderScene(true);
  });

  /**
   * Canvas aspect ratio.
   * @type {Number}
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
   * @type {external:THREE.WebGLRenderer}
   * @global
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  //renderer.useLegacyLights = true;

  /**
   * Camera that uses perspective projection.
   * @class PerspectiveCamera
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
   */

  /**
   * PerspectiveCamera object.
   * @type {external:THREE.PerspectiveCamera}
   * @global
   */
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
  handleWindowResize();

  /**
   * OrbitControls object.
   * @type {external:THREE.OrbitControls}
   * @global
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.autoRotate = !!+$(
    "input[type='radio'][name='animate']:checked",
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
   * <p>Gets the {@link https://en.wikipedia.org/wiki/Modulo modulo} of a division operation.</p>
   * In most computer languages, the modulo operation returns the remainder or signed remainder of a division,
   * after one number is divided by another (called the modulus of the operation).
   * In Javascript '%' is a remainder operator and not a modulo operator.
   * <p>Modulo is defined as
   *    k = n - m * q,
   * where q is the integer such that k has the same sign
   * as the divisor m while being as close to 0 as possible.</p>
   * @example
   * mod(-1,5) → 4
   * -1 % 5 → -1
   * @param {Number} n dividend.
   * @param {Number} m divisor.
   * @returns {Number} modulo.
   * @global
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder Remainder (%)}
   */
  const mod = (n, m) => ((n % m) + m) % m;

  /**
   * Select next/previous scene.
   * @param {Number} inc 1 for next, -1 for previous.
   * @global
   */
  function nextScene(inc = 1) {
    sceneCnt = mod(sceneCnt + inc, modelFileName.length);
    document.getElementById("scenes").value = sceneCnt;
    const jfile = modelFileName[sceneCnt];
    loader.load(`./models/${jfile}`, (geometry) => {
      loadedScene = geometry;
      renderScene(true);
    });
  }
  window.nextScene = nextScene;

  /**
   * <p>Fires when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @callback handleWindowResize
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
   */
  function handleWindowResize() {
    let h = window.innerHeight - 20;
    let w = window.innerWidth - 20;
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

  const scenes = document.getElementById("scenes");

  /**
   * <p>Appends an event listener for events whose type attribute value is change.<br>
   * The argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed when the scenes &lt;select&gt; is changed.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  scenes.addEventListener("change", (event) => {
    const jfile = modelFileName[scenes.value];
    loader.load(`./models/${jfile}`, (geometry) => {
      loadedScene = geometry;
      renderScene(true);
    });
  });

  /**
   * <p>Create radio buttons for nbtn color levels.</p>
   *
   * The number of buttons may be smaller than the current selected button.
   * In this case, the returned selected button will be the number of buttons.
   *
   * @example
   * nbtn = 3, sbtn = 2, offset = 9, name="clevel", title = "Color Level"
   *
   * <p>Color Level</p>
   * <label for="v9">0</label>
   * <input type="radio" id="v9" name="clevel" value="0">
   * <label for="v10">1</label>
   * <input type="radio" id="v10" name="clevel" value="1">
   * <label for="v11">2</label>
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
   * @see {@link https://www.javascripttutorial.net/es6/javascript-default-parameters/ JavaScript Default Parameters}
   * @see {@link https://simonsmith.io/destructuring-objects-as-function-parameters-in-es6 Destructuring objects as function parameters in ES6}
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
      const checked = value == sbtn ? "checked" : "";
      const vid = `v${value + offset}`;
      $(id)
        .append(`<label for=${vid}>${value}</label>`)
        .append(
          `<input type="radio"
            id=${vid}
            name=${name}
            value=${value}
            ${checked}>`,
        );
    }

    // listen to events on every checkbox of the radio buttons
    const matches = document.querySelectorAll(`input[name=${name}]`);
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
   * Recreates the current scene from the {@link loadedScene},
   * scaled to fit the window,
   * with the current mlevel and clevel,
   * and renders it using the current {@link camera}.
   *
   * <p>Displays the number of children (mesh objects) in the scene,
   * and sets global variable {@link scene} to the {@link fractalScene recreated scene}.</p>
   * @param {Boolean} reset_camera sets camera to its initial state.
   *
   * @global
   * @function
   */
  const renderScene = (reset_camera = false) => {
    if (!loadedScene) {
      return;
    }

    scene = fractalScene(loadedScene, mlevel, clevel);

    // scale to fit the window
    const box3 = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box3.getSize(size);

    const sc = Math.min(...size) / 2;
    scene.scale.divideScalar(sc);

    const centre = new THREE.Vector3();
    box3.getCenter(centre);
    scene.position.sub(centre);

    if (reset_camera) {
      camera.position.set(2, 2, 5);
      camera.rotation.set(0, 0, 0);
      controls.target.set(0, 0, 0);
      // controls.update() must be called after any manual changes to the camera's transform
      controls.update();
    }

    renderer.render(scene, camera);
    $("#animate").html(`Animate (${scene.children.length - 4})`);
  };

  /**
   * Current scene with the fractal at the current maximum level.
   *
   * @type {external:THREE.Object3D}
   * @global
   */
  let scene;

  /**
   * Maximum level using {@link https://jquery.com JQuery} to get it from the interface.
   *
   * @type {Number}
   * @global
   */
  let mlevel = +$("input[type='radio'][name='mlevel']:checked").val();

  /**
   * Color level being used, which has the same range as the selected maximum level.
   *
   * @type {Number}
   * @global
   */
  let clevel = createRadioBtns({ nbtn: mlevel, cbfunc: renderScene });

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

  /**
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link renderer}.{@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop setAnimationLoop}
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
      import("/cwdc/13-webgl/lib/three.r163/build/three.module.js").then(
        (module) => {
          THREE = module;
          import(
            "/cwdc/13-webgl/lib/three.r163/examples/jsm/controls/OrbitControls.js"
          ).then((module) => {
            ({ OrbitControls } = module);
            mainEntrance();
            return;
          });
        },
      );
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
