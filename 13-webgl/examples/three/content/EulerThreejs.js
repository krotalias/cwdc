/**
 * @file
 *
 * Summary.
 * <p>Controls the orientation of an airplane using
 * {@link https://en.wikipedia.org/wiki/Euler_angles Euler angles},
 * and it is slightly based on example
 * <a href="/cwdc/13-webgl/examples/transformations/content/Euler.js">Euler.js</a></p>
 *
 * Note that to use our preferred convention of
 * {@link https://dominicplein.medium.com/extrinsic-intrinsic-rotation-do-i-multiply-from-right-or-left-357c38c1abfd intrinsic}
 * Yaw (Head)-Pitch-Roll, we have to explicitly set
 * the rotation {@link https://threejs.org/docs/#api/en/math/Euler.order order}
 * in the Three.js {@link holder} object to YXZ.
 * Three.js uses intrinsic {@link https://en.wikipedia.org/wiki/Euler_angles Tait-Bryan} angles.
 * This means that rotations are performed with respect to the local coordinate system.
 *
 * <p>For order XYZ, the three rotations are executed:</p>
 * <ol>
 *  <li>first around the local-X axis (which is the same as the world-X axis), </li>
 *  <li>then around local-Y (which may now be different from the world Y-axis), </li>
 *  <li>then local-Z (which may be different from the world Z-axis).</li>
 * </ol>
 *
 * <p>A more recent version
 * {@link https://unpkg.com/three@0.163.0/build/three.module.js?module @163}
 * of Three.js was chosen to update the
 * {@link AirPlane airplane} and the {@link Pilot pilot},
 * which were taken from:</p>
 * <ul>
 *  <li>{@link https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/ The Making of “The Aviator”: Animating a Basic 3D Scene with Three.js}
 * </ul>
 *
 * @since 10/11/2014
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @see {@link https://discoverthreejs.com/book/first-steps/transformations/ Transformations, Coordinate Systems, and the Scene Graph}
 * @see {@link https://threejs.org/docs/#api/en/math/Euler Euler Angles}
 * @see <a href="/cwdc/13-webgl/examples/three/content/EulerThreejs.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/EulerThreejs.js">source</a>
 * @see <iframe title="Euler" style="width: 650px; height: 512px; transform-origin: 0px 80px; transform: scale(0.75);" src="/cwdc/13-webgl/examples/three/content/EulerThreejs.html"></iframe>
 * @see <img src="../TIEaft-SWE.jpg" width="256" align="top"> <img src="../airplane.png" width="340" align="top">
 */

"use strict";

/**
 * Three.js module.
 * @external three
 * @author Ricardo Cabello ({@link https://coopermrdoob.weebly.com/ Mr.doob})
 * @since 24/04/2010
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 * @see {@link https://en.threejs-university.com Three.js University}
 * @see {@link https://github.com/mrdoob/three.js github}
 * @see {@link http://cindyhwang.github.io/interactive-design/Mrdoob/index.html An interview with Mr.doob}
 * @see {@link https://experiments.withgoogle.com/search?q=Mr.doob Experiments with Google}
 * @see <a href="/cwdc/13-webgl/lib/three.txt">Notes</a>
 */
let THREE;

/**
 * <p>Main three.js namespace.</p>
 * {@link event:load Imported} from {@link external:three three.module.js}
 * @namespace THREE
 * @see {@link https://stackoverflow.com/questions/68528251/three-js-error-during-additional-components-importing Three.js ERROR during additional components importing}
 * @see {@link https://dplatz.de/blog/2019/es6-bare-imports.html How to handle ES6 bare module imports for local Development}
 */

/**
 * TextGeometry namespace.
 * @namespace TextGeometry
 * @see {@link https://threejs.org/docs/#examples/en/geometries/TextGeometry TextGeometry}
 */
let TextGeometry;

/**
 * FontLoader namespace.
 * @namespace FontLoader
 * @see {@link https://threejs.org/docs/#examples/en/loaders/FontLoader FontLoader}
 */
let FontLoader;

/**
 * A class for generating text as a single geometry.
 * It is constructed by providing a string of text,
 * and a set of parameters consisting of a loaded font and settings
 * for the geometry's parent ExtrudeGeometry.
 * @class TextGeometry
 * @memberof TextGeometry
 * @see {@link https://threejs.org/docs/#examples/en/geometries/TextGeometry TextGeometry}
 */

/**
 * Class for loading a font in JSON format. Returns a font,
 * which is an array of Shapes representing the font.
 * This uses the FileLoader internally for loading files.
 * @class FontLoader
 * @memberof FontLoader
 * @see {@link https://threejs.org/docs/#examples/en/loaders/FontLoader FontLoader}
 */

let ExportToGLTF;

/**
 * Exporter to GLTF.
 * @type {ExportToGLTF}
 */
let exporter;

/**
 * Keep track of the Euler angles.
 * @type {Object<{x: Number, y: Number, z: Number}>}
 */
const euler = {
  x: 0.0, // pitch
  y: 0.0, // yaw (head)
  z: 0.0, // roll
};

/**
 * Current rotation axis.
 * @type {String}
 */
let axis = "y";

/**
 * Global Threejs objects in application.
 * @property {Object} objects
 * @property {THREE.Object3D} objects.localAxes - {@link localAxes local axes} used for intrinsic rotations.
 * @property {THREE.Scene} objects.scene - WebGL {@link scene}.
 * @property {THREE.Object3D} objects.holder - a {@link holder container} for everything:
 *  {@link AirPlane plane}, {@link Pilot pilot} and {@link localAxes local axes}.
 * @property {THREE.AxesHelper} objects.axesHelper - an axis object to visualize the 3 global {@link axesHelper axes}.
 * @property {THREE.SpotLightHelper} objects.spotLightHelper - a {@link spotLightHelper cone} shaped helper object for a
 *  {@link https://threejs.org/docs/#api/en/lights/SpotLight SpotLight}.
 * @property {THREE.CameraHelper} objects.cameraHelper - depicts the {@link cameraHelper frustum} of a camera using LineSegments.
 * @property {THREE.Mesh} objects.shadowPlane - a {@link shadowPlane plane} for objects cast shadow to.
 * @property {THREE.PerspectiveCamera} objects.camera - a perspective {@link camera}.
 * @property {THREE.WebGLRenderer} objects.renderer - {@link renderer} to display the scene using WebGL.
 * @property {THREE.PointLightHelper} objects.pointLightHelper - a {@link pointLightHelper spherical Mesh} for visualizing a
 *  {@link https://threejs.org/docs/#api/en/lights/PointLight PointLight}.
 */
const objects = {
  localAxes: null,
  scene: null,
  holder: null,
  axesHelper: null,
  spotLightHelper: null,
  cameraHelper: null,
  shadowPlane: null,
  camera: null,
  renderer: null,
  pointLightHelper: null,
};

/**
 * RGB colors in hexadecimal.
 * @type {Object<String,Number>}
 */
const Colors = {
  red: 0xff0000,
  green: 0x00ff00,
  blue: 0x0000ff,
  cyan: 0x00ffff,
  yellow: 0xffff00,
  pastelYellow: 0xfdfd96,
  magenta: 0xff00ff,
  white: 0xffffff,
  black: 0x000000,
  grey: 0xd8d0d1,
  whiteGray: 0xf2f3f5,
  gray: 0xaaaaaa,
  brown: 0x59332e,
  darkBrown: 0x23190f,
  pink: 0xf5986e,
  antique: 0xfaebd7,
  orange: 0xffa500,
  darkOrange: 0xff8c00,
  sunsetOrange: 0xf25346,
  darkSalmon: 0xdc8874,
};

/**
 * Turn the display of the model axes/animation on/off.
 * @type {Object<{axes:Boolean, auto_rotate: Boolean, light: Boolean}>}
 */
const selector = {
  auto_rotate: !document.getElementById("pause").checked,
  axes: document.getElementById("axes").checked,
  light: document.getElementById("light").checked,
  octagons: document.getElementById("octagons").checked,
};

/**
 * Convert an angle in degrees to radians.
 * @param {Number} deg angle in degrees.
 * @returns {Number} angle in radians.
 * @see {@link https://threejs.org/docs/#api/en/math/MathUtils.degToRad MathUtils.degToRad}
 */
const deg2rad = (deg) => THREE.MathUtils.degToRad(deg);

/**
 * Convert an angle in radians to degrees.
 * @param {Number} rad angle in radians.
 * @returns {Number} angle in degrees.
 * @see {@link https://threejs.org/docs/#api/en/math/MathUtils.radToDeg MathUtils.radToDeg}
 */
const rad2deg = (rad) => THREE.MathUtils.radToDeg(rad);

/**
 * <p>Loads the theejs module and the {@link mainEntrance application}.</p>
 * Unfortunately, importmap is only supported by Safari version 16.4 and later.<br>
 * Since I still use macOS Catalina, my Safari version is 15.6.1, which obliges me
 * to conditionally and dynamically load the threejs module.
 *
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import import()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await await}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function async function}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import import statement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap &lt;script type="importmap"&gt;}
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
            "/cwdc/13-webgl/lib/three.r163/examples/jsm/geometries/TextGeometry.js"
          ).then((module) => {
            ({ TextGeometry } = module);
            import(
              "/cwdc/13-webgl/lib/three.r163/examples/jsm/loaders/FontLoader.js"
            ).then((module) => {
              ({ FontLoader } = module);
              import("/cwdc/13-webgl/threejs-examples/ExportToGLTF.1.js")
                .then((module) => {
                  ({ ExportToGLTF } = module);
                  exporter = new ExportToGLTF();
                })
                .catch((reason) => {
                  console.error(
                    `Could not load ExportToGLTF: ${reason.message}`,
                  );
                })
                .finally(() => {
                  mainEntrance();
                  return;
                });
            });
          });
        },
      );
    }
  }

  // any other case use importmap
  if (!oldSafari) {
    import("three").then((module) => {
      THREE = module;
      import("TextGeometry").then((module) => {
        ({ TextGeometry } = module);
        import("FontLoader").then((module) => {
          ({ FontLoader } = module);
          import("/cwdc/13-webgl/threejs-examples/ExportToGLTF.1.js").then(
            (module) => {
              ({ ExportToGLTF } = module);
              exporter = new ExportToGLTF();
              mainEntrance();
            },
          );
        });
      });
    });
  }
});

if (document.querySelector('input[name="rot"]')) {
  document.querySelectorAll('input[name="rot"]').forEach((elem) => {
    /**
     * @summary Executed when any
     * {@link handleKeyPress rot} &lt;input radio&gt;'s checkbox is checked (but not unchecked).
     * <p>Appends an event listener for events whose type attribute value is change.
     * The callback argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event changeRot
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
     */
    elem.addEventListener("change", function (event) {
      const item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

/**
 * Translate keypress events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String} key pressed.
 * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Display the Euler angles in the browser.
 */
function displayAngles() {
  // update output window
  const outputWindow = document.getElementById("displayMatrices");
  outputWindow.innerHTML = `
  RotateY(${euler["y"].toFixed(2)}) *
  RotateX(${euler["x"].toFixed(2)}) *
  RotateZ(${euler["z"].toFixed(2)})
  `;
}

/**
 * Creates an
 * {@link https://threejs.org/docs/#api/en/animation/AnimationClip AnimationClip}
 * array and returns it into an option object.
 * @returns {Object<{animations:Array<AnimationClip>}>} options
 */
function clipOptions() {
  // set up rotation about x axis
  const xAxis = new THREE.Vector3(1, 0, 0);

  const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
  const qMiddle = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
  const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, 2 * Math.PI);

  const numHairs = objects.holder.getObjectByName("hairsTop").children.length;

  const quaternionKF = new THREE.QuaternionKeyframeTrack(
    "propeller.quaternion",
    [0, 1, 2],
    [...qInitial, ...qMiddle, ...qFinal],
  );

  const scaleKF = (i) => {
    const j = (0.5 / numHairs) * i;
    return new THREE.VectorKeyframeTrack(
      `hbox_${i}.scale`,
      [0, 1, 2],
      [1, 1, 1, 1, (i / numHairs) * 0.25 + 0.75, 1, 1, 1, 1],
    );
  };

  const newClip = (name, action) => {
    return new THREE.AnimationClip(name, -1, action);
  };

  const arrClip = [];
  arrClip.push(newClip("propeller", [quaternionKF]));
  for (let i = 0; i < numHairs; ++i) {
    arrClip.push(newClip(`mesh_16_instance_${i}`, [scaleKF(i)]));
  }

  return {
    animations: arrClip,
  };
}

/**
 * Handler for key press events.
 * @param {KeyboardEvent} event keyboard event.
 */
function handleKeyPress(event) {
  const ch = getChar(event);
  const increment = 15;
  const zoomfactor = 1.1;
  switch (ch) {
    case "x":
    case "y":
    case "z":
      axis = ch;
      document.getElementById("axes").checked = true;
      selector.auto_rotate = true;
      break;
    case "h":
    case "p":
    case "r":
      axis = ch == "h" ? "y" : ch == "p" ? "x" : "z";
      euler[axis] += increment;
      euler[axis] %= 360;
      break;
    case "X":
    case "Y":
    case "Z":
      axis = ch.toLowerCase();
      euler[axis] -= increment;
      euler[axis] %= -360;
      break;
    case "o":
      euler["x"] = euler["y"] = euler["z"] = 0.0;
      break;
    case "l":
      selector.light = !selector.light;
      document.getElementById("light").checked = selector.light;
      if (shadowLight.parent === objects.scene) {
        objects.scene.add(pointLight);
        objects.scene.add(spotLight);
        objects.scene.add(ambientLight2);
        objects.scene.remove(shadowLight);
        objects.scene.remove(hemisphereLight);
        objects.scene.remove(ambientLight);
        objects.shadowPlane.rotateX(Math.PI / 2);
        objects.shadowPlane.position.set(0, 0, -1);
        if (
          !objects.scene.getObjectByName("spotLightHelper") &&
          selector.axes
        ) {
          objects.scene.add(objects.spotLightHelper);
          objects.scene.add(objects.pointLightHelper);
        }
        if (objects.scene.getObjectByName("cameraHelper")) {
          objects.scene.remove(objects.cameraHelper);
        }
      } else {
        objects.scene.remove(pointLight);
        objects.scene.remove(spotLight);
        objects.scene.remove(ambientLight2);
        objects.scene.add(shadowLight);
        objects.scene.add(hemisphereLight);
        objects.scene.add(ambientLight);
        objects.shadowPlane.rotateX(-Math.PI / 2);
        objects.shadowPlane.position.set(0, -1, 0);
        if (!objects.scene.getObjectByName("cameraHelper") && selector.axes) {
          objects.scene.add(objects.cameraHelper);
        }
        if (objects.scene.getObjectByName("spotLightHelper")) {
          objects.scene.remove(objects.spotLightHelper);
          objects.scene.remove(objects.pointLightHelper);
        }
      }
      break;
    case "a":
      selector.axes = !selector.axes;
      document.getElementById("axes").checked = selector.axes;
      if (selector.axes) {
        objects.holder.add(objects.localAxes);
        objects.scene.add(objects.axesHelper);
        if (selector.light) {
          objects.scene.add(objects.spotLightHelper);
          objects.scene.add(objects.pointLightHelper);
        } else {
          objects.scene.add(objects.cameraHelper);
        }
      } else {
        objects.holder.remove(objects.localAxes);
        objects.scene.remove(objects.axesHelper);
        if (objects.scene.getObjectByName("spotLightHelper")) {
          objects.scene.remove(objects.spotLightHelper);
          objects.scene.remove(objects.pointLightHelper);
        }
        if (objects.scene.getObjectByName("cameraHelper")) {
          objects.scene.remove(objects.cameraHelper);
        }
      }
      break;
    case " ":
      selector.auto_rotate = !selector.auto_rotate;
      document.getElementById("pause").checked = !selector.auto_rotate;
      if (selector.auto_rotate) document.getElementById("axes").checked = true;
      break;
    case "ArrowUp":
      objects.camera.zoom *= zoomfactor;
      objects.camera.zoom = Math.min(5, objects.camera.zoom);
      objects.camera.updateProjectionMatrix();
      break;
    case "ArrowDown":
      objects.camera.zoom /= zoomfactor;
      objects.camera.zoom = Math.max(0.2, objects.camera.zoom);
      objects.camera.updateProjectionMatrix();
      break;
    case "g":
      if (exporter) exporter.exportGLTF(objects.holder, clipOptions());
      break;
    case "v":
      // remove octagons
      selector.octagons = !selector.octagons;
      for (let c = 0; c < 4; c++) {
        objects.holder.children[c].visible = selector.octagons;
      }
      document.getElementById("octagons").checked = selector.octagons;
      break;
    default:
      return;
  }

  displayAngles();
}

/**
 * @summary Creates a keyboard keydown event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @event KeyboardEvent
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

const axes = document.getElementById("axes");
/**
 * @summary Executed when the axes checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeAxes
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
axes.addEventListener("change", (event) => handleKeyPress(createEvent("a")));

const octagons = document.getElementById("octagons");
/**
 * @summary Executed when the octagons checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeOctagons
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
octagons.addEventListener("change", (event) =>
  handleKeyPress(createEvent("v")),
);

const light = document.getElementById("light");
/**
 * @summary Executed when the light checkbox is checked or unchecked.
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event changeLight
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */
light.addEventListener("change", (event) => handleKeyPress(createEvent("l")));

window.zoomIn = zoomIn;
window.zoomOut = zoomOut;

/**
 * Increase zoom.
 */
function zoomIn() {
  handleKeyPress(createEvent("ArrowUp"));
}

/**
 * Decrease zoom.
 */
function zoomOut() {
  handleKeyPress(createEvent("ArrowDown"));
}

/**
 * Airplane Pilot.
 * @see {@link https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/ The Making of “The Aviator”: Animating a Basic 3D Scene with Three.js}
 * @see {@link https://en.wikipedia.org/wiki/Aircraft_principal_axes Aircraft principal axes}
 */
class Pilot {
  /**
   * <p>Instanciates a new Pilot.</p>
   * A pilot is made up of of a boby, hair, face, ear (right and left), and a glass.
   * It is a cool pilot with windblown. To simulate fluttering hair, we use only a few boxes.
   */
  constructor() {
    /**
     * Pilot's container.
     * @type {THREE.Object3D}
     */
    this.mesh = new THREE.Object3D();

    /**
     * Pilot's container name.
     * @type {String}
     */
    this.mesh.name = "pilot";

    /**
     * Pilot's hair angle.
     * @type {Number}
     */
    this.angleHairs = 0;

    const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
    const bodyMat = new THREE.MeshLambertMaterial({
      color: Colors.brown,
      //emissive: Colors.brown,
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(2, -12, 0);

    this.mesh.add(body);

    const faceGeom = new THREE.BoxGeometry(10, 10, 10);
    const faceMat = new THREE.MeshLambertMaterial({
      color: Colors.pink,
      //emissive: Colors.pink,
    });
    const face = new THREE.Mesh(faceGeom, faceMat);
    this.mesh.add(face);

    const hairGeom = new THREE.BoxGeometry(4, 4, 4);
    const hairMat = new THREE.MeshLambertMaterial({
      color: Colors.brown,
      //emissive: Colors.brown,
    });
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));
    const hairs = new THREE.Object3D();

    /**
     * <p>Pilot's hair container.</p>
     * Hair is made up of a back, side (right and left), and top.<br>
     * This top portion can be animated. It is a set of 12 boxes (4x4x4),<br>
     * disposed on a 4 x 3 grid on plane x-z:
     * <pre>
     *  (-4, -4) (-4, 0) (-4, 4)
     *  (0, -4)  (0, 0)  (0, 4)
     *  (4, -4)  (4, 0)  (4, 4)
     *  (8, -4)  (8, 0)  (8, 4)
     * </pre>
     *
     * @type {THREE.Object3D}
     */
    this.hairsTop = new THREE.Object3D();
    this.hairsTop.name = "hairsTop";

    for (let i = 0; i < 12; i++) {
      const h = hair.clone();
      const col = i % 3;
      const row = Math.floor(i / 3);
      const startPosZ = -4;
      const startPosX = -4;
      h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
      h.geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1));
      const obj = new THREE.Object3D();
      obj.add(h);
      obj.name = `hbox_${i}`;
      this.hairsTop.add(obj);
    }
    hairs.add(this.hairsTop);

    const hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
    hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6, 0, 0));
    const hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
    const hairSideL = hairSideR.clone();
    hairSideR.position.set(8, -2, 6);
    hairSideL.position.set(8, -2, -6);
    hairs.add(hairSideR);
    hairs.add(hairSideL);

    const hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
    const hairBack = new THREE.Mesh(hairBackGeom, hairMat);
    hairBack.position.set(-1, -4, 0);
    hairs.add(hairBack);
    hairs.position.set(-5, 5, 0);

    this.mesh.add(hairs);

    const glassGeom = new THREE.BoxGeometry(5, 5, 5);
    const glassMat = new THREE.MeshLambertMaterial({
      color: Colors.brown,
      //emissive: Colors.brown,
    });
    const glassR = new THREE.Mesh(glassGeom, glassMat);
    glassR.position.set(6, 0, 3);
    const glassL = glassR.clone();
    glassL.position.z = -glassR.position.z;

    const glassAGeom = new THREE.BoxGeometry(11, 1, 11);
    const glassA = new THREE.Mesh(glassAGeom, glassMat);
    this.mesh.add(glassR);
    this.mesh.add(glassL);
    this.mesh.add(glassA);

    const earGeom = new THREE.BoxGeometry(2, 3, 2);
    const earL = new THREE.Mesh(earGeom, faceMat);
    earL.position.set(0, 0, -6);
    const earR = earL.clone();
    earR.position.set(0, 0, 6);
    this.mesh.add(earL);
    this.mesh.add(earR);
  }

  /**
   * <p>Animate pilot's hair.</p>
   * Each hair element will scale its y coordinate on a cyclical basis,
   * between 75% and 100% of its original size.
   * @param {Number} increment amount to be added in each frame.
   */
  updateHairs(increment = 0.2) {
    const hairs = this.hairsTop.children;

    // update them according to the angle this.angleHairs
    for (const [i, h] of hairs.entries()) {
      h.scale.y = 0.75 + Math.cos(this.angleHairs + i / 3) * 0.25;
    }
    // increment the angle for the next frame
    this.angleHairs += increment;
  }
}

/**
 * A very simple airplane.
 * @see {@link https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/ The Making of “The Aviator”: Animating a Basic 3D Scene with Three.js}
 * @see {@link https://en.wikipedia.org/wiki/Aircraft_principal_axes Aircraft principal axes}
 */
class AirPlane {
  /**
   * Constructs a new airplane.
   * @see {@link https://threejs.org/docs/#api/en/core/Object3D Object3D}
   */
  constructor() {
    /**
     * Airplane's container.
     * @type {THREE.Object3D}
     */
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airplane";

    // Create the cabin
    const geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);

    /**
     * <p>Self invoking anonymous function.</p>
     * We can access a specific vertex of a shape through
     * the vertices array, and then move its x, y and z property.
     */
    // prettier-ignore
    (function() {
      const pos = geomCockpit.attributes.position.array;
      pos[13] = 15; pos[14] = -5;
      pos[16] = 15; pos[17] =  5;
      pos[19] =  5; pos[20] = -5;
      pos[22] =  5; pos[23] =  5;
      pos[25] = 15; pos[26] = -5;
      pos[31] = 15; pos[32] =  5;
      pos[37] =  5; pos[38] =  5;
      pos[43] =  5; pos[44] = -5;
      pos[49] = 15; pos[50] =  5;
      pos[55] =  5; pos[56] =  5;
      pos[64] = 15; pos[65] = -5;
      pos[70] =  5; pos[71] = -5;
    })();

    const matCockpit = new THREE.MeshLambertMaterial({
      color: Colors.sunsetOrange,
      //emissive: Colors.sunsetOrange,
      flatShading: true,
    });

    const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Create the enginemake
    const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    const matEngine = new THREE.MeshLambertMaterial({
      color: Colors.whiteGray,
      //emissive: Colors.whiteGray,
      flatShading: true,
    });
    const engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 50;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Create the tail
    const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    const matTailPlane = new THREE.MeshLambertMaterial({
      color: Colors.darkOrange,
      //emissive: Colors.darkOrange,
      flatShading: true,
    });
    const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-45, 20, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Create the wing
    const geomSideWing = new THREE.BoxGeometry(30, 5, 150, 1, 1, 1);
    const matSideWing = new THREE.MeshLambertMaterial({
      color: Colors.darkOrange,
      //emissive: Colors.darkOrange,
      flatShading: true,
    });
    const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0, 15, 0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    const geomWindshield = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
    const matWindshield = new THREE.MeshPhongMaterial({
      color: Colors.white,
      transparent: true,
      opacity: 0.3,
    });
    const windshield = new THREE.Mesh(geomWindshield, matWindshield);
    windshield.position.set(5, 27, 0);
    windshield.castShadow = true;
    windshield.receiveShadow = true;
    this.mesh.add(windshield);

    // propeller
    const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    const matPropeller = new THREE.MeshLambertMaterial({
      color: Colors.brown,
      //emissive: Colors.brown,
      flatShading: true,
    });

    /**
     * Airplane's propeller.
     * @type {THREE.Mesh}
     */
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;
    this.propeller.name = "propeller";

    // blades
    const geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);
    const matBlade = new THREE.MeshLambertMaterial({
      color: Colors.darkBrown,
      //emissive: Colors.darkBrown,
      flatShading: true,
    });

    const blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(8, 0, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;

    const blade2 = blade1.clone();
    blade2.rotation.x = Math.PI / 2;
    blade2.castShadow = true;
    blade2.receiveShadow = true;

    this.propeller.add(blade1);
    this.propeller.add(blade2);
    this.propeller.position.set(60, 0, 0);
    this.mesh.add(this.propeller);

    const wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
    const wheelProtecMat = new THREE.MeshPhongMaterial({
      color: Colors.sunsetOrange,
      //emissive: Colors.sunsetOrange,
      flatShading: true,
    });
    const wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat);
    wheelProtecR.position.set(25, -20, 25);
    this.mesh.add(wheelProtecR);

    const wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
    const wheelTireMat = new THREE.MeshPhongMaterial({
      color: Colors.darkBrown,
      //emissive: Colors.darkBrown,
      flatShading: true,
    });
    const wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
    wheelTireR.position.set(25, -28, 25);

    const wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
    const wheelAxisMat = new THREE.MeshPhongMaterial({
      color: Colors.brown,
      //emissive: Colors.brown,
      flatShading: true,
    });
    const wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
    wheelTireR.add(wheelAxis);

    this.mesh.add(wheelTireR);

    const wheelProtecL = wheelProtecR.clone();
    wheelProtecL.position.z = -wheelProtecR.position.z;
    this.mesh.add(wheelProtecL);

    const wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    this.mesh.add(wheelTireL);

    const wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(0.5, 0.5, 0.5);
    wheelTireB.position.set(-35, -5, 0);
    this.mesh.add(wheelTireB);

    const suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
    suspensionGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 10, 0));
    const suspensionMat = new THREE.MeshPhongMaterial({
      color: Colors.sunsetOrange,
      //emissive: Colors.sunsetOrange,
      flatShading: true,
    });
    const suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
    suspension.position.set(-35, -5, 0);
    suspension.rotation.z = -0.3;
    this.mesh.add(suspension);

    /**
     * Airplane's pilot.
     * @type {Pilot}
     */
    this.pilot = new Pilot();
    this.pilot.mesh.position.set(-10, 27, 0);
    this.mesh.add(this.pilot.mesh);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}

/**
 * Creates an object AirPlane and adds to the scene.
 * @param {THREE.Object3D} parent airplane container.
 * @return {AirPlane} created airplane object.
 */
function createAirPlane(parent) {
  const airplane = new AirPlane();
  airplane.mesh.scale.set(0.01, 0.01, 0.01);
  airplane.mesh.rotation.y = deg2rad(-90.0);
  airplane.mesh.position.x = 0;
  airplane.mesh.position.y = 0;
  airplane.mesh.position.z = 0;
  parent.add(airplane.mesh);
  return airplane;
}

/**
 * Draw three coordinate axes.
 * @param {THREE.Object3D} parent axis container.
 */
function drawGlobalAxes(parent) {
  const axisMat = {
    0: new THREE.LineBasicMaterial({ color: Colors.sunsetOrange }),
    1: new THREE.LineBasicMaterial({ color: Colors.green }),
    2: new THREE.LineBasicMaterial({ color: Colors.blue }),
  };
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));

  const axisLen = 2.0;
  for (let i = 0; i < 3; ++i) {
    points[1] = new THREE.Vector3(
      i == 0 ? axisLen : 0,
      i == 1 ? axisLen : 0,
      i == 2 ? axisLen : 0,
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, axisMat[i]);
    parent.add(line);
  }
}

/**
 * Draw three local coordinate axes.
 * @param {THREE.Object3D} parent axis container.
 * @param {FontLoader.FontLoader} font text font.
 */
function drawLocalAxes(parent, font) {
  // create the three black lines
  const material = new THREE.LineBasicMaterial({ color: Colors.black });
  const points = [];
  const lineLen = 1.0;
  /**
   * This is the base class for most objects in three.js and provides a set of
   * properties and methods for manipulating objects in 3D space.
   * @class Object3D
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/core/Object3D Object3D}
   */

  /**
   * Local axes used for intrinsic rotations.
   * @type {THREE.Object3D}
   * @global
   */
  objects.localAxes = new THREE.Object3D();
  points.push(new THREE.Vector3(-lineLen, 0, 0));
  points.push(new THREE.Vector3(lineLen, 0, 0));
  points.push(new THREE.Vector3(0, -lineLen, 0));
  points.push(new THREE.Vector3(0.0, lineLen, 0));
  points.push(new THREE.Vector3(0, 0, -lineLen));
  points.push(new THREE.Vector3(0, 0, lineLen));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineSegments(geometry, material);
  objects.localAxes.add(line);

  let i = 0;
  /**
   * TextGeometry object.
   * @type {TextGeometry.TextGeometry}
   * @global
   */
  let textGeometry;
  const textMaterialPos = new THREE.MeshBasicMaterial({ color: Colors.brown });
  const textMaterialNeg = new THREE.MeshBasicMaterial({
    color: Colors.sunsetOrange,
  });

  // draw axis labels
  for (let ch in euler) {
    textGeometry = new TextGeometry(ch, {
      font: font,
      size: 0.1,
      depth: 0,
    });
    let mesh = new THREE.Mesh(textGeometry, textMaterialNeg);
    mesh.position.set(...points[i]);
    objects.localAxes.add(mesh);
    mesh = new THREE.Mesh(textGeometry, textMaterialPos);
    mesh.position.set(...points[i + 1]);
    objects.localAxes.add(mesh);
    i += 2;
  }
  parent.add(objects.localAxes);
}

/**
 * Draw two local auxiliary triangles.
 * @param {THREE.Object3D} parent triangle container.
 */
function drawTwoTriangles(parent) {
  // draw a triangle and then make the geometry from it
  const triangleShape = new THREE.Shape();
  const vtx = 0.45;
  triangleShape.moveTo(vtx, -vtx);
  triangleShape.lineTo(0.0, vtx);
  triangleShape.lineTo(-vtx, -vtx);
  triangleShape.lineTo(vtx, -vtx);

  const geometry = new THREE.ShapeGeometry(triangleShape);
  const material = new THREE.MeshBasicMaterial({ color: Colors.cyan });
  material.side = THREE.DoubleSide;
  const triangle = new THREE.Mesh(geometry, material);
  triangle.translateX(-0.76);
  triangle.rotation.y = deg2rad(-90.0);
  parent.add(triangle);

  // same geometry, different material and different position
  material = new THREE.MeshBasicMaterial({ color: Colors.yellow });
  material.side = THREE.DoubleSide;
  triangle = new THREE.Mesh(geometry, material);
  triangle.translateX(0.76);
  triangle.rotation.y = deg2rad(-90.0);
  parent.add(triangle);
}

/**
 * Draw two local auxiliary octagon.
 * @param {THREE.Object3D} parent octagon container.
 */
function drawTwoOctagons(parent) {
  // draw a triangle and then make the geometry from it
  const octagonShape = new THREE.Shape();
  const sqrt2 = Math.sqrt(2);
  octagonShape.moveTo(-1 + sqrt2, 1.0);
  octagonShape.lineTo(1.0, -1 + sqrt2);
  octagonShape.lineTo(1.0, 1 - sqrt2);
  octagonShape.lineTo(-1 + sqrt2, -1.0);
  octagonShape.lineTo(1 - sqrt2, -1.0);
  octagonShape.lineTo(-1.0, 1 - sqrt2);
  octagonShape.lineTo(-1.0, -1 + sqrt2);
  octagonShape.lineTo(1 - sqrt2, 1.0);
  octagonShape.lineTo(-1 + sqrt2, 1.0);

  const geometry = new THREE.ShapeGeometry(octagonShape);
  let material = new THREE.MeshLambertMaterial({
    color: Colors.cyan,
    side: THREE.DoubleSide,
  });
  const materialEdge = new THREE.MeshBasicMaterial({
    color: Colors.darkBrown,
    wireframe: true,
  });
  let octagon = new THREE.Mesh(geometry, material);
  octagon.castShadow = true;
  octagon.receiveShadow = true;
  octagon.scale.set(0.5, 0.5, 0.5);
  octagon.translateX(-0.76);
  octagon.translateY(0.15);
  octagon.rotation.y = deg2rad(-90.0);
  parent.add(octagon);
  octagon.name = "octagon-left";

  octagon = new THREE.Mesh(geometry, materialEdge);
  octagon.scale.set(0.5, 0.5, 0.5);
  octagon.translateX(-0.76);
  octagon.translateY(0.15);
  octagon.rotation.y = deg2rad(-90.0);
  parent.add(octagon);
  octagon.name = "octagon-left-edge";

  // same geometry, different material and different position
  material = new THREE.MeshLambertMaterial({
    color: Colors.pastelYellow,
    side: THREE.DoubleSide,
  });
  octagon = new THREE.Mesh(geometry, material);
  octagon.castShadow = true;
  octagon.receiveShadow = true;
  octagon.scale.set(0.5, 0.5, 0.5);
  octagon.translateX(0.76);
  octagon.translateY(0.15);
  octagon.rotation.y = deg2rad(-90.0);
  parent.add(octagon);
  octagon.name = "octagon-right";

  octagon = new THREE.Mesh(geometry, materialEdge);
  octagon.scale.set(0.5, 0.5, 0.5);
  octagon.translateX(0.76);
  octagon.translateY(0.15);
  octagon.rotation.y = deg2rad(-90.0);
  parent.add(octagon);
  octagon.name = "octagon-right-edge";
}

/**
 * Change the vertex coordinates of a given Box geometry.
 * @param {THREE.BoxGeometry} geometry a box.
 * @param {Number} val coordinate value.
 * @see {@link https://dustinpfister.github.io/2021/06/07/threejs-buffer-geometry-attributes-position/ The position attribute for buffer geometries in threejs}
 */
function changeBox(geometry, val = 1) {
  // set location of a vert given an index value in geometry.index
  const setVert = function (geometry, vertIndex, pos) {
    pos = pos || {};
    const posIndex = geometry.index.array[vertIndex] * 3,
      position = geometry.getAttribute("position");
    position.array[posIndex] =
      pos.x === undefined ? position.array[posIndex] : pos.x;
    position.array[posIndex + 1] =
      pos.y === undefined ? position.array[posIndex + 1] : pos.y;
    position.array[posIndex + 2] =
      pos.z === undefined ? position.array[posIndex + 2] : pos.z;
  };

  // set triangle
  const setTri = function (geometry, triIndex, pos) {
    pos = pos || {};
    const vertIndex = triIndex * 3;
    setVert(geometry, vertIndex, pos);
    setVert(geometry, vertIndex + 1, pos);
    setVert(geometry, vertIndex + 2, pos);
  };

  setTri(geometry, 0, { x: val });
  setTri(geometry, 1, { x: val });
  setTri(geometry, 2, { x: -val });
  setTri(geometry, 3, { x: -val });
  setTri(geometry, 4, { y: val });
  setTri(geometry, 5, { y: val });
  setTri(geometry, 6, { y: -val });
  setTri(geometry, 7, { y: -val });
  setTri(geometry, 8, { z: val });
  setTri(geometry, 9, { z: val });
  setTri(geometry, 10, { z: -val });
  setTri(geometry, 11, { z: -val });

  return geometry;
}

/**
 * Entry point when page is loaded for loading a font and {@link start} the application.
 * @see {@link FontLoader.FontLoader}
 */
function mainEntrance() {
  const loader = new FontLoader();
  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    (font) => start(font),
  );
}

/**
 * A light source positioned directly above the scene,
 * with color fading from the sky color to the ground color.
 * @class HemisphereLight
 * @memberof THREE
 * @see {@link https://threejs.org/docs/#api/en/lights/HemisphereLight HemisphereLight}
 */

/**
 * A gradient colored light.
 * @type {THREE.HemisphereLight}
 */
let hemisphereLight,
  shadowLight,
  ambientLight,
  ambientLight2,
  pointLight,
  spotLight;

/**
 * <p>Lighting is certainly one of the trickiest parts when it comes to setting up a scene.</p>
 * The lights will set the mood of the whole scene and must be determined carefully.<br>
 * Just make the lightning good enough to make the objects visible.
 * @param {THREE.Object3D} scene where you place objects, lights and cameras.
 * @see {@link https://threejs.org/docs/#api/en/lights/DirectionalLight DirectionalLight}
 * @see {@link https://threejs.org/docs/#api/en/lights/HemisphereLight HemisphereLight}
 * @see {@link https://threejs.org/docs/#api/en/lights/AmbientLight AmbientLight}
 */
function createLights(scene) {
  // A hemisphere light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(Colors.gray, Colors.black, 0.3);

  // This light globally illuminates all objects in the scene equally.
  // This light cannot be used to cast shadows as it does not have a direction.
  ambientLight = new THREE.AmbientLight(Colors.white, 2);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(Colors.white, 0.5);

  // Set the direction of the light
  shadowLight.position.set(0, 1, 0);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  // The OrthographicCamera frustum dimensions are
  shadowLight.shadow.camera.left = -1;
  shadowLight.shadow.camera.right = 1;
  shadowLight.shadow.camera.top = 1;
  shadowLight.shadow.camera.bottom = -1;
  shadowLight.shadow.camera.near = 0.1;
  shadowLight.shadow.camera.far = 15;

  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

  /**
   * This helps with visualizing what a camera contains in its frustum.
   * It visualizes the frustum of a camera using a LineSegments.
   * @class CameraHelper
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/helpers/CameraHelper CameraHelper}
   */

  /**
   * Create a helper for the shadow camera (optional)
   * @type {THREE.CameraHelper}
   * @global
   */
  objects.cameraHelper = new THREE.CameraHelper(shadowLight.shadow.camera);
  objects.cameraHelper.name = "cameraHelper";
  if (selector.axes) {
    scene.add(objects.cameraHelper);
  }
  objects.cameraHelper.update();

  scene.remove(pointLight);
  scene.remove(spotLight);
  scene.remove(ambientLight2);
  scene.remove(objects.spotLightHelper);
  scene.remove(objects.pointLightHelper);
}

/**
 * <p>A simpler lighting scheme.</p>
 * Note that, without a global source of light, all surfaces will render black,
 * unless their emissive properties are also set.<br>
 * This can be avoided, by using an ambient or hemisphere light source.
 * @param {THREE.Object3D} scene where you place objects, lights and cameras.
 * @param {THREE.Object3D} target scene object target.
 * @see {@link https://threejs.org/docs/#api/en/lights/SpotLight SpotLight}
 * @see {@link https://threejs.org/docs/#api/en/lights/PointLight PointLight}
 * @see {@link https://threejs.org/docs/#api/en/helpers/SpotLightHelper SpotLightHelper}
 * @see {@link https://threejs.org/docs/#api/en/helpers/PointLightHelper PointLightHelper}
 */
function createLights2(scene, target) {
  // This light globally illuminates all objects in the scene equally.
  // This light cannot be used to cast shadows as it does not have a direction.
  ambientLight2 = new THREE.AmbientLight(Colors.white, 2);

  pointLight = new THREE.PointLight(Colors.white, 0.5, 0);
  pointLight.castShadow = false;
  pointLight.position.set(0, 1, 0);
  /**
   * This displays a helper object consisting of a spherical Mesh
   * for visualizing a PointLight.
   * @class PointLightHelper
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/helpers/PointLightHelper PointLightHelper}
   */

  /**
   * Create a helper for the point light (optional)
   * @type {THREE.PointLightHelper}
   * @global
   */
  objects.pointLightHelper = new THREE.PointLightHelper(
    pointLight,
    0.05,
    Colors.red,
  );
  scene.add(objects.pointLightHelper);
  objects.pointLightHelper.update();

  // SPOTLIGHT
  spotLight = new THREE.SpotLight(Colors.white, 0.3, 300, deg2rad(40), 1, 0);
  /**
   * This displays a cone shaped helper object for a SpotLight.
   * @class SpotLightHelper
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/helpers/SpotLightHelper SpotLightHelper}
   */

  /**
   * Create a helper for the spot light (optional)
   * @type {THREE.SpotLightHelper}
   * @global
   */
  objects.spotLightHelper = new THREE.SpotLightHelper(spotLight);
  objects.spotLightHelper.name = "spotLightHelper";
  spotLight.castShadow = true;
  spotLight.position.set(0, 0, 5);
  scene.add(objects.spotLightHelper);

  objects.spotLightHelper.update();
  if (target !== undefined) spotLight.target = target;

  scene.add(ambientLight2);
  scene.add(pointLight);
  scene.add(spotLight);

  scene.remove(shadowLight);
  scene.remove(hemisphereLight);
  scene.remove(ambientLight);
  scene.remove(objects.cameraHelper);
}

/**
 * Entry point when font is loaded.
 * @param {FontLoader.FontLoader} font text font.
 * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer WebGLRenderer}
 * @see {@link TextGeometry.TextGeometry}
 * @see {@link https://threejs.org/docs/#api/en/extras/core/Shape Shape}
 * @see {@link https://threejs.org/docs/#api/en/scenes/Scene Scene}
 * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.toneMapping WebGLRenderer.toneMapping}
 */
function start(font) {
  /**
   * <p>Key handler.</p>
   * Calls {@link handleKeyPress} whenever any of these keys is pressed:
   * <ul>
   *  <li>Space</li>
   *  <li>ArrowUp</li>
   *  <li>ArrowDown</li>
   *  <li>ArrowLeft</li>
   *  <li>ArrowRight</li>
   * </ul>
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

  const canvas = document.getElementById("theCanvas");

  /**
   * To actually be able to display anything with three.js,
   * we need three things: scene, camera and renderer,
   * so that we can render the scene with camera.
   * @class Scene
   * @memberof THREE
   * @see {@link https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene Creating a scene}
   */

  /**
   * <p>A scene.</p>
   * @type {THREE.Scene}
   * @global
   */
  objects.scene = new THREE.Scene();
  const scene = objects.scene;
  const width = canvas.width;
  const height = canvas.height;
  const aspect = width / height;

  /**
   * <p>Camera that uses perspective projection.</p>
   *
   * This projection mode is designed to mimic the way the human eye sees.
   * It is the most common projection mode used for rendering a 3D scene.
   * @class PerspectiveCamera
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera PerspectiveCamera}
   */

  /**
   * <p>A perspective camera.</p>
   * @type {THREE.PerspectiveCamera}
   * @global
   */
  objects.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

  objects.camera.position.x = 1.5;
  objects.camera.position.y = 1.5;
  objects.camera.position.z = 2;
  objects.camera.up.set(0, 1, 0);
  objects.camera.lookAt(new THREE.Vector3(0, 0, 0));

  /**
   * The WebGL renderer displays your beautifully crafted scenes using WebGL.
   * @class WebGLRenderer
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer WebGLRenderer}
   */

  /**
   * <p>A renderer.</p>
   * @type {THREE.WebGLRenderer}
   * @global
   */
  objects.renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  const renderer = objects.renderer;
  handleWindowResize();

  renderer.setClearColor(Colors.antique);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;

  /**
   * <p>A container for everything: plane, pilot and {@link localAxes local axes}.</p>
   * Set the rotation order for Euler angles for this object container
   * to intrinsic "YZX": head (yaw), pitch, roll.
   * @type {THREE.Object3D}
   * @global
   */
  objects.holder = new THREE.Object3D();
  const holder = objects.holder;
  holder.rotation.order = "YZX";

  /**
   * <p>Callback invoked when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @global
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  function handleWindowResize() {
    let h = window.innerHeight;
    let w = window.innerWidth;
    if (h > w) {
      h = w / aspect; // aspect < 1
    } else {
      w = h * aspect; // aspect > 1
    }
    renderer.setSize(w, h);
    objects.camera.aspect = aspect;
    objects.camera.updateProjectionMatrix();
  }

  /**
   * @summary Executed when the window is resized.
   * <p>Appends an event listener for events whose type attribute value is resize.</p>
   * <p>The {@link handleWindowResize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @param {Event} event the document view is resized.
   * @param {callback} function function to run when the event occurs.
   * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
   * @event resize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  window.addEventListener("resize", handleWindowResize, false);

  /**
   * An axis object to visualize the 3 axes in a simple way.
   * The X axis is red. The Y axis is green. The Z axis is blue.
   * @class AxesHelper
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/helpers/AxesHelper AxesHelper}
   */

  /**
   * Create a helper for the axes (optional).
   * Geometry for the global coordinate axes.
   * @type {THREE.AxesHelper}
   * @global
   */
  objects.axesHelper = new THREE.AxesHelper(5);

  drawLocalAxes(holder, font);
  // drawGlobalAxes(scene);

  if (!selector.axes) {
    holder.remove(objects.localAxes);
  } else {
    scene.add(objects.axesHelper);
  }

  drawTwoOctagons(holder);

  const airplane = createAirPlane(holder);

  scene.add(holder);

  // A plane to receive shadow.
  const planeGeometry = new THREE.PlaneGeometry(5000, 5000, 20, 20);
  const material = new THREE.ShadowMaterial();
  material.opacity = 0.1;
  /**
   * <p>Class representing triangular polygon mesh based objects.</p>
   * Also serves as a base for other classes such as
   * {@link https://threejs.org/docs/#api/en/objects/SkinnedMesh SkinnedMesh}.
   * @class Mesh
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/objects/Mesh Mesh}
   */

  /**
   * <p>A plane for shadow.</p>
   * @type {THREE.Mesh}
   * @global
   */
  objects.shadowPlane = new THREE.Mesh(planeGeometry, material);
  objects.shadowPlane.receiveShadow = true;
  //objects.shadowPlane.lookAt(new THREE.Vector3(0, 1.5, 0));
  objects.shadowPlane.rotateX(-Math.PI / 2);
  objects.shadowPlane.position.y = -1;

  scene.add(objects.shadowPlane);

  createLights2(scene, holder);
  createLights(scene);

  /**
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop renderer.setAnimationLoop}
   * parameter is a {@link animate callback,} which
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

  /**
   * A closure to render the application.
   * @return {animate} animation callback.
   * @function
   * @global
   * @see {@link https://threejs.org/docs/#api/en/core/Object3D.rotation Object3D.rotation}
   * @see {@link https://threejs.org/docs/#api/en/core/Object3D.rotateX Object3D.rotateX}
   */
  const render = (function () {
    const increment = deg2rad(0.5);
    const rotFunc = {
      x: (ang) => holder.rotateX(ang),
      y: (ang) => holder.rotateY(ang),
      z: (ang) => holder.rotateZ(ang),
    };
    const hairInc = {
      x: 25,
      y: 100,
      z: 50,
    };

    /**
     * Animation callback.
     * @callback animate
     */
    return () => {
      const x = deg2rad(euler["x"]);
      const y = deg2rad(euler["y"]);
      const z = deg2rad(euler["z"]);

      if (selector.auto_rotate) {
        // Rotate the propeller
        airplane.propeller.rotation.x += 0.3;
        airplane.pilot.updateHairs(hairInc[axis]);

        rotFunc[axis](increment);
        euler["x"] = rad2deg(holder.rotation.x);
        euler["y"] = rad2deg(holder.rotation.y);
        euler["z"] = rad2deg(holder.rotation.z);
        displayAngles();
      } else {
        holder.rotation.set(x, y, z);
      }
      renderer.render(scene, objects.camera);
    };
  })();
}
