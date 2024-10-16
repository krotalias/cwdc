/**
 * @file
 *
 * <p>Sample solution for homework 3,
 * <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.html">problem 3</a>, done in {@link https://threejs.org Three.js}</p>
 *
 * <p>Here we are setting the objects' scale, rotation, and position
 * properties, with {@link https://threejs.org/docs/#api/en/core/Object3D.matrixAutoUpdate matrixAutoUpdate}
 * set to true (default).</p>
 *
 * Internally, Three.js uses these values to set the object's model matrix to
 * Translate * Rotate * Scale based on these properties.
 *
 * @author Paulo Roma
 * @since 10/11/2014
 * @see <a href="/cwdc/13-webgl/examples/three/content/RotatingSquare.html?rpc=2">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/RotatingSquare.js">source</a>
 * @see <iframe width="420" height="650" src="/cwdc/13-webgl/examples/three/content/RotatingSquare.html?rpc=4"></iframe>
 */

"use strict";

/**
 * Three.js module.
 * @external THREE
 * @see https://threejs.org/docs/#manual/en/introduction/Installation
 */
let THREE;

/**
 * Returns a number fractional part and its number of digits.
 * @param {Number} n float number.
 * @returns {Object<fractional:String,ndigits:Number>} fractional part and number of digits.
 * @see https://en.wikipedia.org/wiki/Decimal#Decimal_fractions
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
 * @see https://en.wikipedia.org/wiki/Decimal_separator
 */
function roundNumber(n, dig) {
  const limit = 10 ** dig;
  return Math.round(n * limit) / limit;
}

/**
 * <p>Entry point when page is loaded.</p>
 * @param {Number} rpc revolutions per cycle.
 * @see <img src="../cross-4.png" width="256">
 * @see https://threejs.org/docs/#api/en/geometries/PlaneGeometry
 * @see https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
 */
function mainEntrance(rpc = 2) {
  /**
   * To actually be able to display anything with three.js,
   * we need three things: scene, camera and renderer,
   * so that we can render the scene with camera.
   * @class Scene
   * @memberof external:THREE
   * @see https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
   */

  /**
   * <p>A scene.</p>
   * @var {external:THREE.Scene}
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
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/cameras/OrthographicCamera
   */

  /**
   * <p>An orthographic camera.</p>
   * Ortho args are: left, right, top, bottom (backwards!), near, far.
   * @var {external:THREE.PerspectiveCamera}
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
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/renderers/WebGLRenderer
   */

  /**
   * <p>A renderer.</p>
   * @var {external:THREE.WebGLRenderer}
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
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/geometries/CircleGeometry
   */

  /**
   * <p>A circle geometry.</p>
   * @var {external:THREE.CircleGeometry}
   * @global
   */
  const sCircleGeom = new THREE.CircleGeometry(1, 32);

  /**
   * <p>Class representing triangular polygon mesh based objects.</p>
   * Also serves as a base for other classes such as
   * {@link https://threejs.org/docs/#api/en/objects/SkinnedMesh SkinnedMesh}.
   * @class Mesh
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/objects/Mesh
   */

  /**
   * <p>A solid circle.</p>
   * @var {external:THREE.Mesh}
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
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/core/BufferGeometry
   */

  /**
   * <p>A hollow circle geometry.</p>
   * @var {external:THREE.BufferGeometry}
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
   * @memberof external:THREE
   * @see https://threejs.org/docs/#api/en/objects/Line
   */

  /**
   * <p>A hollow circle.</p>
   * @var {external:THREE.Line}
   * @global
   */
  const hCircle = new THREE.Line(hCircleGeom, m);
  hCircle.scale.set(0.65, 0.65, 1.0);
  scene.add(hCircle);

  scene.add(rect1);
  scene.add(rect2);

  /**
   * <p>Add a new point to the position attribute of the BufferGeometry.</p>
   * @param {external:THREE.Line} line a line object.
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

    let cycles = 1;
    let { fractional, ndigits } = getFractionalPart(rpc);
    if (!Number.isInteger(rpc)) {
      const limit = 10 ** ndigits;
      // these numbers do not have any common factor with 10
      // e.g, (4 * n) % 10 == 0 or (2 * n) % 5 == 0 => n = 5
      // 2 -> [5], 4 -> [5], 5 -> [2,4], 6 -> [5], 8 -> [5]
      if (["1", "3", "7", "9"].includes(fractional[ndigits - 1])) {
        cycles = limit;
      } else {
        for (cycles = 2; cycles < limit; ++cycles) {
          // if (Number.isInteger(rpc * cycles)) break;
          let n = (rpc * 360 * cycles) % 360;
          if (n < 1 || n > 359) break;
        }
      }
    }

    let totalAngle = rpc == 0 ? 360 : 360 * rpc * cycles;

    // holds the curve points. Could be used positions buffer, instead.
    const points = [];
    // complete curve has already been created
    let added = false;
    // curve has been finished
    let finished = false;
    // trying to set a reasonable speed
    increment *= rpc != 0 ? (rpc > 1 ? rpc : rpc * 3) : 2;
    // maximum number of points to close the curve
    let npoints = Math.ceil(totalAngle / increment);
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
    )} revolutions = ${Number(cycles)} cycles`;

    /**
     * Increments the rotation angle by "increment" in each frame
     * and renders the scene.
     * @callback render
     * @see https://threejs.org/docs/#manual/en/introduction/How-to-update-things
     * @see https://threejs.org/docs/#api/en/materials/LineBasicMaterial.linewidth
     * @see https://threejs.org/docs/#api/en/math/MathUtils.degToRad
     */
    return () => {
      let angr = rpc == 0 ? 0 : THREE.MathUtils.degToRad(angle / rpc);
      let angs = THREE.MathUtils.degToRad(angle);
      let tx = 0.65 * Math.cos(angr);
      let ty = 0.65 * Math.sin(angr);
      let d = 0.4;

      // vertical
      rect1.position.set(tx, ty, 0.0);
      rect1.rotation.z = angs;
      // horizontal
      rect2.position.set(tx, ty, 0.0);
      rect2.rotation.z = angs;

      ang.innerHTML = `${angle.toFixed(0)}°`;

      let x = d * Math.cos(angs + Math.PI / 2) + tx;
      let y = d * Math.sin(angs + Math.PI / 2) + ty;

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
        let material = new THREE.LineBasicMaterial({
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
 */
addEventListener("load", (event) => {
  /**
   * <p>Self invoking function to load threejs module dynamically based on safari version.</p>
   * @function loadThreejs
   * @async
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
   */

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // complete revolutions about the center per cycle
  let rpc = urlParams.get("rpc") || "2";

  let ndigits = getFractionalPart(rpc).ndigits;
  let negative = rpc < 0;
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
