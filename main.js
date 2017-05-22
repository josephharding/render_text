
var getVertexShader = function() {
	return `#version 300 es 
	in vec2 a_position; 
  uniform vec2 u_resolution;
  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = a_position * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
  	gl_Position = vec4(clipSpace, 0, 1);
	}`;
}

var getFragmentShader = function() {
	return `#version 300 es	 
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default. It means "medium precision"
	precision mediump float;
	 
	// we need to declare an output for the fragment shader
	out vec4 outColor;
	 
	void main() {
		// Just set the output to a constant redish-purple
		outColor = vec4(1, 0, 1, 1);
	}`;
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

window.onload = function() {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
	var vertexShader = createShader(gl, gl.VERTEX_SHADER, getVertexShader());
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, getFragmentShader());
  var program = createProgram(gl, vertexShader, fragmentShader);
  
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"); 

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	
	var positions = [
  	0, 0,
		1, 0,
		1, 1,
		1, 1,
		0, 1,
		0, 0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	gl.enableVertexAttribArray(positionAttributeLocation);

	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

	console.log("gl.drawingBufferWidth:", gl.drawingBufferWidth);
	console.log("gl.drawingBufferHeight:", gl.drawingBufferHeight);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Clear the canvas
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(program);
  
  gl.uniform2f(resolutionUniformLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.bindVertexArray(vao);

	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = positions.length / size;
	gl.drawArrays(primitiveType, offset, count);
};
