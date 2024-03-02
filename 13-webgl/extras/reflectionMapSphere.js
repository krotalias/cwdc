/**
 * @file
 *
 * Summary.
 *
 * <p>Environment map.</p>
 * This is a Frankenstein program based on:
 * <ul>
 *    <li> {@link https://math.hws.edu/eck/cs424/notes2013/19_GLSL.html The Shader Language for WebGL} </li>
 *    <li> {@link https://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SIXTH_EDITION/CODE/WebGL/7E/07/reflectionMap2.html reflectionMap2.html} </li>
 *    <li> {@link https://glmatrix.net} </li>
 * </ul>
 * Basically, it creates eight object {@link createModel models}: subdivision sphere, three.js sphere, teapot, cube, ring, cylinder, cone, torus.<br>
 * Then, it uses a WebGL {@link https://learnopengl.com/Advanced-OpenGL/Cubemaps cubemap}
 * to reflect an {@link https://www.humus.name/index.php?page=Textures environment} onto the surface of the current rendered object.
 *
 * @author Paulo Roma Cavalcanti on 15/01/2016
 * @since 17/03/2017
 * @see <a href="/cwdc/13-webgl/extras/reflectionMapSphere.html?texture=ForbiddenCity">ForbiddenCity</a>
 * @see <a href="/cwdc/13-webgl/extras/reflectionMapSphere.html?texture=LancellottiChapel">LancellottiChapel</a>
 * @see <a href="/cwdc/13-webgl/extras/reflectionMapSphere.html?texture=colosseum">colosseum</a>
 * @see <a href="/cwdc/13-webgl/extras/reflectionMapSphere.html?texture=park">park</a>
 * @see <a href="/cwdc/13-webgl/extras/reflectionMapSphere.html?texture=skybox">skybox</a>
 * @see <a href="/cwdc/13-webgl/extras/reflectionMapSphere.js">source</a>
 * @see <a href="/cwdc/13-webgl/lib/simple-rotator.js">simple-rotator</a>
 * @see <a href="/cwdc/13-webgl/lib/tetrahedron-esm.js">tetrahedron-esm</a>
 * @see <a href="/cwdc/13-webgl/lib/basic-objects-IFS.js">basic-objects-IFS.js</a>
 * @see <a href="https://glmatrix.net/docs/index.html">glmatrix</a>
 * @see https://www.youtube.com/watch?v=8sVvxeKI9Pk
 * @see http://paulbourke.net/panorama/cubemaps/
 * @see https://www.pngwing.com/en/search?q=cube+map
 * @see <iframe width="600" height="600" src="/cwdc/13-webgl/extras/reflectionMapSphere.html?texture=LancellottiChapel"></iframe>
 */

"use strict";

import { mat3, mat4 } from "https://unpkg.com/gl-matrix@3.4.3/esm/index.js";

import { polyhedron } from "/cwdc/13-webgl/lib/tetrahedron-esm.js";

/**
 * The webgl context.
 * @type {WebGL2RenderingContext}
 */
var gl;

/**
 * Current shader.
 * @type {WebGLProgram}
 */
var program;

/**
 * When rotating using an arcball or Euler angles.
 * @type {Boolean}
 */
var arcBall = true;

/**
 * Marks the change of a rotation type, to get a smooth transition: arcball ↔ Euler angles.
 * @type {Boolean}
 */
var rotating = false;

/**
 * Cube map texture.
 * @type {WebGLTexture}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createTexture
 */
var cubeMap;

/**
 * Model to be rendered.
 * @type {createModel.model}
 */
var model;

/**
 * Change coordinate system, so the camera is at the origin.
 * @type {mat4}
 */
var modelViewMatrix = mat4.create();

/**
 * Transform normals by the current modelView.
 * @type {mat3}
 */
var normalMatrix = mat3.create();

/**
 * Object to enable rotation by mouse dragging (arcball).
 * @type {SimpleRotator}
 */
var rotator;

/**
 * Enum for identifying rotation axes.
 * @type {Object<{String: Number}>}
 */
var axis = {
  x: 0,
  y: 1,
  z: 2,
};

/**
 * Current rotation {@link axis}.
 * @type {Number}
 */
var rotAxis = axis.x;

/**
 * Current rotation angles about the three coordinate axes.
 * @type {Array<Number>}
 */
var theta = [0.0, 0.0, 0.0];

/**
 * Creates cube map textures and generates a mipmap.
 * @param {Array<GLenum>} targets binding points (targets) of the active texture.
 * @param {Array<HTMLImageElement>} images images for the six faces of the cube map.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
 */
function configureTexture(targets, images) {
  cubeMap = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

  for (var j = 0; j < 6; ++j) {
    gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[j]);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

  // we must wait the texture to be loaded. Otherwise, we may get a black image.
  if (arcBall) draw();
  else animation();
}

/**
 * <p>Loads the texture image array when the page is loaded.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @event load
 */
window.addEventListener("load", (event) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let texture = urlParams.get("texture") || "skybox";
  loadTexture(`../examples/cubemaps/${texture}`);
});

/**
 * <p>Loads the texture image array asynchronously and
 * calls {@link init} only when the last image is loaded.</p>
 * We do not know the order or when the six images finish loading.
 * @param {String} imageDir directory holding the six images.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
 * @see https://sites.google.com/site/csc8820/educational/how-to-implement-texture-mapping
 * @see https://www.evl.uic.edu/pape/data/Earth/
 */
function loadTexture(imageDir = "skybox") {
  const urls = [
    "posx.jpg",
    "negx.jpg",
    "posy.jpg",
    "negy.jpg",
    "posz.jpg",
    "negz.jpg",
  ];

  let loaded = 0;
  const img = new Array(6);
  for (let i = 0; i < 6; ++i) {
    img[i] = new Image();
    img[i].src = `${imageDir}/${urls[i]}`;
    img[i].onload = function () {
      ++loaded;
      if (loaded == 6) {
        console.log("CubeMap loaded");
        init(img);
      }
    };
  }
}

/**
 * <p>Entry point when page and {@link WindowLoadCallback cubemap} array are loaded.</p>
 * @param {Array<HTMLImageElement>} cubeMapArr image array.
 * @see https://learnopengl.com/Advanced-OpenGL/Face-culling
 */
function init(cubeMapArr) {
  var m = 0;
  var lmodel = []; // a list of pairs (model, view distance)
  var numTimesToSubdivide = 5;
  var canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL isn't available");
  }

  let aspect = canvas.width / canvas.height;

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
      h = w / aspect; // aspect < 1
    } else {
      w = h * aspect; // aspect > 1
    }
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  // mobile devices
  if (screen.width <= 800) {
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
    handleWindowResize();
  }

  gl.clearColor(250 / 255, 235 / 255, 215 / 255, 1.0);

  gl.enable(gl.DEPTH_TEST);
  // otherwise, just one side of a ring would be seen
  gl.disable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 3, 1, 1, 100);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "projectionMatrix"),
    false,
    projectionMatrix,
  );

  /**
   * Rotate aboux the x {@link rotAxis axis}.
   * @event click
   */
  document.getElementById("ButtonX").onclick = function () {
    rotAxis = axis.x;
  };

  /**
   * Rotate aboux the y {@link rotAxis axis}.
   * @event click
   */
  document.getElementById("ButtonY").onclick = function () {
    rotAxis = axis.y;
  };

  /**
   * Rotate aboux the z {@link rotAxis axis}.
   * @event click
   */
  document.getElementById("ButtonZ").onclick = function () {
    rotAxis = axis.z;
  };

  /**
   * Toggle {@link arcBall} rotation.
   * @event click
   */
  document.getElementById("ButtonT").onclick = function () {
    arcBall = !arcBall;
    if (!arcBall) {
      this.innerText = "ArcBall";
      document.getElementById("euler").style.display = "block";
      animation();
    } else {
      this.innerText = "Euler";
      document.getElementById("euler").style.display = "none";
    }
  };

  /**
   * Increment the model.
   * @event click
   */
  document.getElementById("ButtonM").onclick = function () {
    m = (m + 1) % lmodel.length;
    model = lmodel[m][0];
    rotator.setViewDistance(lmodel[m][1]);
    if (arcBall) {
      draw();
    }
  };

  lmodel.push([createModel(teapotModel), 35]);
  lmodel.push([createModel(cube(15)), 30]);
  lmodel.push([createModel(ring(5, 10, 30)), 30]);
  lmodel.push([createModel(uvCylinder(10, 20, 30, false, false)), 30]);
  lmodel.push([createModel(uvCone(10, 20, 30, false)), 30]);
  lmodel.push([createModel(uvTorus(10, 5, 30, 30)), 25]);
  lmodel.push([
    createModel(new polyhedron().octahedron({ n: numTimesToSubdivide })),
    2,
  ]);
  lmodel.push([createModel(uvSphere(10, 30, 30)), 30]);

  model = lmodel[0][0];

  rotator = new SimpleRotator(canvas, draw);
  rotator.setViewMatrix(modelViewMatrix);
  rotator.setViewDistance(lmodel[0][1]);

  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

  var targets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];
  configureTexture(targets, cubeMapArr);
}

/**
 * Returns the equivalent Euler angles of a given rotation matrix.
 * @param {Float32Array} R rotation matrix.
 * @returns {Array<Number>} Euler angles.
 */
function rotationMatrixToEulerAngles(R) {
  var R00, R10, R11, R12, R20, R21, R22;

  R00 = R[0];
  R10 = R[4];
  R11 = R[5];
  R12 = R[6];
  R20 = R[8];
  R21 = R[9];
  R22 = R[10];

  var sy = Math.sqrt(R00 * R00 + R10 * R10);

  // Whether the matrix is singular or not (determinant is 0).
  // Singular matrices are NOT invertible.
  var singular = sy < 1e-6;

  // Pay attention to the order in which the angles are stored
  var x, y, z;
  if (!singular) {
    x = Math.atan2(R21, R22);
    y = Math.atan2(-R20, sy);
    z = Math.atan2(R10, R00);
  } else {
    x = Math.atan2(-R12, R11);
    y = Math.atan2(-R20, sy);
    z = 0;
  }

  return [rad2deg(x), rad2deg(y), rad2deg(z)];
}

/**
 * Convert an angle in degrees to radians.
 * @param {Number} deg angle in degrees.
 * @returns {Number} angle in radians.
 */
let deg2rad = (deg) => (Math.PI / 180) * deg;

/**
 * Convert an angle in radians to degrees.
 * @param {Number} rad angle in radians.
 * @returns {Number} angle in degrees.
 */
let rad2deg = (rad) => (rad * 180) / Math.PI;

/**
 * Render the scene.
 */
function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!arcBall) {
    modelViewMatrix = rotator.getViewMatrix();
    if (!rotating) {
      theta[axis.x] = 0;
      theta[axis.y] = 0;
      theta[axis.z] = 0;
    } else {
      theta[rotAxis] += 1;
      theta[rotAxis] %= 360;
    }

    // get rotation without camera transformation.
    var mViewMatrix = mat4.create();
    mat4.rotateZ(mViewMatrix, mViewMatrix, deg2rad(theta[axis.z]));
    mat4.rotateY(mViewMatrix, mViewMatrix, deg2rad(theta[axis.y]));
    mat4.rotateX(mViewMatrix, mViewMatrix, deg2rad(theta[axis.x]));

    // add rotation to the current view matrix.
    mat4.multiply(modelViewMatrix, modelViewMatrix, mViewMatrix);

    rotating = true;
  } else {
    if (rotating) {
      rotator.setViewMatrix(modelViewMatrix);
      rotating = false;
    } else {
      modelViewMatrix = rotator.getViewMatrix();
    }
  }

  // normalMatrix should be set in camera space (after spin), so the texture does not move
  mat3.normalFromMat4(normalMatrix, modelViewMatrix);

  if (cubeMap) {
    model.render();
  } else {
    console.log("Cube Map Texture not available");
  }
}

/**
 * A closure to render the animation and set {@link requestId}.
 * @return {loop}
 */
const animation = (() => {
  let requestId = 0;

  /**
   * Animation loop.
   * @callback loop
   */
  return () => {
    if (requestId) {
      cancelAnimationFrame(requestId);
      requestId = 0;
    }
    if (!arcBall) {
      draw();
      requestId = requestAnimationFrame(animation);
    }
  };
})();

/**
 * Create a model with three buffers and a render function.
 *
 * @param {Object.<{vertexPositions: Float32Array, vertexNormals: Float32Array, vertexTextureCoords: Float32Array, indices: Uint16Array}>} modelData
 * @property {object} model
 * @property {WebGLBuffer} model.coordsBuffer - coordinate buffer.
 * @property {WebGLBuffer} model.normalBuffer - normal buffer.
 * @property {WebGLBuffer} model.indexBuffer - index buffer.
 * @property {Number} model.count - number of indices.
 * @property {function} model.render - render function.
 * @returns {model} created model.
 */
function createModel(modelData) {
  var model = {};
  var aCoords = gl.getAttribLocation(program, "vPosition");
  var aNormal = gl.getAttribLocation(program, "vNormal");
  var uModelview = gl.getUniformLocation(program, "modelViewMatrix");
  var uNormalMatrix = gl.getUniformLocation(program, "normalMatrix");
  gl.enableVertexAttribArray(aCoords);
  gl.enableVertexAttribArray(aNormal);
  model.coordsBuffer = gl.createBuffer();
  model.normalBuffer = gl.createBuffer();
  model.indexBuffer = gl.createBuffer();
  model.count = modelData.indices.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
  //console.log(modelData.vertexPositions.length);
  //console.log(modelData.indices.length);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
  model.render = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
    gl.vertexAttribPointer(aCoords, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(uModelview, false, modelViewMatrix);
    gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    //console.log(this.count);
  };
  return model;
}
