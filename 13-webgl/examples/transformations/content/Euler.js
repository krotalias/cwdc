//
// Demo of Euler angles, similar to Rotations.js.
//

// Test data
  // two triangles, yellow one at z = -1/2 and cyan one at z = 1/2
var vertices = new Float32Array([  
.75, -.75, -0.5, 
0.0, .75, -0.5,
-.75, -.75, -0.5, 
.75, -.75, 0.5, 
0.0, .75, 0.5,
-.75, -.75, 0.5]);

var colors = new Float32Array([
1.0, 1.0, 0.0, 1.0,  // yellow
1.0, 1.0, 0.0, 1.0,
1.0, 1.0, 0.0, 1.0,
0.0, 1.0, 1.0, 1.0,  // cyan
0.0, 1.0, 1.0, 1.0,
0.0, 1.0, 1.0, 1.0]);

var linesVertices = new Float32Array([
-0.8, 0.0, 0.0,
0.8, 0.0, 0.0,
0.0, -0.8, 0.0, 
0.0, 0.8, 0.0, 
0.0, 0.0, -0.8, 
0.0, 0.0, 0.8]);

var linesColors = new Float32Array([
0.0, 0.0, 0.0, 1.0,
0.0, 0.0, 0.0, 1.0, 
0.0, 0.0, 0.0, 1.0, 
0.0, 0.0, 0.0, 1.0, 
0.0, 0.0, 0.0, 1.0,
0.0, 0.0, 0.0, 1.0]);

var axisVertices = new Float32Array([
0.0, 0.0, 0.0,
1.5, 0.0, 0.0,
0.0, 0.0, 0.0, 
0.0, 1.5, 0.0, 
0.0, 0.0, 0.0, 
0.0, 0.0, 1.5]);

var axisColors = new Float32Array([
1.0, 0.0, 0.0, 1.0,
1.0, 0.0, 0.0, 1.0, 
0.0, 1.0, 0.0, 1.0, 
0.0, 1.0, 0.0, 1.0, 
0.0, 0.0, 1.0, 1.0,
0.0, 0.0, 1.0, 1.0]);

// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexColorBuffer;
var linesBuffer;
var linesColorBuffer;
var axisBuffer;
var axisColorBuffer;

// handle to the compiled shader program on the GPU
var shader;

// transformation matrices
var model = new Matrix4();

// view matrix
//inverse of rotate(30, 0, 1, 0) * rotateX(-45) * Translate(0, 0, 5)
var view = new Matrix4().translate(0, 0, -5).rotate(45, 1, 0, 0).rotate(-30, 0, 1, 0);


// projection matrix
var projection = new Matrix4().setOrtho(-1, 1, -1, 1, 4, 6)

// Alternate way to get the same projection matrix:
//var projection = new Matrix4();
//projection.setTranslate(0, 0, -5).scale(1, 1, -1)

var transformations = "";

// keep track of the angles
var head = 0.0;
var pitch = 0.0;
var roll = 0.0;

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

//handler for key press events will update modelMatrix based
//on key press and radio button state
function handleKeyPress(event)
{
	var m = new Matrix4();
	var ch = getChar(event);
	var text = "I";
	switch(ch)
	{
	case 'x':
		pitch += 15;
		if (pitch >= 360) pitch = 0;
		break;
	case 'y':
		head += 15;
		if (head >= 360) head = 0;
		break;
	case 'z':
		roll += 15;
		if (roll >= 360) roll = 0;
		break;
	case 'X':
		pitch -= 15;
		if (pitch <= -360) pitch = 0;
		break;
	case 'Y':
		head -= 15;
		if (head <= -360) head = 0;
		break;
	case 'Z':
		roll -= 15;
		if (roll <= -360) roll = 0;
		break;
	case 'o':
		pitch = head = roll = 0.0;
		break;
		default:
			return;
	}
	
	  // update output window
	  var outputWindow = document.getElementById("displayMatrices");
	  outputWindow.innerHTML = "RotateY(" + head + ") * RotateX(" + pitch + ") * RotateZ(" + roll + ")";
	  console.log(transformations);

	  model = model.setRotate(head, 0, 1, 0).rotate(pitch, 1, 0, 0).rotate(roll, 0, 0, 1);
}



// code to actually render our geometry
function draw()
{
  // clear the framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

  // bind the shader
  gl.useProgram(shader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  var colorIndex = gl.getAttribLocation(shader, 'a_Color');
  if (colorIndex < 0) {
	    console.log('Failed to get the storage location of a_');
	    return;
	  }
 
  // "enable" the a_position attribute 
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);
 
  // bind buffers for points 
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  //gl.bindBuffer(gl.ARRAY_BUFFER, null);  <-----

  // set uniform in shader for projection * view * model transformation
  var transformLoc = gl.getUniformLocation(shader, "transform");
  var transform = new Matrix4().multiply(projection).multiply(view).multiply(model);
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);
  
  // draw triangles
  gl.drawArrays(gl.TRIANGLES, 0, 6);  

  // bind buffers for lines
  gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0); 
  
  // draw lines (using same transformation)
  gl.drawArrays(gl.LINES, 0, 6);

  
  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  //gl.bindBuffer(gl.ARRAY_BUFFER, null);  <-----
  
  // set transformation to projection * view only
  transform = new Matrix4().multiply(projection).multiply(view);
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);  
  
  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
  gl.useProgram(null);

}

// entry point when page is loaded
function main() {
  
  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is 
  // redrawn	
	
  // retrieve <canvas> element
  var canvas = document.getElementById('theCanvas');

  // key handler
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
  
  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // another buffer for the lines
  linesBuffer = gl.createBuffer();
  if (!linesBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, linesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, linesVertices, gl.STATIC_DRAW);

  // axes
  axisBuffer = gl.createBuffer();
  if (!axisBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);
  
  
  
  
  // buffer for vertex colors
  vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  // another buffer for the line color
  linesColorBuffer = gl.createBuffer();
  if (!linesColorBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, linesColors, gl.STATIC_DRAW);
  
  // buffer for axis colors
  axisColorBuffer = gl.createBuffer();
  if (!axisColorBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisColors, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  
  gl.enable(gl.DEPTH_TEST);
  
//	transform.setIdentity();
//	transform.multiply(projection).multiply(view).multiply(model);

  
  // define an animation loop
  var animate = function() {
	draw();
	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate, canvas); 
  };
  
  // start drawing!
  animate();

  
}
