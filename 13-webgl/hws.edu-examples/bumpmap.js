/**
 * @file
 *
 * Summary.
 * <p>Bump Mapping.</p>
 *
 * <p>A mostly successful attempt to do {@link https://en.wikipedia.org/wiki/Bump_mapping Bump mapping}, in which
 * {@link https://3dgrayscale.com/what-is-a-3d-heightmap/ grayscale height maps}
 * are used to perturb the normals to a surface,
 * making the surface look "bumpy".</p>
 *
 * <p>The implementation requires tangent vectors for the surface.
 * For our version of {@link https://www.youtube.com/watch?v=pCAM0aeOpOs bump mapping},
 * the tangent vector should be
 * coordinated with the texture coordinates for the surface, that is,
 * the tangent vector should point in the direction in which
 * the <i>s</i> coordinate in the texture coordinates is
 * {@link https://math.hws.edu/eck/cs424/downloads/graphicsbook-linked.pdf#page=315 increasing }.</p>
 *
 * <img src="../Normal_Tangent_Space.jpg" width="256">
 * <img src="../bump.png" width="256">
 *
 * <p>In {@link https://computergraphics.stackexchange.com/questions/5498/compute-sphere-tangent-for-normal-mapping spherical coordinates}
 * with the usual longitude x latitude (𝜃, 𝜙) coordinates:</p>
 * <ul>
 *  <li>t = ∂f/∂θ or ∂f/∂u in our {@link uvSphere sphere} implementation,</li>
 *  <li>b = ∂f/∂𝜙 or ∂f/∂v in our {@link uvTorus torus} implementation,</li>
 *  <li> b = n × t. </li>
 * </ul>
 *
 * <p>The base of a {@link uvCylinder cylinder} or {@link uvCone cone} is in fact a plane.
 * Therefore, we use a constant vector perpendicular
 * to its normal, in this case:
 *
 * <ul>
 *  <li> (1, 0, 0) or (-1, 0, 0).</li>
 * </ul>
 *
 * Nevertheless, we'd like to be able set tangent vectors in general,
 * but it took some experimentation to get them
 * pointing in directions that seem to work.</p>
 *
 * <p>The five object models used here have tangent vectors that can be passed
 * as an {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/By_example/Hello_vertex_attributes attribute}
 * to the shader program.</p>
 *
 * @author {@link https://math.hws.edu/eck/ David J. Eck}
 * @author modified by Paulo Roma
 * @since 19/11/2022
 * @see <a href="/cwdc/13-webgl/hws.edu-examples/bumpmap.html">link</a>
 * @see <a href="/cwdc/13-webgl/hws.edu-examples/bumpmap.js">source</a>
 * @see {@link https://math.hws.edu/graphicsbook/source/webgl/bumpmap.html WebGL Bumpmap Demo}
 * @see {@link https://math.hws.edu/eck/cs424/downloads/graphicsbook-linked.pdf#page=314 3D GRAPHICS WITH WEBGL}
 * @see <iframe title="Bump Mapping" style="margin-bottom: -100px; width: 600px; height: 512px; transform-origin: 0px 80px; transform: scale(0.75);" src="/cwdc/13-webgl/hws.edu-examples/bumpmap.html"></iframe>
 */

"use strict";

/**
 * 4x4 Matrix
 * @type {glMatrix.mat4}
 * @name mat4
 * @see {@link https://glmatrix.net/docs/module-mat4.html glMatrix.mat4}
 */
const mat4 = glMatrix.mat4;

/**
 * 3x3 Matrix
 * @type {glMatrix.mat3}
 * @name mat3
 * @see {@link https://glmatrix.net/docs/module-mat3.html glMatrix.mat3}
 */
const mat3 = glMatrix.mat3;

/**
 * An object containing {@link https://en.wikipedia.org/wiki/Vertex_buffer_object VBOs}
 * (vertex buffer objects) for upolading vertex
 * coordinates, normals, tangents, texture coordinates, indices and a render function.
 * @typedef {Object} model
 * @property {WebGLBuffer} model.coordsBuffer - coordinate buffer.
 * @property {WebGLBuffer} model.normalBuffer - normal buffer.
 * @property {WebGLBuffer} model.tangentBuffer - tangent buffer.
 * @property {WebGLBuffer} model.texCoordsBuffer - texture buffer.
 * @property {WebGLBuffer} model.indexBuffer - index buffer.
 * @property {Number} model.count - number of indices.
 * @property {render} model.render - render function.
 */

/**
 * The webgl context.
 * @type {WebGLRenderingContext}
 */
let gl;

/**
 * Canvas on which gl draws.
 * @type {CanvasRenderingContext2D}
 */
let canvas;

/**
 * Vertex coordinates location.
 * @type {GLuint}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation
 */
let a_coords_loc;

/**
 * Vertex normal location.
 * @type {GLuint}
 */
let a_normal_loc;

/**
 * Vertex tangents location.
 * @type {GLuint}
 */
let a_tangent_loc;

/**
 * Vertex texture coordinates location.
 * @type {GLuint}
 */
let a_texCoords_loc;

/**
 * Holds uniform location for model view matrix.
 * @type {WebGLUniformLocation}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getUniformLocation
 */
let u_modelview;

/**
 * Holds uniform location for projection matrix.
 * @type {WebGLUniformLocation}
 */
let u_projection;

/**
 * Holds uniform location for normal matrix.
 * @type {WebGLUniformLocation}
 */
let u_normalMatrix;

/**
 * Holds uniform location for front material.
 * @type {WebGLUniformLocation}
 */
let u_material;

/**
 * Holds uniform location for light properties.
 * @type {WebGLUniformLocation}
 */
let u_lights;

/**
 * An image texture.
 * @type {WebGLUniformLocation}
 */
let u_texture;

/**
 * Tells whether to use texture for diffuseColor.
 * @type {WebGLUniformLocation}
 */
let u_useTexture;

/**
 * A bumpmap texture (grayscale).
 * @type {WebGLUniformLocation}
 */
let u_bumpmap;

/**
 * An array giving bumpmap texture size.
 * @type {WebGLUniformLocation}
 */
let u_bumpmapSize;

/**
 * A value telling how strong the bump effect is (can be negative).
 * @type {WebGLUniformLocation}
 */
let u_bumpmapStrength;

/**
 * Projection matrix.
 * @type {mat4}
 */
const projection = mat4.create();

/**
 * Modelview matrix; value comes from rotator.
 * @type {mat3}
 */
let modelview;

/**
 * Matrix, derived from modelview matrix, for transforming normal vectors.
 * @type {mat3}
 */
const normalMatrix = mat3.create();

/**
 * A TrackballRotator to implement rotation by mouse.
 * @type {TrackballRotator}
 */
let rotator;

/**
 * Array of objects, containing models created using {@link createModel}.
 * Will contain a cube, a cylinder and a torus.
 * @type {Array<model>}
 */
const objects = [];

/**
 * The image texture.
 * @type {WebGLTexture}
 */
let texture;

/**
 * The bumpmap texture.
 * @type {WebGLTexture}
 */
let bumpmap;

let textureLoading = false;
let bumpmapLoading = false;

/**
 * Color array.
 * @type {Array<Array<Number>>}
 */
const colors = [
  [1, 1, 1],
  [1, 0.5, 0.5],
  [1, 1, 0.5],
  [0.5, 1, 0.5],
  [0.5, 0.5, 1],
];

/**
 * Bump map images.
 * @type {Array<String>}
 */
const bumpmapURLs = [
  "textures/dimples-height-map.png",
  "textures/marble-height-map.png",
  "textures/brick-height-map.jpg",
  "textures/metal-height-map.png",
  "textures/random-height-map.png",
  "textures/2D-Bump.png",
];

/**
 * Render the scene.
 */
function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (textureLoading || bumpmapLoading) {
    return;
  }

  let strength = Number(document.getElementById("strength").value);
  gl.uniform1f(u_bumpmapStrength, strength);

  modelview = rotator.getViewMatrix();
  let objectNum = Number(document.getElementById("object").value);
  objects[objectNum].render();
}

/**
 * <p>Create an object representing an IFS model.</p>
 * The modelData holds the data for an IFS using the structure from {@link basic-object-models-with-tangents-IFS.js}.<br>
 * This function creates VBOs to hold the coordinates, normal vectors, tangent vectors, <br>
 * texture coordinates and indices from the IFS. It also loads the data into those buffers.
 *
 * <p>The function creates a new object whose properties are the identifiers of the VBOs.<br>
 * The new object also has a function, {@link render}, that can be called to
 * render the object, using all the data from the buffers.  <br>
 * That object is returned as the value of the function.</p>
 * @param {modelData} modelData model data.
 * @returns {model} created model.
 */
function createModel(modelData) {
  let model = {};
  model.coordsBuffer = gl.createBuffer();
  model.normalBuffer = gl.createBuffer();
  model.tangentBuffer = gl.createBuffer();
  model.texCoordsBuffer = gl.createBuffer();
  model.indexBuffer = gl.createBuffer();
  model.count = modelData.indices.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.tangentBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTangents, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.texCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

  /**
   * <p>This function will render the object.</p>
   * Since the buffer from which we are taking the coordinates and normals
   * change each time an object is drawn, <br>
   * we have to use {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer gl.vertexAttribPointer}
   * to specify the location of the data.
   *
   * <p>To accomplish that, we must first bind the buffer that contains the data. <br>
   * Similarly, we have to bind this object's index buffer before calling gl.drawElements.</p>
   * @callback render
   */
  model.render = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
    gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
    gl.vertexAttribPointer(a_tangent_loc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
    gl.vertexAttribPointer(a_texCoords_loc, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(u_modelview, false, modelview);
    mat3.normalFromMat4(normalMatrix, modelview);
    gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
  };
  return model;
}

/**
 * Loads the bumpmap texture and passes it to the fragment shader.
 */
function loadBumpmap() {
  document.getElementById("message").innerHTML = "LOADING BUMPMAP TEXTURE";
  let bumpmapNum = Number(document.getElementById("bumpmap").value);
  bumpmapLoading = true;
  draw();
  let img = new Image();
  img.onload = function () {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bumpmap);
    try {
      /*
       * (0,0) in the image coordinate system is the top left corner,
       * and the (0,0) in the texture coordinate system is bottom left.
       * Therefore, load the image bytes to the currently bound texture,
       * flipping the vertical.
       */
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.LUMINANCE,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        img,
      );
    } catch (e) {
      document.getElementById("message").innerHTML =
        "SORRY, COULD NOT ACCESS BUMPMAP TEXTURE IMAGE.";
      return;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    bumpmapLoading = false;
    document.getElementById("message").innerHTML =
      "Drag on the object to rotate it.";
    gl.uniform2f(u_bumpmapSize, img.width, img.height);
    draw();
  };
  img.onerror = function () {
    document.getElementById("message").innerHTML =
      "SORRY, COULDN'T LOAD BUMPMAP TEXTURE IMAGE";
  };
  img.src = bumpmapURLs[bumpmapNum];
  document.getElementById("bumpimage").src = bumpmapURLs[bumpmapNum];
}

/**
 * Sets diffuse color in the fragment shader and calls {@link draw}.
 */
function setDiffuse() {
  let colorNum = Number(document.getElementById("color").value);
  gl.uniform1i(u_useTexture, 0);
  gl.uniform3fv(u_material.diffuseColor, colors[colorNum]);
  console.log(colorNum);
  draw();
}

/**
 * <p>Initialize the WebGL context.  </p>
 * Called from {@link init}.
 */
function initGL() {
  // load and compile the shader pair
  var vertexShaderSource = document.getElementById("vertex-shader").textContent;
  var fragmentShaderSource =
    document.getElementById("fragment-shader").textContent;

  let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  gl.useProgram(prog);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  /* Get attribute and uniform locations and create the buffers */

  a_coords_loc = gl.getAttribLocation(prog, "a_coords");
  a_normal_loc = gl.getAttribLocation(prog, "a_normal");
  a_tangent_loc = gl.getAttribLocation(prog, "a_tangent");
  a_texCoords_loc = gl.getAttribLocation(prog, "a_texCoords");
  gl.enableVertexAttribArray(a_normal_loc);
  gl.enableVertexAttribArray(a_tangent_loc);
  gl.enableVertexAttribArray(a_coords_loc);
  gl.enableVertexAttribArray(a_texCoords_loc);
  u_modelview = gl.getUniformLocation(prog, "modelview");
  u_projection = gl.getUniformLocation(prog, "projection");
  u_normalMatrix = gl.getUniformLocation(prog, "normalMatrix");

  u_texture = gl.getUniformLocation(prog, "texture");
  u_useTexture = gl.getUniformLocation(prog, "useTexture");
  u_bumpmap = gl.getUniformLocation(prog, "bumpmap");
  u_bumpmapSize = gl.getUniformLocation(prog, "bumpmapSize");
  u_bumpmapStrength = gl.getUniformLocation(prog, "bumpmapStrength");

  gl.uniform1i(u_useTexture, 0);
  gl.uniform1i(u_texture, 0);
  gl.uniform1i(u_bumpmap, 1);
  texture = gl.createTexture();
  bumpmap = gl.createTexture();

  u_material = {
    diffuseColor: gl.getUniformLocation(prog, "material.diffuseColor"),
    specularColor: gl.getUniformLocation(prog, "material.specularColor"),
    specularExponent: gl.getUniformLocation(prog, "material.specularExponent"),
  };
  u_lights = new Array(3);
  for (let i = 0; i < 3; i++) {
    u_lights[i] = {
      enabled: gl.getUniformLocation(prog, "lights[" + i + "].enabled"),
      position: gl.getUniformLocation(prog, "lights[" + i + "].position"),
      color: gl.getUniformLocation(prog, "lights[" + i + "].color"),
    };
  }

  /* Set up values for material and light uniforms; these values don't change in this program. */

  gl.uniform3f(u_material.diffuseColor, 1, 1, 1);
  gl.uniform3f(u_material.specularColor, 0.2, 0.2, 0.2);
  gl.uniform1f(u_material.specularExponent, 32);
  for (let i = 0; i < 3; i++) {
    gl.uniform1i(u_lights[i].enabled, 0);
  }
  gl.uniform1i(u_lights[0].enabled, 1); // in the end, I decided to use only the viewpoint light
  gl.uniform4f(u_lights[0].position, 0, 0, 1, 0);
  gl.uniform3f(u_lights[0].color, 0.6, 0.6, 0.6);
  gl.uniform4f(u_lights[1].position, -1, -1, 1, 0);
  gl.uniform3f(u_lights[1].color, 0.3, 0.3, 0.3);
  gl.uniform4f(u_lights[2].position, 0, 3, -1, 0);
  gl.uniform3f(u_lights[2].color, 0.3, 0.3, 0.3);

  mat4.perspective(projection, Math.PI / 10, 1, 1, 10);
  gl.uniformMatrix4fv(u_projection, false, projection);

  objects[0] = createModel(uvCone(0.6, 1, 24, 5, false));
  objects[1] = createModel(cube(0.85));
  objects[2] = createModel(uvCylinder());
  objects[3] = createModel(uvTorus(0.65, 0.2, 64, 24));
  objects[4] = createModel(uvSphere(0.65, 64, 24));

  mat4.perspective(projection, Math.PI / 10, 1, 1, 10);
  gl.uniformMatrix4fv(u_projection, false, projection);

  gl.clearColor(250 / 255, 235 / 255, 215 / 255, 1);
}

/**
 * <p>Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program. </p>
 *
 * If an error occurs while compiling or linking the program,
 * an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.
 *
 * <p>If no error occurs, the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.</p>
 * @param {WebGLProgram} gl WebGL context.
 * @param {WebGLShader} vShader vertex shader.
 * @param {WebGLShader} fShader fragment shade.
 */
function createProgram(gl, vShader, fShader) {
  let vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vShader);
  gl.compileShader(vsh);
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
  }
  let fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fShader);
  gl.compileShader(fsh);
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
  }
  let prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
  }
  return prog;
}

/**
 * Initialization function that will be called when the page has loaded.
 */
function init() {
  try {
    canvas = document.getElementById("webglcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
      throw "Browser does not support WebGL";
    }
  } catch (e) {
    document.getElementById("message").innerHTML =
      "<p>Sorry, could not get a WebGL graphics context.</p>";
    return;
  }
  try {
    initGL(); // initialize the WebGL graphics context
  } catch (e) {
    document.getElementById("message").innerHTML =
      "<p>Sorry, could not initialize the WebGL graphics context: " +
      e.message +
      "</p>";
    return;
  }
  document.getElementById("reset").onclick = function () {
    rotator.setView(5, [2, 2, 3]);
    draw();
  };

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
    // mat4.perspective(projection, Math.PI / 10, aspect, 1, 10);
  }

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

  /**
   * <p>Appends an event listener for events whose type attribute value is change.
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed by selecting a value from the
   * {@link loadBumpmap image} &lt;select&gt;'s dropdown with a mouse click.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document.getElementById("bumpmap").onchange = loadBumpmap;
  document.getElementById("bumpmap").value = "5";
  /**
   * <p>Appends an event listener for events whose type attribute value is change.
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed by selecting a value from the
   * {@link draw object} &lt;select&gt;'s dropdown with a mouse click.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document.getElementById("object").onchange = draw;
  document.getElementById("object").value = "3";
  /**
   * <p>Appends an event listener for events whose type attribute value is change.
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed by selecting a value from the
   * {@link setDiffuse color} &lt;select&gt;'s dropdown with a mouse click.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document.getElementById("color").onchange = setDiffuse;
  document.getElementById("color").value = "1";
  /**
   * <p>Appends an event listener for events whose type attribute value is change.
   * The callback argument sets the callback that will be invoked when
   * the event is dispatched.</p>
   *
   * @event change - executed by selecting a value from the
   * {@link draw strength} &lt;select&gt;'s dropdown with a mouse click.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
   */
  document.getElementById("strength").onchange = draw;
  document.getElementById("strength").value = "3";
  rotator = new TrackballRotator(canvas, draw, 5, [2, 2, 3]);
  loadBumpmap();
  setDiffuse();
}

/**
 * <p>Loads the {@link init application}.</p>
 * @param {Event} event an object has loaded.
 * @param {callback} function function to run when the event occurs.
 * @event load
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", (event) => init());
