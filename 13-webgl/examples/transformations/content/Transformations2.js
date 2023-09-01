//
// Demo of matrix transformations.  An output area in the html page
// shows the matrices that were multiplied together to get the
// current transformation being applied to the triangle.  The drawing
// and shader code is the same as Transformations.js, what's been
// added are the html controls for selecting the transformation and
// the corresponding event handling code to update the 
// transformation matrix.
//
// Note also that instead of explicitly listing 16 numbers to represent a matrix, 
// this uses the type Matrix4 (and Vector4) from
// the teal book utilities in cuon-matrix.js, for example:
//
//   var m = new Matrix4(); // identity matrix
//   m.setTranslate(0.3, 0.0, 0.0);  // make it into a translation matrix
//   var m2 = new Matrix4();
//   m2.setRotate(90, 0, 0, 1); // rotate 90 degrees in x-y plane
//   m.multiply(m2);  // multiply m on right by m2, i.e., m = m * m2;
//   Float32Array theRealData = m.elements;  // get the underlying float array
//


// Raw data for some point positions - this will be a square, consisting
// of two triangles.  We provide two values per vertex for the x and y coordinates
// (z will be zero by default).
var numPoints = 3;
var vertices = new Float32Array([
0.0, 0.0,
0.3, 0.0,
0.3, 0.2, 
]
);

var numAxisPoints = 4;
var axisVertices = new Float32Array([
-0.9, 0.0, 
0.9, 0.0,
0.0, -0.9,
0.0, 0.9
]);


// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexbuffer;
var axisbuffer;

// handle to the compiled shader program on the GPU
var shader;

// a transformation matrix
var modelMatrix;

// a string showing the transformations
var transformations = "";

// create a matrix that translates to the figure's centroid (geometric center)
function getTranslationToCentroid()
{
	// get the three vertices and multiply by the current transformation matrix
	// to see where they are now
	var v1 = new Vector4([vertices[0], vertices[1], 0.0, 1.0]);
	v1 = modelMatrix.multiplyVector4(v1);
	var v2 = new Vector4([vertices[2], vertices[3], 0.0, 1.0]);
	v2 = modelMatrix.multiplyVector4(v2);
	var v3 = new Vector4([vertices[4], vertices[5], 0.0, 1.0]);
	v3 = modelMatrix.multiplyVector4(v3);

	
	// find centroid of given vertices (average of x's, average of y's)
	var cx = (v1.elements[0] + v2.elements[0] + v3.elements[0]) / 3;
	var cy = (v1.elements[1] + v2.elements[1] + v3.elements[1]) / 3;
	
	// set translational part (last column) of matrix
	var ret = new Matrix4();
	ret.elements[12] = cx;
	ret.elements[13] = cy;
	ret.elements[14] = cy;

	return ret;
}

// translate keypress events to strings
// from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
  if (event.which == null) {
    return String.fromCharCode(event.keyCode) // IE
  } else if (event.which!=0 && event.charCode!=0) {
    return String.fromCharCode(event.which)   // the rest
  } else {
    return null // special key
  }
}

// handler for key press events will update modelMatrix based
// on key press and radio button state
function handleKeyPress(event)
{
	  var ch = getChar(event);
	  
	  // create a new matrix and a text string that represents it
	  var m = new Matrix4();
	  var text = "I";
	  switch (ch)
	  {
	  case "r": 
		  m.setRotate(30, 0, 0, 1); 
		  text = "R";
		  break;
	  case "R": 
		  m.setRotate(-30, 0, 0, 1); 
		  text = "R'";
		  break;
	  case "t": 
		  m.setTranslate(0.3, 0.0, 0.0); 
		  text = "T";
		  break;
	  case "T": 
		  m.setTranslate(-0.3, 0.0, 0.0); 
		  text = "T'";
		  break;
	  case "s": 
		  m.setScale(1, 2, 1); 
		  text = "S";
		  break;
	  case "S": 
		  m.setScale(1, 1/2, 1); 
		  text = "S'";
		  break;
	  case "o": 
		  // reset global transformation matrix
		  modelMatrix = m; 
		  text = "I";
		  break;
	  default:
		  // invalid key
		  return;
	  }
	  
	  // if we're doing a rotate or scale with respect to the centroid,
	  // replace m with A * m * A-inverse, where A is translation to centroid
	  if (document.getElementById("checkCentroid").checked && text !== "I" && text !== "T" && text !=="T'")
	  {
		  var a = getTranslationToCentroid()
		  var aInverse = new Matrix4();
		  aInverse.elements[12] = -a.elements[12];
		  aInverse.elements[13] = -a.elements[13];
		  aInverse.elements[14] = -a.elements[14];
		  m = a.multiply(m).multiply(aInverse)
		  text = "A" + text + "A'";
	  }
	  
	  // update text string to display
	  if (text === "I" || transformations === "I")
	  {
		  transformations = text;
	  }
	  else
	  {
		  if (document.getElementById("checkIntrinsic").checked)
		  {
			  // add current text to end of string
			  transformations += text;
			  console.log("Intrinsic");
		  }
		  else
		  {
			  // add to beginning of string
			  transformations = text + transformations;
			  console.log("Extrinsic");
		  }
	  }
	  
	  // update output window
	  var outputWindow = document.getElementById("displayMatrices");
	  outputWindow.innerHTML = transformations;
	  console.log(transformations);

	  // update current matrix
	  if (document.getElementById("checkIntrinsic").checked)
	  {			
		  // multiply on right by m
		  modelMatrix.multiply(m);
	  }
	  else
	  {
		  // multiply on the left by m
		  modelMatrix = m.multiply(modelMatrix);
	  }
}

// code to actually render our geometry
function draw()
{
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT);

  // bind the shader
  gl.useProgram(shader);

  // bind the buffer for the axes
  gl.bindBuffer(gl.ARRAY_BUFFER, axisbuffer);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // "enable" the a_position attribute 
  gl.enableVertexAttribArray(positionIndex);
  
  // associate the data in the currently bound buffer with the a_position attribute
  // (The '2' specifies there are 2 floats per vertex in the buffer)
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // we can unbind the buffer now 
  //gl.bindBuffer(gl.ARRAY_BUFFER, null); <----

  // set uniform in shader for color (axes are black)
  var colorLoc = gl.getUniformLocation(shader, "color");
  gl.uniform4f(colorLoc, 0.0, 0.0, 0.0, 1.0);
  
  // set uniform in shader for transformation ("false" means that
  // the array we're passing is already column-major); for axes
  // use the identity since we don't want them to move
  var transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, new Matrix4().elements);
  
  // draw line segments for axes
  gl.drawArrays(gl.LINES, 0, numAxisPoints);
  
  
  // bind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  
  // associate the data in the currently bound buffer with the a_position attribute
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);

  // we can unbind the buffer now 
  //gl.bindBuffer(gl.ARRAY_BUFFER, null); <-----

  // set uniform in shader for color for the triangle
  var colorLoc = gl.getUniformLocation(shader, "color");
  gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0);
  
  // set uniform in shader for transformation
  var transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, modelMatrix.elements);
  
  // draw, specifying the type of primitive to assemble from the vertices
  gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  
  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.useProgram(null);

}

// entry point when page is loaded
function main() {
  
  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is 
  // redrawn	
	
  // retrieve <canvas> element
  var canvas = document.getElementById('theCanvas');

  window.onkeypress = handleKeyPress;
  
  // get the rendering context for WebGL, using the utility from the teal book
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById('vertexShader').textContent;
  var fshaderSource = document.getElementById('fragmentShader').textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  // retain a handle to the shader program, then unbind it
  // (This looks odd, but the way initShaders works is that it "binds" the shader and
  // stores the handle in an extra property of the gl object.  That's ok, but will really
  // mess things up when we have more than one shader pair.)
  shader = gl.program;
  gl.useProgram(null);
  
  // request a handle for a chunk of GPU memory
  vertexbuffer = gl.createBuffer();
  if (!vertexbuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  
  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // another buffer for the axes
  axisbuffer = gl.createBuffer();
  if (!axisbuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }

  // "bind" the buffer as the current array buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, axisbuffer);
  
  // load our data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);
  
  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  
  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);

  // we could just call draw() once to see the result, but setting up an animation
  // loop to continually update the canvas makes it easier to experiment with the 
  // shaders
  //draw();
  
  // initialize a transformation matrix
  modelMatrix = new Matrix4();
  //var angle = 0;
  
  // define an animation loop
  var animate = function() {
	draw();
	
	
	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate, canvas); 
    //angle += 1;
    //var m = new Matrix4();
    //m.setRotate(1, 0, 0, 1);
     //modelMatrix.setRotate(angle, 0, 0, 1);
    //modelMatrix.multiply(m);
  };
  
  // start drawing!
  animate();

  
}
