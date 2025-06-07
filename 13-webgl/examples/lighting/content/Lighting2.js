/**
 * @file
 *
 * Summary.
 * <p>Lighting and shading models: <a href="https://en.wikipedia.org/wiki/Lambertian_reflectance">Lambert</a>  x
 * <a href="https://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a>.  </p>
 *
 * <p>We have a {@link getModelData function} to take a model created by {@link https://threejs.org three.js}
 * and extract the data for its vertices and normals so we can load it directly to the GPU.
 * Furthermore, the polygonal surfaces of the models can be divided into a number of
 * {@link stacks} and {@link slices},
 * and the refinement level can be set by the user interactively.
 * It is also possible to edit {@link mainEntrance} to select a {@link selectModel model} and {@link makeCube} to set
 * {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/shading-normals face or vertex normals}.</p>
 *
 * @author {@link https://stevekautz.com Steve Kautz}
 * @author modified by {@link https://krotalias.github.io Paulo Roma}
 * @since 27/09/2016
 * @see <a href="https://dl.acm.org/doi/pdf/10.1145/362736.362739">Flat shading</a> -
 * <a href="https://csl.illinois.edu/news-and-media/tech-reports">Wendell Jack Bouknight</a> (1970)
 * @see <a href="https://ohiostate.pressbooks.pub/app/uploads/sites/45/2017/09/gouraud1971.pdf">Gouraud shading</a> -
 * <a href="https://en.wikipedia.org/wiki/Henri_Gouraud_(computer_scientist)">Henri Gouraud</a> (1971)
 * @see <a href="https://dl.acm.org/doi/pdf/10.1145/360825.360839">Phong shading</a> -
 * <a href="https://en.wikipedia.org/wiki/Bui_Tuong_Phong">Bui Tuong Phong</a> (1975)
 * @see <a href="https://cg.cs.tsinghua.edu.cn/course/docs/chap1%20final.pdf">Computer Graphics Survey</a>
 * @see <a href="/cwdc/13-webgl/examples/lighting/content/Lighting2.js">source</a>
 * @see <a href="/cwdc/13-webgl/examples/lighting/content/Lighting2.html">Lambert diffuse model, Gouraud shading</a>
 * @see <a href="/cwdc/13-webgl/examples/lighting/content/Lighting2a.html">Lambert diffuse model, Phong shading</a>
 * @see <a href="/cwdc/13-webgl/examples/lighting/content/Lighting2b.html">Phong reflection model, Gouraud shading</a>
 * @see <a href="/cwdc/13-webgl/examples/lighting/content/Lighting2c.html">Phong reflection model, Phong shading</a>
 * @see <img width="512" src="/cwdc/13-webgl/examples/lighting/content/Lighting.png">
 */

"use strict";

// CDN always works
//import * as THREE from "https://unpkg.com/three@0.148.0/build/three.module.js?module";
//import { TeapotGeometry } from "https://unpkg.com/three@0.148.0/examples/jsm/geometries/TeapotGeometry.js?module";

// importmap does not work on safari and IOS
//import * as THREE from "three";
//import { TeapotGeometry } from "TeapotGeometry";

import * as THREE from "/cwdc/13-webgl/lib/three.module.js";
import { TeapotGeometry } from "/cwdc/13-webgl/lib/TeapotGeometry.js";

/**
 * Three.js module.
 * @author Ricardo Cabello ({@link https://coopermrdoob.weebly.com/ Mr.doob})
 * @since 24/04/2010
 * @external three
 * @see {@link https://threejs.org/docs/#manual/en/introduction/Installation Installation}
 * @see {@link https://discoverthreejs.com DISCOVER three.js}
 * @see {@link https://riptutorial.com/ebook/three-js Learning three.js}
 * @see {@link https://github.com/mrdoob/three.js github}
 * @see {@link http://cindyhwang.github.io/interactive-design/Mrdoob/index.html An interview with Mr.doob}
 * @see {@link https://experiments.withgoogle.com/search?q=Mr.doob Experiments with Google}
 */

/**
 * <p>Main three.js namespace.</p>
 * {@link event:load Imported} from {@link external:three three.module.js}
 * @namespace THREE
 * @see {@link https://stackoverflow.com/questions/68528251/three-js-error-during-additional-components-importing Three.js ERROR during additional components importing}
 * @see {@link https://dplatz.de/blog/2019/es6-bare-imports.html How to handle ES6 bare module imports for local Development}
 */

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
 * Axis coordinates.
 * @type {Float32Array}
 */
// prettier-ignore
const axisVertices = new Float32Array([
  0.0, 0.0, 0.0,
  1.5, 0.0, 0.0,
  0.0, 0.0, 0.0,
  0.0, 1.5, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 1.5,
]);

/**
 * Axis colors.
 * @type {Float32Array}
 */
// prettier-ignore
const axisColors = new Float32Array([
  1.0, 0.0, 0.0, 1.0,
  1.0, 0.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 1.0, 1.0,
]);

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGLRenderingContext}
 */
let gl;

/**
 * Our model data.
 * @type {modelData}
 */
let theModel;

/**
 * Array with normal end points.
 * @type {Float32Array}
 */
let normal;

/**
 * Array with edges end points.
 * @type {Float32Array}
 */
let lines;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexBuffer;
/**  @type {WebGLBuffer} */
let indexBuffer;
/**  @type {WebGLBuffer} */
let vertexNormalBuffer;
/**  @type {WebGLBuffer} */
let axisBuffer;
/**  @type {WebGLBuffer} */
let axisColorBuffer;
/**  @type {WebGLBuffer} */
let normalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let lineBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let lightingShader;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let colorShader;

/**
 * Model transformation matrix.
 * @Type {Matrix4}
 */
let modelMatrix = new Matrix4();

/**
 * Current rotation axis.
 * @type {String}
 */
let axis = "x";

/**
 * Scale applied to a model to make its size adequate for rendering.
 * @type {Number}
 */
let mscale = 1;

/**
 * Number of horizontal divisions of a surface.
 * @type {Number}
 * @see {@link https://www.songho.ca/opengl/gl_sphere.html#sphere Stacks}
 */
let stacks = 24;

/**
 * Slider element for the number of stacks.
 * @type {HTMLElement}
 */
const st = document.getElementById("stacks");

/**
 * Label element for the number of stacks.
 * @type {HTMLElement}
 */
const lblstacks = document.getElementById("lblstacks");

/**
 * Number of vertical divisions of a surface.
 * @type {Number}
 * @see {@link https://www.songho.ca/opengl/gl_sphere.html#sphere Sectors}
 */
let slices = 48;

/**
 * Slider element for the number of slices.
 * @type {HTMLElement}
 */
const sl = document.getElementById("slices");

/**
 * Label element for the number of slices.
 * @type {HTMLElement}
 */
const lblslices = document.getElementById("lblslices");

/**
 * Turn the display of the model mesh/texture/axes/animation on/off.
 * @type {Object}
 * @property {Boolean} lines mesh visible/invisible
 * @property {Boolean} texture model surface visible/invisible
 * @property {Boolean} axes axes visible/invisible
 * @property {Boolean} paused animation on/off
 */
const selector = {
  lines: false,
  texture: true,
  axes: false,
  paused: true,
};

/**
 * Arcball.
 * @type {SimpleRotator}
 */
let rotator;

/**
 * Camera position.
 * @type {Array<Number>}
 */
const eye = [1.77, 3.54, 3.06];

/**
 * <p>View matrix.</p>
 * One strategy is to identify a transformation to our
 * <a href="https://cglearn.codelight.eu/pub/computer-graphics/frames-of-reference-and-projection">camera</a>
 * <a href="/cwdc/downloads/Computer%20Graphics%20-%20CMSC%20427.pdf#page=31">frame</a>
 * then invert it.  <br>
 * Therefore, the camera transformation takes (0,0,0) to the <span style="color:red">camera position.</span>
 * <pre>
 *    rotate(30, 0, 1, 0) * rotate(-45, 1, 0, 0) * translate(0, 0, 5)
 *
 *    camera transformation:
 *        0.8660253882408142 -0.3535533845424652 0.3535533845424652 <span style="color:red">1.7677669525146484</span>
 *        0                   0.7071067690849304 0.7071067690849304 <span style="color:red">3.535533905029297</span>
 *       -0.5                -0.6123723983764648 0.6123723983764648 <span style="color:red">3.061861991882324</span>
 *        0                   0                   0                 1
 *
 *    translate(0, 0, -5) * rotate(45, 1, 0, 0) * rotate(-30, 0, 1, 0)
 *
 *    view matrix:
 *        0.8660253882408142 0                  -0.5                 0
 *       -0.3535533845424652 0.7071067690849304 -0.6123723983764648  0
 *        0.3535533845424652 0.7071067690849304  0.6123723983764648 -5
 *        0                  0                   0                   1
 *
 * </pre>
 * The view matrix is the inverse of the camera's transformation matrix: viewMatrix = camera ⁻¹.
 * <ul>
 * <li>The camera's transformation matrix takes something that's local to the camera
 * and transforms it to world space <br>
 * (transforming the point [0,0,0] will give you the camera's position)</li>
 * <li>The view matrix takes something that's in world space and transforms it
 * so that it's local to the camera <br>
 * (transforming the camera's position will give you [0, 0, 0])</li>
 * </ul>
 * <p><a href="https://www.geertarien.com/blog/2017/07/30/breakdown-of-the-lookAt-function-in-OpenGL/">LookAt</a>
 * functions from math <a href="https://dens.website/tutorials/webgl/gl-matrix">libraries</a> are just a convenience, indeed,
 * and requires a view point,
 * a point to look at, and a direction "up", for camera orientation:</p>
 * <p>The approximate {@link eye view point} here is: <span style="color:red">[1.77, 3.54, 3.06]</span></p>
 *
 * <pre>
 *    const viewMatrix = new {@link Matrix4 Matrix4()}.setLookAt(
 *      ...eye,   // view point
 *      0, 0, 0,  // at - looking at the origin
 *      0, 1, 0); // up vector - y axis
 *
 * or using the {@link https://glmatrix.net glmatrix} package
 *
 *    const viewMatrix = {@link https://glmatrix.net/docs/module-mat4.html mat4}.lookAt(
 *      [],         // mat4 frustum matrix will be written into
 *      eye,        // view point
 *      [0, 0, 0],  // look at (center)
 *      [0, 1, 0]); // view up
 * </pre>
 * @type {Matrix4}
 * @see <a href="/cwdc/downloads/apostila.pdf#page=109">View matrix</a>
 * @see <a href="/cwdc/downloads/PDFs/06_LCG_Transformacoes.pdf">Mudança de Base</a>
 * @see <a href="https://en.wikipedia.org/wiki/Change_of_basis">Change of Basis</a>
 * @see <a href="/cwdc/10-html5css3/hw2/doc-hw2">node</a>
 * @see {@link https://learn.microsoft.com/en-us/windows/win32/direct3d9/view-transform View Transform (Direct3D 9)}
 * @see {@link https://learn.microsoft.com/en-us/windows/win32/direct3d9/projection-transform Projection Transform (Direct3D 9)}
 * @see <img src="../projection.png" width="256"> <img src="../projection2.png" width="256">
 */
const viewMatrix = new Matrix4()
  .translate(0, 0, -5)
  .rotate(45, 1, 0, 0)
  .rotate(-30, 0, 1, 0);

/**
 * Returns the magnitude (length) of a vector.
 * @param {Array<Number>} v n-D vector.
 * @returns {Number} vector length.
 * @see {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce Array.prototype.reduce()}
 */
const vecLen = (v) =>
  Math.sqrt(v.reduce((accumulator, value) => accumulator + value * value, 0));

/**
 * View distance.
 * @type {Number}
 */
const viewDistance = vecLen(eye);

/**
 * <p>For projection, we can either use:
 * <ul>
 * <li>An orthographic projection, specifying
 * the clipping volume explicitly:
 *  <ul>
 *    <li>const <b>projection</b> = new Matrix4().setOrtho(-1.5, 1.5, -1, 1, 4, 6);</li>
 *  </ul>
 * </li>
 *
 * <li>Or the same perspective projection, using the Frustum function with:
 *  <ul>
 *    <li>a 30 degree field of view, and a near plane at 4,<br>
 *    which corresponds to a view plane height of: 4 * tan(15) = 1.07</li>
 *    <li>const <b>projection</b> = new Matrix4().setFrustum(-1.5 * 1.07, 1.5 * 1.07, -1.07, 1.07, 4, 6);</li>
 *  </ul>
 * </li>
 *
 * <li>Or a perspective projection specified with a
 * field of view, an aspect ratio, and distance to near and far
 * clipping planes:
 *  <ul>
 *    <li>const <b>projection</b> = new Matrix4().setPerspective(30, 1.5, 0.1, 1000);</li>
 *  </ul>
 * </ul>
 * Here use aspect ratio 3/2 corresponding to canvas size 900 x 600</p>
 * @type {Matrix4}
 */
const projection = new Matrix4().setPerspective(30, 1.5, 0.1, 1000);

/**
 * Loads the {@link mainEntrance application}.
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => mainEntrance());

/**
 * Draws the mesh and vertex normals, by generating an "l" {@link handleKeyPress event},
 * whenever the Mesh button is clicked.
 * @event clickMesh
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 * @see {@link createEvent}
 */
document
  .querySelector("#btnMesh")
  .addEventListener("click", (event) => handleKeyPress(createEvent("l")));

/**
 * Animates the object, by generating an " " {@link handleKeyPress event},
 * whenever the Rotate button is clicked.
 * @event clickRot
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 * @see {@link createEvent}
 */
document
  .querySelector("#btnRot")
  .addEventListener("click", (event) => handleKeyPress(createEvent(" ")));

/**
 * Animates the object, by generating an "↓" {@link handleKeyPress event},
 * whenever the Arrow Down button is clicked.
 * @event clickArrowDown
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 * @see {@link createEvent}
 */
document
  .querySelector("#arrowDown")
  .addEventListener("click", (event) =>
    handleKeyPress(createEvent("ArrowDown")),
  );

/**
 * Animates the object, by generating an "↑" {@link handleKeyPress event},
 * whenever the Arrow Up button is clicked.
 * @event clickArrowUp
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 * @see {@link createEvent}
 */
document
  .querySelector("#arrowUp")
  .addEventListener("click", (event) => handleKeyPress(createEvent("ArrowUp")));

/**
 * <p>Fired when a &lt;input type="range"&gt; is in the
 * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
 * (by clicking or using the keyboard).</p>
 *
 * The {@link selectModel callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * Executed when the stack slider is changed.
 *
 * @summary Appends an event listener for events whose type attribute value is input.
 *
 * @param {Event} event a generic event.
 * @event stacks
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */

document.querySelector("#stacks").addEventListener("input", (event) => {
  stacks = +event.target.value;
  lblstacks.innerHTML = `Stacks: ${stacks}`;

  selectModel(false);
});

/**
 * <p>Fired when a &lt;input type="range"&gt; is in the
 * {@link https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range) Range state}
 * (by clicking or using the keyboard).</p>
 *
 * The {@link selectModel callback} argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * Executed when the slices slider is changed.
 *
 * @summary Appends an event listener for events whose type attribute value is input.
 *
 * @param {Event} event a generic event.
 * @event slices
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event HTMLElement: change event}
 */

document.querySelector("#slices").addEventListener("input", (event) => {
  slices = +event.target.value;
  lblslices.innerHTML = `Slices: ${slices}`;

  selectModel(false);
});

/**
 * <p>Creates a unit cube, centered at the origin, and set its properties:
 * vertices, normal vectors, texture coordinates, indices and colors.</p>
 *
 * <p>For a proper specular reflection on planar faces, such as a cube or a polyhedron,
 * the normal vectors have to be perpendicular to the plane of each face.</p>
 *
 * <p>Computing an average normal, like is done here when creating indices,
 * is what one would want to do for a smooth object like a sphere.</p>
 * The resulting rendering is very unpleasant, in this case.
 * The right course is creating three duplicate vertices per cube corner.
 * <p>Even if cube.indices is not defined here, {@link drawModel} can handle it.</p>
 * @param {Boolean} create_indices whether to generated vertex indices or not.
 * @return {Object} cube
 * @property {Number} cube.numVertices number of vertices (36).
 * @property {Float32Array} cube.vertices vertex coordinate array (108 = 36 * 3).
 * @property {Float32Array} cube.normals vertex normal array (108 = 36 * 3).
 * @property {Float32Array} cube.colors vertex color array (144 = 36 * 4).
 * @property {Float32Array} cube.texCoords vertex texture array (72 = 36 * 2).
 * @property {Uint16Array} cube.indices vertex index array (36 = 6 * 2 * 3).
 * @see {@link THREE.BufferGeometry}
 * @see <img src="/cwdc/13-webgl/examples/images/cube.png">
 */
function makeCube(create_indices = false) {
  // 8 vertices of cube
  // prettier-ignore
  const rawVertices = new Float32Array([
    -0.5, -0.5,  0.5,  // v0
     0.5, -0.5,  0.5,  // v1
     0.5,  0.5,  0.5,  // v2
    -0.5,  0.5,  0.5,  // v3
    -0.5, -0.5, -0.5,  // v4
     0.5, -0.5, -0.5,  // v5
     0.5,  0.5, -0.5,  // v6
    -0.5,  0.5, -0.5,  // v7
  ]);

  // prettier-ignore
  const rawColors = new Float32Array([
      1.0, 0.0, 0.0, 1.0,  // red
      0.0, 1.0, 0.0, 1.0,  // green
      0.0, 0.0, 1.0, 1.0,  // blue
      1.0, 1.0, 0.0, 1.0,  // yellow
      1.0, 0.0, 1.0, 1.0,  // magenta
      0.0, 1.0, 1.0, 1.0,  // cyan
    ]);

  // 6 normals of the faces
  // prettier-ignore
  const rawNormals = new Float32Array([
     0,  0,  1,  // +z face
     1,  0,  0,  // +x face
     0,  0, -1,  // -z face
    -1,  0,  0,  // -x face
     0,  1,  0,  // +y face
     0, -1,  0,  // -y face
  ]);

  // 8 texture coordinates of the vertices
  // prettier-ignore
  const rawTexture = new Float32Array([
    0.0, 0.0,  // v0
    1.0, 0.0,  // v1
    1.0, 1.0,  // v2
    0.0, 1.0,  // v3
    0.0, 0.0,  // v4
    1.0, 0.0,  // v5
    1.0, 1.0,  // v6
    0.0, 1.0,  // v7
 ]);

  const n = 1 / Math.sqrt(3);
  // 8 normals of the vertices
  // prettier-ignore
  const rawVertexNormals = new Float32Array([
    -n, -n,  n,  // v0
     n, -n,  n,  // v1
     n,  n,  n,  // v2
    -n,  n,  n,  // v3
    -n, -n, -n,  // v4
     n, -n, -n,  // v5
     n,  n, -n,  // v6
    -n,  n, -n,  // v7
 ]);

  // prettier-ignore
  const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,  // +z face
      2, 1, 5, 6, 2, 5,  // +x face
      5, 4, 7, 5, 7, 6,  // -z face
      7, 4, 0, 0, 3, 7,  // -x face
      3, 2, 7, 2, 6, 7,  // +y face
      0, 5, 1, 0, 4, 5   // -y face
    ]);

  const verticesArray = [];
  const colorsArray = [];
  const normalsArray = [];
  const textureArray = [];
  for (let i = 0; i < 36; ++i) {
    // for each of the 36 vertices...
    let face = Math.floor(i / 6);
    let index = indices[i];

    // (x, y, z): three numbers for each point
    for (let j = 0; j < 3; ++j) {
      verticesArray.push(rawVertices[3 * index + j]);
    }

    // (r, g, b, a): four numbers for each point
    for (let j = 0; j < 4; ++j) {
      colorsArray.push(rawColors[4 * face + j]);
    }

    // (nx, ny, nz): three numbers for each point
    for (let j = 0; j < 3; ++j) {
      normalsArray.push(rawNormals[3 * face + j]);
    }

    // (tx, ty): two numbers for each point
    for (let j = 0; j < 2; ++j) {
      textureArray.push(rawTexture[2 * index + j]);
    }
  }

  return create_indices
    ? {
        numVertices: 8,
        vertexPositions: rawVertices, // 24 = 8 * 3
        vertexNormals: rawVertexNormals, // 24 = 8 * 3
        vertexTextureCoords: rawTexture, // 72 = 36 * 2
        indices: indices, // 36 = 6 faces * 2 tri/face  * 3 ind/tri
      }
    : {
        numVertices: 36, // 12 tri  * 3 vert/tri
        vertexPositions: new Float32Array(verticesArray), // 108 = 36 * 3
        vertexNormals: new Float32Array(normalsArray), // 108 = 36 * 3
        colors: new Float32Array(colorsArray), // 144 = 36 * 4
        vertexTextureCoords: new Float32Array(textureArray), // 72 = 36 * 2
        indices: new Uint16Array([...Array(36).keys()]), // 36 = 6 * 2 * 3
      };
}

/**
 * <p>Matrix for taking normals into eye space.</p>
 * Returns a matrix to transform normals, so they stay
 * perpendicular to surfaces after a linear transformation.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @return {Float32Array} 3x3 normal matrix (transpose inverse) from the 4x4 modelview matrix.
 * @see <a href="/cwdc/13-webgl/extras/doc/gdc12_lengyel.pdf#page=48">𝑛′=(𝑀<sup>&#8211;1</sup>)<sup>𝑇</sup>⋅𝑛</a>
 */
function makeNormalMatrixElements(model, view) {
  let n = new Matrix4(view).multiply(model);
  n.transpose();
  n.invert();
  n = n.elements;
  // prettier-ignore
  return new Float32Array([
        n[0], n[1], n[2],
        n[4], n[5], n[6],
        n[8], n[9], n[10],
    ]);
}

/**
 * Translate keypress events to strings.
 * @param {KeyboardEvent} event key pressed.
 * @return {String} typed character.
 * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * Sets the number of stacks and slices for the models.
 * @param {Number} stk number of stacks.
 * @param {Number} stkmin minimum number of stacks.
 * @param {Number} stkmax maximum number of stacks.
 * @param {Number} slc number of slices.
 * @param {Number} stkmin minimum number of slices.
 * @param {Number} slcmax maximum number of slices.
 */
function setSliders(stk, stkmin, stkmax, slc, slcmin, slcmax) {
  stacks = stk;
  st.setAttribute("min", stkmin);
  st.setAttribute("max", stkmax);
  st.value = stk.toString();
  lblstacks.innerHTML = `Stacks: ${stacks}`;

  slices = slc;
  sl.setAttribute("min", slcmin);
  sl.setAttribute("max", slcmax);
  sl.value = slc.toString();
  lblslices.innerHTML = `Slices: ${slices}`;
}

/**
 * <p>Closure for keydown events.</p>
 * Chooses a {@link theModel model} and which {@link axis} to rotate around.<br>
 * @param {KeyboardEvent} event keyboard event.
 * @function
 * @return {key_event} callback for handling a keyboard event.
 */
const handleKeyPress = ((event) => {
  const zoomfactor = 0.7;
  let gscale = 1;
  const models = document.getElementById("models");

  /**
   * <p>Handler for keydown events.</p>
   * @param {KeyboardEvent} event keyboard event.
   * @callback key_event callback to handle a key pressed.
   */
  return (event) => {
    const ch = getChar(event);
    switch (ch) {
      case " ":
        selector.paused = !selector.paused;
        animate();
        break;
      case "x":
      case "y":
      case "z":
        axis = ch;
        break;
      case "o":
        modelMatrix.setIdentity();
        rotator.setViewMatrix(modelMatrix.elements);
        mscale = gscale;
        axis = "x";
        break;
      case "l":
        selector.lines = !selector.lines;
        if (!selector.lines) selector.texture = true;
        break;
      case "k":
        selector.texture = !selector.texture;
        if (!selector.texture) selector.lines = true;
        break;
      case "a":
        selector.axes = !selector.axes;
        break;
      case "v":
        // cube
        gscale = mscale = 1;
        models.value = "2";
        //theModel = createModel(makeCube());
        theModel = createModel(
          getModelData(new THREE.BoxGeometry(1, 1, 1, stacks, slices, slices)),
        );
        break;
      case "u":
        // capsule
        gscale = mscale = 1.2;
        models.value = "0";
        theModel = createModel(
          getModelData(new THREE.CapsuleGeometry(0.5, 0.5, stacks, slices)),
        );
        break;
      case "c":
        // cylinder
        gscale = mscale = 1;
        models.value = "3";
        theModel = createModel(uvCylinder(0.5, 1.5, slices, stacks));
        break;
      case "C":
        // cone
        gscale = mscale = 1;
        models.value = "1";
        theModel = createModel(uvCone(0.5, 1.5, slices, stacks));
        break;
      case "s":
        // sphere with more faces
        gscale = mscale = 1;
        models.value = "5";
        theModel = createModel(
          getModelData(new THREE.SphereGeometry(1, slices, stacks)),
        );
        break;
      case "Z":
        // sphere with no duplicate faces
        gscale = mscale = 1;
        models.value = "14";
        theModel = createModel(uvSphereND(1, slices, stacks));
        break;
      case "r":
        // ring
        setSlicesVisible(true);
        setStacksVisible(false);
        gscale = mscale = 1;
        models.value = "4";
        theModel = createModel(ring(0.3, 1, slices));
        break;
      case "t":
        // sphere with no duplicate faces
        gscale = mscale = 1;
        models.value = "7";
        theModel = createModel(uvTorus(1, 0.5, slices, stacks));
        break;
      case "T":
        // torus knot
        gscale = mscale = 1;
        models.value = "8";
        theModel = createModel(
          getModelData(
            new THREE.TorusKnotGeometry(0.6, 0.24, stacks, slices, 2, 3),
          ),
          1,
        );
        break;
      case "d":
        // dodecahedron
        setSlicesVisible(false);
        setStacksVisible(true);
        gscale = mscale = 1;
        models.value = "9";
        theModel = createModel(
          getModelData(new THREE.DodecahedronGeometry(1, stacks)),
        );
        break;
      case "p":
        // teapot - this is NOT a manifold model - it is a model with borders!
        setStacksVisible(false);
        setSlicesVisible(true);
        gscale = mscale = 0.8;
        models.value = "6";
        theModel = createModel(
          getModelData(
            new TeapotGeometry(1, slices, true, true, true, true, true),
          ),
          null,
        );
        break;
      case "ArrowUp":
      case ">":
        // Up pressed
        mscale *= zoomfactor;
        mscale = Math.max(gscale * 0.1, mscale);
        break;
      case "ArrowDown":
      case "<":
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
const createEvent = (key) => {
  const code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * Sets the visibility of the stacks sliders.
 * @param {Boolean} visible whether to show the stacks sliders.
 */
const setStacksVisible = (visible) => {
  st.style.display = visible ? "inline-block" : "none";
  lblstacks.style.display = visible ? "inline-block" : "none";
};

/**
 * Sets the visibility of the slices slider.
 * @param {Boolean} visible whether to show the slices slider.
 */
const setSlicesVisible = (visible) => {
  sl.style.display = visible ? "inline-block" : "none";
  lblslices.style.display = visible ? "inline-block" : "none";
};

/**
 * Selects a model from a menu.
 * @param {Boolean} c whether to set the sliders or not.
 */
function selectModel(c = true) {
  const val = document.getElementById("models").value;
  const key = {
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
    14: "Z", // sphere with no duplicate faces
  };

  setStacksVisible(true);
  setSlicesVisible(true);

  if (c) {
    switch (+val) {
      case 0: // capsule
        setSliders(5, 1, 60, 30, 3, 60);
        break;
      case 1: // cone
        setSliders(5, 1, 60, 30, 3, 60);
        break;
      case 2: // cube
        setSliders(1, 1, 30, 1, 1, 30);
        break;
      case 3: // cylinder
        setSliders(5, 1, 60, 30, 3, 60);
        break;
      case 4: // ring
        setSliders(5, 1, 60, 30, 3, 60);
        setStacksVisible(false);
        break;
      case 5: // sphere
        setSliders(24, 2, 100, 48, 3, 100);
        break;
      case 6: // teapot
        setSliders(0, 0, 0, 10, 2, 15);
        setStacksVisible(false);
        break;
      case 7: // torus
        setSliders(30, 2, 40, 10, 3, 40);
        break;
      case 8: // knot
        setSliders(128, 3, 150, 16, 3, 30);
        break;
      case 9: // dodecahedron
        setSliders(0, 0, 15, 0, 0, 0);
        setSlicesVisible(false);
        break;
      case 14: // sphere with no duplicate faces
        setSliders(24, 2, 100, 48, 3, 100);
        break;
    }
  }
  handleKeyPress(createEvent(key[val]));
}

window.selectModel = selectModel;

/**
 * <p>Code to actually render our geometry.</p>
 * Draw {@link drawAxes axes}, {@link drawModel model}, and {@link drawLines lines}.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (selector.axes) drawAxes();
  if (selector.texture) drawModel();
  if (selector.lines) drawLines();
}

/**
 * Returns a new scale model matrix, which applies mscale.
 * @returns {Matrix4} model matrix.
 */
function getModelMatrix() {
  let m = modelMatrix;
  if (mscale != 1) {
    m = new Matrix4(modelMatrix).scale(mscale, mscale, mscale);
  }
  return m;
}

/**
 * <p>Draws the model, by
 * using the {@link lightingShader}.</p>
 * If {@link theModel}.indices is defined, then calls
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements drawElements}.
 * Otherwise, {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays drawArrays}.
 * <p>Since three.js {@link https://sbcode.net/threejs/geometry-to-buffergeometry/ version 125},
 * THREE.Geometry was deprecated and replaced by
 * {@link THREE.BufferGeometry THREE.BufferGeometry},
 * which always define indices for efficiency.
 */
function drawModel() {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);

  // set uniform in shader for projection * view * model transformation
  let loc = gl.getUniformLocation(lightingShader, "model");
  gl.uniformMatrix4fv(loc, false, getModelMatrix().elements);
  loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, viewMatrix.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "normalMatrix");
  gl.uniformMatrix3fv(
    loc,
    false,
    makeNormalMatrixElements(modelMatrix, viewMatrix),
  );

  loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 2.0, 4.0, 2.0, 1.0);

  gl.uniform4f(
    gl.getUniformLocation(lightingShader, "diffuseColor"),
    0.0,
    0.8,
    0.8,
    1.0,
  );

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
    gl.drawArrays(gl.TRIANGLES, 0, theModel.vertexPositions.length / 3);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(normalIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the axes. </p>
 * Uses the colorShader.
 */
function drawAxes() {
  // bind the shader
  gl.useProgram(colorShader);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const colorIndex = gl.getAttribLocation(colorShader, "a_Color");
  if (colorIndex < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);

  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

  // set transformation to projection * view only
  const loc = gl.getUniformLocation(colorShader, "transform");
  const transform = new Matrix4().multiply(projection).multiply(viewMatrix);
  gl.uniformMatrix4fv(loc, false, transform.elements);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
  gl.useProgram(null);
}

/**
 * <p>Draws the mesh edges and normals. </p>
 * Uses the colorShader.
 */
function drawLines() {
  // bind the shader
  gl.useProgram(colorShader);
  const positionIndex = gl.getAttribLocation(colorShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  const a_color = gl.getAttribLocation(colorShader, "a_Color");
  if (a_color < 0) {
    console.log("Failed to get the storage location of a_Color");
    return;
  }
  gl.vertexAttrib4f(a_color, 1.0, 1.0, 0.0, 1.0);

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  //  ------------ draw triangle borders
  // set transformation to projection * view * model
  const loc = gl.getUniformLocation(colorShader, "transform");
  const transform = new Matrix4()
    .multiply(projection)
    .multiply(viewMatrix)
    .multiply(getModelMatrix());
  gl.uniformMatrix4fv(loc, false, transform.elements);

  // draw edges
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // takes too long on mobile
  /*
    for (let i = 0; i < theModel.indices.length; i += 3) {
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
    for (let i = 0; i < theModel.vertexPositions.length; i += 3) {
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
  }

  // draw normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, 2 * theModel.vertexPositions.length);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * <p>Sets up all buffers for the given (triangulated) model (shape).</p>
 *
 * Uses the webgl vertex buffer, normal buffer, texture buffer and index buffer, created in {@link mainEntrance}.<br>
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
 * @param {modelData} shape a <a href="https://en.wikipedia.org/wiki/Boundary_representation">BREP</a> model
 *                    given as an <a href="https://math.hws.edu/graphicsbook/c3/s4.html">IFS</a>.
 * @param {Number | null} chi model <a href="https://en.wikipedia.org/wiki/Euler_characteristic">Euler Characteristic</a>.
 * @returns {modelData} shape.
 * @see {@link https://en.wikipedia.org/wiki/Platonic_solid Platonic solid}
 * @see {@link https://ocw.mit.edu/courses/18-965-geometry-of-manifolds-fall-2004/pages/lecture-notes/ Geometry Of Manifolds}
 * @see {@link https://nrich.maths.org/1384 Euler's Formula and Topology}
 * @see {@link https://math.stackexchange.com/questions/3571483/euler-characteristic-of-a-polygon-with-a-hole Euler characteristic of a polygon with a hole}
 */
function createModel(shape, chi = 2) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexPositions, gl.STATIC_DRAW);

  if (shape.indices) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.indices, gl.STATIC_DRAW);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, shape.vertexNormals, gl.STATIC_DRAW);

  const nv = shape.vertexPositions.length;
  normal = new Float32Array(6 * nv);
  for (let i = 0, k = 0; i < nv; i += 3, k += 6) {
    for (let j = 0; j < 3; j++) {
      normal[j + k] = shape.vertexPositions[i + j];
      normal[j + k + 3] =
        normal[j + k] + (0.1 / mscale) * shape.vertexNormals[i + j];
    }
  }

  // number of faces: ni / 3
  // number of edges: ni
  // number of endpoints: ni * 6
  if (shape.indices) {
    const ni = shape.indices.length;
    lines = new Float32Array(18 * ni);
    for (let i = 0, k = 0; i < ni; i += 3, k += 18) {
      for (let j = 0; j < 3; j++) {
        const v1 = shape.vertexPositions[shape.indices[i] * 3 + j];
        const v2 = shape.vertexPositions[shape.indices[i + 1] * 3 + j];
        const v3 = shape.vertexPositions[shape.indices[i + 2] * 3 + j];

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

  const obj = document.getElementById("object");
  obj.innerHTML = "<b>Object:</b>";
  const faces = shape.indices
    ? shape.indices.length / 3
    : shape.vertexPositions.length / 9;
  let edges = (faces * 3) / 2;
  let vertices = faces / 2 + chi;
  let vertReal = shape.vertexPositions.length / 3;

  if (chi === null) {
    edges = `??`;
    vertices = `??`;
  }

  obj.innerHTML = `(${faces} ▲, ${edges} ―, ${vertices} •, ${vertReal} 🔴)`;

  return shape;
}

/**
 * <p>Entry point when page is loaded.</p>
 * Load all data into the buffers (just once) before proceeding.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData bufferData}
 */
function mainEntrance() {
  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  /**
   * <p>Key handler.</p>
   * Calls {@link handleKeyPress} whenever any of these keys is pressed:
   * <ul>
   *  <li>Space</li>
   *  <li>x, y, z</li>
   *  <li>p, s, T, o</li>
   *  <li>a, k, l</li>
   * </ul>
   *
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  addEventListener("keydown", (event) => {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        event.code,
      ) > -1
    ) {
      event.preventDefault();
    }
    handleKeyPress();
  });

  // get the rendering context for WebGL
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  let vshaderSource = document.getElementById("vertexColorShader").textContent;
  let fshaderSource = document.getElementById(
    "fragmentColorShader",
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }
  colorShader = gl.program;
  gl.useProgram(null);

  // load and compile the shader pair, using utility from the teal book
  vshaderSource = document.getElementById("vertexLightingShader").textContent;
  fshaderSource = document.getElementById("fragmentLightingShader").textContent;
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

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.2, 0.2, 1.0);

  gl.enable(gl.DEPTH_TEST);

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  rotator = new SimpleRotator(canvas, animate);
  rotator.setViewMatrix(modelMatrix.elements);
  rotator.setViewDistance(0);

  // initial model
  selectModel();

  // start drawing!
  animate();
}

/**
 * A closure to define an animation loop.
 * @return {loop}
 * @function
 */
const animate = (() => {
  // increase the rotation by some amount, depending on the axis chosen
  const increment = 0.5;
  /** @type {Number} */
  let requestID = 0;
  const axes = {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1],
  };

  /**
   * Callback to keep drawing frames.
   * @callback loop
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame requestAnimationFrame}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame cancelAnimationFrame}
   */
  return () => {
    draw();
    if (requestID != 0) {
      cancelAnimationFrame(requestID);
      requestID = 0;
    }
    if (!selector.paused) {
      modelMatrix = new Matrix4()
        .setRotate(increment, ...axes[axis])
        .multiply(modelMatrix);
      rotator.setViewMatrix(modelMatrix.elements);
      // request that the browser calls animate() again "as soon as it can"
      requestID = requestAnimationFrame(animate);
    } else {
      modelMatrix.elements = rotator.getViewMatrix();
    }
  };
})();
