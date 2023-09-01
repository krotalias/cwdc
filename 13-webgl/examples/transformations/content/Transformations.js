//
// First demo of using a transformation matrix in the vertex shader.  The
// matrix is passed to the shader as a uniform variable in the form of
// a 16-element float array in column-major order.  In this example we
// just try out some matrices hard-coded in the main() function.  There
// is also a uniform for color, used in the fragment shader so we can
// draw the axes a different color.
//

// A little right triangle in the first quadrant as a test figure
var numPoints = 3;
var vertices = new Float32Array([
0.0, 0.0,
0.3, 0.0,
0.3, 0.2, 
]
);

// draw some axes too
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
var modelMatrixElements;

// hard code the identity matrix, since we'll need it multiple times
var identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);


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
  gl.uniformMatrix4fv(transformLoc, false, identity);
  
  // draw line segments for axes
  gl.drawArrays(gl.LINES, 0, numAxisPoints);

  // bind buffer for points (using the same shader)
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
  
  // set data for position attribute
  gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
  
  // unbind
  //gl.bindBuffer(gl.ARRAY_BUFFER, null);  <----

  // set color in fragment shader to red
  gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0);
  
  // set transformation to our current model matrix
  gl.uniformMatrix4fv(transformLoc, false, modelMatrixElements);
  
  // draw triangle
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
  
  // load our vertex position data onto the GPU (uses the currently bound buffer)
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
  
  // load our axis data onto the GPU (uses the currently bound buffer)
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);
  
  // now that the buffer is filled with data, we can unbind it
  // (we still have the handle, so we can bind it again when needed)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  
  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.0, 0.8, 0.8, 1.0);
  
  // initialize a "transformation matrix" as a 16-element float array
  // in column-major order
  
  // example: scale by 3 in the y-direction
//  var m = new Float32Array(16);
//  m[0] = 1; m[4] = 0;  m[8] = 0; m[12] = 0;
//  m[1] = 0; m[5] = 3;  m[9] = 0; m[13] = 0;
//  m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
//  m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
//  
  
  // example: 90 degree counterclockwise rotation
  var m = new Float32Array(16);
  m[0] = 0; m[4] = -1; m[8] = 0; m[12] = 0;
  m[1] = 1; m[5] = 0;  m[9] = 0; m[13] = 0;
  m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
  m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;

  // example: translate .2 to the right and .3 up
//  var m = new Float32Array(16);
//  m[0] = 1; m[4] = 0;  m[8] = 0; m[12] = .2;
//  m[1] = 0; m[5] = 1;  m[9] = 0; m[13] = .3;
//  m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
//  m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;

  // set the global variable used in the draw() function
  modelMatrixElements = m; //identity;
  
  // define an animation loop
  var animate = function() {
	draw();
	
	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate, canvas); 
  };
  
  // start drawing!
  animate();

  
}
