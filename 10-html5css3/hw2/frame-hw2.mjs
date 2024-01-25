/**
 * @file
 *
 * Summary.
 * <p>A change of frame using {@link https://glmatrix.net gl-matrix}.</p>
 *
 * <p>To use ES6 modules in nodejs (version ≥ 13):</p>
 * <ol>
 *  <li> file extension should be ".mjs" </li>
 *  <li> add {"type": "module",} to package.json (located in current or parent directory)</li>
 *  <li> should be used ES6 module syntax: import and export </li>
 * </ol>
 *
 * <pre>
 *  Usage:
 *  - npm init
 *  - npm install gl-matrix
 *  - node frame-hw2.mjs
 * </pre>
 *
 * @author Paulo Roma
 * @since 03/02/2023
 *
 * @see https://techsparx.com/nodejs/esnext/dynamic-import-2.html
 * @see https://nodejs.medium.com/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663
 * @see <a href="/cwdc/10-html5css3/hw2/frame-hw2.mjs">source</a>
 * @see <a href="/cwdc/10-html5css3/hw2/hw2.pdf">doc</a>
 * @see <a href="/cwdc/13-webgl/examples/lighting/content/doc-lighting2/global.html#viewMatrix">view matrix</a>
 * @see <img src="../hw2.png" width="512">
 */

// nodejs aware
import { vec3, vec4, mat3, mat4 } from "gl-matrix";

/**
 * An IIFE (Immediately Invoked Function Expression)
 * for running the hw2 example of frame change.
 * @function
 * @global
 * @name main_IIFE
 */
(function main() {
  /**
   * Returns a string representation of a Float32Array,
   * formatted as a matrix, for printing to the console.
   * @param {vec2|vec3|mat3|mat4} m Float32array.
   * @return {String} m values arranged in rows and columns.
   * @global
   */
  function format(m) {
    if (m == undefined) {
      console.log();
      return;
    }

    let strMat = "";
    if (m.length <= 4) {
      strMat = "".concat(
        ...m.map((c) => `${c.toFixed(2).replace(/\.00$/, "")}  `),
      );
    } else if (m.length <= 16) {
      let inc = Math.sqrt(m.length);
      let st = "";
      for (let i = 0; i < inc; ++i) {
        for (let j = 0; j < m.length; j += inc) {
          st += `${m[i + j].toFixed(2).replace(/\.00$/, "")}  `;
        }
        strMat += `${st}\n`;
        st = "";
      }
    }
    return strMat.trim();
  }

  // -------------------------------------------

  var camera = mat3.create();
  var viewMatrix = mat3.create();

  /*
   * f (world space), f' (camera)
   *
   * f to f': f' = f * viewMatrix
   * world space to camera
   * viewMatrix = Translate(11, 4) * RotateZ(90) * Scale(1, 2)
   * T(1, 0) = (0,1)
   * T(0, 1) = (-2,0)
   *
   * viewMatrix
   *   0.0 -2.0 11.0
   *   1.0 0.0 4.0
   *   0.0 0.0 1.0
   *
   *  P' = 11.0 9.0 1.0
   *  Q' = 11.0 11.0 1.0
   *  R' = 7.0 11.0 1.0
   *  O' = 0 0 1.0
   */

  var pnts = {
    R: [5, 0, 1],
    P: [7, 0, 1],
    Q: [7, 2, 1],
    V: [-4, 11 / 2, 1],
  };
  var s = mat3.fromScaling([], [1, 2]);
  var r = mat3.fromRotation([], Math.PI / 2);
  var t = mat3.fromTranslation([], [11, 4]);
  mat3.multiply(viewMatrix, r, s);
  mat3.multiply(viewMatrix, t, viewMatrix);

  console.log("viewMatrix");
  console.log(format(viewMatrix));
  console.log();

  let R_ = vec3.transformMat3([], pnts.R, viewMatrix);
  let P_ = vec3.transformMat3([], pnts.P, viewMatrix);
  let Q_ = vec3.transformMat3([], pnts.Q, viewMatrix);
  // camera position in world space
  let O_ = vec3.transformMat3([], pnts.V, viewMatrix);

  console.log(`R → R': ${format(pnts.R)} → ${format(R_)}`);
  console.log(`P → P': ${format(pnts.P)} → ${format(P_)}`);
  console.log(`Q → Q': ${format(pnts.Q)} → ${format(Q_)}`);
  console.log(`V → O': ${format(pnts.V)} → ${format(O_)}`);
  console.log();

  /*
   * f' to f: f = f' * camera
   * camera to world space
   * camera = mat3.invert([], viewMatrix); - camera is not ortho-normal (there is a scale)
   * camera = Scale(1, 1/2) * RotateZ(-90) * Translate(-11, -4)
   * T(1, 0) = (0, -1/2)
   * T(0, 1) = (1, 0)
   *
   * camera
   *    0.0 1.0 -4.0
   *    -0.5 0.0 5.5
   *    0.0 0.0 1.0
   *
   *  P = 5.0 0.0 1.0
   *  Q = 7.0 0.0 1.0
   *  R = 7.0 2.0 1.0
   *  V = -4.0 5.5 1.0
   *
   * s = mat3.fromScaling([], [1, 1 / 2]);
   * r = mat3.fromRotation([], -Math.PI / 2);
   * t = mat3.fromTranslation([], [-11, -4]);
   * mat3.multiply(camera, r, t);
   * mat3.multiply(camera, s, camera);
   */

  mat3.invert(camera, viewMatrix);

  console.log("camera");
  console.log(format(camera));
  console.log();

  let R = vec3.transformMat3([], R_, camera);
  let P = vec3.transformMat3([], P_, camera);
  let Q = vec3.transformMat3([], Q_, camera);
  let V = vec3.transformMat3([], O_, camera);

  console.log(`R' → R: ${format(R_)} → ${format(R)}`);
  console.log(`P' → P: ${format(P_)} → ${format(P)}`);
  console.log(`Q' → Q: ${format(Q_)} → ${format(Q)}`);
  console.log(`O' → V: ${format(O_)} → ${format(V)}`);
  console.log();

  // -------------------------------------------

  camera = mat4.create();
  viewMatrix = mat4.create();

  /**
   * view = translate(0, 0, -5) * rotate(45, 1, 0, 0) * rotate(-30, 0, 1, 0)
   * world space to camera
   */

  pnts = {
    R: [5, 0, 0, 1],
    P: [7, 0, 0, 1],
    Q: [7, 2, 0, 1],
    V: [1.77, 3.54, 3.06, 1], // eye
  };

  var s = mat4.fromScaling([], [1, 1, 1]);
  var ry = mat4.fromYRotation([], (-30 * Math.PI) / 180);
  var rx = mat4.fromXRotation([], (45 * Math.PI) / 180);
  var t = mat4.fromTranslation([], [0, 0, -5]);

  mat4.multiply(viewMatrix, ry, s);
  mat4.multiply(viewMatrix, rx, viewMatrix);
  mat4.multiply(viewMatrix, t, viewMatrix);
  console.log("viewMatrix");
  console.log(format(viewMatrix));
  console.log();

  console.log("viewMatrix - lookAt");
  console.log(format(mat4.lookAt([], pnts.V, [0, 0, 0], [0, 1, 0])));
  console.log();

  R_ = vec4.transformMat4([], pnts.R, viewMatrix);
  P_ = vec4.transformMat4([], pnts.P, viewMatrix);
  Q_ = vec4.transformMat4([], pnts.Q, viewMatrix);
  O_ = vec4.transformMat4([], pnts.V, viewMatrix);

  console.log(`R → R': ${format(pnts.R)} → ${format(R_)}`);
  console.log(`P → P': ${format(pnts.P)} → ${format(P_)}`);
  console.log(`Q → Q': ${format(pnts.Q)} → ${format(Q_)}`);
  console.log(`V → O': ${format(pnts.V)} → ${format(O_)}`);
  console.log();

  /**
   * camera = rotate(30, 0, 1, 0) * rotate(-45, 1, 0, 0) * translate(0, 0, 5)
   * camera to world space
   *
   * s = mat4.fromScaling([], [1, 1, 1]);
   * ry = mat4.fromYRotation([], (30 * Math.PI) / 180);
   * rx = mat4.fromXRotation([], (-45 * Math.PI) / 180);
   * t = mat4.fromTranslation([], [0, 0, 5]);
   * mat4.multiply(camera, rx, t);
   * mat4.multiply(camera, ry, camera);
   * mat4.multiply(camera, s, camera);
   */

  mat4.invert(camera, viewMatrix);

  console.log("camera");
  console.log(format(camera));
  console.log();

  R = vec4.transformMat4([], R_, camera);
  P = vec4.transformMat4([], P_, camera);
  Q = vec4.transformMat4([], Q_, camera);
  V = vec4.transformMat4([], O_, camera);

  console.log(`R' → R: ${format(R_)} → ${format(R)}`);
  console.log(`P' → P: ${format(P_)} → ${format(P)}`);
  console.log(`Q' → Q: ${format(Q_)} → ${format(Q)}`);
  console.log(`O' → V: ${format(O_)} → ${format(V)}`);
  console.log();
})();
