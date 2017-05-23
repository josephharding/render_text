
var getVertexShader = function() {
	return `#version 300 es 
	in vec2 a_position; 
	in vec2 a_uv; 
  out vec2 v_uv; 
  uniform vec2 u_resolution;
  void main() {
    
    v_uv = a_uv; 
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = a_position * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
  	gl_Position = vec4(clipSpace, 0, 1);
		//gl_Position = vec4(a_position, 0, 1);
	}`;
}

var getFragmentShader = function() {
	return `#version 300 es	 
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default. It means "medium precision"
	precision mediump float;
  uniform sampler2D u_image;	
  in vec2 v_uv; 
	// we need to declare an output for the fragment shader
	out vec4 outColor;
	 
	void main() {
		// Just set the output to a constant redish-purple
		outColor = texture(u_image, v_uv);
		//outColor = vec4(1, 0, 0, 1);
	}`;
}

function createShader(type, source) {
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

function createProgram(vertexShader, fragmentShader) {
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

function initScene(image) {
	var vertexShader = createShader(gl.VERTEX_SHADER, getVertexShader());
	var fragmentShader = createShader(gl.FRAGMENT_SHADER, getFragmentShader());
  program = createProgram(vertexShader, fragmentShader);
  
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  uvAttributeLocation = gl.getAttribLocation(program, "a_uv");

  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution"); 
  imageUniformLocation = gl.getUniformLocation(program, "u_image"); 

  // VAO1
  /*
  var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	// UV BUFFER
  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	var uvs = [
  	0, 0,
		1, 0,
		1, 1,
		1, 1,
		0, 1,
		0, 0,
	]; 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	// UV BUFFER
	
	// POSITION BUFFER
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);	
	var positions = [
  	0, 0,
		.5, 0,
		.5, .5,
		.5, .5,
		0, .5,
		0, 0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	// POSITION BUFFER

	// HANDLE TEXTURE
  var texture = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);	
	gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); 
  gl.generateMipmap(gl.TEXTURE_2D);
	// HANDLE TEXTURE

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Clear the canvas
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(program); 
 
  gl.bindVertexArray(vao);
  
	gl.uniform1i(imageUniformLocation, 0);
  gl.uniform2f(resolutionUniformLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

	var count = positions.length / 2;
	gl.drawArrays(gl.TRIANGLES, 0, count);
  */
  // VAO1

  mygrid = new GlyphGrid(gl, image);
  mygrid.updateText(render_str, positionAttributeLocation, uvAttributeLocation);
};

function drawScene() {
  mygrid.updateText(render_str, positionAttributeLocation, uvAttributeLocation);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	// Clear the canvas
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.useProgram(program);	

  gl.uniform1i(imageUniformLocation, 0);
  gl.uniform2f(resolutionUniformLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
  mygrid.draw(gl);
};

function renderTick() {
	setTimeout(function() {
		requestAnimationFrame(renderTick);
	}, 20);
	drawScene();
};

var gl;
var positionAttributeLocation;
var uvAttributeLocation;
var imageUniformLocation;
var resolutionUniformLocation;
var mygrid;
var program;
var render_str = 'abc';

window.onload = function() {
  document.getElementById("str").addEventListener("input", function(e) {
    render_str = e.currentTarget.value;
  });
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  if(!gl) {
    console.log("dern! no webgl2");
  }
  var image = new Image();
  image.src = "abc.png";
  image.addEventListener('load', function (e) {
    initScene(image);
 		renderTick(); 
	});
};
