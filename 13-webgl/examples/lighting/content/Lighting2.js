/**
 * @file
 *
 * Summary.
 * <p>Lighting and shading models: <a href="https://en.wikipedia.org/wiki/Lambertian_reflectance">Lambert</a>  x
 * <a href="https://en.wikipedia.org/wiki/Phong_reflection_model">Phong</a>.  </p>
 *
 * Here we add a function to take a model created by {@link https://threejs.org three.js}
 * and extract the data for vertices and normals, <br>
 * so we can load it directly to the GPU.
 *
 * Edit {@link mainEntrance} to choose a model and select
 * {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/shading-normals face or vertex normals}.
 *
 * @author Steve Kautz modified by Paulo Roma
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
 */

"use strict";

// CDN always works
import * as THREE from "https://unpkg.com/three@0.148.0/build/three.module.js?module";
import { TeapotGeometry } from "https://unpkg.com/three@0.148.0/examples/jsm/geometries/TeapotGeometry.js?module";

// importmap does not work on safari and IOS
//import * as THREE from "three";
//import { TeapotGeometry } from "TeapotGeometry";

//import * as THREE from "/cwdc/13-webgl/lib/three/build/three.module.js";
//import { TeapotGeometry } from "./TeapotGeometry.js";

/**
 * Axes coordinates.
 * @type {Float32Array}
 */
var axisVertices = new Float32Array([
    0.0, 0.0, 0.0, 1.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.5, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 1.5,
]);

/**
 * Axes colors.
 * @type {Float32Array}
 */
var axisColors = new Float32Array([
    1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0,
    1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
]);

// A few global variables...

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
var axisBuffer;
/**  @type {WebGLBuffer} */
var axisColorBuffer;
/**  @type {WebGLBuffer} */
var normalBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var lineBuffer;

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
 * @Type {Matrix4}
 */
var modelMatrix = new Matrix4();

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
 * Scale applied to a model to make its size adequate for rendering.
 * @type {Number}
 */
var mscale = 1;

/**
 * Turn the display of the model mesh/texture/axes/animation on/off.
 * @type {Object<{lines:Boolean, texture:Boolean, axes:Boolean, paused:Boolean}>}
 */
var selector = {
    lines: false,
    texture: true,
    axes: false,
    paused: true,
};

/**
 * Arcball.
 * @type {SimpleRotator}
 */
var rotator;

/**
 * <p>View matrix.</p>
 * One strategy is to identify a transformation to our
 * <a href="https://cglearn.codelight.eu/pub/computer-graphics/frames-of-reference-and-projection">camera</a>
 * <a href="/cg/downloads/Computer%20Graphics%20-%20CMSC%20427.pdf#page=31">frame</a>
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
 * functions from math <a href="https://dens.website/tutorials/webgl/gl-matrix">libraries</a> are just a convenience, indeed:</p>
 * <pre>
 *    var viewMatrix = new Matrix4().setLookAt(<span style="color:red">1.77, 3.54, 3.06,</span> 0, 0, 0, 0, 1, 0);
 *            or
 *                                        eye           look at    view up
 *                                                      (center)
 *    viewMatrix = mat4.lookAt([], [<span style="color:red">1.77, 3.54, 3.06</span>], [0, 0, 0], [0, 1, 0]);
 * </pre>
 * @type {Matrix4}
 * @see <a href="/compgraf1/downloads/apostila.pdf#page=109">View matrix</a>
 * @see <a href="/cg/downloads/PDFs/06_LCG_Transformacoes.pdf">Mudança de Base</a>
 * @see <a href="https://en.wikipedia.org/wiki/Change_of_basis">Change of Basis</a>
 * @see <a href="/cwdc/10-html5css3/hw2/doc-hw2">node</a>
 * @see https://learn.microsoft.com/en-us/windows/win32/direct3d9/view-transform
 * @see <img src="../projection.png" width="256"> <img src="../projection2.png" width="256">
 */
var viewMatrix = new Matrix4()
    .translate(0, 0, -5)
    .rotate(45, 1, 0, 0)
    .rotate(-30, 0, 1, 0);

/**
 * Alternatively use the LookAt function, specifying the view (eye) point,
 * a point at which to look, and a direction for "up".
 * Approximate view point for above is (1.77, 3.54, 3.06)
 * @type {Matrix4}
 */
/*
var view = new Matrix4().setLookAt(
    1.77, 3.54, 3.06,   // eye
    0, 0, 0,            // at - looking at the origin
    0, 1, 0);           // up vector - y axis
*/

/**
 * For projection we can use an orthographic projection, specifying
 * the clipping volume explicitly.
 * @type {Matrix4}
 */
//var projection = new Matrix4().setOrtho(-1.5, 1.5, -1, 1, 4, 6);

/**
 * Or, use a perspective projection specified with a
 * field of view, an aspect ratio, and distance to near and far
 * clipping planes.
 * Here use aspect ratio 3/2 corresponding to canvas size 600 x 400
 * @type {Matrix4}
 */
var projection = new Matrix4().setPerspective(30, 1.5, 0.1, 1000);

/**
 * Or, here is the same perspective projection, using the Frustum function
 * a 30 degree field of view with near plane at 4 corresponds
 * view plane height of  4 * tan(15) = 1.07
 * @type {Matrix4}
 */
// var projection = new Matrix4().setFrustum(-1.5 * 1.07, 1.5 * 1.07, -1.07, 1.07, 4, 6);

/**
 * An object containing raw data for
 * vertices, normal vectors, texture coordinates, and indices.
 * @typedef {Object<{vertices: Float32Array,
 *                   normals: Float32Array,
 *                   texCoords: Float32Array,
 *                   indices: Uint16Array}>} modelData
 */

window.addEventListener("load", (event) => mainEntrance());

/**
 * Given an instance of
 * <ul>
 * <li><a href="/cwdc/13-webgl/lib/three.js">THREE.BufferGeometry</a></li>
 * </ul>
 * returns an object containing raw data for
 * vertices, indices, texture coordinates, and normal vectors.
 * @param {THREE.BufferGeometry} geom THREE.BoxGeometry,<br>
 *                                    THREE.ConeGeometry,<br>
 *                                    THREE.CylinderGeometry,<br>
 *                                    THREE.PlaneGeometry,<br>
 *                                    THREE.SphereGeometry,<br>
 *                                    THREE.TorusGeometry,<br>
 *                                    THREE.TorusKnotGeometry.
 * @return {modelData}
 * @see <a href="https://threejs.org/docs/#api/en/core/BufferGeometry">BufferGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/BoxGeometry">BoxGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/ConeGeometry">ConeGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/CylinderGeometry">CylinderGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/PlaneGeometry">PlaneGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/SphereGeometry">SphereGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/TorusGeometry">TorusGeometry</a>
 * @see <a href="https://threejs.org/docs/#api/en/geometries/TorusKnotGeometry">TorusKnotGeometry</a>
 */
function getModelData(geom) {
    return {
        vertices: geom.getAttribute("position").array,
        normals: geom.getAttribute("normal").array,
        texCoords: geom.getAttribute("uv").array,
        indices: geom.index.array,
    };
}

/**
 * <p>Creates data for vertices, colors, and normal vectors for
 * a unit cube. </p>
 * Return value is an object with three attributes:
 * vertices, colors, and normals, each referring to a Float32Array.<br>
 * (Note this is a "self-invoking" anonymous function.)
 * @return {Object<{numVertices: Number,
 *                  vertices: Float32Array,
 *                  colors: Float32Array,
 *                  normals: Float32Array}>}
 * @see https://threejs.org/docs/#api/en/core/BufferGeometry
 */
function makeCube() {
    // vertices of cube
    var rawVertices = new Float32Array([
        -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
        -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    ]);

    // prettier-ignore
    var rawColors = new Float32Array([
      1.0, 0.0, 0.0, 1.0,  // red
      0.0, 1.0, 0.0, 1.0,  // green
      0.0, 0.0, 1.0, 1.0,  // blue
      1.0, 1.0, 0.0, 1.0,  // yellow
      1.0, 0.0, 1.0, 1.0,  // magenta
      0.0, 1.0, 1.0, 1.0,  // cyan
    ]);

    var rawNormals = new Float32Array([
        0, 0, 1, 1, 0, 0, 0, 0, -1, -1, 0, 0, 0, 1, 0, 0, -1, 0,
    ]);

    // prettier-ignore
    var indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,  // +z face
      1, 5, 6, 1, 6, 2,  // +x face
      5, 4, 7, 5, 7, 6,  // -z face
      4, 0, 3, 4, 3, 7,  // -x face
      3, 2, 6, 3, 6, 7,  // +y face
      4, 5, 1, 4, 1, 0   // -y face
    ]);

    var verticesArray = [];
    var colorsArray = [];
    var normalsArray = [];
    for (var i = 0; i < 36; ++i) {
        // for each of the 36 vertices...
        var face = Math.floor(i / 6);
        var index = indices[i];

        // (x, y, z): three numbers for each point
        for (var j = 0; j < 3; ++j) {
            verticesArray.push(rawVertices[3 * index + j]);
        }

        // (r, g, b, a): four numbers for each point
        for (var j = 0; j < 4; ++j) {
            colorsArray.push(rawColors[4 * face + j]);
        }

        // three numbers for each point
        for (var j = 0; j < 3; ++j) {
            normalsArray.push(rawNormals[3 * face + j]);
        }
    }

    return {
        numVertices: 36,
        vertices: new Float32Array(verticesArray),
        colors: new Float32Array(colorsArray),
        normals: new Float32Array(normalsArray),
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
    var n = new Matrix4(view).multiply(model);
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
 * @see https://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
    if (event.which == null) {
        return String.fromCharCode(event.keyCode); // IE
    } else if (event.which != 0 && event.charCode != 0) {
        return String.fromCharCode(event.which); // the rest
    } else {
        return null; // special key
    }
}

/**
 * Handler for key press events for choosing
 * which axis to rotate around.
 * @param {KeyboardEvent} event key pressed.
 */
function handleKeyPress(event) {
    var ch = getChar(event);
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
        case "s":
            // sphere with more faces
            mscale = 1;
            document.getElementById("models").value = "5";
            theModel = createModel(
                getModelData(new THREE.SphereGeometry(1, 48, 24))
            );
            break;
        case "T":
            // torus knot
            mscale = 1;
            document.getElementById("models").value = "8";
            theModel = createModel(
                getModelData(new THREE.TorusKnotGeometry(0.6, 0.24, 128, 16))
            );
            break;
        case "p":
            // teapot
            mscale = 0.8;
            document.getElementById("models").value = "6";
            theModel = createModel(
                getModelData(
                    new TeapotGeometry(1, 10, true, true, true, true, true)
                ),
                null
            );
            break;
        default:
            return;
    }
    if (selector.paused) draw();
}

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
        5: "s", // sphere
        6: "p", // teapot
        8: "T", // knot
    };
    handleKeyPress(createEvent(key[val]));
}

window.selectModel = selectModel;

/**
 * <p>Code to actually render our geometry.</p>
 * Draw {@link drawAxes axes}, {@link drawSurface surface}, and {@link drawLines lines}.
 */
function draw() {
    // clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (selector.axes) drawAxes();
    if (selector.texture) drawSurface();
    if (selector.lines) drawLines();
}

/**
 * Returns a new scale model matrix, which applies mscale.
 * @returns {Matrix4} model matrix.
 */
function getModelMatrix() {
    var m = modelMatrix;
    if (mscale != 1) {
        m = new Matrix4(modelMatrix).scale(mscale, mscale, mscale);
    }
    return m;
}

/**
 * <p>Draws the surface. </p>
 * Uses the colorShader.
 */
function drawSurface() {
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

    // "enable" the a_position attribute
    gl.enableVertexAttribArray(positionIndex);
    gl.enableVertexAttribArray(normalIndex);

    // bind buffers for points
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);

    // set uniform in shader for projection * view * model transformation
    var loc = gl.getUniformLocation(lightingShader, "model");
    gl.uniformMatrix4fv(loc, false, getModelMatrix().elements);
    loc = gl.getUniformLocation(lightingShader, "view");
    gl.uniformMatrix4fv(loc, false, viewMatrix.elements);
    loc = gl.getUniformLocation(lightingShader, "projection");
    gl.uniformMatrix4fv(loc, false, projection.elements);
    loc = gl.getUniformLocation(lightingShader, "normalMatrix");
    gl.uniformMatrix3fv(
        loc,
        false,
        makeNormalMatrixElements(modelMatrix, viewMatrix)
    );

    loc = gl.getUniformLocation(lightingShader, "lightPosition");
    gl.uniform4f(loc, 2.0, 4.0, 2.0, 1.0);

    gl.uniform4f(
        gl.getUniformLocation(lightingShader, "diffuseColor"),
        0.0,
        0.8,
        0.8,
        1.0
    );
    gl.drawElements(
        gl.TRIANGLES,
        theModel.indices.length,
        mscale == 0.8 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
        0
    );

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

    // draw axes (not transformed by model transformation)
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
    gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

    // set transformation to projection * view only
    var loc = gl.getUniformLocation(colorShader, "transform");
    var transform = new Matrix4().multiply(projection).multiply(viewMatrix);
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
    var transform = new Matrix4()
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

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.disableVertexAttribArray(positionIndex);
    gl.useProgram(null);
}

/**
 * <p>Sets up all buffers for the given model (shape).</p>
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
 * @see https://en.wikipedia.org/wiki/Platonic_solid
 * @see http://www-groups.mcs.st-andrews.ac.uk/~john/MT4521/Lectures/L25.html
 * @see https://nrich.maths.org/1384
 * @see https://math.stackexchange.com/questions/3571483/euler-characteristic-of-a-polygon-with-a-hole
 */
function createModel(shape, chi = 2) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, shape.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, shape.normals, gl.STATIC_DRAW);

    let nv = shape.vertices.length;
    normal = new Float32Array(6 * nv);
    for (var i = 0, k = 0; i < nv; i += 3, k += 6) {
        for (var j = 0; j < 3; j++) {
            normal[j + k] = shape.vertices[i + j];
            normal[j + k + 3] =
                normal[j + k] + (0.1 / mscale) * shape.normals[i + j];
        }
    }

    // number of faces: ni / 3
    // number of edges: ni
    // number of endpoints: ni * 6
    if (shape.indices) {
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
    obj.innerHTML = "<b>Object:</b>";
    if (chi !== null) {
        let faces = shape.indices
            ? shape.indices.length / 3
            : shape.vertices.length / 9;
        let edges = (faces * 3) / 2;
        let vertices = faces / 2 + chi;
        obj.innerHTML = `<b>Object </b>(${faces} triangles, ${edges} edges, ${vertices} vertices):`;
    }

    return shape;
}

/**
 * <p>Entry point when page is loaded.</p>
 * Load all data into the buffers (just once) before proceeding.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
function mainEntrance() {
    // retrieve <canvas> element
    var canvas = document.getElementById("theCanvas");

    // key handler
    window.onkeypress = handleKeyPress;

    // get the rendering context for WebGL
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    // load and compile the shader pair, using utility from the teal book
    var vshaderSource =
        document.getElementById("vertexColorShader").textContent;
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
var animate = (() => {
    // increase the rotation by some amount, depending on the axis chosen
    var increment = 0.5;
    /** @type {Number} */
    var requestID = 0;
    const axes = {
        x: [1, 0, 0],
        y: [0, 1, 0],
        z: [0, 0, 1],
    };

    /**
     * Callback to keep drawing frames.
     * @callback loop
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