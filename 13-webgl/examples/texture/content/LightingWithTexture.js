/**
 * @file
 *
 * Summary.
 * <p>Lighting combined with a procedural texture.</p>
 *
 * Same as <a href="/cwdc/13-webgl/examples/lighting/content/doc-lighting2">Lighting2.js</a> except we define
 * a 3x3 matrix for <a href="https://learnopengl.com/Lighting/Materials">material properties</a>
 * and a 3x3 matrix for {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Lighting_in_WebGL light properties}
 * that are passed to the fragment shader as <a href="https://www.khronos.org/opengl/wiki/Uniform_(GLSL)">uniforms</a>.<br>
 * Instead of sampling from an image, we use the texture coordinates to compute a color value out
 * of thin air.
 *
 * <p>The procedural texture in the <a href="/cwdc/13-webgl/examples/texture/content/showCode.php?f=LightingWithProceduralTexture">fragment shader</a>
 * covers the sphere with blue and golden stripes, which is very simple indeed:</p>
 * <ol>
 *   <li> multiply the "t" texture coordinate by the number of stripes of a given color (say 10),<br>
 *        so the coordinates will be in the range [0.0, 10.0].
 *   <li> consider that 0.0 to 0.5 is blue, 0.5 to 1.0 is yellow, 1.0 to 1.5 is blue, 1.5 to 2.0 is yellow, and so on...
 *   <li> take the fractional part of the scaled "t" coordinate
 *        and test if it is less or greater than 0.5
 * </ol>
 *
 * <p>One can edit the light/material matrices in the global variables to experiment,
 * or edit {@link startForReal} to choose a model and select
 * {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/shading-normals face or vertex normals}.</p>
 *
 * @author Steve Kautz modified by Paulo Roma
 * @since 26/09/2016
 * @see <a href="/cwdc/13-webgl/examples/texture/content/LightingWithProceduralTexture.html">Procedural texture</a>
 * @see <a href="/cwdc/13-webgl/examples/texture/content/LightingWithTexture.html">Image texture</a>
 * @see <a href="/cwdc/13-webgl/examples/texture/content/LightingWithTexture.js">source</a>
 * @see <img src="../striped-sphere.png" width="512">
 */

"use strict";

/**
 * 4x4 Matrix
 * @type {glMatrix.mat4}
 * @see {@link https://glmatrix.net/docs/module-mat4.html glMatrix.mat4}
 */
const mat4 = glMatrix.mat4;

/**
 * 3x3 Matrix
 * @type {glMatrix.mat3}
 * @see {@link https://glmatrix.net/docs/module-mat3.html glMatrix.mat3}
 */
const mat3 = glMatrix.mat3;

/**
 * Three.js module.
 * @external THREE
 * @see https://threejs.org/docs/#manual/en/introduction/Installation
 */

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
 * Texture array.
 * @type {Array<String>}
 */
var imageFilename = [
  "check64.png",
  "check64border.png",
  "clover.jpg",
  "brick.png",
  "steve.png",
];

/**
 * Axes coordinates.
 * @type {Float32Array}
 */
//prettier-ignore
var axisVertices = new Float32Array([
    0.0, 0.0, 0.0,
    1.5, 0.0, 0.0,
    0.0, 0.0, 0.0,
    0.0, 1.5, 0.0,
    0.0, 0.0, 0.0,
    0.0, 0.0, 1.5,
]);

/**
 * Axes colors.
 * @type {Float32Array}
 */
//prettier-ignore
var axisColors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
]);

// A few global variables...

/**
 * <p>Light and material properties.</p>
 * Remember this is column major.
 * @type {Object<String,Float32Array>}
 */
// prettier-ignore
const lightPropElements = {
  // Generic white light.
  white_light: new Float32Array([
      0.2, 0.2, 0.2,
      0.7, 0.7, 0.7,
      0.7, 0.7, 0.7,
  ]),

  // Blue light with red specular highlights (because we can).
  blue_light: new Float32Array([
    0.2, 0.2, 0.2,
    0.0, 0.0, 0.7,
    0.7, 0.0, 0.0,
  ]),

  // Shiny green plastic.
  shiny_green: new Float32Array([
    0.3, 0.3, 0.3,
    0.0, 0.8, 0.0,
    0.8, 0.8, 0.8,
  ]),

  // Very fake looking white, useful for testing lights.
  fake_white: new Float32Array([
    1, 1, 1,
    1, 1, 1,
    1, 1, 1]),

  // Clay or terracotta.
  // Weak specular highlight similar to diffuse color.
  clay:new Float32Array([
    0.75, 0.38, 0.26,
    0.75, 0.38, 0.26,
    0.25, 0.20, 0.15,
  ])

};

/**
 * <p>Specular term exponent used in the
 * {@link https://en.wikipedia.org/wiki/Phong_reflection_model Phong reflection model}.</p>
 * One entry for each material property.
 * @type {Array<Number>}
 */
const shininess = [28.0, 28, 30, 20.0, 10.0];

/**
 * Shiny brass.
 * @type {Float32Array}
 */
// prettier-ignore
const matPropElements = new Float32Array([
  0.33, 0.22, 0.03,
  0.78, 0.57, 0.11,
  0.99, 0.91, 0.81,
]);

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
var gl;

/**
 * Our model data.
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

/**  @type {WebGLBuffer} */
var indexBuffer;
/**  @type {WebGLBuffer} */
var vertexNormalBuffer;
/**  @type {WebGLBuffer} */
var texCoordBuffer;
/**  @type {WebGLBuffer} */
var axisBuffer;
/**  @type {WebGLBuffer} */
var axisColorBuffer;

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
 * Handle to the texture object on the GPU.
 * @type {WebGLTexture}
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
 * Model transformation matrix.
 * @Type {mat4}
 */
var modelMatrix = mat4.create();

/**
 * Current rotation axis.
 * @type {String}
 */
var axis = "x";

/**
 * Scale applied to a model to make its size adequate for rendering.
 * @type {Number}
 */
var mscale = 1;

/**
 * Turn the display of the model mesh/texture/axes/animation on/off.
 * @type {Object<{lines:Boolean, texture:Boolean, axes:Boolean, paused: Boolean, intrinsic: Boolean}>}
 */
var selector = {
  lines: document.getElementById("mesh").checked,
  texture: document.getElementById("texture").checked,
  axes: document.getElementById("axes").checked,
  paused: document.getElementById("pause").checked,
  intrinsic: true,
};

/**
 * Arcball.
 * @type {SimpleRotator}
 */
var rotator;

/**
 * Camera position.
 * @type {Array<Number>}
 */
var eye = [1.77, 3.54, 3.06];

/**
 * View matrix.
 * @type {mat4}
 */
// prettier-ignore
const vMatrix = mat4.lookAt(
  [],
  eye,        // eye
  [0, 0, 0],  // at - looking at the origin
  [0, 1, 0]   // up vector - y axis
);

/**
 * View matrix.
 * @type {mat4}
 * @see <a href="/cwdc/downloads/apostila.pdf#page=109">View matrix</a>
 */
var viewMatrix = mat4.copy([], vMatrix);

/**
 * Projection matrix.
 * @type {mat4}
 */
var projection = mat4.perspectiveNO([], (30 * Math.PI) / 180, 1.5, 0.1, 1000);

/**
 * Returns the magnitude (length) of a vector.
 * @param {Array<Number>} v n-D vector.
 * @returns {Number} vector length.
 * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 */
var vecLen = (v) =>
  Math.sqrt(v.reduce((accumulator, value) => accumulator + value * value, 0));

/**
 * View distance.
 * @type {Number}
 */
var viewDistance = vecLen(eye);

/**
 * An object containing raw data for
 * vertices, normal vectors, texture coordinates, and indices.
 * <p>{@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry Polyhedra} have no index.</p>
 * @typedef {Object} modelData
 * @property {Float32Array} vertices vertex coordinates.
 * @property {Float32Array} normals vertex normals.
 * @property {Float32Array} texCoords texture coordinates.
 * @property {Uint16Array|Uint32Array} indices index array.
 */

/**
 * Given an instance of
 * <ul>
 * <li>{@link external:THREE.BufferGeometry THREE.BufferGeometry}</li>
 * </ul>
 * returns an object containing raw data for
 * vertices, normal vectors, texture coordinates, and indices.
 * <p>{@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry Polyhedra} have no index.</p>
 * @param {external:THREE.BufferGeometry} geom
 *        {@link https://threejs.org/docs/#api/en/geometries/BoxGeometry THREE.BoxGeometry}<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/CapsuleGeometry THREE.CapsuleGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/ConeGeometry THREE.ConeGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/CylinderGeometry THREE.CylinderGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/PlaneGeometry THREE.PlaneGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/RingGeometry THREE.RingGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/SphereGeometry THREE.SphereGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/TorusGeometry THREE.TorusGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/TorusKnotGeometry THREE.TorusKnotGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/DodecahedronGeometry THREE.DodecahedronGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry THREE.IcosahedronGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/OctahedronGeometry THREE.OctahedronGeometry},<br>
 *        {@link https://threejs.org/docs/#api/en/geometries/TetrahedronGeometry THREE.TetrahedronGeometry},<br>
 *        {@link TeapotGeometry THREE.TeapotGeometry}.
 * @return {modelData}
 */
function getModelData(geom) {
  return {
    vertices: geom.getAttribute("position").array,
    normals: geom.getAttribute("normal").array,
    texCoords: geom.getAttribute("uv").array,
    indices: geom.index ? geom.index.array : null,
  };
}

/**
 * <p>Matrix for taking normals into eye space.</p>
 * Returns a matrix to transform normals, so they stay
 * perpendicular to surfaces after a linear transformation.
 * @param {mat4} model model matrix.
 * @param {mat4} view view matrix.
 * @return {Float32Array} 3x3 normal matrix (transpose inverse) from the 4x4 modelview matrix.
 * @see <a href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48">𝑛′=(𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup>⋅𝑛</a>
 */
function makeNormalMatrixElements(model, view) {
  var modelview = mat4.multiply([], view, model);
  return mat3.normalFromMat4([], modelview);
}

/**
 * Translate keydown events to strings.
 * @param {KeyboardEvent} event keyboard event.
 * @return {String} typed character.
 * @see https://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  event = event || window.event;
  let charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * <p>Closure for keydown events.</p>
 * Chooses a {@link theModel model} and which {@link axis} to rotate around.<br>
 * @param {KeyboardEvent} event keyboard event.
 * @function
 * @return {key_event} callback for handling a keyboard event.
 */
const handleKeyPress = ((event) => {
  let zoomfactor = 0.7;
  let gscale = 1;
  const models = document.getElementById("models");

  /**
   * <p>Handler for keydown events.</p>
   * @param {KeyboardEvent} event keyboard event.
   * @callback key_event callback to handle a key pressed.
   */
  return (event) => {
    var ch = getChar(event);
    switch (ch) {
      case " ":
        selector.paused = !selector.paused;
        document.getElementById("pause").checked = selector.paused;
        if (!selector.paused) document.getElementById(axis).checked = true;
        animate();
        return;
      case "x":
      case "y":
      case "z":
        axis = ch;
        selector.paused = false;
        document.getElementById(axis).checked = true;
        animate();
        return;
      case "O":
        mat4.identity(modelMatrix);
        rotator.setViewMatrix(modelMatrix);
        mscale = gscale;
        break;
      case "C":
        gscale = mscale = 1;
        models.value = "1";
        theModel = createModel(
          getModelData(new THREE.ConeGeometry(0.8, 1.5, 48, 24)),
        );
        break;
      case "c":
        gscale = mscale = 1;
        models.value = "3";
        theModel = createModel(
          getModelData(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 24, 5)),
        );
        break;
      case "r":
        gscale = mscale = 1;
        models.value = "4";
        theModel = createModel(
          getModelData(
            new THREE.RingGeometry(0.3, 1.0, 30, 30, 0, 6.283185307179586),
          ),
          0,
        );
        break;
      case "u":
        gscale = mscale = 1;
        models.value = "0";
        theModel = createModel(
          getModelData(new THREE.CapsuleGeometry(0.5, 0.5, 10, 20)),
        );
        break;
      case "v":
        gscale = mscale = 1;
        models.value = "2";
        theModel = createModel(getModelData(new THREE.BoxGeometry(1, 1, 1)));
        break;
      case "s":
        gscale = mscale = 1;
        models.value = "5";
        theModel = createModel(
          getModelData(new THREE.SphereGeometry(1, 48, 24)),
        );
        break;
      case "T":
        gscale = mscale = 1;
        models.value = "8";
        theModel = createModel(
          getModelData(new THREE.TorusKnotGeometry(0.6, 0.24, 128, 16)),
        );
        break;
      case "t":
        gscale = mscale = 1;
        models.value = "7";
        theModel = createModel(
          getModelData(new THREE.TorusGeometry(0.6, 0.24, 16, 128)),
          0,
        );
        break;
      case "d":
        gscale = mscale = 1;
        models.value = "9";
        theModel = createModel(
          getModelData(new THREE.DodecahedronGeometry(1, 0)),
        );
        break;
      case "i":
        gscale = mscale = 1;
        models.value = "10";
        theModel = createModel(
          getModelData(new THREE.IcosahedronGeometry(1, 0)),
        );
        break;
      case "o":
        gscale = mscale = 1;
        models.value = "11";
        theModel = createModel(
          getModelData(new THREE.OctahedronGeometry(1, 0)),
        );
        break;
      case "e":
      case "E":
        selector.intrinsic = !selector.intrinsic;
        document.getElementById("e").checked = !selector.intrinsic;
        document.getElementById("E").checked = selector.intrinsic;
        animate();
        return;
      case "w":
        gscale = mscale = 1;
        models.value = "12";
        theModel = createModel(
          getModelData(new THREE.TetrahedronGeometry(1, 0)),
        );
        break;
      case "P":
        gscale = mscale = 0.1;
        models.value = "6";
        theModel = createModel(
          {
            vertices: teapotModel.vertexPositions,
            normals: teapotModel.vertexNormals,
            texCoords: teapotModel.vertexTextureCoords,
            indices: teapotModel.indices,
          },
          null,
        );
        break;
      case "p":
        gscale = mscale = 0.8;
        models.value = "6";
        theModel = createModel(
          getModelData(
            new THREE.TeapotGeometry(1, 10, true, true, true, true, true),
          ),
          null,
        );
        break;
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
      case "ArrowUp":
        // Up pressed
        mscale *= zoomfactor;
        mscale = Math.max(gscale * 0.1, mscale);
        break;
      case "ArrowDown":
        // Down pressed
        mscale /= zoomfactor;
        mscale = Math.min(gscale * 3, mscale);
        break;
      default:
        return;
    }
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

const mesh = document.getElementById("mesh");

/**
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event change - executed when the mesh checkbox is checked or unchecked.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
 */
mesh.addEventListener("change", (event) => handleKeyPress(createEvent("l")));

const texture = document.getElementById("texture");

/**
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event change - executed when the texture checkbox is checked or unchecked.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
 */
texture.addEventListener("change", (event) => handleKeyPress(createEvent("k")));

const axes = document.getElementById("axes");

/**
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event change - executed when the axes checkbox is checked or unchecked.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
 */
axes.addEventListener("change", (event) => handleKeyPress(createEvent("a")));

if (document.querySelector('input[name="rot"]')) {
  document.querySelectorAll('input[name="rot"]').forEach((elem) => {
    /**
     * <p>Appends an event listener for events whose type attribute value is change.
     * The callback argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event change - executed when the rot input radio is checked (but not when unchecked).
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
     */
    elem.addEventListener("change", function (event) {
      var item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

if (document.querySelector('input[name="euler"]')) {
  document.querySelectorAll('input[name="euler"]').forEach((elem) => {
    /**
     * <p>Appends an event listener for events whose type attribute value is change.
     * The callback argument sets the callback that will be invoked when
     * the event is dispatched.</p>
     *
     * @event change - executed when the euler input radio is checked (but not when unchecked).
     * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
     */
    elem.addEventListener("change", function (event) {
      var item = event.target.value;
      handleKeyPress(createEvent(item));
    });
  });
}

/**
 * Animates the object, by generating an "↓" {@link handleKeyPress event},
 * whenever the Arrow Down button is clicked.
 * @event click
 */
document
  .querySelector("#arrowDown")
  .addEventListener("click", (event) =>
    handleKeyPress(createEvent("ArrowDown")),
  );

/**
 * Animates the object, by generating an "↑" {@link handleKeyPress event},
 * whenever the Arrow Up button is clicked.
 * @event click
 */
document
  .querySelector("#arrowUp")
  .addEventListener("click", (event) => handleKeyPress(createEvent("ArrowUp")));

/**
 * <p>Loads the texture image asynchronously and defines its {@link mainEntrance load callback function}.</p>
 * @param {Event} event load event.
 * @callback WindowLoadCallback
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event load event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image Image() constructor}
 * @see {@link https://web.cse.ohio-state.edu/~shen.94/581/Site/Slides_files/texture.pdf Texture Mapping}
 * @see {@link https://www.evl.uic.edu/pape/data/Earth/ Earth images}
 * @event load
 */
window.addEventListener("load", (event) => mainEntrance());

/**
 *  <p>Code to actually render our geometry.</p>
 * Draw {@link drawAxes axes}, {@link drawTexture texture}, and {@link drawLines lines}.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (theModel === undefined) return;

  if (selector.axes) drawAxes();
  if (selector.texture) drawTexture();
  if (selector.lines) drawLines();
}

/**
 * Returns a new scale model matrix, which applies {@link mscale}.
 * @returns {mat4} model matrix.
 */
function getModelMatrix() {
  var m = modelMatrix;
  if (mscale != 1) {
    m = mat4.multiply(
      [],
      modelMatrix,
      mat4.fromScaling([], [mscale, mscale, mscale]),
    );
  }
  return m;
}

/**
 * <p>Texture render the current model.</p>
 * Uses the {@link lightingShader}.
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

  var texCoordIndex = gl.getAttribLocation(lightingShader, "a_TexCoord");
  if (texCoordIndex < 0) {
    console.log("Failed to get the storage location of a_TexCoord");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);
  gl.enableVertexAttribArray(texCoordIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);
  //gl.bindBuffer(gl.ARRAY_BUFFER, null); <---

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
    makeNormalMatrixElements(modelMatrix, viewMatrix),
  );

  loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 2.0, 4.0, 2.0, 1.0);

  // light and material properties
  loc = gl.getUniformLocation(lightingShader, "lightProperties");
  gl.uniformMatrix3fv(loc, false, lightPropElements.white_light);
  loc = gl.getUniformLocation(lightingShader, "materialProperties");
  gl.uniformMatrix3fv(loc, false, matPropElements);
  loc = gl.getUniformLocation(lightingShader, "shininess");
  gl.uniform1f(loc, shininess[0]);

  // need to choose a texture unit, then bind the texture to TEXTURE_2D for that unit
  var textureUnit = 1;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);
  loc = gl.getUniformLocation(lightingShader, "sampler");
  gl.uniform1i(loc, textureUnit);

  if (theModel.indices) {
    gl.drawElements(
      gl.TRIANGLES,
      theModel.indices.length,
      theModel.indices.constructor === Uint32Array
        ? gl.UNSIGNED_INT
        : gl.UNSIGNED_SHORT,
      0,
    );
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, theModel.vertices.length / 3);
  }

  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(normalIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the axes. </p>
 * Uses the {@link colorShader}.
 */
function drawAxes() {
  // bind the shader
  gl.useProgram(colorShader);

  // get the index for the a_Position attribute defined in the vertex shader
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

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);

  // draw axes
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  //gl.bindBuffer(gl.ARRAY_BUFFER, null); <----

  // set transformation to projection * view * model for intrinsic
  // or only projection * view for extrinsic
  var loc = gl.getUniformLocation(colorShader, "transform");
  var transform = mat4.multiply([], projection, viewMatrix);
  if (selector.intrinsic) {
    mat4.multiply(transform, transform, modelMatrix);
  }

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
 * <p>Draws the mesh edges and normals. </p>
 * Uses the {@link colorShader}.
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
  gl.vertexAttrib4f(a_color, 1.0, 1.0, 0.0, 1.0);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  //  ------------ draw triangle borders
  // set transformation to projection * view * model
  var loc = gl.getUniformLocation(colorShader, "transform");
  var transform = mat4.multiply(
    [],
    projection,
    mat4.multiply([], viewMatrix, getModelMatrix()),
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
    for (var i = 0; i < theModel.vertices.length; i += 3) {
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
  }

  // draw normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, 2 * theModel.vertices.length);

  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * Entry point when page is loaded.
 * Wait for image to load before proceeding.
 */
function mainEntrance() {
  var image = new Image();
  image.onload = function () {
    // chain the next function
    startForReal(image);
  };

  // starts loading the image asynchronously
  image.src =
    "/cwdc/13-webgl/examples/images/" +
    imageFilename[Math.floor(Math.random() * imageFilename.length)];
}

/**
 * <p>Entry point when page is loaded.</p>
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw} does things that have to be repeated each time the canvas is
 * redrawn.
 * @param {HTMLImageElement} image texture image.
 */
function startForReal(image) {
  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

  /**
   * <p>Appends an event listener for events whose type attribute value is keydown.
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
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

  // get the rendering context for WebGL
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById("vertexColorShader").textContent;
  var fshaderSource = document.getElementById(
    "fragmentColorShader",
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  colorShader = gl.program;
  gl.useProgram(null);

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById(
    "vertexLightingShader",
  ).textContent;
  var fshaderSource = document.getElementById(
    "fragmentLightingShader",
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
    return;
  }

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // buffer for tex coords
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // ask the GPU to create a texture object
  textureHandle = gl.createTexture();

  // choose a texture unit to use during setup, defaults to zero
  // (can use a different one when drawing)
  // max value is MAX_COMBINED_TEXTURE_IMAGE_UNITS
  gl.activeTexture(gl.TEXTURE0);

  // bind the texture
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);

  // load the image bytes to the currently bound texture, flipping the vertical
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // texture parameters are stored with the texture
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);  // default is REPEAT

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

  //gl.bindBuffer(gl.ARRAY_BUFFER, null); <----

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.4, 0.4, 1.0);

  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.CULL_FACE);
  //gl.cullFace(gl.BACK);

  rotator = new SimpleRotator(canvas, animate);
  rotator.setViewMatrix(modelMatrix);
  rotator.setViewDistance(0);

  selectModel();

  // start drawing!
  animate();
}

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
 * @see {@link https://en.wikipedia.org/wiki/Platonic_solid Platonic solid}
 * @see {@link https://ocw.mit.edu/courses/18-965-geometry-of-manifolds-fall-2004/pages/lecture-notes/ Geometry Of Manifolds}
 * @see {@link https://nrich.maths.org/1384 Euler's Formula and Topology}
 * @see {@link https://math.stackexchange.com/questions/3571483/euler-characteristic-of-a-polygon-with-a-hole Euler characteristic of a polygon with a hole}
 *
 */
function createModel(shape, chi = 2) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.normals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.texCoords, gl.STATIC_DRAW);

  let nv = shape.vertices.length;
  normal = new Float32Array(6 * nv);
  for (var i = 0, k = 0; i < nv; i += 3, k += 6) {
    for (var j = 0; j < 3; j++) {
      normal[j + k] = shape.vertices[i + j];
      normal[j + k + 3] = normal[j + k] + (0.1 / mscale) * shape.normals[i + j];
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
        let v1 = shape.vertices[shape.indices[i] * 3 + j];
        let v2 = shape.vertices[shape.indices[i + 1] * 3 + j];
        let v3 = shape.vertices[shape.indices[i + 2] * 3 + j];

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

  let faces = shape.indices
    ? shape.indices.length / 3
    : shape.vertices.length / 9;
  let edges = (faces * 3) / 2;
  let vertices = faces / 2 + chi;

  if (chi === null) {
    edges = `${edges}??`;
    vertices = `${vertices}??`;
  }

  obj.innerHTML = `<b>Object </b>(${faces} triangles, ${edges} edges, ${vertices} vertices):`;

  return shape;
}

/**
 * A closure to define an animation loop.
 * @return {frame}
 * @function
 * @see {@link https://dominicplein.medium.com/extrinsic-intrinsic-rotation-do-i-multiply-from-right-or-left-357c38c1abfd Extrinsic & intrinsic rotation: Do I multiply from right or left?}
 */
var animate = (() => {
  // increase the rotation by some amount (30°/s), depending on the axis chosen
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
    // to avoid speed up
    if (requestID != 0) {
      cancelAnimationFrame(requestID);
      requestID = 0;
    }
    if (!selector.paused) {
      if (selector.intrinsic) {
        // intrinsic rotation (multiply on the right)
        mat4.multiply(modelMatrix, modelMatrix, rotMatrix[axis]);
      } else {
        // extrinsic rotation (multiply on the left)
        mat4.multiply(modelMatrix, rotMatrix[axis], modelMatrix);
      }
      rotator.setViewMatrix(modelMatrix);
      // request that the browser calls animate() again "as soon as it can"
      requestID = requestAnimationFrame(animate);
    } else {
      modelMatrix = rotator.getViewMatrix();
    }
  };
})();
