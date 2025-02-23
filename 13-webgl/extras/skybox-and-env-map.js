/**
 * @file
 *
 * Summary.
 * <p>This example combines a skybox with a fully reflective object.</p>
 * The skybox and teapot can be rotated independently.
 * The teapot seems to be reflecting its environment, <br>
 * but it's really just that the teapot and skybox use the same {@link loadTextureCube cubemap texture}.
 *
 * <p>To get this to work, we use two <a href="../../showCode.php?f=extras/skybox-and-env-map">shader programs</a>,
 * one for the skybox and one for the teapot.</p>
 *
 * <p>To get the {@link https://www.humus.name/index.php?page=Textures reflection map} to work with a rotatable skybox,
 * the reflected ray in the teapot shader is transformed <br>
 * by the {@link invVT inverse of the view transform} rotation matrix.<br>
 * (The {@link modelview view transform} is applied to both the {@link cubeSB skybox} and the {@link teapot}).</p>
 *
 * <p>The teapot is rotated by an additional modeling transformation.</p>
 *
 * @author Paulo Roma
 * @author {@link https://math.hws.edu/eck/ David J. Eck}
 * @since 01/01/2019
 * @see <a href="/cwdc/13-webgl/extras/skybox-and-env-map.html?m=0">teapot</a>
 * @see <a href="/cwdc/13-webgl/extras/skybox-and-env-map.html?m=1">cube</a>
 * @see <a href="/cwdc/13-webgl/extras/skybox-and-env-map.html?m=2">sphere</a>
 * @see <a href="/cwdc/13-webgl/extras/skybox-and-env-map.html?m=3">torus</a>
 * @see <a href="/cwdc/13-webgl/extras/skybox-and-env-map.js">source</a>
 * @see {@link https://math.hws.edu/eck/cs424/notes2013/19_GLSL.html The Shader Language for WebGL}
 * @see {@link https://learnopengl.com/Advanced-OpenGL/Cubemaps Cubemaps & Skyboxes}
 * @see {@link https://math.hws.edu/eck/cs424/notes2013/webgl/skybox-and-reflection/ hws code}
 * @see <a href="https://glmatrix.net/docs/index.html">glmatrix</a>
 *       {@link https://cdnjs.com/libraries/gl-matrix/3.4.0/ (CDN)}
 * @see <iframe width="512" height="512" src="/cwdc/13-webgl/extras/skybox-and-env-map.html?m=0"></iframe>
 */

"use strict";

import { mat3, mat4 } from "/cwdc/13-webgl/lib/gl-matrix/dist/esm/index.js";

/**
 * 4x4 Matrix
 * @name mat4
 * @type {glMatrix.mat4}
 * @see {@link https://glmatrix.net/docs/module-mat4.html glMatrix.mat4}
 */

/**
 * 3x3 Matrix
 * @name mat3
 * @type {glMatrix.mat3}
 * @see {@link https://glmatrix.net/docs/module-mat3.html glMatrix.mat3}
 */

/**
 * The webgl context.
 * @type {WebGL2RenderingContext}
 */
var gl;

/**
 * For drawing the skybox.
 * @type {GLint}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation WebGLRenderingContext: getAttribLocation() method}
 */
var aCoords_SB;
var uProjection_SB;
var uModelview_SB;
var prog_SB;

/**
 * For drawing the reflective object.
 * @type {GLint}
 */
var aCoords;
var aNormal;
var uProjection;
var uModelview;
var uNormalMatrix;
var uInvVT;
var prog;

/**
 * Projection matrix.
 * @type {mat4}
 */
var projection = mat4.create();

/**
 * Modelview matrix.
 * @type {mat4}
 */
var modelview;

/**
 * The transposed inverse of the model view matrix.
 * @type {mat3}
 */
var normalMatrix = mat3.create();

/**
 * The inverse of the view transform rotation matrix.
 * @type {mat3}
 */
var invVT = mat3.create();

/**
 * The cubemap texture object.
 * @type {WebGLTexture}
 */
var texID;

/**
 * File names in the texture directory.
 * @type {Array<String>}
 */
var texDir;

/**
 * The texture index.
 * @type {Number}
 */
var texCnt = 0;

/**
 * The cube that is the skybox.
 * @type {createModelSB.model}
 */
var cubeSB;

/**
 * The model (default is a teapot).
 * @type {createModel.model}
 */
var teapot;

/**
 * A simpleRotator object to enable rotation by mouse dragging.
 * Provides the view transform that is applied to both skybox and teapot.
 * @type {SimpleRotator}
 */
var rotator;

/**
 * Additional rotations applied as modeling transform to the reflective object.<br>
 * Modified by pressing arrow and home keys.
 * @type {Number}
 */
var rotX = 0;
/** @type {Number} */
var rotY = 0;

/**
 * Draw the skybox and the teapot.
 */
function draw() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(projection, Math.PI / 3, 1, 10, 2000);

  modelview = rotator.getViewMatrix();
  mat3.normalFromMat4(normalMatrix, modelview);

  // Draw the skybox, with the viewing transform from the rotator.

  gl.useProgram(prog_SB); // Select the shader program that is used for the skybox.
  gl.uniformMatrix4fv(uProjection_SB, false, projection);
  if (texID) {
    gl.enableVertexAttribArray(aCoords_SB);
    cubeSB.render();
    gl.disableVertexAttribArray(aCoords_SB);
  }

  // Get the inverse of the rotation that was applied to the skybox.
  // This is needed in the teapot shader to account for the rotation
  // of the skybox.  (Note that it is passed to the shader in the
  // teapot's render function.)

  mat3.fromMat4(invVT, modelview);
  mat3.invert(invVT, invVT);

  // Add modeling rotations to the view transform.

  mat4.rotateX(modelview, modelview, rotX);
  mat4.rotateY(modelview, modelview, rotY);

  mat3.normalFromMat4(normalMatrix, modelview);

  // Draw the teapot.

  gl.useProgram(prog); // Select the shader program that is used for the teapot.
  gl.uniformMatrix4fv(uProjection, false, projection);
  if (texID) {
    gl.enableVertexAttribArray(aCoords);
    gl.enableVertexAttribArray(aNormal);
    teapot.render();
    gl.disableVertexAttribArray(aCoords);
    gl.disableVertexAttribArray(aNormal);
  }
}

/**
 * Load the cube texture.
 *
 * @param {String} imgDir directory holding the six images for each face of the cube.
 * @return {void}
 * @function
 */
let loadTextureCube;

/**
 * A closure for returning a function to load the cube texture.
 * The variable gl (webgl context) must be in the global context.
 * @return {cubemap}
 * @see {@link https://www.pngwing.com/en/search?q=cube+map Cube Map png images}
 * @see {@link http://paulbourke.net/panorama/cubemaps/ Converting to/from cubemaps}
 * @see {@link https://www.youtube.com/watch?v=8sVvxeKI9Pk OpenGL Tutorial 19 - Cubemaps & Skyboxes}
 */
function _loadTextureCube() {
  const img = new Array(6);
  const urls = [
    "posx.jpg",
    "negx.jpg",
    "posy.jpg",
    "negy.jpg",
    "posz.jpg",
    "negz.jpg",
  ];
  const targets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];

  /**
   * Callback for loading the cube texture.
   * @param {String} imgDir directory holding the six images for each face of the cube.
   * @callback cubemap
   *
   */
  return (imgDir = "skybox") => {
    let ct = 0;
    for (let i = 0; i < 6; i++) {
      img[i] = new Image();
      img[i].onload = function () {
        ct++;
        if (ct == 6) {
          texID = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
          for (let j = 0; j < 6; j++) {
            gl.texImage2D(
              targets[j],
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              img[j],
            );
            gl.texParameteri(
              gl.TEXTURE_CUBE_MAP,
              gl.TEXTURE_WRAP_S,
              gl.CLAMP_TO_EDGE,
            );
            gl.texParameteri(
              gl.TEXTURE_CUBE_MAP,
              gl.TEXTURE_WRAP_T,
              gl.CLAMP_TO_EDGE,
            );
          }
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
          draw();
        }
      };
      img[i].src = `${imgDir}/${urls[i]}`;
    }
  };
}

/**
 * Create a model with three buffers and a render function.
 *
 * @param {modelData} modelData raw model data.
 * @property {Object} model
 * @property {WebGLBuffer} model.coordsBuffer - coordinate buffer.
 * @property {WebGLBuffer} model.normalBuffer - normal buffer.
 * @property {WebGLBuffer} model.indexBuffer - index buffer.
 * @property {Number} model.count - number of indices.
 * @property {function} model.render - render function.
 * @returns {model} created model.
 */
function createModel(modelData) {
  // For creating the teapot model.
  var model = {};
  model.coordsBuffer = gl.createBuffer();
  model.normalBuffer = gl.createBuffer();
  model.indexBuffer = gl.createBuffer();
  model.count = modelData.indices.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
  console.log(modelData.vertexPositions.length);
  console.log(modelData.indices.length);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
  model.render = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
    gl.vertexAttribPointer(aCoords, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(uModelview, false, modelview);
    gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);
    gl.uniformMatrix3fv(uInvVT, false, invVT);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
  };
  return model;
}

/**
 * Create a skybox model with two buffers and a render function.
 *
 * @param {modelData} modelData raw model data.
 * @property {Object} model
 * @property {WebGLBuffer} model.coordsBuffer - coordinate buffer.
 * @property {WebGLBuffer} model.indexBuffer - index buffer.
 * @property {Number} model.count - number of indices.
 * @property {function} model.render - render function.
 * @returns {model} created model.
 */
function createModelSB(modelData) {
  // For creating the skybox cube model.
  var model = {};
  model.coordsBuffer = gl.createBuffer();
  model.indexBuffer = gl.createBuffer();
  model.count = modelData.indices.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
  console.log(modelData.vertexPositions.length);
  console.log(modelData.indices.length);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
  model.render = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
    gl.vertexAttribPointer(aCoords_SB, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(uModelview_SB, false, modelview);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
  };
  return model;
}

/**
 * <p>An event listener for the keydown event.</p>
 * It is installed by the {@link init} function.
 * @param {KeyboardEvent} evt key pressed.
 */
function doKey(evt) {
  var rotationChanged = true;
  switch (evt.code) {
    case "ArrowLeft":
      rotY -= 0.15;
      break; // left arrow
    case "ArrowRight":
      rotY += 0.15;
      break; // right arrow
    case "ArrowUp":
      rotX -= 0.15;
      break; // up arrow
    case "ArrowDown":
      rotX += 0.15;
      break; // down arrow
    case "Enter":
      rotX = rotY = 0;
      break; // return
    case "Home":
      rotX = rotY = 0;
      break; // home
    case "Escape":
      texCnt = (texCnt + 1) % texDir.length;
      loadTextureCube(`../examples/cubemaps/${texDir[texCnt]}`);
      break;
    default:
      rotationChanged = false;
  }
  if (rotationChanged) {
    evt.preventDefault();
    draw();
  }
}

/**
 * Creates and initializes a WebGLProgram object.
 * @param {WebGL2RenderingContext} gl
 * @param {String} vertexShaderSource vertex shader code.
 * @param {String} fragmentShaderSource fragment shader code.
 * @returns {WebGLProgram} WebGLProgram object.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createProgram WebGLRenderingContext: createProgram() method}
 */
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  var vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vertexShaderSource);
  gl.compileShader(vsh);
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
  }
  var fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fragmentShaderSource);
  gl.compileShader(fsh);
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw "Link error in program:  " + gl.getProgramInfoLog(prog);
  }
  return prog;
}

/**
 * Returns a shader source code.
 * @param {String} elementID element identifier.
 * @returns {String} source code.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent Node: textContent property}
 */
function getTextContent(elementID) {
  var element = document.getElementById(elementID);
  return element.textContent;

  /* completely unnecessary!!
  var node = element.firstChild;
  var str = "";
  while (node) {
    if (node.nodeType == 3)
      // this is a text node
      str += node.textContent;
    node = node.nextSibling;
  }
  return str;
*/
}

/**
 * <p>Promise for returning an array with all directory names in directory '../examples/cubemaps'.</p>
 *
 * <p>Calls a php script via ajax, since Javascript doesn't have access to the filesystem.</p>
 * Please, note that php runs on the server, and javascript on the browser.
 * @type {Promise<Array<String>>}
 * @see <a href="/cwdc/6-php/reaDirectories.php">files</a>
 * @see {@link https://stackoverflow.com/questions/31274329/get-list-of-filenames-in-folder-with-javascript Get list of filenames in folder with Javascript}
 * @see {@link https://api.jquery.com/jquery.ajax/ jQuery.ajax()}
 */
var readDirectoryNames = new Promise((resolve, reject) => {
  $.ajax({
    type: "GET",
    url: "/cwdc/6-php/readDirectories_.php",
    data: {
      dir: "/cwdc/13-webgl/examples/cubemaps",
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
 * <p>Entry point when page is {@link WindowLoadCallback loaded}.</p>
 * @param {Number} m model type.
 * @returns {void}
 */
async function init(m) {
  try {
    var canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
      gl = canvas.getContext("experimental-webgl");
    }
    if (!gl) {
      throw "Could not create WebGL context.";
    }

    let aspect = canvas.width / canvas.height;

    /**
     * Array holding cubemap names to create textures.
     * @type {Array<String>}
     */
    texDir = await readDirectoryNames
      .then((arr) => {
        return arr.length > 0 ? arr : ["skybox"];
      })
      .catch((error) => {
        console.log(`${error}`);
        return [
          "ForbiddenCity",
          "LancellottiChapel",
          "Yokohama3",
          "colosseum",
          "park",
          "skybox",
          "pisa",
        ];
      });

    // we need gl already defined
    loadTextureCube = _loadTextureCube();

    /**
     * <p>Fires when the document view (window) has been resized.</p>
     * Also resizes the canvas and viewport.
     * @callback handleWindowResize
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
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
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
     */
    window.addEventListener("resize", handleWindowResize, false);

    handleWindowResize();

    var vertexShaderSource = getTextContent("vshaderSB");
    var fragmentShaderSource = getTextContent("fshaderSB");
    prog_SB = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    aCoords_SB = gl.getAttribLocation(prog_SB, "coords");
    uModelview_SB = gl.getUniformLocation(prog_SB, "modelview");
    uProjection_SB = gl.getUniformLocation(prog_SB, "projection");
    vertexShaderSource = getTextContent("vshader");
    fragmentShaderSource = getTextContent("fshader");
    prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    aCoords = gl.getAttribLocation(prog, "coords");
    aNormal = gl.getAttribLocation(prog, "normal");
    uModelview = gl.getUniformLocation(prog, "modelview");
    uProjection = gl.getUniformLocation(prog, "projection");
    uNormalMatrix = gl.getUniformLocation(prog, "normalMatrix");
    uInvVT = gl.getUniformLocation(prog, "inverseViewTransform");
    gl.enable(gl.DEPTH_TEST);
    rotator = new SimpleRotator(canvas, draw);
    rotator.setView([0, 0, 1], [0, 1, 0], 40);
    switch (m) {
      case 0:
        teapot = createModel(teapotModel);
        break;
      case 1:
        // Could use a cube instead of a teapot, to test the reflection more easily.
        teapot = createModel(cube(15));
        break;
      case 2:
        teapot = createModel(uvSphere(10, 30, 30));
        break;
      default:
        teapot = createModel(uvTorus(10, 5, 30, 30));
        break;
    }
    cubeSB = createModelSB(cube(1000));
  } catch (e) {
    document.getElementById("message").innerHTML =
      "Could not initialize WebGL: " + e;
    return;
  }
  loadTextureCube();

  /**
   * <p>Key handler.</p>
   * Calls {@link doKey} whenever any of these keys is pressed:
   * <ul>
   *  <li>Escape</li>
   *  <li>Home</li>
   *  <li>Enter</li>
   *  <li>ArrowUp</li>
   *  <li>ArrowDown</li>
   *  <li>ArrowLeft</li>
   *  <li>ArrowRight</li>
   * </ul>
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event Element: keydown event}
   */
  document.addEventListener("keydown", doKey, false);
  draw();
}

/**
 * Reset the model to its initial position when the "Reset View" button is clicked.
 * @event clickReset
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
document.getElementById("reset").onclick = function () {
  rotX = rotY = 0;
  rotator.setView([0, 0, 1], [0, 1, 0], 40);
  draw();
};

/**
 * Move to the next texture when the "Next Texture" button is clicked.
 * @event clickNext
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
document.getElementById("next").onclick = function () {
  texCnt = (texCnt + 1) % texDir.length;
  loadTextureCube(`../examples/cubemaps/${texDir[texCnt]}`);
  draw();
};

/**
 * <p>Loads the {@link init inital model} when the page is loaded.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => {
  const mname = ["teapot", "cube", "sphere", "torus"];
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var model = urlParams.get("m") || "2";
  init(+model);
  document.querySelector("#model").innerHTML = mname[model];
});
