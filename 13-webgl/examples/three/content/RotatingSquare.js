/**
 * @file
 *
 * Summary.
 *
 * <p>Tracing Closed Curves with Epicycles
 * (see the <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.html">WebGL version</a>),
 * done in {@link https://threejs.org Three.js}</p>
 *
 * <p>This application traces the path of the combined motion of the center
 * of a small square orbit ({@link https://www.ufrgs.br/amlef/glossario/orbita-deferente/ deferent})
 * around the center of a circle
 * and within the orbit itself
 * ({@link https://www.creativescala.org/creative-scala/cycles/epicycles.html epicycle}).</p>
 *
 * <ul>
 * <li>An {@link https://en.wikipedia.org/wiki/Deferent_and_epicycle epicycle}
 * means a circle moving on another circle.</li>
 *
 * <li>The number (rpc) of revolutions of the square (epicycles)
 * per orbit cycle (deferent) is passed
 * as a {@link https://ahrefs.com/blog/url-parameters/ URL parameter} (query string).</li>
 *
 * <li>The total angle for completing a deferent cycle is rpc * 360°. The
 * challenge is when rpc is not an integer. In this case, multiplying rpc
 * by the {@link toNaturalFactor smallest integer}
 * (cycles) that turns it into a natural number results in an integer
 * multiple of revolutions, closing the curve. E.g.:</li>
 *
 * <ul>
 * <li>rpc = 2.14, cycles = 50, then 2.14 * 360 * 50 / 360 = 107 revolutions.</li>
 * <li>rpc = 2.114, cycles = 500, then 2.114 * 360 * 500 / 360 = 1057 revolutions.</li>
 * <li>rpc = 0.114, cycles = 500, then 0.114 * 360 * 500 / 360 = 57 revolutions.</li>
 * </ul>
 *
 * <li>Here we are setting the objects' scale, rotation, and position
 * properties, with {@link https://threejs.org/docs/#api/en/core/Object3D.matrixAutoUpdate matrixAutoUpdate}
 * set to true (default).</li>
 *
 * <li>Internally, Three.js uses these values to set the object's model matrix to
 * Translate * Rotate * Scale based on these properties.</li>
 * </ul>
 *
 * <img src="/cwdc/13-webgl/homework/hw3/Epicycle.png" width="256">
 *
 *
 * @author Paulo Roma
 * @since 10/11/2014
 * @license Licensed under the {@link https://www.opensource.org/licenses/mit-license.php MIT license}.
 * @copyright © 2024 Paulo R Cavalcanti.
 * @see <a href="/cwdc/13-webgl/examples/three/content/RotatingSquare.html?rpc=2">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/RotatingSquare.js">source</a>
 * @see {@link https://sciencedemonstrations.fas.harvard.edu/presentations/ptolemaic-epicycle-machine Ptolemaic Epicycle Machine}
 * @see {@link https://study.com/learn/lesson/epicycle-ptolemy-astronomy-diagrams.html Epicycle in Astronomy & Meaning of Ptolemy}
 * @see <iframe width="420" height="650" src="/cwdc/13-webgl/examples/three/content/RotatingSquare.html?rpc=4"></iframe>
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
let THREE;

/**
 * Returns a number fractional part and its number of digits.
 * @param {Number} n float number.
 * @returns {Object<fractional:String,ndigits:Number>} fractional part and number of digits.
 * @see {@link https://en.wikipedia.org/wiki/Decimal#Decimal_fractions Decimal fractions}
 */
function getFractionalPart(n) {
  if (Number.isInteger(+n)) return { fractional: "0", ndigits: 0 };
  const decimalStr = n.toString().split(".")[1];
  return { fractional: decimalStr, ndigits: +decimalStr.length };
}

/**
 * Returns a number with a fixed amount of decimal places.
 * @param {Number} n float number.
 * @param {Number} dig number of digits.
 * @returns {Number} n with dig decimal places.
 * @see {@link https://en.wikipedia.org/wiki/Decimal_separator Decimal separator}
 */
function roundNumber(n, dig) {
  const limit = 10 ** dig;
  return Math.round(n * limit) / limit;
}

/**
 * <p>Greatest Common Divisor.</p>
 * Returns the highest
 * number that divides into two other numbers exactly.
 * @param {Number} x first integer.
 * @param {Number} y second integer.
 * @return {Number} GCD.
 * @see {@link https://dmitripavlutin.com/swap-variables-javascript/ 4 Ways to Swap Variables in JavaScript}
 * @see {@link https://www.mathsisfun.com/greatest-common-factor.html Greatest Common Factor}
 */
function gcd(x, y) {
  while (x) {
    [x, y] = [y % x, x];
  }
  return y;
}

/**
 * <p>Least Common Multiple.</p>
 * Returns the smallest
 * number that can be divided by x and y without any remainder.
 * @function
 * @param {Number} x first integer.
 * @param {Number} y second integer.
 * @return {Number} LCM.
 * @see {@link https://en.wikipedia.org/wiki/Least_common_multiple Least common multiple}
 * @see {@link https://www.w3resource.com/python-exercises/challenges/1/python-challenges-1-exercise-37.php Find the smallest positive number that is evenly divisible by all of the numbers from 1 to 30}
 */
const lcm = (x, y) => (x * y) / gcd(x, y);

/**
 * <p>Get all common factors of a set of numbers.</p>
 * getCommonFactors(18, 36, 90) → [1, 2, 3, 6, 9, 18]
 * @param {...Number} args set of integers.
 * @returns {Array<Number>} commom factors.
 */
function getCommonFactors(...args) {
  let common_factors = [1];
  let min_val = Math.min(...args);
  for (let fx = 2; fx <= min_val; fx++)
    if (args.every((arg) => (arg / fx) % 1 === 0)) common_factors.push(fx);
  return common_factors;
}

/**
 * <p>Given a rational number f = n/d (float), returns the
 * smallest integer k such that k * f becomes a natural number.</p>
 * <p>Write f in fraction form,
 * then divide denominator by {@link gcd}(numerator, denominator).</p>
 * <ul>
 * <li>E.g., for 30.25 = 3025/100, gcd is 25</li>
 * <li>Then return 100/25 = 4, that is,</li>
 * <li>30.25 = 3025/25 / 100/25 = 121/4 ⇒ 30.25 * 4 = 121.</li>
 * </ul>
 * @param {Number} f float number.
 * @return {Number} integer multiplier.
 */
function toNaturalFactor(f) {
  const { ndigits } = getFractionalPart(f);
  if (!Number.isInteger(f)) {
    const denominator = 10 ** ndigits;
    const numerator = Math.trunc(f * denominator);
    return denominator / gcd(numerator, denominator);
  }
  return 1;
}

/**
 * <p>Dumb version of {@link toNaturalFactor}.</p>
 * [2,4,5,6,8] have a common multiple
 * with 10 lesser than 10
 * <ul>
 *  <li> (4 * x) % 10 == 0 or (2 * x) % 5 == 0 ⇒ x = 5</li>
 *  <li> 2 → [5], 4 → [5], 5 → [2,4], 6 → [5], 8 → [5]</li>
 * </ul>
 * [1,3,7,9] have all common multiples with 10 greater or equal than 10
 *
 * <p>E.g:</p>
 * <ul>
 *  <li>3.25 * f = i ∈ ℕ</li>
 *  <li>3.25 * f = i ∈ ℕ</li>
 *  <li>325/100 * f = i</li>
 *  <li>325 = i * 100/f</li>
 *  <li>100/f ∈ ℕ ⇒ f is a factor of 100 </li>
 *  <li>3.25 * 4 = 13</li>
 *  <li>325 * 0.04 = 13</li>
 *  <li>325 / 13 = 25 = gcd(325,100)</li>
 * </ul>
 * @param {Number} f float number.
 * @returns {Number} integer multiplier.
 * @see {@link https://byjus.com/maths/factors-of-100/ Factors of 100}
 * @see {@link https://byjus.com/gcd-calculator/ GCD Calculator}
 * @see {@link https://www.cuemath.com/numbers/common-multiples/ Common Multiples}
 */
function toNaturalFactor2(f) {
  const { fractional, ndigits } = getFractionalPart(f);
  const factors = {
    1: [2, 5, 10],
    2: [2, 4, 5, 10, 20, 25, 50, 100],
    3: [2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500, 1000],
  };
  if (!Number.isInteger(f)) {
    const limit = 10 ** ndigits;
    if (["1", "3", "7", "9"].includes(fractional[ndigits - 1])) {
      return limit;
    } else {
      for (const factor of factors[ndigits]) {
        const n = (f * factor).toFixed(6);
        // if (Number.isInteger(n)) {
        // if (Math.trunc(n) === n) {
        // if ((n * 360) % 360 === 0) {
        if (n % 1 === 0) {
          return factor;
        }
      }
      return limit;
    }
  }
  return 1;
}

/**
 * <p>Entry point when page is loaded.</p>
 * @param {Number} rpc revolutions per cycle.
 * @see <img src="../cross-4.png" width="256">
 * @see {@link https://threejs.org/docs/#api/en/geometries/PlaneGeometry PlaneGeometry}
 * @see {@link https://threejs.org/docs/#api/en/materials/MeshBasicMaterial MeshBasicMaterial}
 */
function mainEntrance(rpc = 2) {
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
  const scene = new THREE.Scene();

  /**
   * <p>Camera that uses orthographic projection.</p>
   *
   * In this projection mode, an object's size in the rendered image stays constant
   * regardless of its distance from the camera.
   *
   * This can be useful for rendering 2D scenes and UI elements, amongst other things.
   * @class OrthographicCamera
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/cameras/OrthographicCamera OrthographicCamera}
   */

  /**
   * <p>An orthographic camera.</p>
   * Ortho args are: left, right, top, bottom (backwards!), near, far.
   * @type {THREE.OrthographicCamera}
   * @global
   */
  const camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, -1, 1);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 1;

  const ourCanvas = document.getElementById("theCanvas");

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
  const renderer = new THREE.WebGLRenderer({
    canvas: ourCanvas,
    antialias: true,
  });
  renderer.setClearColor(0x00cccc);

  // create a red square
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // vertical rectangle
  const rect1 = new THREE.Mesh(geometry, material);
  rect1.scale.set(0.15, 0.4, 1.0);

  // horizontal rectangle
  const rect2 = new THREE.Mesh(geometry, material);
  rect2.scale.set(0.4, 0.15, 1.0);

  // little square is a child of vertical rectangle
  const rect3 = new THREE.Mesh(geometry, material);
  rect1.add(rect3);
  // in fact this is 0.4, because the scale of rect1
  // affects the translation (shrinks the space)
  rect3.translateY(1); // 0.2 + 0.125 + 0.075
  rect3.scale.set(1, 0.15 / 0.4, 1);

  /**
   * This is a filled (solid) circle.
   * @class CircleGeometry
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/geometries/CircleGeometry CircleGeometry}
   */

  /**
   * <p>A circle geometry.</p>
   * @type {THREE.CircleGeometry}
   * @global
   */
  const sCircleGeom = new THREE.CircleGeometry(1, 32);

  /**
   * <p>Class representing triangular polygon mesh based objects.</p>
   * Also serves as a base for other classes such as
   * {@link https://threejs.org/docs/#api/en/objects/SkinnedMesh SkinnedMesh}.
   * @class Mesh
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/objects/Mesh Mesh}
   */

  /**
   * <p>A solid circle.</p>
   * @type {THREE.Mesh}
   * @global
   */
  const sCircle = new THREE.Mesh(sCircleGeom, material);
  sCircle.scale.set(0.65, 0.65, 1.0);
  // scene.add(sCircle);

  /**
   * <p>A representation of mesh, line, or point geometry.</p>
   * Includes vertex positions, face indices, normals, colors, UVs,
   * and custom attributes within buffers, reducing the cost of
   * passing all this data to the GPU.
   * @class BufferGeometry
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/core/BufferGeometry BufferGeometry}
   */

  /**
   * <p>A hollow circle geometry.</p>
   * @type {THREE.BufferGeometry}
   * @global
   */
  const hCircleGeom = new THREE.BufferGeometry().setFromPoints(
    new THREE.Path().absarc(0, 0, 1, 0, Math.PI * 2).getSpacedPoints(50),
  );
  const m = new THREE.LineBasicMaterial({ color: "aqua", linewidth: 3 });

  /**
   * <p>A continuous line.</p>
   *
   * This is nearly the same as LineSegments;
   * the only difference is that it is rendered using gl.LINE_STRIP instead of gl.LINES
   * @class Line
   * @memberof THREE
   * @see {@link https://threejs.org/docs/#api/en/objects/Line Line}
   */

  /**
   * <p>A hollow circle.</p>
   * @type {THREE.Line}
   * @global
   */
  const hCircle = new THREE.Line(hCircleGeom, m);
  hCircle.scale.set(0.65, 0.65, 1.0);
  scene.add(hCircle);

  scene.add(rect1);
  scene.add(rect2);

  /**
   * <p>Add a new point to the position attribute of the BufferGeometry.</p>
   * @param {THREE.Line} line a line object.
   * @param {Number} x point abscissa.
   * @param {Number} y point ordinate.
   * @function
   * @global
   */
  function updatePositions(line, x, y) {
    if (typeof updatePositions.index == "undefined") {
      updatePositions.index = 0;
    }
    const positions = line.geometry.attributes.position.array;

    positions[updatePositions.index++] = x;
    positions[updatePositions.index++] = y;
    positions[updatePositions.index++] = 0;
  }

  /**
   * <p>Fires when the document view (window) has been resized.</p>
   * Also resizes the canvas and viewport.
   * @callback handleWindowResize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  function handleWindowResize() {
    let h = window.innerHeight - 20;
    let w = window.innerWidth - 20;
    const aspect = 1;
    if (h > w) {
      h = w / aspect; // aspect < 1
    } else {
      w = h * aspect; // aspect > 1
    }
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.render(scene, camera);
  }

  /**
   * <p>Fires when the document view (window) has been resized.</p>
   * <p>The {@link handleWindowResize callback} argument sets the callback
   * that will be invoked when the event is dispatched.</p>
   * @summary Appends an event listener for events whose type attribute value is resize.
   * @param {Event} event a generic event.
   * @param {callback} function function to run when the event occurs.
   * @param {Boolean} useCapture handler is executed in the bubbling or capturing phase.
   * @event resize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  window.addEventListener("resize", handleWindowResize, false);

  handleWindowResize();

  /**
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop renderer.setAnimationLoop}
   * parameter is a {@link render callback}, which
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
   * A closure to set up an animation loop in which the
   * angle grows by "increment" in each frame.
   * @return {render} a callback for rendering the scene.
   * @function
   * @global
   */
  const runAnimation = (() => {
    let angle = 0.0;
    let increment = rpc > 1 ? 2 : 1;

    const cycles = toNaturalFactor(rpc);

    const totalAngle = rpc == 0 ? 360 : 360 * rpc * cycles;

    // holds the curve points. Could be used positions buffer, instead.
    const points = [];
    // complete curve has already been created
    let added = false;
    // curve has been finished
    let finished = false;
    // trying to set a reasonable speed
    increment *= rpc != 0 ? (rpc > 1 ? rpc : rpc * 3) : 2;
    // maximum number of points to close the curve
    const npoints = Math.ceil(totalAngle / increment);
    // number of vertices (points) so far in the curve
    let drawCount = 0;
    const material = new THREE.LineBasicMaterial({
      color: "orange",
      linewidth: 3,
    });

    // geometry
    const bgeometry = new THREE.BufferGeometry();

    // attributes: 3 coordinates per point
    // pre-allocated buffer that will be updated in each frame
    const positions = new Float32Array(npoints * 3);
    bgeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // line
    const line = new THREE.Line(bgeometry, material);
    scene.add(line);

    const ang = document.getElementById("ang");
    const tang = document.getElementById("tang");
    tang.innerHTML = `${Number(totalAngle.toFixed(2))}° = ${Number(
      (rpc * cycles).toFixed(2),
    )} revolutions = ${Number(cycles)} cycles<br \>Speed = ${increment.toFixed(2)} (${(totalAngle / (60 * increment)).toFixed(2)}s/cycle)`;

    /**
     * Increments the rotation angle by "increment" in each frame
     * and renders the scene.
     * @callback render
     * @see {@link https://threejs.org/docs/#manual/en/introduction/How-to-update-things How to update things}
     * @see {@link https://threejs.org/docs/#api/en/materials/LineBasicMaterial.linewidth linewidth}
     * @see {@link https://threejs.org/docs/#api/en/math/MathUtils.degToRad degToRad}
     */
    return () => {
      const angr = rpc == 0 ? 0 : THREE.MathUtils.degToRad(angle / rpc);
      const angs = THREE.MathUtils.degToRad(angle);
      const tx = 0.65 * Math.cos(angr);
      const ty = 0.65 * Math.sin(angr);
      const d = 0.4;

      // vertical
      rect1.position.set(tx, ty, 0.0);
      rect1.rotation.z = angs;
      // horizontal
      rect2.position.set(tx, ty, 0.0);
      rect2.rotation.z = angs;

      ang.innerHTML = `${angle.toFixed(0)}°`;

      const x = d * Math.cos(angs + Math.PI / 2) + tx;
      const y = d * Math.sin(angs + Math.PI / 2) + ty;

      if (points.length < npoints) {
        points.push(new THREE.Vector2(x, y));
        // create a scratch polyline
        updatePositions(line, x, y);
        if (drawCount++ > 2) {
          // draw curve
          line.geometry.setDrawRange(0, drawCount - 1);
          // required after the first render
          line.geometry.attributes.position.needsUpdate = true;
        }
      } else if (!added) {
        finished = true;
        // remove scratch polyline
        scene.remove(line);
        // close the curve
        points.push(points[0]);
      }

      if (finished && !added) {
        const material = new THREE.LineBasicMaterial({
          color: "yellow",
          linewidth: 3,
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const curve = new THREE.Line(geometry, material);
        scene.add(curve);
        added = true;
      }

      renderer.render(scene, camera);

      angle += increment;
      angle %= totalAngle;
    };
  })();
}

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
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap &lt;script type="importmap"&gt;}
 */
addEventListener("load", (event) => {
  /**
   * <p>Self invoking function to load threejs module dynamically based on safari version.</p>
   * @function loadThreejs
   * @async
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap &lt;script type="importmap"&gt;}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import import()}
   */

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // complete revolutions about the center per cycle
  let rpc = urlParams.get("rpc") || "2";

  let ndigits = getFractionalPart(rpc).ndigits;
  const negative = rpc < 0;
  rpc = rpc >= 0 ? +rpc : -1 / rpc;
  if (negative && ndigits == 0) ndigits = 2;
  if (ndigits > 0) {
    // maximum of 3 digits, to avoid overdraw
    rpc = roundNumber(+rpc, Math.min(3, ndigits));
  }
  document.getElementById("rpc").innerHTML = rpc == 0 ? "∞" : rpc;

  const { userAgent } = navigator;
  let oldSafari = false;
  if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    let version = userAgent.split("Version/")[1];
    version = version.split("Safari")[0];
    console.log(`Safari v${version}`);
    if (version < "16.4") {
      oldSafari = true;
      import("https://threejs.org/build/three.module.js?module").then(
        (module) => {
          THREE = module;
          mainEntrance(rpc);
          return;
        },
      );
    }
  }

  // any other case use importmap
  if (!oldSafari) {
    import("three").then((module) => {
      THREE = module;
      mainEntrance(rpc);
    });
  }
});
