
Renderer.prototype.program;
Renderer.prototype.imageUniformLocation;
Renderer.prototype.resolutionUniformLocation;
//var positionAttributeLocation;
//var uvAttributeLocation;

Renderer.prototype.getVertexShader = function() {
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
		//_gl_Position = vec4(a_position, 0, 1);
	}`;
}

Renderer.prototype.getFragmentShader = function() {
	return `#version 300 es	 
	precision mediump float;
  uniform sampler2D u_image;	
  in vec2 v_uv; 
	out vec4 outColor;
	void main() {
		outColor = vec4(0.3, 1, 0.3, 1) * texture(u_image, v_uv);
		//outColor = vec4(1, 0, 0, 1);
	}`;
}

Renderer.prototype.createShader = function (type, source) {
  var shader = this._gl.createShader(type);
  this._gl.shaderSource(shader, source);
  this._gl.compileShader(shader);
  var success = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS);
  if (success) {
    return shader;
  } 
  console.log(this._gl.getShaderInfoLog(shader));
  this._gl.deleteShader(shader);
}

Renderer.prototype.createProgram = function(vertexShader, fragmentShader) {
  var program = this._gl.createProgram();
  this._gl.attachShader(program, vertexShader);
  this._gl.attachShader(program, fragmentShader);
  this._gl.linkProgram(program);
  var success = this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(this._gl.getProgramInfoLog(program));
  this._gl.deleteProgram(program);
}

function Renderer() {
  console.log("you made a renderer!");
}

Renderer.prototype.init = function (gl, image) {
  this._gl = gl;	
  
  var vertexShader = this.createShader(this._gl.VERTEX_SHADER, this.getVertexShader());
	var fragmentShader = this.createShader(this._gl.FRAGMENT_SHADER, this.getFragmentShader());
  this.program = this.createProgram(vertexShader, fragmentShader);

  /*
  positionAttributeLocation = this._gl.getAttribLocation(this.program, "a_position");
  uvAttributeLocation = this._gl.getAttribLocation(this.program, "a_uv");
  console.log("positionAttributeLocation:", positionAttributeLocation);
  console.log("uvAttributeLocation:", uvAttributeLocation);
  */
  /*
  this._gl.bindAttribLocation(this.program, 1, "a_position");
  this._gl.bindAttribLocation(this.program, 0, "a_uv"); 
  */ 

  this.resolutionUniformLocation = this._gl.getUniformLocation(this.program, "u_resolution"); 
  this.imageUniformLocation = this._gl.getUniformLocation(this.program, "u_image"); 
};

Renderer.prototype.draw = function (mygrid) {
  this._gl.viewport(0, 0, this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);

	// Clear the canvas
	this._gl.clearColor(0, 0, 0, 0);
	this._gl.clear(this._gl.COLOR_BUFFER_BIT);
	
	this._gl.useProgram(this.program);	

  this._gl.uniform1i(this.imageUniformLocation, 0);
  this._gl.uniform2f(this.resolutionUniformLocation,
    this._gl.drawingBufferWidth, this._gl.drawingBufferHeight);
  
  mygrid.draw(this._gl);
};
