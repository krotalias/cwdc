/**
 * @file
 *
 * <p>Sample solution for homework 3,
 * <a href="/cwdc/13-webgl/homework/hw3/RotatingSquare.html">problem 3</a>, done in Three.js</p>
 *
 * <p>Here we are setting the objects' scale, rotation, and position
 * properties, with matrixAutoUpdate set to true (default).</p>
 *
 * Internally, Three.js uses these values to set the object's model matrix to
 * Translate * Rotate * Scale based on these properties.
 *
 * @author Paulo Roma
 * @since 10/11/2014
 * @see https://threejs.org/docs/?q=scene#manual/en/introduction/Creating-a-scene
 * @see https://threejs.org/docs/#api/en/geometries/PlaneGeometry
 * @see https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
 * @see https://threejs.org/docs/?q=mesh#api/en/objects/Mesh
 * @see https://threejs.org/docs/#api/en/core/BufferGeometry
 * @see https://threejs.org/docs/#api/en/core/Object3D
 * @see https://threejs.org/docs/#api/en/math/MathUtils.degToRad
 * @see <a href="/cwdc/13-webgl/examples/three/content/RotatingSquare.html?rpc=2">link</a>
 * @see <a href="/cwdc/13-webgl/examples/three/content/RotatingSquare.js">source</a>
 * @see <img src="../cross-4.png" width="256">
 */

"use strict";

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
 */
function mainEntrance(rpc = 2) {
  var scene = new THREE.Scene();

  // ortho args are left, right, top, bottom (backwards!), near, far
  var camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, -1, 1);

  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 1;

  var ourCanvas = document.getElementById("theCanvas");

  var renderer = new THREE.WebGLRenderer({
    canvas: ourCanvas,
    antialias: true,
  });
  renderer.setClearColor(0x00cccc);

  // create a red square
  var geometry = new THREE.PlaneGeometry(1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // vertical rectangle
  var rect1 = new THREE.Mesh(geometry, material);
  rect1.scale.set(0.15, 0.4, 1.0);

  // horizontal rectangle
  var rect2 = new THREE.Mesh(geometry, material);
  rect2.scale.set(0.4, 0.15, 1.0);

  // little square is a child of vertical rectangle
  var rect3 = new THREE.Mesh(geometry, material);
  rect1.add(rect3);
  // in fact this is 0.4, because the scale of rect1
  // affects the translation (shrinks the space)
  rect3.translateY(1); // 0.2 + 0.125 + 0.075
  rect3.scale.set(1, 0.15 / 0.4, 1);

  /* this is a filled (solid) circle
    geometry = new THREE.CircleGeometry(1, 32);
    const circle = new THREE.Mesh(geometry, material);
    circle.scale.set(0.65, 0.65, 1.0);
    scene.add(circle);
    */

  // create circle
  let g = new THREE.BufferGeometry().setFromPoints(
    new THREE.Path().absarc(0, 0, 1, 0, Math.PI * 2).getSpacedPoints(50)
  );
  let m = new THREE.LineBasicMaterial({ color: "aqua", linewidth: 3 });
  let c = new THREE.Line(g, m);
  c.scale.set(0.65, 0.65, 1.0);
  scene.add(c);

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
   * <p>A built in function that can be used instead of
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}.</p>
   * The {@link https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop renderer.setAnimationLoop}
   * parameter is a {@link render callback,} which
   * will be called every available frame.<br>
   * If null is passed it will stop any already ongoing animation.
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
  var runAnimation = (() => {
    var angle = 0.0;
    var increment = 1.0;

    var cycles = 1;
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

    var totalAngle = rpc == 0 ? 360 : 360 * rpc * cycles;

    // holds the curve points. Could be used positions buffer, instead.
    var points = [];
    // complete curve has already been created
    var added = false;
    // curve has been finished
    var finished = false;
    // trying to set a reasonable speed
    increment *= rpc != 0 ? (rpc > 1 ? rpc : rpc * 3) : 2;
    // maximum number of points to close the curve
    var npoints = Math.ceil(totalAngle / increment);
    // number of vertices (points) so far in the curve
    var drawCount = 0;
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
    var line = new THREE.Line(bgeometry, material);
    scene.add(line);

    var ang = document.getElementById("ang");
    var tang = document.getElementById("tang");
    tang.innerHTML = `${Number(totalAngle.toFixed(2))}° = ${Number(
      (rpc * cycles).toFixed(2)
    )} revolutions = ${Number(cycles)} cycles`;

    /**
     * Increments the rotation angle by "increment" in each frame
     * and renders the scene.
     * @callback render
     * @see https://threejs.org/docs/#manual/en/introduction/How-to-update-things
     * @see https://threejs.org/docs/#api/en/materials/LineBasicMaterial.linewidth
     */
    return () => {
      var angr = rpc == 0 ? 0 : THREE.MathUtils.degToRad(angle / rpc);
      var angs = THREE.MathUtils.degToRad(angle);
      var tx = 0.65 * Math.cos(angr);
      var ty = 0.65 * Math.sin(angr);
      var d = 0.4;

      // vertical
      rect1.position.set(tx, ty, 0.0);
      rect1.rotation.z = angs;
      // horizontal
      rect2.position.set(tx, ty, 0.0);
      rect2.rotation.z = angs;

      ang.innerHTML = `${angle.toFixed(0)}°`;

      var x = d * Math.cos(angs + Math.PI / 2) + tx;
      var y = d * Math.sin(angs + Math.PI / 2) + ty;

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