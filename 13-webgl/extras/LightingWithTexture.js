/**
 * @file
 *
 * Summary.
 * <p>Lighting, combined with texture mapping.</p>
 * Same as <a href="/cwdc/13-webgl/examples/lighting/content/doc-lighting2/index.html">Lighting2</a>,
 * except we define a 3x3 matrix for {@link https://learnopengl.com/Lighting/Materials material properties}
 * and a 3x3 matrix for {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL light properties}
 * that are passed to the fragment shader as
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform uniforms}.
 *
 * <p>Edit the {@link lightPropElements light}/{@link matPropElements material} matrices in the global variables to experiment.
 * Edit {@link startForReal} to choose a model and select
 * {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/shading-normals face or vertex normals}.</p>
 *
 * @author Paulo Roma
 * @since 30/01/2016
 * @see <a href="/cwdc/13-webgl/extras/LightingWithTexture.html">link</a>
 * @see <a href="/cwdc/13-webgl/extras/LightingWithTexture2.html">link2</a>
 * @see <a href="/cwdc/13-webgl/examples/texture/content/Texture.html">Chessboard Texture<a/>
 * @see https://en.wikipedia.org/wiki/Utah_teapot
 * @see <a href="/cwdc/13-webgl/extras/textures">textures</a>
 * @see <a href="/cwdc/13-webgl/extras/LightingWithTexture.js">source</a>
 * @see <a href="/cwdc/13-webgl/lib/basic-objects-IFS.js">basic-objects-IFS</a>
 * @see <img src="../images/teapot.png" width="512" title="Utah teapot">
 *      <img src="../images/tex.png" title="64x64 texture" width="310">
 * @see <img src="../images/sphere.png" width="512" title="texture in fragment shader">
 *      <img src="../images/anti-aliasing.png" height="340" title="sampling by pixel">
 * @see <img src="../images/aliasing-no-correction.png" height="340" title="spherical mapping discontinuity">
 *      <img src="../images/aliasing.png" height="340" title="texture coordinates fixed">
 *      <img src="../images/snake.png" height="340" title="rattle snake">
 * @see <img src="../textures/earth-nasa.jpg" height="340" title="earth from nasa">
 *      <img src="../images/Milla.png" height="340" title="Milla Jovovich">
 * @see <img src="../images/sphere-earth.png" height="340" title="texture in fragment shader">
 *      <img src="../images/teapot-earth.png" height="340" title="teapot points projected onto a sphere">
 */

"use strict";

const mat4 = glMatrix.mat4;
const mat3 = glMatrix.mat3;

/**
 * Array holding image file names to create textures.
 * @type {Array<String>}
 */
var imageFilename = ["BigEarth.jpg"];

/**
 * Current texture index.
 * @type {Number}
 */
var textureCnt = 0;

/**
 * Texture image.
 * @type {HTMLImageElement}
 * @see {@link ImageLoadCallback}
 */
var image;

/**
 * Number of subdivisions to turn a polyhedron into a sphere.
 * @type {Number}
 */
var numSubdivisions = limit.oct;

/**
 * Scale applied to a model to make its size adequate for rendering.
 * @type {Number}
 */
var mscale = 1;

/**
 * Turn the display of the model mesh/texture/axes/animation on/off.
 * @type {OBject<{lines:Boolean, texture:Boolean, axes:Boolean, paused:Boolean}>}
 */
var selector = {
  lines: document.getElementById("mesh").checked,
  texture: document.getElementById("texture").checked,
  axes: document.getElementById("axes").checked,
  paused: document.getElementById("pause").checked,
};

/**
 * Arcball.
 * @type {SimpleRotator}
 */
var rotator;

/**
 * Vertex coordinates for creating the axes.
 * @type {Float32Array}
 */
// prettier-ignore
var axisVertices = new Float32Array([
  0.0, 0.0, 0.0,
  1.5, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 1.5, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 1.5
]);

/**
 * Colors for creating the axes.
 * @type {Float32Array}
 */
// prettier-ignore
var axisColors = new Float32Array([
  1.0, 0.0, 0.0, 1.0,
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 1.0, 1.0
]);

// A few global variables...

/**
 * <p>Light properties.</p>
 * Ambient, diffuse and specular.
 * Generic white light.
 * <p>Remember this is column major.</p>
 * @type {Float32Array}
 */
// prettier-ignore
var lightPropElements = new Float32Array([
  0.5, 0.5, 0.5,
  0.7, 0.7, 0.7,
  0.7, 0.7, 0.7
]);

/* --------------------------------------------------------
// blue light with red specular highlights (because we can)
// prettier-ignore
var lightPropElements = new Float32Array([
  0.2, 0.2, 0.2,
  0.0, 0.0, 0.7,
  0.7, 0.0, 0.0
]);

// shiny green plastic
// prettier-ignore
var matPropElements = new Float32Array([
  0.3, 0.3, 0.3,
  0.0, 0.8, 0.0,
  0.8, 0.8, 0.8
]);
var shininess = 30;

// very fake looking white, useful for testing lights
// prettier-ignore
var matPropElements = new Float32Array([
  1, 1, 1,
  1, 1, 1,
  1, 1, 1
]);
var shininess = 20.0;

// clay or terracotta
// prettier-ignore
var matPropElements = new Float32Array([
  0.75, 0.38, 0.26,
  0.75, 0.38, 0.26,
  0.25, 0.20, 0.15 // weak specular highlight similar to diffuse color
]);
var shininess = 10.0;
------------------------------------------------------------- */

/**
 * <p>Material properties.</p>
 * Shiny brass.
 * <p>Remember this is column major.</p>
 * @type {Float32Array}
 * @see http://devernay.free.fr/cours/opengl/materials.html
 * @see https://docs.unity3d.com/Manual/StandardShaderMaterialCharts.html
 */
// prettier-ignore
var matPropElements = new Float32Array([
  0.33, 0.22, 0.03,
  0.78, 0.57, 0.11,
  0.99, 0.91, 0.81
]);
var shininess = 28.0;

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 */
var gl;

/**
 * Current model data.
 * @type {modelData}
 */
var theModel;

/**
 * Array with normal end points.
 * @type {Float32Array}
 */
var normal;

/**
 * Array with edges end points.
 * @type {Float32Array}
 */
var lines;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexNormalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var texCoordBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var indexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var axisBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var normalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var lineBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var axisColorBuffer;

/**
 * Handle to the texture object on the GPU.
 * @type {WebGLTexture}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/createTexture
 */
var textureHandle;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
var lightingShader;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
var colorShader;

/**
 * Model matrix.
 * @type {mat4}
 */
var modelMatrix = mat4.create();

/**
 * Rotation axis.
 * @type {String}
 */
var axis = "x";

/**
 * Whether uv spherical coordinates should be "fixed",
 * when converted from cartesian.
 * @type {Boolean}
 */
var fixuv = false;

/**
 * Toggle back face culling on/off.
 * @type {Boolean}
 * @see https://learnopengl.com/Advanced-OpenGL/Face-culling
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 */
var culling = true;

/**
 * Camera position.
 * @type {vec3}
 */
var eye = vec3.fromValues(1.77, 3.54, 3.0);

/**
 * View matrix.
 * @type {mat4}
 * @see <a href="/cwdc/downloads/apostila.pdf#page=109">View matrix</a>
 * @see <a href="/cwdc/downloads/PDFs/06_LCG_Transformacoes.pdf">Mudança de Base</a>
 * @see <a href="https://en.wikipedia.org/wiki/Change_of_basis">Change of Basis</a>
 * @see https://learn.microsoft.com/en-us/windows/win32/direct3d9/view-transform
 */
// prettier-ignore
var viewMatrix = mat4.lookAt(
  [],
  eye,                        // eye
  vec3.fromValues(0, 0, 0),   // at - looking at the origin
  vec3.fromValues(0, 1, 0)    // up vector - y axis
);

/**
 * Projection matrix.
 * @type {mat4}
 */
var projection = mat4.perspectiveNO([], (30 * Math.PI) / 180, 1.5, 0.1, 1000);

/**
 * An object containing raw data for
 * vertices, normal vectors, texture coordinates, and indices.
 * <p>Polyhedra have no index.</p>
 * @typedef {Object<{vertexPositions: Float32Array,
 *                   vertexNormals: Float32Array,
 *                   vertexTextureCoords: Float32Array,
 *                   indices: Uint16Array}>} modelData
 */

/**
 * <p>Promise for returning an array with all file names in directory './textures'.</p>
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
      dir: "/cwdc/13-webgl/extras/textures",
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
 * Given an instance of
 * <ul>
 * <li><a href="/cwdc/13-webgl/lib/three.js">THREE.BufferGeometry</a></li>
 * </ul>
 * returns an object containing raw data for
 * vertices, normal vectors, texture coordinates, and indices.
 * <p>Polyhedra have no index.</p>
 * @param {THREE.BufferGeometry} geom THREE.BoxGeometry,<br>
 *                                    THREE.ConeGeometry,<br>
 *                                    THREE.CylinderGeometry,<br>
 *                                    THREE.PlaneGeometry,<br>
 *                                    THREE.RingGeometry,<br>
 *                                    THREE.SphereGeometry,<br>
 *                                    THREE.TorusGeometry,<br>
 *                                    THREE.TorusKnotGeometry,<br>
 *                                    THREE.DodecahedronGeometry,<br>
 *                                    THREE.IcosahedronGeometry,<br>
 *                                    THREE.OctahedronGeometry,<br>
 *                                    THREE.TetrahedronGeometry.
 * @return {modelData}
 * @see <a href="https://threejs.org/docs/#api/en/core/BufferGeometry">BufferGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/BoxGeometry">BoxGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/ConeGeometry">ConeGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/CylinderGeometry">CylinderGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/PlaneGeometry">PlaneGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/RingGeometry">RingGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/SphereGeometry">SphereGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/TorusGeometry">TorusGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/TorusKnotGeometry">TorusKnotGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/DodecahedronGeometry">DodecahedronGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry">IcosahedronGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/OctahedronGeometry">OctahedronGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/TetrahedronGeometry">TetrahedronGeometry</a>
 */
function getModelData(geom) {
  return {
    vertexPositions: geom.getAttribute("position").array,
    vertexNormals: geom.getAttribute("normal").array,
    vertexTextureCoords: geom.getAttribute("uv").array,
    indices: geom.index ? geom.index.array : null,
  };
}

/**
 * <p>Matrix for taking normals into eye space.</p>
 * Return a matrix to transform normals, so they stay
 * perpendicular to surfaces after a linear transformation.
 * @param {mat4} model model matrix.
 * @param {mat4} view view matrix.
 * @returns {mat3} 3x3 normal matrix (transpose inverse) from the 4x4 modelview matrix.
 * @see <a href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48">𝑛′=(𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup>⋅𝑛</a>
 */
function makeNormalMatrixElements(model, view) {
  var modelview = mat4.multiply([], view, model);
  return mat3.normalFromMat4([], modelview);
}

/**
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String | null}
 * @see http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  let charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * <p>Closure for keydwon events.</p>
 * Chooses a model and which axis to rotate around.<br>
 * Maximum subdivision level is {@link limit}.oct for an octahedron (Uint16Array).<br>
 * When a new texture is selected, triggers callback {@link image} load event.
 * @param {KeyboardEvent} event keyboard event.
 * @return {key_event}
 * @function
 */
var handleKeyPress = ((event) => {
  let kbd = document.getElementById("kbd");
  let opt = document.getElementById("options");
  let zoomfactor = 0.7;
  let gscale = 1;

  /**
   * <p>Handler for keydwon events.</p>
   * @param {KeyboardEvent} event keyboard event.
   * @callback key_event callback to handle a key pressed.
   */
  return (event) => {
    var ch = getChar(event);
    kbd.innerHTML = ":";
    switch (ch) {
      case "m":
        numSubdivisions = (numSubdivisions + 1) % (limit.oct + 1);
        gscale = mscale = 1;
        document.getElementById("models").value = "5";
        theModel = createModel();
        kbd.innerHTML = ` (${8 * 4 ** numSubdivisions} triangles):`;
        break;
      case "M":
        numSubdivisions = numSubdivisions - 1;
        if (numSubdivisions < 0) numSubdivisions = limit.oct;
        gscale = mscale = 1;
        document.getElementById("models").value = "5";
        theModel = createModel();
        kbd.innerHTML = ` (${8 * 4 ** numSubdivisions} triangles):`;
        break;
      case " ":
        selector.paused = !selector.paused;
        document.getElementById("pause").checked = selector.paused;
        if (!selector.paused) document.getElementById(axis).checked = true;
        animate();
        return;
      case "l":
        selector.lines = !selector.lines;
        if (!selector.lines) selector.texture = true;
        document.getElementById("mesh").checked = selector.lines;
        document.getElementById("texture").checked = selector.texture;
        break;
      case "k":
        selector.texture = !selector.texture;
        if (!selector.texture) selector.lines = true;
        document.getElementById("texture").checked = selector.texture;
        document.getElementById("mesh").checked = selector.lines;
        break;
      case "a":
        selector.axes = !selector.axes;
        document.getElementById("axes").checked = selector.axes;
        break;
      case "x":
      case "y":
      case "z":
        axis = ch;
        selector.paused = false;
        document.getElementById(axis).checked = true;
        animate();
        break;
      case "s":
        // sphere from threejs
        gscale = mscale = 1;
        document.getElementById("models").value = "5";
        theModel = createModel(
          getModelData(new THREE.SphereGeometry(1, 48, 24))
        );
        break;
      case "S":
        // sphere
        this.mscale = mscale = 1;
        document.getElementById("models").value = "5";
        theModel = createModel();
        break;
      case "T":
        gscale = mscale = 0.6;
        document.getElementById("models").value = "8";
        theModel = createModel(
          getModelData(new THREE.TorusKnotGeometry(1, 0.4, 128, 16))
        );
        break;
      case "t":
        gscale = mscale = 0.1;
        document.getElementById("models").value = "7";
        theModel = createModel(uvTorus(10, 5, 30, 30), 0);
        break;
      case "u":
        // capsule from threejs
        gscale = mscale = 1.2;
        document.getElementById("models").value = "0";
        theModel = createModel(
          getModelData(new THREE.CapsuleGeometry(0.5, 0.5, 10, 20))
        );
        break;
      case "c":
        gscale = mscale = 0.15;
        document.getElementById("models").value = "3";
        theModel = createModel(uvCylinder(5, 10, 30, false, false));
        break;
      case "C":
        gscale = mscale = 0.8;
        document.getElementById("models").value = "1";
        theModel = createModel(uvCone(1, 2, 30, false));
        break;
      case "v":
        gscale = mscale = 0.6;
        document.getElementById("models").value = "2";
        theModel = createModel(cube(2));
        break;
      case "p":
        gscale = mscale = 0.1;
        document.getElementById("models").value = "6";
        theModel = createModel(teapotModel, null);
        break;
      case "d":
        gscale = mscale = 1;
        document.getElementById("models").value = "9";
        theModel = createModel(
          getModelData(new THREE.DodecahedronGeometry(1, 0))
        );
        break;
      case "i":
        gscale = mscale = 1;
        document.getElementById("models").value = "10";
        theModel = createModel(
          getModelData(new THREE.IcosahedronGeometry(1, 0))
        );
        break;
      case "o":
        gscale = mscale = 1;
        document.getElementById("models").value = "11";
        theModel = createModel(
          getModelData(new THREE.OctahedronGeometry(1, 0))
        );
        break;
      case "w":
        gscale = mscale = 1;
        document.getElementById("models").value = "12";
        theModel = createModel(
          getModelData(new THREE.TetrahedronGeometry(1, 0))
        );
        break;
      case "r":
        gscale = mscale = 1.0;
        document.getElementById("models").value = "4";
        theModel = createModel(
          getModelData(
            new THREE.RingGeometry(0.3, 1.0, 30, 30, 0, 6.283185307179586)
          ),
          0
        );
        break;
      case "O":
        mat4.identity(modelMatrix);
        rotator.setViewMatrix(modelMatrix);
        mscale = gscale;
        break;
      case "n":
        textureCnt = (textureCnt + 1) % imageFilename.length;
        image.src = `./textures/${imageFilename[textureCnt]}`;
        return;
      case "N":
        --textureCnt;
        if (textureCnt < 0) textureCnt = imageFilename.length - 1;
        image.src = `./textures/${imageFilename[textureCnt]}`;
        return;
      case "f":
        fixuv = !fixuv;
        // reload texture with or without fixing
        image.src = `./textures/${imageFilename[textureCnt]}`;
        document.getElementById("fixuv").checked = fixuv;
        break;
      case "b":
        culling = !culling;
        if (culling) gl.enable(gl.CULL_FACE);
        else gl.disable(gl.CULL_FACE);
        document.getElementById("culling").checked = culling;
        break;
      case "ArrowUp":
        mscale *= zoomfactor;
        mscale = Math.max(gscale * 0.1, mscale);
        break;
      case "ArrowDown":
        mscale /= zoomfactor;
        mscale = Math.min(gscale * 3, mscale);
        break;
      default:
        return;
    }
    opt.innerHTML = `<br>${gl.getParameter(
      gl.SHADING_LANGUAGE_VERSION
    )}<br>${gl.getParameter(gl.VERSION)}`;
    if (selector.paused) draw();
  };
})();

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @function
 */
var createEvent = (key) => {
  let code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * Selects a model from a menu.
 */
function selectModel() {
  let val = document.getElementById("models").value;
  let key = {
    0: "u", // capsule
    1: "C", // cone
    2: "v", // cube
    3: "c", // cylinder
    4: "r", // ring
    5: "s", // sphere
    6: "p", // teapot
    7: "t", // torus
    8: "T", // knot
    9: "d", // dodecahedron
    10: "i", // icosahedron
    11: "o", // octahedron
    12: "w", // tetrahedron
  };
  handleKeyPress(createEvent(key[val]));
}

/**
 * Select next texture.
 */
function nextTexture() {
  handleKeyPress(createEvent("n"));
}

/**
 * Select previous texture.
 */
function previousTexture() {
  handleKeyPress(createEvent("N"));
}

/**
 * Select next subdivision level.
 */
function nextLevel() {
  handleKeyPress(createEvent("m"));
}

/**
 * Select previous subdivision level.
 */
function previousLevel() {
  handleKeyPress(createEvent("M"));
}

/**
 * Increase zoom level.
 */
function zoomIn() {
  handleKeyPress(createEvent("ArrowDown"));
}

/**
 * Decrease zoom level.
 */
function zoomOut() {
  handleKeyPress(createEvent("ArrowUp"));
}

const mesh = document.getElementById("mesh");
mesh.addEventListener("change", (event) => handleKeyPress(createEvent("l")));

const axes = document.getElementById("axes");
axes.addEventListener("change", (event) => handleKeyPress(createEvent("a")));

if (document.querySelector('input[name="rot"]')) {
  document.querySelectorAll('input[name="rot"]').forEach((elem) => {
    elem.addEventListener("change", function (event) {
      var item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

const fix_uv = document.getElementById("fixuv");
fix_uv.addEventListener("change", (event) => handleKeyPress(createEvent("f")));

const cull = document.getElementById("culling");
cull.addEventListener("change", (event) => handleKeyPress(createEvent("b")));

const texture = document.getElementById("texture");
texture.addEventListener("change", (event) => handleKeyPress(createEvent("k")));

/**
 * Code to actually render our geometry.
 * Draws axes, applies texture, then draws lines.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (selector.axes) drawAxes();
  if (selector.texture) drawTexture();
  if (selector.lines) drawLines();
}

/**
 * Returns a new scale model matrix, which applies mscale.
 * @returns {mat4} model matrix.
 */
function getModelMatrix() {
  var m = modelMatrix;
  if (mscale != 1) {
    m = mat4.multiply(
      [],
      modelMatrix,
      mat4.fromScaling([], vec3.fromValues(mscale, mscale, mscale))
    );
  }
  return m;
}

/**
 * <p>Texture render the current model.</p>
 * Uses the lightingShader.
 *
 * <p>If the attribute "a_TexCoord" is not defined in the vertex shader,
 * texture coordinates will be calculated pixel by pixel
 * in the fragment shader.</p>
 */
function drawTexture() {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  var noTexture = false;
  var texCoordIndex = gl.getAttribLocation(lightingShader, "a_TexCoord");
  if (texCoordIndex < 0) {
    // the texture coordinates will be calculated in the fragment shader
    noTexture = true;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  if (!noTexture) gl.enableVertexAttribArray(texCoordIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  if (!noTexture)
    gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set uniform in shader for projection * view * model transformation
  var loc = gl.getUniformLocation(lightingShader, "model");
  gl.uniformMatrix4fv(loc, false, getModelMatrix());
  loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection);
  loc = gl.getUniformLocation(lightingShader, "normalMatrix");
  gl.uniformMatrix3fv(
    loc,
    false,
    makeNormalMatrixElements(modelMatrix, viewMatrix)
  );

  loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 2.0, 4.0, 2.0, 1.0);

  // light and material properties
  loc = gl.getUniformLocation(lightingShader, "lightProperties");
  gl.uniformMatrix3fv(loc, false, lightPropElements);
  loc = gl.getUniformLocation(lightingShader, "materialProperties");
  gl.uniformMatrix3fv(loc, false, matPropElements);
  loc = gl.getUniformLocation(lightingShader, "shininess");
  gl.uniform1f(loc, shininess);

  // need to choose a texture unit, then bind the texture to TEXTURE_2D for that unit
  var textureUnit = 1;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
  loc = gl.getUniformLocation(lightingShader, "sampler");
  gl.uniform1i(loc, textureUnit);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  if (theModel.indices) {
    gl.drawElements(
      gl.TRIANGLES,
      theModel.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, theModel.vertexPositions.length / 3);
  }

  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(normalIndex);
  if (!noTexture) gl.disableVertexAttribArray(texCoordIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the lines. </p>
 * Uses the colorShader.
 * @see https://stackoverflow.com/questions/47232671/how-gl-drawelements-find-the-corresponding-vertices-array-buffer
 */
function drawLines() {
  // bind the shader
  gl.useProgram(colorShader);

  var positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var a_color = gl.getAttribLocation(colorShader, "a_Color");
  if (a_color < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  // use yellow as line color in the colorShader
  gl.vertexAttrib4f(a_color, 1.0, 1.0, 0.0, 1.0);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  //  ------------ draw triangle borders
  // set transformation to projection * view * model
  var loc = gl.getUniformLocation(colorShader, "transform");
  var transform = mat4.multiply(
    [],
    projection,
    mat4.multiply([], viewMatrix, getModelMatrix())
  );
  gl.uniformMatrix4fv(loc, false, transform);

  // draw edges
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // takes too long on mobile
  /*
  for (var i = 0; i < theModel.indices.length; i += 3) {
    // offset - two bytes per index (UNSIGNED_SHORT)
    gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
  }
  */

  // draw edges
  if (theModel.indices) {
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, 2 * theModel.indices.length);
  } else {
    for (var i = 0; i < theModel.vertexPositions.length; i += 3) {
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
  }

  // draw normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, 2 * theModel.vertexPositions.length);

  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the axes. </p>
 * Uses the colorShader.
 */
function drawAxes() {
  // bind the shader
  gl.useProgram(colorShader);

  var positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var colorIndex = gl.getAttribLocation(colorShader, "a_Color");
  if (colorIndex < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);
  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set transformation to projection * view only
  var loc = gl.getUniformLocation(colorShader, "transform");
  var transform = mat4.multiply([], projection, viewMatrix);
  gl.uniformMatrix4fv(loc, false, transform);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
  gl.useProgram(null);
}

/**
 * <p>Loads the texture image asynchronously and defines its {@link ImageLoadCallback load callback function}.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
 * @see https://sites.google.com/site/csc8820/educational/how-to-implement-texture-mapping
 * @see https://www.evl.uic.edu/pape/data/Earth/
 */
window.addEventListener("load", (event) => {
  image = new Image();

  /**
   * <p>Callback after a new texture {@link image} is loaded.</p>
   * When called for the first time, it starts the animation.
   * Otherwise, just loads a new texture.
   * @callback ImageLoadCallback
   */
  image.onload = function () {
    // chain the animation or load a new texture
    if (typeof theModel === "undefined") {
      readFileNames
        .then((arr) => {
          if (arr.length > 0) imageFilename = arr;
          startForReal(image);
        })
        .catch((error) => {
          alert(`${error}`);
          // don't need to return anything => execution goes the normal way
          imageFilename = [
            "BigEarth.jpg",
            "Earth-1024x512.jpg",
            "Ghost Busters.jpg",
            "Mila-1200x1200.jpg",
            "NDVI_84.jpg",
            "bricks.png",
            "check64border.png",
            "citrus-fruit-skin.png",
            "earth-nasa.jpg",
            "earth-nasa.png",
            "lion.jpg",
            "rattle_snake.jpg",
          ];
          startForReal(image);
        });
    } else {
      newTexture(image);
      draw();
    }
  };
  // starts loading the image asynchronously
  image.src = `./textures/${imageFilename[0]}`;
});

/**
 * <p>Sets up all buffers for the given model (shape).</p>
 *
 * Uses the webgl vertex buffer, normal buffer, texture buffer and index buffer, created in {@link startForReal}.<br>
 * Then, binds each one of them as an array buffer and copies the corresponding shape array data to them.
 *
 * <p>Also, the Euler characteristic for the model is:</p>
 * <ul>
 *  <li>χ = 2 − 2g − b </li>
 * </ul>
 * for a surface with g handles and b boundaries.
 *
 * <p>The number of triangles must be even for a valid triangulation of the sphere:</p>
 * <ul>
 *  <li> V - E + T = 2 (sphere) </li>
 *  <li> V - E + T = 0 (torus) </li>
 * </ul>
 *
 *
 * @param {modelData} shape a <a href="https://en.wikipedia.org/wiki/Boundary_representation">BREP</a> model
 *                    given as an <a href="https://math.hws.edu/graphicsbook/c3/s4.html">IFS</a>.
 * @param {Number | null} chi model <a href="https://en.wikipedia.org/wiki/Euler_characteristic">Euler Characteristic</a>.
 * @returns {modelData} shape.
 * @see https://en.wikipedia.org/wiki/Platonic_solid
 * @see http://www-groups.mcs.st-andrews.ac.uk/~john/MT4521/Lectures/L25.html
 * @see https://nrich.maths.org/1384
 * @see https://math.stackexchange.com/questions/3571483/euler-characteristic-of-a-polygon-with-a-hole
 *
 */
function createModel(shape, chi = 2) {
  if (typeof shape === "undefined")
    shape = new polyhedron(fixuv).octahedron({ n: numSubdivisions });

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexPositions, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexNormals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexTextureCoords, gl.STATIC_DRAW);

  let nv = shape.vertexPositions.length;
  normal = new Float32Array(6 * nv);
  for (var i = 0, k = 0; i < nv; i += 3, k += 6) {
    for (var j = 0; j < 3; j++) {
      normal[j + k] = shape.vertexPositions[i + j];
      normal[j + k + 3] =
        normal[j + k] + (0.1 / mscale) * shape.vertexNormals[i + j];
    }
  }

  // number of faces: ni / 3
  // number of edges: ni
  // number of endpoints: ni * 6
  if (shape.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.indices, gl.STATIC_DRAW);

    let ni = shape.indices.length;
    lines = new Float32Array(18 * ni);
    for (i = 0, k = 0; i < ni; i += 3, k += 18) {
      for (j = 0; j < 3; j++) {
        let v1 = shape.vertexPositions[shape.indices[i] * 3 + j];
        let v2 = shape.vertexPositions[shape.indices[i + 1] * 3 + j];
        let v3 = shape.vertexPositions[shape.indices[i + 2] * 3 + j];

        lines[j + k] = v1;
        lines[j + k + 3] = v2;

        lines[j + k + 6] = v2;
        lines[j + k + 9] = v3;

        lines[j + k + 12] = v3;
        lines[j + k + 15] = v1;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normal, gl.STATIC_DRAW);

  let obj = document.getElementById("object");
  obj.innerHTML = "<b>Object:</b>";
  if (chi !== null) {
    let faces = shape.indices
      ? shape.indices.length / 3
      : shape.vertexPositions.length / 9;
    let edges = (faces * 3) / 2;
    let vertices = faces / 2 + chi;
    obj.innerHTML = `<b>Object </b>(${faces} triangles, ${edges} edges, ${vertices} vertices):`;
  }

  return shape;
}

/**
 * Returns whether a given value is a power of two.
 * @param {Number} value number to check.
 * @returns {Boolean} true if is power of two: value = 2<sup>n</sup>
 */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 * <p>Creates a textured model and triggers the animation.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 * @param {HTMLImageElement} image texture.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 * @see https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://learnopengl.com/Getting-started/Textures
 * @see https://artincontext.org/shades-of-teal/
 * @see https://www.khronos.org/opengl/wiki/Common_Mistakes
 * @see https://www.youtube.com/watch?v=qMCOX3m-R28
 */
function startForReal(image) {
  console.log("Started...");

  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

  // key handler
  window.addEventListener("keydown", (event) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        event.code
      ) > -1
    ) {
      event.preventDefault();
    }
    handleKeyPress(event);
  });

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL2");
    gl = canvas.getContext("webgl");
    if (!gl) {
      console.log("Failed to get the rendering context for WebGL");
      return;
    }
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById("vertexColorShader").textContent;
  var fshaderSource = document.getElementById(
    "fragmentColorShader"
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  colorShader = gl.program;
  gl.useProgram(null);

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById(
    "vertexLightingShader"
  ).textContent;
  var fshaderSource = document.getElementById(
    "fragmentLightingShader"
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  lightingShader = gl.program;
  gl.useProgram(null);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  indexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return null;
  }

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return null;
  }

  // buffer for tex coords
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log("Failed to create the buffer object");
    return null;
  }

  // axes
  axisBuffer = gl.createBuffer();
  normalBuffer = gl.createBuffer();
  lineBuffer = gl.createBuffer();
  if (!axisBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

  // buffer for axis colors
  axisColorBuffer = gl.createBuffer();
  if (!axisColorBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisColors, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // ask the GPU to create a texture object
  textureHandle = gl.createTexture();

  // choose a texture unit to use during setup, defaults to zero
  // (can use a different one when drawing)
  // max value is MAX_COMBINED_TEXTURE_IMAGE_UNITS
  gl.activeTexture(gl.TEXTURE0);

  newTexture(image);

  // specify a teal like fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.4, 0.4, 1.0);

  gl.enable(gl.DEPTH_TEST);
  if (culling) gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  // normals pointing outward
  gl.frontFace(gl.CCW);

  rotator = new SimpleRotator(canvas, animate);
  rotator.setViewMatrix(modelMatrix);
  rotator.setViewDistance(0);

  selectModel();

  // start drawing!
  animate();
}

/**
 * Creates a new texture from an image.
 * @param {HTMLImageElement} image texture.
 * @see https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
 * @see https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/
 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#4.1.3
 * @see https://www.youtube.com/watch?v=qMCOX3m-R28
 */
function newTexture(image) {
  gl.useProgram(lightingShader);
  var u_fix = gl.getUniformLocation(lightingShader, "u_fix");
  let imgSize = document.getElementById("size");
  imgSize.innerHTML = `Texture = ${imageFilename[textureCnt]} (${image.width} x ${image.height})`;
  document.getElementById("textimg").src = image.src;

  // bind the texture
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);

  /*
   * (0,0) in the image coordinate system is the top left corner,
   * and the (0,0) in the texture coordinate system is bottom left.
   * Threfore, load the image bytes to the currently bound texture,
   * flipping the vertical.
   */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  if (
    typeof WebGL2RenderingContext !== "undefined" ||
    (isPowerOf2(image.width) && isPowerOf2(image.height))
  ) {
    gl.uniform1i(u_fix, fixuv);

    // texture parameters are stored with the texture
    gl.generateMipmap(gl.TEXTURE_2D);
    // texture magnification filter - default is gl.LINEAR (blurred)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // reset defaults

    // texture minification filter
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR
    );

    // wrapping function for texture coordinate s
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

    // wrapping function for texture coordinate t
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  } else {
    // NPOT
    gl.uniform1i(u_fix, false);

    // texture minification filter
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR // default is gl.NEAREST_MIPMAP_LINEAR
    );

    // wrapping function for texture coordinate s (default is gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    // wrapping function for texture coordinate t (default is gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  gl.useProgram(null);
}

/**
 * <p>Define an {@link frame animation} loop.</p>
 * Step 0.5° ⇒ 60 fps = 30°/s ⇒ 360° in 12s
 * @see https://dominicplein.medium.com/extrinsic-intrinsic-rotation-do-i-multiply-from-right-or-left-357c38c1abfd
 */
var animate = (() => {
  // increase the rotation by some amount, depending on the axis chosen
  const increment = (0.5 * Math.PI) / 180;
  /** @type {Number} */
  var requestID = 0;
  const rotMatrix = {
    x: mat4.fromXRotation([], increment),
    y: mat4.fromYRotation([], increment),
    z: mat4.fromZRotation([], increment),
  };

  /**
   * Callback to keep drawing frames.
   * @callback frame
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
   */
  return () => {
    draw();
    if (requestID != 0) {
      cancelAnimationFrame(requestID);
      requestID = 0;
    }
    if (!selector.paused) {
      // extrinsic rotation - multiply on the left
      mat4.multiply(modelMatrix, rotMatrix[axis], modelMatrix);
      rotator.setViewMatrix(modelMatrix);
      // request that the browser calls animate() again "as soon as it can"
      requestID = requestAnimationFrame(animate);
    } else {
      modelMatrix = rotator.getViewMatrix();
    }
  };
})();