/**
 * @file
 *
 * <p>Basic example of loading an image as a texture and
 * {@link https://www.cs.utexas.edu/users/fussell/courses/cs354/lectures/lecture5.pdf mapping}
 * it onto a surface. </p>
 *
 * Edit the coordinates of the {@link vertices} or edit the {@link texCoords texture coordinates}
 * to experiment. {@link imageFilename Image filename} can also be chaged directly in the code.
 *
 * <p>For security reasons the browser restricts access to the local
 * filesystem.</p>
 *
 * <p>To run the example, open a command shell in any directory above your examples
 * and your teal book utilities, and run:</p>
 *
 * <ul>
 *  <li>python -m SimpleHttpServer 2222</li>
 *
 * <li>then point your browser to http://localhost:2222</li>
 * and navigate to the example you want to run.
 *
 * <li>or just use vscode {@link https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer live server}.
 * </ul>
 *
 * For alternatives see:
 * <ol>
 *  <li>{@link https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server How do you set up a local testing server?}</li>
 *  <li>{@link https://krotalias.github.io/cwdc/downloads/cederj/AD1_2021-2.pdf#page=10 Criando o Seu Próprio Servidor HTTP}</li>
 * </ol>
 * @author {@link https://stevekautz.com/cs336f22/cs336f22_archived.html Steve Kautz}
 * @author modified by {@link https://krotalias.github.io Paulo Roma}
 * @since 26/09/2016
 * @see <a href="/cwdc/13-webgl/examples/texture/content/Texture.html">link</a>
 * @see <a href="/cwdc/13-webgl/examples/texture/content/Texture.js">source</a>
 * @see <iframe width="390" height="390" src="/cwdc/13-webgl/examples/texture/content/Texture.html"></iframe>
 */

/**
 * Image directory.
 * @type {String}
 */
const imageDir = "../../images/";

/**
 * Image file names.
 * @type {Array<String>}
 */
const imageFilename = [
  imageDir + "check64border.png",
  imageDir + "check64.png",
  imageDir + "clover.jpg",
  imageDir + "brick.png",
  imageDir + "steve.png",
];

/**
 * <p>Raw data for some point positions - this will be a square or a trapezoid,
 * consisting of two triangles. </p>
 *
 * We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).
 */
const vertices = {
  square: new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
  ]),

  trapezoid: new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.25, 0.5, -0.5, -0.5, 0.25, 0.5, -0.25, 0.5,
  ]),
};

/**
 * Number of vertices.
 * @type {Number}
 */
const numPoints = vertices.square.length / 2;

/**
 * <p>A straightforward way to choose texture coordinates.</p>
 * The goal is <a href="https://research.ncl.ac.uk/game/mastersdegree/graphicsforgames/texturemapping/Tutorial 3 - Texture Mapping.pdf">realizing</a>
 * what happens when texture coordinates, outside the [0,1] range, wrap around.
 * <p>OpenGL texture coordiates may be arbitrary values.
 * They will however be clamped, or repeated/wrapped into the
 * range [0,1] depending on the texture coordinate wrap or clamp settings.</p>
 * @type {Object<String,Float32Array>}
 */
const texCoords = {
  default: new Float32Array([
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ]),

  // demonstrates wrapping behavior
  wrapping1: new Float32Array([
    0.0, 0.0, 2.0, 0.0, 2.0, 2.0, 0.0, 0.0, 2.0, 2.0, 0.0, 2.0,
  ]),

  // demonstrates wrapping behavior
  wrapping2: new Float32Array([
    0.5, 0.5, 1.5, 0.5, 1.5, 1.5, 0.5, 0.5, 1.5, 1.5, 0.5, 1.5,
  ]),

  // slightly wacky
  wrapping3: new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.5, 1.0,
  ]),

  // slightly wacky
  wrapping4: new Float32Array([
    0.0, 0.0, 1.0, 0.0, 1.25, 1.0, 0.0, 0.0, 1.25, 1.0, -0.25, 1.0,
  ]),
};

// A few global variables...

/**
 * The OpenGL context.
 *  @type {WebGLRenderingContext}
 */
let gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let vertexbuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
let texCoordBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLShader}
 */
let shader;

/**
 * Handle to the texture object on the GPU.
 * @type {WebGLTexture}
 */
let textureHandle;

/**
 * Translate keydown events to strings.
 * @see {@link https://javascript.info/tutorial/keyboard-events Keyboard: keydown and keyup}
 * @param {KeyboardEvent} event key pressed.
 * @returns {String} character pressed.
 */
function getChar(event) {
  event = event || window.event;
  const charCode = event.key || String.fromCharCode(event.which);
  return charCode;
}

/**
 * <p>Handler for key press events.</p>
 * Changes {@link https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html texture coordinates} and sets
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter texture parameters}.
 * @param {KeyboardEvent} event key pressed.
 */
function handleKeyPress(event) {
  const ch = getChar(event);

  switch (ch) {
    case "1":
      gl.bindTexture(gl.TEXTURE_2D, textureHandle);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      break;
    case "2":
      gl.bindTexture(gl.TEXTURE_2D, textureHandle);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      break;
    case "3":
      gl.bindTexture(gl.TEXTURE_2D, textureHandle);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      break;
    case "s":
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices.square, gl.STATIC_DRAW);
      break;
    case "t":
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices.trapezoid, gl.STATIC_DRAW);
      break;
    case "d":
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords.default, gl.STATIC_DRAW);
      break;
    case "v":
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords.wrapping1, gl.STATIC_DRAW);
      break;
    case "V":
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords.wrapping2, gl.STATIC_DRAW);
      break;
    case "w":
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords.wrapping3, gl.STATIC_DRAW);
      break;
    case "W":
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords.wrapping4, gl.STATIC_DRAW);
      break;

    default:
      return;
  }
}

/**
 * Code to actually render our geometry.
 */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // bind the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  const positionIndex = gl.getAttribLocation(shader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.
  // Don't worry about the last three args just yet.)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // bind the texture coordinate buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  const texCoordIndex = gl.getAttribLocation(shader, "a_TexCoord");
  if (texCoordIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(texCoordIndex);

  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer.
  // Don't worry about the last three args just yet.)
  gl.vertexAttribPointer(texCoordIndex, 2, gl.FLOAT, false, 0, 0);

  // we can unbind the buffer now (not really necessary when there is only one buffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // need to choose a texture unit, then bind the texture to TEXTURE_2D for that unit
  const textureUnit = 3;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, textureHandle);

  gl.activeTexture(gl.TEXTURE0);

  const loc = gl.getUniformLocation(shader, "sampler");

  // sampler value in shader is set to index for texture unit
  gl.uniform1i(loc, textureUnit);

  // draw, specifying the type of primitive to assemble from the vertices
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  // gl.drawArrays(gl.LINE_LOOP, 0, numPoints);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);
}

/**
 * <p>Entry point when page is loaded.</p>
 * Wait for image to load before {@link startForReal proceeding}.
 */
function mainEntrance() {
  const image = new Image();
  image.onload = function () {
    startForReal(image);
  };

  // starts loading the image asynchronously
  image.src = imageFilename[0];
}

/**
 * Basically this function does setup that "should" only have to be done once,<br>
 * while {@link draw draw()} does things that have to be repeated
 * each time the canvas is redrawn.
 * @param {HTMLImageElement} image texture as an image.
 */
function startForReal(image) {
  /**
   * @summary Keydown {@link handleKeyPress handler} callback.
   *
   * <p>The keydown and keyup events provide a code indicating which key is pressed,
   * while keypress (deprecated) indicates which character was entered.
   * For example, a lowercase "a" will be reported as 65 by keydown and keyup,
   * but as 97 by keypress. An uppercase "A" is reported as 65 by all events.</p>
   * @event keydown
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
   */
  window.onkeydown = handleKeyPress;

  // retrieve <canvas> element
  const canvas = document.getElementById("theCanvas");

  // get the rendering context for WebGL
  gl = canvas.getContext("webgl");
  //gl = getWebGLContext(canvas, {"antialias": false});
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // query the GPU for the number of available texture units
  console.log(
    "Texture units: " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
  );

  // load and compile the shader pair, using utility from the teal book
  const vshaderSource = document.getElementById("vertexShader").textContent;
  const fshaderSource = document.getElementById("fragmentShader").textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  /*
   * Retain a handle to the shader program, then unbind it.
   * This looks odd, but the way initShaders works is that it "binds" the shader
   * and stores the handle in an extra property of the gl object.
   * That's ok, but will really mess things up when we have
   * more than one shader pair.
   */
  shader = gl.program;
  gl.useProgram(null);

  // request a handle for a chunk of GPU memory
  vertexbuffer = gl.createBuffer();
  if (!vertexbuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices.square, gl.STATIC_DRAW);

  // request a handle for a chunk of GPU memory
  texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords.default, gl.STATIC_DRAW);

  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // texture parameters are stored with the texture
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // default is gl.REPEAT
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  /**
   * Define an animation {@link draw loop}.
   * @function
   * @global
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame Window: requestAnimationFrame() method}
   */
  const animate = () => {
    draw();

    // request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();
}
